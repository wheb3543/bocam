# مواءمة Meta Webhooks مع صندوق البريد الموحد

## المصادر الرسمية المراجعة

| المجال | المصدر | القرار التطبيقي |
|---|---|---|
| التحقق والتوقيع | [Meta Webhooks for Messenger Platform](https://developers.facebook.com/documentation/business-messaging/messenger-platform/webhooks) | توفير طلب `GET` يعيد `hub.challenge` فقط عند تطابق `hub.verify_token`، والتحقق من `X-Hub-Signature-256` باستخدام HMAC-SHA256 على جسم الطلب الخام. |
| رسائل Messenger | [messages Webhook Event Reference](https://developers.facebook.com/documentation/business-messaging/messenger-platform/webhooks/webhook-events/messages) | استخراج `sender.id` و`recipient.id` و`timestamp` و`message.mid` و`text` و`attachments` و`reply_to` و`referral`. |
| رسائل وتعليقات Instagram | [Instagram Webhook Examples](https://developers.facebook.com/documentation/instagram-platform/webhooks/examples) | دعم أحداث `messaging` و`changes[field=comments]`، وحفظ `comment_id` و`parent_id` وبيانات الكاتب والوسيط والنص. |
| تعليقات Facebook | [Webhooks for Pages](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-pages/) و[Page Webhook Reference](https://developers.facebook.com/docs/graph-api/webhooks/reference/page/) | معالجة `changes[field=feed]` عندما يكون `value.item=comment`، مع `comment_id` و`parent_id` و`post_id` و`from` و`message` و`verb`. |

## نموذج التطبيع

يُحفظ كل حدث في السجل الخام أولاً داخل `metadata` لأغراض التدقيق وإعادة المعالجة. ثم يُطبّع إلى محادثة وعناصر صندوق البريد كما يلي:

| حقل موحّد | Messenger / Instagram Messaging | Facebook / Instagram Comments |
|---|---|---|
| `platform` | `messenger` أو `instagram` | `facebook` أو `instagram` |
| `channelType` | `message` | `comment` |
| المعرّف الخارجي | `message.mid` | `comment_id` أو `value.id` |
| مفتاح المحادثة | `platform:accountId:sender.id` | `platform:accountId:post_or_media_id` |
| الكاتب | `sender.id` | `from.id` و`from.name` أو `from.username` |
| النص | `message.text` | `message` أو `text` |
| المرفقات | `message.attachments[]` | وسيط المنشور أو الـ media الموجود في الحمولة |
| الوقت | `timestamp` بالمللي ثانية | `created_time`/`entry.time` بالثواني أو المللي ثانية بعد التطبيع |
| المرجع الأب | `reply_to.mid` | `parent_id` |

## ضمانات المعالجة

ترد إشعارات Meta عبر HTTPS ويجب تأكيد استلامها بسرعة. يعيد المسار `200 OK` بعد قبول الحدث والتحقق من صحته. قد تعيد Meta إرسال الإشعارات أو تصل بترتيب غير متوقع، لذلك يعتمد التخزين على المعرّف الخارجي الفريد مع مفتاح حساب المنصة، ويستخدم وقت الحدث في الترتيب بدلاً من وقت الاستلام.

## الاشتراكات المطلوبة عند التفعيل

| حساب | حقول الاشتراك المقترحة |
|---|---|
| Facebook Page / Messenger | `messages` و`message_echoes` و`message_reads` و`message_deliveries` و`message_reactions` و`feed` |
| Instagram Professional | `messages` و`messaging_seen` و`message_reactions` و`message_edit` و`comments` و`live_comments` |

## متطلبات التفعيل الحي

يتطلب التفعيل النهائي تطبيق Meta منشوراً، نقطة HTTPS بشهادة TLS صالحة، App Secret، Verify Token، Page access token، والـ permissions المناسبة مثل `pages_manage_metadata` و`pages_show_list` لتعليقات Page، و`pages_messaging` لرسائل Messenger. تتطلب بيانات عملاء خارج أدوار التطبيق عادةً Advanced Access/App Review.

## تأكيد من المراجعة المباشرة للوثائق

أكدت وثائق Messenger أن طلب تحقق Webhook يستخدم `hub.mode=subscribe` و`hub.verify_token` و`hub.challenge`، وأن الاستجابة الصحيحة تعيد قيمة التحدي فقط عند تطابق الرمز. كما أكدت وثائق Instagram أن نقطة النهاية تتلقى JSON وتتحقق من صحته، وأن الاشتراك يتم على مستوى حقول حساب Instagram Professional. لا يبدأ أي تعديل تنفيذي قبل مراجعة صفحة Facebook Pages الرسمية وتجميع القائمة النهائية للحقول المطلوبة.

تؤكد وثائق Facebook Pages أن تعليقات الصفحة تصل عبر اشتراك `feed`، بينما تصل رسائل Messenger عبر `messages`. يتطلب اشتراك `feed` صلاحيتي `pages_manage_metadata` و`pages_show_list`، وتحتاج الرسائل إلى `pages_messaging` ورمز وصول صفحة صادر عن مستخدم لديه مهمة مناسبة على الصفحة. وتوضح وثائق Instagram أن الاستقبال ينقسم إلى `messaging` للرسائل و`comments` للتعليقات لحساب Instagram Professional.

## دليل التفعيل الحي من صفحة «ربط Meta»

صفحة الإدارة المتاحة في `/admin/communications/meta-settings` هي المصدر الوحيد لإعداد هذا التكامل. يصل إليها دور `admin` فقط. تحفظ الصفحة القيم الحساسة بتشفير AES-256-GCM على الخادم ولا تعيد عرضها بعد الحفظ؛ تظهر فقط حالة أنها محفوظة. تشفير القيم يعتمد على مفتاح الخادم الأساسي، لذلك يجب عدم تغيير مفتاح جلسات الخادم من دون حفظ نسخة احتياطية وإدخال أسرار Meta من جديد.

| القيمة المطلوبة | مكان الحصول عليها | الغرض داخل النظام |
|---|---|---|
| `App ID` | لوحة تطبيق Meta | تعريف التطبيق للموظف الإداري وتوثيق الإعداد. |
| `Facebook Page ID` | إعدادات الصفحة أو Graph API Explorer | إنشاء حسابي Facebook وMessenger في صندوق البريد وربط أحداث الصفحة. |
| `Instagram Professional Account ID` | الحساب الاحترافي المرتبط بالصفحة | إنشاء حساب Instagram في صندوق البريد وربط الرسائل والتعليقات. |
| `App Secret` | Settings → Basic في تطبيق Meta | التحقق من `X-Hub-Signature-256` على الجسم الخام؛ لا يُرسل أبداً إلى المتصفح. |
| `Verify Token` | قيمة عشوائية يختارها المسؤول | مطابقة طلب التحقق الأولي وإرجاع `hub.challenge`. |
| `Page Access Token` | رمز وصول الصفحة لمستخدم ذي مهمة وصلاحيات مناسبة | تثبيت التطبيق على الصفحة والاشتراك في الحقول، والردود المستقبلية عبر Graph API. |

### خطوات التفعيل

1. أنشئ أو افتح تطبيق Meta، وأضف منتج **Webhooks** ومنتج **Messenger**، ثم أضف منصة Instagram الملائمة لنوع تسجيل الدخول المستخدم. يجب أن تكون نقطة النهاية HTTPS ومتاحة للعامة. [1] [2]
2. افتح صفحة **ربط Meta** في لوحة SGH، وأدخل App ID ومعرف صفحة Facebook ومعرف حساب Instagram Professional. أدخل App Secret وVerify Token وPage Access Token، ثم فعّل مفتاح **تفعيل Webhook** واحفظ. إنشاء الإعداد يسجل الحسابات في صندوق البريد بحالة `pending`؛ تتحول إلى `connected` بعد استقبال أول حدث صحيح.
3. في لوحة Webhooks في Meta، عيّن Callback URL إلى `https://sghcrm-efgar5cn.manus.space/api/webhooks/meta-social-inbox`، وأدخل Verify Token نفسه. يجب أن يعيد النظام قيمة `hub.challenge` عند التطابق فقط. [1]
4. اشترك في حقول صفحة Facebook المناسبة. استخدم `messages` للرسائل و`feed` للتعليقات؛ ولتفاصيل تجربة الرسائل يمكن إضافة `message_echoes` و`message_reads` و`message_deliveries` و`message_reactions`. تتطلب Meta تثبيت التطبيق على الصفحة بواسطة `/{page-id}/subscribed_apps` مستخدماً Page Access Token مناسباً. [3]
5. للحساب الاحترافي في Instagram، اشترك في `messages` للرسائل و`comments` للتعليقات. أضف `messaging_seen` و`message_reactions` و`message_edit` و`live_comments` فقط إذا كانت فرق العمل تحتاج هذه الحالات في الصندوق. [4]
6. راجع صلاحيات التطبيق قبل اختباره مع مستخدمين خارج أدوار التطبيق. تتطلب أحداث `feed` على الصفحة `pages_manage_metadata` و`pages_show_list`، وتتطلب رسائل Messenger `pages_messaging`. قد تحتاج الصلاحيات إلى Advanced Access أو App Review قبل الإنتاج. [3]

> عند استلام POST صحيح وموقّع، يرسل المسار `EVENT_RECEIVED` فوراً ثم يطبع الحدث ويحفظه. يمنع `eventKey` الفريد تكرار التسليم، ويسجل فشل المعالجة في سجل الأحداث بدلاً من كشف أي سر في الاستجابة.

## الاختبارات المنفذة

تغطي الاختبارات تشفير وفك تشفير إعدادات Meta، إخفاء الأسرار في نتيجة الحفظ، بناء أحداث Messenger وتعليقات Instagram وFacebook، التحقق من رمز GET وتوقيع HMAC-SHA256، والإقرار المتسامح مع فشل التخزين ومنع تكرار `eventKey`.

## المراجع

[1] [Messenger Platform Webhooks](https://developers.facebook.com/documentation/business-messaging/messenger-platform/webhooks)  
[2] [Instagram Platform Webhooks](https://developers.facebook.com/documentation/instagram-platform/webhooks)  
[3] [Webhooks for Facebook Pages](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-pages/)  
[4] [Instagram Webhook Examples](https://developers.facebook.com/documentation/instagram-platform/webhooks/examples)
