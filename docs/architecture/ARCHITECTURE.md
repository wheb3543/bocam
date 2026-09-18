# بنية النظام | System Architecture

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 📐 نظرة عامة على البنية المعمارية

منصة SGH CRM Portal مبنية على بنية معمارية حديثة تعتمد على **Full-Stack TypeScript** مع فصل واضح بين الواجهة الأمامية والخلفية، واستخدام **tRPC** للاتصال الآمن نوعياً بينهما.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client (React 19)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Public    │  │   Admin     │  │   Patient   │  │    PWA      │    │
│  │   Pages     │  │   Dashboard │  │   Portal    │  │   Support   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    tRPC Client (Type-Safe)                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Server (Node.js + Express)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   tRPC      │  │   OAuth     │  │  Webhooks   │  │   Static    │    │
│  │   Router    │  │   Routes    │  │  (WhatsApp) │  │   Files     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        Services Layer                             │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐     │    │
│  │  │ WhatsApp  │  │   Meta    │  │   Email   │  │   Queue   │     │    │
│  │  │ Services  │  │ Services  │  │ Services  │  │ (BullMQ)  │     │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Data Layer                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │   MySQL     │  │   Redis     │  │   Drizzle   │                     │
│  │  Database   │  │   Cache     │  │    ORM      │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        External APIs                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │  WhatsApp   │  │    Meta     │  │    Email    │                     │
│  │  Cloud API  │  │ Graph API   │  │  Provider   │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ مكونات النظام

### 1. الواجهة الأمامية (Client)

**الموقع:** `client/src/`

**التقنيات:**
- **React 19** - مكتبة واجهة المستخدم
- **TypeScript 5.9** - لغة البرمجة
- **Tailwind CSS 4** - التصميم
- **TanStack Query** - إدارة حالة الخادم
- **Wouter** - التوجيه
- **shadcn/ui** - مكونات الواجهة

**الهيكل المعماري (معمارية معيارية ثلاثية الطبقات):**
```
client/src/
├── core/               # النواة التأسيسية المشتركة (@core/*)
│   ├── api/            # تهيئة عميل tRPC والمصادقة
│   ├── contexts/       # سياقات الثيم واللغة وحالة الاتصال
│   ├── components/ui/  # مكتبة عناصر الواجهة الأساسية (Buttons, Dialogs, etc.)
│   ├── feedback/       # التغذية الراجعة، الخصوصية، ومؤشرات الشبكة
│   ├── animations/     # المؤثرات الحركية والعدادات الموحدة
│   ├── pages/          # صفحات النظام العامة (NotFound, Unauthorized, Offline)
│   ├── pwa/            # إدارة تطبيق الويب التقدمي (PWAManager)
│   ├── hooks/          # الخطافات العامة الشاملة للنظام
│   └── lib/            # الأدوات المساعدة والمكتبات المشتركة
├── apps/               # البوابات الوظيفية الأربع للمنظومة (@apps/*)
│   ├── public/         # البوابة التعريفية للمستشفى (5 وحدات وظيفية)
│   ├── patient-portal/ # بوابة المريض الرقمية للنتائج والمواعيد (5 وحدات)
│   ├── doctor-portal/  # بوابة الكادر الطبي والعيادات
│   └── admin/          # المنظومة الإدارية والتشغيلية (10 وحدات وظيفية)
│       ├── auth/       # المصادقة الإدارية وجلسات الموظفين
│       ├── layout/     # هيكل لوحة التحكم، الشريط الجانبي، والتنقل
│       ├── shared/     # المكونات والخطافات المشتركة للإدارة
│       └── modules/    # الوحدات الوظيفية العشر لإدارة المستشفى (01-10)
├── App.tsx             # الموجه المركزي للتطبيق العام
├── main.tsx            # نقطة انطلاق التطبيق في الـ DOM
└── index.css           # ملف الأنماط والمتغيرات التصميمية المركزية
```

### 2. الخادم (Server)

**الموقع:** `server/`

**التقنيات:**
- **Node.js** - بيئة التشغيل
- **Express.js** - إطار العمل
- **tRPC 11** - API آمن نوعياً
- **Drizzle ORM** - إدارة قاعدة البيانات
- **BullMQ & Redis** - نظام الطوابير والتخزين المؤقت

