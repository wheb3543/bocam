# خريطة مسارات النظام الحالية

**الحالة:** `working`  
**المجال:** Overview  
**آخر مراجعة:** 2026-09-18  
**المصدر الأساسي:** `client/src/App.tsx` و`client/src/apps/admin/layout/AdminContentRoutes.tsx` (مع جسر التوافق `client/src/components/layout/AdminContentRoutes.tsx`)

## المسارات العامة والنظامية

| المجموعة | المسارات الحالية | الوحدة المعمارية |
|---|---|---|
| الترخيص والدخول | `/activation`, `/admin-login` | `@core/pages`, `@apps/admin/auth` |
| الصفحة والمحتوى | `/`, `/page/:slug`, `/preview/:token`, `/thank-you` | `@apps/public/modules/01-landing` |
| الأطباء | `/doctors`, `/doctors/:slug`, `/visiting-doctors` | `@apps/public/modules/02-doctors` |
| العروض | `/offers`, `/offers/:slug` | `@apps/public/modules/03-offers` |
| المخيمات | `/camps`, `/camps/:slug` | `@apps/public/modules/04-camps` |
| الخصوصية والوصول | `/privacy-policy`, `/privacy-policy-changelog`, `/access-request`, `/unauthorized` | `@apps/public/modules/05-privacy`, `@core/pages` |
| حالات النظام | `/offline`, `/404`, `/feature-locked/:feature` | `@core/pages` |

## بوابة المريض (Patient Portal)

| المجموعة | المسارات الحالية | الوحدة المعمارية |
|---|---|---|
| الدخول والإدارة | `/patient-portal/login`, `/patient-portal/admin` | `@apps/patient-portal/modules/01-auth` |
| الصفحة الرئيسية والمواعيد | `/patient-portal/home`, `/patient-portal/appointments`, `/patient-portal/appointments/:id` | `@apps/patient-portal/modules/02-appointments` |
| النتائج الطبية | `/patient-portal/results`, `/patient-portal/results/:id` | `@apps/patient-portal/modules/03-medical-records` |
| العروض والمخيمات | `/patient-portal/offers`, `/patient-portal/camps` | `@apps/patient-portal/modules/04-offers-camps` |
| الملف الشخصي | `/patient-portal/profile` | `@apps/patient-portal/modules/05-profile` |

## بوابة الطبيب (Doctor Portal)

| المجموعة | المسارات الحالية | الوحدة المعمارية |
|---|---|---|
| تسجيل الدخول | `/doctor-portal/login` | `@apps/doctor-portal/modules/01-auth` |

## لوحة الإدارة (Admin Workspace)

يتم تركيب لوحة الإدارة تحت `/admin/*` وتتوزع عبر 10 وحدات وظيفية معيارية في `AdminContentRoutes.tsx`:

