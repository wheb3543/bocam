# خطة المرحلة 12: WhatsApp

**الحالة:** قيد التنفيذ – مرحلة التدقيق والتخطيط
**التاريخ:** 2026-09-12
**المرحلة الرئيسية:** 12 من 19
**النطاق:** مركز WhatsApp، Webhook، الرسائل، القوالب، المحادثات، الإعدادات، والتحليلات المرتبطة

## 1. هدف المرحلة

توثيق دورة WhatsApp من إعدادات الاتصال إلى استقبال الرسائل وتسجيلها ومعالجتها، مع فصل الواجهات البرمجية الفعّالة عن أي افتراضات متعلقة بميزة Meta أو جودة القوالب أو التزام fornecedores. الهدف هو ربط السلوك الموثق في الكود بالمسارات الحقيقية: health-check، webhook verification، inbound processing، sending، templates، conversations، settings، والتسليم الداخلي.

## 2. نتائج الفحص الأولي

### 2.1 الراوتر الرئيسي `server/routers/whatsapp.ts`

- `whatsappRouter` يضم `health`, `testConnection`, `normalizePhone`, و`whatsappAppRouter` الذي يجمع:
  - `conversationsRouter`
  - `messagesRouter`
  - `templatesRouter`
  - `analyticsRouter`
  - `settingsRouter`
- `health` يطلق `verifyWhatsAppHealth()` من `server/services/whatsappService`.
- `testConnection` يحول رقم الهاتف عبر `normalizePhoneNumber` ثم يرسل رسالة اختبار عبر `sendWhatsAppTextMessage`.
- `normalizePhone` يحدّد القيم الصحيحة من خلال طول الرقم واستبدال الأرقام غير القياسية وفق منطق `normalizePhoneNumber`.

### 2.2 Webhook `server/api/webhookRoutes.ts` و`server/integrations/webhooks/whatsappWebhook.ts`

- يوجد endpoint Express منفصل على `/api/webhooks/whatsapp` للـ GET verification وPOST processing.
- التحقق على GET يعتمد على `handleWebhookVerification()` و`verifyWebhookToken()`.
- POST يتحقق من توقيع `X-Hub-Signature-256` عبر `verifyWebhookSignature(req)` قبل معالجة payload.
- إذا كان payload صحيحًا، يتم تسجيل الحدث في قاعدة البيانات (`createWhatsAppWebhookEvent`) ثم تمريره إلى `handleWebhookPost()` لمعالجة الرسائل أو حالات القوالب/الحالة.
- `handleIncomingMessage()` يشتغل على `value.messages`, ينشئ أو يفتح محادثة، يحفظ الرسالة، ويعيد نشرها إلى `notification` و`pubsub` في بعض المسارات.
- `handleMessageStatus()` يشتغل على `value.statuses` لتحديث حالة الرسالة/القالب/المحادثة بحسب المعالج المناسب.

### 2.3 المحادثات والرسائل `server/routers/whatsapp/conversations.ts` و`messages.ts`

- `conversationsRouter` يملك `list`, `getCustomerInfo`, `getCustomerRecords`, `getById`, `search`, `unreadCount`, `create`, `update`, `archive`, `markAsRead`, `assignToUser`, `updateNotes`, `updateName`, `delete`.
- `assignToUser` يطلب صلاحية `communications.assign` ويُنشئ إشعار تعيين محادثة عبر `notifyWhatsAppAssignment` من `communicationNotificationService`.
- `delete` يمسح أولًا رسائل المحادثة ثم المحادثة نفسها.
- `messagesRouter` يملك `messages.listByConversation`, `send`, `uploadMedia`, `delete`, `exportConversation`, `searchInConversation`, `forward`، إلى جانب هذه العمليات العامة: `sendSimpleText`, `sendWelcomeMsg`, `sendTypingIndicator`, `sendBroadcast`, `scheduleBroadcast`, `quickReplies`.
- رسائل WhatsApp تتطلب صلاحيات `communications.reply`, `communications.broadcast`, `communications.templates.manage`, و`communications.manage` بحسب المسار.

