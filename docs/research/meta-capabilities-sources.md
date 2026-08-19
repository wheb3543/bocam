# ملاحظات بحثية: قدرات Meta لبوابة SGH CRM

## مصادر تمت مراجعتها

| المصدر الرسمي | النتائج ذات الصلة |
|---|---|
| [Graph API](https://developers.facebook.com/docs/graph-api/) | Graph API هو طبقة القراءة والكتابة الأساسية لأصول Meta الاجتماعية، وتشير الوثائق إلى دعم الطلبات الدفعيّة، التعامل مع الأخطاء، التوسّع في الحقول، الطلبات الآمنة، والرفع القابل للاستئناف. |
| [WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview) | توفر المنصة رسائل مباشرة وتسويقية وخدمية ورسائل تحقق، قوالب، Webhooks، مكالمات، مجموعات، كتالوجات، تحليلات، إعلانات النقر إلى WhatsApp، ومدفوعات بحسب البلد والحساب والأهلية. |
| [Instagram Messaging](https://developers.facebook.com/documentation/business-messaging/instagram-messaging) | تغطي المنصة الرسائل، خصائص المحادثات، القوالب، Webhooks، مراجعة التطبيق، ومكالمات Messenger؛ كما تعرض Meta واجهة لرسائل تسويقية على Instagram. |
| [Marketing API](https://developers.facebook.com/documentation/ads-commerce/marketing-api) | تدعم إدارة بنية الحملات والإعلانات والمواد الإبداعية والمزادات والجماهير وInsights وWebhooks للإعلانات، إضافة إلى Conversions API والكتالوجات وأدوات التجارة. |
| [Lead Ads Webhooks](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-leadgen/) | يرسل `leadgen` إشعارات لحظية عند العميل المحتمل الجديد. يتطلب تثبيت التطبيق على الصفحة وPage Access Token وصلاحيات `leads_retrieval` و`pages_manage_metadata` و`pages_show_list` و`pages_read_engagement` و`ads_management`. |
| [Threads API](https://developers.facebook.com/documentation/threads) | يمكن إنشاء المنشورات واسترجاع الوسائط والملفات الشخصية وإدارة الردود وحذف المنشورات والاطلاع على Insights وWebhooks وoEmbed. |
| [WhatsApp Embedded Signup](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview) | واجهة تفويض تسجل أصول العميل تلقائياً وتعيد WABA ID وPhone Number ID ورمزاً قابلاً للاستبدال. تتطلب تبادلاً خادمياً للرمز وتسجيل الرقم والاشتراك في Webhooks؛ ويلزم `whatsapp_business_management` و`whatsapp_business_messaging` لتدفق Cloud API. |
| [Conversions API for Business Messaging](https://developers.facebook.com/documentation/ads-commerce/conversions-api/business-messaging) | يرسل أحداث المحادثات التجارية المصرح بها من الخادم إلى Meta لقياس وتحسين إعلانات النقر إلى WhatsApp وMessenger وInstagram، مع إمكانية التحقق من الأحداث في Events Manager. |
| [Facebook Login manual flow](https://developers.facebook.com/documentation/facebook-login/guides/advanced/manual-flow) | يبدأ التفويض من `dialog/oauth` بمعلمات `client_id` و`redirect_uri` و`state`. يجب أن يكون Redirect URI مسجلاً في إعدادات التطبيق، ويستخدم `state` لمنع CSRF ويعود دون تغيير إلى callback. |
| [WhatsApp Embedded Signup implementation](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation) | يتطلب خادم التسجيل المضمن شهادة SSL صالحة، وتحميل Facebook JavaScript SDK وتهيئته بـ App ID وإصدار Graph API، وإعداد callback واشتراك account update قبل بدء تدفق ربط أصول WhatsApp. |

هذه ملاحظات أولية فقط؛ ستُقارن لاحقاً بحالة البوابة الحالية ومتطلبات Meta الرسمية قبل توصية أي تكامل حي.
