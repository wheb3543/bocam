/**
 * Blog Tables Verification
 * التحقق من إنشاء جداول المدونة في قاعدة البيانات
 *
 * أداة تشخيص ما بعد الترحيل: تتأكد من وجود blogCategories و blogPosts،
 * ومن توسيع قيم entityType في سجل التدقيق ونسخ المحتوى.
 *
 * الاستخدام: node scripts/qa/check-blog-tables.mjs
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

const EXPECTED_ENUM_VALUES = ['blogPost', 'blogCategory'];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bocam',
    ssl: { rejectUnauthorized: false },
  });

  const failures = [];

  try {
    const [tables] = await connection.query("SHOW TABLES LIKE 'blog%'");
    const names = tables.map((row) => Object.values(row)[0]);
    console.log('📦 جداول المدونة:', names.join(', ') || '(لا شيء)');

    for (const table of ['blogCategories', 'blogPosts']) {
      if (!names.includes(table)) {
        failures.push(`الجدول ${table} غير موجود`);
        continue;
      }
      const [columns] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
      console.log(`   ${table}: ${columns.length} عمود`);
    }

    for (const table of ['contentVersions', 'contentAuditLog']) {
      const [columns] = await connection.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'entityType'`);
      const type = columns[0]?.Type ?? '';
      const missing = EXPECTED_ENUM_VALUES.filter((value) => !type.includes(value));
      console.log(`   ${table}.entityType: ${missing.length === 0 ? '✅ موسّع' : '❌ ناقص'}`);
      if (missing.length > 0) {
        failures.push(`${table}.entityType لا يتضمن: ${missing.join(', ')}`);
      }
    }

    const [posts] = await connection.query('SELECT COUNT(*) AS total FROM blogPosts');
    console.log(`   المقالات الحالية: ${posts[0].total}`);
  } finally {
    await connection.end();
  }

  if (failures.length > 0) {
    console.error('\n❌ فشل التحقق:');
    failures.forEach((failure) => console.error(`   - ${failure}`));
    process.exit(1);
  }
  console.log('\n✅ جداول المدونة جاهزة في قاعدة البيانات.');
}

main().catch((error) => {
  console.error('❌ فشل الاتصال:', error instanceof Error ? error.message : error);
  process.exit(1);
});
