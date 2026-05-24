const mysql = require('mysql2/promise');

const DATABASE_URL = 'mysql://2xtgvXGdr7mxJSP.root:5iQN6bbdle0K4JiaV41w@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/HgGpRPs4xs9xrzjfX4xmFY';

(async () => {
  const connection = await mysql.createConnection(DATABASE_URL);

  console.log('=== آخر 100 محادثة ===');
  const [conversations] = await connection.query(`
    SELECT id, phoneNumber, customerName, lastMessage, lastMessageAt, unreadCount, isArchived, isImportant, createdAt
    FROM whatsapp_conversations
    ORDER BY lastMessageAt DESC
    LIMIT 100
  `);
  console.log(JSON.stringify(conversations, null, 2));

  console.log('\n=== آخر 100 رسالة ===');
  const [messages] = await connection.query(`
    SELECT id, conversationId, direction, content, messageType, status, whatsappMessageId, sentAt, createdAt, metadata
    FROM whatsapp_messages
    ORDER BY createdAt DESC
    LIMIT 100
  `);
  console.log(JSON.stringify(messages, null, 2));

  console.log('\n=== المحادثات بدون رسائل ===');
  const [emptyConversations] = await connection.query(`
    SELECT c.id, c.phoneNumber, c.lastMessage, c.lastMessageAt, c.createdAt,
           (SELECT COUNT(*) FROM whatsapp_messages m WHERE m.conversationId = c.id) as messageCount
    FROM whatsapp_conversations c
    ORDER BY c.lastMessageAt DESC
    LIMIT 100
  `);
  const emptyOnes = emptyConversations.filter(c => c.messageCount === 0);
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

  await connection.end();
  console.log('\n✅ تم فحص البيانات بنجاح');
})();
