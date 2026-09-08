# مراجعة مخطط البيانات والاستعلامات

**تاريخ المراجعة:** 8 سبتمبر 2026  
**النطاق:** `drizzle/schema.ts`، `drizzle/relations.ts`، ملفات SQL في `drizzle/migrations/` و`server/database/migrations/`، واستعلامات `server/database/db/` و`server/routers/`.  
**الحالة:** مراجعة ثابتة مع تنفيذ ضوابط المرحلة الصفرية؛ لم يتم تعديل `schema.ts` أو تطبيق migration تغيّر المخطط.

**آخر تحديث:** 8 سبتمبر 2026. تم تجميد migration الفهارس legacy، وإضافة فحص CI لمراجع migrations، وإضافة أدوات seed محلية وقياس متكرر لـorphan counts و`EXPLAIN` عبر `pnpm db:phase-zero`. القياسات المنفذة محليًا baseline تقنية وليست اعتمادًا لبيانات الإنتاج؛ يجب إعادة تشغيل الأداة على staging قريب من الإنتاج قبل اعتماد أي فهارس أو Foreign Keys.

## الخلاصة

المخطط واسع ويغطي 106 جداول، لكنه يحتاج إلى حوكمة علاقات وفهارس قبل أي توسع إضافي. أكبر المخاطر ليست في عدد الجداول وحده، بل في وجود حقول مرجعية كثيرة بلا Foreign Key صريح، ترحيل فهارس قديم يشير إلى بنية مختلفة، واستعلامات حرجة تجلب مجموعات كبيرة إلى الذاكرة ثم تطبق المطابقة أو الإحصاء في JavaScript.

**قرار المراجعة:** لا يُنصح بتعديل `schema.ts` مباشرة. يجب إنشاء migration مرحلية بعد فحص بيانات الإنتاج، مع فهارس وعلاقات وتغييرات استعلامات قابلة للقياس.

## النتائج حسب الأولوية

