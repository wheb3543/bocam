#!/bin/bash

# Seed Initial Content Script
# سكريبت لإضافة المحتوى الأولي إلى قاعدة البيانات

echo "بدء إضافة المحتوى الأولي إلى قاعدة البيانات..."

# قراءة DATABASE_URL من ملف .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "خطأ: ملف .env غير موجود"
  exit 1
fi

# استخراج معلومات الاتصال من DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\([^@]*\)@.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# تشغيل ملف SQL
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < drizzle/seed/0001_initial_content.sql

if [ $? -eq 0 ]; then
  echo "✅ تم إضافة المحتوى الأولي بنجاح"
else
  echo "❌ فشل في إضافة المحتوى الأولي"
  exit 1
fi
