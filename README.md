# SGH CRM Portal | بوابة إدارة علاقات العملاء - المستشفى السعودي الألماني

<div align="center">

![Saudi German Hospital](client/public/SGHHospitalColorBilingual.png)

**منصة CRM طبية متكاملة لإدارة الحملات التسويقية وحجوزات المرضى وتكامل WhatsApp**

**Comprehensive Medical CRM Platform for Marketing Campaigns, Patient Appointments & WhatsApp Integration**

[![License: Dual](https://img.shields.io/badge/License-MIT%20%26%20Proprietary-orange.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.13.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[العربية](#arabic) | [English](#english)

</div>

---

<a name="arabic"></a>

## 📋 نظرة عامة

منصة CRM طبية متكاملة تم تطويرها خصيصاً للمستشفى السعودي الألماني - صنعاء. توفر النظام إدارة شاملة للحملات التسويقية، حجوزات المرضى، تكامل WhatsApp Business API، بوابة المريض الإلكترونية، ونظام متكامل لإدارة المهام والفرق.

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
- **40+ جدول** يغطي جميع جوانب النظام

#### Ops & Backup
- **Backup & Updater Orchestration** - نسخ احتياطي موحد وتحديثات خادم مُنسقة عبر `server/_core` وعمليات `pm2/systemd` المدعومة

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
👉 **[دليل التثبيت والتشغيل الشامل (docs/installation/INSTALLATION_GUIDE.md)](docs/installation/INSTALLATION_GUIDE.md)**

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
sgh-crm-portal/
├── client/                     # تطبيق الواجهة الأمامية (React, TypeScript)
│   ├── public/                 # الملفات الثابتة (PWA Manifest, Service Workers)
│   └── src/                    # كود مصدر الواجهة الأمامية
│       ├── pages/              # مكونات الصفحات (50+ صفحة)
│       │   ├── public/         # الصفحات العامة
│       │   └── admin/          # الصفحات الإدارية
│       │       ├── bookings/   # إدارة الحجوزات والمواعيد
│       │       ├── whatsapp/   # إدارة WhatsApp
│       │       └── campaigns/  # إدارة الحملات والمشاريع
│       ├── components/         # المكونات المشتركة
│       ├── hooks/              # Hooks المخصصة
│       └── lib/                # المكتبات المساعدة
├── server/                     # الخادم الخلفي (Node.js, Express, tRPC)
│   ├── api/                    # واجهات Meta APIs و Webhooks
│   ├── database/               # إعدادات قاعدة البيانات و Drizzle ORM
│   ├── routers/                # مسارات tRPC (Auth, WhatsApp, Patients, Reports)
│   ├── services/               # خدمات العمليات (WhatsApp, Email, Telegram, PDF)
│   ├── integrations/           # تكاملات خارجية (Webhooks, SSE, Queues)
│   └── tasks/                  # المهام المجدولة (Cron Jobs)
├── docs/                       # وثائق المشروع (الهيكلة الجديدة الموحدة)
│   ├── introduction/           # مقدمة عن النظام
│   ├── architecture/           # البنية الهندسية (ERD, PWA Offline, Caching)
│   ├── installation/           # أدلة التثبيت والتهيئة
│   ├── api/                    # مراجع واجهات التطبيق البرمجية (API Reference)
│   ├── licensing/              # وثائق نظام الترخيص والأمان
│   ├── saas/                   # وثائق بيئة الـ SaaS
│   ├── guides/                 # أدلة المستخدم النهائي والصيانة
│   ├── development/            # معايير وأدوات التطوير
│   ├── maintenance/            # السجلات والتقارير الدورية
│   └── archive/                # الأرشيف التاريخي القديم
├── deploy/                     # حزمة النشر والإنتاج
│   ├── scripts/                # سكريبتات التثبيت الآلي
│   ├── nginx/                  # إعدادات Nginx و SSL
│   ├── monitoring/             # إعدادات المراقبة (Prometheus, Grafana)
│   └── backup/                 # سكريبتات النسخ الاحتياطي
├── drizzle/                    # ترحيلات قاعدة البيانات (Drizzle Migrations)
├── e2e/                        # اختبارات E2E (Playwright)
├── mocks/                      # بيانات وهمية للاختبارات
└── scripts/                    # سكريبتات CLI مساعدة
```

---

## 📚 دليل الوثائق الشامل

تم تنظيم وثائق المشروع بشكل احترافي لتسهيل الوصول إلى المعلومات المطلوبة. للاطلاع على الفهرس الكامل:

👉 **[فهرس الوثائق (docs/README.md)](docs/README.md)**

### الأقسام الرئيسية للتوثيق:

| القسم | الوصف | الرابط |
|-------|-------|--------|
| **مقدمة عن النظام** | نظرة عامة وسياسات المشروع | [docs/introduction/](docs/introduction/) |
| **البنية الهندسية** | مخطط ERD، معمارية PWA، التخزين المؤقت | [docs/architecture/](docs/architecture/) |
| **دليل التثبيت** | تثبيت بيئة التطوير والإنتاج | [docs/installation/](docs/installation/) |
| **مرجع API** | توثيق واجهات tRPC و REST | [docs/api/](docs/api/) |
| **نظام الترخيص** | التراخيص المزدوجة والأمان | [docs/licensing/](docs/licensing/) |
| **أدلة المستخدم** | دليل الاستخدام الشامل والصيانة | [docs/guides/](docs/guides/) |
| **معايير التطوير** | دليل المساهمة ومعايير الكود | [docs/development/](docs/development/) |

---

## ⚖️ الفصل القانوني ونظام التراخيص

يعتمد هذا المشروع على نموذج **ترخيص مزدوج (Dual-Licensing)** للفصل الواضح والقانوني بين أجزاء المشروع المفتوحة والمحمية:

1. **القسم المفتوح المصدر (MIT License):** يشمل الهيكل الأساسي للواجهات العامة، صفحات الأطباء، العروض العامة، وإعدادات المشروع الأساسية. التفاصيل موجودة في ملف `LICENSE`.
2. **القسم المحمي والتجاري (Proprietary License):** يشمل الأنظمة المتقدمة مثل **نظام WhatsApp المتكامل (14 صفحة)**، **نظام التقارير والإحصائيات (4 صفحات)**، و**بوابة المرضى المتقدمة (10 صفحات)**. هذا القسم مرخص تجارياً ومحمي بموجب حقوق شركة **IdeaHub**، ومزود بنظام حماية برمجية وربط عتادي (Hardware ID).

لمزيد من التفاصيل القانونية والتقنية حول كيفية إعداد وتوليد تراخيص التشغيل، يرجى مراجعة الدليل التفصيلي:
👉 **[دليل التراخيص والأمان المخصص (docs/licensing/LICENSE_GUIDE.md)](docs/licensing/LICENSE_GUIDE.md)**

---

## 🤝 المساهمة

نرحب بجميع المساهمات! يرجى الاطلاع على دليل المساهمة للمزيد من التفاصيل:
👉 **[دليل المساهمة (docs/development/CONTRIBUTING.md)](docs/development/CONTRIBUTING.md)**

---

## 📄 الترخيص

هذا المشروع مرخص بموجب **ترخيص مزدوج** - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

<a name="english"></a>

## 📋 Overview

**SGH CRM Portal** is a comprehensive medical CRM platform developed specifically for Saudi German Hospital - Sana'a. It provides integrated management for marketing campaigns, patient appointments, WhatsApp Business API integration, patient portal, and a complete task and team management system.

### Key Features

- **Campaign Management:** Create and manage digital, field, awareness, and mixed campaigns with UTM tracking, budget management, KPIs, and integration with offers, camps, and doctors.
- **Appointments & Bookings:** Doctor appointment booking (22+ specialists), status tracking, waitlist management, automatic reminders, and source tracking.
- **Admin Dashboard (Mini-CRM):** Lead management, medical offers, charity camps, saved filters, statistical dashboards, and audit logging.
- **Patient Portal:** Secure OTP login, appointment viewing, medical results (lab, radiology, reports), profile management, and PWA with offline support.
- **WhatsApp Business API:** Automatic messages, integrated chat dashboard, auto-replies, broadcasts, template management, cost tracking, and message scheduling.
- **Task & Project Management:** Projects linked to campaigns, task management with priorities and deadlines, deliverables review, comments, and time tracking.
- **Team & User Management:** Role-based access control (Admin, Manager, Team Leader, Staff, Viewer), team management, access requests, and UI customization.
- **Integrations:** Meta Pixel & Conversion API, WhatsApp Cloud API, Email Notifications, Google Analytics, PWA.

### Tech Stack

- **Frontend:** React 19, TypeScript 5.9, Tailwind CSS 4, TanStack Query, Wouter, shadcn/ui, Zod, Recharts, Framer Motion
- **Backend:** Node.js, Express.js, tRPC 11, Drizzle ORM, BullMQ, Redis
- **Database:** MySQL/TiDB (40+ tables)
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
👉 **[Documentation Index (docs/README.md)](docs/README.md)**

> Note: Some advanced user guides are currently planned or under construction and may be added to `docs/guides/` later, including campaign management, appointment scheduling, task/project management, team management, WhatsApp broadcast/auto-replies, and patient portal usage.

### License

This project is **dual-licensed** - see the [LICENSE](LICENSE) file for details.