| الأولوية | المشكلة | الدليل | الأثر |
|---|---|---|---|
| P0 | ترحيل فهارس قديم غير متوافق مع المخطط الحالي | `server/database/migrations/add_performance_indexes.sql` يشير إلى `campRegistrations.patientId` و`appointmentDate` و`appointments.patientId` و`date` و`patients.name` و`messageSettings.campaignId` و`type` وجدول `webhookEvents`، بينما هذه الأسماء لا تطابق الجداول والحقول الحالية في `drizzle/schema.ts` | خطر فشل النشر، أو migration جزئي، أو اعتقاد زائف بوجود فهارس حماية للأداء |
| P1 | حقول علاقات أساسية بلا FK أو فهرس واضح | أمثلة: `leads.campaignId` و`assignedToUserId`، `appointments.campaignId` و`assignedToUserId`، `offerLeads.offerId` و`campaignId`، `campRegistrations.campId` و`campaignId`، `tasks.projectId` و`teamId` و`campaignId` و`assignedTo` و`createdBy`، `patientResults.patientId`، وحقول الربط في عدة جداول WhatsApp | orphan records، صعوبة اكتشاف السجلات المحذوفة، joins أبطأ، وعدم وجود ضمان مرجعي من قاعدة البيانات |
| P1 | استعلامات بحث الهاتف تحمل حتى 1000 صف لكل جدول ثم تصفي في الذاكرة | `server/database/db/whatsapp.ts` في `getCustomerInfoByPhone` و`getAllCustomerRecordsByPhone` يقرأ leads/appointments/offerLeads/campRegistrations ثم يستخدم `normalizePhoneNumber` داخل JavaScript | زمن واستعمال ذاكرة يتناسبان مع البيانات، نتائج مقيدة بسقف 1000، وعدم استفادة كاملة من الفهارس |
| P1 | قوائم WhatsApp الأساسية غير مقسمة | `getAllWhatsAppConversations()` يعيد كل المحادثات، و`getAllWhatsAppMessages...` ومسارات التصدير/البحث تعتمد على استعلامات قد تكبر مع الزمن | تحميل بطيء، استهلاك ذاكرة، وزمن استجابة غير ثابت لصندوق التواصل |
| P1 | إحصاءات وعمليات تقرأ الجدول كاملًا ثم تحسب في التطبيق | `server/routers/campRegistrations/stats.ts` يقرأ كل التسجيلات، `whatsapp/settings/routes/subscriptionRoutes.ts` يقرأ كل opt-ins، و`whatsapp/analytics.ts` يقرأ رسائل آخر 7 أيام ثم يجمعها في JavaScript | CPU وذاكرة على Node، نقل بيانات زائد، وتنافس مع طلبات المستخدمين |
| P1 | فهارس ناقصة لمسارات التصفية والترتيب الحالية | `tasks` لا يملك فهارس ظاهرة في تعريفه رغم التصفية على `status/priority/category/assignedTo/campaignId` والترتيب بـ`createdAt`؛ `campRegistrations` يفتقد فهرسًا مركبًا للتسجيلات حسب `campId/status/createdAt`؛ `socialInboxThreads` يملك فهارس منفردة لا فهرسًا مركبًا لمسار `isArchived + lastActivityAt` | scans وترتيب مكلف عند نمو البيانات، خصوصًا في لوحات الإدارة |
| P2 | استعلامات pagination تستخدم بحث `LIKE '%term%'` على حقول نصية | appointments/campRegistrations/tasks/content/media تستخدم wildcard على الاسم والهاتف والبريد والوصف | الفهارس العادية لا تساعد غالبًا مع wildcard البادئ؛ البحث سيصبح مكلفًا مع نمو البيانات |
| P2 | تعريف العلاقات في Drizzle محدود جدًا | `drizzle/relations.ts` يعرّف علاقة `messageSettings` و`whatsappTemplates` فقط، رغم وجود نماذج وعلاقات عديدة في `schema.ts` | صعوبة استخدام relational queries، وزيادة احتمال تكرار joins في طبقة الخدمات؛ ليس خلل integrity مباشرًا لأن بعض FK معرفة داخل schema |
| P2 | فهارس منفردة زائدة أو غير محسنة | أمثلة: حقول فريدة لديها فهرس إضافي محتمل مثل `patients.phone`، وفهارس status/createdAt منفردة لا تغطي دائمًا where + orderBy المركبة | مساحة وفحص كتابة إضافيان دون ضمان تحسن الاستعلام؛ يحتاج إثباتًا عبر EXPLAIN قبل الحذف |
| P2 | استراتيجية حذف غير موحدة | CMS يستخدم `deletedAt`، بينما عمليات مثل حذف appointments/tasks وبعض كيانات WhatsApp تستخدم حذفًا فعليًا، وحقول polymorphic لا تملك FK | فقدان تاريخ، صعوبة التدقيق والاستعادة، وسلوك غير متسق بين الوحدات |
| P3 | حقول JSON/text غير مطبّعة | `platforms/goals/kpis/teamMembers` في campaigns، و`procedures/galleryImages` في camps، وmetadata/variables وحقول تكاملات كثيرة | صعوبة الفهرسة والتحقق والاستعلام الجزئي؛ مقبول لبعض payloads الخارجية، لكنه غير مناسب لحقول أعمال يجري تصفيتها باستمرار |

## ملاحظات مؤكدة إضافية

### 1. فجوة بين المخطط والترحيلات

توجد طبقتان واضحتان من SQL: ترحيلات Drizzle المنظمة، وملفات `server/database/migrations/` التاريخية. يجب اعتبار الطبقة الثانية legacy حتى تُراجع against schema الحالي. ملف `add_performance_indexes.sql` أخطر مثال لأنه ينشئ فهارس على أسماء لا تظهر في المخطط الحالي. كما أن بعض ملفات SQL التاريخية لا تستخدم `IF NOT EXISTS`، ما يجعل إعادة التشغيل أو النشر المتكرر أكثر خطورة.

### 2. علاقات polymorphic

