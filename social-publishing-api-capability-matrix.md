# مصفوفة واجهات النشر متعددة المنصات

**التاريخ:** 18 أغسطس 2026  
**الغرض:** اعتماد نموذج نشر موحّد يطبّق قواعد كل منصة في خادمها، بدلاً من وعد المستخدم بقدرات لا تدعمها واجهتها الرسمية.

## النتيجة التصميمية

> تُنشأ قطعة محتوى واحدة داخل SGH CRM، ثم تُولد منها «وجهة نشر» مستقلة لكل حساب ومنصة. تحتفظ كل وجهة بنسخة النص، الوسائط، الخصوصية، الحالة، المعرّف الخارجي، ونص الخطأ. وبهذا ينجح نشر Instagram ولا يحجب الفشل في X أو TikTok بقية الوجهات.

| المنصة | واجهة النشر الرسمية | أنواع المحتوى المرصودة | تدفق الوسائط | حقول رئيسية تستحق الواجهة | قيد/متطلب مؤثر |
|---|---|---|---|---|---|
| Facebook | Graph API / Video API | منشور صفحة، فيديو، Reel | جلسة رفع ثم رفع ثم إنهاء نشر للـ Reel | الوصف، العنوان، رابط الملف، الخصوصية، الموقع، الحالة | نشر Reels للصفحات فقط، ويتطلب `pages_manage_posts` و`pages_read_engagement`؛ حدّ 30 Reel عبر API كل 24 ساعة. [1] |
| Instagram | Instagram Content Publishing | صورة، فيديو، Reel، Story، Carousel | حاوية `media` ثم `media_publish`؛ ورفع قابل للاستئناف للفيديو | `caption`، `image_url`/`video_url`، `media_type`، نص بديل، كشف محتوى AI، شراكة | حساب احترافي متصل بصفحة ووسائط متاحة علناً؛ حاويات الفيديو يجب متابعة حالتها قبل النشر. [2] |
| X | X API v2 | منشور نصي أو مرفق بصور/GIF/فيديو | رفع بسيط أو مجزأ ثم `media_id` إلى `POST /2/tweets` | النص، حتى 4 `media_ids`، إعداد الردود، تمييز محتوى AI، استطلاع | OAuth المستخدم يتطلب `tweet.write` و`media.write`؛ معالجة الفيديو المجزأ غير متزامنة. [3] [4] |
| LinkedIn | Posts / Images / Videos APIs | نص، صورة، فيديو، مستند، مقال، صور متعددة، استطلاع | تهيئة رفع تعطي URN/رابط رفع، ثم ربط URN بالمنشور | `author` URN، `commentary`، الرؤية، توزيع الخلاصة، عنوان وبديل الوسيط | ترويسات نسخة LinkedIn مطلوبة؛ يتطلب النشر `w_organization_social` أو `w_member_social` وفق المالك. [5] [6] |
| YouTube | YouTube Data API v3 | فيديو أو Short وفق أبعاد/مدة الملف | `videos.insert` قابل للاستئناف مع بيانات `snippet` و`status` | العنوان، الوصف، العلامات، الفئة، الجمهور، الخصوصية، تاريخ النشر، الإفصاح عن الوسائط الاصطناعية | الجدولة تكون لفيديو خاص مع `publishAt`؛ مشاريع API غير المدققة ترفع الفيديو خاصاً افتراضياً. [7] |
| TikTok | Content Posting API | فيديو وصور | تهيئة Direct Post تعيد `publish_id` ورابط رفع أو سحب من رابط عام | عنوان/وصف، الخصوصية، السماح بالتعليقات/duet/stitch، غلاف، إفصاح تجاري وAI | يلزم `video.publish` وموافقة صريحة من المنشئ؛ عملاء غير مدققين ينشرون خاصاً فقط، وتوجد نافذة ساعة لرابط الرفع. [8] |

## ما يظهر للمستخدم في صفحة النشر

