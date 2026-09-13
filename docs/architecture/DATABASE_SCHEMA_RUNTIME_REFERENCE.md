# مرجع مخطط قاعدة البيانات الحالي

**الحالة:** `working`
**الجمهور:** المطورون ومشغلو قاعدة البيانات
**المجال:** Data Model & Migrations
**آخر مراجعة:** 2026-09-12
**المصادر:** `drizzle/schema.ts`، `drizzle/relations.ts`، `drizzle/*.sql`، `drizzle/meta/`، `drizzle.config.ts`، `server/database/`

> هذا المرجع يصف خط الأساس المرصود من المستودع. لا يمثل نتيجة مقارنة مع قاعدة بيانات تشغيلية؛ أداة المقارنة تحتاج اتصال MySQL/TiDB فعليًا.

## 1. خط الأساس الحالي

- يحتوي `drizzle/schema.ts` على 106 تعريفات `mysqlTable` وفق نمط المصدر الحالي.
- يحتوي مجلد `drizzle/` على 110 ملفات SQL في الجذر عند تاريخ المراجعة.
- يحتوي `drizzle/relations.ts` على تعريفات Drizzle صريحة لعلاقات `messageSettings` و`whatsappTemplates`.
- يحتوي `schema.ts` أيضًا على قيود ومراجع foreign key داخل تعريفات الجداول؛ لا ينبغي مساواة عدد تعريفات `relations.ts` بعدد كل القيود في قاعدة البيانات.
- لا يمكن إثبات تطابق المخطط مع قاعدة بيانات تشغيلية من الملفات وحدها.

### نتيجة المقارنة الحية في 2026-09-12

تم الاتصال بقاعدة البيانات عبر `DATABASE_URL` باستخدام MySQL driver الموجود في المشروع. أظهرت المقارنة AST/`information_schema` تطابق جميع جداول وأعمدة التطبيق، مع جدول `__drizzle_migrations` الإداري فقط خارج `schema.ts`. النتيجة: لا توجد جداول أو أعمدة تطبيق مفقودة أو زائدة في قاعدة التشغيل التي تمت مراجعتها.

## 2. تنظيم الجداول حسب المجال

تغطي الجداول الحالية على الأقل المجالات التالية:

- الهوية والأدوار: `users`، `roleDefinitions`، `userRoleAssignments`، `accessRequests`، `userPreferences`.
- الحملات والعملاء المحتملون والعروض والمخيمات والأطباء: `campaigns`، `leads`، `leadStatusHistory`، `offers`، `camps`، `offerLeads`، `campRegistrations`، `campaignOffers`، `campaignCamps`، `campaignDoctors`، `doctors`.
- المواعيد والمهام والفرق: `appointments`، `appointmentReminderSchedules`، `teams`، `teamMembers`، `tasks`، `taskDeliverables`، `taskComments`، `taskAttachments`، `followUpTasks`، `taskReminderSchedules`.
- المرضى والنتائج والتتبع: `patients`، `patientOtps`، `patientResults`، `visitSessions`، `abandonedForms`، `trackingEvents`.
- WhatsApp والاتصالات: الجداول التي تبدأ بـ`whatsapp` إضافة إلى `messageSettings` و`messageTemplates` و`comments` و`notifications`.
- CMS والوسائط: `textContent`، `images`، `mediaFolders`، `media`، `colorScheme`، `seoSettings`، `pages`، `sections`، `sectionButtons`، `contentVersions`، `contentApprovals`، `cmsPreviewTokens`، `contentAuditLog`، `cmsTrashRetentionPolicies`.
- التكاملات والنشر الاجتماعي: `socialInbox*`، `meta*`، `integration*`، `socialPublish*`.
- التشغيل والتهيئة: `settings`، `pwaInstalls`، `savedFilters`، `savedSearches`، `auditLogs`، `operationalAlertStates`، `updateCheckSchedules`.

القائمة التفصيلية والأنواع والقيود المرجعية هي `drizzle/schema.ts`، وليس الجداول المنسوخة يدويًا في وثائق قديمة.

## 3. العلاقات والقيود

تُعرّف العلاقات الأساسية داخل أعمدة `schema.ts` باستخدام `references`، مع سلوكيات مثل `cascade` و`restrict` و`set null` بحسب الجدول. أما `drizzle/relations.ts` فهو طبقة علاقات Drizzle للاستعلامات وليس سجلًا بديلًا لكل foreign key.

يجب فحص أي علاقة موثقة في ERD مقابل مصدرها في `schema.ts` أو migration SQL. لا تُستنتج قواعد الاحتفاظ أو الحذف الناعم من اسم العمود فقط.

## 4. الترحيلات

تسلسل ملفات SQL لا يساوي بالضرورة عدد تغييرات schema الفعلية. توجد ملفات placeholder وملفات مرقمة متقاربة، لذلك يجب قراءة المحتوى و`drizzle/meta/_journal.json` قبل وصف أي migration بأنه no-op أو تغيير فعلي.

لا تُعاد تسمية ملفات الترحيل ولا تُعدّل لقطات `drizzle/meta/` يدويًا. استخدم أدوات Drizzle المعتمدة عند إنشاء تغيير جديد، ثم راجع SQL الناتج قبل تطبيقه.

## 5. المقارنة مع قاعدة تشغيلية

يوفر `scripts/compare_schema.cjs` مقارنة تقريبية بين الجداول والأعمدة المستخرجة من `schema.ts` و`information_schema.COLUMNS`. تشغيله يحتاج MySQL client واتصالًا صالحًا، مثل:

```bash
node scripts/compare_schema.cjs --db=bocam_db --host=127.0.0.1 --port=3306 --user=root
```

لا تُسجل كلمات المرور أو مخرجات تحتوي بيانات إنتاج في الوثائق. أداة المقارنة تستخدم AST وتتعامل مع تعريفات `mysqlTable` متعددة الأسطر، لكنها ما زالت مقارنة بنيوية للأسماء والأنواع وقابلية NULL وليست بديلًا عن مراجعة الفهارس والقيود وسجل الترحيلات.

## 6. الوثائق المرتبطة

- [مخطط قاعدة البيانات](./DATABASE_SCHEMA.md): مرجع تاريخي يحتاج تحديثًا تدريجيًا حسب المصدر الحالي.
- [مخطط ERD](./DATABASE_ERD.md): تمثيل تفسيري يحتاج مطابقة كل علاقة مع schema قبل اعتماده.
- [دليل الترحيلات](../../drizzle/MIGRATIONS_GUIDE.md): إرشادات تشغيلية، مع تسجيل أي فرق في سجل التعارضات.
- [مراجعة مخطط قاعدة البيانات](../analysis/DATABASE_SCHEMA_REVIEW_2026-09.md): تقرير مراجعة وليس مصدرًا بديلًا للمخطط.
