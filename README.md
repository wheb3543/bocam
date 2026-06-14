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

منصة CRM طبية متكاملة تم تطويرها خصيصاً للمستشفى السعودي الألماني - صنعاء. توفر النظام إدارة شاملة للحملات التسويقية، حجوزات الأطباء، بوابة المريض، تكامل WhatsApp Business API، نظام إدارة المهام، وأكثر من ذلك.

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

### 📦 المتطلبات

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **MySQL** >= 8.0 أو **TiDB**
- **Redis** (اختياري - للطوابير)

### 🚀 التثبيت والتشغيل

#### 1. استنساخ المستودع

```bash
git clone https://github.com/abood22828/sgh-crm-portal.git
cd sgh-crm-portal
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
│       │   │   ├── reports/   # التقارير والتحليلات
│       │   │   ├── communications/ # إدارة المراسلات
│       │   │   ├── teams/     # إدارة الفرق
│       │   │   ├── content/   # إدارة المحتوى
│       │   │   ├── users/     # إدارة المستخدمين
│       │   │   ├── system/    # إدارة النظام
│       │   │   ├── settings/  # الإعدادات
│       │   │   └── shared/    # الصفحات المشتركة
│       │   └── patient-portal/ # بوابة المريض
│       ├── components/        # المكونات القابلة لإعادة الاستخدام
│       ├── hooks/             # الخطافات المخصصة
│       ├── contexts/          # سياقات React
│       ├── lib/               # الأدوات والإعدادات
│       └── _core/             # المكونات الأساسية
├── server/                     # تطبيق الخادم
│   ├── _core/                 # الإعداد الأساسي (OAuth, tRPC)
│   ├── routers/               # tRPC routers (28+ router)
│   ├── services/              # خدمات الأعمال
│   │   ├── whatsapp/          # خدمات WhatsApp
│   │   └── meta/              # خدمات Meta
│   ├── db/                    # وظائف قاعدة البيانات
│   ├── config/                # ملفات الإعداد
│   ├── cron/                  # المهام المجدولة
│   ├── queues/                # طوابير BullMQ
│   └── webhooks/              # معالجات webhooks
├── shared/                     # الكود المشترك
│   ├── _core/                 # الأساسيات المشتركة
│   └── const.ts               # الثوابت المشتركة
├── drizzle/                    # مخطط قاعدة البيانات
│   ├── schema.ts              # تعريف الجداول (40+ جدول)
│   ├── relations.ts           # العلاقات بين الجداول
│   └── meta/                  # ملفات الترحيل
├── docs/                       # الوثائق
├── scripts/                    # سكريبتات المساعدة
└── public/                     # الأصول العامة
```

### 🎨 الصفحات الرئيسية

#### الصفحات العامة
- `/` - صفحة الهبوط الرئيسية (المخيم الطبي)
- `/doctors` - صفحة حجز مواعيد الأطباء
- `/doctors/[slug]` - صفحة تفاصيل الطبيب
- `/offers` - صفحة العروض الطبية
- `/camps` - صفحة المخيمات الطبية
- `/thank-you` - صفحة الشكر بعد التسجيل

#### صفحات بوابة المريض (تتطلب تسجيل دخول)
- `/patient` - لوحة تحكم المريض
- `/patient/appointments` - مواعيد المريض
- `/patient/results` - النتائج الطبية
- `/patient/profile` - الملف الشخصي
- `/patient/offers` - العروض المتاحة
- `/patient/camps` - المخيمات المتاحة

#### الصفحات الإدارية (تتطلب صلاحيات)
- `/admin` - لوحة التحكم الرئيسية
- `/admin/bookings` - إدارة الحجوزات
  - `/admin/bookings/leads` - إدارة العملاء المحتملين
  - `/admin/bookings/appointments` - إدارة المواعيد
  - `/admin/bookings/offer-leads` - إدارة عروض العملاء
  - `/admin/bookings/camp-registrations` - إدارة تسجيلات المخيمات
  - `/admin/bookings/customers` - إدارة ملفات العملاء
  - `/admin/bookings/patient-results` - إدارة نتائج بوابة المريض
  - `/admin/bookings/tasks` - إدارة المهام
- `/admin/reports` - التقارير والتحليلات
  - `/admin/reports/reports` - التقارير العامة
  - `/admin/reports/analytics` - التحليلات
  - `/admin/reports/bi` - تحليلات الأعمال (BI)
  - `/admin/reports/camp-stats` - إحصائيات المخيمات
  - `/admin/reports/pwa-stats` - إحصائيات PWA
