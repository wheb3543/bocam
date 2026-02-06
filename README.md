# بوابة إدارة حملات التسويق - المستشفى السعودي الألماني - صنعاء
# Saudi German Hospital - Sana'a Marketing Portal

<div align="center">

![Saudi German Hospital](client/public/SGHHospitalColorBilingual.png)

**نظام إلكتروني متكامل لإدارة حملات التسويق وعلاقات العملاء**

**Integrated Digital Portal for Marketing Campaign Management and Customer Relations**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

[العربية](#arabic) | [English](#english)

</div>

---

<a name="arabic"></a>

## 📋 نظرة عامة

نظام إلكتروني متكامل تم تطويره خصيصاً للمستشفى السعودي الألماني - صنعاء لإدارة حملات التسويق الطبية وعلاقات العملاء. يوفر النظام صفحات هبوط احترافية، نظام حجز مواعيد الأطباء، ولوحة تحكم إدارية شاملة (Mini-CRM) مع تكاملات متقدمة.

### ✨ الميزات الرئيسية

#### 🎯 صفحات الهبوط
- **صفحة المخيم الطبي الخيري**: نموذج تسجيل احترافي مع تتبع UTM parameters
- **صفحة حجز مواعيد الأطباء**: عرض 22 طبيب مع صورهم وتخصصاتهم ونظام حجز متكامل
- **تصميم متجاوب**: يعمل بشكل مثالي على جميع الأجهزة (هواتف، أجهزة لوحية، أجهزة مكتبية)
- **هوية بصرية متكاملة**: تصميم احترافي يتماشى مع دليل الهوية البصرية للمستشفى

#### 🎛️ لوحة التحكم الإدارية (Mini-CRM)
- **إدارة العملاء المسجلين**: عرض وتتبع جميع العملاء المسجلين في الحملات
- **إدارة مواعيد الأطباء**: عرض وإدارة جميع حجوزات المواعيد
- **تتبع الحالات**: نظام متقدم لتتبع حالة العملاء (جديد، تم التواصل، تم الحجز، غير مهتم، لم يرد)
- **إحصائيات شاملة**: بطاقات إحصائية لجميع البيانات مع رسوم بيانية
- **بحث وفلترة متقدمة**: إمكانية البحث والتصفية حسب معايير متعددة
- **نظام صلاحيات**: OAuth authentication مع نظام طلبات التصريح للمستخدمين الجدد

#### 🔗 التكاملات
- **Meta Pixel & Conversion API**: تتبع دقيق للتحويلات والإعلانات على Facebook
- **WhatsApp Business API**: رسائل ترحيب تلقائية ورسائل تأكيد الحجز
- **Email Notifications**: إشعارات بريد إلكتروني فورية للإدارة والعملاء
- **UTM Tracking**: تتبع مصادر الحملات التسويقية

### 🛠️ التقنيات المستخدمة

#### Frontend
- **React 19** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة
- **Tailwind CSS 4** - إطار عمل التصميم
- **TanStack Query** - إدارة حالة البيانات
- **Wouter** - التوجيه (Routing)
- **Lucide React** - الأيقونات
- **shadcn/ui** - مكونات واجهة المستخدم

#### Backend
- **Node.js** - بيئة التشغيل
- **Express.js** - إطار عمل الخادم
- **tRPC** - Type-safe API
- **Drizzle ORM** - إدارة قاعدة البيانات

#### Database
- **MySQL/TiDB** - قاعدة البيانات الرئيسية

#### Authentication
- **Manus OAuth** - نظام المصادقة

### 📦 المتطلبات

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL/TiDB database

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

قم بإنشاء ملف `.env` في المجلد الرئيسي وأضف المتغيرات التالية:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# OAuth
JWT_SECRET=your-jwt-secret
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

# App Configuration
VITE_APP_TITLE=المستشفى السعودي الألماني - صنعاء
VITE_APP_LOGO=/SGHHospitalColorBilingual.png
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
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable components
│       ├── lib/           # Utilities and configurations
│       └── App.tsx        # Main app component
├── server/                # Backend application
│   ├── routers.ts         # tRPC routers
│   ├── db.ts              # Database functions
│   ├── email.ts           # Email service
│   ├── whatsapp.ts        # WhatsApp service
│   └── facebookConversion.ts  # Facebook Conversion API
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Database schema
├── shared/                # Shared types and constants
└── docs/                  # Documentation
```

### 🎨 الصفحات الرئيسية

#### صفحات عامة
- `/` - الصفحة الرئيسية (صفحة هبوط المخيم الطبي)
- `/thank-you` - صفحة الشكر بعد التسجيل
- `/doctors` - صفحة حجز مواعيد الأطباء
- `/doctors/thank-you` - صفحة الشكر بعد حجز الموعد

#### صفحات إدارية (تتطلب تسجيل دخول)
- `/admin` - لوحة التحكم الرئيسية
  - **العملاء المسجلين**: إدارة جميع العملاء
  - **مواعيد الأطباء**: إدارة جميع المواعيد
  - **طلبات التصريح**: الموافقة أو رفض طلبات المستخدمين الجدد

### 🔐 نظام الصلاحيات

#### المستخدمون المصرح لهم
- يتم التحقق من المستخدمين عبر OAuth
- يجب أن يكون البريد الإلكتروني موجوداً في قاعدة البيانات
- يمكن للمسؤولين الموافقة على طلبات التصريح الجديدة

#### الأدوار
- **Admin**: صلاحيات كاملة لإدارة النظام
- **User**: صلاحيات محدودة للعرض فقط

### 📊 قاعدة البيانات

#### الجداول الرئيسية
- `users` - المستخدمين المصرح لهم
- `campaigns` - الحملات التسويقية
- `leads` - العملاء المسجلين
- `appointments` - مواعيد الأطباء
- `doctors` - بيانات الأطباء
- `accessRequests` - طلبات التصريح
- `leadStatusHistory` - سجل تغييرات حالة العملاء

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
pnpm lint             # فحص الكود
pnpm type-check       # فحص الأنواع
```

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

An integrated digital portal developed specifically for Saudi German Hospital - Sana'a to manage medical marketing campaigns and customer relations. The system provides professional landing pages, doctor appointment booking system, and a comprehensive admin dashboard (Mini-CRM) with advanced integrations.

### ✨ Key Features

#### 🎯 Landing Pages
- **Charitable Medical Camp Page**: Professional registration form with UTM tracking
- **Doctor Appointment Booking Page**: Display of 22 doctors with photos, specializations, and integrated booking system
- **Responsive Design**: Works perfectly on all devices (mobile, tablet, desktop)
- **Complete Brand Identity**: Professional design aligned with hospital's brand guidelines

#### 🎛️ Admin Dashboard (Mini-CRM)
- **Customer Management**: View and track all registered customers
- **Appointment Management**: View and manage all doctor appointments
- **Status Tracking**: Advanced system for tracking customer status (new, contacted, booked, not interested, no answer)
- **Comprehensive Statistics**: Statistical cards for all data with charts
- **Advanced Search & Filtering**: Search and filter by multiple criteria
- **Permission System**: OAuth authentication with access request system for new users

#### 🔗 Integrations
- **Meta Pixel & Conversion API**: Accurate tracking for conversions and Facebook ads
- **WhatsApp Business API**: Automatic welcome messages and booking confirmations
- **Email Notifications**: Instant email notifications for admin and customers
- **UTM Tracking**: Track marketing campaign sources

### 🛠️ Tech Stack

#### Frontend
- **React 19** - UI library
- **TypeScript** - Programming language
- **Tailwind CSS 4** - Styling framework
- **TanStack Query** - Data state management
- **Wouter** - Routing
- **Lucide React** - Icons
- **shadcn/ui** - UI components

#### Backend
- **Node.js** - Runtime environment
- **Express.js** - Server framework
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database management

#### Database
- **MySQL/TiDB** - Primary database

#### Authentication
- **Manus OAuth** - Authentication system

### 📦 Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL/TiDB database

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

Create a `.env` file in the root directory and add the following variables:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# OAuth
JWT_SECRET=your-jwt-secret
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

# App Configuration
VITE_APP_TITLE=Saudi German Hospital - Sana'a
VITE_APP_LOGO=/SGHHospitalColorBilingual.png
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
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable components
│       ├── lib/           # Utilities and configurations
│       └── App.tsx        # Main app component
├── server/                # Backend application
│   ├── routers.ts         # tRPC routers
│   ├── db.ts              # Database functions
│   ├── email.ts           # Email service
│   ├── whatsapp.ts        # WhatsApp service
│   └── facebookConversion.ts  # Facebook Conversion API
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Database schema
├── shared/                # Shared types and constants
└── docs/                  # Documentation
```

### 🎨 Main Pages

#### Public Pages
- `/` - Home page (Medical camp landing page)
- `/thank-you` - Thank you page after registration
- `/doctors` - Doctor appointment booking page
- `/doctors/thank-you` - Thank you page after booking

#### Admin Pages (Login required)
- `/admin` - Main dashboard
  - **Registered Customers**: Manage all customers
  - **Doctor Appointments**: Manage all appointments
  - **Access Requests**: Approve or reject new user requests

### 🔐 Permission System

#### Authorized Users
- Users are verified via OAuth
- Email must exist in database
- Admins can approve new access requests

#### Roles
- **Admin**: Full system management permissions
- **User**: Limited view-only permissions

### 📊 Database

#### Main Tables
- `users` - Authorized users
- `campaigns` - Marketing campaigns
- `leads` - Registered customers
- `appointments` - Doctor appointments
- `doctors` - Doctor data
- `accessRequests` - Access requests
- `leadStatusHistory` - Customer status change history

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
pnpm lint             # Lint code
pnpm type-check       # Type check
```

### 🤝 Contributing

We welcome all contributions! Please read the [Contributing Guide](CONTRIBUTING.md) before starting.

### 📝 License

This project is licensed under the [MIT License](LICENSE).

### 👥 Team

- **Development**: Manus AI
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
