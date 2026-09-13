# خطة المرحلة 13: Meta وSocial Inbox والنشر الخارجي

**الحالة:** قيد التنفيذ – مراجعة كود وتوثيق الحوكمة
**التاريخ:** 2026-09-12  
**المرحلة الرئيسية:** 13 من 19  
**النطاق:** Meta OAuth، صفحة الأصول، Social Inbox، Webhook Meta، ومفاتيح النشر الخارجي على منصات X/LinkedIn/YouTube/TikTok

## 1. هدف المرحلة

توثيق المجال الحقيقي للتكاملات خارجية Meta وSocial Inbox والنشر الخارجي، مع فصل ما هو مكتمل ومُفعّل فعليًا، وما هو مجرد بنية جاهزة للتفعيل أو إعدادات إضافية لا تعني أن التشغيل التجاري موجود بالفعل. الهدف هو التحقق من السلوك الفعلي في الكود، لا الاستناد إلى مزاعم تراخيص أو أتمتة أو الوصول الكامل غير الموثق.

## 2. النتائج الأولية للفحص

### 2.1 Meta OAuth وملكية الأصول

- `server/integrations/meta/metaBusinessOAuth.ts` يعرّف OAuth لـ Facebook Login for Business باستخدام `config_id` و`code_challenge` و`S256`, ويُنشئ `IntegrationConnection` قبل التوجيه إلى Meta.
- `META_BUSINESS_REQUESTED_PERMISSIONS` تشمل:
  - `business_management`
  - `pages_show_list`
  - `pages_read_engagement`
  - `pages_manage_posts`
  - `pages_manage_engagement`
  - `pages_manage_metadata`
  - `pages_messaging`
  - `instagram_basic`
  - `instagram_content_publish`
  - `instagram_manage_comments`
  - `instagram_manage_messages`
  - `instagram_manage_insights`
  - `ads_read`
  - `leads_retrieval`
- بعد استبدال الرمز، تُفحص الأصول عبر `discoverMetaAssets()` باستخدام `GET /me/accounts` و`GET /me/adaccounts`, ثم تُخزن كـ `page`, `instagram_account`, و`ad_account` داخل `upsertIntegrationExternalAsset()`.
- هذا يثبت أن هناك مسار OAuth وasset discovery فعليًا، وليس مجرد إعدادات ثابتة فقط.

### 2.2 إعدادات Meta واستدعاء Webhook

- `server/database/db/metaIntegrationSettings.ts` يعرّف `saveMetaIntegrationSettings()` و`getMetaWebhookCredentials()` و`getMetaOAuthAppCredentials()`.
- هناك فصل صارم بين:
  - إعدادات التطبيق (`appId`, `appSecret`, `verifyToken`)
  - إعدادات `pageAccessToken`
  - إعدادات الحسابات المرتبطة (`facebookPageId`, `instagramAccountId`)
- `saveMetaIntegrationSettings()` يضمن تحديث `socialInboxAccounts` عند وجود Facebook Page أو Instagram Account مربوط.
- هذا يثبت أن Meta settings تُستخدم ليس فقط للتسجيل، بل أيضًا لتهيئة سجل الحسابات في Social Inbox.

### 2.3 Social Inbox وWebhook Meta

- `server/api/metaSocialWebhookRoute.ts` يقدم endpoint `/api/webhooks/meta-social-inbox` بآلية GET verification وPOST signature validation.
- `verifyMetaWebhookSignature()` يطبق `sha256=...` باستخدام `X-Hub-Signature-256` و`appSecret` من إعدادات Meta.
- `validateMetaWebhookChallenge()` يحقق `hub.mode=subscribe` و`verify_token` و`hub.challenge` قبل إرجاع التحدي لـ Meta.
- `processMetaSocialWebhookPayload()` يطبع الأحداث المعدلة من `normalizeMetaSocialInboxPayload()`, ثم يربط كل حدث في `ingestMetaSocialInboxEvent()`, ثم يضيف `enrichStoredMetaCommentContext()` و`notifyStoredSocialInboxInbound()` بشكل غير متزامن.
- `server/integrations/meta/socialInboxMetaWebhook.ts` يحدد `MetaSocialInboxEvent` و`normalizeMetaSocialInboxPayload()`، مع دعم:
  - `messenger` message
  - `instagram` message
  - `facebook` comment
  - `instagram` comment
