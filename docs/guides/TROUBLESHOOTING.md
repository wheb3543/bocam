# دليل استكشاف الأخطاء وإصلاحها | Troubleshooting Guide

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 📋 نظرة عامة

هذا الدليل يساعدك على تشخيص وحل المشاكل الشائعة التي قد تواجهها أثناء استخدام أو تطوير SGH CRM Portal.

---

## 🔍 المشاكل الشائعة

### 1. مشاكل تسجيل الدخول

#### المشكلة: لا يمكنني تسجيل الدخول
**الأسباب المحتملة:**
- بيانات الاعتماد غير صحيحة
- الحساب غير مفعل
- مشكلة في الاتصال بقاعدة البيانات

**الحل:**
```bash
# 1. تحقق من وجود المستخدم
mysql -u root -p
USE sgh_crm;
SELECT * FROM users WHERE username = 'your_username';

# 2. تحقق من تفعيل الحساب
SELECT isActive FROM users WHERE username = 'your_username';
# يجب أن تكون القيمة 'yes'

# 3. إعادة تعيين كلمة المرور
UPDATE users SET password = 'new_hashed_password' WHERE username = 'your_username';
```

#### المشكلة: يتم تسجيل الخروج تلقائياً
**السبب:** انتهاء صلاحية الجلسة

**الحل:**
- تحقق من إعدادات `JWT_EXPIRES_IN` في ملف `.env`
- قم بزيادة قيمة الصلاحية إذا لزم الأمر

---

### 2. مشاكل WhatsApp

#### المشكلة: رسائل WhatsApp لا تُرسل
**الأسباب المحتملة:**
- توكن WhatsApp غير صالح
- رقم الهاتف غير معتمد
- نفاد رصيد WhatsApp

**الحل:**
```bash
# 1. تحقق من صحة التوكن
curl -X GET "https://graph.facebook.com/v17.0/me" \
  -H "Authorization: Bearer YOUR_WHATSAPP_TOKEN"

# 2. تحقق من حالة رقم الهاتف
curl -X GET "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID" \
  -H "Authorization: Bearer YOUR_WHATSAPP_TOKEN"

# 3. تحقق من سجلات الخطأ
tail -f logs/whatsapp.log
```

#### المشكلة: القوالب غير معتمدة
**السبب:** القالب لم يتم اعتماده من Meta

**الحل:**
1. اذهب إلى Meta Business Manager
2. انتقل إلى WhatsApp → Message Templates
3. تحقق من حالة القالب
4. إذا كان مرفوضاً، عدل القالب وأعد إرساله

---

### 3. مشاكل قاعدة البيانات

#### المشكلة: خطأ في الاتصال بقاعدة البيانات
**الأسباب المحتملة:**
- خادم MySQL غير مشغل
- بيانات الاتصال غير صحيحة
- جدار الحماية يمنع الاتصال

**الحل:**
```bash
# 1. تحقق من تشغيل MySQL
sudo systemctl status mysql

# 2. اختبر الاتصال
mysql -h localhost -u sgh_user -p sgh_crm

# 3. تحقق من ملف .env
DATABASE_URL="mysql://user:password@localhost:3306/sgh_crm"

# 4. تحقق من صلاحيات المستخدم
GRANT ALL PRIVILEGES ON sgh_crm.* TO 'sgh_user'@'localhost';
FLUSH PRIVILEGES;
```

#### المشكلة: استعلامات بطيئة
**الحل:**
```sql
-- 1. تحليل الاستعلام
EXPLAIN SELECT * FROM appointments WHERE appointment_date > '2026-01-01';

-- 2. إضافة فهرس
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- 3. تحسين الاستعلام
SELECT id, patient_name, appointment_date 
FROM appointments 
WHERE appointment_date > '2026-01-01'
LIMIT 100;
```

---

### 4. مشاكل الواجهة الأمامية

#### المشكلة: الصفحة لا تُحمّل
**الأسباب المحتملة:**
- خطأ في JavaScript
- مورد غير موجود (404)
- مشكلة في الشبكة

**الحل:**
```bash
# 1. افتح أدوات المطور (F12)
# 2. تحقق من وحدة التحكم (Console) للأخطاء
# 3. تحقق من شبكة (Network) للموارد الفاشلة

# 4. امسح ذاكرة التخزين المؤقت
rm -rf .next/
pnpm build

# 5. تحقق من ملف build
ls -la .next/static/
```

#### المشكلة: النماذج لا تُرسل
**الحل:**
```typescript
// 1. تحقق من validation
console.log(formData);

// 2. تحقق من استجابة الخادم
const response = await fetch('/api/submit', {
  method: 'POST',
  body: JSON.stringify(formData)
});
console.log(await response.json());

// 3. تحقق من CORS
// تأكد من أن الخادم يسمح بـ origin الصحيح
```

---

### 5. مشاكل الأداء

#### المشكلة: التطبيق بطيء
**الحل:**
```bash
# 1. تحقق من استخدام الموارد
top
htop

# 2. تحقق من استعلامات قاعدة البيانات البطيئة
SHOW PROCESSLIST;

# 3. تحقق من حجم الذاكرة المؤقتة
redis-cli INFO memory

# 4. تحسين الاستعلامات
# استخدم EXPLAIN لتحليل الاستعلامات

# 5. زيادة الموارد إذا لزم الأمر
```

