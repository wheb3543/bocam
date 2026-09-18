# نظام بوكام BOCAM للمستشفيات | منصة إدارة متكاملة

<div align="center">

**نظام سحابي، وهو أحد أنظمة بوكام المتخصصة في إدارة القنوات الرقمية للشركات والمؤسسات في مختلف القطاعات، وكذلك إدارة العمليات الداخلية وإدارة الأقسام والموظفين عبر نظام إدارة المهام، وإدارة علاقات العملاء وإدارة التسويق وإدارة منصات التواصل الاجتماعي والموقع الإلكتروني.**

**BOCAM Cloud Medical System - Comprehensive Management Platform**

[![License: Dual](https://img.shields.io/badge/License-MIT%20%26%20Proprietary-orange.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.13.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-3.0.0-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/development/CONTRIBUTING.md)

[العربية](#arabic) | [English](#english)

> **صنع بواسطة:** آيديا للاستشارات والحلول التسويقية والرقمية.

</div>

---

<a name="arabic"></a>

## 📋 نظرة عامة

منصة متكاملة سحابية توفر إدارة شاملة للعمليات السريرية، المواعيد الذكية، تنسيق تدفقات المرضى وحملات التواصل المتقدمة. تم تطوير النظام بواسطة **آيديا للاستشارات والحلول التسويقية والرقمية**.

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
- **تطبيق PWA** للتثبيت على الجوال مع دعم عدم الاتصال

#### 💬 تكامل WhatsApp Business API (Meta Cloud API)
- **إرسال الرسائل التلقائية** (تأكيد الحجز، تذكيرات، متابعة)
- **لوحة محادثات متكاملة** مع فريق خدمة العملاء
- **الردود التلقائية** على الكلمات المفتاحية
- **البث الجماعي المتقدم** للحملات التسويقية مع تتبع فردي لكل مستلم
- **إدارة القوالب** المعتمدة من Meta واقتراح المحتوى التلقائي
- **تتبع جودة المحادثات** والتكاليف والفوترة
- **جدولة الرسائل** التلقائية عبر Heartbeat Jobs
- **المراكز الخمسة الموحدة للعمليات** (Operations, Automation, Campaigns, Governance, Analytics)
- **موثوقية Webhooks** بآلية Idempotency والتأجير الموزع (Distributed Leasing)
- **مزامنة جهات الاتصال** مع Google Contacts وتصدير VCF/CSV
- **تحويل الصوتيات** تلقائياً إلى `ogg/opus` المتوافق مع Meta Cloud API

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
- **PWA** - تطبيق ويب تقدمي مع دعم عدم الاتصال

---

### 🛠️ التقنيات المستخدمة

#### Frontend
| التقنية | الوصف |
|---------|-------|
| **React 19** | مكتبة واجهة المستخدم |
| **TypeScript 5.9** | لغة البرمجة |
| **Tailwind CSS 4** | إطار عمل التصميم |
| **TanStack Query** | إدارة حالة البيانات |
| **Wouter** | التوجيه (Routing) |
| **Lucide React** | الأيقونات |
| **shadcn/ui** | مكونات واجهة المستخدم |
| **React Hook Form** | إدارة النماذج |
| **Zod** | التحقق من البيانات |
| **Recharts** | الرسوم البيانية |
| **Framer Motion** | الرسوم المتحركة |

#### Backend
| التقنية | الوصف |
|---------|-------|
| **Node.js** | بيئة التشغيل |
| **Express.js** | إطار عمل الخادم |
| **tRPC 11** | Type-safe API |
| **Drizzle ORM** | إدارة قاعدة البيانات |
| **BullMQ** | نظام الطوابير |
| **Redis** | التخزين المؤقت |
| **Axios** | عميل HTTP |

#### Database
- **MySQL/TiDB** - قاعدة البيانات الرئيسية
- **46+ جدول** يغطي جميع جوانب النظام (أُضيف 6 جداول جديدة في المرحلتين الأولى والثانية)

#### Ops & Backup
- **Backup & Updater Orchestration** - نسخ احتياطي موحد وتحديثات خادم مُنسقة كأنظمة فرعية مستقلة عبر `server/subsystems/` وعمليات `pm2/systemd` المدعومة

#### Authentication & Security
- **Manus OAuth** - نظام المصادقة
- **JWT** - الرموز الأمنية
- **bcrypt** - تشفير كلمات المرور
- **RSA-2048** - نظام الترخيص العتادي المشفر

#### DevOps & Tools
- **Vite** - أداة البناء
- **Vitest** - إطار الاختبار
- **Playwright** - اختبارات E2E
- **Prettier** - تنسيق الكود
- **ESLint** - فحص الكود
- **Drizzle Kit** - إدارة الترحيل
- **Docker** - حاويات التطبيق
- **Backup & Updater Orchestration** - نظام النسخ الاحتياطي الموحد وتحديثات الخادم المدمج
- **GitHub Actions** - CI/CD

---

### 📦 المتطلبات

- **Node.js** >= 22.13.0
- **pnpm** >= 10.4.0
- **MySQL** >= 8.0 أو **TiDB**
- **Redis** (اختياري - للطوابير)
- **Docker** (اختياري - للحاويات)

---

### 🚀 التثبيت والتشغيل السريع

للحصول على دليل تثبيت وتشغيل مفصل لبيئات التطوير والإنتاج، يرجى مراجعة:
👉 **[دليل التثبيت والتشغيل الشامل (docs/installation/INSTALLATION_GUIDE.md)](./docs/installation/INSTALLATION_GUIDE.md)**

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

قم بنسخ ملف `.env.example` إلى `.env` وتعبئة المتغيرات المطلوبة:

```bash
cp .env.example .env
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

---

### 📁 هيكل المشروع

```
bocam/
├── client/                     # تطبيق الواجهة الأمامية (React 19, TypeScript, Tailwind 4)
│   ├── public/                 # الملفات الثابتة (PWA Manifest, Service Workers)
│   └── src/                    # كود مصدر الواجهة الأمامية (معمارية معيارية ثلاثية الطبقات)
│       ├── core/               # النواة التأسيسية المشتركة (@core/*)
│       │   ├── api/            # تهيئة عميل tRPC والمصادقة
│       │   ├── contexts/       # سياقات الثيم واللغة وحالة الاتصال
│       │   ├── components/ui/  # مكتبة عناصر الواجهة الأساسية (Buttons, Dialogs, etc.)
│       │   ├── feedback/       # التغذية الراجعة، الخصوصية، ومؤشرات الشبكة
│       │   ├── animations/     # المؤثرات الحركية والعدادات الموحدة
│       │   ├── pages/          # صفحات النظام العامة (NotFound, Unauthorized, Offline)
│       │   ├── pwa/            # إدارة تطبيق الويب التقدمي (PWAManager)
│       │   ├── hooks/          # الخطافات العامة الشاملة للنظام
│       │   └── lib/            # الأدوات المساعدة والمكتبات المشتركة
│       ├── apps/               # البوابات الوظيفية الأربع للمنظومة (@apps/*)
│       │   ├── public/         # البوابة التعريفية للمستشفى (5 وحدات وظيفية)
│       │   ├── patient-portal/ # بوابة المريض الرقمية للنتائج والمواعيد (5 وحدات)
│       │   ├── doctor-portal/  # بوابة الكادر الطبي (تسجيل الدخول وإدارة العيادة)
│       │   └── admin/          # المنظومة الإدارية والتشغيلية
│       │       ├── auth/       # المصادقة الإدارية وجلسات الموظفين
│       │       ├── layout/     # هيكل لوحة التحكم، الشريط الجانبي، والتنقل
│       │       ├── shared/     # المكونات والخطافات المشتركة للإدارة
│       │       └── modules/    # الوحدات الوظيفية العشر لإدارة المستشفى (01-10)
│       ├── App.tsx             # الموجه المركزي للتطبيق العام
│       ├── main.tsx            # نقطة انطلاق التطبيق في الـ DOM
│       └── index.css           # ملف الأنماط والمتغيرات التصميمية المركزية
├── server/                     # الخادم الخلفي (Node.js, Express, tRPC)
│   ├── _core/                  # النواة التأسيسية الصلبة (خادم Express، tRPC، السجلات، الحراسة)
│   ├── subsystems/             # الأنظمة الفرعية المستقلة (backup, auto-update, licensing)
│   ├── modules/                # الوحدات النطاقية الثماني المتناظرة مع الواجهة (01 إلى 10)
│   │   ├── 01-booking-scheduling/     # الحجوزات، المواعيد، العروض، والمخيمات
│   │   ├── 02-crm-patients/           # إدارة وسجلات المرضى، الملف الطبي، ونتائج المختبر
│   │   ├── 03-omni-inbox/             # محادثات واتساب، الصندوق الاجتماعي، والعمليات
│   │   ├── 04-marketing-publishing/   # الحملات الإعلانية، المشاريع، وتتبع العائد (ROAS)
│   │   ├── 05-cms-portal/             # بوابة المحتوى الطبي، المقالات، والوسائط
│   │   ├── 06-tasks-projects/         # مهام الموظفين، تقييم الأداء، وفرق العمل
│   │   ├── 07-users-rbac/             # إدارة المستخدمين، الأدوار، ومصفوفة الصلاحيات
│   │   └── 10-system-settings/        # إعدادات النظام، سجلات التدقيق، والتقارير
│   ├── api/                    # واجهات API المصنفة (cron, webhooks, oauth, meta, upload)
│   ├── database/               # إعدادات قاعدة البيانات، Drizzle ORM، ومستودعات الاستعلام
│   ├── routers/                # مجمع مسارات tRPC المعياري وشبكة جسور التوافق الخلفي
│   ├── services/               # خدمات العمليات المشتركة (Redis, PubSub, Storage, Notifications)
│   ├── integrations/           # تكاملات خارجية (Meta, Webhooks, SSE, Queues)
│   └── tasks/                  # المهام المجدولة وطوابير BullMQ (cron, queues)
├── docs/                       # وثائق المشروع الشاملة
│   ├── architecture/           # البنية الهندسية، معمارية الواجهة، ERD، و PWA
│   ├── domains/                # مراجع التشغيل للمجالات الوظيفية
│   ├── installation/           # أدلة التثبيت والتهيئة
│   ├── api/                    # مراجع واجهات التطبيق البرمجية (API Reference)
│   ├── licensing/              # وثائق نظام الترخيص والأمان
│   ├── guides/                 # أدلة المستخدم النهائي والصيانة
│   └── development/            # معايير وأدوات التطوير
├── deploy/                     # حزمة النشر والإنتاج
├── drizzle/                    # مخططات وقواعد البيانات (Modular Schemas in schema/ & Migrations)
├── e2e/                        # اختبارات E2E (Playwright)
├── mocks/                      # بيانات وهمية للاختبارات
├── testing/                    # أدوات الاختبار المخصصة وقواعد البيانات الوهمية (testing/utils)
└── scripts/                    # سكريبتات مصنفة وظيفياً (seed, database, qa, admin, release)
```

---

## 📚 دليل الوثائق الشامل

تم تنظيم وثائق المشروع بشكل احترافي لتسهيل الوصول إلى المعلومات المطلوبة. للاطلاع على الفهرس الكامل:

👉 **[فهرس الوثائق (docs/README.md)](./docs/README.md)**

للتعريف المطابق للتنفيذ الحالي، راجع [تعريف النظام](./docs/SYSTEM_DEFINITION.md) و[خريطة المسارات](./docs/SYSTEM_ROUTE_MAP.md). أما التفاصيل المتخصصة فتتبع مراحل [الخطة التنفيذية](./docs/DOCUMENTATION_EXECUTION_PLAN.md).

### الأقسام الرئيسية للتوثيق:

| القسم | الوصف | الرابط |
|-------|-------|--------|
| **مقدمة عن النظام** | نظرة عامة وسياسات المشروع | [docs/introduction/](./docs/introduction) |
| **البنية الهندسية** | مخطط ERD، معمارية PWA، التخزين المؤقت | [docs/architecture/](./docs/architecture) |
| **دليل التثبيت** | تثبيت بيئة التطوير والإنتاج | [docs/installation/](./docs/installation) |
| **مرجع API** | توثيق واجهات tRPC و REST | [docs/api/](./docs/api) |
| **نظام الترخيص** | التراخيص المزدوجة والأمان | [docs/licensing/](./docs/licensing) |
| **أدلة المستخدم** | دليل الاستخدام الشامل والصيانة | [docs/guides/](./docs/guides) |
| **معايير التطوير** | دليل المساهمة ومعايير الكود | [docs/development/](./docs/development) |

---

## ⚖️ الفصل القانوني ونظام التراخيص

يعتمد هذا المشروع على نموذج **ترخيص مزدوج (Dual-Licensing)** للفصل الواضح والقانوني بين أجزاء المشروع المفتوحة والمحمية:

1. **القسم المفتوح المصدر (MIT License):** يشمل الهيكل الأساسي للواجهات العامة، صفحات الأطباء، العروض العامة، وإعدادات المشروع الأساسية. التفاصيل موجودة في ملف `LICENSE`.
2. **القسم المحمي والتجاري (Proprietary License):** يشمل الأنظمة المتقدمة مثل **نظام WhatsApp المتكامل (14 صفحة)**، **نظام التقارير والإحصائيات (4 صفحات)**، و**بوابة المرضى المتقدمة (10 صفحات)**. هذا القسم مرخص تجارياً ومحمي بموجب حقوق شركة **IdeaHub**، ومزود بنظام حماية برمجية وربط عتادي (Hardware ID).

لمزيد من التفاصيل القانونية والتقنية حول كيفية إعداد وتوليد تراخيص التشغيل، يرجى مراجعة الدليل التفصيلي:
👉 **[دليل التراخيص والأمان المخصص (docs/licensing/LICENSE_GUIDE.md)](./docs/licensing/LICENSE_GUIDE.md)**

---

## 🤝 المساهمة

نرحب بجميع المساهمات! يرجى الاطلاع على دليل المساهمة للمزيد من التفاصيل:
👉 **[دليل المساهمة (docs/development/CONTRIBUTING.md)](./docs/development/CONTRIBUTING.md)**

---

## 📄 الترخيص

هذا المشروع مرخص بموجب **ترخيص مزدوج** - راجع ملف [LICENSE](./LICENSE) للتفاصيل.

---

<a name="english"></a>

## 📋 Overview

**SGH CRM Portal** is a comprehensive medical CRM platform developed specifically for Saudi German Hospital - Sana'a. It provides integrated management for marketing campaigns, patient appointments, WhatsApp Business API integration, patient portal, and a complete task and team management system.

### Key Features

- **Campaign Management:** Create and manage digital, field, awareness, and mixed campaigns with UTM tracking, budget management, KPIs, and integration with offers, camps, and doctors.
- **Appointments & Bookings:** Doctor appointment booking (22+ specialists), status tracking, waitlist management, automatic reminders, and source tracking.
- **Admin Dashboard (Mini-CRM):** Lead management, medical offers, charity camps, saved filters, statistical dashboards, and audit logging.
- **Patient Portal:** Secure OTP login, appointment viewing, medical results (lab, radiology, reports), profile management, and PWA with offline support.
- **WhatsApp Business API (Meta Cloud API):** Automatic messages, integrated chat dashboard, auto-replies, advanced broadcast campaigns with per-recipient tracking, template management, cost tracking, scheduled messages, and the 5 Unified Operations Centers (Operations, Automation, Campaigns, Governance, Analytics) with full RBAC.
- **Task & Project Management:** Projects linked to campaigns, task management with priorities and deadlines, deliverables review, comments, and time tracking.
- **Team & User Management:** Role-based access control (Admin, Manager, Team Leader, Staff, Viewer), team management, access requests, and UI customization.
- **Integrations:** Meta Pixel & Conversion API, WhatsApp Cloud API, Email Notifications, Google Analytics, PWA.

### Tech Stack

- **Frontend:** React 19, TypeScript 5.9, Tailwind CSS 4, TanStack Query, Wouter, shadcn/ui, Zod, Recharts, Framer Motion
- **Backend:** Node.js, Express.js, tRPC 11, Drizzle ORM, BullMQ, Redis
- **Database:** MySQL/TiDB (46+ tables)
- **Auth & Security:** Manus OAuth, JWT, bcrypt, RSA-2048 hardware-bound licensing
- **DevOps:** Vite, Vitest, Playwright, Docker, GitHub Actions

### Quick Start

```bash
git clone https://github.com/wheb3543/bocam.git
cd bocam
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```

The application will be available at `http://localhost:3000`

### Documentation

For comprehensive documentation, please visit:
👉 **[Documentation Index (docs/README.md)](./docs/README.md)**

> Note: Detailed domain documentation is being verified against the current codebase by domain-specific phases. The system definition and route map describe the current implemented boundaries; they do not replace detailed domain references.

### License

This project is **dual-licensed** - see the [LICENSE](./LICENSE) file for details.
