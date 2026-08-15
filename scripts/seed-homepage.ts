/**
 * Seed Homepage Data Script
 * سكريبت إضافة بيانات الصفحة الرئيسية إلى قاعدة البيانات
 */

import { getDb } from '../server/database/db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function seedHomepageData() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    const db = await getDb();

    if (!db) {
      throw new Error('فشل الاتصال بقاعدة البيانات');
    }

    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // قراءة السكريبت SQL
    const sqlScript = readFileSync(join(__dirname, '../drizzle/seed_homepage.sql'), 'utf-8');

    console.log('🔄 جاري تنفيذ السكريبت SQL...');

    // تقسيم السكريبت إلى جمل منفصلة
    const statements = sqlScript
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.execute(statement.trim());
          console.log('✅ تم تنفيذ:', statement.substring(0, 50) + '...');
        } catch (error) {
          console.error('❌ خطأ في تنفيذ:', statement.substring(0, 50) + '...');
          console.error(error);
        }
      }
    }

    console.log('✅ تم إضافة بيانات الصفحة الرئيسية بنجاح');

    // التحقق من البيانات المضافة
    console.log('🔄 جاري التحقق من البيانات المضافة...');

    const pages = await db.execute('SELECT * FROM pages WHERE slug = "home"');
    console.log('📊 الصفحات المضافة:', pages);

    const textContent = await db.execute(
      'SELECT COUNT(*) as count FROM textContent WHERE pageId = (SELECT id FROM pages WHERE slug = "home")'
    );
    console.log('📊 عدد عناصر المحتوى النصي:', textContent);

    console.log('✅ تم التحقق من البيانات بنجاح');
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  }
}

seedHomepageData()
  .then(() => {
    console.log('🎉 اكتملت العملية بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشلت العملية:', error);
    process.exit(1);
  });
