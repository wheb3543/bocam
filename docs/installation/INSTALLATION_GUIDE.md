# دليل التثبيت والتشغيل الشامل والموحد | Comprehensive Installation & Setup Guide

هذا الدليل يدمج أدلة التثبيت الخاصة بالتطوير والتشغيل الفعلي لمنصة BOCAM CRM.

## 📋 جدول المحتويات
1. [بيئة التطوير والتشغيل المحلي (Local Developer Setup)](#الجزء-1-installation_guidemd)
2. [بيئة الإنتاج والتشغيل الفعلي (Production Deployment Setup)](#الجزء-2-installation_guidemd)

---

# الجزء 1: INSTALLATION_GUIDE.md

# دليل التثبيت والتشغيل | Installation & Setup Guide

دليل شامل لتثبيت وتشغيل منصة SGH CRM Portal.

Comprehensive guide for installing and running the SGH CRM Portal.

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 📋 نظرة عامة

يتطلب تشغيل هذا المشروع تثبيت عدة مكونات أساسية. اتبع الخطوات التالية بعناية لضمان التشغيل السليم.

## 📦 المتطلبات الأساسية

### 1. Node.js

يجب تثبيت Node.js الإصدار 18.0.0 أو أحدث.

**التحميل والتثبيت:**
- قم بزيارة [nodejs.org](https://nodejs.org/)
- قم بتحميل أحدث إصدار LTS (Long Term Support)
- اتبع تعليمات التثبيت لنظام التشغيل الخاص بك

**التحقق من التثبيت:**
```bash
node --version  # يجب أن يظهر v18.0.0 أو أحدث
npm --version
```

### 2. pnpm

pnpm هو مدير الحزم المستخدم في هذا المشروع.

**التثبيت:**
```bash
npm install -g pnpm
```

**التحقق:**
```bash
pnpm --version  # يجب أن يظهر 8.0.0 أو أحدث
```

### 3. MySQL أو TiDB

قاعدة البيانات المطلوبة لتشغيل المشروع.

**MySQL:**
- قم بتحميل MySQL 8.0+ من [mysql.com](https://dev.mysql.com/downloads/)
- قم بتثبيت MySQL Server
- أنشئ قاعدة بيانات جديدة:
```sql
CREATE DATABASE sgh_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**TiDB (بديل سحابي):**
- يمكن استخدام TiDB Cloud كقاعدة بيانات سحابية متوافقة مع MySQL
- قم بإنشاء حساب على [tidbcloud.com](https://tidbcloud.com/)

### 4. Redis (اختياري)

مطلوب فقط إذا كنت تريد استخدام نظام الطوابير المتقدم.

**التثبيت:**
- **Linux/macOS:** `sudo apt install redis-server` أو `brew install redis`
- **Windows:** قم بتحميل من [GitHub](https://github.com/microsoftarchive/redis/releases)

**التحقق:**
```bash
redis-cli ping  # يجب أن يظهر PONG
```

---

## 🚀 خطوات التثبيت

### 1. استنساخ المستودع

```bash
git clone https://github.com/wheb3543/bocam.git
cd bocam
```

### 2. تثبيت الحزم

```bash
pnpm install
```

**ملاحظة:** إذا واجهت أخطاء أثناء التثبيت:
- تأكد من أن Node.js إصدار 18+
- جرب مسح ذاكرة التخزين المؤقت: `pnpm store prune`
- احذف `node_modules` و `pnpm-lock.yaml` ثم أعد التثبيت

### 3. إعداد متغيرات البيئة

أنشئ ملف `.env` في المجلد الرئيسي:

```bash
cp .env.example .env  # إذا كان الملف موجوداً
# أو
touch .env
```

ثم أضف المتغيرات التالية:

```env
# ==========================================
# قاعدة البيانات
# ==========================================
DATABASE_URL=mysql://user:password@localhost:3306/sgh_crm

# ==========================================
# OAuth (Manus)
# ==========================================
JWT_SECRET=your-jwt-secret-min-32-characters-long
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your-app-id-here
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name

# ==========================================
# Meta Pixel & Conversion API
# ==========================================
VITE_META_PIXEL_ID=2008380493273171
META_ACCESS_TOKEN=your-meta-access-token

# ==========================================
# WhatsApp Business API
# ==========================================
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# ==========================================
# Redis (اختياري - للطوابير)
# ==========================================
REDIS_URL=redis://localhost:6379

# ==========================================
# إعدادات التطبيق
# ==========================================
VITE_APP_TITLE=المستشفى السعودي الألماني - صنعاء
VITE_APP_LOGO=/SGHHospitalColorBilingual.png
PORT=3000
NODE_ENV=development
```

**شرح المتغيرات:**

| المتغير | الوصف | مطلوب |
|---------|-------|--------|
| `DATABASE_URL` | رابط قاعدة البيانات | ✅ نعم |
| `JWT_SECRET` | سر JWT (32 حرف على الأقل) | ✅ نعم |
| `OAUTH_SERVER_URL` | رابط خادم OAuth | ✅ نعم |
| `VITE_OAUTH_PORTAL_URL` | رابط بوابة OAuth | ✅ نعم |
| `VITE_APP_ID` | معرف التطبيق | ✅ نعم |
| `OWNER_OPEN_ID` | معرف المالك | ✅ نعم |
| `OWNER_NAME` | اسم المالك | ✅ نعم |
| `VITE_META_PIXEL_ID` | معرف Meta Pixel | ✅ نعم |
| `META_ACCESS_TOKEN` | رمز وصول Meta | ✅ نعم |
| `WHATSAPP_ACCESS_TOKEN` | رمز وصول WhatsApp | ❌ لا (فقط لاستخدام WhatsApp) |
| `WHATSAPP_PHONE_NUMBER_ID` | معرف رقم الهاتف | ❌ لا (فقط لاستخدام WhatsApp) |
| `REDIS_URL` | رابط Redis | ❌ لا (اختياري) |

### 4. إعداد قاعدة البيانات

```bash
# إنشاء الجداول
pnpm db:push

# (اختياري) فتح Drizzle Studio لإدارة قاعدة البيانات
pnpm db:studio
```

**ملاحظة:** 
- `pnpm db:push` سيقوم بإنشاء جميع الجداول تلقائياً
- إذا كنت تريد رؤية الترحيلات قبل تطبيقها، استخدم:
  ```bash
  npx drizzle-kit generate
  npx drizzle-kit migrate
  ```

### 5. تشغيل المشروع

```bash
# وضع التطوير (مع إعادة التحميل التلقائي)
pnpm dev

# وضع الإنتاج
pnpm build
pnpm start
```

سيعمل التطبيق على `http://localhost:3000`

---

## 🔧 استكشاف الأخطاء

### خطأ: "Cannot find module"

**السبب:** لم يتم تثبيت الحزم بشكل صحيح.

**الحل:**
```bash
pnpm install
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### خطأ: "ECONNREFUSED" لقاعدة البيانات

**السبب:** خادم MySQL غير مشغل أو بيانات الاعتماد غير صحيحة.

**الحل:**
1. تحقق من تشغيل MySQL:
   ```bash
   sudo systemctl status mysql  # Linux
   brew services list           # macOS
   ```
2. تحقق من صحة `DATABASE_URL` في ملف `.env`

### خطأ: "Port 3000 already in use"

**السبب:** المنفذ 3000 مستخدم من قبل تطبيق آخر.

**الحل:**
1. ابحث عن العملية التي تستخدم المنفذ:
   ```bash
   lsof -i :3000  # macOS/Linux
   netstat -ano | findstr :3000  # Windows
   ```
2. أوقف العملية أو غيّر المنفذ في `.env`:
   ```env
   PORT=3001
   ```

### خطأ: "WhatsApp webhook verification failed"

**السبب:** رمز التحقق غير صحيح أو الرابط غير متاح.

**الحل:**
1. تأكد من أن `WEBHOOK_VERIFY_TOKEN` في `.env` يطابق ما هو مضبوط في Meta Developer Dashboard
2. تأكد من أن الرابط `https://your-domain.com/api/webhooks/whatsapp` متاح من الخارج

### خطأ: "OAuth authentication failed"

**السبب:** إعدادات OAuth غير صحيحة.

**الحل:**
1. تحقق من أن جميع متغيرات OAuth في `.env` صحيحة
2. تأكد من أن `OWNER_OPEN_ID` يطابق المستخدم الذي تريد منحه صلاحيات المالك

---

## 📊 التحقق من التثبيت

بعد التشغيل، تحقق من:

1. **الواجهة الأمامية:** افتح `http://localhost:3000`
   - يجب أن تظهر صفحة الهبوط
   - تحقق من أن التصميم يعمل بشكل صحيح

2. **لوحة التحكم:** افتح `http://localhost:3000/admin`
   - يجب أن يطلب تسجيل الدخول
   - سجل الدخول باستخدام حساب OAuth

3. **بوابة المريض:** افتح `http://localhost:3000/patient`
   - يجب أن يطلب تسجيل الدخول برقم الهاتف

4. **قاعدة البيانات:**
   ```bash
   pnpm db:studio
   ```
   - تحقق من وجود جميع الجداول (40+ جدول)

---

## 🐳 التشغيل مع Docker (اختياري)

إذا كنت تفضل استخدام Docker:

```bash
# إنشاء ملف docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: sgh_crm
      MYSQL_USER: sgh_user
      MYSQL_PASSWORD: userpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://sgh_user:userpassword@mysql:3306/sgh_crm
      REDIS_URL: redis://redis:6379
    depends_on:
      - mysql
      - redis

volumes:
  mysql_data:
```

ثم شغّل:
```bash
docker-compose up -d
```

---

<a name="english"></a>

## 📋 Overview

Running this project requires installing several core components. Follow the steps below carefully to ensure proper operation.

## 📦 Prerequisites

### 1. Node.js

Node.js version 18.0.0 or newer is required.

**Download and Install:**
- Visit [nodejs.org](https://nodejs.org/)
- Download the latest LTS (Long Term Support) version
- Follow installation instructions for your operating system

**Verify Installation:**
```bash
node --version  # Should show v18.0.0 or newer
npm --version
```

### 2. pnpm

pnpm is the package manager used in this project.

**Install:**
```bash
npm install -g pnpm
```

**Verify:**
```bash
pnpm --version  # Should show 8.0.0 or newer
```

### 3. MySQL or TiDB

Database required to run the project.

**MySQL:**
- Download MySQL 8.0+ from [mysql.com](https://dev.mysql.com/downloads/)
- Install MySQL Server
- Create a new database:
```sql
CREATE DATABASE sgh_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**TiDB (Cloud Alternative):**
- TiDB Cloud can be used as a MySQL-compatible cloud database
- Create an account at [tidbcloud.com](https://tidbcloud.com/)

### 4. Redis (Optional)

Only required if you want to use the advanced queue system.

**Install:**
- **Linux/macOS:** `sudo apt install redis-server` or `brew install redis`
- **Windows:** Download from [GitHub](https://github.com/microsoftarchive/redis/releases)

**Verify:**
```bash
redis-cli ping  # Should return PONG
```

---

## 🚀 Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/wheb3543/bocam.git
cd bocam
```

### 2. Install Dependencies

```bash
pnpm install
```

**Note:** If you encounter errors during installation:
- Ensure Node.js is version 18+
- Try clearing cache: `pnpm store prune`
- Delete `node_modules` and `pnpm-lock.yaml` then reinstall

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env  # If file exists
# or
touch .env
```

Then add the following variables:

```env
# ==========================================
# Database
# ==========================================
DATABASE_URL=mysql://user:password@localhost:3306/sgh_crm

# ==========================================
# OAuth (Manus)
# ==========================================
JWT_SECRET=your-jwt-secret-min-32-characters-long
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your-app-id-here
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name

# ==========================================
# Meta Pixel & Conversion API
# ==========================================
VITE_META_PIXEL_ID=2008380493273171
META_ACCESS_TOKEN=your-meta-access-token

# ==========================================
# WhatsApp Business API
# ==========================================
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# ==========================================
# Redis (Optional - for queues)
# ==========================================
REDIS_URL=redis://localhost:6379

# ==========================================
# App Configuration
# ==========================================
VITE_APP_TITLE=Saudi German Hospital - Sana'a
VITE_APP_LOGO=/SGHHospitalColorBilingual.png
PORT=3000
NODE_ENV=development
```

**Variable Explanations:**

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | ✅ Yes |
| `JWT_SECRET` | JWT secret (min 32 chars) | ✅ Yes |
| `OAUTH_SERVER_URL` | OAuth server URL | ✅ Yes |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL | ✅ Yes |
| `VITE_APP_ID` | App ID | ✅ Yes |
| `OWNER_OPEN_ID` | Owner's open ID | ✅ Yes |
| `OWNER_NAME` | Owner's name | ✅ Yes |
| `VITE_META_PIXEL_ID` | Meta Pixel ID | ✅ Yes |
| `META_ACCESS_TOKEN` | Meta access token | ✅ Yes |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp access token | ❌ No (only for WhatsApp) |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID | ❌ No (only for WhatsApp) |
| `REDIS_URL` | Redis connection URL | ❌ No (optional) |

### 4. Setup Database

```bash
# Create tables
pnpm db:push

# (Optional) Open Drizzle Studio for database management
pnpm db:studio
```

**Note:**
- `pnpm db:push` will automatically create all tables
- If you want to see migrations before applying, use:
  ```bash
  npx drizzle-kit generate
  npx drizzle-kit migrate
  ```

### 5. Run Project

```bash
# Development mode (with hot reload)
pnpm dev

# Production mode
pnpm build
pnpm start
```

The application will run on `http://localhost:3000`

---

## 🔧 Troubleshooting

### Error: "Cannot find module"

**Cause:** Dependencies not installed properly.

**Solution:**
```bash
pnpm install
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "ECONNREFUSED" for database

**Cause:** MySQL server not running or credentials incorrect.

**Solution:**
1. Check if MySQL is running:
   ```bash
   sudo systemctl status mysql  # Linux
   brew services list           # macOS
   ```
2. Verify `DATABASE_URL` in `.env` is correct

### Error: "Port 3000 already in use"

**Cause:** Port 3000 is used by another application.

**Solution:**
1. Find process using the port:
   ```bash
   lsof -i :3000  # macOS/Linux
   netstat -ano | findstr :3000  # Windows
   ```
2. Kill the process or change port in `.env`:
   ```env
   PORT=3001
   ```

### Error: "WhatsApp webhook verification failed"

**Cause:** Verification token incorrect or URL not accessible.

**Solution:**
1. Ensure `WEBHOOK_VERIFY_TOKEN` in `.env` matches what's set in Meta Developer Dashboard
2. Ensure URL `https://your-domain.com/api/webhooks/whatsapp` is accessible from outside

### Error: "OAuth authentication failed"

**Cause:** OAuth settings incorrect.

**Solution:**
1. Verify all OAuth variables in `.env` are correct
2. Ensure `OWNER_OPEN_ID` matches the user you want to grant owner permissions

---

## 📊 Verify Installation

After running, verify:

1. **Frontend:** Open `http://localhost:3000`
   - Landing page should appear
   - Check that design works properly

2. **Admin Dashboard:** Open `http://localhost:3000/admin`
   - Should prompt for login
   - Login using OAuth account

3. **Patient Portal:** Open `http://localhost:3000/patient`
   - Should prompt for phone login

4. **Database:**
   ```bash
   pnpm db:studio
   ```
   - Verify all tables exist (40+ tables)

---

## 🐳 Docker Setup (Optional)

If you prefer using Docker:

```bash
# Create docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: sgh_crm
      MYSQL_USER: sgh_user
      MYSQL_PASSWORD: userpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://sgh_user:userpassword@mysql:3306/sgh_crm
      REDIS_URL: redis://redis:6379
    depends_on:
      - mysql
      - redis

volumes:
  mysql_data:
```

Then run:
```bash
docker-compose up -d
```

---

<div align="center">

**نرعاكم كأهالينا - Caring like family**

Made with ❤️ by Abdullkwy Alhatef

</div>

---

# الجزء 2: INSTALLATION_GUIDE.md

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
5. ✅ استخدم SSL/HTTPS في الإنتاج (مطلوب)
6. ✅ حافظ على النظام محدثاً (security updates)

---

## إعداد SSL/HTTPS (مطلوب للإنتاج)

### نظرة عامة

النظام يدعم SSL/HTTPS باستخدام Let's Encrypt و Nginx. تم توفير جميع الملفات اللازمة في مجلد `deploy/nginx/`.

### الطريقة 1: الإعداد الآلي (موصى به)

```bash
# 1. انتقل إلى مجلد nginx
cd deploy/nginx

# 2. اجعل السكريبت قابلاً للتنفيذ
chmod +x setup-ssl.sh

# 3. شغل السكريبت
sudo ./setup-ssl.sh
```

السكريبت سيطلب:
- اسم النطاق (domain name)
- البريد الإلكتروني لإشعارات Let's Encrypt

### الطريقة 2: إعداد Docker Compose

```bash
# 1. انتقل إلى مجلد nginx
cd deploy/nginx

# 2. أنشئ المجلدات المطلوبة
mkdir -p ssl certbot-webroot letsencrypt certbot-logs

# 3. عدّل docker-compose.yml
# استبدل YOUR_EMAIL@EXAMPLE.COM ببريدك
# استبدل YOUR_DOMAIN.COM بنطاقك

# 4. احصل على الشهادة الأولية
docker-compose --profile init run certbot-init

# 5. انسخ الشهادات إلى مجلد ssl
cp letsencrypt/live/YOUR_DOMAIN.COM/fullchain.pem ssl/fullchain.pem
cp letsencrypt/live/YOUR_DOMAIN.COM/privkey.pem ssl/privkey.pem
cp letsencrypt/live/YOUR_DOMAIN.COM/chain.pem ssl/chain.pem

# 6. ابدأ nginx و certbot
docker-compose up -d
```

### الطريقة 3: الإعداد اليدوي

```bash
# 1. ثبت Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 2. احصل على شهادة SSL
sudo certbot certonly --nginx -d yourdomain.com

# 3. انسخ الشهادات
sudo mkdir -p /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /etc/nginx/ssl/fullchain.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /etc/nginx/ssl/privkey.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/chain.pem /etc/nginx/ssl/chain.pem

# 4. اضبط الأذونات
sudo chmod 644 /etc/nginx/ssl/fullchain.pem
sudo chmod 644 /etc/nginx/ssl/chain.pem
sudo chmod 600 /etc/nginx/ssl/privkey.pem

# 5. انسخ تكوين nginx
sudo cp deploy/nginx/nginx.conf /etc/nginx/nginx.conf

# 6. عدّل اسم النطاق في التكوين
sudo sed -i 's/server_name _;/server_name yourdomain.com;/g' /etc/nginx/nginx.conf

# 7. اختبر وأعد تحميل nginx
sudo nginx -t
sudo systemctl reload nginx
```

### التجديد التلقائي

الشهادات صالحة لمدة 90 يوم. Certbot يجددها تلقائياً قبل 30 يوم من انتهاء الصلاحية.

**إعداد Systemd:**
```bash
# انسخ ملفات service و timer
sudo cp deploy/nginx/certbot-renewal.service /etc/systemd/system/
sudo cp deploy/nginx/certbot-renewal.timer /etc/systemd/system/

# فعّل وابدأ الـ timer
sudo systemctl enable certbot-renewal.timer
sudo systemctl start certbot-renewal.timer

# تحقق من الحالة
sudo systemctl status certbot-renewal.timer
```

**إعداد Cron (بديل):**
```bash
# أضف إلى crontab
sudo crontab -e

# أضف هذا السطر (يعمل مرتين يومياً)
0 */12 * * * certbot renew --quiet --deploy-hook "/etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh"
```

### التحقق من SSL

```bash
# تحقق من الشهادات
sudo certbot certificates

# اختبر تكوين nginx
sudo nginx -t

# تحقق من تقييم SSL (خارجي)
# زر: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

### استكشاف الأخطاء

**الشهادة غير موجودة:**
```bash
sudo ls -la /etc/letsencrypt/live/yourdomain.com/
sudo certbot certonly --nginx -d yourdomain.com --force-renewal
```

**Nginx لا يعمل:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo nginx -t
sudo netstat -tulpn | grep :443
```

**التجديد التلقائي لا يعمل:**
```bash
sudo certbot renew --dry-run
sudo systemctl status certbot-renewal.timer
sudo journalctl -u certbot-renewal.service -f
```

### الملفات المتوفرة

- `deploy/nginx/nginx.conf` - تكوين Nginx مع SSL
- `deploy/nginx/setup-ssl.sh` - سكريبت الإعداد الآلي
- `deploy/nginx/certbot-renewal.service` - Systemd service
- `deploy/nginx/certbot-renewal.timer` - Systemd timer
- `deploy/nginx/docker-compose.yml` - Docker Compose
- `deploy/nginx/README.md` - دليل مفصل

للمزيد من التفاصيل، راجع `deploy/nginx/README.md`

---

## إعداد النسخ الاحتياطي التلقائي (مطلوب للإنتاج)

### نظرة عامة

النظام يدعم النسخ الاحتياطي التلقائي لقاعدة البيانات والملفات، مع إمكانية الرفع إلى التخزين السحابي (AWS S3, Cloudflare R2). تم توفير جميع الملفات اللازمة في مجلد `deploy/backup/`.

### الميزات

- نسخ احتياطي تلقائي لقاعدة البيانات MySQL
- نسخ احتياطي للملفات والتكوين
- رفع تلقائي إلى التخزين السحابي
- سياسة الاحتفاظ التلقائية (cleanup)
- التحقق من سلامة النسخ الاحتياطية
- إشعارات Webhook والبريد الإلكتروني

### الإعداد

**1. تثبيت المتطلبات:**
```bash
sudo apt-get update
sudo apt-get install -y mysql-client gzip tar cron

# لتخزين السحابة (اختياري)
sudo apt-get install -y awscli  # لـ AWS S3
# أو
sudo apt-get install -y rclone  # لـ R2 وغيرها
```

**2. إعداد التكوين:**
```bash
# إنشاء مجلد التكوين
sudo mkdir -p /etc/bocam-backup

# نسخ ملف التكوين
sudo cp deploy/backup/config.sh /etc/bocam-backup/config.sh

# تعديل التكوين
sudo nano /etc/bocam-backup/config.sh
```

**3. تثبيت السكريبتات:**
```bash
cd deploy/backup

# جعل السكريبتات قابلة للتنفيذ
chmod +x backup.sh upload-to-cloud.sh cleanup-old-backups.sh

# نسخ إلى موقع النظام
sudo cp backup.sh /usr/local/bin/bocam-backup.sh
sudo cp upload-to-cloud.sh /usr/local/bin/bocam-upload-to-cloud.sh
sudo cp cleanup-old-backups.sh /usr/local/bin/bocam-cleanup-backups.sh
```

**4. إعداد Cron Jobs:**
```bash
# نسخ تكوين Cron
sudo cp bocam-backup.cron /etc/cron.d/bocam-backup

# إعادة تحميل Cron
sudo service cron reload
```

جدول Cron الافتراضي:
- نسخ احتياطي يومي: الساعة 2:00 صباحاً
- نسخ احتياطي أسبوعي كامل: الأحد الساعة 3:00 صباحاً
- نسخ احتياطي ساعي للقاعدة: كل ساعة

**5. إعداد التخزين السحابي (اختياري):**

**AWS S3:**
```bash
aws configure
# أدخل بيانات الاعتماد
```

**Cloudflare R2 (باستخدام Rclone):**
```bash
rclone config
# اتبع التعليمات لإضافة R2 remote
```

### الاختبار

```bash
# تشغيل نسخ احتياطي يدوي
sudo /usr/local/bin/bocam-backup.sh

# التحقق من النسخ الاحتياطية
ls -la /var/backups/bocam/

# التحقق من سلامة النسخ الاحتياطية
gzip -t /var/backups/bocam/*/database_*.sql.gz
```

### استعادة النسخ الاحتياطية

**استعادة قاعدة البيانات:**
```bash
gunzip < /var/backups/bocam/2024-06-02/database_20240602_020000.sql.gz | mysql -u root -p bocam_crm
```

**استعادة الملفات:**
```bash
tar -xzf /var/backups/bocam/2024-06-02/files_20240602_020000.tar.gz -C /path/to/restore
```

### الملفات المتوفرة

- `deploy/backup/backup.sh` - سكريبت النسخ الاحتياطي الرئيسي
- `deploy/backup/config.sh` - ملف التكوين
- `deploy/backup/upload-to-cloud.sh` - سكريبت رفع السحابة
- `deploy/backup/cleanup-old-backups.sh` - سكريبت التنظيف
- `deploy/backup/bocam-backup.cron` - تكوين Cron
- `deploy/backup/README.md` - دليل مفصل

للمزيد من التفاصيل، راجع `deploy/backup/README.md`

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


---