- `/admin/whatsapp` - إدارة WhatsApp
  - `/admin/whatsapp/dashboard` - لوحة تحكم WhatsApp
  - `/admin/whatsapp/conversations` - المحادثات
  - `/admin/whatsapp/templates` - قوالب الرسائل
  - `/admin/whatsapp/broadcast` - البث الجماعي
  - `/admin/whatsapp/auto-reply` - الردود التلقائية
  - `/admin/whatsapp/analytics` - التحليلات
  - `/admin/whatsapp/compliance` - الامتثال
  - `/admin/whatsapp/account-health` - صحة الحساب
- `/admin/campaigns` - إدارة الحملات والمشاريع
  - `/admin/campaigns/campaigns` - إدارة الحملات
  - `/admin/campaigns/projects` - إدارة المشاريع
  - `/admin/campaigns/review-approval` - المراجعة والاعتماد
- `/admin/communications` - إدارة المراسلات
  - `/admin/communications/messages` - إدارة الرسائل
  - `/admin/communications/message-settings` - إعدادات الرسائل
- `/admin/teams` - إدارة الفرق
  - `/admin/teams/digital-marketing` - فريق التسويق الرقمي
  - `/admin/teams/media` - وحدة الإعلام
  - `/admin/teams/field-marketing` - التسويق الميداني
  - `/admin/teams/customer-service` - خدمة العملاء
- `/admin/content` - إدارة المحتوى
  - `/admin/content/content` - إدارة المحتوى
  - `/admin/content/publishing` - إدارة النشر
- `/admin/users` - إدارة المستخدمين
  - `/admin/users/users` - إدارة المستخدمين
- `/admin/system` - إدارة النظام
  - `/admin/system/updates` - إدارة التحديثات
  - `/admin/system/status` - حالة النظام
  - `/admin/system/backups` - النسخ الاحتياطي
- `/admin/settings` - الإعدادات
- `/admin/profile` - الملف الشخصي

### 🔐 نظام الصلاحيات

#### الأدوار
- **Admin** - صلاحيات كاملة لإدارة النظام
- **Manager** - صلاحيات إدارة محدودة
- **Team Leader** - قائد فريق مع صلاحيات الفريق
- **Staff** - موظف مع صلاحيات محدودة
- **Viewer** - مشاهد مع صلاحيات العرض فقط
- **User** - مستخدم عادي

#### نظام طلبات التصريح
- يمكن للمستخدمين الجدد طلب التصريح للوصول
- يراجع المسؤولون الطلبات ويوافقون عليها أو يرفضونها
- يتم إشعار المدير عند تقديم طلب جديد

### 📊 قاعدة البيانات

#### الجداول الرئيسية (40+ جدول)

**المستخدمين والصلاحيات:**
- `users` - المستخدمين المصرح لهم
- `accessRequests` - طلبات التصريح
- `userPreferences` - تفضيلات المستخدمين
- `teams` - الفرق
- `teamMembers` - أعضاء الفرق

**الحملات والتسويق:**
- `campaigns` - الحملات التسويقية
- `leads` - العملاء المحتملين
- `leadStatusHistory` - سجل تغييرات حالة العملاء
- `campaignOffers` - ربط الحملات بالعروض
- `campaignCamps` - ربط الحملات بالمخيمات
- `campaignDoctors` - ربط الحملات بالأطباء

**المواعيد والحجوزات:**
- `doctors` - بيانات الأطباء
- `appointments` - مواعيد الأطباء
- `offerLeads` - حجوزات العروض
- `campRegistrations` - تسجيلات المخيمات

**العروض والمخيمات:**
- `offers` - العروض الطبية الخاصة
- `camps` - المخيمات الطبية

**إدارة المهام:**
- `projects` - المشاريع
- `tasks` - المهام
- `taskComments` - تعليقات المهام
- `taskAttachments` - مرفقات المهام
- `taskDeliverables` - تسليمات المهام

**WhatsApp:**
- `whatsapp_conversations` - المحادثات
- `whatsapp_messages` - الرسائل
- `whatsapp_templates` - قوالب الرسائل
- `whatsapp_broadcasts` - حملات البث
- `whatsapp_auto_replies` - الردود التلقائية
- `whatsapp_analytics` - تحليلات WhatsApp
- `whatsapp_notifications` - إشعارات WhatsApp
- `whatsapp_blocked_numbers` - الأرقام المحظورة
- `whatsapp_account_alerts` - تنبيهات الحساب
- `whatsapp_security_events` - أحداث الأمان
- `whatsapp_phone_quality` - جودة أرقام الهواتف
- `whatsapp_user_opt_ins` - اشتراكات المستخدمين
- `whatsapp_webhook_events` - أحداث webhooks
- `whatsapp_contacts` - جهات الاتصال
- `whatsapp_orders` - الطلبات
- `whatsapp_products` - المنتجات
- `whatsapp_referrals` - الإحالات
- `whatsapp_reactions` - ردود الفعل
- `whatsapp_transactions` - المعاملات

