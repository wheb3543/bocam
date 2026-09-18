# مرجع المواعيد والحجوزات الحالي

**الحالة:** `working`
**الجمهور:** المسؤولون والمطورون وموظفو الحجز
**المجال:** Appointments & Bookings
**آخر مراجعة:** 2026-09-12
**المصادر:** `server/modules/01-booking-scheduling/routers/appointments/` (وجسر `server/routers/appointments.ts`)، `server/database/db/appointments.ts`، `server/tasks/cron/appointmentReminders.ts`، مكونات `client/src/apps/admin/modules/01-booking-scheduling/` (وجسور `client/src/components/booking/`)، `server/routers/__tests__/appointments.test.ts`

> هذا المرجع يصف السلوك الحالي من الكود. لا يضيف قواعد تجارية غير مثبتة، ولا يثبت أن كل ميزة مذكورة في دليل المستخدم متاحة للمريض.

## 1. إنشاء الحجز العام

`appointments.submit` إجراء `publicProcedure` يستقبل الاسم والهاتف والطبيب والحملة، مع حقول اختيارية للتاريخ والوقت والإجراء والملاحظات ومصادر UTM. يتحقق الإدخال عبر Zod، ويطبق صيغة الهاتف الحالية، ثم يمرر الطلب إلى `submitAppointment`.

هذا المسار لا يتطلب جلسة إدارية. أي حماية أو تحقق إضافي بعد الإدخال يجب قراءته من `submitRoute` وليس استنتاجه من كون الإجراء عامًا.

بعد الإدخال، ينشئ المسار الحملة تلقائيًا عند عدم وجودها، ويحفظ الموعد، ويرسل إشعارات email/owner/Telegram وقد يرسل WhatsApp حسب إعداد الحملة. كما يطلق dispatcher لرسالة `on_create`، وقد يحول الحالة إلى `contacted` عند نجاح الإرسال. بعض الإشعارات وCAPI تعمل fire-and-forget؛ لا يعني نجاح استجابة الحجز نجاح كل التكاملات التابعة.

## 2. حالات الموعد

القيم المدعومة في مسارات التحديث هي:

`pending`, `contacted`, `no_answer`, `confirmed`, `attended`, `completed`, `cancelled`.

عند تغيير الحالة، يسجل الخادم طابعًا زمنيًا للحالات `contacted` و`confirmed` و`attended` و`completed` و`cancelled`، ويحفظ ملاحظات الموظف عند تقديمها. لا يفرض الراوتر آلة انتقال صارمة تمنع كل انتقالات الحالات؛ أي قواعد إضافية يجب أن تكون في route/service المحدد.

## 3. إجراءات الإدارة

| الإجراء | الحماية | الوظيفة |
|---|---|---|
| `appointments.list` | `appointments.view` | قائمة المواعيد مع بيانات الطبيب |
| `appointments.listPaginated` | `appointments.view` | بحث وتصفية وترقيم حسب الطبيب والمصدر والحالة والتاريخ |
| `appointments.updateStatus` | `appointments.update`، و`appointments.cancel` عند إلغاء | تحديث الحالة وملاحظات الموظف |
| `appointments.updateAppointment` | `appointments.update`، و`appointments.cancel` عند إلغاء | تعديل التاريخ أو الحالة أو الملاحظات |
| `appointments.sendArrivalWelcome` | `appointments.update` | إرسال رسالة الوصول |
| `appointments.bulkUpdateStatus` | `appointments.update`، و`appointments.cancel` عند إلغاء | تحديث مجموعة مواعيد |
| `appointments.generateReceiptNumber` | `appointments.update` | توليد رقم إيصال |
| `appointments.assignableUsers` | `appointments.assign` | جلب المستخدمين القابلين للتعيين |
| `appointments.assign` | `appointments.assign` | تعيين الموعد وتسجيل audit وإشعار التعيين |
| `appointments.cancel` | `appointments.cancel` | اختصار لتحديث الحالة إلى cancelled |
| `appointments.delete` | `appointments.delete` | حذف الموعد فعليًا من الجدول |

## 4. الاستعلامات والتصفية

تقرأ طبقة `server/database/db/appointments.ts` المواعيد مع الطبيب عبر `leftJoin`. يدعم الاستعلام paginated البحث بالاسم والهاتف والبريد، والتصفية حسب الأطباء والمصادر والحالات والتاريخ. التصفية الزمنية تستخدم `createdAt` في طبقة قاعدة البيانات، بينما `appointmentDate` حقل منفصل في نتيجة الموعد؛ لا ينبغي وصفها بأنها تصفية لموعد الخدمة إلا إذا أكد الكود ذلك.

## 5. التعيين والتدقيق

تعيين الموعد يتحقق من المستخدم القابل للتعيين، يحدث `assignedToUserId`، يسجل `assignment_change` في audit log، ويرسل إشعارًا غير متزامن عند تعيين مستخدم جديد. بعد التغيير تُبطل caches المواعيد.

## 6. التذكيرات

يوجد مسار scheduled للمواعيد والتذكيرات، وتتحقق المهام المجدولة من هوية cron وtask UID قبل التنفيذ. تفاصيل الجداول الزمنية والرسائل تعتمد على `appointmentReminderSchedules` وملف المهمة؛ لا يثبت وجود إرسال ناجح في كل بيئة دون تشغيل المهمة واختبارها.

## 7. واجهة الإدارة والاختبارات

تستخدم واجهة الإدارة `appointments.listPaginated` وتوفر فلاتر وعرضًا جدوليًا وتحديثًا للحالة، مع مكونات booking منفصلة للبطاقات والفلاتر والجدول. تغطي اختبارات الراوتر بعض إجراءات appointments، وتغطي اختبارات الواجهة العرض والتفاعل؛ لا تثبت هذه الاختبارات كل انتقالات الحالة أو تشغيل cron الإنتاجي.

## 8. تعارضات وملاحظات

- دليل بوابة المريض القديم يصف تسجيل دخول بكلمة مرور وحجزًا ذاتيًا وإلغاءً بشروط غير مربوطة مباشرة بمسار appointment الحالي؛ يستخدم هذا المرجع التقني بدل اعتباره عقدًا للمريض.
- `appointments.delete` حذف فعلي، بينما الحذف الناعم ليس موثقًا في هذا الراوتر.
- حدود التداخل والجدولة وتوافر الطبيب تحتاج مطابقة مع `submitRoute` والاختبارات قبل وصفها كقواعد مضمونة.
- التذكير المجدول يتطلب هوية cron صالحة و`taskUid` مطابقًا لجدول نشط؛ الطلب غير المطابق يعاد له `403`.
