# خطة المرحلة 6: طبقة API وWebhooks

**الحالة:** مكتملة بعد التنفيذ والمراجعة
**التاريخ:** 2026-09-12
**المرحلة الرئيسية:** 6 من 19
**النطاق:** tRPC وREST وSwagger وWebhooks والتحقق والأخطاء

## 1. هدف المرحلة

إنتاج مرجع API مطابق للإجراءات والمسارات الحالية، يوضح نوع الطلب، الإدخال، الحماية، الأخطاء، وتدفق Webhooks، مع فصل tRPC الداخلي عن REST الخارجي وعدم اعتبار Swagger سجلًا كاملًا تلقائيًا.

## 2. نتائج الفحص الأولي

- نقطة tRPC الرئيسية هي `/api/trpc` وتجمع الراوترات في `appRouter`.
- الحماية الفعلية هي `publicProcedure` و`protectedProcedure` و`adminProcedure` و`permissionProcedure`، مع Feature Middleware منفصل.
- بوابة المريض تستخدم middleware محليًا داخل الراوتر، ولا يوجد `patientProcedure` عام في `trpc.ts`.
- Webhooks WhatsApp وMeta تستخدم GET للتحقق وPOST للتسليم، مع توقيع وتحقيق قبل المعالجة.
- بعض Webhooks تجيب 200 قبل اكتمال المعالجة لتجنب إعادة المحاولة.
- Swagger متاح في `/api-docs` و`/api-docs.json`، لكنه لا يولد فهرس tRPC كاملًا وبعض REST paths لا تستخدم Bearer.

## 3. خطة التنفيذ

### المهمة 6.1: جرد appRouter

استخراج المجالات والإجراءات من `server/routers/routers.ts` والراوترات الفرعية، وربط كل إجراء بالحارس وZod input إن وجد.

### المهمة 6.2: جرد REST

حصر Express routes المسجلة في `server/_core/index.ts` وملفات `server/api/`، مع توثيق status codes والحماية ومصادر الأسرار دون قيم حقيقية.

### المهمة 6.3: توثيق Webhooks

تغطية WhatsApp وMeta verification/signature/acknowledgment/processing، وربطها بالاختبارات وعدم ادعاء idempotency أو ضمان تسليم غير مثبت.

### المهمة 6.4: مراجعة Swagger

مطابقة مواصفة Swagger مع المسارات المعلنة، وتوثيق أن tRPC لا يظهر تلقائيًا، وأن Bearer scheme لا يمثل cookie/webhook/cron في كل المسارات.

### المهمة 6.5: مصفوفة الحماية والأخطاء

ربط كل عائلة endpoint بحارسها، validation، status codes، وأخطاء `UNAUTHORIZED` و`FORBIDDEN` وHTTP equivalents.

### المهمة 6.6: تحديث الوثائق والتعارضات

تحديث المرجع الحالي ووسم الدليل التاريخي وتسجيل التعارضات والفجوات في المصفوفة وسجل التعارضات.

### المهمة 6.7: التحقق والإغلاق

تشغيل اختبارات Webhook ورفع الوسائط وMeta، ثم `pnpm docs:check` و`pnpm check` وفحص الروابط وإنشاء تقرير إغلاق.

## 4. معايير القبول

- [x] جرد appRouter مرتبط بالمصادر الفعلية.
- [x] مسارات REST المسجلة موثقة مع حمايتها وحالاتها.
- [x] Webhook verification والتوقيع والإقرار والمعالجة موثقة.
- [x] patient portal middleware مميز عن procedure عام غير موجود.
- [x] حدود Swagger وBearer موثقة.
- [x] كل ادعاء مهم مرتبط بكود أو اختبار.
- [x] فجوات idempotency وrate limiting والـ endpoints غير المغطاة مسجلة.
- [x] الوثائق القديمة مرتبطة بمرجع حالي.
- [x] الاختبارات والفحوص المناسبة ناجحة أو قيودها موثقة.
- [x] تقرير الإغلاق منشأ قبل طلب اعتماد المرحلة 7.

## 5. القرار الحالي

تم تنفيذ مهام المرحلة 6 ضمن نطاق التوثيق والتحقق. تفاصيل النتائج والقيود في `docs/PHASE_6_API_WEBHOOKS_CLOSURE.md`. لا تبدأ المرحلة 7 قبل اعتماد المستخدم كتابة.
