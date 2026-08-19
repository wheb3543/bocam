# ملاحظات وثائق المنصات الخارجية — مرحلة P2

**تاريخ المراجعة:** 19 أغسطس 2026

## X

تدعم X تدفق OAuth 2.0 Authorization Code with PKCE. يجب أن تتطابق `redirect_uri` تماماً مع المسجلة، وأن يتحقق الخادم من `state` ويحتفظ بـ PKCE verifier حتى تبادل الرمز. يتيح `offline.access` إصدار Refresh Token، وتشمل صلاحيات النشر الأساسية `tweet.write` و`users.read`، بينما تضيف `media.write` قدرة رفع الوسائط. [1] [2]

يجب أن يستبدل الخادم الرمز عند `https://api.x.com/2/oauth2/token` ويخزن Access وRefresh Tokens مشفرة. لا يستخدم موصل X أي اعتماد من المتصفح أو URL للسر. سيبدأ التنفيذ بالنص المنشور عبر API v2، مع إبقاء رفع الوسائط خلف قدرة تحقق واختبار حي منفصل بسبب اختلاف شروط المنتج وخطة API.

## LinkedIn

يستخدم LinkedIn تدفق Authorization Code ثلاثي الأطراف عبر `https://www.linkedin.com/oauth/v2/authorization`. يطلب التطبيق أقل Scope ممكن ويتحقق من `state`، ويستبدل الرمز خادمياً عند `/oauth/v2/accessToken`. تحذر الوثائق من تمرير Client Secret في URL أو مشاركته، كما يشترط LinkedIn Redirect URI موثوقاً ومطابقاً. [3]

يتطلب النشر الشخصي `w_member_social`، بينما يتطلب النشر بالنيابة عن منظمة `w_organization_social` ودوراً مناسباً في المنظمة. يعتمد Posts API الحديث على `POST /rest/posts` مع `Linkedin-Version` و`X-Restli-Protocol-Version: 2.0.0`، ويستلزم رفع أصل منفصل للصورة أو الفيديو أو المستند قبل إدراجه في منشور. [4]

## المراجع

[1]: https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code "X OAuth 2.0 Authorization Code with PKCE"
[2]: https://docs.x.com/fundamentals/authentication/oauth-2-0/user-access-token "X OAuth 2.0 User Access Token"
[3]: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow "LinkedIn Authorization Code Flow"
[4]: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api "LinkedIn Posts API"

## YouTube

يحتاج YouTube Data API إلى OAuth 2.0 من مستخدم مرتبط بقناة؛ لا يدعم Service Account لربط قناة YouTube. تدفق web-server يخزن Refresh Token مشفراً، ويطلب `https://www.googleapis.com/auth/youtube.upload` للرفع. [5]

يرفع الفيديو عبر جلسة Resumable: يبدأ الخادم جلسة `videos.insert` ويحفظ URI العائد من `Location` مشفراً، ثم يرفع الثنائيات عبر `PUT`. يستعلم عن التقدم بعد الانقطاع ويستأنف من Range الذي تعيده استجابة `308`، بينما تعالج 5xx بتراجع أسي. [6]

تفرض وثائق YouTube أن يكون حجم الكتل، عند استخدامها، مضاعفاً لـ 256 كيلوبايت باستثناء الكتلة الأخيرة. تتطلب حالة الانقطاع طلب `PUT` فارغاً بـ `Content-Range: bytes */TOTAL`؛ ثم يبدأ الاستئناف من البايت التالي للقيمة العليا في `Range`. وتؤدي جلسة منتهية إلى `404` وتتطلب بدء جلسة جديدة بدلاً من إعادة استخدام رابط ميت. [6]

## TikTok

يقدم TikTok Content Posting API مسارين: Direct Post للنشر بعد التفويض، وUpload لإرسال مسودة إلى حساب المستخدم. يتطلب التدفق User Access Token وإذن نشر مناسب ومراجعة التطبيق عند استخدام ميزات الإنتاج. ستُبنى البوابة على Direct Post مع تخزين التوكن وحالة النشر، وتبقي وضع المسودة خياراً عند عدم تأهيل التطبيق للنشر المباشر. [7] [8]

في Direct Post يبدأ الخادم بـ `POST /v2/post/publish/video/init/` بعد جلب إعدادات المنشئ وموافقته الصريحة. يرجع TikTok `publish_id` لتتبع العملية و`upload_url` لملفات `FILE_UPLOAD`، ويظل رابط الرفع صالحاً لمدة ساعة. تحفظ البوابة المعرّف والرابط والتقدم في حالة الوجهة، ثم تستعلم من `POST /v2/post/publish/status/fetch/`. تعني `PUBLISH_COMPLETE` اكتمال النشر، و`SEND_TO_USER_INBOX` مسودة تنتظر إكمال المستخدم، و`FAILED` فشلاً نهائياً، فيما تشير حالات المعالجة إلى استمرار النقل أو التحميل من رابط. لا يتجاوز التطبيق غير المدقق وضع الرؤية الخاصة حتى اجتياز تدقيق TikTok. [9] [10]

قبل Direct Post تستدعي البوابة `POST /v2/post/publish/creator_info/query/` ضمن `video.publish` لتتأكد من أن مستوى الخصوصية المراد استخدامه مسموح للحساب، وتلتزم بالقيود التي يعيدها الحساب لتعطيل التعليقات أو Duet أو Stitch. يبدأ التدفق في وضع `SELF_ONLY` الآمن، ولا يختار مستوى أوسع من دون إعداد صريح ومراجعة حية. [11]

## المراجع الإضافية

[5]: https://developers.google.com/youtube/v3/guides/authentication "YouTube Data API OAuth Authorization"
[6]: https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol "YouTube Resumable Upload Protocol"
[7]: https://developers.tiktok.com/doc/content-posting-api-get-started "TikTok Content Posting API"
[8]: https://developers.tiktok.com/doc/oauth-user-access-token-management "TikTok User Access Token Management"
[9]: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post "TikTok Direct Post"
[10]: https://developers.tiktok.com/doc/content-posting-api-reference-get-video-status "TikTok Get Post Status"
[11]: https://developers.tiktok.com/doc/content-posting-api-reference-query-creator-info "TikTok Query Creator Info"
