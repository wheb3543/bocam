# فهرس وثائق BOCAM

**الحالة:** `working`  
**آخر مراجعة:** 2026-09-12  
**مصدر الفهرسة:** `docs/DOCUMENTATION_REGISTRY.json`

هذا هو المدخل المركزي لوثائق المشروع. تُصنف الوثائق حسب الجمهور والحالة والمجال، ولا تُعتبر أي وثيقة مرجعًا نهائيًا قبل أن تحمل الحالة `canonical` في سجل الوثائق وبعد مراجعتها مقابل الكود والاختبارات.

## حوكمة الوثائق

- [سجل الوثائق](./DOCUMENTATION_REGISTRY.json) - سجل قابل للتوليد لكل ملفات Markdown وMDX.
- [مصفوفة التغطية](./DOCUMENTATION_COVERAGE_MATRIX.md) - الربط بين الكود والاختبارات والوثائق والمالك.
- [سجل التعارضات](./DOCUMENTATION_CONFLICTS.md) - التكرار والروابط القديمة والقرارات المؤجلة.
- [سياسة التوثيق](./introduction/DOCUMENTATION_POLICY.md) - قواعد كتابة وتحديث الوثائق.
- [مصفوفة متغيرات البيئة](./ENVIRONMENT_VARIABLES.md) - المتغيرات حسب الإلزام والبيئة والسرية.
- [مرجع الهوية والصلاحيات](./AUTHENTICATION_RBAC.md) - المصادقة والجلسات وRBAC وحواجز الميزات.
- [مرجع تشغيل الترخيص](./licensing/LICENSE_RUNTIME_REFERENCE.md) - التحقق المحلي وFeature Gates وheartbeat والطلبات المركزية.
- [مرجع مخطط قاعدة البيانات الحالي](./architecture/DATABASE_SCHEMA_RUNTIME_REFERENCE.md) - خط أساس schema والعلاقات والترحيلات.
- [مرجع API وWebhooks الحالي](./api/API_RUNTIME_REFERENCE.md) - مسارات tRPC وREST والحماية والحدود.
- [تقرير إغلاق المرحلة 6](./phases/PHASE_6_API_WEBHOOKS_CLOSURE.md) - نتائج مراجعة API وWebhooks والاختبارات.
- [مرجع المواعيد والحجوزات الحالي](./domains/APPOINTMENTS_RUNTIME_REFERENCE.md) - دورة الحجز والحالات والصلاحيات.
- [مرجع المرضى وبوابة المريض](./domains/PATIENT_PORTAL_RUNTIME_REFERENCE.md) - OTP والجلسات والنتائج وعزل البيانات.
- [مرجع الحملات والعملاء المحتملين](./domains/CAMPAIGNS_LEADS_RUNTIME_REFERENCE.md) - دورة الحملة وlead وUTM والصلاحيات.
- [مرجع العروض والمخيمات والأطباء](./domains/OFFERS_CAMPS_DOCTORS_RUNTIME_REFERENCE.md) - دورة الكتالوج الطبي والتسجيلات والرسائل.
- [التقرير الختامي لحوكمة التوثيق والاستدامة والتسليم النهائي](./FINAL_DOCUMENTATION_GOVERNANCE_SUSTAINABILITY_REPORT.md) - ملخص إنجاز كافة مراحل التوثيق (0–19) وقواعد الاستدامة ومنع التراجع.
- [تقرير إغلاق المرحلة 19 والتسليم النهائي](./phases/PHASE_19_FINAL_REVIEW_GOVERNANCE_SUSTAINABILITY_CLOSURE.md) - الإغلاق الرسمي لجميع مراحل خطة التوثيق.
- [مرجع العمليات والنشر والمراقبة](./domains/OPERATIONS_DEPLOYMENT_MONITORING_RUNTIME_REFERENCE.md) - معمارية الحاويات وDocker وNginx وSSL والنسخ الاحتياطي والمراقبة.
- [تقرير إغلاق المرحلة 18](./phases/PHASE_18_OPERATIONS_DEPLOYMENT_MONITORING_CLOSURE.md) - نتائج مراجعة العمليات والنشر والمراقبة.
- [مرجع الاختبارات وهندسة الجودة](./domains/TESTING_QUALITY_RUNTIME_REFERENCE.md) - هرم الاختبارات وإعدادات Vitest وPlaywright وبوابات CI.
- [تقرير إغلاق المرحلة 17](./phases/PHASE_17_TESTING_QUALITY_CLOSURE.md) - نتائج مراجعة الاختبارات وهندسة الجودة ومصفوفة التغطية.
- [مرجع الواجهة المشتركة وPWA والوصول](./domains/FRONTEND_PLATFORM_RUNTIME_REFERENCE.md) - معمارية الواجهة والإطار الإداري والـ PWA وWCAG 2.1 AA.
- [تقرير إغلاق المرحلة 16](./phases/PHASE_16_FRONTEND_PLATFORM_CLOSURE.md) - نتائج مراجعة الواجهة المشتركة وPWA وإمكانية الوصول.
- [تقرير إغلاق المرحلة 15](./phases/PHASE_15_ANALYTICS_REPORTING_TRACKING_CLOSURE.md) - نتائج مراجعة التقارير والتحليلات والتتبع.
- [تقرير إغلاق المرحلة 10](./phases/PHASE_10_OFFERS_CAMPS_DOCTORS_CLOSURE.md) - نتائج مراجعة العروض والمخيمات والأطباء والاختبارات.
- [تقرير إغلاق المرحلة 9](./phases/PHASE_9_CAMPAIGNS_LEADS_CLOSURE.md) - نتائج مراجعة الحملات والـleads والاختبارات.
- [تقرير إغلاق المرحلة 8](./phases/PHASE_8_PATIENTS_PORTAL_CLOSURE.md) - نتائج مراجعة المرضى والبوابة والاختبارات.
- [تقرير إغلاق المرحلة 7](./phases/PHASE_7_APPOINTMENTS_CLOSURE.md) - نتائج مراجعة المواعيد والحجوزات والاختبارات.
- [تقرير إغلاق المرحلة 5](./phases/PHASE_5_DATABASE_CLOSURE.md) - نتائج المقارنة الحية ومراجعة الترحيلات.
- [الخطة التنفيذية](./DOCUMENTATION_EXECUTION_PLAN.md) - مراحل تحديث التوثيق حسب المجال.
- [خطة المرحلة 0](./phases/PHASE_0_DOCUMENTATION_GOVERNANCE_PLAN.md) - خطة تأسيس الحوكمة والمصفوفة.

