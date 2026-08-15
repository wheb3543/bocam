/* global process, console */
/**
 * Simple Migration Runner
 * تشغيل migration بسيط
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const sql = `ALTER TABLE contentAuditLog MODIFY COLUMN entityType ENUM('text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton')`;
    await connection.execute(sql);
    console.log('✅ Migration executed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();