تتضمن الصفحة محرراً مركزياً للنص والوسائط ومعلومات الاكتشاف، وبطاقات وجهات لكل منصة. لا تعرض بطاقة إلا الحقول التي يستطيع المحول الرسمي دعمها. مثال ذلك: يعرض TikTok مستوى الخصوصية المتاح من استعلام معلومات المنشئ، بينما يعرض YouTube الفئة والجمهور وتاريخ النشر، ويعرض Instagram النص البديل ومؤشر المحتوى المولّد بالذكاء الاصطناعي.

## تفاصيل تنفيذ لا تُفقد

| المنصة | الحالة أو المعامل الذي يجب تخزينه | قاعدة التنفيذ |
|---|---|---|
| Instagram | معرّف الحاوية، حالة `status_code`، واستهلاك حد النشر | تنشأ حاوية قبل `media_publish`؛ الحاوية غير المنشورة تنتهي خلال 24 ساعة، ويُنصح بالتحقق مرة في الدقيقة لفترة محدودة عند الفيديو. [2] |
| Facebook Reel | معرّف الفيديو ورابط جلسة الرفع والحالة | الرفع ثلاثي المراحل: `start` ثم النقل إلى رابط `rupload` ثم `finish` مع `video_state=PUBLISHED`. [1] |
| X | `media_id` وحالة معالجة الفيديو ووقت انتهاء الأصل | الرفع المجزأ يمر بـ INIT وAPPEND وFINALIZE وSTATUS؛ تُرسل `media_ids` لاحقاً في طلب إنشاء المنشور. [4] |
| LinkedIn | Image/Video URN، تعليمات الرفع، ETags، وحالة المعالجة | لا يُربط الأصل بالمنشور قبل حصوله على URN؛ فيديوهات LinkedIn تعتمد رفعاً متعدد الأجزاء ويمكن حفظ captions وthumbnail. [6] |
| YouTube | معرف الفيديو وحالة الرفع/المعالجة و`privacyStatus` و`publishAt` | `videos.insert` يحمل `snippet` و`status`، وتكون الجدولة بفيديو خاص وموعد `publishAt`. [7] |
| TikTok | `publish_id`، رابط رفع مؤقت، وحالة النشر | يجب طلب معلومات المنشئ أولاً لتقييد الخصوصية حسب خياراته، ثم `video.publish`؛ حد التهيئة ستة طلبات/دقيقة لكل توكن ورابط الرفع صالح ساعة واحدة. [8] |

## بنية التنفيذ المرحلية

| المرحلة | ما سيتم تنفيذه الآن | ما ينتظر الربط الحي |
|---|---|---|
| النواة | مسودات، نسخ منصات، وسائط، حالات، موافقات، سجل تدقيق، واجهة RTL، وتحقق توافق المحتوى | لا توجد طلبات خارجية |
| المحولات الحية | واجهة موحدة لكل منصة وعمليات آمنة من الخادم فقط | OAuth/توكنات التطبيق، مراجعات المنصات، الحسابات المصرح بها |
| الجدولة | تخزين موعد ووجهات جاهزة وإعادة محاولة idempotent مع قفل لكل وجهة | تشغيل دوري خادمي يتحقق من المستحق وينفذ المحولات |
| المتابعة | مزامنة الحالة ومعرّفات المنشورات وإظهار روابطها | Webhooks أو استعلام حالة مضبوط حسب دعم كل منصة |

## مراجع

[1] [Meta — Facebook Reels Publishing API](https://developers.facebook.com/documentation/video-api/guides/reels-publishing)

[2] [Meta — Instagram Content Publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing)

[3] [X — Create Posts API](https://docs.x.com/x-api/posts/create-post)

[4] [X — Chunked Media Upload](https://docs.x.com/x-api/media/quickstart/media-upload-chunked)

[5] [LinkedIn — Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)

[6] [LinkedIn — Videos API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/videos-api)

[7] [YouTube — Videos Resource](https://developers.google.com/youtube/v3/docs/videos)

[8] [TikTok — Content Posting Direct Post](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)