**المعمارية المعيارية للخادم (Modular Server Architecture):**
تعتمد معمارية الخادم على بنية معيارية ثلاثية الطبقات متناظرة مع الواجهة الأمامية:
1. **النواة التأسيسية الصلبة (`server/_core/`)**: خادم Express، محرك tRPC، حارس قاعدة البيانات (`DatabaseGuard`)، مسجل الأحداث المهيكل (`logger`)، ومحددات المعدل.
2. **الأنظمة الفرعية المستقلة (`server/subsystems/`)**: أنظمة مستقلة تماماً تشمل النسخ الاحتياطي (`backup/`)، فاحص التحديثات (`auto-update/`)، والترخيص الرقمي المشفر (`licensing/`).
3. **الوحدات النطاقية الثماني (`server/modules/`)**: متناظرة تماماً مع بوابات الإدارة في الواجهة الأمامية من 01 حتى 10، وتجمع الموجهات والخدمات الخاصة بكل نطاق.
4. **واجهات API المصنفة (`server/api/`)**: مصنفة حسب الغرض التشغيلي: المهام المجدولة (`cron/`)، خطافات الويب (`webhooks/`)، المصادقة (`oauth/`)، تكاملات ميتا (`meta/`)، ورفع الملفات (`upload/`).
5. **طبقة البنية التحتية المشتركة**: تشمل مستودعات وقواعد البيانات (`database/`)، التكاملات المباشرة (`integrations/`)، والخدمات المشتركة (`services/`).
6. **التوافق التام وجسور الترحيل**: يستورد موجه الخادم الرئيسي `server/routers/routers.ts` مباشرة من وحدات `server/modules/*`، مع إبقاء شبكة جسور التوافق المرحلية (`Re-export Bridges`) لضمان عدم انقطاع أي استيرادات سابقة.

> 📖 للمزيد من التفاصيل المعمارية الدقيقة وجداول المكونات، راجع: **[المعمارية المعيارية للخادم الخلفي (docs/architecture/SERVER_MODULAR_ARCHITECTURE.md)](./SERVER_MODULAR_ARCHITECTURE.md)**.

**الهيكل:**
```
server/
├── _core/                      # النواة التأسيسية الصلبة (خادم Express، tRPC، السجلات، الحراسة)
├── subsystems/                 # الأنظمة الفرعية المستقلة (backup, auto-update, licensing)
│   ├── backup/                 # نظام النسخ الاحتياطي والاستعادة الذرية
│   ├── auto-update/            # محرك فحص وتطبيق التحديثات وقفل الصيانة
│   └── licensing/              # إدارة التراخيص الرقمية وبصمة العتاد ومركز الدعم
├── modules/                    # الوحدات النطاقية الثماني المتناظرة مع الواجهة (01 إلى 10)
│   ├── 01-booking-scheduling/  # الحجوزات، المواعيد، العروض، والمخيمات
│   ├── 02-crm-patients/        # إدارة وسجلات المرضى، الملف الطبي، ونتائج المختبر
│   ├── 03-omni-inbox/          # محادثات واتساب، الصندوق الاجتماعي، والعمليات
│   ├── 04-marketing-publishing/# الحملات الإعلانية، المشاريع، وتتبع العائد (ROAS)
│   ├── 05-cms-portal/          # بوابة المحتوى الطبي، المقالات، والوسائط
│   ├── 06-tasks-projects/      # مهام الموظفين، تقييم الأداء، وفرق العمل
│   ├── 07-users-rbac/          # إدارة المستخدمين، الأدوار، ومصفوفة الصلاحيات
│   └── 10-system-settings/     # إعدادات النظام، سجلات التدقيق، والتقارير
├── api/                        # واجهات API المصنفة
│   ├── cron/                   # مسارات المهام المجدولة المحمية
│   ├── webhooks/               # مستقبلات إشعارات Meta و WhatsApp
│   ├── oauth/                  # تدفقات مصادقة المنصات الخارجية
│   ├── meta/                   # عملاء Meta Graph API و Cloud API
│   └── upload/                 # مسارات وتصاريح رفع الوسائط والملفات
├── database/                   # طبقة الاتصال بقاعدة البيانات ومستودعات الاستعلام
├── routers/                    # موجه الخادم الرئيسي tRPC وجسور التوافق الخلفي
├── services/                   # خدمات العمليات المشتركة (Redis, PubSub, Storage, Notifications)
├── integrations/               # تكاملات خارجية (Meta, Webhooks, SSE, Queues)
├── tasks/                      # طوابير المعالجة والمهام المجدولة (cron, queues)
└── assets/                     # الأصول الثابتة والخطوط ومفاتيح التشفير
```


### 3. قاعدة البيانات (Database)

**الموقع:** `drizzle/`

**التقنيات:**
- **MySQL/TiDB** - قاعدة البيانات الرئيسية
- **Drizzle ORM** - إدارة قاعدة البيانات