جداول `comments` و`followUpTasks` و`auditLogs` و`contentAuditLog` تستخدم `entityType + entityId`. هذا مقصود لتعدد الكيانات، لكنه يمنع FK حقيقيًا. يجب تعويضه بقيود تطبيقية، اختبارات integrity دورية، وفهارس مركبة على `(entityType, entityId)`، مع سياسة واضحة للحذف والاحتفاظ.

### 3. مخاطر التزامن

توليد أرقام الإيصالات في `campRegistrations/admin.ts` يعتمد على `COUNT(*) + 1`، وهو معرض للتصادم تحت طلبين متزامنين. الحل ليس فهرسًا فقط؛ بل sequence/جدول عداد ذري أو unique constraint مع retry.

### 4. علاقات النشر الخارجي

بعض جداول التكامل الجديدة تستخدم Foreign Keys صريحة جيدة، خصوصًا `integration_*` و`social_publish_*`. هذا نمط ينبغي تعميمه تدريجيًا على الجداول التشغيلية القديمة بعد تنظيف orphan data.

## خطة Migration المقترحة

### المرحلة 0: قياس وحماية

1. ✅ تم تجميد `server/database/migrations/add_performance_indexes.sql`، ويقوم runner بتجاوزه صراحةً.
2. ✅ تم تشغيل seed المحلي الشامل ثم `pnpm db:seed:empty`، فأصبحت الجداول المحلية populated في 107/107 جدولًا. أداة `pnpm db:phase-zero` استخرجت orphan counts لـ13 علاقة، وكانت جميع القيم المقاسة `0`.
3. ✅ تم تشغيل `EXPLAIN` وقياس 30 تكرارًا بعد warmup لخمس جداول محلية ذات حجم مستهدف 1000 سجل (`leads` و`appointments` و`campRegistrations` و`tasks`). سجلت الاستعلامات p95 محليًا بين 2.018ms و4.587ms، مع 50 صفًا لكل استعلام. الاعتماد النهائي يتطلب إعادة التشغيل على staging ببيانات قريبة من الإنتاج وحفظ artifacts في مخزن الأدلة.
4. ✅ أضيف فحص CI عبر `pnpm schema:migrations:check` لمقارنة migrations التنفيذية اليدوية مع `drizzle/schema.ts`، ونجح محليًا مع 106 جداول.

**حالة معيار القبول:** فحص المراجع وbaseline التقنية مكتملان محليًا، وorphan counts يساوي صفرًا في 13 علاقة؛ يبقى اعتماد staging القريب من الإنتاج لإثبات أزمنة الاستعلامات وحجم orphan records الفعلي.

**التنفيذ والتشغيل:** التفاصيل ومخرجات الأداة موثقة في [PHASE_ZERO_DATABASE_BASELINE.md](PHASE_ZERO_DATABASE_BASELINE.md). لا تُحفظ النسخ الاحتياطية أو نتائج القياس داخل Git؛ تُحفظ في مخزن أدلة staging.

### المرحلة 1: فهارس منخفضة المخاطر

بعد EXPLAIN وتأكيد حجم البيانات، أضف migrations منفصلة للفهرسة، مثل:

- `tasks(status, createdAt)` و`tasks(assignedTo, status, dueDate)` حسب الاستعلامات الفعلية.
- `campRegistrations(campId, status, createdAt)` و`campRegistrations(createdAt, status)` لمسارات pagination والإحصاء.
- `social_inbox_threads(isArchived, lastActivityAt)` مع أعمدة filter المطلوبة.
- فهارس lookup للهاتف بعد توحيد التخزين إلى صيغة normalized، لا قبل ذلك.
- فهارس webhook/outbox على `(status, runAfter)` و`(processingStatus, receivedAt)` حيث تدعمها الاستعلامات.

**معيار القبول:** تحسن مثبت في `EXPLAIN` وزمن p95 دون تدهور واضح في insert/update.

### المرحلة 2: توحيد الاستعلامات الثقيلة

