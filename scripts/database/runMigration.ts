/**
 * Script to run the safe migration for pages and sections
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import mysql from 'mysql2/promise';

async function runMigration() {
  try {
    // Get connection string from environment
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    // Parse connection string
    const url = new URL(connectionString);
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password || undefined,
      database: url.pathname.slice(1),
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'drizzle', '0067_safe_migration.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.warn('🚀 Starting safe migration...');
    console.warn('Migration file:', migrationPath);

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.warn(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await connection.execute(statement);
        console.warn(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
      } catch (error) {
        // Ignore "already exists" errors
        if (error instanceof Error && error.message.includes('already exists')) {
          console.warn(`⏭️  Statement ${i + 1}/${statements.length} skipped (already exists)`);
        } else {
          console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, error);
          throw error;
        }
      }
    }

    await connection.end();
    console.warn('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