---

## 🛠️ أدوات التشخيص

### 1. أدوات مدمجة

```bash
# فحص الصحة
pnpm run health-check

# اختبار الاتصال بقاعدة البيانات
pnpm run test-db

# اختبار اتصال WhatsApp
pnpm run test-whatsapp

# عرض السجلات
pnpm run logs
```

### 2. أدوات خارجية

| الأداة | الاستخدام |
|--------|-----------|
| **MySQL Workbench** | إدارة قاعدة البيانات |
| **Redis Commander** | إدارة Redis |
| **Postman** | اختبار API |
| **Chrome DevTools** | تحليل الواجهة |
| **Lighthouse** | قياس الأداء |

---

## 📊 مراقبة السجلات

### مواقع السجلات

```
logs/
├── app.log           # سجلات التطبيق
├── error.log         # سجلات الأخطاء
├── whatsapp.log      # سجلات WhatsApp
├── access.log        # سجلات الوصول
└── audit.log         # سجلات التدقيق
```

### أوامر مفيدة

```bash
# عرض آخر 100 سطر
tail -100 logs/app.log

# متابعة السجلات في الوقت الفعلي
tail -f logs/app.log

# البحث عن أخطاء
grep "ERROR" logs/app.log

# البحث حسب التاريخ
grep "2026-01-15" logs/app.log
```

---

## 🔄 استعادة النظام

### استعادة قاعدة البيانات

```bash
# 1. إنشاء نسخة احتياطية
mysqldump -u root -p sgh_crm > backup_$(date +%Y%m%d).sql

# 2. استعادة من نسخة احتياطية
mysql -u root -p sgh_crm < backup_20260115.sql

# 3. التحقق من البيانات
mysql -u root -p
USE sgh_crm;
SELECT COUNT(*) FROM users;
```

### استعادة من Git

```bash
# التراجع عن تغييرات محلية
git checkout -- .

# التراجع عن commit
git reset --hard HEAD~1

# استعادة فرع محذوف
git reflog
git checkout branch_name
```

---

## 📞 الحصول على المساعدة

### الموارد الداخلية

- **سجلات التطبيق:** `logs/app.log`
- **سجلات الأخطاء:** `logs/error.log`
- **تقارير الصحة:** `/api/health`

### قنوات الدعم

| القناة | الاستخدام |
|--------|-----------|
| **GitHub Issues** | الإبلاغ عن مشاكل تقنية |
| **البريد الإلكتروني** | support@sghsanaa.net |
| **الهاتف** | 8000018 (داخلي: 123) |

---

<a name="english"></a>

## 📋 Overview

This guide helps you diagnose and fix common issues you may encounter while using or developing SGH CRM Portal.

---

## 🔍 Common Issues

### 1. Login Issues

#### Problem: Cannot log in
**Possible causes:**
- Incorrect credentials
- Account not activated
- Database connection issue

**Solution:**
```bash
# Check user exists
mysql -u root -p
USE sgh_crm;
SELECT * FROM users WHERE username = 'your_username';

# Check account is active
SELECT isActive FROM users WHERE username = 'your_username';
# Should be 'yes'
```

### 2. WhatsApp Issues

#### Problem: WhatsApp messages not sending
**Solution:**
```bash
# Verify token
curl -X GET "https://graph.facebook.com/v17.0/me" \
  -H "Authorization: Bearer YOUR_WHATSAPP_TOKEN"

# Check phone number status
curl -X GET "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID" \
  -H "Authorization: Bearer YOUR_WHATSAPP_TOKEN"
```

### 3. Database Issues

#### Problem: Database connection error
**Solution:**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -h localhost -u sgh_user -p sgh_crm

# Check .env file
DATABASE_URL="mysql://user:password@localhost:3306/sgh_crm"
```

### 4. Frontend Issues

#### Problem: Page not loading
**Solution:**
```bash
# Open DevTools (F12)
# Check Console for errors
# Check Network for failed resources

# Clear build cache
rm -rf .next/
pnpm build
```

---

## 🛠️ Diagnostic Tools

| Tool | Usage |
|------|-------|
| **MySQL Workbench** | Database management |
| **Redis Commander** | Redis management |
| **Postman** | API testing |
| **Chrome DevTools** | Frontend analysis |
| **Lighthouse** | Performance measurement |

---

## 📊 Log Monitoring

### Log Locations

```
logs/
├── app.log           # Application logs
├── error.log         # Error logs
├── whatsapp.log      # WhatsApp logs
├── access.log        # Access logs
└── audit.log         # Audit logs
```

### Useful Commands

```bash
# View last 100 lines
tail -100 logs/app.log

# Follow logs in real-time
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log
```

---

## 📞 Getting Help

### Internal Resources

- **Application Logs:** `logs/app.log`
- **Error Logs:** `logs/error.log`
- **Health Reports:** `/api/health`

### Support Channels

| Channel | Usage |
|---------|-------|
| **GitHub Issues** | Report technical issues |
| **Email** | support@sghsanaa.net |
| **Phone** | 8000018 (ext: 123) |

---

<div align="center">

**نرعاكم كأهالينا - Caring like family**

Made with ❤️ by SGH Team

</div>