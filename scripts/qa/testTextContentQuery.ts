import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';

async function testQuery() {
  try {
    console.warn('🔍 اختبار استعلام النصوص...\n');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ خطأ: DATABASE_URL غير موجود في متغيرات البيئة');
      process.exit(1);
    }

    const connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection, { schema, mode: 'default' });

    // محاكاة استعلام tRPC بدون فلاتر
    console.warn('1️⃣ استعلام بدون فلاتر (كما في tRPC):');
    const result1 = await db
      .select()
      .from(schema.textContent)
      .orderBy(schema.textContent.createdAt);
    console.warn(`   النتيجة: ${result1.length} نص`);

    // استعلام بفلاتر افتراضية (language=all, section=all, type=all, isActive=all)
    console.warn('\n2️⃣ استعلام بفلاتر افتراضية (all = undefined):');
    const result2 = await db
      .select()
      .from(schema.textContent)
      .where(undefined) // هذا ما يحدث عندما تكون جميع الفلاتر 'all'
      .orderBy(schema.textContent.createdAt);
    console.warn(`   النتيجة: ${result2.length} نص`);

    // استعلام بفلتر section='hero'
    console.warn('\n3️⃣ استعلام بفلتر section=hero:');
    const result3 = await db
      .select()
      .from(schema.textContent)
      .where(eq(schema.textContent.section, 'hero'))
      .orderBy(schema.textContent.createdAt);
    console.warn(`   النتيجة: ${result3.length} نص`);
    console.warn('   المفاتيح:');
    result3.forEach((item) => console.warn(`      - ${item.key} (${item.language})`));

    // استعلام بفلتر language='ar'
    console.warn('\n4️⃣ استعلام بفلتر language=ar:');
    const result4 = await db
      .select()
      .from(schema.textContent)
      .where(eq(schema.textContent.language, 'ar'))
      .orderBy(schema.textContent.createdAt);
    console.warn(`   النتيجة: ${result4.length} نص`);

    // استعلام بفلتر type='title'
    console.warn('\n5️⃣ استعلام بفلتر type=title:');
    const result5 = await db
      .select()
      .from(schema.textContent)
      .where(eq(schema.textContent.type, 'title'))
      .orderBy(schema.textContent.createdAt);
    console.warn(`   النتيجة: ${result5.length} نص`);

    await connection.end();
    console.warn('\n✅ تم الاختبار بنجاح');
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    process.exit(1);
  }
}

testQuery().then(() => {
  process.exit(0);
});
