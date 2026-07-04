# SGH CRM Portal | بوابة إدارة علاقات العملاء - المستشفى السعودي الألماني

<div align="center">

![Saudi German Hospital](client/public/SGHHospitalColorBilingual.png)

**منصة CRM طبية متكاملة لإدارة الحملات التسويقية وحجوزات المرضى وتكامل WhatsApp**

**Comprehensive Medical CRM Platform for Marketing Campaigns, Patient Appointments & WhatsApp Integration**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()

[العربية](#arabic) | [English](#english)

</div>

---

<a name="arabic"></a>

## 📋 نظرة عامة

منصة CRM طبية متكاملة تم تطويرها خصيصاً للمستشفى السعودي الألماني - صنعاء. توفر النظام إدارة شاملة للحملات ال[...] 

### ✨ الميزات الرئيسية

#### 🎯 إدارة الحملات التسويقية
- **إنشاء وإدارة الحملات** بأنواع مختلفة (رقمية، ميدانية، توعوية، مختلطة)
- **تتبع UTM Parameters** لتحليل مصادر الزيارات
- **إدارة الميزانيات** (المخططة والفعلية)
- **تحديد الأهداف ومؤشرات الأداء** (KPIs)
- **ربط الحملات بالعروض والمخيمات والأطباء**

#### 🏥 إدارة المواعيد والحجوزات
- **حجز مواعيد الأطباء** مع عرض 22+ طبيب متخصص
- **نظام حالات المواعيد** (قيد الانتظار، مؤكد، حضر، مكتمل، ملغي)
- **إدارة قوائم الانتظار** والتذكيرات التلقائية
- **تتبع مصادر الحجوزات** (ويب، هاتف، يدوي)

#### 💼 لوحة التحكم الإدارية (Mini-CRM)
- **إدارة العملاء** (Leads) مع تتبع حالة كل عميل
- **إدارة العروض الطبية** والعروض الخاصة
- **إدارة المخيمات الطبية** الخيرية
- **نظام الفلاتر المحفوظة** وتخصيص الأعمدة
- **بطاقات إحصائية شاملة** ورسوم بيانية
- **سجل التدقيق** (Audit Log) لتتبع جميع التغييرات

#### 📱 بوابة المريض
- **تسجيل دخول آمن** برقم الهاتف وOTP
- **عرض المواعيد** والحجوزات القادمة
- **عرض النتائج الطبية** (تحاليل، أشعة، تقارير)
- **إدارة الملف الشخصي**
- **تطبيق PWA** للتثبيت على الجوال

#### 💬 تكامل WhatsApp Business API
- **إرسال الرسائل التلقائية** (تأكيد الحجز، تذكيرات، متابعة)
- **لوحة محادثات متكاملة** مع فريق خدمة العملاء
- **الردود التلقائية** على الكلمات المفتاحية
- **البث الجماعي** للحملات التسويقية
- **إدارة القوالب** المعتمدة من Meta
- **تتبع جودة المحادثات** والتكاليف
- **جدولة الرسائل** التلقائية

#### 📊 نظام إدارة المهام والمشاريع
- **إنشاء المشاريع** وربطها بالحملات
- **إدارة المهام** مع تحديد الأولويات والمواعيد النهائية
- **تسليم المهام** ومراجعتها
- **نظام التعليقات** على المهام
- **تتبع الوقت** المقدر والفعلي

#### 👥 إدارة الفرق والمستخدمين
- **نظام الصلاحيات** (Admin, Manager, Team Leader, Staff, Viewer)
- **إدارة الفرق** (التسويق الرقمي، التسويق الميداني، خدمة العملاء، الإعلام)
- **طلبات التصريح** للمستخدمين الجدد
- **تخصيص الواجهات** حسب تفضيلات كل مستخدم

#### 🔗 التكاملات
- **Meta Pixel & Conversion API** - تتبع التحويلات والإعلانات
- **WhatsApp Cloud API** - رسائل WhatsApp التلقائية
- **Email Notifications** - إشعارات البريد الإلكتروني
- **Google Analytics** - تحليلات الزيارات
- **PWA** - تطبيق ويب تقدمي

### 🛠️ التقنيات المستخدمة

#### Frontend
- **React 19** - مكتبة واجهة المستخدم
- **TypeScript 5.9** - لغة البرمجة
- **Tailwind CSS 4** - إطار عمل التصميم
- **TanStack Query** - إدارة حالة البيانات
- **Wouter** - التوجيه (Routing)
- **Lucide React** - الأيقونات
- **shadcn/ui** - مكونات واجهة المستخدم
- **React Hook Form** - إدارة النماذج
- **Zod** - التحقق من البيانات
- **Recharts** - الرسوم البيانية
- **Framer Motion** - الرسوم المتحركة

#### Backend
- **Node.js** - بيئة التشغيل
- **Express.js** - إطار عمل الخادم
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - إدارة قاعدة البيانات
- **BullMQ** - نظام الطوابير
- **Redis** - التخزين المؤقت
- **Axios** - عميل HTTP

#### Database
- **MySQL/TiDB** - قاعدة البيانات الرئيسية
- **40+ جدول** يغطي جميع جوانب النظام

#### Authentication
- **Manus OAuth** - نظام المصادقة
- **JWT** - الرموز الأمنية
- **bcrypt** - تشفير كلمات المرور

#### DevOps & Tools
- **Vite** - أداة البناء
- **Vitest** - إطار الاختبار
- **Prettier** - تنسيق الكود
- **ESLint** - فحص الكود
- **Drizzle Kit** - إدارة الترحيل
- **Docker** - حاويات التطبيق
- **GitHub Actions** - CI/CD

### 📦 المتطلبات

- **Node.js** >= 22.13.0
- **pnpm** >= 10.4.0
- **MySQL** >= 8.0 أو **TiDB**
- **Redis** (اختياري - للطوابير)
- **Docker** (اختياري - للحاويات)

### 🚀 التثبيت والتشغيل

#### 1. استنساخ المستودع

```bash
git clone https://github.com/wheb3543/bocam.git
cd bocam
```

#### 2. تثبيت الحزم

```bash
pnpm install
```

#### 3. إعداد متغيرات البيئة

قم بإنشاء ملف `.env` في المجلد الرئيسي:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/sgh_crm

# OAuth (Manus)
JWT_SECRET=your-jwt-secret-min-32-chars
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your-app-id
OWNER_OPEN_ID=your-owner-openid
OWNER_NAME=your-name

# Meta Pixel & Conversion API
VITE_META_PIXEL_ID=2008380493273171
META_ACCESS_TOKEN=your-meta-access-token

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# App Configuration
VITE_APP_TITLE=المستشفى السعودي الألماني - صنعاء
VITE_APP_LOGO=/SGHHospitalColorBilingual.png
PORT=3000
NODE_ENV=development
```

#### 4. إعداد قاعدة البيانات

```bash
# إنشاء الجداول
pnpm db:push

# (اختياري) ملء البيانات الأولية
pnpm db:seed
```

#### 5. تشغيل المشروع

```bash
# وضع التطوير
pnpm dev

# وضع الإنتاج
pnpm build
pnpm start
```

سيعمل التطبيق على `http://localhost:3000`

### 📁 هيكل المشروع

```
sgh-crm-portal/
├── client/                     # تطبيق الواجهة الأمامية
│   ├── public/                # الملفات الثابتة
│   └── src/
│       ├── pages/             # مكونات الصفحات (50+ صفحة)
│       │   ├── public/        # الصفحات العامة (الصفحة الرئيسية، الأطباء، العروض، المخيمات)
│       │   ├── admin/         # الصفحات الإدارية (لوحة التحكم، الحجوزات، التقارير، WhatsApp)
│       │   │   ├── bookings/  # إدارة الحجوزات والمواعيد
│       │   │   ├── whatsapp/  # إدارة WhatsApp
│       │   │   ├── campaigns/ # إدارة الحملات والمشاريع
