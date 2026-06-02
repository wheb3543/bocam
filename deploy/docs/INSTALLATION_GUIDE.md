# دليل التثبيت - BOCAM CRM Platform

## نظرة عامة

هذا الدليل يشرح كيفية تثبيت وإعداد BOCAM CRM Platform على بيئة الإنتاج أو التطوير.

## المتطلبات الأساسية

### Hardware

- CPU: 2 cores أو أكثر
- RAM: 4GB أو أكثر (موصى 8GB+ للإنتاج)
- Storage: 20GB SSD (موصى 50GB+ للإنتاج)

### Software

- **Node.js:** v18.0.0 أو أحدث
- **MySQL:** 8.0+ أو **TiDB Cloud** (موصى)
- **Git:** لأداة إدارة الكود
- **pnpm:** (مدير الحزم - سيتم تثبيته تلقائياً)
- **OpenSSL:** (لتوليد مفاتيح التشفير - عادة مُثبت مسبقاً)

## خطوات التثبيت

### الطريقة 1: التثبيت الآلي (موصى به)

توجد طريقة أسهل: استخدم السكريبت الآلي للتثبيت:

```bash
# انتقل إلى مجلد المشروع
cd /path/to/BOCAM

# شغّل سكريبت التثبيت
./deploy/scripts/install.sh
```

السكريبت سيقوم بـ:
- ✅ فحص المتطلبات (Node.js, MySQL, Git)
- ✅ تثبيت pnpm إذا لم يكن مُثبت
- ✅ تثبيت الحزم (npm install)
- ✅ إنشاء ملف .env
- ✅ إعداد قاعدة البيانات
- ✅ توليد Hardware ID
- ✅ توليد مفاتيح الترخيص
- ✅ توليد رخصة تجريبية

### الطريقة 2: التثبيت اليدوي

إذا كنت تفضل التثبيت اليدوي، اتبع الخطوات التالية:

#### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd BOCAM
```

#### 2. تثبيت الحزم

```bash
pnpm install
```

#### 3. إعداد ملف البيئة (.env)

```bash
# نسخ ملف المثال
cp .env.example .env

# تحرير ملف .env بالمعلومات المطلوبة
nano .env  # أو محرر النص المفضل لديك
```

**المتغيرات الأساسية المطلوبة:**

```env
# قاعدة البيانات (مطلوب)
DATABASE_URL=mysql://user:password@localhost:3306/bocam_crm

# مفاتيح التشفير (مطلوب)
JWT_SECRET=your-random-secret-key-here-change-this-in-production

# OAuth Server (مطلوب)
OAUTH_SERVER_URL=http://localhost:3000
VITE_OAUTH_PORTAL_URL=http://localhost:3000
VITE_APP_ID=your-oauth-app-id

# سيرفر النبضات (مطلوب)
CENTRAL_ACTIVATION_URL=https://ideahub-op7dfwr6.manus.space/heartbeat

# سيرفر التحقق من التحديثات (مطلوب)
CENTRAL_UPDATE_URL=https://ideahub-op7dfwr6.manus.space/updates/check

# إصدار البروتوكول (مطلوب)
PROTOCOL_VERSION=1.0.0

# معلومات الشركة (موصى)
COMPANY_NAME=Your Hospital Name
COMPANY_ARABIC_NAME=اسم المستشفى
COMPANY_ENGLISH_NAME=Your Hospital
COMPANY_PHONE=+967 1 234 567
COMPANY_EMAIL=info@hospital.com

# WhatsApp Business API (إذا كان مطلوباً)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSWEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# Meta Pixel (إذا كان مطلوباً)
META_PIXEL_ID=your-meta-pixel-id
META_ACCESS_TOKEN=your-meta-access-token
```

#### 4. إعداد قاعدة البيانات

```bash
# تشغيل الترحيلات
pnpm db:push
```

#### 5. توليد مفاتيح الترخيص

```bash
# توليد زوج المفاتيح RSA-2048
pnpm license:generate-keys
```

سيتم إنشاء ملفات:
- `license-keys/public-key.pem` - المفتاح العام
- `license-keys/private-key.pem` - المفتاح الخاص

⚠️ **هام:** احفظ المفتاح الخاص بأمان! لا تشاركه مع أحد.

#### 6. الحصول على Hardware ID

```bash
# استخراج Hardware ID للجهاز
pnpm license:get-hardware-id
```

النتيجة ستكون مثل: `086D41DCC716`

#### 7. طلب الترخيص

أرسل Hardware ID إلى فريق إيديا للحصول على رخصة الإنتاج.

**توليد ترخيص تجريبية (للاختبار فقط):**

```bash
# حساب Unix timestamp لمدة سنة من الآن
node -e "console.log(Math.floor((new Date().getTime() + 365 * 24 * 60 * 60 * 1000) / 1000))"

# توليد ترخيص (استبدل TIMESTAMP بالقيمة المحسوبة)
pnpm license:generate <HARDWARE_ID> <TIMESTAMP> "*"
```

#### 8. تثبيت الترخيص

انسخ ملف الترخيص المُستلم إلى `license.json` في المجلد الرئيسي.

## التشغيل

### وضع التطوير (Development)

```bash
pnpm dev
```

السيرفر سيعمل على:
- http://localhost:3000
- سيتم إعادة التحميل التلقائي للصفحات

### وضع الإنتاج (Production)

```bash
# بناء المشروع
pnpm build