1. استبدال قراءة 1000 صف لكل جدول في `getCustomerInfoByPhone` باستعلامات `WHERE phone = normalizedPhone LIMIT 1`، مع migration backfill لتوحيد الهواتف.
2. إضافة pagination حقيقية للمحادثات والرسائل، مع cursor مبني على `lastMessageAt/createdAt + id`.
3. نقل الإحصاءات إلى `COUNT/SUM/GROUP BY` داخل SQL.
4. إرجاع أعمدة مطلوبة فقط بدل `select()` الكامل في القوائم.
5. منع `limit = -1` أو جعله مسار export/background job بحدود واضحة.

**معيار القبول:** لا توجد قراءة كاملة غير مقصودة في المسارات التفاعلية، وتظهر حدود page size/cursor في API.

### المرحلة 3: إصلاح integrity تدريجيًا

1. تنظيف orphan records وتوثيق سياسة كل حقل.
2. إضافة FK على العلاقات الآمنة: الحملات، الأطباء، المخيمات، المستخدمون، المرضى، المشاريع والمهام، مع `onDelete` مناسب لكل domain.
3. إضافة unique constraints حيث يتطلب المجال ذلك، مثل platform/external account وphone/opt-in type.
4. إضافة integrity checks للروابط polymorphic بدل FK الوهمي.
5. عدم إضافة FK قبل اختبار حذف parent في staging ومراجعة أثره على البيانات التاريخية.

**معيار القبول:** orphan count يساوي صفرًا للعلاقات التي أصبحت FK، واختبارات الحذف والتراجع ناجحة.

### المرحلة 4: تطبيع البيانات والعمليات

1. نقل قوائم الأعمال التي تحتاج filter/reporting من JSON text إلى جداول ربط.
2. إبقاء raw payloads الخارجية في JSON/text مع retention وحجم محكوم.
3. استبدال `COUNT + 1` لأرقام الإيصالات بعداد ذري وunique index.
4. توحيد استراتيجية soft delete والاحتفاظ لكل domain.
5. تسجيل كل migration في Drizzle مع خطة rollback أو backup/restore موثقة.

## ترتيب التنفيذ

| الأولوية | الإجراء | الأثر المتوقع | المخاطر |
|---|---|---|---|
| P0 | إيقاف/مراجعة ترحيل الفهارس legacy | منع فشل نشر أو فهارس وهمية | يحتاج مقارنة بيئة الإنتاج |
| P1 | إصلاح استعلام الهاتف والقوائم الكبيرة والإحصاءات | خفض latency والذاكرة ونقل البيانات | يحتاج backfill وتغيير API تدريجي |
| P1 | إضافة فهارس مركبة بعد EXPLAIN | تحسين pagination واللوحات | write overhead وفهارس غير لازمة |
| P1 | إضافة FK للعلاقات النظيفة | منع orphan records | قد يفشل على بيانات قديمة |
| P2 | توحيد polymorphic/soft delete | integrity وتدقيق أفضل | migration واسعة وتوافق رجعي |
| P2 | تطبيع JSON business fields | تقارير وفلاتر أقوى | زيادة الجداول وتعقيد الكتابة |
| P3 | استكمال `drizzle/relations.ts` | joins وtype-safe relational queries أوضح | ليس بديلًا عن FK أو index |

## حدود المراجعة

- تم تشغيل baseline محليًا، لكن لم يتم الاتصال بقاعدة بيانات إنتاج أو staging قريب من الإنتاج؛ لذلك لا تمثل الأزمنة الحالية p95/p99 أو cardinality الإنتاج.
- لا يمكن إثبات أن كل فهرس زائد أو ناقص دون إحصاءات استخدام حقيقية.
- أداة baseline تقيس زمن تنفيذ عينة استعلام واحدة وتكتب خطة `EXPLAIN` وعدد الصفوف؛ يجب تكرار القياس على staging واعتماد p95/p99 قبل قرارات الفهرسة.
- لم يتم تعديل `schema.ts` أو تطبيق migration تغيّر بنية قاعدة البيانات؛ تم فقط تجميد migration legacy وإضافة أدوات وفحوص حماية.

## مراجع تنفيذ المرحلة الصفرية

- [PHASE_ZERO_DATABASE_BASELINE.md](PHASE_ZERO_DATABASE_BASELINE.md)
- `pnpm schema:migrations:check`
- `pnpm db:phase-zero`
