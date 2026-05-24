import mysql from 'mysql2/promise';

// Database connection details
const DB_HOST = 'gateway02.us-east-1.prod.aws.tidbcloud.com';
const DB_PORT = 4000;
const DB_USER = '2xtgvXGdr7mxJSP.root';
const DB_PASSWORD = '5iQN6bbdle0K4JiaV41w';
const DB_NAME = 'HgGpRPs4xs9xrzjfX4xmFY';

async function addSentAtColumn() {
  console.log('🔄 Adding sentAt column to whatsapp_messages table...\n');
  
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: { rejectUnauthorized: false }
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
