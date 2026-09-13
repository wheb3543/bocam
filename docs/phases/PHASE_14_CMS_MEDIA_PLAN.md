# خطة المرحلة 14: إدارة المحتوى والوسائط

**الحالة:** قيد التنفيذ – مراجعة كود وتهيئة وثائق المرحلة
**التاريخ:** 2026-09-12  
**المرحلة الرئيسية:** 14 من 19  
**النطاق:** CMS، صفحات المحتوى، النصوص، الوسائط، التوثيق، المراجعة، النشر المؤجل، سلة المحذوفات، والأنظمة المرتبطة

## 1. الغرض من المرحلة

تهدف هذه المرحلة إلى توثيق نظام إدارة المحتوى والوسائط داخل المشروع بطريقة دقيقة ومطابقة للسلوك الفعلي في الكود، مع الالتزام بالقاعدة الأساسية للخطة التنفيذية: لا تُوثّق أي ميزة إلا بعد فحصها في الكود والاختبارات، وعدم اعتبار أي سلوك صحيح إلا إذا دُعم بسلوك فعلي أو اختبار موجود.

الغاية من هذه المرحلة ليست تعديل التطبيق، بل توثيق الفنّية الفعلية للنظام CMS/Media، وفصلها عن أي ادعاءات غير موثقة حول جودة النشر، الموافقات، أو إدارة الوسائط.

## 2. القواعد الملزمة المطبقة في المرحلة

### 2.1 مصدر الحقيقة

يُعامل الكود الحالي، مع الاختبارات والـ schema، كمرجع أول. ولا يُسمح بالاستناد إلى أسماء الوحدات أو وصفات المنتج دون مراجعة الملفات المطبقة.

### 2.2 نطاق المرحلة

- CMS من مستوى router إلى مستوى الخدمات
- صفحات المحتوى، النصوص، الصور، الوسائط، SEO، المراجعة، الإصدار، المعاينة، الحذف الناعم، وحذف الاحتفاظ
- أنظمة النشر المؤجل، جودة النشر، والتحقق من القيم قبل النشر
- التوثيق الداخلي وليس إعادة تصميم التطبيق

### 2.3 قاعدة الاعتماد

لا تُغلق هذه المرحلة قبل:

- مراجعة كاملة لمخرجات CMS والوسائط من الكود
- توثيق صلاحيات `content.*` و`media.*`
- توثيق قيود النشر وقواعد الجودة
- التحقق النهائي عبر `pnpm docs:check` و`pnpm check`
- موافقة كتابية صريحة من صاحب المشروع للانتقال إلى المرحلة 15 أو إكمال المسار الحالي

## 3. النتائج الأولية للفحص

### 3.1 نقطة الدخول الرئيسية

- `server/routers/content.ts` يضم نظام CMS كـ `contentRouter` مركب، وهو يضم:
  - `textContent`
  - `images`
  - `media`
  - `colorScheme`
  - `seoSettings`
  - `auditLog`
  - `contentVersions`
  - `pages`
  - `sections`
  - `sectionButtons`
  - `importExport`
  - `approvals`
  - `publishing`
  - `quality`
  - `preview`
  - `trash`
- هذا يثبت أن CMS في هذا المشروع ليس مجرد صفحة نصية واحدة؛ بل هو نظام أحادي مركب للعرض العام الداخلي.

### 3.2 المحتوى النصي

- `server/routers/content/textContent.ts` يعرّف `textContentRouter` مع:
  - list
  - getById
  - create
  - update
  - delete
  - restore
  - publish
  - validation
- يتم استخدام `assertContentCapability` و`contentReadProcedure` / `contentUpdateProcedure` / `contentPublishProcedure`.
- يوجد نظام داخل `invalidateAdminTextContentCache()` وRedis cache للتقليل من إعادة الاستعلام في واجهة الإدارة.
- يوجد `assertPublicationQuality` في مرحلة النشر، مع تقييم `publicationQualityGate.ts`.
- القيم الحساسة مثل `privacy.*` محمية عبر `assertRolePermission(ctx.user, 'privacy.view', ...)`، وهذا يدل على وجود حماية خاصة للخصوصية داخل CMS.

### 3.3 الوسائط والمكتبة

- `server/routers/content/media.ts` يعرّف `mediaLibraryRouter` مع:
  - list
  - create
  - moveMany
  - deleteMany
  - rename
  - folders.list
  - folders.create
  - folders.rename
- يوجد `mediaTypeSchema` = `image | video | audio | document | other`.
- يُستخدم `folderId`, `isNull(media.deletedAt)`، و`mediaFolders.path` لتنظيم الملف.
- هذا يثبت أن مكتبة الوسائط منسقة ومضبوطة، وليست مجرد رفع مباشر دون هيكل تنظيم.

### 3.4 الصفحات والـ SEO

- `server/routers/content/pages.ts` يعرّف `pagesRouter` مع list/getById/getBySlug/getSubPages/getMainPages وحماية تكامل `content.*`.
- `server/routers/content/seo.ts` يربط إعدادات `seoSettings` مع `status`, `publishedAt`, `canonicalUrl`, `robots`, `structuredData`، مع فحص جودة النشر.
- `publicationQualityGate.ts` يضمن أن النشر لا يحدث إذا كانت البيانات ناقصة أو لا تلتزم بقواعد SEO مثل طول العنوان والوصف، أو إذا كانت الروابط غير صالحة أو `ogImage` أو `structuredData` غير صالح.

### 3.5 المراجعة والنسخ والموافقات

