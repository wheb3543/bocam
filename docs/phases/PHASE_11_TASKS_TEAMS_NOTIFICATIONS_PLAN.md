# خطة المرحلة 11: المهام والفرق والإشعارات

**الحالة:** قيد التنفيذ – مرحلة التدقيق والتخطيط
**التاريخ:** 2026-09-12
**المرحلة الرئيسية:** 11 من 19
**النطاق:** المهام التشغيلية، نماذج الفرق/الأعضاء، وتدفق الإشعارات والتذكيرات الداخلية

## 1. هدف المرحلة

توثيق دورة المهام الداخلية من إنشاء المهمة وتعيينها إلى إكمالها، وربطها بنماذج الفرق والعضوية في schema، ثم توثيق سياسة الإشعارات والتذكيرات وقيودها التشغيلية. الهدف هنا هو فصل ما هو موثّق فعليًا في الكود عن أي فرضيات حول رؤية الفرق أو قنوات التنبية، مع الحفاظ على المنهجية القائمة على الأدلة فقط.

## 2. نتائج الفحص الأولي

### 2.1 المهام الأساسية `server/routers/tasks.ts`

- `tasksRouter` يعرّف `list`, `getById`, `create`, `update`, `delete`, `updateStatus`, `stats`, `myTasks`, `overdue`, `getComments`, `addComment`, `deleteComment`, `getAttachments`, `addAttachment`, `deleteAttachment`.
- `list` يدعم فلترة بواسطة `status`, `priority`, `category`, `assignedTo`, `campaignId`, `search`.
- `create` و`update` يطلبان صلاحيات `tasks.create`, `tasks.update`, و`tasks.assign` عند تعيين مستخدم مختلف عن المبدئ، مع `assertRolePermission`.
- `update` يطلب `tasks.complete` عند تعيين `status === 'completed'`.
- عند تعيين مستخدم جديد في المهمة، يتم إرسال إشعار `task_assigned` عبر `notifyTaskAssignment` من `server/services/taskReminderService.ts`.
- `updateStatus` يضيف كذلك شرط `tasks.complete` عند الإكمال المباشر عبر drag & drop.
- يتم دعم التعليقات والمرفقات بشكل منفصل، مع صلاحيات `tasks.update` و`tasks.delete` بحسب المسار.

### 2.2 مهام المتابعة `server/routers/followUpTasks.ts`

- `followUpTasksRouter` يدعم `getAll`, `getByEntity`, `getCount`, `create`, `updateStatus`, `delete`.
- `entityType` مقيد إلى `appointment | lead | offerLead | campRegistration` في schema وZod، مع علاقة متعددة الكيانات (`entityType + entityId`).
- `create` يطلب `tasks.assign` عند تعيين `assignedToId` مختلف عن المستخدم الحالي، ويُنشئ سجل `followUpTasks` مع `status: 'pending'`.
- `updateStatus` يطلب `tasks.complete` عند إكمال المهمة، ويُحدّث `completedById` و`completedByName` إذا كانت الحالة `completed`.
- `server/tasks/followUpTasks.ts` يوفر CRUD للمهمة في مستوى الخدمة، مع `getFollowUpTasksByEntity` و`getFollowUpTaskCount` و`updateFollowUpTaskStatus`.

### 2.3 الفرق والأعضاء `drizzle/schema.ts`

- `teams` table يحتوي على: `id`, `name`, `slug`, `description`, `leaderId`, `isActive`, `createdAt`, `updatedAt`.
- `teamMembers` table يحتوي على: `id`, `teamId`, `userId`, `role`, `joinedAt`.
- `teamMembers.role` مقيد إلى `['leader', 'member']`.
- لا يوجد في هذا النطاق `teamsRouter` مستقلة منشورة في `appRouter`; بدلاً من ذلك، تم استخدام `teams` و`teamMembers` بقوة داخل سياسات الإشعارات والشماتير التشغيلية.
- ملفات UI في `client/src/pages/admin/teams/` تُظهر صفحات فريق مثل `DigitalMarketingTeamPage.tsx` بواجهة `UnderDevelopmentPage`; هذا يعني أن إدارة الفريق نفسها ليست كاملة كـ CRUD في الواجهة الحالية.

### 2.4 الإشعارات الموحدة `server/routers/notifications.ts`