**بوابة المريض:**
- `patients` - المرضى
- `patientOtps` - رموز OTP
- `patientResults` - نتائج المرضى

**التتبع والتحليلات:**
- `visitSessions` - جلسات الزيارة
- `trackingEvents` - أحداث التتبع
- `pwaInstalls` - تثبيتات PWA
- `abandonedForms` - النماذج المهجورة

**أخرى:**
- `comments` - التعليقات على السجلات
- `followUpTasks` - مهام المتابعة
- `auditLogs` - سجل التدقيق
- `savedFilters` - الفلاتر المحفوظة
- `sharedColumnTemplates` - قوالب الأعمدة المشتركة
- `messageSettings` - إعدادات الرسائل
- `messageTemplates` - قوالب الرسائل
- `scheduled_messages` - الرسائل المجدولة
- `quick_replies` - الردود السريعة
- `saved_searches` - البحثات المحفوظة
- `settings` - إعدادات النظام

### 🔧 الأوامر المتاحة

```bash
# Development
pnpm dev              # تشغيل وضع التطوير
pnpm build            # بناء للإنتاج
pnpm start            # تشغيل الإنتاج

# Database
pnpm db:push          # دفع التغييرات إلى قاعدة البيانات
pnpm db:studio        # فتح Drizzle Studio

# Code Quality
pnpm check            # فحص TypeScript
pnpm format           # تنسيق الكود بـ Prettier
pnpm test             # تشغيل الاختبارات

# Scripts
pnpm db:seed          # ملء البيانات الأولية (إذا وجد)
```

### 📚 الوثائق

- **[دليل التثبيت](INSTALLATION_GUIDE.md)** - تعليمات التثبيت التفصيلية
- **[دليل المساهمة](CONTRIBUTING.md)** - كيفية المساهمة في المشروع
- **[دليل المستخدم](userGuide.md)** - دليل المستخدم التفصيلي
- **[دليل WhatsApp](docs/WHATSAPP_INTEGRATION_GUIDE.md)** - تكامل WhatsApp
- **[سياسة الأمان](SECURITY.md)** - معلومات الأمان
- **[سجل التغييرات](CHANGELOG.md)** - تاريخ الإصدارات

### 🤝 المساهمة

نرحب بجميع المساهمات! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) قبل البدء.

### 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

### 👥 الفريق

- **التطوير**: Abdullkwy Alhatef
- **العميل**: المستشفى السعودي الألماني - صنعاء

### 📞 الدعم

