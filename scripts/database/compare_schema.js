#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const args = require('minimist')(process.argv.slice(2));
const db = args.db || args._[0] || process.env.DB || 'bocam_db';
const host = args.host || '127.0.0.1';
const port = args.port || '3306';
const user = args.user || 'root';

function parseSchemaTs(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const tables = {};
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/export const\s+(\w+)\s*=\s*mysqlTable\(\s*"([\w_]+)"\s*,\s*\{/);
    if (m) {
      const varName = m[1];
      const tableName = m[2];
      const cols = {};
      i++; // move after opening line
      // collect until matching closing brace at column object level
      for (; i < lines.length; i++) {
        const l = lines[i];
        if (/^\s*}\s*(,|\)|;)/.test(l)) {
          break;
        }
        const colMatch = l.match(/\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\(([^)]*)\)(.*)/);
        if (colMatch) {
          const colVar = colMatch[1];
          const fn = colMatch[2];
          const fnArgs = colMatch[3];
          const rest = colMatch[4] || '';
          // attempt to determine a type string
          let typeStr = fn;
          if (fn === 'varchar') {
            const len =
              fnArgs.match(/\{\s*length\s*:\s*(\d+)\s*\}/) ||
              fnArgs.match(/\s*"?\w+"?\s*,\s*\{\s*length\s*:\s*(\d+)\s*\}/) ||
              fnArgs.match(/(\d+)/);
            const lnum = len ? len[1] : '255';
            typeStr = `varchar(${lnum})`;
          } else if (fn === 'int') {
            typeStr = 'int';
          } else if (fn === 'text') {
            typeStr = 'text';
          } else if (fn === 'timestamp') {
            typeStr = 'timestamp';
          } else if (fn === 'boolean') {
            typeStr = 'tinyint(1)';
          } else if (fn === 'decimal') {
            const prec = fnArgs.match(/\{\s*precision\s*:\s*(\d+)\s*,\s*scale\s*:\s*(\d+)\s*\}/);
            typeStr = prec ? `decimal(${prec[1]},${prec[2]})` : 'decimal';
          } else if (fn === 'mysqlEnum') {
            const vals = fnArgs.replace(/\[|\]|\)|\{|\}/g, '').trim();
            typeStr = 'enum';
          } else {
            typeStr = fn;
          }
          // check for .notNull() or .default
          const notNull = /\.notNull\(\)/.test(rest);
          const defMatch = rest.match(/\.default\(([^)]+)\)/);
          const def = defMatch ? defMatch[1].trim() : null;
          cols[colVar] = { expectedType: typeStr, notNull, default: def, raw: l.trim() };
        }
      }
      tables[tableName] = cols;
    }
  }
  return tables;
}

function getActualColumns(db, host, port, user) {
  const sql = `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${db}' ORDER BY TABLE_NAME, ORDINAL_POSITION;`;
  const cmd = `mysql -h${host} -P${port} -u${user} -N -e "${sql.replace(/"/g, '\\"')}"`;
  const out = execSync(cmd, { encoding: 'utf8' });
  const rows = out
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((r) => r.split('\t'));
  const res = {};
  for (const r of rows) {
    const [table, col, colType, isNullable, colDefault, extra] = r;
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

(function main() {
  const schemaPath = path.join(__dirname, '..', 'drizzle', 'schema.ts');
  if (!fs.existsSync(schemaPath)) {
    console.error('schema.ts not found at', schemaPath);
    process.exit(1);
  }
  const expected = parseSchemaTs(schemaPath);
  let actual;
  try {
    actual = getActualColumns(db, host, port, user);
  } catch (err) {
    console.error('Failed to query information_schema:', err.message);
    process.exit(1);
  }
  const report = compare(expected, actual);
  console.log(JSON.stringify(report, null, 2));
})();
