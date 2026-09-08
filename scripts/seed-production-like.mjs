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

const targetRows = Number(process.env.PHASE_ZERO_TARGET_ROWS || 1000);
const quote = (identifier) => connection.escapeId(identifier);

const targets = [
  { table: 'leads', markerColumn: 'email', marker: 'phase-zero-lead-' },
  { table: 'appointments', markerColumn: 'email', marker: 'phase-zero-appointment-' },
  { table: 'campRegistrations', markerColumn: 'email', marker: 'phase-zero-registration-' },
  { table: 'tasks', markerColumn: 'title', marker: 'Phase zero task ' },
];
const manualReferences = {
  'leads.campaignId': ['campaigns', 'id'],
  'leads.assignedToUserId': ['users', 'id'],
  'appointments.campaignId': ['campaigns', 'id'],
  'appointments.assignedToUserId': ['users', 'id'],
  'campRegistrations.campId': ['camps', 'id'],
  'campRegistrations.campaignId': ['campaigns', 'id'],
  'tasks.projectId': ['projects', 'id'],
  'tasks.teamId': ['teams', 'id'],
  'tasks.campaignId': ['campaigns', 'id'],
  'tasks.assignedTo': ['users', 'id'],
};

function enumValues(columnType) {
  const match = columnType.match(/^enum\((.*)\)$/i);
  if (!match) return [];
  return [...match[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((item) => item[1]);
}

async function getMetadata() {
  const [columns] = await connection.query(
    `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
     FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
     ORDER BY TABLE_NAME, ORDINAL_POSITION`
  );
  const [foreignKeys] = await connection.query(
    `SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`
  );
  return { columns, foreignKeys };
}

async function firstReferencedValue(foreignKey) {
  const [rows] = await connection.query(
    `SELECT ${quote(foreignKey.REFERENCED_COLUMN_NAME)} AS value
     FROM ${quote(foreignKey.REFERENCED_TABLE_NAME)}
     ORDER BY ${quote(foreignKey.REFERENCED_COLUMN_NAME)} LIMIT 1`
  );
  return rows[0]?.value;
}

async function firstManualReferenceValue(table, column) {
  const reference = manualReferences[`${table}.${column}`];
  if (!reference) return undefined;
  const [rows] = await connection.query(
    `SELECT ${quote(reference[1])} AS value FROM ${quote(reference[0])}
     ORDER BY ${quote(reference[1])} LIMIT 1`
  );
  return rows[0]?.value;
}

async function normalizeManualReferences() {
  for (const [key, reference] of Object.entries(manualReferences)) {
    const [table, column] = key.split('.');
    const target = targets.find((item) => item.table === table);
    if (!target) continue;
    const value = await firstManualReferenceValue(table, column);
    if (value === undefined) continue;
    await connection.execute(
      `UPDATE ${quote(table)} SET ${quote(column)} = ? WHERE ${quote(target.markerColumn)} LIKE ?`,
      [value, `${target.marker}%`]
    );
  }
}

function valueFor(column, table, index, enumOptions, foreignKeyValue) {
  if (foreignKeyValue !== undefined) return foreignKeyValue;
  if (enumOptions.length > 0) return enumOptions[index % enumOptions.length];
  const name = column.COLUMN_NAME.toLowerCase();
  const type = column.COLUMN_TYPE.toLowerCase();
  if (name === 'email') return `phase-zero-${table}-${index}@example.test`;
  if (name.includes('phone')) return `700${String(index).padStart(7, '0')}`;
  if (name.includes('date') && type.includes('char')) return '2026-09-08';
  if (name.includes('name') || name.includes('title')) return `Phase zero ${table} ${index}`;
  if (name.includes('slug')) return `phase-zero-${table}-${index}`;
  if (name.includes('url')) return 'https://example.test/phase-zero';
  if (type.match(/int|decimal|numeric|float|double/)) return (index % 10) + 1;
  if (type.match(/timestamp|datetime|date/)) return new Date(Date.now() - index * 60000);
  if (type.includes('bool') || type.startsWith('tinyint(1)')) return index % 2;
  if (type.includes('json')) return '{}';
  const value = `phase-zero-${table}-${index}`;
  return column.CHARACTER_MAXIMUM_LENGTH ? value.slice(0, column.CHARACTER_MAXIMUM_LENGTH) : value;
}

async function countMarked(target) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count FROM ${quote(target.table)} WHERE ${quote(target.markerColumn)} LIKE ?`,
    [`${target.marker}%`]
  );
  return Number(rows[0].count);
}

async function seedTarget(target, columns, foreignKeys) {
  const existing = await countMarked(target);
  const needed = Math.max(0, targetRows - existing);
  if (needed === 0) return { table: target.table, inserted: 0, existing };

  const tableColumns = columns.filter((column) => column.TABLE_NAME === target.table);
  const insertable = tableColumns.filter(
    (column) =>
      !column.EXTRA.includes('auto_increment') &&
      !column.EXTRA.includes('GENERATED') &&
      (column.IS_NULLABLE === 'NO' || column.COLUMN_DEFAULT === null)
  );
  const valuesByColumn = [];
  for (const column of insertable) {
    const foreignKey = foreignKeys.find(
      (key) => key.TABLE_NAME === target.table && key.COLUMN_NAME === column.COLUMN_NAME
    );
    valuesByColumn.push({
      column,
      foreignKeyValue: foreignKey
        ? await firstReferencedValue(foreignKey)
        : await firstManualReferenceValue(target.table, column.COLUMN_NAME),
      enumOptions: enumValues(column.COLUMN_TYPE),
    });
  }

  const columnNames = insertable.map((column) => column.COLUMN_NAME);
  const placeholders = columnNames.map(() => '?').join(', ');
  const statement = `INSERT INTO ${quote(target.table)} (${columnNames.map(quote).join(', ')}) VALUES (${placeholders})`;
  for (let offset = 0; offset < needed; offset += 100) {
    const batchSize = Math.min(100, needed - offset);
    for (let rowIndex = 0; rowIndex < batchSize; rowIndex++) {
      const index = existing + offset + rowIndex;
      const values = valuesByColumn.map(({ column, enumOptions, foreignKeyValue }) =>
        column.COLUMN_NAME === target.markerColumn
          ? `${target.marker}${index}` + (target.markerColumn === 'email' ? '@example.test' : '')
          : valueFor(column, target.table, index, enumOptions, foreignKeyValue)
      );
      await connection.execute(statement, values);
    }
  }
  return { table: target.table, inserted: needed, existing };
}

try {
  const { columns, foreignKeys } = await getMetadata();
  await normalizeManualReferences();
  const results = [];
  for (const target of targets) results.push(await seedTarget(target, columns, foreignKeys));
  console.log(JSON.stringify({ targetRows, results }, null, 2));
} finally {
  await connection.end();
}
