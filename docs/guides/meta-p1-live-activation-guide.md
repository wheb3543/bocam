# دليل التفعيل الحي — مرحلة P1 للنشر وLead Ads وConversions API

تجهز مرحلة P1 طبقات التسليم والاستقبال والقياس داخل بوابة SGH CRM، لكنها لا ترسل أي منشور أو Lead أو حدث تحويل إلى Meta قبل وجود اتصال OAuth مفوض وأصل مختار. يضمن ذلك عدم الاعتماد على متغيرات بيئة ثابتة أو نسخ توكنات يدوياً عند بدء التفعيل الحقيقي.

## ما أصبح جاهزاً

| المجال | الجاهزية في البوابة | ما يحدث بعد الربط الحي |
|---|---|---|
| Facebook Publishing | موصل نص وصورة واحدة، Outbox، idempotency، سجل محاولة وإعادة محاولة. | يستهلك Heartbeat مهمة التسليم، ويكتب معرف المنشور والرابط الخارجي عند النجاح. |
| Instagram Publishing | إنشاء Media Container، حالة معالجة، نشر عند `FINISHED`، Carousel حتى عشرة عناصر ضمن العقد. | تبقى الوسائط عامة على رابط قابل للوصول إلى أن تنتهي محاولة Meta، ثم تحفظ حالة الحاوية ومعرف الوسيط. [1] |
| Lead Ads | استخراج إشعار `leadgen` من Webhook وتخزينه مشفراً مع منع التكرار. | يسترجع الموصل اللاحق بيانات النموذج من Graph API ثم يطبق خريطة الحقول وقواعد إسناد CRM. [2] |
| Conversions API | Outbox مشفر و`event_id` فريد وحالة تسليم وتشخيص في لوحة الربط. | يرسل Heartbeat حدثاً عاماً إلى Dataset/Pixel المختار ويحتفظ فقط بملخص النتيجة. [3] |

## تسلسل التفعيل الحقيقي

بعد نشر النسخة، ينفذ المسؤول الربط من **التواصل ← إعدادات الربط ← الحسابات والأصول المتصلة**. يكتمل Facebook Login for Business أولاً، ثم تُختار صفحة Facebook وحساب Instagram وDataset أو Pixel المعتمد. عند اختيار صفحة أو حساب Instagram، تنشئ البوابة حساب نشر داخلياً وتربطه بالاتصال والأصل؛ لا يتطلب ذلك إدخال Access Token في أي حقل واجهة.

ثم يجري اختبار منفصل لكل أصل: منشور Facebook نصي تجريبي، ثم منشور Instagram بصورة أو Reel تجريبي، وبعد ذلك فحص سجل محاولات التوزيع. يحتاج النشر إلى الصلاحيات والمهام التي توضحها Meta، ومن بينها مهام إنشاء المحتوى وإدارة الصفحة والإشراف عند النشر إلى Page. [4]

| الاختبار | نتيجة القبول |
|---|---|
| Page أو Instagram asset محدد | تظهر حالة حساب النشر «متصل» مع الأصل المرتبط، ولا يظهر التوكن. |
| منشور Facebook | تسجل الوجهة `published` ومعرف ورابط خارجيان أو خطأ مصنف قابل للتشخيص. |
| Instagram video أو Reel | تتحول الوجهة إلى `processing` أثناء معالجة الحاوية، ثم `published` بعد حالة `FINISHED`. [1] |
| Lead Ads | يرد Webhook موقع، ويسجل حدث `leadgen` واحد فقط لكل `leadgen_id`. |
| CAPI | يظهر حدث عام في Events Manager مع مطابقة وDeduplication صحيحتين عند استخدام Pixel أيضاً. [3] |

## حدود الحماية والامتثال

تبقى الحمولات الخام لإشعارات Lead Ads وحالات CAPI مشفرة داخل قاعدة البيانات ولا تعرض في الواجهة. يجب أن تستخدم أحداث CAPI أسماء أعمال عامة مثل `Lead` و`Schedule` و`CompleteRegistration` فقط. لا تمرر إلى Meta التشخيص أو التحاليل أو الوصفات أو محتوى المحادثات أو سبب الزيارة. كما يجب مراجعة نص الموافقة وسياسات الخصوصية والتسويق قبل أي استخدام حي للقياس أو حملات العملاء المحتملين.

## ما يؤجل إلى المرحلة التالية

يبقى استرجاع حقول نموذج Lead Ads الفعلية وتحويلها إلى سجل CRM بعد منح App Review و`leads_retrieval`، كما أن Facebook Video API والمعارض متعددة الصور ورفع الفيديو القابل للاستئناف تحتاج اختبارات حيّة منفصلة قبل تفعيلها. لم تبدأ موصلات X وLinkedIn وYouTube وTikTok؛ ستبنى فوق طبقة OAuth والأصول الحالية بعد تثبيت حسابات Meta واختبارات P1.

## المراجع

[1]: https://developers.facebook.com/documentation/instagram-platform/content-publishing "Meta Instagram Content Publishing"
[2]: https://developers.facebook.com/documentation/ads-commerce/marketing-api/guides/lead-ads "Meta Lead Ads"
[3]: https://developers.facebook.com/documentation/ads-commerce/conversions-api "Meta Conversions API"
[4]: https://developers.facebook.com/documentation/pages-api/posts "Meta Pages API — Posts"
