#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const ts = require('typescript');
require('dotenv').config({ quiet: true });

const rawArgs = process.argv.slice(2);
const args = {};
for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  if (a.startsWith('--')) {
    const k = a.slice(2);
    const v = rawArgs[i + 1] && !rawArgs[i + 1].startsWith('--') ? rawArgs[++i] : true;
    args[k] = v;
  } else if (!args._) {
    args._ = [a];
  } else {
    args._.push(a);
  }
}
const db = args.db || (args._ && args._[0]) || process.env.DB || 'bocam_db';
const host = args.host || '127.0.0.1';
const port = args.port || '3306';
const user = args.user || 'root';

function parseSchemaTs(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const tables = {};
  const columnCall = (initializer) => {
    let current = initializer;
    while (current) {
      if (ts.isCallExpression(current)) {
        if (ts.isIdentifier(current.expression)) return current;
        current = current.expression;
      } else if (ts.isPropertyAccessExpression(current)) {
        current = current.expression;
      } else {
        return null;
      }
    }
    return null;
  };
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'mysqlTable' &&
      ts.isStringLiteral(node.arguments[0]) &&
      ts.isObjectLiteralExpression(node.arguments[1])
    ) {
      const cols = {};
      for (const property of node.arguments[1].properties) {
        if (!ts.isPropertyAssignment(property) || !property.name) continue;
        const call = columnCall(property.initializer);
        if (!call || !ts.isIdentifier(call.expression)) continue;
        const fn = call.expression.text;
        const text = property.initializer.getText(sourceFile);
        const argsText = call.arguments.map((argument) => argument.getText(sourceFile)).join(',');
        let expectedType = fn;
        if (fn === 'varchar') expectedType = `varchar(${argsText.match(/length\s*:\s*(\d+)/)?.[1] || '255'})`;
        if (fn === 'boolean') expectedType = 'tinyint(1)';
        if (fn === 'decimal') expectedType = `decimal(${argsText.match(/precision\s*:\s*(\d+).*scale\s*:\s*(\d+)/)?.slice(1).join(',') || ''})`;
        if (fn === 'mysqlEnum') expectedType = 'enum';
        cols[property.name.getText(sourceFile).replace(/["']/g, '')] = {
          expectedType,
          notNull: text.includes('.notNull()') || text.includes('.primaryKey()'),
          raw: text,
        };
      }
      tables[node.arguments[0].text] = cols;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return tables;
}

async function getActualColumns(db, host, port, user, password, uri) {
  const sql = `SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name, COLUMN_TYPE AS column_type, IS_NULLABLE AS is_nullable, COLUMN_DEFAULT AS column_default, EXTRA AS extra FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME, ORDINAL_POSITION;`;
  const connection = await mysql.createConnection(
    uri || { host, port: Number(port), user, password: password || undefined, database: db }
  );
  const [rows] = await connection.query(sql);
  await connection.end();
  const res = {};
  for (const r of rows) {
    const { table_name: table, column_name: col, column_type: colType, is_nullable: isNullable, column_default: colDefault, extra } = r;
    res[table] = res[table] || {};
    res[table][col] = { columnType: colType, isNullable, columnDefault: colDefault, extra };
  }
  return res;
}

function compare(expected, actual) {
  const report = { tables: {} };
  const expectedTables = Object.keys(expected).sort();
  const actualTables = Object.keys(actual || {}).sort();

  const missingTables = expectedTables.filter((t) => !actualTables.includes(t));
  const extraTables = actualTables.filter((t) => !expectedTables.includes(t));
  report.missingTables = missingTables;
  report.extraTables = extraTables;

  for (const t of expectedTables) {
    const expCols = expected[t] || {};
    const actCols = (actual[t] && actual[t]) || {};
    const expNames = Object.keys(expCols);
    const actNames = Object.keys(actCols);
    const missingCols = expNames.filter((c) => !actNames.includes(c));
    const extraCols = actNames.filter((c) => !expNames.includes(c));
    const diffs = [];
    for (const c of expNames.filter((n) => actNames.includes(n))) {
      const e = expCols[c];
      const a = actCols[c];
      // simple type compare: check base type
      const eType = e.expectedType.replace(/\s+/g, '').toLowerCase();
      const aType = a.columnType.replace(/\s+/g, '').toLowerCase();
      let typeMismatch = false;
      if (eType.startsWith('varchar')) {
        if (!aType.startsWith('varchar')) typeMismatch = true;
        else {
          const ev = eType.match(/varchar\((\d+)\)/);
          const av = aType.match(/varchar\((\d+)\)/);
          if (ev && av && ev[1] !== av[1]) typeMismatch = true;
        }
      } else if (eType === 'int') {
        if (!aType.startsWith('int') && !aType.startsWith('bigint') && !aType.startsWith('tinyint'))
          typeMismatch = true;
      } else if (eType === 'text') {
        if (!aType.includes('text')) typeMismatch = true;
      } else if (eType === 'timestamp') {
        if (!aType.includes('timestamp') && !aType.includes('datetime')) typeMismatch = true;
      } else if (eType === 'tinyint(1)' || eType === 'boolean') {
        if (!aType.startsWith('tinyint')) typeMismatch = true;
      } else if (eType.startsWith('decimal')) {
        if (!aType.startsWith('decimal')) typeMismatch = true;
      } else if (eType === 'enum') {
        if (!aType.startsWith('enum')) typeMismatch = true;
      }
      const nullMismatch =
        (e.notNull && a.isNullable === 'YES') || (!e.notNull && a.isNullable === 'NO');
      if (typeMismatch || nullMismatch) {
        diffs.push({ column: c, expected: e, actual: a, typeMismatch, nullMismatch });
      }
    }
    report.tables[t] = { missingCols, extraCols, diffs };
  }
  return report;
}

(async function main() {
  const schemaPath = path.join(__dirname, '..', 'drizzle', 'schema.ts');
  if (!fs.existsSync(schemaPath)) {
    console.error('schema.ts not found at', schemaPath);
    process.exit(1);
  }
  const expected = parseSchemaTs(schemaPath);
  let actual;
  try {
    actual = await getActualColumns(db, host, port, user, args.password, args.url || process.env.DATABASE_URL);
  } catch (err) {
    console.error('Failed to query information_schema:', err.message);
    process.exit(1);
  }
  const report = compare(expected, actual);
  console.log(JSON.stringify(report, null, 2));
})();
