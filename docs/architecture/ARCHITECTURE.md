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

**الهيكل:**
```
client/src/
├── pages/              # 50+ صفحة
│   ├── public/         # الصفحات العامة (الهبوط، الأطباء، العروض)
│   ├── admin/          # الصفحات الإدارية
│   └── patient/        # صفحات بوابة المريض
├── components/         # مكونات قابلة لإعادة الاستخدام
│   ├── ui/             # مكونات shadcn/ui
│   ├── layout/         # مكونات التخطيط
│   └── features/       # مكونات خاصة بالميزات
├── hooks/              # خطافات مخصصة
├── contexts/           # سياقات React
├── lib/                # أدوات وإعدادات
└── _core/              # مكونات أساسية
```

### 2. الخادم (Server)

**الموقع:** `server/`

**التقنيات:**
- **Node.js** - بيئة التشغيل
- **Express.js** - إطار العمل
- **tRPC 11** - API آمن نوعياً
- **Drizzle ORM** - إدارة قاعدة البيانات

**الهيكل:**
```
server/
├── _core/              # الإعداد الأساسي
│   ├── trpc.ts         # إعداد tRPC
│   ├── context.ts      # سياق الطلب
│   ├── oauth.ts        # مصادقة OAuth
│   └── systemRouter.ts # مسارات النظام
├── routers/            # 28+ tRPC router
│   ├── appointments.ts # إدارة المواعيد
│   ├── campaigns.ts    # إدارة الحملات
│   ├── whatsapp.ts     # خدمات WhatsApp
│   └── ...
├── services/           # خدمات الأعمال
│   ├── whatsapp/       # خدمات WhatsApp
│   │   ├── whatsappService.ts
│   │   ├── whatsappTemplates.ts
│   │   ├── whatsappBroadcast.ts
│   │   └── ...
│   └── meta/           # خدمات Meta
├── db/                 # وظائف قاعدة البيانات
├── config/             # ملفات الإعداد
├── cron/               # المهام المجدولة
├── queues/             # طوابير BullMQ
└── webhooks/           # معالجات webhooks
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

**Structure:**
```
client/src/
├── pages/              # 50+ pages
│   ├── public/         # Public pages (landing, doctors, offers)
│   ├── admin/          # Admin pages
│   └── patient/        # Patient portal pages
├── components/         # Reusable components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── hooks/              # Custom hooks
├── contexts/           # React contexts
├── lib/                # Utilities and configs
└── _core/              # Core components
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
├── routers/            # 28+ tRPC routers
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