- `server/routers/content/approvals.ts` يعرّف دورة الموافقة على تغييرات CMS، مع `entityType` متعدد مثل `textContent`, `image`, `media`, `page`, `section`, `sectionButton`, `seo`.
- `contentVersions` مسجل لإصدارات المحتوى، ما يثبت أن النظام يدعم مراجعة التغييرات واسترجاعها.
- `contentVersionsService` و`save*Version()` تُستخدم عند تعديل الصفحات أو SEO أو محتوى النص، وهذا يثبت وجود سجل فعلي للحفظ وتتبّع التغييرات.

### 3.6 النشر المؤجل

- `server/services/content/deferredPublicationService.ts` ينفّذ `publishDueCmsContent()`، ويصنف عناصر CMS التي وصلت إلى `publishedAt`.
- قبل النشر، يعاود تقييم الجودة (`evaluatePublicationQuality`) ويُمنع النشر إذا كانت القيم غير صالحة.
- يقوم بتسجيل `contentAuditLog` عند النشر الناجح أو عند منع النشر في اللحظة المناسبة.
- هذا يثبت أن CMS لديه gate فعلي وليس مجرد إرسال مباشر عند الحفظ.

### 3.7 سلة المحذوفات والاحتفاظ

- `server/services/content/trashRetentionService.ts` يدير `cmsTrashRetentionPolicies` و`purgeExpiredCmsTrash()` مع سياسة إفتراضية 30 يوماً.
- `server/api/cmsTrashRetentionScheduledRoute.ts` يثبت أن هناك مهمة مجدولة تؤدي الحذف النهائي المؤجل.
- هذه نقطة مهمة: CMS لا يزيل البيانات فوراً، بل يأخذ مسار الحذف الناعم ثم الحذف النهائي لاحقاً.

### 3.8 النشر عبر Social Publishing

- `server/routers/content/publishing.ts` يربط CMS بنظام `socialPublishing` العام.
- `platformSchema` و`contentTypeSchema` تدعم `facebook`, `instagram`, `x`, `linkedin`, `youtube`, `tiktok`.
- هذا يثبت وجود اتصال فعلي بين CMS ونظام النشر الاجتماعي، لا مجرد فكرة تصميمية.

## 4. النطاق التقني المقصود للمرحلة

### المهمة 14.1: هيكل CMS الأساسي

- توثيق `contentRouter` واحتواء كل مكوّن CMS تحت واحد.
- توثيق `textContent`, `pages`, `sections`, `sectionButtons`, `seoSettings`, `media`, `approvals`, `trash`.

### المهمة 14.2: إدارة الوسائط

- توثيق مكتبة الوسائط، مجلدات الملفات، التسمية، الحذف الناعم، والتنظيم.
- توثيق العلاقة مع الصور والملفات المرفوعة في CMS.

### المهمة 14.3: الجودة والمراجعة

- توثيق `publicationQualityGate.ts` و`assertPublicationQuality`.
- توثيق قواعد العنوان والوصف والروابط والأقسام المفقودة ومشكلات SEO.

### المهمة 14.4: النشر المؤجل وصلاحيات CMS

- توثيق `deferredPublicationService.ts` و`cmsPublishingScheduledRoute.ts`.
- توثيق التزام النظام بالفحص قبل النشر وعدم تجاوز الجودة.

### المهمة 14.5: الحذف والاحتفاظ

- توثيق `trash` و`purgeExpiredCmsTrash` و`cmsTrashRetentionScheduledRoute.ts`.
- توثيق سياسات الاحتفاظ والهوية الزمنية للكتل المحذوفة.

### المهمة 14.6: التوثيق النهائي

- إنشاء وثائق CMS/Media الموثّقة من الكود
- تحضير تقرير إغلاق المرحلة بعد اعتماد المستخدم

## 5. القيم والقيود الملاحظة

- CMS موجود فعليًا في التطبيق كطبقة هامة، لكنه يحتاج إلى توثيق صارم لأن نطاقه واسع ويتداخل مع SEO، الوسائط، النشر، التوافقية، وسياسة الخصوصية.
- جودة النشر ليست مجرد قائمة نصية؛ هي منطق فعلي في `publicationQualityGate.ts`، ما يثبت وجود فرضيات جودة قبل النشر.
- الحذف النهائي لا يحدث فوراً؛ هناك مسار احتفاظ منظم يعكس سياسة تشغيلية، وليس مجرد “حذف فوري”.
- لا يوجد في هذا النطاق ما يثبت KPI تجاري أو أداء محتوى قياسي؛ أي ادعاء من هذا النوع يحتاج مصدرًا مستقلًا.
- لا يحق وصف CMS بأنه مكتمل أو جاهز للإنتاج دون مراجعة صلاحيات المستخدم، العلاقات، وبيانات SEO/الوسائط في البيئة الفعلية.

## 6. معيار البوابة الحالية

تُبقى هذه المرحلة في وضع "الخطة قيد التنفيذ" إلى أن يتم:

- [ ] مراجعة كاملة لملفات CMS والوسائط ذات الصلة
- [ ] توثيق مخرجات `contentRouter` و`textContent` و`media` و`pages` و`seo` و`trash`
- [ ] توثيق صلاحيات `content.*` و`media.*` و`privacy.*`
- [ ] التحقق من جودة النشر والاحتفاظ والنشر المؤجل
- [ ] تشغيل `pnpm docs:check` و`pnpm check`
- [ ] اعتماد المستخدم كتابيًا قبل إغلاق المرحلة والانتقال إلى 15

## 7. القرار الحالي

المرحلة 14 الآن في فحص وتوثيق البناء الفعلي للنظام، وفق المنهجية المعتمدة في المشروع: مراجعة الكود، تسجيل القيود، وتوثيق القيم الفعلية فقط، ثم إغلاق البوابة بعد اعتماد مكتوب. لا يُسمح بالانتقال إلى المرحلة 15 قبل الموافقة الصريحة.
