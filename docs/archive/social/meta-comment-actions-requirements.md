# متطلبات موصل عمليات تعليقات Meta

## العمليات المعتمدة

| العملية | Facebook Pages | Instagram Professional |
|---|---|---|
| رد عام | `POST /{comment-id}/comments` مع `message` | `POST /{ig-comment-id}/replies` مع `message` |
| إخفاء/إظهار | `POST /{comment-id}` مع `is_hidden` | `POST /{ig-comment-id}` مع `hide` أو الحقل الذي تدعمه النسخة الموصولة من Graph API |
| رد خاص | `POST /{comment-or-post-id}/private_replies` مع `message` | `POST /{ig-account-id}/messages` مع `recipient.comment_id` و`message.text` |
| إثراء السياق | قراءة المنشور والتعليق بالحقول المناسبة | قراءة الوسيط والتعليق والردود بالحقول المناسبة |

## القيود والصلاحيات

تتطلب إدارة تعليقات Instagram عبر Facebook Login for Business الصلاحيات `instagram_basic` و`instagram_manage_comments` و`pages_read_engagement`. يمكن للرد الخاص على تعليق Instagram أن يُرسل مرة واحدة فقط، وخلال سبعة أيام من إنشاء التعليق، مع قيد خاص للبث المباشر. تتطلب عمليات التعليقات في Facebook Pages صلاحيات القراءة/الإدارة المناسبة للتعليق وحساب Page Access Token؛ ويعرض كائن التعليق حقول `can_comment` و`can_reply_privately` قبل تمكين الإجراء في الواجهة.

> ينفّذ التطبيق كل عملية من الخادم فقط، باستخدام Page Access Token المخزّن مشفّراً في إعدادات Meta. لا تُعاد الأسرار إلى الواجهة ولا تُنفّذ أي عملية حية على بيانات الاختبار الموسومة.

## حقول الإثراء المستهدفة

| المصدر | حقول السياق | حقول التعليق |
|---|---|---|
| Facebook Post | `message`, `permalink_url`, `full_picture`, `type` | `like_count`, `comment_count`, `can_comment`, `can_reply_privately`, `is_hidden`, `is_private`, `parent` |
| Instagram Media | `caption`, `media_type`, `media_product_type`, `media_url`, `thumbnail_url`, `permalink` | `text`, `timestamp`, `like_count`, `replies`, `hidden`, `parent_id` |

## المراجع

[1] [Meta — Instagram Comment Moderation](https://developers.facebook.com/documentation/instagram-platform/comment-moderation)

[2] [Meta — Instagram Private Replies](https://developers.facebook.com/documentation/instagram-platform/private-replies)

[3] [Meta — Facebook Object Private Replies](https://developers.facebook.com/docs/graph-api/reference/object/private_replies/)

[4] [Meta — Facebook Comment Reference](https://developers.facebook.com/docs/graph-api/reference/comment/)
