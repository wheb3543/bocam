import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import mysql from 'mysql2/promise';

// النصوص المستخدمة في الصفحة الرئيسية حسب الأقسام
const homepageTexts = {
  hero: ['hero.title', 'hero.subtitle', 'hero.description', 'hero.button.text'],
  stats: [
    'stats.doctors.label',
    'stats.specialties.label',
    'stats.patients.label',
    'stats.service.label',
  ],
  services: [
    'services.title',
    'services.description',
    'services.doctors.title',
    'services.doctors.description',
    'services.offers.title',
    'services.offers.description',
    'services.camps.title',
    'services.camps.description',
    'services.explore.button',
  ],
  about: [
    'about.title',
    'about.description',
    'about.features.global.title',
    'about.features.global.description',
    'about.features.comprehensive.title',
    'about.features.comprehensive.description',
    'about.features.specialized.title',
    'about.features.specialized.description',
    'about.additional.text1',
    'about.additional.text2',
    'about.image.caption',
  ],
  cta: ['cta.title', 'cta.description', 'cta.book.button', 'cta.call.button'],
  accessibility: [
    'accessibility.skip.link',
    'accessibility.back.to.top',
    'accessibility.toggle.animations',
    'accessibility.start.animations',
  ],
};

async function verifyHomePage() {
  try {
    console.warn('🔍 بدء التحقق من نصوص الصفحة الرئيسية...\n');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ خطأ: DATABASE_URL غير موجود في متغيرات البيئة');
      process.exit(1);
    }

    const connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection, { schema, mode: 'default' });

    const languages = ['ar', 'en'];
    let totalExpected = 0;
    let totalFound = 0;
    const missingTexts: string[] = [];

    for (const [section, keys] of Object.entries(homepageTexts)) {
      console.warn(`\n📁 قسم ${section.toUpperCase()}:`);
      console.warn(
        `   المتوقع: ${keys.length} نص × ${languages.length} لغة = ${keys.length * languages.length}`
      );

      let sectionFound = 0;

      for (const key of keys) {
        for (const lang of languages) {
          totalExpected++;
          const fullKey = `${key}.${lang}`;

          const content = await db
            .select()
            .from(schema.textContent)
            .where(
              and(eq(schema.textContent.key, fullKey), eq(schema.textContent.section, section))
            );

          if (content.length > 0) {
            sectionFound++;
            totalFound++;
            console.warn(`   ✅ ${fullKey}`);
          } else {
            missingTexts.push(fullKey);
            console.warn(`   ❌ ${fullKey} - مفقود`);
          }
        }
      }

      console.warn(`   الموجود: ${sectionFound}/${keys.length * languages.length}`);
    }

    console.warn('\n' + '='.repeat(50));
    console.warn(`📊 ملخص الصفحة الرئيسية:`);
    console.warn(`   المتوقع: ${totalExpected} نص`);
    console.warn(`   الموجود: ${totalFound} نص`);
    console.warn(`   مفقود: ${totalExpected - totalFound} نص`);

    if (missingTexts.length > 0) {
      console.warn('\n❌ النصوص المفقودة:');
      missingTexts.forEach((text) => console.warn(`   - ${text}`));
    } else {
      console.warn('\n✅ جميع نصوص الصفحة الرئيسية موجودة في قاعدة البيانات');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ خطأ في التحقق:', error);
    process.exit(1);
  }
}

verifyHomePage().then(() => {
  process.exit(0);
});