## مسارات القراءة

### للمطور الجديد

1. [دليل التثبيت](./installation/INSTALLATION_GUIDE.md)
2. [مرجع الأوامر](./COMMANDS_REFERENCE.md)
3. [البنية المعمارية](./architecture/ARCHITECTURE.md)
4. [دليل الاختبارات](./archive/TESTING_GUIDE_CONCISE.md)
5. [دليل المساهمة](./development/CONTRIBUTING.md)

### للمطورين ومراجعي الكود

- [البنية المعمارية العامة](./architecture/ARCHITECTURE.md)
- [المعمارية المعيارية للواجهة الأمامية](./architecture/FRONTEND_MODULAR_ARCHITECTURE.md)
- [المعمارية المعيارية للخادم الخلفي](./architecture/SERVER_MODULAR_ARCHITECTURE.md)
- [مرجع الواجهة المشتركة وPWA والوصول](./domains/FRONTEND_PLATFORM_RUNTIME_REFERENCE.md)
- [مخطط قاعدة البيانات](./architecture/DATABASE_SCHEMA.md)
- [مخطط ERD](./architecture/DATABASE_ERD.md)
- [مرجع REST وtRPC](./api/REST_TRPC_API.md)
- [دليل التخزين المؤقت](./architecture/CACHING.md)
- [دليل PWA والعمل دون اتصال](./architecture/PWA_OFFLINE_ARCHITECTURE.md)
- [معايير أسلوب الكود](./development/CODE_STYLE_GUIDELINES.md)

### للمشغلين وفرق العمليات

- [المرجع التشغيلي المعتمد: العمليات والنشر والمراقبة](./domains/OPERATIONS_DEPLOYMENT_MONITORING_RUNTIME_REFERENCE.md)
- [دليل النشر الأساسي](../deploy/README.md)
- [دليل Docker](../deploy/docs/DOCKER.md)
- [دليل الصيانة](../deploy/docs/MAINTENANCE_GUIDE.md)
- [إدارة النسخ الاحتياطية](../deploy/backup/README.md)
- [المراقبة](../deploy/monitoring/README.md)
- [دليل الترحيلات](../drizzle/MIGRATIONS_GUIDE.md)

### للمستخدمين والمسؤولين

