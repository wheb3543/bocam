import mysql from 'mysql2/promise';

if (
  !process.env.DB_HOST ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME
) {
  console.error(
    '❌ Missing required DB_HOST, DB_USER, DB_PASSWORD, or DB_NAME environment variables.'
  );
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: true },
});

async function checkData() {
  const connection = await pool.getConnection();

  try {
    console.log('=== آخر 100 محادثة ===');
    const [conversations] = await connection.query(`
      SELECT id, phoneNumber, customerName, lastMessage, lastMessageAt, unreadCount, isArchived, isImportant, createdAt
      FROM whatsapp_conversations
      ORDER BY lastMessageAt DESC
      LIMIT 100
    `);
    console.log(JSON.stringify(conversations, null, 2));

    console.log('\n=== هيكل جدول whatsapp_messages ===');
    const [columns] = await connection.query(`
      DESCRIBE whatsapp_messages
    `);
    console.log(JSON.stringify(columns, null, 2));

    // Check specifically for sentAt column
    const [sentAtCheck] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'whatsapp_messages' 
      AND COLUMN_NAME = 'sentAt'
    `);
    console.log('\n=== فحص حقل sentAt ===');
    if (sentAtCheck.length > 0) {
      console.log('✅ حقل sentAt موجود:');
      console.log(JSON.stringify(sentAtCheck[0], null, 2));
    } else {
      console.log('❌ حقل sentAt غير موجود');
    }

    console.log('\n=== آخر 10 رسائل ===');
    const [messages] = await connection.query(`
      SELECT id, conversationId, direction, content, messageType, status, whatsappMessageId, createdAt, metadata
      FROM whatsapp_messages
      ORDER BY createdAt DESC
      LIMIT 10
    `);
    console.log(JSON.stringify(messages, null, 2));

    console.log('\n=== عدد الرسائل لكل محادثة في آخر 100 محادثة ===');
    const [messageCounts] = await connection.query(`
      SELECT conversationId, COUNT(*) as count
      FROM whatsapp_messages
      WHERE conversationId IN (SELECT id FROM whatsapp_conversations ORDER BY lastMessageAt DESC LIMIT 100)
      GROUP BY conversationId
      ORDER BY count DESC
    `);
    console.log(JSON.stringify(messageCounts, null, 2));

    console.log('\n=== المحادثات التي لديها رسائل ===');
    const [conversationsWithMessages] = await connection.query(`
      SELECT c.id, c.phoneNumber, c.lastMessage, c.lastMessageAt, c.createdAt,
             (SELECT COUNT(*) FROM whatsapp_messages m WHERE m.conversationId = c.id) as messageCount
      FROM whatsapp_conversations c
      WHERE (SELECT COUNT(*) FROM whatsapp_messages m WHERE m.conversationId = c.id) > 0
      ORDER BY c.lastMessageAt DESC
      LIMIT 10
    `);
    console.log(JSON.stringify(conversationsWithMessages, null, 2));

    console.log('\n=== المحادثات بدون رسائل ===');
    const [emptyConversations] = await connection.query(`
      SELECT c.id, c.phoneNumber, c.lastMessage, c.lastMessageAt, c.createdAt,
             (SELECT COUNT(*) FROM whatsapp_messages m WHERE m.conversationId = c.id) as messageCount
      FROM whatsapp_conversations c
      ORDER BY c.lastMessageAt DESC
      LIMIT 100
    `);
    const emptyOnes = emptyConversations.filter((c) => c.messageCount === 0);
    console.log(`عدد المحادثات بدون رسائل: ${emptyOnes.length}`);
    if (emptyOnes.length > 0) {
      console.log(JSON.stringify(emptyOnes, null, 2));
    }

    console.log('\n=== المحادثات المكررة (نفس رقم الهاتف) ===');
    const [duplicateCheck] = await connection.query(`
      SELECT phoneNumber, COUNT(*) as count
      FROM whatsapp_conversations
      GROUP BY phoneNumber
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 20
    `);
    console.log(JSON.stringify(duplicateCheck, null, 2));
  } finally {
    await connection.release();
    await pool.end();
  }
}

checkData().catch(console.error);