للحصول على الدعم، يرجى التواصل عبر:
- البريد الإلكتروني: abood22828@gmail.com
- GitHub Issues: [إنشاء مشكلة جديدة](https://github.com/abood22828/sgh-crm-portal/issues)

### 🙏 شكر وتقدير

- شكراً لفريق المستشفى السعودي الألماني - صنعاء على الثقة والتعاون
- شكراً لجميع المساهمين في المشاريع مفتوحة المصدر المستخدمة

---

<a name="english"></a>

## 📋 Overview

A comprehensive medical CRM platform developed specifically for Saudi German Hospital - Sana'a. The system provides complete management of marketing campaigns, doctor appointments, patient portal, WhatsApp Business API integration, task management system, and more.

### ✨ Key Features

#### 🎯 Marketing Campaign Management
- **Create and manage campaigns** of various types (digital, field, awareness, mixed)
- **UTM Parameters tracking** for traffic source analysis
- **Budget management** (planned and actual)
- **Goals and KPIs definition**
- **Link campaigns to offers, camps, and doctors**

#### 🏥 Appointment & Booking Management
- **Doctor appointment booking** with 22+ specialized doctors
- **Appointment status system** (pending, confirmed, attended, completed, cancelled)
- **Queue management** and automatic reminders
- **Booking source tracking** (web, phone, manual)

#### 💼 Admin Dashboard (Mini-CRM)
- **Customer (Leads) management** with status tracking
- **Medical offers management** and special promotions
- **Medical camps management** for charitable events
- **Saved filters system** and column customization
- **Comprehensive statistics cards** and charts
- **Audit Log** to track all changes

#### 📱 Patient Portal
- **Secure login** with phone number and OTP
- **View appointments** and upcoming bookings
- **View medical results** (labs, radiology, reports)
- **Profile management**
- **PWA app** for mobile installation

#### 💬 WhatsApp Business API Integration
- **Automatic messaging** (booking confirmation, reminders, follow-up)
- **Integrated chat dashboard** with customer service team
- **Auto-replies** for keywords
- **Broadcast messaging** for marketing campaigns
- **Template management** approved by Meta
- **Conversation quality tracking** and cost management
- **Message scheduling** automation

#### 📊 Task & Project Management System
- **Create projects** linked to campaigns
- **Task management** with priorities and deadlines
- **Task delivery** and review system
- **Comment system** on tasks
- **Time tracking** (estimated vs actual)

#### 👥 Team & User Management
- **Permission system** (Admin, Manager, Team Leader, Staff, Viewer)
- **Team management** (Digital Marketing, Field Marketing, Customer Service, Media)
- **Access requests** for new users
- **Interface customization** per user preferences

#### 🔗 Integrations
- **Meta Pixel & Conversion API** - Conversion and ad tracking
- **WhatsApp Cloud API** - Automatic WhatsApp messaging
- **Email Notifications** - Instant email alerts
- **Google Analytics** - Traffic analytics
- **PWA** - Progressive Web App

### 🛠️ Tech Stack

#### Frontend
- **React 19** - UI library
- **TypeScript 5.9** - Programming language
- **Tailwind CSS 4** - Styling framework
- **TanStack Query** - Data state management
- **Wouter** - Routing
- **Lucide React** - Icons
- **shadcn/ui** - UI components
- **React Hook Form** - Form management
- **Zod** - Data validation
- **Recharts** - Charting library
- **Framer Motion** - Animation library

#### Backend
- **Node.js** - Runtime environment
- **Express.js** - Server framework
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - Database management
- **BullMQ** - Queue system
- **Redis** - Caching
- **Axios** - HTTP client

#### Database
- **MySQL/TiDB** - Primary database
- **40+ tables** covering all system aspects

#### Authentication
- **Manus OAuth** - Authentication system
- **JWT** - Security tokens
- **bcrypt** - Password hashing

#### DevOps & Tools
- **Vite** - Build tool
- **Vitest** - Testing framework
- **Prettier** - Code formatter
- **ESLint** - Code linter
- **Drizzle Kit** - Migration management

### 📦 Requirements

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **MySQL** >= 8.0 or **TiDB**
- **Redis** (Optional - for queues)

### 🚀 Installation & Setup

#### 1. Clone Repository

```bash
git clone https://github.com/abood22828/sgh-crm-portal.git
cd sgh-crm-portal
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

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
VITE_APP_TITLE=Saudi German Hospital - Sana'a
VITE_APP_LOGO=/SGHHospitalColorBilingual.png
PORT=3000
NODE_ENV=development
```

#### 4. Setup Database

```bash
# Create tables
pnpm db:push

# (Optional) Seed initial data
pnpm db:seed
```

#### 5. Run Project

```bash
# Development mode
pnpm dev

# Production mode
pnpm build
pnpm start
```

The application will run on `http://localhost:3000`

### 📁 Project Structure

```
sgh-crm-portal/
├── client/                     # Frontend application
│   ├── public/                # Static assets
│   └── src/
│       ├── pages/             # Page components (50+ pages)
│       │   ├── public/        # Public pages (Home, Doctors, Offers, Camps)
│       │   ├── admin/         # Admin pages (Dashboard, Bookings, Reports, WhatsApp)
│       │   │   ├── bookings/  # Bookings and appointments management
│       │   │   ├── whatsapp/  # WhatsApp management
│       │   │   ├── campaigns/ # Campaigns and projects management
│       │   │   ├── reports/   # Reports and analytics
│       │   │   ├── communications/ # Communications management
│       │   │   ├── teams/     # Teams management
│       │   │   ├── content/   # Content management
│       │   │   ├── users/     # Users management
│       │   │   ├── system/    # System management
│       │   │   ├── settings/  # Settings
│       │   │   └── shared/    # Shared pages
│       │   └── patient-portal/ # Patient portal
│       ├── components/        # Reusable components
│       ├── hooks/             # Custom hooks
│       ├── contexts/          # React contexts
│       ├── lib/               # Utilities and configs
│       └── _core/             # Core components
├── server/                     # Backend application
│   ├── _core/                 # Core setup (OAuth, tRPC)
│   ├── routers/               # tRPC routers (28+ routers)
│   ├── services/              # Business services
│   │   ├── whatsapp/          # WhatsApp services
│   │   └── meta/              # Meta services
│   ├── db/                    # Database functions
│   ├── config/                # Configuration files
│   ├── cron/                  # Scheduled tasks
│   ├── queues/                # BullMQ queues
│   └── webhooks/              # Webhook handlers
├── shared/                     # Shared code
│   ├── _core/                 # Shared core
│   └── const.ts               # Shared constants
├── drizzle/                    # Database schema
│   ├── schema.ts              # Table definitions (40+ tables)
│   ├── relations.ts           # Table relations
│   └── meta/                  # Migration files
├── docs/                       # Documentation
├── scripts/                    # Helper scripts
└── public/                     # Public assets
```

### 🎨 Main Pages

#### Public Pages
- `/` - Main landing page (Medical camp)
- `/doctors` - Doctor appointment booking
- `/doctors/[slug]` - Doctor details
- `/offers` - Medical offers
- `/camps` - Medical camps
- `/thank-you` - Thank you page after registration

#### Patient Portal Pages (Login required)
- `/patient` - Patient dashboard
- `/patient/appointments` - Patient appointments
- `/patient/results` - Medical results
- `/patient/profile` - Profile
- `/patient/offers` - Available offers
- `/patient/camps` - Available camps

#### Admin Pages (Permission required)
- `/admin` - Main dashboard
- `/admin/bookings` - Bookings management
  - `/admin/bookings/leads` - Lead management
  - `/admin/bookings/appointments` - Appointment management
  - `/admin/bookings/offer-leads` - Offer leads management
  - `/admin/bookings/camp-registrations` - Camp registrations management
  - `/admin/bookings/customers` - Customer records management
  - `/admin/bookings/patient-results` - Patient portal results management
  - `/admin/bookings/tasks` - Task management
- `/admin/reports` - Reports and analytics
  - `/admin/reports/reports` - General reports
  - `/admin/reports/analytics` - Analytics
  - `/admin/reports/bi` - Business Intelligence (BI)
  - `/admin/reports/camp-stats` - Camp statistics
  - `/admin/reports/pwa-stats` - PWA statistics
- `/admin/whatsapp` - WhatsApp management
  - `/admin/whatsapp/dashboard` - WhatsApp dashboard
  - `/admin/whatsapp/conversations` - Conversations
  - `/admin/whatsapp/templates` - Message templates
  - `/admin/whatsapp/broadcast` - Broadcast messaging
  - `/admin/whatsapp/auto-reply` - Auto-replies
  - `/admin/whatsapp/analytics` - Analytics
  - `/admin/whatsapp/compliance` - Compliance
  - `/admin/whatsapp/account-health` - Account health
- `/admin/campaigns` - Campaigns and projects management
  - `/admin/campaigns/campaigns` - Campaign management
  - `/admin/campaigns/projects` - Project management
  - `/admin/campaigns/review-approval` - Review and approval
- `/admin/communications` - Communications management
  - `/admin/communications/messages` - Messages management
  - `/admin/communications/message-settings` - Message settings
- `/admin/teams` - Teams management
  - `/admin/teams/digital-marketing` - Digital marketing team
  - `/admin/teams/media` - Media unit
  - `/admin/teams/field-marketing` - Field marketing
  - `/admin/teams/customer-service` - Customer service
- `/admin/content` - Content management
  - `/admin/content/content` - Content management
  - `/admin/content/publishing` - Publishing management
- `/admin/users` - Users management
  - `/admin/users/users` - Users management
- `/admin/system` - System management
  - `/admin/system/updates` - Updates management
  - `/admin/system/status` - System status
  - `/admin/system/backups` - Backups
- `/admin/settings` - Settings
- `/admin/profile` - Profile
  - `/admin/whatsapp/analytics` - Analytics
  - `/admin/whatsapp/compliance` - Compliance
  - `/admin/whatsapp/account-health` - Account health
- `/admin/message-settings` - Message settings
- `/admin/tracking` - Tracking settings
- `/admin/pwa-stats` - PWA statistics

### 🔐 Permission System

#### Roles
- **Admin** - Full system management permissions
- **Manager** - Limited management permissions
- **Team Leader** - Team leader with team permissions
- **Staff** - Staff with limited permissions
- **Viewer** - Viewer with read-only permissions
- **User** - Regular user

#### Access Request System
- New users can request access
- Admins review and approve/reject requests
- Owner is notified when new requests are submitted

### 📊 Database

#### Main Tables (40+ tables)

**Users & Permissions:**
- `users` - Authorized users
- `accessRequests` - Access requests
- `userPreferences` - User preferences
- `teams` - Teams
- `teamMembers` - Team members

**Campaigns & Marketing:**
- `campaigns` - Marketing campaigns
- `leads` - Potential customers
- `leadStatusHistory` - Lead status change history
- `campaignOffers` - Campaign-offer links
- `campaignCamps` - Campaign-camp links
- `campaignDoctors` - Campaign-doctor links

**Appointments & Bookings:**
- `doctors` - Doctor information
- `appointments` - Doctor appointments
- `offerLeads` - Offer bookings
- `campRegistrations` - Camp registrations

**Offers & Camps:**
- `offers` - Special medical offers
- `camps` - Medical camps

**Task Management:**
- `projects` - Projects
- `tasks` - Tasks
- `taskComments` - Task comments
- `taskAttachments` - Task attachments
- `taskDeliverables` - Task deliverables

**WhatsApp:**
- `whatsapp_conversations` - Conversations
- `whatsapp_messages` - Messages
- `whatsapp_templates` - Message templates
- `whatsapp_broadcasts` - Broadcast campaigns
- `whatsapp_auto_replies` - Auto-replies
- `whatsapp_analytics` - WhatsApp analytics
- `whatsapp_notifications` - WhatsApp notifications
- `whatsapp_blocked_numbers` - Blocked numbers
- `whatsapp_account_alerts` - Account alerts
- `whatsapp_security_events` - Security events
- `whatsapp_phone_quality` - Phone number quality
- `whatsapp_user_opt_ins` - User opt-ins
- `whatsapp_webhook_events` - Webhook events
- `whatsapp_contacts` - Contacts
- `whatsapp_orders` - Orders
- `whatsapp_products` - Products
- `whatsapp_referrals` - Referrals
- `whatsapp_reactions` - Reactions
- `whatsapp_transactions` - Transactions

**Patient Portal:**
- `patients` - Patients
- `patientOtps` - OTP codes
- `patientResults` - Patient results

**Tracking & Analytics:**
- `visitSessions` - Visit sessions
- `trackingEvents` - Tracking events
- `pwaInstalls` - PWA installs
- `abandonedForms` - Abandoned forms

**Other:**
- `comments` - Comments on records
- `followUpTasks` - Follow-up tasks
- `auditLogs` - Audit logs
- `savedFilters` - Saved filters
- `sharedColumnTemplates` - Shared column templates
- `messageSettings` - Message settings
- `messageTemplates` - Message templates
- `scheduled_messages` - Scheduled messages
- `quick_replies` - Quick replies
- `saved_searches` - Saved searches
- `settings` - System settings

### 🔧 Available Commands

```bash
# Development
pnpm dev              # Run development mode
pnpm build            # Build for production
pnpm start            # Run production

# Database
pnpm db:push          # Push changes to database
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm check            # TypeScript check
pnpm format           # Format code with Prettier
pnpm test             # Run tests

# Scripts
pnpm db:seed          # Seed initial data (if available)
```

### 📚 Documentation

- **[Installation Guide](INSTALLATION_GUIDE.md)** - Detailed installation instructions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[User Guide](userGuide.md)** - Detailed user manual
- **[WhatsApp Guide](docs/WHATSAPP_INTEGRATION_GUIDE.md)** - WhatsApp integration
- **[Security Policy](SECURITY.md)** - Security information
- **[Changelog](CHANGELOG.md)** - Version history

### 🤝 Contributing

We welcome all contributions! Please read the [Contributing Guide](CONTRIBUTING.md) before starting.

### 📝 License

This project is licensed under the [MIT License](LICENSE).

### 👥 Team

- **Development**: Abdullkwy Alhatef
- **Client**: Saudi German Hospital - Sana'a

### 📞 Support

For support, please contact:
- Email: abood22828@gmail.com
- GitHub Issues: [Create new issue](https://github.com/abood22828/sgh-crm-portal/issues)

### 🙏 Acknowledgments

- Thanks to Saudi German Hospital - Sana'a team for their trust and cooperation
- Thanks to all contributors of open-source projects used

---

<div align="center">

**نرعاكم كأهالينا - Caring like family**

Made with ❤️ by Abdullkwy Alhatef

</div>