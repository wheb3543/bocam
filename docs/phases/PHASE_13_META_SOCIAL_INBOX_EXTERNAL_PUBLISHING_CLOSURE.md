# تقرير إغلاق المرحلة 13: Meta وSocial Inbox والنشر الخارجي

**الحالة:** مكتملة ضمن نطاق التوثيق والتحقق  
**تاريخ الإغلاق:** 2026-09-12  
**المرحلة التالية:** المرحلة 14، إدارة المحتوى والوسائط

## 1. نطاق التنفيذ

تمت مراجعة طبقة Meta وSocial Inbox والنشر الخارجي من مستوى OAuth إلى مستوى Webhook، Rijndael/crypto settings، التفاعل مع التعليقات، والموصلات الخارجية لتوزيع المحتوى. لم يُعدّل التطبيق في هذه المرحلة، بل تم توثيق السلوك الحالي فقط مع تمييز المسارات الفعلية عن المسارات جاهزة للتفعيل أو المتوقعة في بيئة التشغيل.

## 2. النتائج

- `server/integrations/meta/metaBusinessOAuth.ts` يطبّق OAuth لــ Facebook Login for Business مع `state`, `code_verifier`, `code_challenge`, واكتشاف الأصول عبر `me/accounts` و`me/adaccounts`.
- `server/database/db/metaIntegrationSettings.ts` يعرّف إعدادات Meta (`appId`, `appSecret`, `verifyToken`, `pageAccessToken`, `facebookPageId`, `instagramAccountId`) ويُحدّث `socialInboxAccounts` عند توفر الصفحة أو الحساب.
- `server/api/metaSocialWebhookRoute.ts` يضمن التحقق من Challenges وقيمة التوقيع على `X-Hub-Signature-256`، ثم يقوم بمعالجة الحدث بعد الإقرار بـ 200.
- `server/integrations/meta/socialInboxMetaWebhook.ts` يطبع MQTT/Meta webhook payloads من Messenger وInstagram وFacebook إلى `MetaSocialInboxEvent` موحّد.
- `server/integrations/meta/socialInboxMetaActions.ts` يوفر إجراءات `reply`, `hide`, `private reply`, و`enrich` مع حدود Meta الحقيقية مثل `7-day window` على Instagram.
- `server/routers/socialInbox.ts` يعرض جهات التحكم الرئيسية: `accounts`, `threads`, `commentContexts`, `assign`, `replyToComment`, `setCommentHidden`, `sendCommentPrivateReply`, و`enrichCommentContext`، مع التحقق من صلاحيات `communications.*` ووجود Page Access Token.
- `server/database/db/socialPlatformIntegrationSettings.ts` يعرّف إعدادات OAuth لـ `x`, `linkedin`, `youtube`, و`tiktok` كموصلات نشر خارجية.
- `server/integrations/external/externalPublishingConnector.ts` يضع البنية العامة لـ `publishToExternalPlatform()` مع استراتيجيات chunk upload، direct publishing، وبيانات حالة `processing`/`failed`/`published`.
- `server/routers/metaOperations.ts` يضيف `overview` و`saveLeadForm` ضمن صلاحيات `integrations.view` و`integrations.connect`.

## 3. التحقق المنفذ

| الفحص | النتيجة |
|---|---|
| مراجعة `metaBusinessOAuth.ts` | مكتملة |
| مراجعة `metaIntegrationSettings.ts` | مكتملة |
| مراجعة `metaSocialWebhookRoute.ts` | مكتملة |
| مراجعة `socialInboxMetaWebhook.ts` | مكتملة |
| مراجعة `socialInboxMetaActions.ts` | مكتملة |
| مراجعة `socialInbox.ts` | مكتملة |
| مراجعة `socialPlatformIntegrationSettings.ts` | مكتملة |
| مراجعة `externalPublishingConnector.ts` | مكتملة |
| فحص الوثائق/registry | مكتمل |
| `pnpm docs:check` | ناجح |
| `pnpm check` | ناجح |

## 4. القيود والقرارات المؤجلة

- وجود OAuth و`pageAccessToken` في الكود لا يضمن أن الحسابات المتصلة فعليًا تعمل في كل بيئة؛ العلاقة المعتمدة هي بين تمكين الإعدادات والبيانات الفعلية الصادرة من Meta.
- Webhook verification يضمن صحة payload من Meta، لكنه لا يضمن أن الرسالة أو التعليق أو المستخدم الحالي صحيح من منظور إعلان/تجهيز/تسويق.
- الموصلات الخارجية تُعرّف كطبقة عامة للنشر، لكن لا يوجد في هذا النطاق تأكيد بأن كل منصة مهيأة بالكامل أو قابلة للتشغيل التجاري دون مزيد من تهيئة التطبيق والاتصال الميداني.
- Social Inbox وMeta Comment Actions تمثّل سياقًا تعاونيًا داخليًا، وليس ضمانًا لتسليم الرسالة بالضرورة إلى القناة/المنصة النهائية.
- لا توجد في هذا النطاق أدلة تدعم KPI أو ROAS أو conversion metrics نسبة إلى Social Inbox أو النشر الخارجي، لذلك لا يُسمح بإدراج أي ادعاءات تجارية من هذا المرجع.

## 5. قرار البوابة

أُغلقت المرحلة 13 ضمن نطاق التوثيق والتحقق. لا تبدأ المرحلة 14 قبل موافقة المستخدم كتابة.