# تشغيل السيرفر
pnpm start
```

## التحقق من التثبيت

### 1. التحقق من تشغيل السيرفر

```bash
pnpm dev
```

يجب أن ترى:
```
🚀 Initializing License System...
✅ License validation successful
💓 Initializing Silent Heartbeat System...
💓 Starting heartbeat scheduler...
🔄 Initializing Update Checker System...
Server running on http://localhost:3000/
```

### 2. التحقق من الواجهة

افتح المتصفح على:
- http://localhost:3000

جرب:
- تسجيل الدخول
- عرض لوحة التحكم
- استخدام الميزات الأساسية

### 3. التحقق من نظام الترخيص

```bash
# قم بتغيير حرف واحد في license.json
# ثم أعد تشغيل السيرفر
pnpm dev
```

يجب أن يفشل السيرفر مع رسالة:
```
🚨 SECURITY ALERT: Invalid digital signature
KILL SWITCH ACTIVATED
```

## استكشاف الأخطاء الشائعة

### خطأ: "License file not found"

**الحل:**
```bash
# تأكد من وجود license.json
ls -la license.json

# إذا لم يكن موجوداً، قم بتوليد ترخيص تجريبي
pnpm license:generate <HARDWARE_ID> <TIMESTAMP> "*"
```

### خطأ: "Public key not found"

**الحل:**
```bash
# تأكد من وجود مجلد license-keys
ls -la license-keys/

# إذا لم يكن موجوداً، توليد المفاتيح
pnpm license:generate-keys
```

### خطأ: "Database connection failed"

**الحل:**
```bash
# تحقق من DATABASE_URL في .env
cat .env | grep DATABASE_URL

# تأكد من تشغيل MySQL/MariaDB
sudo systemctl status mysql  # أو mariaDB

# تأكد من صلاحية الاتصال
mysql -u root -p
```

### خطأ: "Port 3000 is busy"

**الحل:**
```bash
# تحقق مما يستخدم المنفذ 3000
lsof -i :3000

# أو استخدم منفذ آخر
PORT=3001 pnpm dev
```

### خطأ: "Hardware ID mismatch"

**الحل:**
هذا يعني أن الترخيص لا يناسب هذا الجهاز. يجب:
1. الحصول على Hardware ID للجهاز الجديد
2. طلب ترخيص جديدة لل Hardware ID الجديد

## التكوينات المتقدمة

### استخدام قاعدة بيانات سحابية (TiDB Cloud)

في ملف `.env`:

```env
DATABASE_URL=mysql://user:password@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/bo_crm
```

### استخدام Redis للتخزين المؤقت (اختياري)

```bash
pnpm add ioredis
```

### تكوين Nginx (للإنتاج)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## الدعم الفني

إذا واجهت مشكلة لا يمكنك حلها:

1. راجع `docs/TROUBLESHOOTING.md`
2. تحقق من `docs/FAQ.md`
3. اتصل بفريق إيديا
4. تأكد من إرفاق سجلات الأخطاء:
   ```bash
   pnpm dev 2>&1 | tee error.log
   ```

## الأمان

⚠️ **نصائح أمنية مهمة:**

1. ✅ لا تشارك `license-keys/private-key.pem` مع أحد
2. ✅ استخدم كلمات مرور قوية لقاعدة البيانات
3. ✅ لا تضفِ `.env` إلى Git
4. ✅ قم بتغيير `JWT_SECRET` في الإنتاج
5.يمكن استخدام SSL/HTTPS في الإنتاج
6. ✅ حافظ على النظام محدثاً (security updates)

## الخطوات التالية

بعد التثبيت الناجح:

1. 📖 اقرأ `docs/LICENSE_GUIDE.md` لفهم نظام الترخيص
2. 📖 اقرأ `docs/MAINTENANCE_GUIDE.md` للصيانة
3. 🚀 قم بتشغيل السيرفر واختبار جميع الميزات
4. 📊 تأكد من أن نظام Heartbeat يعمل (يرسل كل 24 ساعة)
5. 🔄 تأكد من أن نظام Update Checker يعمل (يتحقق كل 6 ساعات)
6. 🎉 بدأ استخدام النظام في الإنتاج!

---

## نظام السيرفر المركزي

### نظام Heartbeat (النبضات)

النظام يرسل نبضة كل 24 ساعة إلى السيرفر المركزي للمراقبة عن بعد:

**البيانات المرسلة:**
- Hardware ID (معرف الجهاز)
- إصدار الترخيص
- الوقت الحالي (Unix timestamp)
- المنطقة الزمنية
- الميزات المفعلة
- توقيع رقمي SHA-256

**التكوين:**
```env
CENTRAL_ACTIVATION_URL=https://ideahub-op7dfwr6.manus.space/heartbeat
```

**السجلات:**
- `.heartbeat-log` - سجل النبضات (آخر 30 سجل)
- `.last-successful-run` - وقت آخر تشغيل ناجح

### نظام Update Checker (التحقق من التحديثات)

النظام يتحقق من التحديثات عند الإقلاع وكل 6 ساعات:

**البيانات المرسلة:**
- Hardware ID
- إصدار النظام الحالي
- إصدار البروتوكول
- إصدار الترخيص
- الوقت الحالي
- توقيع رقمي SHA-256

**التكوين:**
```env
CENTRAL_UPDATE_URL=https://ideahub-op7dfwr6.manus.space/updates/check
PROTOCOL_VERSION=1.0.0
```

**السجلات:**
- `.update-log` - سجل التحقق من التحديثات (آخر 50 سجل)
- `.update-state` - حالة التحديث المعلق

**التحديثات الإجبارية:**
- عند وجود تحديث إجباري، سيتم تجميد الواجهة
- ستظهر رسالة: "جاري تحميل وتثبيت التحديث الآمن..."
- يجب تثبيت التحديث لاستمرار العمل

---

**تم التحديث:** 2026-05-27  
**الإصدار:** 1.0