- `notificationsRouter` يدعم: `availableTeams`, `list`, `overview`, `getUnread`, `getUnreadCount`, `markAsRead`, `markAsUnread`, `markAllAsRead`, `delete`, `deleteRead`, `preferences`, `updatePreferences`, `systemSettings`, `updateSystemSettings`, `dailyDigestSettings`, `updateDailyDigestSettings`, `createDigestNow`, `create`, `createForUser`, `broadcastToAdmins`, `deleteExpired`.
- `notifications` table في schema يمكّن النوع (`type`), المصدر (`source`), حالة القراءة (`isRead`), الأولوية (`priority`), `expiresAt`, `actionUrl`, `actionLabel`.
- `preferences` و`systemSettings` يحددان سلوك الإشعار للمستخدم ونظام الإرسال، مع `normalizeNotificationPreferences` و`normalizeNotificationSystemSettings`.
- `availableTeams` يقرأ فقط الفرق النشطة من `teams` table، لتتمكن الواجهة من عرض خيارات التوجيه الجماعي.

### 2.5 سياسة الإشعارات `server/services/notificationPolicy.ts`

- `DEFAULT_NOTIFICATION_PREFERENCES` و`DEFAULT_NOTIFICATION_SYSTEM_SETTINGS` يعرّفان `enabledSources` و`recipientRoles` و`recipientTeamIds` لكل مصدر.
- `shouldDeliverNotification` يتحقق من: تمكين النظام، تمكين مصدر الإشعار، تفعيل المستخدم، الأدوار المسموح بها، تفضيلات المستخدم، و`highPriorityOnly`.
- `notifyEligibleRecipients` يختار المرشحين بناءً على `recipientRoles` + `recipientTeamIds` + `teamMembers` + `userIds` مباشرة، ثم يرشح المستخدمين القادرين على الاستلام.
- تم تصميم السياسة لحماية `manual` و`system` و`tasks` و`campaigns` و`social_inbox` وغيرها، مع تفريق بين “المستلمين المباشرين” و“المرشحين وفق أدوار المصدر”.

### 2.6 التذكير المهامي `server/services/taskReminderService.ts`

- `notifyTaskAssignment` ينشئ إشعار `task_assigned` مع `source: 'tasks'`، نوع الكائن `task` أو `follow_up_task`.
- `notifyTaskTiming` ينشئ إشعار `task_due` أو `task_overdue` وفق التاريخ والهوية المحددة.
- `dispatchTaskDueReminders` يقرأ `taskReminderSchedules` ويستخدم `followUpTasks` و`tasks` للتنبيه عند اقتراب الاستحقاق أو تجاوزه.
- يحدّث الحقول `dueReminderSentAt` و`overdueReminderSentAt` فقط إذا تم إنشاء الإشعار بنجاح؛ هذا يثبت سياسة منع التكرار والحدّ من التكرار.

### 2.7 التوضيح المهم حول الفرق

- لا يوجد في هذا النطاق router فعلي لفرق العمل (`teamsRouter`) مع CRUD كامل، على الرغم من وجود schema ومعايير `teams` و`teamMembers` وواجهة إعدادات الإشعارات التي تستعملها.
- ما هو موثّق هو: نموذج الفرق موجود، والوظائف المؤسسية تستعمل الأدوار والفرق لتوجيه الإشعارات، بينما صفحات فريق الأعمال الحالية لا تزال في طور التطوير/الـ stub على الواجهة.
- التبليغ عن “إدارة فرق كاملة” يجب أن يُحصر في السلوك الحالي الموثق فقط، لا في فرضية مستقبلية أو متوقع.

## 3. النطاق التقني المقصود

### المهمة 11.1: دورة المهمة

- توثيق دورة المهمة من `create` إلى `updateStatus` إلى `completed` وإلغاء المهمة.
- مراجعة صلاحيات `tasks.view/create/update/assign/complete/delete` في `shared/rolePermissions.ts` و`rolePermissionService.ts`.
- توثيق استخدام `taskComments` و`taskAttachments` و`taskDeliverables` داخل task lifecycle.

### المهمة 11.2: مهام المتابعة

- توثيق علاقة `followUpTasks` بالكائنات `appointment`, `lead`, `offerLead`, و`campRegistration`.
- توثيق `updateFollowUpTaskStatus` و`dueReminderSentAt` و`overdueReminderSentAt`.
- تسجيل أن `followUpTasks` هي السمة التشغيلية للمهام المرتبطة بالسجلات.

### المهمة 11.3: الفرق والأعضاء