**الهيكل:**
```
drizzle/
├── schema.ts           # تعريف 40+ جدول
├── relations.ts        # العلاقات بين الجداول
└── meta/               # ملفات الترحيل
```

**الجداول الرئيسية:**

| الفئة | الجداول |
|-------|---------|
| **المستخدمين** | users, accessRequests, userPreferences, teams, teamMembers |
| **الحملات** | campaigns, leads, leadStatusHistory, campaignOffers, campaignCamps, campaignDoctors |
| **المواعيد** | doctors, appointments, offerLeads, campRegistrations |
| **العروض** | offers, camps |
| **المهام** | projects, tasks, taskComments, taskAttachments, taskDeliverables |
| **WhatsApp** | whatsapp_conversations, whatsapp_messages, whatsapp_templates, whatsapp_broadcasts, whatsapp_auto_replies, whatsapp_analytics, whatsapp_notifications, whatsapp_blocked_numbers, whatsapp_account_alerts, whatsapp_security_events, whatsapp_phone_quality, whatsapp_user_opt_ins, whatsapp_webhook_events, whatsapp_contacts, whatsapp_orders, whatsapp_products, whatsapp_referrals, whatsapp_reactions, whatsapp_transactions |
| **بوابة المريض** | patients, patientOtps, patientResults |
| **التتبع** | visitSessions, trackingEvents, pwaInstalls, abandonedForms |
| **أخرى** | comments, followUpTasks, auditLogs, savedFilters, sharedColumnTemplates, messageSettings, messageTemplates, scheduled_messages, quick_replies, saved_searches, settings |

---

## 🔄 تدفق البيانات

### 1. مصادقة المستخدم

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  OAuth   │────▶│  Server  │────▶│ Database │
│  Login   │     │ Provider │     │  Verify  │     │  Create  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                     │                │
                     ▼                ▼
               ┌──────────┐     ┌──────────┐
               │  JWT     │     │ Session  │
               │  Token   │     │  Cookie  │
               └──────────┘     └──────────┘
```

### 2. طلب tRPC

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ React    │────▶│ tRPC     │────▶│ tRPC     │────▶│ Service  │
│ Component│     │ Client   │     │ Router   │     │ Layer    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                     │                │                │
                     ▼                ▼                ▼
               ┌──────────┐     ┌──────────┐     ┌──────────┐
               │ Type     │     │ Auth     │     │ Database │
               │ Safety   │     │ Check    │     │ Query    │
               └──────────┘     └──────────┘     └──────────┘
```

### 3. رسالة WhatsApp

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin   │────▶│ tRPC     │────▶│ WhatsApp │────▶│  Queue   │
│  Action  │     │ Router   │     │ Service  │     │ (BullMQ) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
                                                        ▼
                                                 ┌──────────┐
                                                 │ WhatsApp │
                                                 │ Cloud    │
                                                 │ API      │
                                                 └──────────┘
