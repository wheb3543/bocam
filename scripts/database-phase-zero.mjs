import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const outputDirectory = path.resolve(process.env.PHASE_ZERO_OUTPUT_DIR || 'artifacts/phase-zero');
const iterations = Number(process.env.PHASE_ZERO_ITERATIONS || 30);
const warmupIterations = Number(process.env.PHASE_ZERO_WARMUP || 5);
const references = [
  ['leads', 'campaignId', 'campaigns', 'id'],
  ['leads', 'assignedToUserId', 'users', 'id'],
  ['appointments', 'campaignId', 'campaigns', 'id'],
  ['appointments', 'assignedToUserId', 'users', 'id'],
  ['offerLeads', 'offerId', 'offers', 'id'],
  ['offerLeads', 'campaignId', 'campaigns', 'id'],
  ['campRegistrations', 'campId', 'camps', 'id'],
  ['campRegistrations', 'campaignId', 'campaigns', 'id'],
  ['tasks', 'projectId', 'projects', 'id'],
  ['tasks', 'teamId', 'teams', 'id'],
  ['tasks', 'campaignId', 'campaigns', 'id'],
  ['tasks', 'assignedTo', 'users', 'id'],
  ['patientResults', 'patientId', 'patients', 'id'],
];
const explainQueries = {
  leadsByCampaign: 'SELECT * FROM leads WHERE campaignId = 1 ORDER BY createdAt DESC LIMIT 50',
  appointmentsByCampaign:
    "SELECT * FROM appointments WHERE campaignId = 1 AND status = 'pending' ORDER BY appointmentDate DESC LIMIT 50",
  campRegistrationsByCamp:
    "SELECT * FROM campRegistrations WHERE campId = 1 AND status = 'pending' ORDER BY createdAt DESC LIMIT 50",
  tasksByAssignee:
    "SELECT * FROM tasks WHERE assignedTo = 1 AND status = 'todo' ORDER BY createdAt DESC LIMIT 50",
};

function connectionOptions(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  await fs.mkdir(outputDirectory, { recursive: true });
  const connection = await mysql.createConnection(connectionOptions(process.env.DATABASE_URL));
  try {
    const timestamp = new Date().toISOString().replaceAll(':', '-');
    const backupPath = path.join(outputDirectory, `schema-backup-${timestamp}.sql`);
    const [tables] = await connection.query('SHOW TABLES');
    const backup = [];
    for (const row of tables) {
      const table = Object.values(row)[0];
      const safeTable = connection.escapeId(table);
      const [createRows] = await connection.query(`SHOW CREATE TABLE ${safeTable}`);
      backup.push(`${createRows[0]['Create Table']};`);
      const [rows] = await connection.query(`SELECT * FROM ${safeTable}`);
      if (rows.length) {
        const columns = Object.keys(rows[0])
          .map((column) => connection.escapeId(column))
          .join(', ');
        for (const data of rows)
          backup.push(
            `INSERT INTO ${safeTable} (${columns}) VALUES (${Object.values(data)
              .map((value) => connection.escape(value))
              .join(', ')});`
          );
      }
    }
    await fs.writeFile(backupPath, `${backup.join('\n')}\n`);

    const [columnRows] = await connection.query(
      `SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()`
    );
    const availableColumns = new Set(
      columnRows.map((row) => `${row.TABLE_NAME}.${row.COLUMN_NAME}`)
    );
    const orphanCounts = [];
    for (const [child, childColumn, parent, parentColumn] of references) {
      const result = { child, childColumn, parent, parentColumn };
      if (
        !availableColumns.has(`${child}.${childColumn}`) ||
        !availableColumns.has(`${parent}.${parentColumn}`)
      ) {
        orphanCounts.push({
          ...result,
          status: 'skipped',
          reason: 'table or column is absent in connected staging schema',
        });
        continue;
      }
      const sql = `SELECT COUNT(*) AS orphanCount FROM ${connection.escapeId(child)} child LEFT JOIN ${connection.escapeId(parent)} parent ON child.${connection.escapeId(childColumn)} = parent.${connection.escapeId(parentColumn)} WHERE child.${connection.escapeId(childColumn)} IS NOT NULL AND parent.${connection.escapeId(parentColumn)} IS NULL`;
      const [rows] = await connection.query(sql);
      orphanCounts.push({
        ...result,
        status: 'measured',
        orphanCount: Number(rows[0].orphanCount),
      });
    }
    await fs.writeFile(
      path.join(outputDirectory, 'orphan-counts.json'),
      `${JSON.stringify({ generatedAt: new Date().toISOString(), orphanCounts }, null, 2)}\n`
    );

    const explain = {};
    for (const [name, query] of Object.entries(explainQueries)) {
      const [rows] = await connection.query(`EXPLAIN ${query}`);
      for (let index = 0; index < warmupIterations; index++) await connection.query(query);
      const durations = [];
      let rowCount = 0;
      for (let index = 0; index < iterations; index++) {
        const startedAt = performance.now();
        const [result] = await connection.query(query);
        durations.push(performance.now() - startedAt);
        rowCount = result.length;
      }
      durations.sort((left, right) => left - right);
      const percentile = (rank) =>
        durations[Math.min(durations.length - 1, Math.ceil(rank * durations.length) - 1)];
      explain[name] = {
        query,
        iterations,
        warmupIterations,
        durationMs: Number(durations[durations.length - 1].toFixed(3)),
        p50Ms: Number(percentile(0.5).toFixed(3)),
        p95Ms: Number(percentile(0.95).toFixed(3)),
        p99Ms: Number(percentile(0.99).toFixed(3)),
        rowCount,
        plan: rows,
      };
    }
    await fs.writeFile(
      path.join(outputDirectory, 'explain-baseline.json'),
      `${JSON.stringify({ generatedAt: new Date().toISOString(), explain }, null, 2)}\n`
    );
    console.log(
      JSON.stringify(
        {
          backupPath,
          orphanCounts: orphanCounts.length,
          explainQueries: Object.keys(explain).length,
          iterations,
          warmupIterations,
        },
        null,
        2
      )
    );
  } finally {
    await connection.end();
  }
}
main().catch((error) => {
  console.error(`Phase zero failed: ${error.message}`);
  process.exit(1);
});
