# مرجع العروض والمخيمات والأطباء الحالي

**الحالة:** `working`
**الجمهور:** المسؤولون، المطورون، مشغلو المحتوى، ومشغلو التتبّع
**المجال:** Offers, Camps & Doctors
**آخر مراجعة:** 2026-09-12
**المصادر:** `server/routers/offers.ts`، `server/routers/camps.ts`، `server/routers/doctors.ts`، `server/routers/offerLeads/registration.ts`، `server/routers/campRegistrations/registration.ts`، `drizzle/schema.ts`، الصفحات العامة `client/src/pages/public/*`، الاختبارات المرتبطة

> هذا المرجع يصف السلوك المثبت في الكود الحالي. لا يثبت أسعارًا أو عائدًا أو KPI تجاريًا إلا إذا كانت هناك مصادر تنفيذية منفصلة وموثقة في مراحل لاحقة.

## 1. نظرة عامة

المجال الطبي/التسويقي في المشروع يُدار عبر ثلاث كيانات رئيسية:

- `offers`: العروض الطبية النشطة أو المؤرشفة.
- `camps`: المخيمات الطبية المجتمعية مع معلومات التواريخ والسعة والوقت.
- `doctors`: الأطباء/التخصصات المتاحة في الكتالوج الطبّي.

إلى جانب هذه الكيانات توجد كيانان للتسجيل:

- `offerLeads`: طلبات العملاء للعروض.
- `campRegistrations`: تسجيلات المخيمات.

الروترات العامة والواجهة العامة تعتمد على `publicProcedure` و`permissionProcedure` و`assertRolePermission`، مع cache invalidation عند تغيّر البيانات.

## 2. الكيانات والحقول

### 2.1 العروض `offers`

تم تعريف `offers` في `drizzle/schema.ts` على النحو التالي:

- `id`: `int` primary key
- `title`: `varchar(255)`، مطلوب
- `slug`: `varchar(255)`، مطلوب، فريد
- `description`: `text`, اختياري
- `imageUrl`: `varchar(500)`, اختياري
- `isActive`: `boolean`, `default true`, غير فارغ
- `startDate`: `timestamp`, اختياري
- `endDate`: `timestamp`, اختياري
- `createdAt`, `updatedAt`: timestamps

الواجهة العامة تستخدم `getAll` فقط للعروض النشطة، بينما `getAllAdmin` يعرض كل العروض بما فيها غير النشطة. `getBySlug` يطلب `slug` ويُرجع العرض النشط فقط.

### 2.2 المخيمات `camps`

تم تعريف `camps` في `drizzle/schema.ts` كما يلي:

- `id`: `int` primary key
- `name`: `varchar(255)`، مطلوب
- `slug`: `varchar(255)`، مطلوب، فريد
- `description`: `text`, اختياري
- `imageUrl`: `varchar(500)`, اختياري
- `startDate`: `timestamp`, اختياري
- `endDate`: `timestamp`, اختياري
- `isActive`: `boolean`, `default true`, غير فارغ
- `freeOffers`: `text`, اختياري
- `discountedOffers`: `text`, اختياري
- `availableProcedures`: `text`, اختياري
- `galleryImages`: `text`, اختياري
- `morningTime`: `varchar(20)`, اختياري
- `eveningTime`: `varchar(20)`, اختياري
- `dailyCapacity`: `int`, اختياري
- `createdAt`, `updatedAt`: timestamps

الحقول المتعلقة بالوقت والسعة تُستخدم في `getAvailableDates` لتحديد ما إذا كانت أيام المخيم متاحة، بناءً على مستوى السعة اليومي المتبقي.

### 2.3 الأطباء `doctors`

تم تعريف `doctors` في `drizzle/schema.ts` على النحو التالي:

- `id`: `int` primary key
- `name`: `varchar(255)`, مطلوب
- `slug`: `varchar(255)`, مطلوب، فريد
- `specialty`: `varchar(255)`, مطلوب
- `image`: `varchar(500)`, اختياري
- `bio`: `text`, اختياري
- `experience`: `varchar(255)`, اختياري
- `languages`: `varchar(255)`, اختياري
- `consultationFee`: `varchar(100)`, اختياري
- `procedures`: `text`, اختياري
- `isVisiting`: enum `['yes','no']`, default `no`
- `available`: enum `['yes','no']`, default `yes`
- `createdAt`, `updatedAt`: timestamps

