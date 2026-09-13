# مرجع API وWebhooks الحالي

**الحالة:** `working`
**الجمهور:** المطورون والمشغلون وفريق التكاملات
**المجال:** API, tRPC & Webhooks
**آخر مراجعة:** 2026-09-12
**المصادر:** `server/_core/index.ts`، `server/_core/trpc.ts`، `server/_core/swagger.ts`، `server/routers/routers.ts`، `server/routers/permissionProcedures.ts`، `server/api/`، `server/integrations/webhooks/`

> هذا المرجع يصف المسارات التي ثبتت من الكود الحالي. لا تُعتبر أسماء endpoints أو payloads في الوثائق التاريخية صحيحة ما لم تطابق الراوتر أو الاختبار الحالي.

## 1. طبقات API

يستخدم الخادم:

- tRPC عبر `/api/trpc` مع `superjson` وZod، وتُجمع الراوترات في `appRouter`.
- Express REST لمسارات OAuth والرفع والوسائط وWebhooks والمهام المجدولة والصحة وSwagger والتكاملات.
- Swagger UI على `/api-docs` ومواصفة JSON على `/api-docs.json`. مواصفة Swagger لا تولد مرجعًا تلقائيًا لكل إجراءات tRPC.

## 2. حماية tRPC

| الحارس | السلوك الحالي |
|---|---|
| `publicProcedure` | لا يتطلب جلسة |
| `protectedProcedure` | يتطلب `ctx.user`؛ وفي بيئة الاختبار يوجد مستخدم اختبار إداري تلقائيًا عند غياب المستخدم |
| `adminProcedure` | يتطلب `ctx.user.role === 'admin'` |
| `permissionProcedure(permission)` | يتطلب مستخدمًا ثم يستدعي `hasRolePermission` |
| Feature middleware | يتحقق من ميزات الترخيص، وهو منفصل عن RBAC |

مسار patient portal يعرّف middleware محليًا على `publicProcedure` للتحقق من جلسة المريض؛ لا يوجد في `trpc.ts` تصدير عام باسم `patientProcedure`. لذلك يجب عدم استخدام `patientProcedure` كاسم عام في مرجع API دون ربطه بملف الراوتر الفعلي.

## 3. عائلة tRPC

يُسجل `appRouter` الحالي مجالات منها: `auth`، `campaigns`، `tasks`، `appointments`، `leads`، `offers`، `camps`، `doctors`، `patientPortal`، `patientResults`، `whatsapp`، `socialInbox`، `metaIntegration`، `integrationConnections`، `content`، `notifications`، `reports/charts`، `tracking`، `license` و`publicContent`.

كل إجراء يجب توثيقه من تعريفه الفعلي من حيث:

- اسم الإجراء الكامل.
- query أو mutation.
- مخطط Zod الفعلي.
- الحارس والميزة المرخصة إن وجدت.
- الأخطاء المتوقعة وحدود البيانات.

لا يثبت وصف عام مثل "كل WhatsApp محمي بـprotectedProcedure" الحماية الفعلية؛ أجزاء WhatsApp تستخدم صلاحيات دقيقة، وبعض الإعدادات تستخدم `protectedProcedure`، ويجب الرجوع إلى الراوتر المحدد.

## 4. REST المسارات المثبتة

| المسار | الوظيفة | الحماية/التحقق |
|---|---|---|
| `GET /api/oauth/callback` | OAuth callback | يتحقق من `code` و`state` عبر SDK |
| `GET /api/webhooks/whatsapp` | Meta verification | تحقق من `hub.mode` وverify token وchallenge |
| `POST /api/webhooks/whatsapp` | استقبال WhatsApp | يتحقق من توقيع webhook ثم يقرّ الطلب ويعالج الحدث |
| `GET /api/webhooks/meta-social-inbox` | Meta verification | يتحقق من verify token وsubscribe mode |
| `POST /api/webhooks/meta-social-inbox` | Meta/Social Inbox events | HMAC SHA-256 على raw body، ثم إقرار 200 ومعالجة لاحقة |
| `GET /api/whatsapp/media/:mediaId` | proxy وسائط WhatsApp | cookie `admin_session` |
| `POST /api/whatsapp/upload` | رفع WhatsApp media | cookie `admin_session` وmulter |
| `POST /api/upload` | رفع وسائط | cookie و`media.upload` |
| `POST /api/upload/batch` | رفع متعدد | cookie و`media.upload`، حتى 20 ملفًا |
| `GET /api/media/folders/:folderId/download` | تنزيل ZIP لمجلد وسائط | cookie و`media.download` |
| `POST /api/license/deliver` | تثبيت ترخيص مركزي | يقبل ملفًا موقعًا ويعيد التحقق؛ لا يعتمد على جلسة ظاهرة في المسار |
| `POST /api/scheduled/*` | مهام مجدولة | المسارات المجدولة تتحقق من هوية cron وtask UID عبر SDK بحسب المسار |

