# دليل تفعيل المنصات الخارجية — مرحلة P2

تجهز مرحلة P2 طبقة OAuth موحدة لمنصات **X وLinkedIn وYouTube وTikTok** فوق مخزن الاتصالات والتوكنات المشفرة الموجود في بوابة SGH CRM. لا تبدأ المنصة أي اتصال حي قبل إدخال بيانات التطبيق وتفعيلها صراحة من صفحة إعدادات الربط.

## ما أصبح جاهزاً

| القدرة | X | LinkedIn | YouTube | TikTok |
|---|---|---|---|---|
| حفظ Client ID وClient Secret مشفراً | متاح | متاح | متاح | متاح |
| OAuth state وcallback آمن | متاح | متاح | متاح | متاح |
| PKCE | متاح | غير مطلوب في العقد الحالي | متاح | حسب تدفق التطبيق المعتمد |
| تخزين Access/Refresh Token | متاح | متاح | متاح | متاح عند إعادته من المزود |
| اكتشاف الحساب أو الأصل الأولي | حساب X | عضو LinkedIn | قناة YouTube | حساب TikTok |
| نشر نصي من Outbox | متاح | متاح | غير منطبق | غير منطبق |
| رفع فيديو أو وسائط | يحتاج مسار `media.write` حي | يحتاج تسجيل ورفع أصل حي | مؤجل إلى Resumable Upload | مؤجل إلى Direct Post/Upload |

لا يعيد أي راوتر أو واجهة `Client Secret` أو Access Token أو Refresh Token. تُحفظ القيم في `integration_connection_tokens` باستخدام AES-256-GCM، فيما تحتفظ واجهة الإدارة بحالة الاتصال والأصول والصلاحيات فقط.

## خطوات التفعيل لكل منصة

ابدأ من **التواصل ← إعدادات الربط**، وأدخل Client ID وClient Secret ثم فعّل المنصة. بعد ذلك يظهر زر المنصة ضمن «الحسابات والأصول المتصلة» ويبدأ نافذة التفويض الرسمية. يجب تسجيل رابط callback المعروض من النطاق المنشور في لوحة مطوري المزود قبل البدء.

| المنصة | إعداد التطبيق المطلوب | الصلاحية/القدرة الأساسية | تنبيه تشغيلي |
|---|---|---|---|
| X | OAuth 2.0 Redirect URI وClient credentials. | `tweet.read tweet.write users.read offline.access`، وتضاف `media.write` للوسائط. [1] | يختبر النشر النصي أولاً؛ لا تفعل رفع الوسائط حتى التحقق من خطة API وصلاحيتها. |
| LinkedIn | Redirect URI مطابق في تطبيق LinkedIn. | `w_member_social` للنشر الشخصي، و`w_organization_social` للنشر باسم مؤسسة عند توفر الدور. [2] | يبدأ النشر النصي؛ تحتاج الوسائط إلى رفع أصل وتسجيله قبل Posts API. [3] |
| YouTube | Web OAuth Client في Google Cloud مع YouTube Data API مفعلة. | `https://www.googleapis.com/auth/youtube.upload`. [4] | لا يستخدم YouTube Service Account؛ يجب تفويض مستخدم مرتبط بقناة. [4] |
| TikTok | تطبيق مقبول مع Content Posting API وRedirect URI مسجل. | `video.publish` و`user.info.basic` بحسب موافقة التطبيق. [5] | Direct Post وUpload يخضعان للأهلية ومراجعة التطبيق؛ سيختبر وضع المسودة عند عدم أهلية النشر المباشر. [5] |

## حدود مرحلة الوسائط الحالية

يستدعي خط Outbox موصلات X وLinkedIn للنصوص عند وجود اتصال وأصل مختار. أما YouTube وTikTok فيرفضان التنفيذ بشكل صريح وآمن قبل إرسال أي طلب، إلى أن تكتمل مرحلة وسائط الإنتاج. في YouTube يلزم إنشاء URI لجلسة Resumable Upload، تخزينه، إرسال الفيديو، ثم استئناف النقل باستخدام استجابة `308` عند الانقطاع. [6] في TikTok يلزم اختيار مسار Direct Post أو Upload وفق موافقة التطبيق، ثم تتبع حالة النشر. [5]

> لا تعتبر الوجهة جاهزة للنشر لمجرد ظهور اتصال «متصل». يجب اختيار الأصل المطلوب، والتحقق من Scope، وإنشاء اختبار محتوى خاص أو غير مدرج، ثم مراجعة سجل Outbox قبل تمكين النشر العام.

## المراجع

[1]: https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code "X OAuth 2.0 Authorization Code with PKCE"
[2]: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow "LinkedIn Authorization Code Flow"
[3]: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api "LinkedIn Posts API"
[4]: https://developers.google.com/youtube/v3/guides/authentication "YouTube Data API OAuth Authorization"
[5]: https://developers.tiktok.com/doc/content-posting-api-get-started "TikTok Content Posting API"
[6]: https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol "YouTube Resumable Upload Protocol"
