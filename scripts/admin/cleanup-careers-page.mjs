import mysql from 'mysql2/promise';
import 'dotenv/config';

const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bocam',
  ssl: {
    rejectUnauthorized: false,
  },
};

async function cleanupCareersPage() {
  let connection;
  try {
    console.log('🔄 الاتصال بقاعدة البيانات...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ تم الاتصال بنجاح');

    // حذف المحتوى القديم
    console.log('\n🗑️ حذف المحتوى القديم...');
    await connection.execute('DELETE FROM textContent WHERE pageId = 2');
    console.log('✅ تم حذف المحتوى النصي القديم');
    
    await connection.execute('DELETE FROM sections WHERE pageId = 2');
    console.log('✅ تم حذف الأقسام القديمة');
    
    await connection.execute('DELETE FROM pages WHERE id = 2');
    console.log('✅ تم حذف الصفحة القديمة');

    console.log('\n✅ تم التنظيف بنجاح');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 تم إغلاق الاتصال');
    }
  }
}

cleanupCareersPage();
