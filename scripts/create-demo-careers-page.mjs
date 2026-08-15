import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
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

async function createDemoCareersPage() {
  let connection;
  try {
    console.log('🔄 الاتصال بقاعدة البيانات...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ تم الاتصال بنجاح');

    // إنشاء الصفحة
    console.log('\n📄 إنشاء صفحة التوظيف...');
    const [pageResult] = await connection.execute(
      'INSERT INTO pages (name, slug, type, titleAr, titleEn, metaTitleAr, metaTitleEn, metaDescriptionAr, metaDescriptionEn, isActive, sortOrder, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['التوظيف', 'careers', 'main', 'التوظيف', 'Careers', 'وظائف - المستشفى السعودي الألماني', 'Careers - Saudi German Hospital', 'انضم إلى فريقنا الطبي المتميز', 'Join our distinguished medical team', 'yes', 1, 'published']
    );
    const pageId = pageResult.insertId;
    console.log('✅ تم إنشاء الصفحة:', pageId);

    // إنشاء الأقسام
    console.log('\n📋 إنشاء الأقسام...');
    const sections = [
      { name: 'hero', type: 'hero', titleAr: 'انضم إلى فريقنا', titleEn: 'Join Our Team', subtitleAr: 'ابحث عن فرصة لمساعدة الآخرين', subtitleEn: 'Find an opportunity to help others', sortOrder: 0 },
      { name: 'benefits', type: 'text-cards', titleAr: 'مميزات العمل معنا', titleEn: 'Benefits of Working With Us', subtitleAr: 'نقدم أفضل بيئة عمل', subtitleEn: 'We offer the best work environment', sortOrder: 1 },
      { name: 'requirements', type: 'features', titleAr: 'المتطلبات', titleEn: 'Requirements', subtitleAr: 'ما نبحث عنه', subtitleEn: 'What we are looking for', sortOrder: 2 },
      { name: 'contact', type: 'contact', titleAr: 'تواصل معنا', titleEn: 'Contact Us', subtitleAr: 'نحن هنا لمساعدتك', subtitleEn: 'We are here to help you', sortOrder: 3 }
    ];

    for (const section of sections) {
      await connection.execute(
        'INSERT INTO sections (pageId, name, type, titleAr, titleEn, subtitleAr, subtitleEn, sortOrder, isActive, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [pageId, section.name, section.type, section.titleAr, section.titleEn, section.subtitleAr, section.subtitleEn, section.sortOrder, 'yes', 'published']
      );
      console.log('✅ تم إنشاء القسم:', section.name);
    }

    // إنشاء المحتوى النصي
    console.log('\n📝 إضافة المحتوى النصي...');
    const textContents = [
      // Hero section
      { section: 'hero', type: 'title', key: 'careers.hero.title', content: 'انضم إلى فريقنا الطبي المتميز', language: 'ar' },
      { section: 'hero', type: 'subtitle', key: 'careers.hero.subtitle', content: 'ابحث عن فرصة لمساعدة الآخرين وبناء مستقبل مهني مشرق', language: 'ar' },
      { section: 'hero', type: 'description', key: 'careers.hero.description', content: 'نحن نبحث عن محترفين ملتزمين لخدمة مرضانا بأعلى معايير الجودة والرعاية', language: 'ar' },
      { section: 'hero', type: 'button', key: 'careers.hero.button', content: 'عرض الوظائف المتاحة', language: 'ar' },
      // Benefits section
      { section: 'benefits', type: 'title', key: 'careers.benefits.title', content: 'مميزات العمل معنا', language: 'ar' },
      { section: 'benefits', type: 'title', key: 'careers.benefits.card1.title', content: 'راتب تنافسي', language: 'ar' },
      { section: 'benefits', type: 'text', key: 'careers.benefits.card1.text', content: 'نقدم رواتب تنافسية تتناسب مع خبرتك ومؤهلاتك', language: 'ar' },
      { section: 'benefits', type: 'title', key: 'careers.benefits.card2.title', content: 'تأمين صحي شامل', language: 'ar' },
      { section: 'benefits', type: 'text', key: 'careers.benefits.card2.text', content: 'تأمين صحي شامل لك ولعائلتك', language: 'ar' },
      { section: 'benefits', type: 'title', key: 'careers.benefits.card3.title', content: 'فرص تدريبية', language: 'ar' },
      { section: 'benefits', type: 'text', key: 'careers.benefits.card3.text', content: 'برامج تدريبية مستمرة لتطوير مهاراتك', language: 'ar' },
      // Requirements section
      { section: 'requirements', type: 'title', key: 'careers.requirements.title', content: 'المتطلبات', language: 'ar' },
      { section: 'requirements', type: 'title', key: 'careers.requirements.feature1.title', content: 'المؤهل العلمي', language: 'ar' },
      { section: 'requirements', type: 'text', key: 'careers.requirements.feature1.text', content: 'درجة البكالوريوس أو أعلى في التخصص الطبي', language: 'ar' },
      { section: 'requirements', type: 'title', key: 'careers.requirements.feature2.title', content: 'الخبرة العملية', language: 'ar' },
      { section: 'requirements', type: 'text', key: 'careers.requirements.feature2.text', content: 'خبرة سنتين على الأقل في المجال الطبي', language: 'ar' },
      { section: 'requirements', type: 'title', key: 'careers.requirements.feature3.title', content: 'الالتزام بالعمل', language: 'ar' },
      { section: 'requirements', type: 'text', key: 'careers.requirements.feature3.text', content: 'القدرة على العمل بنظام المناوبات', language: 'ar' },
      { section: 'requirements', type: 'title', key: 'careers.requirements.feature4.title', content: 'التواصل الجيد', language: 'ar' },
      { section: 'requirements', type: 'text', key: 'careers.requirements.feature4.text', content: 'مهارات تواصل ممتازة مع المرضى والزملاء', language: 'ar' },
      { section: 'requirements', type: 'title', key: 'careers.requirements.feature5.title', content: 'اللغة الإنجليزية', language: 'ar' },
      { section: 'requirements', type: 'text', key: 'careers.requirements.feature5.text', content: 'إجادة اللغة الإنجليزية ميزة إضافية', language: 'ar' },
      { section: 'requirements', type: 'title', key: 'careers.requirements.feature6.title', content: 'العمل الجماعي', language: 'ar' },
      { section: 'requirements', type: 'text', key: 'careers.requirements.feature6.text', content: 'القدرة على العمل ضمن فريق طبي متكامل', language: 'ar' },
      // Contact section
      { section: 'contact', type: 'title', key: 'careers.contact.title', content: 'تواصل معنا', language: 'ar' },
      { section: 'contact', type: 'title', key: 'careers.contact.email.title', content: 'البريد الإلكتروني', language: 'ar' },
      { section: 'contact', type: 'text', key: 'careers.contact.email.text', content: 'careers@saudi-german.com', language: 'ar' },
      { section: 'contact', type: 'title', key: 'careers.contact.phone.title', content: 'رقم الهاتف', language: 'ar' },
      { section: 'contact', type: 'text', key: 'careers.contact.phone.text', content: '+966 11 234 5678', language: 'ar' },
      { section: 'contact', type: 'title', key: 'careers.contact.address.title', content: 'العنوان', language: 'ar' },
      { section: 'contact', type: 'text', key: 'careers.contact.address.text', content: 'الرياض، المملكة العربية السعودية', language: 'ar' }
    ];

    for (const text of textContents) {
      await connection.execute(
        'INSERT INTO textContent (pageId, section, type, `key`, content, language, isActive, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [pageId, text.section, text.type, text.key, text.content, text.language, 'yes', 'published']
      );
      console.log('✅ تم إضافة المحتوى النصي:', text.section, text.key);
    }

    console.log('\n✅ تم إنشاء الصفحة التجريبية بنجاح');
    console.log('📄 رابط الصفحة: /page/careers');
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

createDemoCareersPage();