```

---

## 🔐 الأمان

### المصادقة

1. **OAuth 2.0** - المصادقة عبر Manus OAuth
2. **JWT Tokens** - رموز أمنية مع تشفير مناسب
3. **Session Cookies** - ملفات تعريف ارتباط آمنة
4. **CSRF Protection** - حماية من هجمات CSRF

### التفويض

1. **نظام الصلاحيات** - أدوار متعددة (Admin, Manager, Team Leader, Staff, Viewer)
2. **حماية المسارات** - التحقق من الصلاحيات في كل مسار
3. **حماية البيانات** - الوصول إلى البيانات حسب الصلاحيات

### حماية البيانات

1. **HTTPS** - جميع الاتصالات مشفرة
2. **تشفير كلمات المرور** - استخدام bcrypt
3. **حماية SQL Injection** - استخدام Drizzle ORM
4. **تنظيف المدخلات** - التحقق من جميع المدخلات

---

## 📊 الأداء

### التخزين المؤقت

1. **Redis** - للتخزين المؤقت للجلسات والبيانات
2. **TanStack Query** - للتخزين المؤقت على الواجهة الأمامية
3. **Static Assets** - ملفات ثابتة مع CDN

### تحسينات الأداء

1. **Code Splitting** - تقسيم الكود
2. **Lazy Loading** - التحميل الكسول
3. **Database Indexing** - فهارس قاعدة البيانات
4. **Query Optimization** - تحسين الاستعلامات

---

## 🔄 التطوير والنشر

### بيئة التطوير

```bash
pnpm dev          # تشغيل وضع التطوير
pnpm db:push      # تحديث قاعدة البيانات
pnpm check        # فحص TypeScript
pnpm format       # تنسيق الكود
pnpm test         # تشغيل الاختبارات
```

### بيئة الإنتاج

```bash
pnpm build        # بناء للإنتاج
pnpm start        # تشغيل الإنتاج
```

### النشر

1. **البناء:** `pnpm build`
2. **النشر:** رفع الملفات إلى الخادم
3. **قاعدة البيانات:** تشغيل الترحيلات
4. **البيئة:** إعداد متغيرات البيئة

---

<a name="english"></a>

## 📐 Architecture Overview

SGH CRM Portal is built on a modern architecture based on **Full-Stack TypeScript** with clear separation between frontend and backend, using **tRPC** for type-safe communication.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client (React 19)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Public    │  │   Admin     │  │   Patient   │  │    PWA      │    │
│  │   Pages     │  │   Dashboard │  │   Portal    │  │   Support   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    tRPC Client (Type-Safe)                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Server (Node.js + Express)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   tRPC      │  │   OAuth     │  │  Webhooks   │  │   Static    │    │
│  │   Router    │  │   Routes    │  │  (WhatsApp) │  │   Files     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        Services Layer                             │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐     │    │
│  │  │ WhatsApp  │  │   Meta    │  │   Email   │  │   Queue   │     │    │
│  │  │ Services  │  │ Services  │  │ Services  │  │ (BullMQ)  │     │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Data Layer                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │   MySQL     │  │   Redis     │  │   Drizzle   │                     │
│  │  Database   │  │   Cache     │  │    ORM      │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        External APIs                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │  WhatsApp   │  │    Meta     │  │    Email    │                     │
│  │  Cloud API  │  │ Graph API   │  │  Provider   │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Components

### 1. Frontend (Client)

**Location:** `client/src/`

**Technologies:**
- **React 19** - UI library
- **TypeScript 5.9** - Programming language
- **Tailwind CSS 4** - Styling
- **TanStack Query** - Server state management
- **Wouter** - Routing
- **shadcn/ui** - UI components

**Structure (3-Tier Modular Architecture):**
```
client/src/
├── core/               # Shared Core Foundation (@core/*)
│   ├── api/            # tRPC client configuration and auth
│   ├── contexts/       # Theme, language, network contexts
│   ├── components/ui/  # Shared primitive UI components (Buttons, Dialogs, etc.)
│   ├── feedback/       # Feedback modals, cookie/privacy banners, network badges
│   ├── animations/     # Reusable motion wrappers and counter animations
│   ├── pages/          # System generic pages (NotFound, Unauthorized, Offline)
│   ├── pwa/            # Progressive Web App management (PWAManager)
│   ├── hooks/          # System-wide reusable hooks
│   └── lib/            # Common utilities and helper libraries
├── apps/               # Functional Portals (@apps/*)
│   ├── public/         # Public Institutional Portal (5 modules)
│   ├── patient-portal/ # Digital Patient Portal (5 modules)
│   ├── doctor-portal/  # Doctor & Medical Staff Portal
│   └── admin/          # Hospital Operations & Admin Workspace (10 modules)
│       ├── auth/       # Admin authentication & session handling
│       ├── layout/     # Persistent shell, sidebar, tabs, and navigation
│       ├── shared/     # Admin-wide shared components, tables, and hooks
│       └── modules/    # 10 cohesive operational modules (01 to 10)
├── App.tsx             # Application-level routing & global provider tree
├── main.tsx            # DOM root bootstrapping & queryClient
└── index.css           # Central stylesheet & OKLCH design tokens
```

### 2. Backend (Server)

**Location:** `server/`

**Technologies:**
- **Node.js** - Runtime environment
- **Express.js** - Server framework
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - Database management

**Structure:**
```
server/
├── _core/              # Core setup
│   ├── trpc.ts         # tRPC setup
│   ├── context.ts      # Request context
│   ├── oauth.ts        # OAuth authentication
│   └── systemRouter.ts # System routes
├── routers/            # tRPC routers grouped in appRouter by domain
│   ├── appointments.ts # Appointment management
│   ├── campaigns.ts    # Campaign management
│   ├── whatsapp.ts     # WhatsApp services
│   └── ...
├── services/           # Business services
│   ├── whatsapp/       # WhatsApp services
│   │   ├── whatsappService.ts
│   │   ├── whatsappTemplates.ts
│   │   ├── whatsappBroadcast.ts
│   │   └── ...
│   └── meta/           # Meta services
├── db/                 # Database functions
├── config/             # Configuration files
├── cron/               # Scheduled tasks
├── queues/             # BullMQ queues
└── webhooks/           # Webhook handlers
```

### 3. Database

**Location:** `drizzle/`

**Technologies:**
- **MySQL/TiDB** - Primary database
- **Drizzle ORM** - Database management

**Structure:**
```
drizzle/
├── schema.ts           # 40+ table definitions
├── relations.ts        # Table relations
└── meta/               # Migration files
```

**Main Tables:**

| Category | Tables |
|----------|--------|
| **Users** | users, accessRequests, userPreferences, teams, teamMembers |
| **Campaigns** | campaigns, leads, leadStatusHistory, campaignOffers, campaignCamps, campaignDoctors |
| **Appointments** | doctors, appointments, offerLeads, campRegistrations |
| **Offers** | offers, camps |
| **Tasks** | projects, tasks, taskComments, taskAttachments, taskDeliverables |
| **WhatsApp** | whatsapp_conversations, whatsapp_messages, whatsapp_templates, whatsapp_broadcasts, whatsapp_auto_replies, whatsapp_analytics, whatsapp_notifications, whatsapp_blocked_numbers, whatsapp_account_alerts, whatsapp_security_events, whatsapp_phone_quality, whatsapp_user_opt_ins, whatsapp_webhook_events, whatsapp_contacts, whatsapp_orders, whatsapp_products, whatsapp_referrals, whatsapp_reactions, whatsapp_transactions |
| **Patient Portal** | patients, patientOtps, patientResults |
| **Tracking** | visitSessions, trackingEvents, pwaInstalls, abandonedForms |
| **Other** | comments, followUpTasks, auditLogs, savedFilters, sharedColumnTemplates, messageSettings, messageTemplates, scheduled_messages, quick_replies, saved_searches, settings |

---

## 🔄 Data Flow

### 1. User Authentication

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  OAuth   │────▶│  Server  │────▶│ Database │
│  Login   │     │ Provider │     │  Verify  │     │  Create  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                     │                │
                     ▼                ▼
               ┌──────────┐     ┌──────────┐
               │  JWT     │     │ Session  │
               │  Token   │     │  Cookie  │
               └──────────┘     └──────────┘
```

