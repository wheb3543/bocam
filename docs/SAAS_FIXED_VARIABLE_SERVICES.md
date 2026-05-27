# شرح الخدمات الثابتة والمتغيرة

هذا الملف يحتوي على شرح الخدمات الثابتة والمتغيرة في النظام بناءً على معمارية **Isolated Instance per Tenant**.

## جدول المحتويات

1. معمارية النظام
2. قائمة الخدمات الثابتة
3. قائمة الخدمات المتغيرة
4. معايير التصنيف
5. كيفية الإدارة

---

## معمارية النظام: Isolated Instance per Tenant

**المبدأ الأساسي:**
- كل مستشفى أو عميل يحصل على نسخة كود معزولة تماماً
- كل نسخة تعمل على قاعدة بيانات مستقلة (Database per Tenant)
- النشر يتم بشكل منفصل (على TiDB Cloud أو سيرفر محلي خاص)
- الجداول نظيفة ومجردة (White-Label Core) بدون tenantId
- الهوية تتحدد عبر ملفات .env والإعدادات المحلية

**لماذا هذه المعمارية؟**
- عزل كامل للبيانات (Complete Data Isolation)
- أداء أفضل (Better Performance)
- أمان أعلى (Enhanced Security)
- مرونة في النشر (Deployment Flexibility)
- سهولة في الصيانة (Easier Maintenance)

---

## قائمة الخدمات الثابتة

الخدمات الثابتة هي الخدمات التي تكون متاحة دائماً لجميع العملاء بغض النظر عن نوع الترخيص أو الميزات المفعلة.

### 1. الصفحات العامة (Public Pages)

**الصفحات:**
- `HomePage.tsx` - الصفحة الرئيسية
- `Doctors.tsx` - قائمة الأطباء
- `DoctorDetailPage.tsx` - تفاصيل الطبيب
- `VisitingDoctors.tsx` - الأطباء الزائرون
- `OffersListPage.tsx` - قائمة العروض
- `OfferDetailPage.tsx` - تفاصيل العرض
- `CampsListPage.tsx` - قائمة المعسكرات
- `CampDetailPage.tsx` - تفاصيل المعسكر
- `ThankYou.tsx` - صفحة الشكر
- `PrivacyPolicyPage.tsx` - سياسة الخصوصية
- `NotFound.tsx` - صفحة 404
- `Unauthorized.tsx` - صفحة غير مصرح
- `AccessRequest.tsx` - طلب الوصول
- `OfflinePage.tsx` - صفحة عدم الاتصال

**السبب:** هذه الصفحات هي صفحات عامة تعرض معلومات أساسية عن المستشفى والخدمات، وهي ضرورية لعمل النظام.

### 2. صفحات الإدارة الأساسية (Basic Admin)

**الصفحات:**
- `AdminDashboard.tsx` - لوحة تحكم المشرف
- `ProfilePage.tsx` - ملف المستخدم
- `SettingsPage.tsx` - الإعدادات

**السبب:** هذه الصفحات ضرورية لإدارة النظام الأساسي وإعدادات المستخدم.

### 3. Routers العامة (Public Routers)

**Routers:**
- `auth` - المصادقة
- `system` - معلومات النظام
- `preferences` - تفضيلات المستخدم
- `sharedTemplates` - القوالب المشتركة

**السبب:** هذه Routers ضرورية لعمل النظام الأساسي.

### 4. الخدمات الأساسية (Core Services)

**الخدمات:**
- `email.ts` - خدمة البريد الإلكتروني
- `messaging.ts` - خدمة الرسائل
- `storage.ts` - خدمة التخزين
- `webhookRoutes.ts` - مسارات Webhook

**السبب:** هذه الخدمات ضرورية لعمل النظام الأساسي.

### 5. Routers العروض والمعسكرات

**Routers:**
- `offers` - العروض
- `camps` - المعسكرات
- `metaSync` - مزامنة Meta

**السبب:** هذه الخدمات مرتبطة بالصفحات العامة وتعتبر جزءاً أساسياً من النظام.

---

## قائمة الخدمات المتغيرة

الخدمات المتغيرة هي الخدمات التي تعتمد على الميزات المفعلة في الترخيص. يمكن تفعيلها أو تعطيلها حسب نوع الترخيص.