- [دليل الاستخدام](./guides/USAGE_GUIDE.md)
- [دليل بوابة المريض](./guides/PATIENT_PORTAL_GUIDE.md)
- [دليل WhatsApp للمستخدم](./guides/WHATSAPP_USER_GUIDE.md)
- [دليل التصدير](./guides/EXPORT_FEATURE_GUIDE.md)
- [استكشاف الأخطاء](./guides/TROUBLESHOOTING.md)

## المجالات الرئيسية

| المجال | نقطة الدخول الحالية | مرحلة التحديث |
|---|---|---:|
| النظام والحدود | [README الجذر](../README.md) و[المعمارية](./architecture/ARCHITECTURE.md) | 1 |
| التثبيت والبيئات | [installation](./installation) و[deploy](../deploy/README.md) | 2 |
| المصادقة وRBAC | [الأمان](./introduction/SECURITY.md) وتقارير RBAC | 3 |
| الترخيص والامتثال | [دليل الترخيص](./licensing/LICENSE_GUIDE.md) | 4 |
| البيانات والترحيلات | [مرجع مخطط قاعدة البيانات الحالي](./architecture/DATABASE_SCHEMA_RUNTIME_REFERENCE.md) و[تقرير الإغلاق](./phases/PHASE_5_DATABASE_CLOSURE.md) | 5 |
| API وWebhooks | [مرجع API وWebhooks الحالي](./api/API_RUNTIME_REFERENCE.md) | 6 |
| المواعيد والحجوزات | [مرجع المواعيد والحجوزات الحالي](./domains/APPOINTMENTS_RUNTIME_REFERENCE.md) | 7 |
| المرضى والبوابة | [مرجع المرضى وبوابة المريض](./domains/PATIENT_PORTAL_RUNTIME_REFERENCE.md) | 8 |
| الحملات والعملاء المحتملون | [مرجع الحملات والعملاء المحتملين](./domains/CAMPAIGNS_LEADS_RUNTIME_REFERENCE.md) | 9 |
| WhatsApp | [تكامل WhatsApp](./api/WHATSAPP_INTEGRATION.md) | 12 |
| Meta وSocial | [تكامل Meta](./api/META_INTEGRATION_GUIDE.md) | 13 |
| إدارة المحتوى والوسائط | [توثيق إدارة المحتوى](./CONTENT_MANAGEMENT_README.md) | 14 |
| التقارير والتتبع | [تقارير التحليل](./analysis) | 15 |
| الواجهة وPWA والوصول | [مرجع الواجهة المشتركة وPWA والوصول](./domains/FRONTEND_PLATFORM_RUNTIME_REFERENCE.md) | 16 |
| الاختبارات والجودة | [مرجع الاختبارات وهندسة الجودة](./domains/TESTING_QUALITY_RUNTIME_REFERENCE.md) | 17 |
| العمليات والنشر | [مرجع العمليات والنشر والمراقبة](./domains/OPERATIONS_DEPLOYMENT_MONITORING_RUNTIME_REFERENCE.md) و[حزمة النشر](../deploy/README.md) | 18 |
| حوكمة التوثيق والاستدامة | [التقرير الختامي لحوكمة التوثيق والاستدامة](./FINAL_DOCUMENTATION_GOVERNANCE_SUSTAINABILITY_REPORT.md) و[مصفوفة التغطية](./DOCUMENTATION_COVERAGE_MATRIX.md) | 19 |

## التقارير والخطط

التقارير والخطط لا تُعد تلقائيًا مراجع تشغيلية. راجع حالتها في [سجل الوثائق](./DOCUMENTATION_REGISTRY.json) قبل الاعتماد عليها.

- [تقارير التحليل](./analysis)
- [خطط التنفيذ](./implementation)
- [تقارير الأداء](./performance)
- [البحث والمصادر](./research)
- [توثيق SaaS](./saas)
- [التوثيق التاريخي](./archive)

## قواعد الفهرسة

- لا تضف رابطًا لملف غير موجود.
- لا تستخدم `final` أو `latest` بدل حالة الوثيقة.
- اربط الوثيقة القديمة ببديلها قبل وسمها `deprecated`.
- أضف أي وثيقة جديدة إلى سجل الوثائق عبر `pnpm docs:check`.
- عند تغيير API أو schema أو صلاحيات أو بيئة تشغيل، راجع الوثائق المرتبطة في مصفوفة التغطية.

## التحقق المحلي

```bash
pnpm docs:check
pnpm format:check
```

لا يغني فحص السجل عن مراجعة محتوى الوثيقة مقابل الكود. التغطية التفصيلية تتم في مراحل المجالات المحددة في [الخطة التنفيذية](./DOCUMENTATION_EXECUTION_PLAN.md).