### 2.4 تسجيلات العروض `offerLeads`

تم تعريف `offerLeads` بما يلي:

- `id`, `offerId`, `campaignId` اختياري، `fullName`, `phone`, `email`, `age`, `gender`, `patientMessage`, `notes`
- حالة التسجيل: `pending`, `contacted`, `no_answer`, `confirmed`, `attended`, `completed`, `cancelled`
- حقول التتبّع: `source`, `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`, `utmPlacement`, `referrer`, `fbclid`, `gclid`
- timestamps للاتصال والتأكيد والمراجعة والإلغاء

### 2.5 تسجيلات المخيمات `campRegistrations`

تم تعريف `campRegistrations` بنفس سلسلة الحالات المذكورة أعلاه، مع حقول إضافية:

- `campId`, `campaignId` اختياري
- `procedures`, `medicalCondition`
- `preferredDate`: `varchar(20)` بتنسيق `YYYY-MM-DD`
- `preferredTimeSlot`: enum `['morning','evening']`
- `attendanceDate`: timestamp
- fields UTM وsource وreferrer وfbclid وgclid

## 3. دورة العرض

### 3.1 الوصول العام

`offersRouter.getAll` هو `publicProcedure.query` ويستخدم cache كالتالي:

- `serverCache.getOrCompute(CacheKeys.offersList(), CacheTTL.LONG, ...)`
- يختار فقط `offers.isActive = true`
- يطلب `orderBy(offers.createdAt)`

`offersRouter.getBySlug` يختار `slug` ويستبعد غير النشطة.

### 3.2 الوصول الإداري

`getAllAdmin` هو `catalogViewProcedure.query` ويعيد جميع العروض. هذا مُميز عن العرض العام ويستخدم صلاحية `catalog.view`.

### 3.3 إنشاء وتحديث العرض

`create` و`update` يطبّقان القواعد التالية:

- يحول `input.slug` إلى lowercase ويستبدل المسافات بـ `-`، ثم يزيل الرموز غير المسموح بها.
- إذا كان slug موجودًا، يضيف suffix باستخدام `Date.now()` في الإنشاء.
- يحول `imageUrl` الفارغ إلى `undefined`.
- يطلب `catalog.publish` إذا كانت القيمة `isActive !== false` أثناء الإنشاء.
- أثناء التحديث، إذا تغيرت `isActive` من قيمة إلى أخرى، يتحقق من `catalog.publish` أو `catalog.archive`.

بعد التحديث أو الإنشاء يتم إبطال `offers` cache.

### 3.4 الأرشفة والحذف

`delete` يستعمل `catalogDeleteProcedure`. لا توجد عملية `archive` مستقلة في الراوتر؛ الأرشفة تُدار غالبًا عبر `update` وتبديل `isActive` مع التحقق من الصلاحية.

## 4. دورة المخيم

### 4.1 الوصول العام والإداري

- `campsRouter.getAll` يُرجع المخيمات النشطة فقط.
- `campsRouter.getAllAdmin` يُرجع كل المخيمات، ويستخدم `catalog.view`.
- `getById` و`getBySlug` يقدّم كل مخيم حسب id أو slug.

### 4.2 السعة المتاحة

`getAvailableDates` هي وظيفة مركزية في المخيمات:

- يقرأ camp حسب slug
- يستخرج `startDate`, `endDate`, `morningTime`, `eveningTime`, `dailyCapacity`
- يزود قائمة بجميع أيام المخيم القادمة
- إذا كانت `dailyCapacity` فارغة أو null، يُرجع كل الأيام كمتاحة دون حساب السعة
- إذا كانت السعة محددة، يحسب عدد التسجيلات المؤكدة في `campRegistrations` مع الحالات `confirmed`, `attended`, `completed` فقط
- يضيف `morningRemaining` و`eveningRemaining` بناءً على `preferredTimeSlot`

هذا يعني أن “التوفر” في المخيم لا يعتمد فقط على `isActive` بل أيضًا على عدد الحضور المتأكد وسعة اليوم.