**ملاحظة هامة:** بما أن النظام يستخدم معمارية Isolated Instance per Tenant، كل عميل لديه ملف license.json محلي يحتوي على الميزات المفعلة له. التحقق من الميزات يتم محلياً ولا يعتمد على سيرفر مركزي.

### 1. صفحات WhatsApp (WhatsApp Pages)

**الصفحات (14 صفحة):**
- `WhatsAppPage.tsx` - الصفحة الرئيسية لـ WhatsApp
- `WhatsAppDashboard.tsx` - لوحة تحكم WhatsApp
- `WhatsAppTemplatesPage.tsx` - قوالب WhatsApp
- `WhatsAppConnectionPage.tsx` - اتصال WhatsApp
- `WhatsAppAnalytics.tsx` - تحليلات WhatsApp
- `WhatsAppBroadcast.tsx` - بث WhatsApp
- `WhatsAppAutoReply.tsx` - رد تلقائي WhatsApp
- `WhatsAppCompliance.tsx` - الامتثال لـ WhatsApp
- `WhatsAppAppointments.tsx` - مواعيد WhatsApp
- `WhatsAppIntegration.tsx` - تكامل WhatsApp
- `WhatsAppAccountHealthPage.tsx` - صحة حساب WhatsApp
- `WhatsAppPhoneQualityPage.tsx` - جودة الهاتف WhatsApp
- `WhatsAppUserSubscriptionsPage.tsx` - اشتراكات المستخدمين WhatsApp
- `WhatsAppWebhookInspectorPage.tsx` - فاحص Webhook WhatsApp

**الميزة المطلوبة:** `whatsapp`

**السبب:** WhatsApp هو خدمة متقدمة تتطلب تكامل مع Meta API وتكلفة إضافية.

### 2. صفحات التقارير والتحليلات (Reports & Analytics)

**الصفحات (6 صفحة):**
- `ReportsPage.tsx` - صفحة التقارير
- `AnalyticsPage.tsx` - صفحة التحليلات
- `BIPage.tsx` - صفحة BI
- `CampStatsPage.tsx` - إحصائيات المعسكرات
- `PWAStatsPage.tsx` - إحصائيات PWA
- `TrackingSettingsPage.tsx` - إعدادات التتبع

**الميزة المطلوبة:** `reports`

**السبب:** التقارير والتحليلات هي خدمة متقدمة تتطلب معالجة بيانات معقدة.

### 3. صفحات إدارة المرضى (Patient Portal)

**الصفحات (10 صفحة):**
- `PatientPortalLogin.tsx` - تسجيل دخول بوابة المرضى
- `PatientDashboard.tsx` - لوحة تحكم المريض
- `PatientHomePage.tsx` - الصفحة الرئيسية للمريض
- `PatientAppointmentsPage.tsx` - مواعيد المريض
- `PatientAppointmentDetailsPage.tsx` - تفاصيل موعد المريض
- `PatientOffersPage.tsx` - عروض المريض
- `PatientCampsPage.tsx` - معسكرات المريض
- `PatientResultsPage.tsx` - نتائج المريض
- `PatientResultDetailsPage.tsx` - تفاصيل نتيجة المريض
- `PatientProfilePage.tsx` - ملف المريض

**الميزة المطلوبة:** `patient_portal`

**السبب:** بوابة المرضى هي خدمة متقدمة تتطلب إدارة إضافية وتكامل مع الأنظمة الطبية.

### 4. صفحات إدارة الفرق (Team Management)

**الصفحات (4 صفحة):**
- `DigitalMarketingTeamPage.tsx` - فريق التسويق الرقمي
- `MediaTeamPage.tsx` - فريق الإعلام
- `FieldMarketingTeamPage.tsx` - فريق التسويق الميداني
- `CustomerServiceTeamPage.tsx` - فريق خدمة العملاء

**الميزة المطلوبة:** `team_management`

**السبب:** إدارة الفرق هي خدمة متقدمة للمؤسسات الكبيرة.

### 5. صفحات الحملات (Campaigns)

**الصفحات (3 صفحة):**
- `CampaignsPage.tsx` - صفحة الحملات (في admin/)
- `DigitalMarketingTasksPage.tsx` - مهام التسويق الرقمي (في admin/)
- `ProjectsManagementPage.tsx` - إدارة المشاريع

