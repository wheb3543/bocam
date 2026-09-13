# موصل عمليات تعليقات Meta والإثراء والمتابعة

**التاريخ:** 18 أغسطس 2026  
**النطاق:** تعليقات Facebook وInstagram في صندوق البريد الموحد.

## ما نُفّذ

يعالج النظام الآن تعليقات المنصتين بوصفها **سياقات منشور أو وسيط** قابلة للإدارة. تستدعي الواجهة إجراءات خادمية محمية فقط؛ فلا ينتقل Page Access Token المشفّر إلى المتصفح، ولا تُنفّذ أي عملية خارجية على حسابات بيانات الاختبار الموسومة.

| الميزة | التنفيذ |
|---|---|
| رد عام | Facebook عبر `/{comment-id}/comments`، وInstagram عبر `/{ig-comment-id}/replies`، مع حقل `message`. [1] |
| إخفاء/إظهار | Facebook عبر `is_hidden`، وInstagram عبر `hide`، ثم تحديث الحالة المحلية بعد نجاح Meta. [1] [2] |
| رسالة خاصة | Facebook عبر `/{comment-id}/private_replies` عند إتاحة الصلاحية، وInstagram عبر `/{ig-account-id}/messages` باستخدام `recipient.comment_id`. [3] [4] |
| إثراء خادمي | يجلب سياق منشور Facebook أو وسيط Instagram وحقول صلاحيات التعليق عند نقص Webhook، بشكل غير متزامن بعد الإقرار الفوري للحدث. |
| متابعة وتعيين | أُضيف حقل `isFollowUpRequired` مفهرساً إلى سياق التعليق، مع تعيين مستخدم نشط وفلتر «يتطلب متابعة». |

## الحماية والقيود

يفحص الخادم حالة الحساب وبيانات التعليق قبل الإجراء. يمنع الرد الخاص عندما تعيد Meta `can_reply_privately=false`، ويمنع رد Instagram الخاص بعد سبعة أيام من التعليق؛ حيث تقيد Meta الرد الخاص برسالة واحدة خلال هذه النافذة، مع استثناءات للبث المباشر. [4] لا تتحول نتيجة العمليات الحية إلى نجاح صامت؛ تعرض الواجهة رسالة نجاح أو خطأ ثم تعيد تحميل سياق التعليق.

> بيانات Meta التجريبية الموجودة في صندوق البريد **محمية من الرد والإخفاء والإثراء الحي**، حتى لا يصدر أي طلب خارجي بمعرّفات وهمية.

## نتيجة التحقق

اجتازت الاختبارات المركزة **24/24**، وتشمل مسارات الرد والإخفاء والرد الخاص ونافذة Instagram والإثراء، وواجهة المتابعة والتعيين والإرسال، وصلاحيات راوتر العمليات. تتحقق اختبارات الراوتر من غياب Page Access Token، ومنع الرد الخاص عند رفض Meta، وتحديث الإخفاء بعد نجاح العملية فقط، وحفظ نتائج الإثراء. نجح `pnpm run check` ونجح بناء الإنتاج.

نفّذت مجموعة Vitest الكاملة **940** اختباراً: نجح **932** وبقيت **8** إخفاقات سابقة وغير مرتبطة بهذا التغيير، موزعة على اختبار ترخيص، وخمسة اختبارات مخيمات تفترض قاعدة بيانات متاحة، واختبارَي حدود SEO تحتوي قيماً لا تحقق الشروط التي تختبرها.

## تفعيل العمليات الحية

لم تُرسل رسائل أو عمليات إخفاء فعلية خلال الاختبارات؛ يتطلب التفعيل الحي حفظ Page Access Token ساري وتفعيل إعدادات Meta من صفحة **إعدادات ربط Meta**، مع ربط Facebook Page وInstagram Professional Account والصلاحيات المناسبة. تتطلب إدارة تعليقات Instagram عبر Facebook Login for Business عادةً `instagram_basic` و`instagram_manage_comments` و`pages_read_engagement`. [1]

## المراجع

[1] [Meta — Instagram Comment Moderation](https://developers.facebook.com/documentation/instagram-platform/comment-moderation)

[2] [Meta — Facebook Graph API Comment](https://developers.facebook.com/docs/graph-api/reference/comment/)

[3] [Meta — Facebook Private Replies](https://developers.facebook.com/docs/graph-api/reference/object/private_replies/)

[4] [Meta — Instagram Private Replies](https://developers.facebook.com/documentation/instagram-platform/private-replies)
