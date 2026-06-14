# سجل التغييرات | Changelog

جميع التغييرات المهمة في هذا المشروع سيتم توثيقها في هذا الملف.

All notable changes to this project will be documented in this file.

النسق مبني على [Keep a Changelog](https://keepachangelog.com/ar/1.0.0/)،
ويتبع هذا المشروع [Semantic Versioning](https://semver.org/lang/ar/).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-06-14

### Changed | التغييرات

#### 🧩 إعادة هيكلة المكونات | Components Refactoring
- إعادة تنظيم مكونات المشروع في مجلدات فرعية حسب الوظيفة:
  - `layout/` - مكونات التخطيط (DashboardLayout, DashboardSidebar, Navbar, Footer, PageLayout, DashboardShell, ProtectedRoute, TopNavbar, DashboardSidebarV2)
  - `dashboard/` - مكونات لوحة التحكم (DashboardCharts, DetailedStatsCards, QuickPatientSearch, SourceAnalytics, RecentActivity)
  - `booking/` - مكونات الحجز (AppointmentCard, AppointmentFilters, AppointmentStatsCards, AppointmentTableDesktop, AppointmentsTab, PrintReceipt)
  - `lead/` - مكونات العملاء المحتملين (LeadCard, LeadStatsCards, LeadsTab)
  - `offer/` - مكونات العروض (OfferLeadCard, OfferLeadsManagement, OffersManagement)
  - `camp/` - مكونات المخيمات (CampRegistrationCard, CampRegistrationsManagement, CampsManagement)
  - `whatsapp/` - مكونات واتساب (WhatsAppStatusBadge)
  - `table/` - مكونات الجداول (DataTableToolbar, DataTableWrapper, ResizableTable, Pagination, ColumnVisibility, TableSkeleton)
  - `form/` - مكونات النماذج (ImageUpload, MultiSelect, DateRangePicker, ManualRegistrationForm)
  - `notification/` - مكونات الإشعارات (NotificationCenter, PendingRequestsNotification, CommentCount)
- تحديث جميع الاستيرادات في الملفات المتأثرة (119 ملف)
- تحديث التوثيق (README.md و docs/COMPONENTS.md)
- فحص TypeScript للتأكد من عدم وجود أخطاء (تم التحقق بنجاح)
- تحسين قابلية الصيانة والتوسع في المشروع

---

## [1.1.0] - 2025-06-14

### Changed | التغييرات

#### 🏗️ إعادة هيكلة الصفحات | Page Structure Refactoring
- إعادة تنظيم صفحات المشروع في ثلاثة مجلدات رئيسية:
  - `public/` - الصفحات العامة (الصفحة الرئيسية، الأطباء، العروض، المخيمات)
  - `admin/` - الصفحات الإدارية مع تقسيم حسب الوظيفة:
    - `bookings/` - إدارة الحجوزات والمواعيد
    - `whatsapp/` - إدارة WhatsApp
    - `campaigns/` - إدارة الحملات والمشاريع
    - `reports/` - التقارير والتحليلات
    - `communications/` - إدارة المراسلات
    - `teams/` - إدارة الفرق
    - `content/` - إدارة المحتوى
    - `users/` - إدارة المستخدمين
    - `system/` - إدارة النظام
    - `settings/` - الإعدادات
    - `shared/` - الصفحات المشتركة
  - `patient-portal/` - بوابة المريض
- تحديث جميع المسارات من `/admin/` إلى `/admin/` للصفحات الإدارية
- تحديث جميع المراجع في المكونات (DashboardSidebar, DashboardSidebarV2, TopNavbar)
- تحديث جميع المراجع في الصفحات نفسها
- تحديث ملفات التوثيق (README.md) لتعكس الهيكل الجديد
- تحسين قابلية الصيانة والتوسع في المشروع

---

## [1.0.0] - 2025-05-23

### Added | الإضافات

#### 🎯 إدارة الحملات التسويقية
- نظام متكامل لإنشاء وإدارة الحملات بأنواع مختلفة (رقمية، ميدانية، توعوية، مختلطة)
- تتبع UTM Parameters لتحليل مصادر الزيارات
- إدارة الميزانيات (المخططة والفعلية)
- تحديد الأهداف ومؤشرات الأداء (KPIs)
- ربط الحملات بالعروض والمخيمات والأطباء

#### 🏥 إدارة المواعيد والحجوزات
- نظام حجز مواعيد الأطباء مع عرض 22+ طبيب متخصص
- نظام حالات المواعيد المتكامل (قيد الانتظار، مؤكد، حضر، مكتمل، ملغي)
- إدارة قوائم الانتظار والتذكيرات التلقائية
- تتبع مصادر الحجوزات (ويب، هاتف، يدوي)
- جدول المواعيد الأسبوعي

#### 💼 لوحة التحكم الإدارية (Mini-CRM)
- إدارة العملاء (Leads) مع تتبع حالة كل عميل
- إدارة العروض الطبية والعروض الخاصة
- إدارة المخيمات الطبية الخيرية
- نظام الفلاتر المحفوظة وتخصيص الأعمدة
- بطاقات إحصائية شاملة ورسوم بيانية
- سجل التدقيق (Audit Log) لتتبع جميع التغييرات
- نظام التعليقات على السجلات
- مهام المتابعة (Follow-up Tasks)

#### 📱 بوابة المريض
- تسجيل دخول آمن برقم الهاتف وOTP
- عرض المواعيد والحجوزات القادمة
- عرض النتائج الطبية (تحاليل، أشعة، تقارير)
- إدارة الملف الشخصي
- تطبيق PWA للتثبيت على الجوال

#### 💬 تكامل WhatsApp Business API
- إرسال الرسائل التلقائية (تأكيد الحجز، تذكيرات، متابعة)
- لوحة محادثات متكاملة مع فريق خدمة العملاء
- الردود التلقائية على الكلمات المفتاحية
- البث الجماعي للحملات التسويقية
- إدارة القوالب المعتمدة من Meta
- تتبع جودة المحادثات والتكاليف
- جدولة الرسائل التلقائية
- 18+ جدول WhatsApp متخصص

#### 📊 نظام إدارة المهام والمشاريع
- إنشاء المشاريع وربطها بالحملات
- إدارة المهام مع تحديد الأولويات والمواعيد النهائية
- تسليم المهام ومراجعتها
- نظام التعليقات على المهام
- تتبع الوقت المقدر والفعلي
- مرفقات المهام

#### 👥 إدارة الفرق والمستخدمين
- نظام الصلاحيات (Admin, Manager, Team Leader, Staff, Viewer)
- إدارة الفرق (التسويق الرقمي، التسويق الميداني، خدمة العملاء، الإعلام)
- طلبات التصريح للمستخدمين الجدد
- تخصيص الواجهات حسب تفضيلات كل مستخدم

#### 🔗 التكاملات
- Meta Pixel & Conversion API - تتبع التحويلات والإعلانات
- WhatsApp Cloud API - رسائل WhatsApp التلقائية
- Email Notifications - إشعارات البريد الإلكتروني
- Google Analytics - تحليلات الزيارات
- PWA - تطبيق ويب تقدمي

#### 📈 التتبع والتحليلات
- تتبع الزيارات وجلسات الزيارة
- تتبع أحداث التتبع (Tracking Events)
- تتبع تثبيتات PWA
- تتبع النماذج المهجورة (Abandoned Forms)
- إحصائيات WhatsApp المتقدمة

### Changed | التغييرات

- تحديث React من 18 إلى 19
- تحديث TypeScript من 5.0 إلى 5.9
- تحديث Tailwind CSS من 3 إلى 4
- تحديث tRPC من 10 إلى 11
- تحسين أداء قاعدة البيانات مع Drizzle ORM
- إعادة هيكلة شاملة للمشروع

### Technical Stack | المكدس التقني

#### Frontend
- React 19
- TypeScript 5.9
- Tailwind CSS 4
- TanStack Query
- Wouter (Routing)
- Lucide React (Icons)
- shadcn/ui (UI Components)
- React Hook Form
- Zod (Validation)
- Recharts (Charts)
- Framer Motion (Animations)

#### Backend
- Node.js
- Express.js
- tRPC 11
- Drizzle ORM
- BullMQ (Queues)
- Redis (Caching)
- Axios

#### Database
- MySQL/TiDB
- 40+ tables

#### Authentication
- Manus OAuth
- JWT
- bcrypt

#### DevOps & Tools
- Vite
- Vitest
- Prettier
- ESLint
- Drizzle Kit

### Security | الأمان
- نظام OAuth آمن
- التحقق من الصلاحيات
- تشفير البيانات الحساسة
- حماية CSRF
- اتصالات HTTPS
- نظام الأرقام المحظورة
- أحداث الأمان والتتبع

---

## [0.2.0] - 2025-01-06

### Added | الإضافات

#### صفحات الهبوط | Landing Pages
- صفحة هبوط احترافية للمخيم الطبي الخيري مع نموذج تسجيل
- صفحة حجز مواعيد الأطباء مع عرض 22 طبيب
- صفحات شكر بعد التسجيل والحجز
- تصميم متجاوب يعمل على جميع الأجهزة
- هوية بصرية متكاملة حسب دليل المستشفى

#### لوحة التحكم الإدارية | Admin Dashboard
- لوحة تحكم شاملة (Mini-CRM) لإدارة العملاء والمواعيد
- عرض جميع العملاء المسجلين في الحملات
- عرض جميع مواعيد حجز الأطباء
- نظام تتبع حالة العملاء (جديد، تم التواصل، تم الحجز، غير مهتم، لم يرد)
- نظام تتبع حالة المواعيد (قيد الانتظار، مؤكد، ملغي، مكتمل)
- بطاقات إحصائية شاملة لجميع البيانات
- بحث وفلترة متقدمة حسب معايير متعددة
- إمكانية تحديث حالة العملاء والمواعيد
- عرض تفاصيل الطبيب (الاسم والتخصص) مع كل موعد

#### نظام المصادقة | Authentication
- نظام OAuth للمصادقة الآمنة
- نظام طلبات التصريح للمستخدمين الجدد
- صفحة طلب تصريح للمستخدمين غير المصرح لهم
- إدارة طلبات التصريح (موافقة/رفض) من لوحة التحكم
- نظام أدوار (Admin/User)

#### التكاملات | Integrations
- تكامل Meta Pixel لتتبع الزيارات والتحويلات
- تكامل Facebook Conversion API لتتبع دقيق
- تكامل WhatsApp Business API للرسائل التلقائية
- نظام إشعارات البريد الإلكتروني الفورية
- تتبع مصادر الحملات عبر UTM parameters

#### قاعدة البيانات | Database
- جدول المستخدمين (users)
- جدول الحملات (campaigns)
- جدول العملاء (leads)
- جدول المواعيد (appointments)
- جدول الأطباء (doctors)
- جدول طلبات التصريح (accessRequests)
- جدول تاريخ تغييرات الحالة (leadStatusHistory)

#### الوثائق | Documentation
- README.md شامل بالعربية والإنجليزية
- CONTRIBUTING.md لتسهيل المساهمة
- LICENSE (MIT)
- دليل المستخدم (userGuide.md)
- سجل المهام (todo.md)

### Features | الميزات

#### إدارة العملاء | Customer Management
- عرض قائمة العملاء المسجلين
- تحديث حالة العملاء
- إضافة ملاحظات لكل عميل
- تتبع تاريخ التغييرات
- بحث وفلترة متقدمة

#### إدارة المواعيد | Appointment Management
- عرض قائمة المواعيد
- تحديث حالة المواعيد
- عرض تفاصيل الطبيب والمريض
- بحث وفلترة متقدمة
- إحصائيات المواعيد

#### الإحصائيات | Statistics
- إجمالي العملاء
- عدد العملاء حسب الحالة
- إجمالي المواعيد
- عدد المواعيد حسب الحالة
- بطاقات إحصائية تفاعلية

#### الإشعارات | Notifications
- إشعارات بريد إلكتروني فورية للإدارة
- رسائل WhatsApp تلقائية للعملاء
- رسائل ترحيب عند التسجيل
- رسائل تأكيد الحجز

---

## [0.1.0] - 2024-12-01

### Added | الإضافات

#### الإصدار الأولي | Initial Release
- الهيكل الأساسي للمشروع
- صفحات الهبوط الأساسية
- نظام المصادقة الأساسي
- تكامل Meta Pixel الأساسي

---

## نوع الإصدارات | Version Types

- **Major** (X.0.0): تغييرات كبيرة قد تكسر التوافق
- **Minor** (0.X.0): ميزات جديدة مع الحفاظ على التوافق
- **Patch** (0.0.X): إصلاحات الأخطاء والتحسينات الصغيرة

---

## الإصدارات السابقة | Previous Versions

| الإصدار | التاريخ | الملاحظات |
|---------|---------|-----------|
| 1.0.0 | 2025-05-23 | الإصدار الكامل مع جميع الميزات |
| 0.2.0 | 2025-01-06 | إضافة لوحة التحكم والتكاملات |
| 0.1.0 | 2024-12-01 | الإصدار الأولي |

---

<div align="center">

**نرعاكم كأهالينا - Caring like family**

Made with ❤️ by Abdullkwy Alhatef

</div>