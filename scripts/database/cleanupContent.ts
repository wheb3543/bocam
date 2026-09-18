import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';

async function cleanupContent() {
  try {
    console.warn('بدء تنظيف المحتوى المكرر في قاعدة البيانات...');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ خطأ: DATABASE_URL غير موجود في متغيرات البيئة');
      process.exit(1);
    }

    const connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection, { schema, mode: 'default' });

    // جلب جميع النصوص
    const allContent = await db.select().from(schema.textContent);
    console.warn(`\n📊 إجمالي عدد النصوص قبل التنظيف: ${allContent.length}`);

    // تحديد المفاتيح القديمة (بدون لغة في النهاية)
    const oldKeys = allContent
      .filter((item) => !item.key.endsWith('.ar') && !item.key.endsWith('.en'))
      .map((item) => item.key);

    console.warn(`\n🗑️  عدد المفاتيح القديمة المكتشفة: ${oldKeys.length}`);

    // حذف المفاتيح القديمة
    let deletedCount = 0;
    for (const key of oldKeys) {
      await db.delete(schema.textContent).where(eq(schema.textContent.key, key));
      deletedCount++;
      console.warn(`   ✅ تم حذف: ${key}`);
    }

    console.warn(`\n✅ تم حذف ${deletedCount} نص قديم`);

    // جلب المحتوى بعد التنظيف
    const newContent = await db.select().from(schema.textContent);
    console.warn(`\n📊 إجمالي عدد النصوص بعد التنظيف: ${newContent.length}`);

    // تجميع حسب القسم
    const bySection: Record<string, number> = {};
    newContent.forEach((item) => {
      const section = item.section || 'unknown';
      bySection[section] = (bySection[section] || 0) + 1;
    });

    console.warn('\n📁 النصوص حسب القسم بعد التنظيف:');
    Object.entries(bySection)
      .sort(([, a], [, b]) => b - a)
      .forEach(([section, count]) => {
        console.warn(`   ${section}: ${count} نص`);
      });

    await connection.end();
    console.warn('\n✅ تم التنظيف بنجاح');
  } catch (error) {
    console.error('❌ خطأ في التنظيف:', error);
    process.exit(1);
  }
}

cleanupContent().then(() => {
  process.exit(0);
});
