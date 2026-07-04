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
│       │   ├── layout/        # مكونات التخطيط (DashboardLayout, DashboardSidebar, Navbar, Footer, PageLayout, DashboardShell, ProtectedRoute)
│       │   ├── dashboard/     # مكونات لوحة التحكم (DashboardCharts, DetailedStatsCards, QuickPatientSearch, SourceAnalytics, RecentActivity)
│       │   ├── booking/       # مكونات الحجز (AppointmentCard, AppointmentFilters, AppointmentStatsCards, AppointmentTableDesktop, AppointmentsTab, PrintReceipt)
│       │   ├── lead/          # مكونات العملاء المحتملين (LeadCard, LeadStatsCards, LeadsTab)
│       │   ├── offer/         # مكونات العروض (OfferLeadCard, OfferLeadsManagement, OffersManagement)
│       │   ├── camp/          # مكونات المخيمات (CampRegistrationCard, CampRegistrationsManagement, CampsManagement)
│       │   ├── whatsapp/      # مكونات واتساب (WhatsAppStatusBadge)
│       │   ├── table/         # مكونات الجداول (DataTableToolbar, DataTableWrapper, ResizableTable, Pagination, ColumnVisibility, TableSkeleton)
│       │   ├── form/          # مكونات النماذج (ImageUpload, MultiSelect, DateRangePicker, ManualRegistrationForm)
│       │   ├── notification/  # مكونات الإشعارات (NotificationCenter, PendingRequestsNotification, CommentCount)
│       │   ├── ui/            # مكونات واجهة المستخدم (shadcn/ui)
│       │   └── ...            # مكونات أخرى
│       ├── hooks/             # الخطافات المخصصة
│       │   ├── table/         # هوكات الجداول (useTableFeatures, useFilterUtils, usePagination)
│       │   ├── form/          # هوكات النماذج (useFormValidation, useImageUpload, usePhoneFormat, useAbandonedFormTracking)
│       │   ├── ui/            # هوكات واجهة المستخدم (useMobile, useConfirmDialog, useSidebarState, useComposition)
│       │   ├── data/          # هوكات البيانات (useDebounce, usePersistFn, useSlugGenerator, useStatusLabels, usePatientStorage, useRecentlyUsed)
│       │   ├── integrations/   # هوكات التكامل (useSSE, useWhatsAppSSE, usePWAInstall, useLicense, useUpdateChecker, useNotificationSound)
│       │   └── export/        # هوكات التصدير (useExportUtils, useFormatDate)
│       ├── contexts/          # سياقات React
│       ├── lib/               # الأدوات والإعدادات
│       │   ├── export/        # أدوات التصدير (advancedExport, exportToExcel, exportUtils)
│       │   ├── tracking/      # أدوات التتبع (tracking)
│       │   ├── api/           # إعدادات API (trpc)
│       │   └── utils.ts       # أدوات عامة
│       └── _core/             # المكونات الأساسية
├── server/                     # تطبيق الخادم
│   ├── _core/                 # الإعداد الأساسي (OAuth, tRPC)
│   ├── routers/               # tRPC routers (28+ router)
│   ├── services/              # خدمات الأعمال
│   ├── database/              # وظائف قاعدة البيانات
│   │   └── db/                # وظائف قاعدة البيانات
│   ├── config/                # ملفات الإعداد
│   ├── tasks/                 # المهام المجدولة
│   │   └── cron/              # المهام المجدولة
│   ├── integrations/          # التكاملات الخارجية
│   │   ├── queues/            # طوابير BullMQ
│   │   └── webhooks/          # معالجات webhooks
│   ├── api/                   # واجهات برمجة التطبيقات
│   └── assets/                # الأصول الثابتة
├── shared/                     # الكود المشترك
│   ├── _core/                 # الأساسيات المشتركة
│   └── const.ts               # الثوابت المشتركة
├── .github/                    # GitHub Actions workflows
│   └── workflows/              # CI/CD pipelines
│       ├── ci.yml             # Lint, Type Check, Test, Build
│       └── deploy.yml         # Deployment workflow
├── deploy/                     # Deployment configurations
│   ├── Dockerfile             # Docker image
│   ├── docker-compose.yml     # Docker Compose
│   ├── nginx/                 # Nginx configuration
│   └── monitoring/            # Monitoring setup
├── .eslintrc.js               # إعدادات ESLint
├── .prettierrc                # إعدادات Prettier
├── .editorconfig              # إعدادات المحرر
├── .nvmrc                     # إصدار Node.js
├── SECURITY.md                # سياسة الأمان
├── Dockerfile                 # Docker image
├── .dockerignore              # Docker ignore file
├── drizzle/                    # مخطط قاعدة البيانات
│   ├── schema.ts              # تعريف الجداول (40+ جدول)
│   ├── relations.ts           # العلاقات بين الجداول
│   └── meta/                  # ملفات الترحيل
├── docs/                       # الوثائق
│   ├── guides/                # أدلة المستخدم
│   ├── architecture/          # البنية المعمارية
│   ├── api/                   # توثيق API
│   ├── performance/           # الأداء
│   ├── analysis/              # التحليلات والتقارير
│   ├── saas/                  # توثيق SaaS
│   ├── whatsapp/              # توثيق واتساب
│   ├── implementation/        # خطوات التنفيذ
│   ├── archive/               # الأرشيف القديم
│   ├── CODE_STYLE_GUIDELINES.md
│   ├── COMPONENTS.md
│   ├── CONTRIBUTING.md
│   ├── CONTRIBUTING_GUIDELINES.md
│   ├── DOCUMENTATION_POLICY.md
│   ├── INSTALLATION_GUIDE.md
│   ├── SECURITY.md
│   └── ...
├── scripts/                    # سكريبتات المساعدة
│   ├── create-admin-local.mjs
│   ├── create-admin.mjs
│   ├── seed-all-tables.mjs
│   ├── seed-database.mjs
│   ├── seed-doctors.mjs
│   ├── finalize.sh
│   └── ...
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
  - `/admin/whatsapp/admin` - لوحة تحكم WhatsApp
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
pnpm lint             # فحص الكود بـ ESLint
pnpm test             # تشغيل الاختبارات

# Docker
pnpm docker:build     # بناء صورة Docker
pnpm docker:up        # تشغيل الحاويات
pnpm docker:down      # إيقاف الحاويات

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

**ملاحظة حول الترخيص:** يحتوي المستودع على ملفات تتعلق بحزمة توزيع مرخّصة تجارياً (انظر `deploy/`، `license.json` و`license-keys/`). رخصة MIT في جذر المستودع تغطي الأجزاء المفتوحة المصدر؛ ومع ذلك، أجزاء التوزيع والنشر قد تخضع لشروط ترخيص تجارية داخلية موصوفة في `deploy/README.md` و`docs/LICENSE_GUIDE.md`. إذا أردت، أستطيع اقتراح صيغة واضحة للفصل بين الأجزاء المفتوحة والمحمية وتحديث الملفات المناسبة.

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

A comprehensive medical CRM platform developed specifically for Saudi German Hospital - Sana'a. The system provides complete management of marketing campaigns, doctor appointments, patient portal[...]

(English section truncated in this commit for brevity — content unchanged except for the clone URL and the license clarification in Arabic above.)