| الوحدة المعمارية | المسارات الحالية المدارة | التبويبات والمراكز الرئيسية |
|---|---|---|
| **01-booking-scheduling** (الحجوزات والجدولة) | `/admin/bookings`, `/admin/bookings/appointments`, `/admin/bookings/offer-leads`, `/admin/bookings/camp-registrations`, `/admin/bookings/doctor-queue` | إدارة المواعيد، حجوزات العروض، كتالوج باقات العروض، تسجيلات المخيمات، طابور الطبيب |
| **02-crm-patients** (إدارة المرضى) | `/admin/bookings/customers`, `/admin/bookings/patient-results` | سجلات المرضى الموحدة، نتائج الفحوصات والتقارير الطبية |
| **03-omni-inbox** (واتساب وصندوق القنوات الموحد) | `/admin/whatsapp`, `/admin/whatsapp/operations`¹, `/admin/whatsapp/automation`¹, `/admin/whatsapp/campaigns`¹, `/admin/whatsapp/governance`¹, `/admin/whatsapp/analytics`¹, `/admin/whatsapp/lab-results` | Live Chat، مركز العمليات، الأتمتة، الحملات، الحوكمة، والتحليلات |
| **04-marketing-publishing** (التسويق والحملات) | `/admin/campaigns/campaigns`, `/admin/campaigns/projects`, `/admin/campaigns/review-approval`, `/admin/bookings/leads`, `/admin/tracking-settings` | الحملات الإعلانية، المشاريع التسويقية، استقطاب العملاء المحتملين، ومراجعة الاعتماد |
| **05-cms-portal** (المحتوى والوسائط) | `/admin/content/content`, `/admin/content/media-library`, `/admin/content/publishing` | المقالات الطبية، مكتبة الوسائط، وجدولة النشر |
| **06-tasks-projects** (المهام والفرق) | `/admin/bookings/tasks`, `/admin/teams/digital-marketing`, `/admin/teams/media`, `/admin/teams/field-marketing`, `/admin/teams/customer-service` | مهام الموظفين، فرق التسويق الرقمي، الميداني، الإعلام، وخدمة العملاء |
| **07-users-rbac** (المستخدمون والصلاحيات) | `/admin/users/users`, `/admin/management` | المستخدمون ومصفوفة الصلاحيات وإدارة الوصول |
| **10-system-settings** (إعدادات النظام والتقارير) | `/admin/settings`, `/admin/advanced-settings`, `/admin/notifications`, `/admin/system/updates`, `/admin/system/status`, `/admin/system/backups`, `/admin/reports/reports`, `/admin/reports/analytics`, `/admin/reports/bi`, `/admin/reports/camp-stats`, `/admin/reports/pwa-stats`, `/admin/offline`, `/admin/profile`, `/admin/support` | إعدادات المنظومة، النسخ الاحتياطي، حالة الخادم، التقارير الشاملة، وذكاء الأعمال |

## حواجز الوصول

- بوابة الترخيص في `App.tsx` تعرض `/activation` عندما لا تكون الرخصة صالحة، مع استثناء `/activation` و`/admin-login`.
- بعض مسارات الإدارة محمية بحاجز `ProtectedRoute` بميزات مثل `whatsapp` و`reports` و`offers` و`camps` و`patient_portal`.
- تفاصيل المستخدمين والأدوار والصلاحيات ليست جزءًا من هذه الخريطة، وتوثق في مرحلة Authentication & RBAC.

## قاعدة المصدر

هذه الخريطة تصف المسارات المعرفة في المصدر وقت المراجعة. عند إضافة مسار، يجب تحديثها ومصفوفة التغطية في نفس التغيير أو تسجيل النقص في سجل التعارضات.

> ¹ المراكز الخمسة الموحدة المعتمدة في الشريط الجانبي والتنقل الأساسي:
> - `/admin/whatsapp` - المحادثات المباشرة الفورية (Live Chat Inbox)
> - `/admin/whatsapp/operations` - مركز العمليات التشغيلية (الاتصال، صحة الحساب، جودة الرقم، التشخيص)
> - `/admin/whatsapp/automation` - مركز الأتمتة (قواعد الرد التلقائي، الإشعارات والتذكيرات)
> - `/admin/whatsapp/campaigns` - مركز الحملات والقوالب (إدارة البث، مكتبة القوالب)
> - `/admin/whatsapp/governance` - مركز الحوكمة والامتثال (الامتثال والتدقيق، الاشتراكات والانسحاب)
> - `/admin/whatsapp/analytics` - مركز تحليلات الأداء والتكاليف
> - `/admin/whatsapp/lab-results` - نتائج التحاليل عبر واتساب
>
> المسارات التفصيلية السابقة (`/templates`, `/broadcast`, `/connection`, `/account-health`, `/costs`, ...) تقوم بعمل توجيه ذكي (Redirect) تلقائياً إلى التبويب المقابل في المركز الموحد المختص دون ازدواجية. كما تم حذف ملفات الكود الميتة (`orders`, `products`, `referrals`) واستبدال مساراتها بصفحة التحويل الموحدة.