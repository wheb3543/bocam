import { db } from './server/db.ts';

try {
  console.log('🔄 Dropping all tables...');
  
  // Get all table names
  const [tables] = await db.execute(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE()
  `);

  // Drop each table
  for (const table of tables) {
    const tableName = table.TABLE_NAME;
    console.log(`  ❌ Dropping: ${tableName}`);
    await db.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
  }

  console.log('✅ All tables dropped successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