- هذا يوضح أن الـ webhook يعمل على أنواع مختلفة من المواصفات ويفصل بين الرسائل والتعليقات بشكل واضح.

### 2.4 الإجراءات على التعليقات (Meta Comment Actions)

- `server/integrations/meta/socialInboxMetaActions.ts` يوفر:
  - `replyToMetaComment()`
  - `setMetaCommentHidden()`
  - `sendMetaCommentPrivateReply()`
  - `enrichMetaCommentContext()`
  - `enrichStoredMetaCommentContext()`
- `sendMetaCommentPrivateReply()` يفحص نافذة 7 أيام على Instagram، ويحافظ على التقييد الواقعي في Meta.
- `replyToMetaComment()` يرسل إلى `commentExternalId/comments` أو `commentExternalId/replies` حسب المنصة.
- `updateSocialInboxCommentMetadata()` و`updateSocialInboxCommentEnrichment()` تستعمل لتحديث البيانات الكامنة بعد التعامل مع التعليق.

### 2.5 Social Inbox Router

- `server/routers/socialInbox.ts` يعرّف نموذج صلاحيات ومهام:
  - `accounts`, `threads`, `commentContexts`, `thread`, `markRead`, `setStarred`, `archive`, `delete`
  - `assign`, `updateCommentWorkflow`
  - `replyToComment`, `setCommentHidden`, `sendCommentPrivateReply`, `enrichCommentContext`
  - `seedMetaTestData`, `clearMetaTestData`
- `replyToComment`, `setCommentHidden`, `sendCommentPrivateReply`, و`enrichCommentContext` جميعها تتطلب `communications.reply` و`Page Access Token` من Meta.
- هذا يثبت أن آليات الريل إلى Meta تمتلك حماية سمة وعملية، وليست واجهات حرة الوصول.

### 2.6 النشر الخارجي (External Publishing)

- `server/database/db/socialPlatformIntegrationSettings.ts` يعرّف إعدادات OAuth للإعلانات الخارجية على `x`, `linkedin`, `youtube`, و`tiktok` مع حقل `requestedScopes` و`isEnabled` و`clientId`/`clientSecretEncrypted`.
- `server/integrations/external/externalPublishingConnector.ts` يحدد توافقًا عامًا للنشر عبر المنصات المذكورة.
- الدوال الملموسة تتضمن:
  - `publishX()`
  - `publishLinkedIn()`
  - `publishYouTube()`
  - `publishTikTok()`
  - `publishToExternalPlatform()`
- توجد حالات فشل صريحة مثل:
  - عدم دعم X مع media إلا عبر مسار لاحق
  - عدم دعم LinkedIn مع media حتى تفعيل مسار الرفع الحي
  - التفاعل مع `storageGet` ورفع الفيديو في chunks
- هذا يثبت أن النشر الخارجي موجود كطبقة موصلات، لكنه لا يعني أن كل منصة جاهزة للتشغيل الإنتاجي تلقائيًا.

### 2.7 Meta Operations

- `server/routers/metaOperations.ts` يعرّف `overview` و`saveLeadForm` مع صلاحيتين `integrations.view` و`integrations.connect`.
- هذا مؤشر على وجود طبقة Meta operations مستقلة عن Social Inbox، خاصة مع `upsertMetaLeadForm()` و`getMetaOperationsOverview()`.

## 3. النطاق التقني المقصود

### المهمة 13.1: OAuth وتهيئة Meta

- توثيق `startMetaBusinessOAuth()` و`completeMetaBusinessOAuth()` وحقول `config_id` و`state` و`code_verifier` و`pkce`.
- توثيق استرداد الأصول: `pages`, `instagram_business_account`, و`adaccounts`.
- توثيق تخزين `IntegrationConnection` و`IntegrationOauthState` و`IntegrationAuditEvent`.

