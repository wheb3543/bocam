# دليل تجهيز الربط الحي — المرحلة P0

تضيف المرحلة P0 طبقة اتصال موحدة بين بوابة SGH CRM ومنصات Meta. تتيح هذه الطبقة بدء تفويض Meta Business، والتسجيل المضمن لـ WhatsApp Business، وتخزين التوكنات مشفرة، وربط الأصول العائدة، وتسجيل حالة Webhook من دون إظهار أي Secret أو Access Token في الواجهة.

> لا تبدأ الربط الفعلي قبل نشر checkpoint الذي يتضمن مسار callback الجديد. يجب أن يكون رابط العودة منشوراً عبر HTTPS وأن يطابق الرابط المسجل في تطبيق Meta.

## ما جهزته المرحلة P0

| المكون | السلوك | الضمان الأمني |
|---|---|---|
| `integration_connections` | يسجل حالة كل اتصال مفوض وتاريخه ونطاقاته وانتهاء صلاحيته. | لا يحفظ التوكن داخل سجل الاتصال نفسه. |
| `integration_connection_tokens` | يحفظ Access وRefresh وBusiness Tokens حسب نوعها. | تشفير AES-256-GCM باستخدام مفتاح الخادم؛ لا يوجد راوتر يعيد القيمة للمتصفح. |
| `integration_oauth_states` | يحفظ Hash لقيمة OAuth state وPKCE verifier المشفر لمدة عشر دقائق. | يمنع إعادة استخدام callback ويرفض state المنتهي أو المستهلك. |
| `integration_external_assets` | يخزن Page وInstagram وWABA والرقم وحساب الإعلان وغيرها. | يربط كل أصل باتصال محدد مع صلاحية اختيار الأصل للتشغيل لاحقاً. |
| واجهة الاتصالات | تعرض الاتصالات والأصول وحالة التوكن وWebhook فقط. | لا تعرض token أو Client Secret أو App Secret. |
| WhatsApp Embedded Signup | يلتقط رمز التفويض وWABA ID وPhone Number ID من حدث Meta الرسمي ثم يرسلها للخادم. | لا يستبدل الرمز أو يسجل التوكن من المتصفح. |

## إعداد Facebook Login for Business

يتطلب تدفق Meta Business تطبيقاً من نوع **Business**، وإضافة منتج **Facebook Login for Business**، ثم إنشاء Configuration. يحدد Configuration نوع التوكن والأصول والصلاحيات، ويعاد منه `Configuration ID` الذي تستعمله البوابة عند فتح نافذة التفويض. تدعم Meta طلب أصول وصلاحيات الأعمال عبر `config_id`، وعند طلب System User Access Token تستخدم تدفق Authorization Code وتبادل الرمز من الخادم. [1]

| الحقل في SGH CRM | أين تحصل عليه | ملاحظة |
|---|---|---|
| App ID | أعلى لوحة تطبيق Meta. | ظاهر في الواجهة ولا يعد سراً. |
| App Secret | App Dashboard → Basic settings. | أدخله مرة واحدة؛ لا يظهر بعد الحفظ. |
| Facebook Login for Business Configuration ID | Facebook Login for Business → Configurations. | أنشئ Configuration للأصول والصلاحيات التي تحتاجها المؤسسة. |
| OAuth Redirect URI | انسخه من **إعدادات الربط العامة** في البوابة. | سجله كما هو في Valid OAuth Redirect URIs. |
| Webhook Callback URL وVerify Token | انسخهما من نفس الصفحة. | استخدمهما لاشتراك Page وMessenger وInstagram وفق احتياج التشغيل. |

لا تضف صلاحيات لا يحتاجها التدفق. تتضمن مجموعة P0 المقترحة إدارة الأصول، Pages، Instagram، Lead Ads، وقراءة الإعلانات؛ تخضع الصلاحيات المتقدمة إلى App Review والتفويض الفعلي من مالك الأصل. [1]

## إعداد WhatsApp Embedded Signup

يتطلب WhatsApp Embedded Signup خادماً منشوراً بشهادة SSL صالحة، وإضافة نطاق البوابة إلى **Allowed domains** و**Valid OAuth redirect URIs**، ثم إعداد WhatsApp Configuration ID. ترسل Meta عند نجاح التدفق event من النوع `WA_EMBEDDED_SIGNUP` يحوي رمزاً قابلاً للاستبدال و`waba_id` و`phone_number_id`. تستبدل البوابة الرمز على الخادم ثم تخزن الناتج مشفراً. [2]

| خطوة | الإجراء في Meta | الإجراء في SGH CRM |
|---|---|---|
| 1 | أضف WhatsApp Business Platform للتطبيق واضبط Embedded Signup Configuration. | احفظ WhatsApp Embedded Signup Configuration ID في صفحة إعدادات الربط. |
| 2 | سجل النطاق المنشور ورابط OAuth. | استخدم رابط `OAuth Redirect URI` المعروض في الصفحة. |
| 3 | أعدد Webhook واشتراك `account_update` والحقول اللازمة للرسائل. | راقب بطاقة الاتصال؛ تظهر حالة الاشتراك `pending` إلى أن يتم التفعيل الحي. |
| 4 | أكمل التسجيل المضمن من مالك WABA. | اضغط «ربط WhatsApp Business»، وافق داخل النافذة الرسمية، ثم حدد الأصول العائدة. |

## حدود المرحلة الحالية

المرحلة P0 تبني التفويض والحفظ الآمن والأصول. لا تنفذ بعد النشر الخارجي الحي أو إعادة محاولات outbox أو مزامنة Lead Ads وMarketing Insights؛ هذه مهام المرحلة P1. لا يجب اعتبار ظهور اتصال «متصل» تصريحاً لنشر محتوى حتى يكتمل موصل النشر والاختبار الحي لكل أصل.

## خطوات التفعيل بعد النشر

أولاً، انشر checkpoint P0. بعد التأكد من أن `OAuth Redirect URI` يفتح من النطاق المنشور، أدخل App ID وApp Secret ومعرفات Configuration في صفحة **التواصل ← إعدادات الربط**. بعدها يبدأ المسؤول ربط Meta Business أو WhatsApp Business من الأزرار في قسم «الحسابات والأصول المتصلة».

عند نجاح الاتصال، راجع الأصول العائدة واختر فقط الصفحات والحسابات والأرقام التي ستستخدمها البوابة. لا تربط سجلات المرضى أو أي تفاصيل طبية ببيانات الإعلانات أو أحداث التحويل.

## المراجع

[1]: https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business "Facebook Login for Business — Meta Developer Documentation"
[2]: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation "WhatsApp Embedded Signup Implementation — Meta Developer Documentation"
