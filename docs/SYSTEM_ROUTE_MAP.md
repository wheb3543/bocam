# خريطة مسارات النظام الحالية

**الحالة:** `working`  
**المجال:** Overview  
**آخر مراجعة:** 2026-09-13  
**المصدر الأساسي:** `client/src/App.tsx` و`client/src/components/layout/AdminContentRoutes.tsx`

## المسارات العامة والنظامية

| المجموعة | المسارات الحالية |
|---|---|
| الترخيص والدخول | `/activation`, `/admin-login` |
| الصفحة والمحتوى | `/`, `/page/:slug`, `/preview/:token`, `/thank-you` |
| الأطباء | `/doctors`, `/doctors/:slug`, `/visiting-doctors` |
| العروض | `/offers`, `/offers/:slug` |
| المخيمات | `/camps`, `/camps/:slug` |
| الخصوصية والوصول | `/privacy-policy`, `/privacy-policy-changelog`, `/access-request`, `/unauthorized` |
| حالات النظام | `/offline`, `/404`, `/feature-locked/:feature` |

## بوابة المريض

| المجموعة | المسارات الحالية |
|---|---|
| الدخول والإدارة | `/patient-portal/login`, `/patient-portal/admin` |
| الصفحة الرئيسية | `/patient-portal/home` |
| المواعيد | `/patient-portal/appointments`, `/patient-portal/appointments/:id` |
| العروض والمخيمات | `/patient-portal/offers`, `/patient-portal/camps` |
| النتائج الطبية | `/patient-portal/results`, `/patient-portal/results/:id` |
| الملف | `/patient-portal/profile` |

## لوحة الإدارة

يتم تركيب لوحة الإدارة تحت `/admin/*` وتحتوي المجموعات التالية في `AdminContentRoutes.tsx`:

| المجموعة | المسارات الحالية |
|---|---|
| الأساس والإدارة | `/admin`, `/admin/offline`, `/admin/profile`, `/admin/support`, `/admin/management`, `/admin/notifications`, `/admin/settings`, `/admin/advanced-settings` |
| المحتوى والوسائط | `/admin/content/content`, `/admin/content/media-library`, `/admin/content/publishing` |
| المستخدمون | `/admin/users/users` |
| WhatsApp | `/admin/whatsapp`, `/admin/whatsapp/whatsapp-dashboard`, `/admin/whatsapp/templates`, `/admin/whatsapp/connection`, `/admin/whatsapp/analytics`, `/admin/whatsapp/broadcast`, `/admin/whatsapp/auto-reply`, `/admin/whatsapp/compliance`, `/admin/whatsapp/appointments`, `/admin/whatsapp/integration`, `/admin/whatsapp/account-health`, `/admin/whatsapp/phone-quality`, `/admin/whatsapp/subscriptions`, `/admin/whatsapp/webhook-inspector`, `/admin/whatsapp/costs`, `/admin/whatsapp/orders`, `/admin/whatsapp/products`, `/admin/whatsapp/referrals`, `/admin/whatsapp/lab-results`, `/admin/whatsapp/operations`¹, `/admin/whatsapp/automation`¹, `/admin/whatsapp/campaigns`¹, `/admin/whatsapp/governance`¹, `/admin/whatsapp/analytics`¹ |
| الاتصالات | `/admin/communications/messages`, `/admin/communications/integration-settings`, `/admin/communications/meta-settings`, `/admin/message-settings` |
| التقارير والتتبع | `/admin/reports/reports`, `/admin/reports/analytics`, `/admin/reports/bi`, `/admin/reports/camp-stats`, `/admin/reports/pwa-stats`, `/admin/tracking-settings` |
| الحملات والمشاريع | `/admin/campaigns/campaigns`, `/admin/campaigns/projects`, `/admin/campaigns/review-approval` |
| الحجوزات والعملاء | `/admin/bookings`, `/admin/bookings/leads`, `/admin/bookings/appointments`, `/admin/bookings/offer-leads`, `/admin/bookings/camp-registrations`, `/admin/bookings/customers`, `/admin/bookings/patient-results`, `/admin/bookings/tasks` |
| الفرق | `/admin/teams/digital-marketing`, `/admin/teams/media`, `/admin/teams/field-marketing`, `/admin/teams/customer-service` |
| النظام | `/admin/system/updates`, `/admin/system/status`, `/admin/system/backups` |

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