- توثيق `teams` و`teamMembers` كأدوات تنظيمية داخل schema، وليس كواجهة CRUD كاملة.
- توثيق أن فريق العمل وعضويته يتم استهلاكها في السياسة التشغيلية، لا بواجهة مستقلة كاملة.
- توثيق الفروقات بين `leaderId` في `teams` و`teamMembers.role` و`recipientTeamIds` في إعدادات الإشعارات.

### المهمة 11.4: الإشعارات الداخلية

- توثيق `notifications` table، `NOTIFICATION_TYPES`, `NOTIFICATION_SOURCES`, `NOTIFICATION_PRIORITIES`.
- توثيق `notificationPolicy` كحارس للتوزيع الفعلي قبل إنشاء رسالة في قاعدة البيانات.
- توثيق `create`, `createForUser`, `broadcastToAdmins`, `deleteExpired` والقيود على `actionUrl` و`expiresAt`.

### المهمة 11.5: التذكير والموجز اليومي

- توثيق جدولة التذكير `taskReminderSchedules` و`notificationDigestSchedules`.
- توثيق `dispatchTaskDueReminders` و`dispatchDailyUnreadNotificationDigests` كـ cron-driven flows.
- توثيق منع التكرار عبر `dueReminderSentAt` و`overdueReminderSentAt` و`lastDigestDate`.

### المهمة 11.6: الصلاحيات والتدقيق

- مراجعة `tasks.*` و`notifications.*` في `shared/rolePermissions.ts`.
- توثيق أن `rolePermissionService.ts` يقوم بترجمة الامتيازات القديمة إلى `tasks.manage` و`notifications.manage` عند الحاجة.
- توثيق أن البوابة لا تسمح بإنشاء إشعارات غير مأذون بها إلا عبر `notifications.send` أو `notifications.manage`.

### المهمة 11.7: التحقق والتوثيق

- تشغيل اختبارات المهمة/الإشعار ذات الصلة، ثم `pnpm docs:check` و`pnpm check`.
- إنشاء تقرير إغلاق المرحلة بعد اعتماد البوابة.

## 4. القيم/القيود الملاحظة

- لا توجد في هذا النطاق “واجهة كاملة لإدارة الفرق” تستند إلى راوتر فعلي يلبي CRUD كامل؛ ما هو موجود هو نموذج البيانات واحتياج الإدراك التشغيلية داخل الإشعارات.
- لا توجد إثباتات في الكود لقياسات KPI أو ROI أو تحويلات مؤتمتة مرتبطة بالمهام أو الإشعارات؛ كل ما هو موثّق هو منطق التشغيل الداخلي.
- بعض المسارات تنشئ إشعارات كـ fire-and-forget داخل `notifyTaskAssignment` أو `createUnreadNotificationDigest`; هذا لا يثبت التسليم الفعلي للرسالة خارج قاعدة البيانات.
- `notifications.*` و`tasks.*` محمية من خلال `permissionProcedure` و`assertRolePermission`؛ ما لم يكن هذا موثّقًا في القوالب/الواجهة، لا يصح وصفه بأنه “مُتاح للجميع”.
- `teamMembers` تُستخدم في السياسة لتصفية المرشحين، لكن لا يوجد دليل على قيد كيان الفريق داخل راوتر جاهز للواجهة.

## 5. معيار بوابة الاعتماد

تُغلق هذه المرحلة فقط بعد:

- [ ] مراجعة كاملة لكود `tasks`, `followUpTasks`, `notifications`, `notificationPolicy`, و`taskReminderService`.
- [ ] توثيق أدوار `tasks.*` و`notifications.*` في `shared/rolePermissions.ts` و`rolePermissionService.ts`.
- [ ] توثيق الفرق بين بيانات الفرق (`teams`/`teamMembers`) والسلوك الفعلي للواجهة/الراوتر.
- [ ] توثيق الفجوات والقيود التشغيلية في التذكير والإشعار.
- [ ] تشغيل الاختبارات والمراجعات المناسبة.
- [ ] اعتماد المستخدم كتابيًا للانتقال إلى المرحلة 12 أو إكمال المسار الحالي.

## 6. القرار الحالي

المرحلة 11 الآن في مرحلة الفحص والتخطيط، وفق المنهجية المطبقة في المشروع: تدقيق السلوك، توثيق النماذج، فصل المتغيرات الوظيفية عن الفروقات بين القيم والواجهة، ثم إغلاق البوابة قبل أي انتقال. لا يُسمح بالانتقال إلى المرحلة 12 قبل اعتمادٍ مكتوب.
