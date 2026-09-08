import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connectionUrl = new URL(process.env.DATABASE_URL);
const connection = await mysql.createConnection({
  host: connectionUrl.hostname,
  port: Number(connectionUrl.port || 3306),
  user: connectionUrl.username,
  password: connectionUrl.password,
  database: connectionUrl.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
});

const quote = (identifier) => connection.escapeId(identifier);
const fixtureValue = (column, table, enumValues, foreignKeyValue) => {
  if (foreignKeyValue !== undefined) return foreignKeyValue;
  if (enumValues.length > 0) return enumValues[0];
  const type = column.COLUMN_TYPE.toLowerCase();
  const name = column.COLUMN_NAME.toLowerCase();
  if (type.includes('json')) return '{}';
  if (type.includes('bool') || type.startsWith('tinyint(1)')) return 1;
  if (type.match(/int|decimal|numeric|float|double/)) return 1;
  if (type.match(/timestamp|datetime|date/)) return new Date();
  if (type.match(/blob|binary/)) return Buffer.from('phase-zero-fixture');
  if (name.includes('email')) return `${table}.fixture@example.test`;
  if (name.includes('url')) return 'https://example.test/phase-zero';
  if (name.includes('phone')) return '700000001';
  if (name.includes('slug')) return `phase-zero-${table}`;
  if (name.includes('name') || name.includes('title')) return `Phase zero ${table}`;
  if (name.includes('status')) return enumValues[0] || 'active';
  if (name.includes('id')) return `${table}-${name}-fixture`;
  return 'phase-zero-fixture';
};

function enumValues(columnType) {
  const match = columnType.match(/^enum\((.*)\)$/i);
  if (!match) return [];
  return [...match[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((item) =>
    item[1].replaceAll("\\'", "'")
  );
}

async function metadata() {
  const [tables] = await connection.query('SHOW TABLES');
  const tableNames = tables.map((row) => Object.values(row)[0]);
  const [columns] = await connection.query(
    `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA, ORDINAL_POSITION
     FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME, ORDINAL_POSITION`
  );
  const [foreignKeys] = await connection.query(
    `SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`
  );
  return { tableNames, columns, foreignKeys };
}

async function rowCount(table) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM ${quote(table)}`);
  return Number(rows[0].count);
}

async function main() {
  const { tableNames, columns, foreignKeys } = await metadata();
  const emptyTables = new Set();
  for (const table of tableNames) if ((await rowCount(table)) === 0) emptyTables.add(table);

  const inserted = [];
  const deferred = new Set(emptyTables);
  while (deferred.size > 0) {
    let progress = false;
    for (const table of [...deferred]) {
      const dependencies = foreignKeys
        .filter((key) => key.TABLE_NAME === table && key.REFERENCED_TABLE_NAME !== table)
        .map((key) => key.REFERENCED_TABLE_NAME)
        .filter((parent) => deferred.has(parent));
      if (dependencies.length > 0) continue;

      const tableColumns = columns.filter((column) => column.TABLE_NAME === table);
      const values = [];
      const insertColumns = [];
      for (const column of tableColumns) {
        if (column.EXTRA.includes('auto_increment') || column.EXTRA.includes('GENERATED')) continue;
        if (column.IS_NULLABLE === 'YES' || column.COLUMN_DEFAULT !== null) continue;
        const foreignKey = foreignKeys.find(
          (key) => key.TABLE_NAME === table && key.COLUMN_NAME === column.COLUMN_NAME
        );
        let foreignKeyValue;
        if (foreignKey) {
          const [parentRows] = await connection.query(
            `SELECT ${quote(foreignKey.REFERENCED_COLUMN_NAME)} AS value FROM ${quote(foreignKey.REFERENCED_TABLE_NAME)} ORDER BY ${quote(foreignKey.REFERENCED_COLUMN_NAME)} LIMIT 1`
          );
          foreignKeyValue = parentRows[0]?.value;
          if (foreignKeyValue === undefined) break;
        }
        insertColumns.push(column.COLUMN_NAME);
        values.push(fixtureValue(column, table, enumValues(column.COLUMN_TYPE), foreignKeyValue));
      }
      if (insertColumns.length === 0) {
        await connection.query(`INSERT INTO ${quote(table)} () VALUES ()`);
      } else if (
        insertColumns.length ===
        tableColumns.filter(
          (column) =>
            column.IS_NULLABLE === 'NO' &&
            column.COLUMN_DEFAULT === null &&
            !column.EXTRA.includes('auto_increment') &&
            !column.EXTRA.includes('GENERATED')
        ).length
      ) {
        const placeholders = insertColumns.map(() => '?').join(', ');
        await connection.execute(
          `INSERT INTO ${quote(table)} (${insertColumns.map(quote).join(', ')}) VALUES (${placeholders})`,
          values
        );
      } else {
        continue;
      }
      deferred.delete(table);
      inserted.push(table);
      progress = true;
    }
    if (!progress)
      throw new Error(
        `Unable to seed tables due to unresolved dependencies: ${[...deferred].join(', ')}`
      );
  }

  console.log(JSON.stringify({ seededTables: inserted.length, tables: inserted }, null, 2));
}

try {
  await main();
} finally {
  await connection.end();
}
