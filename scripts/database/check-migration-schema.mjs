import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const schemaPath = path.join(root, 'drizzle/schema.ts');
const migrationRoots = [path.join(root, 'server/database/migrations')];

function collectSqlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSqlFiles(entryPath);
    return entry.name.endsWith('.sql') ? [entryPath] : [];
  });
}

function propertyName(node) {
  return ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : null;
}

function columnName(initializer) {
  let current = initializer;
  while (current) {
    if (ts.isCallExpression(current)) {
      if (ts.isIdentifier(current.expression)) {
        const argument = current.arguments[0];
        if (argument && ts.isStringLiteral(argument)) return argument.text;
        return null;
      }
      current = current.expression;
      continue;
    }
    if (ts.isPropertyAccessExpression(current)) {
      current = current.expression;
      continue;
    }
    return null;
  }
  return null;
}

function schemaTables() {
  const schemaDir = path.join(root, 'drizzle/schema');
  const schemaFiles = [schemaPath];
  if (fs.existsSync(schemaDir)) {
    schemaFiles.push(
      ...fs
        .readdirSync(schemaDir)
        .filter((f) => f.endsWith('.ts'))
        .map((f) => path.join(schemaDir, f))
    );
  }
  const tables = new Map();
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'mysqlTable' &&
      node.arguments.length >= 2 &&
      ts.isStringLiteral(node.arguments[0]) &&
      ts.isObjectLiteralExpression(node.arguments[1])
    ) {
      const columns = new Set();
      for (const property of node.arguments[1].properties) {
        const name = propertyName(property);
        if (name && ts.isPropertyAssignment(property)) {
          const physicalName = columnName(property.initializer);
          if (physicalName) columns.add(physicalName);
        }
      }
      tables.set(node.arguments[0].text, columns);
    }
    ts.forEachChild(node, visit);
  }
  for (const file of schemaFiles) {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );
    visit(source);
  }
  return tables;
}

function referencesFromSql(sql, file) {
  const references = [];
  const add = (table, columns, index) => references.push({ file, table, columns, index });
  for (const match of sql.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+`?[^\s`]+`?\s+ON\s+`?([A-Za-z0-9_]+)`?\s*\(([^)]+)\)/gi)) {
    add(match[1], match[2].split(',').map((column) => column.trim().replaceAll('`', '')), match.index);
  }
  for (const match of sql.matchAll(/ALTER\s+TABLE\s+`?([A-Za-z0-9_]+)`?\s+(?:ADD|MODIFY|CHANGE)\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([A-Za-z0-9_]+)`?/gi)) {
    add(match[1], [match[2]], match.index);
  }
  return references;
}

const tables = schemaTables();
const violations = [];
for (const file of migrationRoots.flatMap(collectSqlFiles)) {
  const relativeFile = path.relative(root, file);
  if (relativeFile === 'server/database/migrations/add_performance_indexes.sql') continue;
  for (const reference of referencesFromSql(fs.readFileSync(file, 'utf8'), relativeFile)) {
    const columns = tables.get(reference.table);
    if (!columns) {
      violations.push({ ...reference, reason: 'table does not exist in drizzle/schema.ts' });
      continue;
    }
    for (const column of reference.columns) {
      if (!columns.has(column)) violations.push({ ...reference, column, reason: 'column does not exist in drizzle/schema.ts' });
    }
  }
}

if (violations.length > 0) {
  console.error(JSON.stringify({ violations }, null, 2));
  process.exit(1);
}
console.log(`Migration schema check passed: ${tables.size} schema tables validated.`);