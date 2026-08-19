# ملاحظات وثائق Meta الرسمية — مرحلة P1

**تاريخ المراجعة:** 19 أغسطس 2026

## Facebook Pages Publishing

تنشر صفحة Facebook منشوراً نصياً أو رابطاً عبر `POST /{page_id}/feed`، بينما تستخدم الصور `POST /{page_id}/photos`. يتطلب النشر صلاحيات Pages ذات الصلة وتفويض مستخدم يملك مهام إنشاء المحتوى وإدارة الصفحة والإشراف. يعيد الطلب الناجح معرف المنشور الخارجي؛ يجب أن يحفظه نظام SGH CRM ضمن محاولة التوزيع. كما أن الجدولة عبر Meta لها نافذة زمنية من 10 دقائق إلى 30 يوماً، ولذلك سيبقى Heartbeat في البوابة هو مصدر جدولة داخلي موحد ثم يستدعي النشر الفوري عند الاستحقاق بدلاً من اعتماد نافذة مزود واحدة. [1]

## Instagram Content Publishing

يتطلب Instagram professional account وتوكن الوصول المناسب. تتكون عملية النشر من إنشاء Media Container عبر `POST /{ig_id}/media`، والاستعلام عن حالة المعالجة عند الحاجة، ثم `POST /{ig_id}/media_publish` مع `creation_id`. يجب أن تبقى الوسائط متاحة على رابط عام طوال محاولة Meta تحميلها. يدعم Carousel حتى 10 عناصر، وتطبق Meta حداً متحركاً للنشر عبر API مقداره 100 منشور خلال 24 ساعة؛ كما توصي بمراقبة هذا الحد قبل جدولة منشورات مستقبلية. [2]

## Lead Ads

ينتمي كل Lead إلى Facebook Page. للتكامل مع CRM يمكن استقبال إشعار Webhook لحظي ثم استرجاع تفاصيل العميل المحتمل من Graph API، بدلاً من الاعتماد على polling فقط. يلزم App Review وBusiness Verification في الوضع الحي وصلاحيات `leads_retrieval` و`pages_manage_ads` كما توضح Meta. [3]

## Conversions API

تصل أحداث الخادم إلى Meta عبر Dataset ID، وينبغي اختبار وصولها ومطابقتها ومنع التكرار عند الجمع بين Pixel وCAPI. ستقتصر طبقة SGH CRM على أحداث أعمال عامة مثل `Lead` و`Schedule` و`CompleteRegistration` مع `event_id` ثابت للـ deduplication؛ لن تمرر تشخيصاً أو تفاصيل علاج أو محتوى محادثات. [4]

## مراجع

[1]: https://developers.facebook.com/documentation/pages-api/posts "Meta Pages API — Posts"
[2]: https://developers.facebook.com/documentation/instagram-platform/content-publishing "Meta Instagram Platform — Content Publishing"
[3]: https://developers.facebook.com/documentation/ads-commerce/marketing-api/guides/lead-ads "Meta Marketing API — Lead Ads"
[4]: https://developers.facebook.com/documentation/ads-commerce/conversions-api "Meta Conversions API"