### المهمة 13.2: إعدادات Social Inbox وMeta Webhooks

- توثيق `metaIntegrationSettings` و`socialInbox` و`socialInboxWebhookEvents` و`socialInboxAccounts`.
- توثيق `GET` verification و`POST` processing مع التوقيع و`X-Hub-Signature-256`.
- توثيق آلية dedupe، `threadId`, `itemId`, و`notifyStoredSocialInboxInbound()`.

### المهمة 13.3: التعليقات وتوزيع الرسائل

- توثيق السياقات `commentContext`, `commentMetadata`, و`enrichMetaCommentContext()`.
- توثيق `replyToMetaComment` و`sendMetaCommentPrivateReply` و`setMetaCommentHidden`.
- توثيق فواصل المنصة: Facebook vs Instagram، والحدود التالية:
  - الـ private reply لـ Instagram لها نافذة 7 أيام
  - بعض الحقول أو الأذونات لا تتوفر بعد توثيق غير كامل

### المهمة 13.4: النشر الخارجي وقيم التهيئة

- توثيق `socialPlatformIntegrationSettings` و`externalPublishingConnector`.
- توثيق أن هناك دعمًا للمنصات `x`, `linkedin`, `youtube`, `tiktok` على مستوى الموصل، لكن التنفيذ الحقيقي قد يتوقف على أذونات التطبيق، المعالجة المتسلسلة، وأمان النقل.
- توثيق أن هذا لا يُعادل “نشر مباشر جاهز” دون مزيد من التهيئة والتدقيق على كل منصة.

### المهمة 13.5: التحقق النهائي

- فحص `pnpm docs:check` و`pnpm check` بعد إغلاق المرحلة.
- توثيق أي مصادقة/أذونات/توقيعات غير متاحة في بيئة التطوير الحالية.

## 4. القيم والقيود الملاحظة

- OAuth Meta وasset discovery موجودان في الكود، لكن هذا لا يضمن توصيل حسابات حقيقية في كل بيئة.
- `createMetaSocialWebhookRouter()` يرد بـ 200 فورًا بعد التوقيع فقط، ثم يعالج الحدث غير متزامنًا؛ هذا أنماط اعتماد Meta لصيانة التسليم، وليس ضمان وصول الرسالة إلى المستخدم أو التحديث النهائي.
- `socialPlatformIntegrationSettings` تثبت وجود حقل تكوين، لكن لا توجد في هذا النطاق أدلة تثبت أن كل منصة قد أُنشئت والتزامها فعليًا داخل التشغيل.
- لا يوجد في هذا النطاق ما يثبت ROI أو KPI أو conversion metrics للـ Social Inbox أو النشر الخارجي؛ أي ادعاء تجاري يحتاج مصدرًا منفصلًا.
- لا يجوز وصف أي مسار بأنه “جاهز للتشغيل” دون تنفيذ تكوينات app settings، access tokens، وأدوار المستخدم المناسبة.

## 5. معيار بوابة الاعتماد

تُغلق هذه المرحلة فقط بعد:

- [ ] مراجعة كاملة لملفات Meta OAuth والـ webhook والـ Social Inbox
- [ ] مراجعة `socialPlatformIntegrationSettings` و`externalPublishingConnector`
- [ ] توثيق صلاحيات `communications.*` و`integrations.*` والمستويات المرتبطة
- [ ] توثيق ID/Keys/Token/VerifyToken والقيود التشغيلية
- [ ] تشغيل التحقق النهائي (`pnpm docs:check` و`pnpm check`)
- [ ] اعتماد المستخدم كتابيًا للانتقال إلى المرحلة 14 أو إكمال المسار الحالي

## 6. القرار الحالي

المرحلة 13 الآن في مرحلة الفحص والتوثيق وفق المنهجية المعتمدة: مراجعة السلوك الفعلي، تسجيل القيود، وإقفال البوابة فقط بعد التحقق من مصادر الكود والاختبارات. لا يُسمح بالانتقال إلى المرحلة 14 قبل اعتمادٍ مكتوب.