### 4.3 إنشاء وتحديث المخيم

في `create` و`update`:

- إذا كان `input.isActive !== false` في الإنشاء، يُطلب `catalog.publish`
- إذا تغيّر `isActive` أثناء التحديث، يُطلب `catalog.publish` أو `catalog.archive`
- يتم تنظيف slug وتحويله إلى lowercase، مع التحقق من تكرار slug وعملية استبدال أو استبعاد
- تُستبدل URL الصورة الفارغة بـ `undefined`
- تُحدّث الحقول الإضافية: `freeOffers`, `discountedOffers`, `availableProcedures`, `galleryImages`, `morningTime`, `eveningTime`, `dailyCapacity`

### 4.4 arming and cache

بعد `create`/`update`/`delete`/`toggleActive` تُستدعَى invalidation للـcache:

- `CacheKeys.campsList()`
- `'camps:active'`

## 5. دورة الطبيب

### 5.1 العرض العام

`doctorsRouter.list` يعرض جميع الأطباء في الكتالوج العام.

الواجهة العامة في `Doctors.tsx` لا تعرض إلا الأطباء ذوي `available === 'yes'`، مع فلترة بحثية حسب الاسم أو التخصص، بالإضافة إلى فلتر تخصصات.

### 5.2 إنشاء وتحديث الطبيب

`create` و`update` يستخدمان:

- `catalog.create`
- `catalog.update`
- `catalog.publish` عند التدبير الخاص بتوفر جدولة/نشر

المدخلات تتضمن:

- `name`, `slug`, `specialty`, `image`, `bio`, `experience`, `languages`, `consultationFee`, `procedures`
- `isVisiting`: `['yes','no']`
- `available`: `['yes','no']`

### 5.3 التوفر

`toggleAvailability` يتحقق من `catalog.publish` ويحدث `available` بين `yes` و`no`.

ملاحظة مهمة: `getBySlug` لا يفلتر `available` في الخلفية؛ الفحص الفعلي للواجهة يحدّده في العميل. هذا فرق بين “القاعدة العامة” و“عرض الكتالوج الحالي”.

## 6. التسجيلهات والرسائل التلقائية

### 6.1 تسجيل العرض

`offerRegistrationRouter.submit` يطبق القواعد التالية:

1. يحول رقم الهاتف عبر `normalizePhoneNumber`.
2. يحدد حالة أولية `input.status || 'pending'`.
3. ينشئ سجل `offerLeads` مع حقول UTM وreferrer/fbclid/gclid.
4. يرسل إشعار `notifyEligibleRecipients` بناءً على `source: 'offers'` و`type: 'booking_pending'`.
5. يرسل Telegram notification إذا كان العرض موجودًا.
6. يرسل WhatsApp message عبر `dispatchWhatsAppMessage` مع `triggerEvent: 'on_create'`.
7. إذا نجح الإرسال، يقوم بتحديث الحالة إلى `contacted` و`contactedAt` و`updatedAt`.
8. يرسل `sendOfferLeadEvent` إلى Facebook Conversions API كـ fire-and-forget.

> لا يُفهم النجاح العام في `submit` أنه ضمان أن كل رسالة/تسجيل/إشعار انتهى بنجاح؛ بعض الرسائل تُرسَل غير متزامنًا.

### 6.2 تسجيل المخيم

`campRegistrationRouter.submit` يقوم بالأتي:

1. يحول رقم الهاتف.
2. يحسب `preferredDate` و`preferredTimeSlot` عبر `assignCampDateAndTime`.
3. ينشئ `campRegistrations` مع الحالة الأولية `pending` أو قيمة مزودة.
4. يرسل `notifyEligibleRecipients` باستخدام `source: 'camps'`.
5. يرسل Telegram notification.
6. يحدد ما إذا كان التسجيل يدويًا أو من صفحة عامة.
7. إذا كان التسجيل غير يدوي أو `pending`, يرسل رسالة `on_create` ثم يحدّث الحالة تلقائيًا إلى `contacted` عند نجاح الإرسال.
8. إذا كان التسجيل يدويًا مع حالة `confirmed`/`attended`/`completed`/`cancelled`, يرسل الرسالة المناسبة تلقائيًا دون تغيير الحالة إلى `contacted`.
9. يرسل `sendCampRegistrationCAPI` كـ fire-and-forget.

