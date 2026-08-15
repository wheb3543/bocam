import mysql from 'mysql2/promise';

// Database connection details — read from environment
const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT || '4000', 10);
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error(
    '❌ Missing required DB_HOST, DB_USER, DB_PASSWORD, or DB_NAME environment variables.'
  );
  process.exit(1);
}

async function addSentAtColumn() {
  console.log('🔄 Adding sentAt column to whatsapp_messages table...\n');

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${DB_NAME}' 
      AND TABLE_NAME = 'whatsapp_messages' 
      AND COLUMN_NAME = 'sentAt'
    `);

    if (columns.length > 0) {
      console.log('✅ Column sentAt already exists in whatsapp_messages table');
      await connection.end();
      return;
    }

    console.log('📝 Adding sentAt column...');

    // Add the sentAt column
    await connection.query(`
      ALTER TABLE whatsapp_messages 
      ADD COLUMN sentAt TIMESTAMP NULL 
      COMMENT 'When the message was actually sent to WhatsApp'
      AFTER isAutomated
    `);

    console.log('✅ sentAt column added successfully to whatsapp_messages table');

    // Verify the column was added
    const [newColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${DB_NAME}' 
      AND TABLE_NAME = 'whatsapp_messages' 
      AND COLUMN_NAME = 'sentAt'
    `);

    if (newColumns.length > 0) {
      console.log('\n📊 Column details:');
      console.log(JSON.stringify(newColumns[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Error adding sentAt column:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addSentAtColumn()
  .then(() => {
    console.log('\n🎉 Operation completed successfully!');
  })
  .catch((error) => {
    console.error('\n💥 Operation failed:', error);
    process.exit(1);
  });