### 2.4 القوالب والإعدادات `templates.ts` و`settings.ts`

- `templatesRouter` يدعم `list`, `getById`, `syncFromMeta`, `syncStatus`, `create`, `update`, `delete`, `sendTemplate`, `getTemplates`, `getTemplateStatus`, `sendMedia`, و`templateQuality`. 
- `syncFromMeta` و`syncStatus` يتطلبان في البيئة متغيرات مثل `WHATSAPP_BUSINESS_ACCOUNT_ID` و`WHATSAPP_PHONE_NUMBER_ID` و`META_ACCESS_TOKEN`; لا توجد حماية تنفيذية ضد غياب هذه القيم إلا التحقق المباشر داخل الدوال.
- `settingsRouter` يضم sub-routers: `connection`, `autoReply`, `scheduler`, `security`, `quality`, `userSubscriptions`, و`webhookEvents`.
- هذا يدل على وجود طبقة إعدادات مستقلة وعالية النطاق حول WhatsApp، وليست مجرد إعدادات ثابتة في ملف واحد.

### 2.5 الرسائل التلقائية ومصادر الإشعارات

- قسم `server/services/communicationNotificationService.ts` يحدد رسائل الإعلام/التعيين المتعلقة بالمحادثات WhatsApp.
- `notifyWhatsAppAssignment` يستعمل `source: 'whatsapp'` عند تعيين محادثة إلى مستخدم.
- `notificationPolicy.ts` يدرج `whatsapp` ضمن مصادر الإشعارات المسموح لها، مع أدوار ومتغيرات `recipientRoles` و`recipientTeamIds`.
- هذا يثبت أن وجود WhatsApp لا يقتصر على المحادثات داخل inbox؛ كما يشارك في سياسة الإشعارات العامة في النظام.

### 2.6 التذكير والجدولة

- يوجد في `server/services/whatsappScheduler.ts` عمليات لجدولة إرسال الرسائل/التحقق والـ cleanup.
- يوجد أيضًا `server/tasks/cron/appointmentReminders.ts` الذي يرسل تذكيرات قبل الموعد عبر WhatsApp.
- هذا يثبت أن WhatsApp لا يقتصر فقط على inbox، بل يتداخل مع المواعيد والتذكير التشغيلي.

## 3. النطاق التقني المقصود

### المهمة 12.1: الاتصال والتحقق

- توثيق `verifyWhatsAppHealth`, `testConnection`, وتهيئة `WHATSAPP_*` / `META_ACCESS_TOKEN`.
- توثيق `GET /api/webhooks/whatsapp` كمنفذ تحقق Meta.
- توثيق فشل التحقق بسبب غياب `WHATSAPP_WEBHOOK_VERIFY_TOKEN` أو توقيع غير صالح.

### المهمة 12.2: استلام الرسائل والـ Webhook

- توثيق `handleWebhookPost`، `handleIncomingMessage`, و`value.messages` / `value.statuses`.
- توثيق حفظ الرسائل في قاعدة البيانات عبر `whatsappMessages` و`whatsappConversations`.
- توثيق التفاعل مع `pubsub`، `SSE`، وسجلات webhook.

### المهمة 12.3: المحادثات والـ inbox

- توثيق محادثات WhatsApp عبر `conversationsRouter` و`database/db/whatsapp.ts`.
- توثيق الأدوار: `communications.view`, `communications.assign`, `communications.manage`, `communications.archive`, `communications.delete`.
- توثيق التأثير على `customerName`, `phoneNumber`, `notes`, `assignedToUserId`, و`unreadCount`.

### المهمة 12.4: الرسائل والقوالب

