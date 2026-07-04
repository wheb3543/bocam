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