توجد أيضًا callbacks لتكاملات Meta والمنصات الخارجية ومسارات صحة وتحديث ونسخ احتياطي وتهيئة؛ يجب فحص ملف التسجيل قبل نشر أي endpoint كمعلن عام.

## 5.1 حدود المعدل وIdempotency

- طبقة Express تضع حدًا للمصادقة قدره 20 طلبًا لكل IP خلال 15 دقيقة لمسارات login/register وعمليات OTP المحددة.
- توجد محددات عامة وحساسة معرفة في middleware، وتُطبق على مسارات التحديث والنسخ الاحتياطي والتهيئة عند تسجيلها.
- إرسال رسالة WhatsApp اليدوية يطبق محددًا داخل الذاكرة قدره 10 رسائل لكل مستخدم خلال دقيقة.
- توجد مفاتيح idempotency في بعض مسارات النشر الاجتماعي وتوجد اختبارات idempotency لـMeta ingestion، لكن لا يوجد إثبات عام لكل Webhooks أو إجراءات tRPC.
- لا تُوثق هذه الحدود كضمان موزع أو دائم دون مراجعة تخزين rate limit وسياسة التوسع.

## 5. Webhooks

### WhatsApp

- GET لاختبار التحقق.
- POST يرفض التوقيع غير الصالح بـ403.
- عند التوقيع الصحيح يجيب 200 مبكرًا لتجنب إعادة المحاولة من Meta، ثم يسجل الحدث ويعالج الرسائل والحالات.

### Meta Social Inbox

- GET لا يعيد challenge إلا عند `subscribe` وverify token صحيح.
- POST يتحقق من `X-Hub-Signature-256` باستخدام HMAC-SHA256 وraw body.
- يتم الإقرار بـ`EVENT_RECEIVED` ثم معالجة الأحداث وتخزينها لاحقًا.
- فشل معالجة حدث واحد لا يمنع تجميع نتيجة الأحداث الأخرى؛ يعاد عدد المستلم والفاشل.

لا توثق Webhook على أنه idempotent أو مضمون التسليم إلا إذا كان ذلك مثبتًا في handler والاختبارات.

## 6. الأخطاء والتحقق

التحقق من المدخلات في tRPC يعتمد Zod. أخطاء المصادقة المعتادة هي `UNAUTHORIZED`، وأخطاء الدور أو الميزة هي `FORBIDDEN`. REST يعيد JSON أو نصوص HTTP بحسب المسار، مع 400 للمدخلات غير الصالحة، و401 للجلسة المفقودة، و403 للتوقيع/الصلاحية، و404 للموارد غير الموجودة، و500 لأخطاء الخادم.

هذه القيم أمثلة على المسارات المفحوصة وليست عقدًا موحدًا لكل API؛ يجب توثيق كل endpoint من مصدره.

## 7. Swagger وحدوده

يُنشأ Swagger من JSDoc في ملفات الخادم مع security scheme باسم `bearerAuth`. لكن بعض REST paths تستخدم cookie أو توقيع webhook أو هوية cron بدل Bearer JWT، كما أن إعداد Swagger يحتوي خوادم أمثلة يجب مراجعتها قبل استخدامها في الإنتاج. لا تعتبر مواصفة Swagger الحالية سجلًا كاملًا لكل tRPC.

## 8. الاختبارات والحدود

الاختبارات الحالية تغطي Webhook routes وMeta signature/challenge وWhatsApp webhook ورفع الوسائط وصلاحيات بعض المسارات وتدفقات الراوترات. لا تثبت هذه المجموعة كل إجراءات `appRouter` ولا كل تكامل خارجي أو حدود الإنتاج ومعدلات الطلب.

المصادر المهمة:

- [مرجع REST وtRPC التاريخي](./REST_TRPC_API.md)
- [تشخيص Webhooks](./WEBHOOK_DIAGNOSTICS.md)
- [اختبارات Webhook](../../server/api/__tests__/webhookRoutes.test.ts)
- [اختبارات Meta Webhook](../../server/api/metaSocialWebhookRoute.test.ts)
