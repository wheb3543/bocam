import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';

async function verifyContent() {
  try {
    console.log('بدء التحقق من المحتوى في قاعدة البيانات...');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ خطأ: DATABASE_URL غير موجود في متغيرات البيئة');
      process.exit(1);
    }

    const connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection, { schema, mode: 'default' });

    // جلب جميع النصوص
    const allContent = await db.select().from(schema.textContent);
    console.log(`\n📊 إجمالي عدد النصوص في قاعدة البيانات: ${allContent.length}`);

    // تجميع حسب القسم
    const bySection: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};

    allContent.forEach((item) => {
      const section = item.section || 'unknown';
      const lang = item.language || 'unknown';

      bySection[section] = (bySection[section] || 0) + 1;
      byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    });

    console.log('\n📁 النصوص حسب القسم:');
    Object.entries(bySection)
      .sort(([, a], [, b]) => b - a)
      .forEach(([section, count]) => {
        console.log(`   ${section}: ${count} نص`);
      });

    console.log('\n🌐 النصوص حسب اللغة:');
    Object.entries(byLanguage).forEach(([lang, count]) => {
      console.log(`   ${lang}: ${count} نص`);
    });

    // التحقق من الأقسام المحددة
    const sections = [
      'hero',
      'stats',
      'services',
      'about',
      'cta',
      'accessibility',
      'camps',
      'doctors',
      'offers',
      'privacy',
      'thankyou',
    ];

    console.log('\n🔍 تفاصيل الأقسام المحددة:');
    for (const section of sections) {
      const sectionContent = allContent.filter((item) => item.section === section);
      if (sectionContent.length > 0) {
        console.log(`\n   ${section.toUpperCase()} (${sectionContent.length} نص):`);
        const keys = Array.from(new Set(sectionContent.map((item) => item.key)));
        keys.forEach((key) => {
          const arItem = sectionContent.find((item) => item.key === key && item.language === 'ar');
          const enItem = sectionContent.find((item) => item.key === key && item.language === 'en');
          const status = arItem && enItem ? '✅' : '⚠️';
          console.log(`      ${status} ${key}`);
        });
      }
    }

    await connection.end();
    console.log('\n✅ تم التحقق بنجاح');
  } catch (error) {
    console.error('❌ خطأ في التحقق:', error);
    process.exit(1);
  }
}

verifyContent().then(() => {
  process.exit(0);
});