### 6.3 حالات التسجيل والفرق عنها

تستخدم كلتا الكيانات نفس السلسلة الأساسية من الحالات:

- `pending`
- `contacted`
- `no_answer`
- `confirmed`
- `attended`
- `completed`
- `cancelled`

لكن الحالة في `submit` قد تتحول تلقائيًا إلى `contacted` عند نجاح إرسال الرسالة، وهذا يعني أن “حالة التقديم الأولية” ليست دائمًا ما تبقى في قاعدة البيانات في النهاية.

## 7. الصلاحيات والضوابط

صلاحيات الكتالوج المستخدمة في هذا المجال:

- `catalog.view`: عرض الكتالوج الإداري
- `catalog.create`: إنشاء العروض/المخيمات/الأطباء
- `catalog.update`: تعديل هذه الكيانات
- `catalog.delete`: حذفها
- `catalog.publish`: نشر/تمكين العناصر
- `catalog.archive`: أرشفة العناصر

المسارات تعتمد على `permissionProcedure` الذي يطلب `assertRolePermission(ctx.user, permission, label)` داخل middleware. هذا يضمن أن الإجراءات الحساسة لا تُسمح إلا للمستخدمين ذوي الصلاحيات المناسبة.

## 8. اختلافات الواجهة مقابل الخادم

### 8.1 العروض

الواجهة العامة في `OffersListPage` تُفرّق بين العروض النشطة والمنتهية باستخدام `endDate`. هذا ليس نفس الشيء بالضرورة كـ `isActive`, لأنه يمكن أن يكون العرض لا يزال نشطًا لكن تاريخ انتهائه قد تأثر على الواجهة.

### 8.2 المخيمات

واجهة `CampsListPage` تستخدم `trpc.camps.getAll` وتُرِكّز على `endDate` و`isActive` و`campRegistrations`. لا تملك واجهة الواجهة نفسها دالة احتساب ROI؛ بل تعكس فقط القيم الحالية للـ DB والـ router.

### 8.3 الأطباء

الواجهة `Doctors.tsx` تُفلتر النتائج حسب `available === 'yes'` فقط في العميل، بينما الراوتر نفسه لا يطبّق هذا الفلتر تلقائيًا في `getBySlug` أو `list`. هذا فرق بين “العرض العام” و“قواعد الوصول الخادم”.

## 9. قيود موثقة

- لا يوجد ضمان عام أن `WhatsApp` أو `Telegram` أو البريد أو أي إشعار آخر وصل بنجاح؛ بعض الاستدعاءات تُنفّذ كـ fire-and-forget.
- `campaignId` في `offerLeads` و`campRegistrations` اختياري، ولا يوجد في هذا المرجع نص يثبت ربطًا كاملًا بين الحملة والكيان في كل مسار.
- `doctors` لا يملك جدول “منتج/حزمة/سعر” مستند في هذا النطاق، لذلك لا يُستنتج وجود تسعير كامل أو Promotions pipeline مستقل.
- لا توجد في هذا المجال طبقة `ROI` أو `conversion attribution` كاملة موثقة، لذلك لا تُستعمل أرقام العائد كحقائق ثابتة دون مصدر مستقل.
- `catalog.publish` تُستعمل في مواضع الإنشاء/التحديث/التبديل، لكن هذا المرجع لا يعلّق على سياسات العمل التجارية بين “نشر” و“إتاحة” دون قرار من صاحب المشروع.

## 10. الخلاصة

العروض والمخيمات والأطباء تمثل مجالًا متميزًا مترابطًا داخل نظام CRM الطبي، لكن تركيزه في الكود الحالي هو أكثر على:

- إدارة الكتالوج
- تسجيل الطلبات وأرقام الهواتف
- التواريخ والسعة للـcamps
- رسائل الإشعارات
- صلاحيات الإدارة

وليس على KPI تجاري أو إسناد كامل للتحويلات. لذلك يبقى هذا المرجع مرجعًا للسلوك الحالي وليس مرجعًا لقياس الأعمال أو الربحية.