**الميزة المطلوبة:** `campaigns`

**السبب:** إدارة الحملات هي خدمة متقدمة للتسويق الرقمي.

### 6. صفحات إدارة الحجوزات (Bookings Management)

**الصفحات (7 صفحة):**
- `BookingsManagementPage.tsx` - إدارة الحجوزات
- `LeadsManagementPage.tsx` - إدارة العملاء المحتملين
- `AppointmentsManagementPage.tsx` - إدارة المواعيد
- `OfferLeadsPage.tsx` - عملاء محتملين للعروض
- `CampRegistrationsPage.tsx` - تسجيلات المعسكرات
- `CustomersPage.tsx` - إدارة العملاء
- `TasksPage.tsx` - إدارة المهام

**الميزة المطلوبة:** `bookings`

**السبب:** إدارة الحجوزات هي خدمة متقدمة تتطلب إدارة علاقات العملاء (CRM).

### 7. Routers WhatsApp

**Routers:**
- `whatsapp` - جميع عمليات WhatsApp
- `whatsappTemplateTest` - اختبار القوالب
- `messageSettings` - إعدادات الرسائل
- `webhooks` - إدارة webhooks

**الميزة المطلوبة:** `whatsapp`

### 8. Routers التقارير

**Routers:**
- `reports` - التقارير
- `charts` - الرسوم البيانية
- `tracking` - التتبع
- `auditLogs` - سجلات التدقيق
- `savedFilters` - الفلاتر المحفوظة

**الميزة المطلوبة:** `reports`

### 9. Routers إدارة المرضى

**Routers:**
- `patientPortal` - بوابة المرضى
- `patientResults` - نتائج المرضى
- `pwa` - PWA

**الميزة المطلوبة:** `patient_portal`

### 10. Routers الحملات

**Routers:**
- `campaigns` - الحملات
- `tasks` - المهام
- `followUpTasks` - مهام المتابعة

**الميزة المطلوبة:** `campaigns`

### 11. Routers الحجوزات

**Routers:**
- `leads` - العملاء المحتملين
- `appointments` - المواعيد
- `offerLeads` - عملاء محتملين للعروض
- `campRegistrations` - تسجيلات المعسكرات
- `customers` - إدارة العملاء

**الميزة المطلوبة:** `bookings`

### 12. خدمات WhatsApp

**الخدمات (12 خدمة):**
- `whatsappService.ts` - خدمة WhatsApp الأساسية
- `whatsappTemplates.ts` - إدارة قوالب WhatsApp
- `whatsappBroadcast.ts` - بث WhatsApp
- `whatsappAutoReply.ts` - الرد التلقائي
- `whatsappAppointments.tsx` - مواعيد WhatsApp
- `whatsappIntegration.ts` - تكامل WhatsApp
- `whatsappMessageDispatcher.ts` - إرسال الرسائل
- `whatsappScheduler.ts` - جدولة WhatsApp
- `whatsappAuditLog.ts` - سجلات تدقيق WhatsApp
- `whatsappSecurity.ts` - أمان WhatsApp
- `whatsappCloudAPI.ts` - WhatsApp Cloud API
- `whatsappSse.ts` - WhatsApp SSE
- `whatsapp.ts` - WhatsApp الأساسي

**الميزة المطلوبة:** `whatsapp`

### 13. خدمات Meta/Social Media

**الخدمات (5 خدمة):**
- `MetaApiService.ts` - خدمة Meta API
- `facebookCAPI.ts` - Facebook CAPI
- `metaGraphAPI.ts` - Meta Graph API
- `templateSyncService.ts` - مزامنة القوالب
- `metaTemplateSync.ts` - مزامنة قوالب Meta

**الميزة المطلوبة:** `social_media`

### 14. خدمات التقارير

**الخدمات:**
- `pdfService.ts` - خدمة PDF

**الميزة المطلوبة:** `reports`

### 15. خدمات Telegram

**الخدمات:**
- `telegram.ts` - خدمة Telegram

**الميزة المطلوبة:** `telegram`

---

## معايير التصنيف

### 1. الخدمات الثابتة