- توثيق `messagesRouter.send`, `broadcastRoutes.sendBroadcast`, وقوالب `templatesRouter.syncFromMeta` / `create` / `sendTemplate`.
- تسجيل أن القالب يحتاج `META_ACCESS_TOKEN` و`WHATSAPP_*` متغيرات سابقة، ولا يوجد ضمان تلقائي بأن القالب متاح قبل الاستخدام الفعلي.
- توثيق الاختلاف بين `messageType` و`template` و`interactive` في `messages.ts`.

### المهمة 12.5: الإعدادات والأمان

- توثيق `settingsRouter` مع `connection`, `autoReply`, `scheduler`, `security`, `quality`, و`webhookEvents`.
- ربط هذا بسجلات الأمان والحدود في `whatsappSecurity.ts` و`signatureVerifier.ts`.
- توثيق أن التوقيع والتحقق لا يضمن صلاحية المستخدم النهائي، بل يضمن فقط شرعية payload من Meta.

### المهمة 12.6: التحليلات والمراقبة

- توثيق `analyticsRouter` ومشاتل `whatsappTemplateQuality` / `whatsappNotifications` / `whatsappWebhookEvents`.
- توثيق أن التحليلات موجودة في البيانات، لكن لا تُستعمل كـ KPI تجاري غير موثق.

### المهمة 12.7: التحقق والتوثيق

- تشغيل اختبارات WhatsApp التي توجد في `server/integrations/__tests__`, `server/api/__tests__`, و`server/services/*` ذات الصلة.
- تشغيل `pnpm docs:check` و`pnpm check` بعد إغلاق المرحلة.

## 4. القيم/القيود الملاحظة

- لا يوجد في هذا النطاق ضمان أن Meta دائمًا يصلح الرسائل أو أن كل القوالب معتمدة وتنشط تلقائيًا؛ ما هو موثّق هو إعدادات التشغيل والمنطق الداخلي.
- `handleWebhookPost` يرد دائمًا بـ 200 بعد معالجة الفشل المحلي، لأن الخادم يضع القاعدة “respond 200 to Meta immediately and retry later”; هذا يثبت سلوك التشغيل، وليس ضمان التسليم.
- التحقق من Webhook يضمن سلامة payload، لكنه لا يثبت أن المستخدم/الرسالة صحيحة أو أن القالبٍ المرسل مسموح به في كل دولة/نطاق.
- بعض العمليات مثل `sendSimpleText` و`sendBroadcast` تتطلب `requireWhatsAppFeature()` أو صلاحيات محددة، لذلك لا يجب وصفها بأنها متاحة للجميع دون اعتماد.
- لا توجد أدلة داعمة في هذا النطاق على ROI أو attribution أو conversion metrics متعلقة بالرسائل WhatsApp، وأي ادعاء من هذا النوع يحتاج مصدرًا منفصلًا.

## 5. معيار بوابة الاعتماد

تُغلق هذه المرحلة فقط بعد:

- [ ] مراجعة كاملة لكود WhatsApp من `server/routers/whatsapp` و`server/api/webhookRoutes.ts` و`server/integrations/webhooks/whatsappWebhook.ts`.
- [ ] توثيق صلاحيات `communications.*` في `permissionProcedures` و`shared/rolePermissions.ts`.
- [ ] توثيق التحقق من توقيع Webhook، معالجة الرسائل، وتحديث الحالة.
- [ ] توثيق الفجوات بين إعدادات Meta والإرسال الفعلي والـ inbox.
- [ ] تشغيل الاختبارات والمراجعات المناسبة.
- [ ] اعتماد المستخدم كتابيًا للانتقال إلى المرحلة 13 أو إكمال المسار الحالي.

## 6. القرار الحالي

المرحلة 12 الآن في مرحلة الفحص والتخطيط، وفق المنهجية المطبقة في المشروع: تحقق المراجع الكود، توثيق دفق الرسائل، تسجيل القيود الأمنية/التشغيلية، ثم إغلاق البوابة قبل أي انتقال. لا يُسمح بالانتقال إلى المرحلة 13 قبل اعتمادٍ مكتوب.
