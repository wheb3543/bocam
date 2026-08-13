#!/bin/bash

# Homepage Seed Script Runner
# مشغل سكريبت إضافة بيانات الصفحة الرئيسية

echo "🔄 جاري تشغيل سكريبت إضافة بيانات الصفحة الرئيسية..."
echo "⚠️  تأكد من إعداد متغيرات البيئة التالية:"
echo "   - DB_HOST: عنوان خادم قاعدة البيانات"
echo "   - DB_USER: اسم المستخدم"
echo "   - DB_PASSWORD: كلمة المرور"
echo "   - DB_NAME: اسم قاعدة البيانات"
echo ""

# قراءة متغيرات البيئة من .env إذا كان موجوداً
if [ -f .env ]; then
    echo "📄 تم العثور على ملف .env"
    export $(cat .env | grep -v '^#' | xargs)
fi

# استخراج معلومات الاتصال من DATABASE_URL إذا كان موجوداً
if [ -n "$DATABASE_URL" ]; then
    echo "🔗 استخدام DATABASE_URL من متغيرات البيئة"
    # استخراج المعلومات من DATABASE_URL
    # mysql://user:password@host:port/database
    DB_URL=$(echo $DATABASE_URL | sed -e 's/mysql:\/\///')
    DB_USER=$(echo $DB_URL | cut -d':' -f1)
    DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
    DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
    DB_PORT=$(echo $DB_URL | cut -d':' -f3 | cut -d'/' -f1)
    DB_NAME=$(echo $DB_URL | cut -d'/' -f2)
else
    # استخدام متغيرات منفصلة
    DB_HOST=${DB_HOST:-localhost}
    DB_USER=${DB_USER:-root}
    DB_PASSWORD=${DB_PASSWORD:-}
    DB_NAME=${DB_NAME:-bocam}
    DB_PORT=${DB_PORT:-3306}
fi

echo "📊 معلومات الاتصال:"
echo "   المضيف: $DB_HOST"
echo "   المنفذ: $DB_PORT"
echo "   المستخدم: $DB_USER"
echo "   قاعدة البيانات: $DB_NAME"
echo ""

# تشغيل السكريبت SQL
echo "🔄 جاري تنفيذ السكريبت SQL..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < drizzle/seed_homepage.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ تم إضافة بيانات الصفحة الرئيسية بنجاح"
    echo ""
    echo "🔄 جاري التحقق من البيانات المضافة..."
    
    # التحقق من الصفحة الرئيسية
    echo "📊 الصفحات المضافة:"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT id, name, slug, titleAr, isActive FROM pages WHERE slug = 'home';"
    
    echo ""
    echo "📊 عدد عناصر المحتوى النصي:"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) as count FROM textContent WHERE pageId = (SELECT id FROM pages WHERE slug = 'home');"
    
    echo ""
    echo "📊 عينة من المحتوى النصي المضاف:"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT key, language, section, type, isActive FROM textContent WHERE pageId = (SELECT id FROM pages WHERE slug = 'home') LIMIT 5;"
    
    echo ""
    echo "✅ تم التحقق من البيانات بنجاح"
else
    echo ""
    echo "❌ فشل تنفيذ السكريبت SQL"
    echo "💡 تأكد من:"
    echo "   - صحة معلومات الاتصال بقاعدة البيانات"
    echo "   - أن قاعدة البيانات موجودة"
    echo "   - أن المستخدم لديه الصلاحيات المطلوبة"
    exit 1
fi