**المعايير:**
- ضرورية لعمل النظام الأساسي
- لا تتطلب تكلفة إضافية
- لا تتطلب تكامل مع خدمات خارجية مدفوعة
- تستخدم من قبل جميع المستأجرين

**الأمثلة:**
- الصفحات العامة
- المصادقة
- الإعدادات الأساسية
- التخزين الأساسي

### 2. الخدمات المتغيرة

**المعايير:**
- خدمة متقدمة أو إضافية
- تتطلب تكلفة إضافية (API fees, etc.)
- تتطلب تكامل مع خدمات خارجية مدفوعة
- تستخدم من قبل مستأجرين محددين حسب نوع الترخيص
- تتطلب موارد إضافية (CPU, Memory, Storage)

**الأمثلة:**
- WhatsApp (يتطلب تكامل مع Meta API)
- التقارير والتحليلات (يتطلب معالجة بيانات معقدة)
- بوابة المرضى (يتطلب إدارة إضافية)
- إدارة الفرق (للمؤسسات الكبيرة)
- إدارة الحملات (للتسويق الرقمي)
- إدارة الحجوزات (CRM متقدم)

---

## كيفية الإدارة

### 1. إدارة الميزات في الترخيص

**هيكل license.json:**
```json
{
  "key": "LICENSE-KEY-123",
  "signature": "DIGITAL-SIGNATURE",
  "expiryDate": "2025-12-31",
  "hardwareId": "HARDWARE-ID",
  "features": [
    "whatsapp",
    "reports",
    "patient_portal",
    "campaigns",
    "bookings"
  ],
  "lastValidation": "2024-05-16T10:00:00Z"
}
```

### 2. إدارة الميزات في ملف license.json

**ملاحظة:** لا توجد جداول tenantFeatures في قاعدة البيانات المحلية. جميع الميزات تُقرأ من ملف license.json.

**هيكل license.json:**
```json
{
  "key": "LICENSE-KEY-123",
  "signature": "DIGITAL-SIGNATURE",
  "expiryDate": "2025-12-31",
  "hardwareId": "HARDWARE-ID",
  "features": [
    "whatsapp",
    "reports",
    "patient_portal",
    "campaigns",
    "bookings"
  ],
  "lastValidation": "2024-05-16T10:00:00Z"
}
```

### 3. تفعيل/تعطيل الميزات

**من خلال السيرفر المركزي:**
```typescript
// Central License Server
export async function activateFeature(licenseKey: string, feature: string) {
  const license = await getLicense(licenseKey);
  license.features.push(feature);
  license.signature = signLicense(license);
  await saveLicense(licenseKey, license);
  // لا يوجد قاعدة بيانات مركزية - فقط تحديث ملف license.json
}

export async function deactivateFeature(licenseKey: string, feature: string) {
  const license = await getLicense(licenseKey);
  license.features = license.features.filter(f => f !== feature);
  license.signature = signLicense(license);
  await saveLicense(licenseKey, license);
  // لا يوجد قاعدة بيانات مركزية - فقط تحديث ملف license.json
}
```

### 4. التحقق من الميزات

**Client-side:**
```typescript
const { hasFeature } = useFeature();
if (hasFeature('whatsapp')) {
  // عرض صفحة WhatsApp
}
```

**Server-side:**
```typescript
const featureProcedure = (feature: string) => 
  protectedProcedure.use(async ({ ctx, next }) => {
    const license = await loadLicense();
    const features = license?.features || [];
    if (!features.includes(feature)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Feature ${feature} is not enabled`,
      });
    }
    return next();
  });
```

### 5. أنواع التراخيص المقترحة

**الترخيص الأساسي (Basic):**
- الميزات: الصفحات العامة، الإدارة الأساسية
- السعر: منخفض

**الترخيص المتوسط (Standard):**
- الميزات: الأساسي + WhatsApp + التقارير
- السعر: متوسط

**الترخيص المتقدم (Premium):**
- الميزات: المتوسط + بوابة المرضى + إدارة الحملات + إدارة الحجوزات
- السعر: مرتفع

**الترخيص المؤسسي (Enterprise):**
- الميزات: المتقدم + إدارة الفرق + Telegram + Social Media
- السعر: مخصص
