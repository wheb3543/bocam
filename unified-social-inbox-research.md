# تصميم صندوق البريد الموحد

## نطاق الإصدار الأول

سيُعاد استخدام المسار الحالي `/admin/communications/messages` وتحويله من صفحة placeholder إلى صندوق بريد موحد. سيعرض تبويباً موحداً للرسائل وتبويبات مستقلة للرسائل والتعليقات حسب المنصة، مع نموذج بيانات داخلي لا يزرع أو يختلق رسائل مستخدمين. عند عدم وجود حسابات موصولة تظهر حالات اتصال فارغة واضحة.

## التبويبات المطلوبة

| النوع | الاسم المعروض | المنصة |
| --- | --- | --- |
| all-messages | كل الرسائل | Messenger وInstagram وX وLinkedIn |
| messenger | Messenger | Messenger |
| instagram | Instagram | Instagram Direct |
| x | X | X Direct Messages |
| linkedin | LinkedIn | LinkedIn |
| facebook-comments | تعليقات فيسبوك | Facebook Page |
| instagram-comments | تعليقات Instagram | Instagram |
| x-comments | تعليقات X | X |
| linkedin-comments | تعليقات LinkedIn | LinkedIn |
| youtube-comments | تعليقات YouTube | YouTube |

## نموذج البيانات الموحّد

يُفضّل فصل المحادثة عن العنصر الوارد حتى تدعم الرسائل والتعليقات معاً: `socialInboxThreads` للمحادثة/سياق المنشور، و`socialInboxItems` لكل رسالة أو تعليق، و`socialInboxAccounts` لحسابات المنصات وحالة الاتصال. الحقول الأساسية: `platform`, `channelType`, `externalThreadId`, `externalItemId`, `authorExternalId`, `authorName`, `authorAvatarUrl`, `content`, `mediaUrl`, `parentExternalId`, `status`, `isRead`, `isStarred`, `assignedToUserId`, `publishedAt`, `rawPayload`.

## الخيارات المعمارية

| الخيار | المزايا | القيود والتكلفة | تعقيد الإعداد |
| --- | --- | --- | --- |
| طبقة موحّدة داخل SGH مع Webhooks وواجهات رسمية لكل منصة | بيانات قابلة للبحث والتعيين داخل CRM، استجابة شبه فورية، وتجربة موحدة للموظفين | يحتاج اعتماد تطبيقات وAccess Tokens وApp Review لبعض المنصات، إضافة إلى نقاط تحقق HTTPS | مرتفع |
| طبقة موحّدة داخل SGH مع مزامنة دورية للواجهات الرسمية | أبسط في التشغيل الأولي ولا يحتاج استقبالاً فورياً لكل الأحداث | تأخير في وصول الرسائل، حدود معدل الطلبات، واحتياج لمهمة مزامنة مستمرة | متوسط |
| موصل تجميعي خارجي ثم تخزين النتائج في SGH | يقلل عدد التكاملات المباشرة | اعتماد على مزود خارجي وتكلفة وقيود تغطية/صلاحيات، وقد لا يدعم كل أنواع التعليقات والرسائل | متوسط إلى مرتفع |

سيتم تنفيذ الإصدار الحالي على شكل **طبقة موحّدة قابلة للموصلات**: قاعدة البيانات وواجهة الصفحة وعمليات القراءة/التعيين/التحديد ستعمل فوراً، بينما تُضاف موصلات المنصات عند تزويد الاعتمادات الرسمية. لن يتم تفعيل موصل معطّل أو تخزين أسرار مخمّنة دون موافقة وقيم صريحة من المستخدم.

## حقائق موثّقة من الوثائق الرسمية

- Meta توفر Webhooks للرسائل وتعليقات Instagram، ويتطلب الإعداد endpoint HTTPS والتحقق من الطلبات، كما تحتاج رسائل Instagram إلى صلاحيات مثل `instagram_manage_messages` و`pages_manage_metadata` في الحالات المناسبة. [1] [2]
- Messenger Webhooks ترسل أحداث الرسائل وحالاتها، ويجب الرد بـ HTTP 200 خلال خمس ثوانٍ تقريباً مع التحقق من توقيع `X-Hub-Signature-256`. [3]
- X توفر V2 Webhooks لتسليم أحداث الحسابات والرسائل المباشرة، مع CRC وتحقق توقيع، واشتراط endpoint HTTPS عام سريع الاستجابة. [4]
- LinkedIn يدعم Webhooks للتطبيقات التي تمت الموافقة على حالة استخدامها، مع challenge-response وتحقق HMAC وتكرار محتمل للإشعارات يستلزم إزالة التكرار. [5]
- YouTube Data API توفر `commentThreads.list` و`commentThreads.insert` لإدارة سلاسل التعليقات، بينما push notifications الرسمية الموثقة مخصصة لتغييرات الفيديو/القناة وليست بديلاً مباشراً لإشعارات التعليقات؛ لذلك تحتاج تعليقات YouTube إلى مزامنة API أو آلية مناسبة بحسب الصلاحيات. [6] [7]

## المراجع

[1]: https://developers.facebook.com/documentation/instagram-platform/webhooks "Meta Instagram Platform Webhooks"
[2]: https://developers.facebook.com/documentation/business-messaging/instagram-messaging/webhooks "Meta Webhooks for Instagram Messaging"
[3]: https://developers.facebook.com/docs/messenger-platform/getting-started/webhook-setup/ "Meta Webhooks for Messenger Platform"
[4]: https://docs.x.com/x-api/webhooks/introduction "X V2 Webhooks API"
[5]: https://learn.microsoft.com/en-us/linkedin/shared/api-guide/webhook-validation "LinkedIn Webhooks"
[6]: https://developers.google.com/youtube/v3/docs/commentThreads "YouTube CommentThreads API"
[7]: https://developers.google.com/youtube/v3/guides/push_notifications "YouTube Push Notifications"