### 2. tRPC Request

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ React    │────▶│ tRPC     │────▶│ tRPC     │────▶│ Service  │
│ Component│     │ Client   │     │ Router   │     │ Layer    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                     │                │                │
                     ▼                ▼                ▼
               ┌──────────┐     ┌──────────┐     ┌──────────┐
               │ Type     │     │ Auth     │     │ Database │
               │ Safety   │     │ Check    │     │ Query    │
               └──────────┘     └──────────┘     └──────────┘
```

### 3. WhatsApp Message

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin   │────▶│ tRPC     │────▶│ WhatsApp │────▶│  Queue   │
│  Action  │     │ Router   │     │ Service  │     │ (BullMQ) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
                                                        ▼
                                                 ┌──────────┐
                                                 │ WhatsApp │
                                                 │ Cloud    │
                                                 │ API      │
                                                 └──────────┘
```

---

## 🔐 Security

### Authentication

1. **OAuth 2.0** - Authentication via Manus OAuth
2. **JWT Tokens** - Security tokens with proper encryption
3. **Session Cookies** - Secure session cookies
4. **CSRF Protection** - CSRF attack protection

### Authorization

1. **Permission System** - Multiple roles (Admin, Manager, Team Leader, Staff, Viewer)
2. **Route Protection** - Permission verification on every route
3. **Data Protection** - Data access based on permissions

### Data Protection

1. **HTTPS** - All connections encrypted
2. **Password Hashing** - Using bcrypt
3. **SQL Injection Protection** - Using Drizzle ORM
4. **Input Sanitization** - Validation of all inputs

---

## 📊 Performance

### Caching

1. **Redis** - For session and data caching
2. **TanStack Query** - For frontend caching
3. **Static Assets** - Static files with CDN

### Performance Optimizations

1. **Code Splitting** - Code splitting
2. **Lazy Loading** - Lazy loading
3. **Database Indexing** - Database indexes
4. **Query Optimization** - Query optimization

---

## 🔄 Development & Deployment

### Development Environment

```bash
pnpm dev          # Run development mode
pnpm db:push      # Update database
pnpm check        # TypeScript check
pnpm format       # Format code
pnpm test         # Run tests
```

### Production Environment

```bash
pnpm build        # Build for production
pnpm start        # Run production
```

### Deployment

1. **Build:** `pnpm build`
2. **Deploy:** Upload files to server
3. **Database:** Run migrations
4. **Environment:** Set environment variables

---

<div align="center">

**نرعاكم كأهالينا - Caring like family**

Made with ❤️ by Abdullkwy Alhatef

</div>