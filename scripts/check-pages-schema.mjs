/**
 * Check Pages Table Schema
 * فحص هيكل جدول الصفحات
 */

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

async function checkSchema() {
  let connection;
  try {
    console.log('🔄 الاتصال بقاعدة البيانات...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ تم الاتصال بنجاح');

    const [rows] = await connection.execute('DESCRIBE pages');
    console.log('\n📋 هيكل جدول pages:');
    console.table(rows);

    const [count] = await connection.execute('SELECT COUNT(*) as count FROM pages');
    console.log(`\n📊 عدد الصفحات الحالية: ${count[0].count}`);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 تم إغلاق الاتصال');
    }
  }
}

checkSchema();
