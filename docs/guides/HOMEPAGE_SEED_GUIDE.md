# دليل إضافة بيانات الصفحة الرئيسية
# Homepage Data Seeding Guide

## نظرة عامة
هذا الدليل يشرح كيفية إضافة بيانات الصفحة الرئيسية إلى قاعدة البيانات باستخدام السكريبت المُعد مسبقاً.

## الملفات المتوفرة

### 1. سكريبت SQL
**الموقع**: `/drizzle/seed_homepage.sql`

هذا الملف يحتوي على جميع أوامر SQL اللازمة لإضافة:
- صفحة الصفحة الرئيسية في جدول `pages`
- +40 عنصر محتوى نصي في جدول `textContent`
- دعم كامل للغتين العربية والإنجليزية

### 2. سكريبت Node.js
**الموقع**: `/scripts/seed-homepage.ts`

سكريبت Node.js لتشغيل السكريبت SQL برمجياً.

**التشغيل**:
```bash
pnpm db:seed:homepage
```

### 3. سكريبت Shell
**الموقع**: `/scripts/run-seed-homepage.sh`

سكريبت shell بديل للتشغيل المباشر باستخدام mysql command line.

**التشغيل**:
```bash
./scripts/run-seed-homepage.sh
```

## طرق التشغيل

### الطريقة 1: استخدام Drizzle Studio (موصى به)

1. تشغيل Drizzle Studio:
```bash
pnpm db:studio
```

2. فتح المتصفح على العنوان المعروض (عادة http://localhost:4983)

3. فتح ملف `seed_homepage.sql` في محرر النصوص

4. نسخ محتوى السكريبت

5. في Drizzle Studio، اختيار "SQL" من القائمة

6. لصق السكريبت وتنفيذه

### الطريقة 2: استخدام MySQL Command Line

إذا كان mysql command line مثبتاً على نظامك:

```bash
mysql -u username -p database_name < drizzle/seed_homepage.sql
```

استبدل:
- `username`: اسم المستخدم لقاعدة البيانات
- `database_name`: اسم قاعدة البيانات
- سيتم طلب كلمة المرور بعد الضغط على Enter

### الطريقة 3: استخدام phpMyAdmin أو أدوات مشابهة

1. تسجيل الدخول إلى phpMyAdmin أو أداة إدارة قاعدة البيانات
2. اختيار قاعدة البيانات المناسبة
3. النقر على علامة التبويب "SQL"
4. نسخ محتوى ملف `seed_homepage.sql`
5. لصقه في حقل SQL
6. النقر على "Go" أو "تنفيذ"

### الطريقة 4: استخدام VS Code مع MySQL Extension

1. تثبيت MySQL extension في VS Code
2. إعداد الاتصال بقاعدة البيانات
3. فتح ملف `seed_homepage.sql`
4. استخدام الأمر "Execute SQL" من extension

## التحقق من البيانات المضافة

بعد تشغيل السكريبت بنجاح، يمكنك التحقق من البيانات:

### التحقق من الصفحة الرئيسية:
```sql
SELECT * FROM pages WHERE slug = 'home';
```

### التحقق من المحتوى النصي:
```sql
SELECT COUNT(*) as count FROM textContent WHERE pageId = (SELECT id FROM pages WHERE slug = 'home');
```

### عرض عينة من المحتوى:
```sql
SELECT key, language, section, type, isActive FROM textContent WHERE pageId = (SELECT id FROM pages WHERE slug = 'home') LIMIT 10;
```

## المحتوى المُضاف

### الصفحة الرئيسية:
- الاسم: الصفحة الرئيسية
- الرابط: home
- العناوين (عربي/إنجليزي)
- بيانات SEO كاملة
- الكلمات المفتاحية

### المحتوى النصي:
- **Hero Section**: العناوين، الوصف، الأزرار
- **Stats Section**: إحصائيات الأطباء، التخصصات، المرضى
- **Services Section**: الخدمات الإلكترونية، حجز الأطباء، العروض، المخيمات
- **About Section**: عن المستشفى، المميزات
- **CTA Section**: دعوة للعمل
- **Accessibility**: سهولة الوصول

## استكشاف الأخطاء

### خطأ: فشل الاتصال بقاعدة البيانات
- تأكد من أن متغيرات البيئة `DATABASE_URL` صحيحة
- تأكد من أن خادم قاعدة البيانات يعمل
- تحقق من صحة اسم المستخدم وكلمة المرور

### خطأ: الجدول غير موجود
- تأكد من تشغيل التهجيرات: `pnpm db:migrate`
- تحقق من أن الجداول `pages` و `textContent` موجودة

### خطأ: تكرار البيانات
- إذا كان السكريبت يُشغل مرة أخرى، قد تحدث أخطاء تكرار
- يمكنك حذف البيانات القديمة أولاً:
```sql
DELETE FROM textContent WHERE pageId = (SELECT id FROM pages WHERE slug = 'home');
DELETE FROM pages WHERE slug = 'home';
```

## الدعم

إذا واجهت أي مشاكل، يرجى:
1. التحقق من سجلات الأخطاء
2. التأكد من إعدادات قاعدة البيانات
3. مراجعة وثائق Drizzle ORM
