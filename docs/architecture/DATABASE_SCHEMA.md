# مخطط قاعدة البيانات | Database Schema

[العربية](#arabic) | [English](#english)

---

<a name="arabic"></a>

## 📊 نظرة عامة

تستخدم منصة SGH CRM Portal قاعدة بيانات **MySQL/TiDB** مع **40+ جدول** موزعة على فئات مختلفة. تم تصميم المخطط باستخدام **Drizzle ORM** لضمان النوعية والأمان.

### إحصائيات قاعدة البيانات

| المقياس | القيمة |
|---------|--------|
| **إجمالي الجداول** | 40+ |
| **إجمالي الأعمدة** | 500+ |
| **الفهارس** | 50+ |
| **العلاقات** | 30+ |

---

## 📁 فئات الجداول

### 1. جداول المستخدمين والصلاحيات (5 جداول)

#### `users` - المستخدمين
يخزن بيانات المستخدمين المصرح لهم للنظام.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف المستخدم |
| `openId` | VARCHAR(64) | معرف OAuth |
| `username` | VARCHAR(50) | اسم المستخدم (فريد) |
| `password` | VARCHAR(255) | كلمة المرور المشفرة |
| `name` | TEXT | الاسم الكامل |
| `email` | VARCHAR(320) | البريد الإلكتروني |
| `loginMethod` | VARCHAR(64) | طريقة تسجيل الدخول |
| `role` | ENUM | الدور (user, admin, manager, team_leader, staff, viewer) |
| `isActive` | ENUM | الحالة (yes, no) |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |
| `lastSignedIn` | TIMESTAMP | آخر تسجيل دخول |

#### `accessRequests` - طلبات التصريح
يخزن طلبات المستخدمين الجدد للحصول على صلاحيات.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الطلب |
| `openId` | VARCHAR(64) | معرف OAuth |
| `name` | TEXT | الاسم الكامل |
| `email` | VARCHAR(320) | البريد الإلكتروني |
| `phone` | VARCHAR(20) | رقم الهاتف |
| `reason` | TEXT | سبب الطلب |
| `status` | ENUM | الحالة (pending, approved, rejected) |
| `requestedAt` | TIMESTAMP | تاريخ الطلب |
| `reviewedAt` | TIMESTAMP | تاريخ المراجعة |
| `reviewedBy` | INT | معرف المراجع |

#### `userPreferences` - تفضيلات المستخدم
يخزن تفضيلات كل مستخدم لتخصيص الواجهة.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف التفضيل |
| `userId` | INT (FK) | معرف المستخدم |
| `preferenceKey` | VARCHAR(100) | مفتاح التفضيل |
| `preferenceValue` | TEXT | قيمة التفضيل (JSON) |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `teams` - الفرق
يخزن بيانات الفرق في النظام.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الفريق |
| `name` | VARCHAR(255) | اسم الفريق |
| `slug` | VARCHAR(255) | المعرف الفريد (فريد) |
| `description` | TEXT | الوصف |
| `leaderId` | INT (FK) | معرف قائد الفريق |
| `isActive` | BOOLEAN | هل الفريق نشط |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `teamMembers` - أعضاء الفريق
يخزن عضوية المستخدمين في الفرق.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف العضوية |
| `teamId` | INT (FK) | معرف الفريق |
| `userId` | INT (FK) | معرف المستخدم |
| `role` | ENUM | الدور (leader, member) |
| `joinedAt` | TIMESTAMP | تاريخ الانضمام |

---

### 2. جداول الحملات والتسويق (6 جداول)

#### `campaigns` - الحملات
يخزن بيانات الحملات التسويقية.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الحملة |
| `name` | VARCHAR(255) | اسم الحملة |
| `slug` | VARCHAR(255) | المعرف الفريد (فريد) |
| `description` | TEXT | الوصف |
| `type` | ENUM | النوع (digital, field, awareness, mixed) |
| `status` | ENUM | الحالة (draft, active, paused, completed, cancelled) |
| `plannedBudget` | INT | الميزانية المخططة |
| `actualBudget` | INT | الميزانية الفعلية |
| `currency` | VARCHAR(10) | العملة |
| `startDate` | TIMESTAMP | تاريخ البدء |
| `endDate` | TIMESTAMP | تاريخ الانتهاء |
| `platforms` | TEXT | المنصات (JSON) |
| `goals` | TEXT | الأهداف (JSON) |
| `targetLeads` | INT | هدف العملاء |
| `targetBookings` | INT | هدف الحجوزات |
| `targetROI` | INT | هدف عائد الاستثمار |
| `targetRevenue` | DECIMAL | هدف الإيرادات |
| `kpis` | TEXT | مؤشرات الأداء (JSON) |
| `notes` | TEXT | ملاحظات |
| `teamLeaderId` | INT (FK) | معرف قائد الفريق |
| `teamMembers` | TEXT | أعضاء الفريق (JSON) |
| `metaPixelId` | VARCHAR(100) | معرف Meta Pixel |
| `metaAccessToken` | TEXT | رمز وصول Meta |
| `whatsappEnabled` | BOOLEAN | هل WhatsApp مفعل |
| `whatsappWelcomeMessage` | TEXT | رسالة الترحيب |
| `isActive` | BOOLEAN | هل الحملة نشطة |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `leads` - العملاء المحتملين
يخزن بيانات العملاء المسجلين في الحملات.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف العميل |
| `campaignId` | INT (FK) | معرف الحملة |
| `fullName` | VARCHAR(255) | الاسم الكامل |
| `phone` | VARCHAR(20) | رقم الهاتف |
| `email` | VARCHAR(320) | البريد الإلكتروني |
| `status` | ENUM | الحالة (new, contacted, booked, not_interested, no_answer, pending, confirmed, completed, cancelled) |
| `source` | VARCHAR(100) | المصدر |
| `utmSource` | VARCHAR(100) | مصدر UTM |
| `utmMedium` | VARCHAR(100) | وسيط UTM |
| `utmCampaign` | VARCHAR(100) | حملة UTM |
| `utmTerm` | VARCHAR(100) | مصطلح UTM |
| `utmContent` | VARCHAR(100) | محتوى UTM |
| `utmPlacement` | VARCHAR(100) | موضع UTM |
| `notes` | TEXT | ملاحظات |
| `emailSent` | BOOLEAN | هل تم إرسال البريد |
| `whatsappSent` | BOOLEAN | هل تم إرسال WhatsApp |
| `bookingConfirmationSent` | BOOLEAN | هل تم إرسال تأكيد الحجز |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `leadStatusHistory` - سجل حالة العملاء
يتتبع جميع التغييرات في حالة العملاء.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف السجل |
| `leadId` | INT (FK) | معرف العميل |
| `userId` | INT (FK) | معرف المستخدم |
| `oldStatus` | VARCHAR(50) | الحالة القديمة |
| `newStatus` | VARCHAR(50) | الحالة الجديدة |
| `notes` | TEXT | ملاحظات |
| `createdAt` | TIMESTAMP | تاريخ التغيير |

#### `campaignOffers` - ربط الحملات بالعروض
جدول ربطMany-to-Many بين الحملات والعروض.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الربط |
| `campaignId` | INT (FK) | معرف الحملة |
| `offerId` | INT (FK) | معرف العرض |
| `createdAt` | TIMESTAMP | تاريخ الربط |

#### `campaignCamps` - ربط الحملات بالمخيمات
جدول ربط Many-to-Many بين الحملات والمخيمات.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الربط |
| `campaignId` | INT (FK) | معرف الحملة |
| `campId` | INT (FK) | معرف المخيم |
| `createdAt` | TIMESTAMP | تاريخ الربط |

#### `campaignDoctors` - ربط الحملات بالأطباء
جدول ربط Many-to-Many بين الحملات والأطباء.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الربط |
| `campaignId` | INT (FK) | معرف الحملة |
| `doctorId` | INT (FK) | معرف الطبيب |
| `createdAt` | TIMESTAMP | تاريخ الربط |

---

### 3. جداول المواعيد والحجوزات (4 جداول)

#### `doctors` - الأطباء
يخزن بيانات الأطباء المتاحين للحجز.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الطبيب |
| `name` | VARCHAR(255) | الاسم الكامل |
| `slug` | VARCHAR(255) | المعرف الفريد (فريد) |
| `specialty` | VARCHAR(255) | التخصص |
| `image` | VARCHAR(500) | صورة الطبيب |
| `bio` | TEXT | السيرة الذاتية |
| `experience` | VARCHAR(255) | الخبرة |
| `languages` | VARCHAR(255) | اللغات |
| `consultationFee` | VARCHAR(100) | رسوم الاستشارة |
| `procedures` | TEXT | الإجراءات (JSON) |
| `isVisiting` | ENUM | طبيب زائر (yes, no) |
| `available` | ENUM | متاح (yes, no) |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `appointments` - المواعيد
يخزن حجوزات مواعيد الأطباء.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الموعد |
| `campaignId` | INT (FK) | معرف الحملة |
| `doctorId` | INT (FK) | معرف الطبيب |
| `fullName` | VARCHAR(255) | اسم المريض |
| `phone` | VARCHAR(20) | رقم الهاتف |
| `email` | VARCHAR(320) | البريد الإلكتروني |
| `age` | INT | العمر |
| `gender` | ENUM | الجنس (male, female) |
| `procedure` | TEXT | الإجراء |
| `preferredDate` | VARCHAR(50) | التاريخ المفضل |
| `preferredTime` | VARCHAR(50) | الوقت المفضل |
| `appointmentDate` | TIMESTAMP | تاريخ الموعد المؤكد |
| `patientMessage` | TEXT | رسالة المريض |
| `notes` | TEXT | ملاحظات المريض |
| `additionalNotes` | TEXT | ملاحظات إضافية |
| `staffNotes` | TEXT | ملاحظات الموظفين |
| `status` | ENUM | الحالة (pending, contacted, no_answer, confirmed, attended, completed, cancelled) |
| `contactedAt` | TIMESTAMP | تاريخ التواصل |
| `confirmedAt` | TIMESTAMP | تاريخ التأكيد |
| `attendedAt` | TIMESTAMP | تاريخ الحضور |
| `completedAt` | TIMESTAMP | تاريخ الاكتمال |
| `cancelledAt` | TIMESTAMP | تاريخ الإلغاء |
| `source` | VARCHAR(100) | المصدر |
| `utmSource` | VARCHAR(100) | مصدر UTM |
| `utmMedium` | VARCHAR(100) | وسيط UTM |
| `utmCampaign` | VARCHAR(100) | حملة UTM |
| `utmTerm` | VARCHAR(100) | مصطلح UTM |
| `utmContent` | VARCHAR(100) | محتوى UTM |
| `utmPlacement` | VARCHAR(100) | موضع UTM |
| `referrer` | VARCHAR(500) | المحيل |
| `fbclid` | VARCHAR(255) | معرف Facebook Click |
| `gclid` | VARCHAR(255) | معرف Google Click |
| `receiptNumber` | VARCHAR(50) | رقم السند |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

**الفهارس:**
- `phoneIdx` - فهرس على رقم الهاتف
- `emailIdx` - فهرس على البريد الإلكتروني
- `statusIdx` - فهرس على الحالة
- `createdAtIdx` - فهرس على تاريخ الإنشاء
- `doctorIdIdx` - فهرس على معرف الطبيب

#### `offerLeads` - حجوزات العروض
يخزن طلبات العملاء للعروض الخاصة.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الحجز |
| `offerId` | INT (FK) | معرف العرض |
| `campaignId` | INT (FK) | معرف الحملة |
| `fullName` | VARCHAR(255) | اسم المريض |
| `phone` | VARCHAR(20) | رقم الهاتف |
| `email` | VARCHAR(320) | البريد الإلكتروني |
| `age` | INT | العمر |
| `gender` | ENUM | الجنس (male, female) |
| `patientMessage` | TEXT | رسالة المريض |
| `notes` | TEXT | ملاحظات |
| `status` | ENUM | الحالة (pending, contacted, no_answer, confirmed, attended, completed, cancelled) |
| `statusNotes` | TEXT | ملاحظات الحالة |
| `contactedAt` | TIMESTAMP | تاريخ التواصل |
| `confirmedAt` | TIMESTAMP | تاريخ التأكيد |
| `attendedAt` | TIMESTAMP | تاريخ الحضور |
| `completedAt` | TIMESTAMP | تاريخ الاكتمال |
| `cancelledAt` | TIMESTAMP | تاريخ الإلغاء |
| `source` | VARCHAR(100) | المصدر |
| `utmSource` | VARCHAR(100) | مصدر UTM |
| `utmMedium` | VARCHAR(100) | وسيط UTM |
| `utmCampaign` | VARCHAR(100) | حملة UTM |
| `utmTerm` | VARCHAR(100) | مصطلح UTM |
| `utmContent` | VARCHAR(100) | محتوى UTM |
| `utmPlacement` | VARCHAR(100) | موضع UTM |
| `referrer` | VARCHAR(500) | المحيل |
| `fbclid` | VARCHAR(255) | معرف Facebook Click |
| `gclid` | VARCHAR(255) | معرف Google Click |
| `receiptNumber` | VARCHAR(50) | رقم السند |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

**الفهارس:**
- `phoneIdx` - فهرس على رقم الهاتف
- `emailIdx` - فهرس على البريد الإلكتروني
- `statusIdx` - فهرس على الحالة
- `createdAtIdx` - فهرس على تاريخ الإنشاء
- `offerIdIdx` - فهرس على معرف العرض

#### `campRegistrations` - تسجيلات المخيمات
يخزن تسجيلات المرضى في المخيمات الطبية.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف التسجيل |
| `campId` | INT (FK) | معرف المخيم |
| `campaignId` | INT (FK) | معرف الحملة |
| `fullName` | VARCHAR(255) | اسم المريض |
| `phone` | VARCHAR(20) | رقم الهاتف |
| `email` | VARCHAR(320) | البريد الإلكتروني |
| `age` | INT | العمر |
| `gender` | ENUM | الجنس (male, female) |
| `procedures` | TEXT | الإجراءات (JSON) |
| `medicalCondition` | TEXT | الحالة الطبية |
| `patientMessage` | TEXT | رسالة المريض |
| `notes` | TEXT | ملاحظات |
| `status` | ENUM | الحالة (pending, contacted, no_answer, confirmed, attended, completed, cancelled) |
| `statusNotes` | TEXT | ملاحظات الحالة |
| `attendanceDate` | TIMESTAMP | تاريخ الحضور |
| `preferredDate` | VARCHAR(20) | التاريخ المفضل |
| `preferredTimeSlot` | ENUM | الوقت المفضل (morning, evening) |
| `contactedAt` | TIMESTAMP | تاريخ التواصل |
| `confirmedAt` | TIMESTAMP | تاريخ التأكيد |
| `attendedAt` | TIMESTAMP | تاريخ الحضور |
| `completedAt` | TIMESTAMP | تاريخ الاكتمال |
| `cancelledAt` | TIMESTAMP | تاريخ الإلغاء |
| `source` | VARCHAR(100) | المصدر |
| `utmSource` | VARCHAR(100) | مصدر UTM |
| `utmMedium` | VARCHAR(100) | وسيط UTM |
| `utmCampaign` | VARCHAR(100) | حملة UTM |
| `utmTerm` | VARCHAR(100) | مصطلح UTM |
| `utmContent` | VARCHAR(100) | محتوى UTM |
| `utmPlacement` | VARCHAR(100) | موضع UTM |
| `referrer` | VARCHAR(500) | المحيل |
| `fbclid` | VARCHAR(255) | معرف Facebook Click |
| `gclid` | VARCHAR(255) | معرف Google Click |
| `receiptNumber` | VARCHAR(50) | رقم السند |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

**الفهارس:**
- `phoneIdx` - فهرس على رقم الهاتف
- `emailIdx` - فهرس على البريد الإلكتروني
- `statusIdx` - فهرس على الحالة
- `createdAtIdx` - فهرس على تاريخ الإنشاء
- `campIdIdx` - فهرس على معرف المخيم

---

### 4. جداول العروض والمخيمات (2 جدول)

#### `offers` - العروض
يخزن العروض الطبية الخاصة.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف العرض |
| `title` | VARCHAR(255) | العنوان |
| `slug` | VARCHAR(255) | المعرف الفريد (فريد) |
| `description` | TEXT | الوصف |
| `imageUrl` | VARCHAR(500) | رابط الصورة |
| `isActive` | BOOLEAN | هل العرض نشط |
| `startDate` | TIMESTAMP | تاريخ البدء |
| `endDate` | TIMESTAMP | تاريخ الانتهاء |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `camps` - المخيمات
يخزن بيانات المخيمات الطبية.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف المخيم |
| `name` | VARCHAR(255) | الاسم |
| `slug` | VARCHAR(255) | المعرف الفريد (فريد) |
| `description` | TEXT | الوصف |
| `imageUrl` | VARCHAR(500) | رابط الصورة |
| `startDate` | TIMESTAMP | تاريخ البدء |
| `endDate` | TIMESTAMP | تاريخ الانتهاء |
| `isActive` | BOOLEAN | هل المخيم نشط |
| `freeOffers` | TEXT | العروض المجانية |
| `discountedOffers` | TEXT | العروض المخفضة |
| `availableProcedures` | TEXT | الإجراءات المتاحة (JSON) |
| `galleryImages` | TEXT | صور المعرض (JSON) |
| `morningTime` | VARCHAR(20) | وقت الجلسة الصباحية |
| `eveningTime` | VARCHAR(20) | وقت الجلسة المسائية |
| `dailyCapacity` | INT | الطاقة الاستيعابية اليومية |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

---

### 5. جداول إدارة المهام (5 جداول)

#### `projects` - المشاريع
يخزن المشاريع المرتبطة بالحملات.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف المشروع |
| `title` | VARCHAR(255) | العنوان |
| `slug` | VARCHAR(255) | المعرف الفريد (فريد) |
| `description` | TEXT | الوصف |
| `startDate` | TIMESTAMP | تاريخ البدء |
| `endDate` | TIMESTAMP | تاريخ الانتهاء |
| `status` | ENUM | الحالة (planning, active, completed, on_hold, cancelled) |
| `priority` | ENUM | الأولوية (low, medium, high, urgent) |
| `createdBy` | INT (FK) | معرف المنشئ |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `tasks` - المهام
يخزن المهام المرتبطة بالمشاريع والفرق.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف المهمة |
| `projectId` | INT (FK) | معرف المشروع |
| `teamId` | INT (FK) | معرف الفريق |
| `campaignId` | INT (FK) | معرف الحملة |
| `title` | VARCHAR(255) | العنوان |
| `description` | TEXT | الوصف |
| `assignedTo` | INT (FK) | معرف المنفذ |
| `priority` | ENUM | الأولوية (low, medium, high, urgent) |
| `status` | ENUM | الحالة (todo, in_progress, review, completed, cancelled) |
| `category` | ENUM | الفئة (content, design, ads, seo, social_media, analytics, other) |
| `dueDate` | TIMESTAMP | تاريخ الاستحقاق |
| `completedAt` | TIMESTAMP | تاريخ الاكتمال |
| `estimatedHours` | INT | الساعات المقدرة |
| `actualHours` | INT | الساعات الفعلية |
| `tags` | TEXT | العلامات (JSON) |
| `createdBy` | INT (FK) | معرف المنشئ |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `taskComments` - تعليقات المهام
يخزن التعليقات على المهام.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف التعليق |
| `taskId` | INT (FK) | معرف المهمة |
| `userId` | INT (FK) | معرف المستخدم |
| `content` | TEXT | المحتوى |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `taskAttachments` - مرفقات المهام
يخزن المرفقات والتسليمات للمهام.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف المرفق |
| `taskId` | INT (FK) | معرف المهمة |
| `userId` | INT (FK) | معرف المستخدم |
| `fileName` | VARCHAR(255) | اسم الملف |
| `fileUrl` | TEXT | رابط الملف |
| `fileType` | VARCHAR(100) | نوع الملف |
| `fileSize` | INT | حجم الملف |
| `attachmentType` | ENUM | نوع المرفق (deliverable, reference, other) |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |

#### `taskDeliverables` - تسليمات المهام
يخزن تسليمات المهام ومراجعتها.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف التسليم |
| `taskId` | INT (FK) | معرف المهمة |
| `userId` | INT (FK) | معرف المستخدم |
| `fileUrl` | VARCHAR(500) | رابط الملف |
| `notes` | TEXT | ملاحظات |
| `status` | ENUM | الحالة (pending, approved, rejected, revision_needed) |
| `reviewNotes` | TEXT | ملاحظات المراجعة |
| `submittedAt` | TIMESTAMP | تاريخ التسليم |
| `reviewedBy` | INT (FK) | معرف المراجع |
| `reviewedAt` | TIMESTAMP | تاريخ المراجعة |

---

### 6. جداول WhatsApp (18 جدول)

#### `whatsapp_conversations` - المحادثات
يخزن جميع محادثات WhatsApp.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف المحادثة |
| `phoneNumber` | VARCHAR(20) | رقم الهاتف |
| `customerName` | VARCHAR(255) | اسم العميل |
| `lastMessage` | TEXT | آخر رسالة |
| `lastMessageAt` | TIMESTAMP | تاريخ آخر رسالة |
| `unreadCount` | INT | عدد الرسائل غير المقروءة |
| `isImportant` | INT | هل مهمة (0/1) |
| `isArchived` | INT | هل مؤرشفة (0/1) |
| `leadId` | INT (FK) | معرف العميل |
| `appointmentId` | INT (FK) | معرف الموعد |
| `offerLeadId` | INT (FK) | معرف حجز العرض |
| `campRegistrationId` | INT (FK) | معرف تسجيل المخيم |
| `assignedToUserId` | INT (FK) | معرف المستخدم المسؤول |
| `notes` | TEXT | ملاحظات |
| `conversationIdMeta` | VARCHAR(255) | معرف المحادثة من Meta |
| `originType` | VARCHAR(50) | نوع الأصل |
| `expirationTimestamp` | TIMESTAMP | تاريخ الانتهاء |
| `pricingModel` | VARCHAR(50) | نموذج التسعير |
| `billable` | BOOLEAN | هل مدفوعة |
| `pricingCategory` | VARCHAR(50) | فئة التسعير |
| `totalCost` | INT | التكلفة الإجمالية |
| `messageCount` | INT | عدد الرسائل |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `whatsapp_messages` - الرسائل
يخزن جميع الرسائل في المحادثات.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الرسالة |
| `conversationId` | INT (FK) | معرف المحادثة |
| `direction` | ENUM | الاتجاه (inbound, outbound) |
| `content` | TEXT | المحتوى |
| `messageType` | ENUM | نوع الرسالة (text, image, document, audio, video, location, template, interactive, contacts, button_reply, list_reply, sticker, reaction, order, referral, product_enquiry, unsupported) |
| `mediaUrl` | VARCHAR(500) | رابط الوسائط |
| `status` | ENUM | الحالة (sent, delivered, read, failed, received) |
| `whatsappMessageId` | VARCHAR(255) | معرف الرسالة من WhatsApp |
| `sentBy` | INT (FK) | معرف المرسل |
| `isAutomated` | INT | هل تلقائية (0/1) |
| `replyToMessageId` | INT (FK) | معرف الرسالة المطلوبة |
| `sentAt` | TIMESTAMP | تاريخ الإرسال |
| `deliveredAt` | TIMESTAMP | تاريخ التسليم |
| `readAt` | TIMESTAMP | تاريخ القراءة |
| `errorInfo` | TEXT | معلومات الخطأ |
| `metadata` | TEXT | بيانات إضافية (JSON) |
| `conversationIdMeta` | VARCHAR(255) | معرف المحادثة من Meta |
| `conversationOriginType` | VARCHAR(50) | نوع أصل المحادثة |
| `conversationExpirationTimestamp` | TIMESTAMP | تاريخ انتهاء المحادثة |
| `pricingModel` | VARCHAR(50) | نموذج التسعير |
| `pricingBillable` | BOOLEAN | هل مدفوعة |
| `pricingCategory` | VARCHAR(50) | فئة التسعير |
| `identityAcknowledged` | BOOLEAN | هل تم التعرف على الهوية |
| `identityHash` | VARCHAR(255) | تجزئة الهوية |
| `reactionEmoji` | VARCHAR(50) | رمز رد الفعل |
| `reactionMessageId` | VARCHAR(255) | معرف رسالة رد الفعل |
| `orderCatalogId` | VARCHAR(255) | معرف كتالوج الطلب |
| `orderProductItems` | TEXT | عناصر المنتج (JSON) |
| `referralSourceUrl` | TEXT | رابط مصدر الإحالة |
| `referralSourceId` | VARCHAR(255) | معرف مصدر الإحالة |
| `referralSourceType` | VARCHAR(50) | نوع مصدر الإحالة |
| `productCatalogId` | VARCHAR(255) | معرف كتالوج المنتج |
| `productRetailerId` | VARCHAR(255) | معرف بائع المنتج |
| `transactionStatus` | VARCHAR(50) | حالة المعاملة |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |

**ملاحظة:** باقي جداول WhatsApp (templates, broadcasts, auto_replies, analytics, notifications, blocked_numbers, account_alerts, security_events, phone_quality, user_opt_ins, webhook_events, contacts, orders, products, referrals, reactions, transactions) تتبع نفس النمط مع حقول متخصصة لكل وظيفة.

---

### 7. جداول بوابة المريض (3 جداول)

#### `patients` - المرضى
يخزن بيانات المرضى المسجلين في بوابة المريض.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف المريض |
| `fullName` | VARCHAR(255) | الاسم الكامل |
| `phone` | VARCHAR(20) | رقم الهاتف (فريد) |
| `password` | VARCHAR(255) | كلمة المرور |
| `address` | TEXT | العنوان |
| `age` | INT | العمر |
| `gender` | ENUM | الجنس (male, female) |
| `email` | VARCHAR(320) | البريد الإلكتروني |
| `isActive` | BOOLEAN | هل الحساب نشط |
| `lastLoginAt` | TIMESTAMP | آخر تسجيل دخول |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

**الفهارس:**
- `phoneIdx` - فهرس فريد على رقم الهاتف

#### `patientOtps` - رموز OTP
يخزن رموز التحقق لمرة واحدة لتسجيل دخول المرضى.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الرمز |
| `phone` | VARCHAR(20) | رقم الهاتف |
| `code` | VARCHAR(6) | رمز OTP |
| `expiresAt` | TIMESTAMP | تاريخ الانتهاء |
| `isUsed` | BOOLEAN | هل تم استخدامه |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |

**الفهارس:**
- `phoneIdx` - فهرس على رقم الهاتف

#### `patientResults` - نتائج المرضى
يخزن نتائج التحاليل والأشعة والتقارير الطبية.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف النتيجة |
| `patientId` | INT (FK) | معرف المريض |
| `resultType` | ENUM | نوع النتيجة (lab, radiology, report) |
| `title` | VARCHAR(255) | العنوان |
| `description` | TEXT | الوصف |
| `fileUrl` | VARCHAR(500) | رابط file |
| `doctorName` | VARCHAR(255) | اسم الطبيب |
| `resultDate` | TIMESTAMP | تاريخ النتيجة |
| `status` | ENUM | الحالة (pending, ready, delivered) |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

**الفهارس:**
- `patientIdx` - فهرس على معرف المريض

---

### 8. جداول التتبع والتحليلات (4 جداول)

#### `visitSessions` - جلسات الزيارة
يتتبع كل زيارة للموقع مع مصدرها ومسار التنقل.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `sessionId` | VARCHAR(64) | معرف الجلسة (فريد) |
| `source` | VARCHAR(64) | المصدر |
| `utmSource` | VARCHAR(128) | مصدر UTM |
| `utmMedium` | VARCHAR(128) | وسيط UTM |
| `utmCampaign` | VARCHAR(256) | حملة UTM |
| `utmContent` | VARCHAR(256) | محتوى UTM |
| `utmTerm` | VARCHAR(256) | مصطلح UTM |
| `fbclid` | VARCHAR(256) | معرف Facebook Click |
| `gclid` | VARCHAR(256) | معرف Google Click |
| `landingPage` | VARCHAR(512) | صفحة الهبوط |
| `referrer` | VARCHAR(512) | المحيل |
| `userAgent` | TEXT | وكيل المستخدم |
| `converted` | BOOLEAN | هل تم التحويل |
| `conversionType` | VARCHAR(64) | نوع التحويل |
| `conversionId` | INT | معرف التحويل |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `trackingEvents` - أحداث التتبع
يسجل أحداث التتبع المختلفة على الموقع.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الحدث |
| `sessionId` | VARCHAR(64) | معرف الجلسة |
| `eventType` | VARCHAR(64) | نوع الحدث |
| `page` | VARCHAR(512) | الصفحة |
| `metadata` | TEXT | بيانات إضافية (JSON) |
| `source` | VARCHAR(64) | المصدر |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |

#### `pwaInstalls` - تثبيتات PWA
يتتبع عمليات تثبيت التطبيق.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف التثبيت |
| `appType` | ENUM | نوع التطبيق (public, admin) |
| `userId` | INT (FK) | معرف المستخدم |
| `userAgent` | TEXT | وكيل المستخدم |
| `platform` | VARCHAR(100) | المنصة |
| `ipAddress` | VARCHAR(45) | عنوان IP |
| `installedAt` | TIMESTAMP | تاريخ التثبيت |

#### `abandonedForms` - النماذج المهجورة
يتتبع النماذج غير المكتملة (الفرص الضائعة).

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف النموذج |
| `formType` | ENUM | نوع النموذج (appointment, offer, camp, general) |
| `phone` | VARCHAR(32) | رقم الهاتف |
| `name` | VARCHAR(256) | الاسم |
| `relatedId` | INT | معرف مرتبط |
| `relatedName` | VARCHAR(256) | اسم مرتبط |
| `formData` | TEXT | بيانات النموذج (JSON) |
| `source` | VARCHAR(64) | المصدر |
| `utmSource` | VARCHAR(128) | مصدر UTM |
| `utmCampaign` | VARCHAR(256) | حملة UTM |
| `sessionId` | VARCHAR(64) | معرف الجلسة |
| `contacted` | BOOLEAN | هل تم التواصل |
| `contactedAt` | TIMESTAMP | تاريخ التواصل |
| `converted` | BOOLEAN | هل تم التحويل |
| `convertedAt` | TIMESTAMP | تاريخ التحويل |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |

---

### 9. جداول أخرى (11 جدول)

#### `comments` - التعليقات
يخزن التعليقات على السجلات المختلفة (المواعيد، العملاء، إلخ).

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف التعليق |
| `entityType` | ENUM | نوع الكيان (appointment, lead, offerLead, campRegistration) |
| `entityId` | INT | معرف الكيان |
| `content` | TEXT | المحتوى |
| `userId` | INT (FK) | معرف المستخدم |
| `userName` | VARCHAR(255) | اسم المستخدم |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

**الفهارس:**
- `entityIdx` - فهرس مركب على (entityType, entityId)
- `createdAtIdx` - فهرس على تاريخ الإنشاء

#### `followUpTasks` - مهام المتابعة
يخزن مهام المتابعة للسجلات المختلفة.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف المهمة |
| `entityType` | ENUM | نوع الكيان (appointment, lead, offerLead, campRegistration) |
| `entityId` | INT | معرف الكيان |
| `title` | VARCHAR(255) | العنوان |
| `description` | TEXT | الوصف |
| `status` | ENUM | الحالة (pending, in_progress, completed, cancelled) |
| `priority` | ENUM | الأولوية (low, medium, high) |
| `dueDate` | TIMESTAMP | تاريخ الاستحقاق |
| `assignedToId` | INT (FK) | معرف المنفذ |
| `assignedToName` | VARCHAR(255) | اسم المنفذ |
| `createdById` | INT (FK) | معرف المنشئ |
| `createdByName` | VARCHAR(255) | اسم المنشئ |
| `completedAt` | TIMESTAMP | تاريخ الاكتمال |
| `completedById` | INT (FK) | معرف المكتمل |
| `completedByName` | VARCHAR(255) | اسم المكتمل |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

**الفهارس:**
- `entityIdx` - فهرس مركب على (entityType, entityId)
- `statusIdx` - فهرس على الحالة
- `dueDateIdx` - فهرس على تاريخ الاستحقاق
- `assignedToIdx` - فهرس على معرف المنفذ

#### `auditLogs` - سجل التدقيق
يتتبع جميع التغييرات على السجلات.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف السجل |
| `entityType` | VARCHAR(50) | نوع الكيان |
| `entityId` | INT | معرف الكيان |
| `action` | VARCHAR(50) | نوع الإجراء (status_change, bulk_update, delete, create, update) |
| `oldValue` | TEXT | القيمة القديمة (JSON) |
| `newValue` | TEXT | القيمة الجديدة (JSON) |
| `userId` | INT (FK) | معرف المستخدم |
| `userName` | VARCHAR(255) | اسم المستخدم |
| `notes` | TEXT | ملاحظات |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |

**الفهارس:**
- `entityIdx` - فهرس مركب على (entityType, entityId)
- `actionIdx` - فهرس على نوع الإجراء
- `userIdx` - فهرس على معرف المستخدم

#### `savedFilters` - الفلاتر المحفوظة
يخزن إعدادات الفلاتر المفضلة للمستخدمين.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الفلتر |
| `name` | VARCHAR(100) | اسم الفلتر |
| `pageType` | VARCHAR(50) | نوع الصفحة |
| `filterConfig` | TEXT | إعدادات الفلتر (JSON) |
| `userId` | INT (FK) | معرف المستخدم |
| `isDefault` | BOOLEAN | هل هو الفلتر الافتراضي |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

**الفهارس:**
- `userPageIdx` - فهرس مركب على (userId, pageType)

#### `sharedColumnTemplates` - قوالب الأعمدة المشتركة
يخزن قوالب الأعمدة التي ينشئها المدير وتظهر لجميع المستخدمين.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف القالب |
| `name` | VARCHAR(100) | اسم القالب |
| `tableKey` | VARCHAR(50) | نوع الجدول |
| `columns` | TEXT | إعدادات الأعمدة (JSON) |
| `createdBy` | INT (FK) | معرف المنشئ |
| `createdByName` | VARCHAR(255) | اسم المنشئ |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

**الفهارس:**
- `tableKeyIdx` - فهرس على نوع الجدول

#### `messageSettings` - إعدادات الرسائل
يخزن إعدادات الرسائل التلقائية.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الإعداد |
| `messageType` | VARCHAR(100) | نوع الرسالة (فريد) |
| `displayName` | VARCHAR(255) | الاسم المعروض |
| `category` | ENUM | الفئة (patient_journey, executive_reports, task_management, doctor_notifications) |
| `messageContent` | TEXT | محتوى الرسالة |
| `isEnabled` | INT | مفعل (0/1) |
| `deliveryChannel` | ENUM | قناة الإرسال (whatsapp_api, whatsapp_integration, both) |
| `availableVariables` | TEXT | المتغيرات المتاحة (JSON) |
| `description` | TEXT | الوصف |
| `entityType` | ENUM | نوع الكيان (appointment, camp_registration, offer_lead, all) |
| `triggerEvent` | ENUM | حدث التشغيل (on_create, on_confirmed, on_arrived, on_completed, on_cancelled, on_reminder_24h, on_reminder_1h, manual) |
| `whatsappTemplateId` | INT (FK) | معرف قالب WhatsApp |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `messageTemplates` - قوالب الرسائل
يخزن قوالب رسائل WhatsApp المعتمدة من Meta.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف القالب |
| `templateName` | VARCHAR(255) | اسم القالب (فريد) |
| `displayName` | VARCHAR(255) | الاسم المعروض |
| `category` | ENUM | الفئة (MARKETING, UTILITY, AUTHENTICATION) |
| `languageCode` | VARCHAR(10) | رمز اللغة |
| `status` | ENUM | الحالة (PENDING, APPROVED, REJECTED, DISABLED) |
| `headerText` | TEXT | نص الرأس |
| `bodyText` | TEXT | نص الجسم |
| `footerText` | TEXT | نص التذييل |
| `buttons` | TEXT | الأزرار (JSON) |
| `variables` | TEXT | المتغيرات (JSON) |
| `metaTemplateId` | VARCHAR(255) | معرف القالب من Meta |
| `linkedMessageType` | VARCHAR(100) | نوع الرسالة المرتبطة |
| `usageCount` | INT | عدد الاستخدامات |
| `lastUsedAt` | TIMESTAMP | آخر استخدام |
| `description` | TEXT | الوصف |
| `createdBy` | INT (FK) | معرف المنشئ |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `scheduled_messages` - الرسائل المجدولة
يخزن الرسائل المقرر إرسالها في المستقبل.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الرسالة |
| `conversationId` | INT (FK) | معرف المحادثة |
| `phoneNumber` | VARCHAR(20) | رقم الهاتف |
| `content` | TEXT | المحتوى |
| `messageType` | ENUM | نوع الرسالة (text, template) |
| `templateId` | INT (FK) | معرف القالب |
| `templateName` | VARCHAR(255) | اسم القالب |
| `languageCode` | VARCHAR(20) | رمز اللغة |
| `scheduledAt` | TIMESTAMP | تاريخ الجدولة |
| `status` | ENUM | الحالة (pending, sent, failed, cancelled) |
| `sentAt` | TIMESTAMP | تاريخ الإرسال |
| `errorInfo` | TEXT | معلومات الخطأ |
| `createdBy` | INT (FK) | معرف المنشئ |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |

#### `quick_replies` - الردود السريعة
يخزن قوالب الردود السريعة.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الرد |
| `name` | VARCHAR(255) | الاسم |
| `content` | TEXT | المحتوى |
| `category` | VARCHAR(50) | الفئة |
| `isActive` | INT | مفعل (0/1) |
| `usageCount` | INT | عدد الاستخدامات |
| `createdBy` | INT (FK) | معرف المنشئ |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

#### `saved_searches` - البحثات المحفوظة
يخزن فلاتر البحث المحفوظة للمحادثات.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف البحث |
| `userId` | INT (FK) | معرف المستخدم |
| `name` | VARCHAR(255) | الاسم |
| `searchQuery` | VARCHAR(500) | نص البحث |
| `filterType` | VARCHAR(50) | نوع الفلتر |
| `dateRange` | VARCHAR(50) | نطاق التاريخ |
| `messageType` | VARCHAR(50) | نوع الرسالة |
| `createdAt` | TIMESTAMP | تاريخ الإنشاء |

#### `settings` - إعدادات النظام
يخزن إعدادات النظام العامة.

| العمود | النوع | الوصف |
|--------|-------|-------|
| `id` | INT (PK) | معرف الإعداد |
| `key` | VARCHAR(100) | المفتاح (فريد) |
| `value` | TEXT | القيمة |
| `description` | TEXT | الوصف |
| `updatedAt` | TIMESTAMP | تاريخ التحديث |

---

## 🔗 مخطط العلاقات

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         جدول المستخدمين (users)                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ id, openId, username, password, name, email, role, isActive   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│   طلبات التصريح        │ │   تفضيلات المستخدم      │ │       الفرق             │
│ (accessRequests)        │ │ (userPreferences)       │ │    (teams)              │
│ openId → users.openId   │ │ userId → users.id       │ │ leaderId → users.id     │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
                                                                 │
                                                                 ▼
                                                    ┌─────────────────────────┐
                                                    │   أعضاء الفريق         │
                                                    │ (teamMembers)           │
                                                    │ teamId → teams.id       │
                                                    │ userId → users.id       │
                                                    └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        جدول الحملات (campaigns)                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ id, name, slug, type, status, budget, dates, platforms        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│      العملاء            │ │    ربط العروض          │ │    ربط المخيمات        │
│    (leads)              │ │ (campaignOffers)        │ │ (campaignCamps)         │
│ campaignId → campaigns.id│ │ campaignId → campaigns.id│ │ campaignId → campaigns.id│
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        جدول الأطباء (doctors)                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ id, name, slug, specialty, image, bio, experience             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       جدول المواعيد (appointments)                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ id, campaignId, doctorId, fullName, phone, status, dates      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

<a name="english"></a>

## 📊 Overview

SGH CRM Portal uses **MySQL/TiDB** database with **40+ tables** distributed across different categories. The schema is designed using **Drizzle ORM** to ensure type safety and security.

### Database Statistics

| Metric | Value |
|--------|-------|
| **Total Tables** | 40+ |
| **Total Columns** | 500+ |
| **Indexes** | 50+ |
| **Relationships** | 30+ |

---

## 📁 Table Categories

### 1. Users & Permissions Tables (5 tables)

#### `users` - Users
Stores authorized system users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | User ID |
| `openId` | VARCHAR(64) | OAuth ID |
| `username` | VARCHAR(50) | Username (unique) |
| `password` | VARCHAR(255) | Encrypted password |
| `name` | TEXT | Full name |
| `email` | VARCHAR(320) | Email |
| `loginMethod` | VARCHAR(64) | Login method |
| `role` | ENUM | Role (user, admin, manager, team_leader, staff, viewer) |
| `isActive` | ENUM | Status (yes, no) |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |
| `lastSignedIn` | TIMESTAMP | Last sign-in |

#### `accessRequests` - Access Requests
Stores new user requests for system access.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Request ID |
| `openId` | VARCHAR(64) | OAuth ID |
| `name` | TEXT | Full name |
| `email` | VARCHAR(320) | Email |
| `phone` | VARCHAR(20) | Phone number |
| `reason` | TEXT | Request reason |
| `status` | ENUM | Status (pending, approved, rejected) |
| `requestedAt` | TIMESTAMP | Request date |
| `reviewedAt` | TIMESTAMP | Review date |
| `reviewedBy` | INT | Reviewer ID |

#### `userPreferences` - User Preferences
Stores user preferences for interface customization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Preference ID |
| `userId` | INT (FK) | User ID |
| `preferenceKey` | VARCHAR(100) | Preference key |
| `preferenceValue` | TEXT | Preference value (JSON) |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `teams` - Teams
Stores team information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Team ID |
| `name` | VARCHAR(255) | Team name |
| `slug` | VARCHAR(255) | Unique identifier (unique) |
| `description` | TEXT | Description |
| `leaderId` | INT (FK) | Team leader ID |
| `isActive` | BOOLEAN | Is active |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `teamMembers` - Team Members
Stores user membership in teams.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Membership ID |
| `teamId` | INT (FK) | Team ID |
| `userId` | INT (FK) | User ID |
| `role` | ENUM | Role (leader, member) |
| `joinedAt` | TIMESTAMP | Join date |

---

### 2. Campaigns & Marketing Tables (6 tables)

#### `campaigns` - Campaigns
Stores marketing campaign data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Campaign ID |
| `name` | VARCHAR(255) | Campaign name |
| `slug` | VARCHAR(255) | Unique identifier (unique) |
| `description` | TEXT | Description |
| `type` | ENUM | Type (digital, field, awareness, mixed) |
| `status` | ENUM | Status (draft, active, paused, completed, cancelled) |
| `plannedBudget` | INT | Planned budget |
| `actualBudget` | INT | Actual budget |
| `currency` | VARCHAR(10) | Currency |
| `startDate` | TIMESTAMP | Start date |
| `endDate` | TIMESTAMP | End date |
| `platforms` | TEXT | Platforms (JSON) |
| `goals` | TEXT | Goals (JSON) |
| `targetLeads` | INT | Target leads |
| `targetBookings` | INT | Target bookings |
| `targetROI` | INT | Target ROI |
| `targetRevenue` | DECIMAL | Target revenue |
| `kpis` | TEXT | KPIs (JSON) |
| `notes` | TEXT | Notes |
| `teamLeaderId` | INT (FK) | Team leader ID |
| `teamMembers` | TEXT | Team members (JSON) |
| `metaPixelId` | VARCHAR(100) | Meta Pixel ID |
| `metaAccessToken` | TEXT | Meta access token |
| `whatsappEnabled` | BOOLEAN | Is WhatsApp enabled |
| `whatsappWelcomeMessage` | TEXT | Welcome message |
| `isActive` | BOOLEAN | Is active |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `leads` - Leads
Stores customer registration data from campaigns.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Lead ID |
| `campaignId` | INT (FK) | Campaign ID |
| `fullName` | VARCHAR(255) | Full name |
| `phone` | VARCHAR(20) | Phone number |
| `email` | VARCHAR(320) | Email |
| `status` | ENUM | Status (new, contacted, booked, not_interested, no_answer, pending, confirmed, completed, cancelled) |
| `source` | VARCHAR(100) | Source |
| `utmSource` | VARCHAR(100) | UTM source |
| `utmMedium` | VARCHAR(100) | UTM medium |
| `utmCampaign` | VARCHAR(100) | UTM campaign |
| `utmTerm` | VARCHAR(100) | UTM term |
| `utmContent` | VARCHAR(100) | UTM content |
| `utmPlacement` | VARCHAR(100) | UTM placement |
| `notes` | TEXT | Notes |
| `emailSent` | BOOLEAN | Email sent |
| `whatsappSent` | BOOLEAN | WhatsApp sent |
| `bookingConfirmationSent` | BOOLEAN | Booking confirmation sent |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `leadStatusHistory` - Lead Status History
Tracks all status changes for leads.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | History ID |
| `leadId` | INT (FK) | Lead ID |
| `userId` | INT (FK) | User ID |
| `oldStatus` | VARCHAR(50) | Old status |
| `newStatus` | VARCHAR(50) | New status |
| `notes` | TEXT | Notes |
| `createdAt` | TIMESTAMP | Change date |

#### `campaignOffers` - Campaign Offers
Many-to-Many link between campaigns and offers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Link ID |
| `campaignId` | INT (FK) | Campaign ID |
| `offerId` | INT (FK) | Offer ID |
| `createdAt` | TIMESTAMP | Link date |

#### `campaignCamps` - Campaign Camps
Many-to-Many link between campaigns and camps.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Link ID |
| `campaignId` | INT (FK) | Campaign ID |
| `campId` | INT (FK) | Camp ID |
| `createdAt` | TIMESTAMP | Link date |

#### `campaignDoctors` - Campaign Doctors
Many-to-Many link between campaigns and doctors.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Link ID |
| `campaignId` | INT (FK) | Campaign ID |
| `doctorId` | INT (FK) | Doctor ID |
| `createdAt` | TIMESTAMP | Link date |

---

### 3. Appointments & Bookings Tables (4 tables)

#### `doctors` - Doctors
Stores doctor information available for booking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Doctor ID |
| `name` | VARCHAR(255) | Full name |
| `slug` | VARCHAR(255) | Unique identifier (unique) |
| `specialty` | VARCHAR(255) | Specialty |
| `image` | VARCHAR(500) | Doctor image |
| `bio` | TEXT | Biography |
| `experience` | VARCHAR(255) | Experience |
| `languages` | VARCHAR(255) | Languages |
| `consultationFee` | VARCHAR(100) | Consultation fee |
| `procedures` | TEXT | Procedures (JSON) |
| `isVisiting` | ENUM | Visiting doctor (yes, no) |
| `available` | ENUM | Available (yes, no) |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `appointments` - Appointments
Stores doctor appointment bookings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Appointment ID |
| `campaignId` | INT (FK) | Campaign ID |
| `doctorId` | INT (FK) | Doctor ID |
| `fullName` | VARCHAR(255) | Patient name |
| `phone` | VARCHAR(20) | Phone number |
| `email` | VARCHAR(320) | Email |
| `age` | INT | Age |
| `gender` | ENUM | Gender (male, female) |
| `procedure` | TEXT | Procedure |
| `preferredDate` | VARCHAR(50) | Preferred date |
| `preferredTime` | VARCHAR(50) | Preferred time |
| `appointmentDate` | TIMESTAMP | Confirmed appointment date |
| `patientMessage` | TEXT | Patient message |
| `notes` | TEXT | Patient notes |
| `additionalNotes` | TEXT | Additional notes |
| `staffNotes` | TEXT | Staff notes |
| `status` | ENUM | Status (pending, contacted, no_answer, confirmed, attended, completed, cancelled) |
| `contactedAt` | TIMESTAMP | Contacted date |
| `confirmedAt` | TIMESTAMP | Confirmed date |
| `attendedAt` | TIMESTAMP | Attended date |
| `completedAt` | TIMESTAMP | Completed date |
| `cancelledAt` | TIMESTAMP | Cancelled date |
| `source` | VARCHAR(100) | Source |
| `utmSource` | VARCHAR(100) | UTM source |
| `utmMedium` | VARCHAR(100) | UTM medium |
| `utmCampaign` | VARCHAR(100) | UTM campaign |
| `utmTerm` | VARCHAR(100) | UTM term |
| `utmContent` | VARCHAR(100) | UTM content |
| `utmPlacement` | VARCHAR(100) | UTM placement |
| `referrer` | VARCHAR(500) | Referrer |
| `fbclid` | VARCHAR(255) | Facebook Click ID |
| `gclid` | VARCHAR(255) | Google Click ID |
| `receiptNumber` | VARCHAR(50) | Receipt number |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

**Indexes:**
- `phoneIdx` - Index on phone
- `emailIdx` - Index on email
- `statusIdx` - Index on status
- `createdAtIdx` - Index on creation date
- `doctorIdIdx` - Index on doctor ID

#### `offerLeads` - Offer Leads
Stores customer requests for special offers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Lead ID |
| `offerId` | INT (FK) | Offer ID |
| `campaignId` | INT (FK) | Campaign ID |
| `fullName` | VARCHAR(255) | Patient name |
| `phone` | VARCHAR(20) | Phone number |
| `email` | VARCHAR(320) | Email |
| `age` | INT | Age |
| `gender` | ENUM | Gender (male, female) |
| `patientMessage` | TEXT | Patient message |
| `notes` | TEXT | Notes |
| `status` | ENUM | Status (pending, contacted, no_answer, confirmed, attended, completed, cancelled) |
| `statusNotes` | TEXT | Status notes |
| `contactedAt` | TIMESTAMP | Contacted date |
| `confirmedAt` | TIMESTAMP | Confirmed date |
| `attendedAt` | TIMESTAMP | Attended date |
| `completedAt` | TIMESTAMP | Completed date |
| `cancelledAt` | TIMESTAMP | Cancelled date |
| `source` | VARCHAR(100) | Source |
| `utmSource` | VARCHAR(100) | UTM source |
| `utmMedium` | VARCHAR(100) | UTM medium |
| `utmCampaign` | VARCHAR(100) | UTM campaign |
| `utmTerm` | VARCHAR(100) | UTM term |
| `utmContent` | VARCHAR(100) | UTM content |
| `utmPlacement` | VARCHAR(100) | UTM placement |
| `referrer` | VARCHAR(500) | Referrer |
| `fbclid` | VARCHAR(255) | Facebook Click ID |
| `gclid` | VARCHAR(255) | Google Click ID |
| `receiptNumber` | VARCHAR(50) | Receipt number |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

**Indexes:**
- `phoneIdx` - Index on phone
- `emailIdx` - Index on email
- `statusIdx` - Index on status
- `createdAtIdx` - Index on creation date
- `offerIdIdx` - Index on offer ID

#### `campRegistrations` - Camp Registrations
Stores patient registrations for medical camps.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Registration ID |
| `campId` | INT (FK) | Camp ID |
| `campaignId` | INT (FK) | Campaign ID |
| `fullName` | VARCHAR(255) | Patient name |
| `phone` | VARCHAR(20) | Phone number |
| `email` | VARCHAR(320) | Email |
| `age` | INT | Age |
| `gender` | ENUM | Gender (male, female) |
| `procedures` | TEXT | Procedures (JSON) |
| `medicalCondition` | TEXT | Medical condition |
| `patientMessage` | TEXT | Patient message |
| `notes` | TEXT | Notes |
| `status` | ENUM | Status (pending, contacted, no_answer, confirmed, attended, completed, cancelled) |
| `statusNotes` | TEXT | Status notes |
| `attendanceDate` | TIMESTAMP | Attendance date |
| `preferredDate` | VARCHAR(20) | Preferred date |
| `preferredTimeSlot` | ENUM | Preferred time slot (morning, evening) |
| `contactedAt` | TIMESTAMP | Contacted date |
| `confirmedAt` | TIMESTAMP | Confirmed date |
| `attendedAt` | TIMESTAMP | Attended date |
| `completedAt` | TIMESTAMP | Completed date |
| `cancelledAt` | TIMESTAMP | Cancelled date |
| `source` | VARCHAR(100) | Source |
| `utmSource` | VARCHAR(100) | UTM source |
| `utmMedium` | VARCHAR(100) | UTM medium |
| `utmCampaign` | VARCHAR(100) | UTM campaign |
| `utmTerm` | VARCHAR(100) | UTM term |
| `utmContent` | VARCHAR(100) | UTM content |
| `utmPlacement` | VARCHAR(100) | UTM placement |
| `referrer` | VARCHAR(500) | Referrer |
| `fbclid` | VARCHAR(255) | Facebook Click ID |
| `gclid` | VARCHAR(255) | Google Click ID |
| `receiptNumber` | VARCHAR(50) | Receipt number |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

**Indexes:**
- `phoneIdx` - Index on phone
- `emailIdx` - Index on email
- `statusIdx` - Index on status
- `createdAtIdx` - Index on creation date
- `campIdIdx` - Index on camp ID

---

### 4. Offers & Camps Tables (2 tables)

#### `offers` - Offers
Stores special medical offers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Offer ID |
| `title` | VARCHAR(255) | Title |
| `slug` | VARCHAR(255) | Unique identifier (unique) |
| `description` | TEXT | Description |
| `imageUrl` | VARCHAR(500) | Image URL |
| `isActive` | BOOLEAN | Is active |
| `startDate` | TIMESTAMP | Start date |
| `endDate` | TIMESTAMP | End date |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `camps` - Camps
Stores medical camp information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Camp ID |
| `name` | VARCHAR(255) | Name |
| `slug` | VARCHAR(255) | Unique identifier (unique) |
| `description` | TEXT | Description |
| `imageUrl` | VARCHAR(500) | Image URL |
| `startDate` | TIMESTAMP | Start date |
| `endDate` | TIMESTAMP | End date |
| `isActive` | BOOLEAN | Is active |
| `freeOffers` | TEXT | Free offers |
| `discountedOffers` | TEXT | Discounted offers |
| `availableProcedures` | TEXT | Available procedures (JSON) |
| `galleryImages` | TEXT | Gallery images (JSON) |
| `morningTime` | VARCHAR(20) | Morning session time |
| `eveningTime` | VARCHAR(20) | Evening session time |
| `dailyCapacity` | INT | Daily capacity |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

---

### 5. Task Management Tables (5 tables)

#### `projects` - Projects
Stores projects linked to campaigns.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Project ID |
| `title` | VARCHAR(255) | Title |
| `slug` | VARCHAR(255) | Unique identifier (unique) |
| `description` | TEXT | Description |
| `startDate` | TIMESTAMP | Start date |
| `endDate` | TIMESTAMP | End date |
| `status` | ENUM | Status (planning, active, completed, on_hold, cancelled) |
| `priority` | ENUM | Priority (low, medium, high, urgent) |
| `createdBy` | INT (FK) | Creator ID |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `tasks` - Tasks
Stores tasks linked to projects and teams.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Task ID |
| `projectId` | INT (FK) | Project ID |
| `teamId` | INT (FK) | Team ID |
| `campaignId` | INT (FK) | Campaign ID |
| `title` | VARCHAR(255) | Title |
| `description` | TEXT | Description |
| `assignedTo` | INT (FK) | Assignee ID |
| `priority` | ENUM | Priority (low, medium, high, urgent) |
| `status` | ENUM | Status (todo, in_progress, review, completed, cancelled) |
| `category` | ENUM | Category (content, design, ads, seo, social_media, analytics, other) |
| `dueDate` | TIMESTAMP | Due date |
| `completedAt` | TIMESTAMP | Completed date |
| `estimatedHours` | INT | Estimated hours |
| `actualHours` | INT | Actual hours |
| `tags` | TEXT | Tags (JSON) |
| `createdBy` | INT (FK) | Creator ID |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `taskComments` - Task Comments
Stores comments on tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Comment ID |
| `taskId` | INT (FK) | Task ID |
| `userId` | INT (FK) | User ID |
| `content` | TEXT | Content |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `taskAttachments` - Task Attachments
Stores attachments and deliverables for tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Attachment ID |
| `taskId` | INT (FK) | Task ID |
| `userId` | INT (FK) | User ID |
| `fileName` | VARCHAR(255) | File name |
| `fileUrl` | TEXT | File URL |
| `fileType` | VARCHAR(100) | File type |
| `fileSize` | INT | File size |
| `attachmentType` | ENUM | Attachment type (deliverable, reference, other) |
| `createdAt` | TIMESTAMP | Creation date |

#### `taskDeliverables` - Task Deliverables
Stores task deliverables and reviews.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Deliverable ID |
| `taskId` | INT (FK) | Task ID |
| `userId` | INT (FK) | User ID |
| `fileUrl` | VARCHAR(500) | File URL |
| `notes` | TEXT | Notes |
| `status` | ENUM | Status (pending, approved, rejected, revision_needed) |
| `reviewNotes` | TEXT | Review notes |
| `submittedAt` | TIMESTAMP | Submission date |
| `reviewedBy` | INT (FK) | Reviewer ID |
| `reviewedAt` | TIMESTAMP | Review date |

---

### 6. WhatsApp Tables (18 tables)

#### `whatsapp_conversations` - Conversations
Stores all WhatsApp conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Conversation ID |
| `phoneNumber` | VARCHAR(20) | Phone number |
| `customerName` | VARCHAR(255) | Customer name |
| `lastMessage` | TEXT | Last message |
| `lastMessageAt` | TIMESTAMP | Last message date |
| `unreadCount` | INT | Unread count |
| `isImportant` | INT | Is important (0/1) |
| `isArchived` | INT | Is archived (0/1) |
| `leadId` | INT (FK) | Lead ID |
| `appointmentId` | INT (FK) | Appointment ID |
| `offerLeadId` | INT (FK) | Offer lead ID |
| `campRegistrationId` | INT (FK) | Camp registration ID |
| `assignedToUserId` | INT (FK) | Assigned user ID |
| `notes` | TEXT | Notes |
| `conversationIdMeta` | VARCHAR(255) | Meta conversation ID |
| `originType` | VARCHAR(50) | Origin type |
| `expirationTimestamp` | TIMESTAMP | Expiration timestamp |
| `pricingModel` | VARCHAR(50) | Pricing model |
| `billable` | BOOLEAN | Is billable |
| `pricingCategory` | VARCHAR(50) | Pricing category |
| `totalCost` | INT | Total cost |
| `messageCount` | INT | Message count |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `whatsapp_messages` - Messages
Stores all messages in conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Message ID |
| `conversationId` | INT (FK) | Conversation ID |
| `direction` | ENUM | Direction (inbound, outbound) |
| `content` | TEXT | Content |
| `messageType` | ENUM | Message type (text, image, document, audio, video, location, template, interactive, contacts, button_reply, list_reply, sticker, reaction, order, referral, product_enquiry, unsupported) |
| `mediaUrl` | VARCHAR(500) | Media URL |
| `status` | ENUM | Status (sent, delivered, read, failed, received) |
| `whatsappMessageId` | VARCHAR(255) | WhatsApp message ID |
| `sentBy` | INT (FK) | Sent by user ID |
| `isAutomated` | INT | Is automated (0/1) |
| `replyToMessageId` | INT (FK) | Reply to message ID |
| `sentAt` | TIMESTAMP | Sent date |
| `deliveredAt` | TIMESTAMP | Delivered date |
| `readAt` | TIMESTAMP | Read date |
| `errorInfo` | TEXT | Error info |
| `metadata` | TEXT | Metadata (JSON) |
| `conversationIdMeta` | VARCHAR(255) | Meta conversation ID |
| `conversationOriginType` | VARCHAR(50) | Conversation origin type |
| `conversationExpirationTimestamp` | TIMESTAMP | Conversation expiration timestamp |
| `pricingModel` | VARCHAR(50) | Pricing model |
| `pricingBillable` | BOOLEAN | Is billable |
| `pricingCategory` | VARCHAR(50) | Pricing category |
| `identityAcknowledged` | BOOLEAN | Identity acknowledged |
| `identityHash` | VARCHAR(255) | Identity hash |
| `reactionEmoji` | VARCHAR(50) | Reaction emoji |
| `reactionMessageId` | VARCHAR(255) | Reaction message ID |
| `orderCatalogId` | VARCHAR(255) | Order catalog ID |
| `orderProductItems` | TEXT | Order product items (JSON) |
| `referralSourceUrl` | TEXT | Referral source URL |
| `referralSourceId` | VARCHAR(255) | Referral source ID |
| `referralSourceType` | VARCHAR(50) | Referral source type |
| `productCatalogId` | VARCHAR(255) | Product catalog ID |
| `productRetailerId` | VARCHAR(255) | Product retailer ID |
| `transactionStatus` | VARCHAR(50) | Transaction status |
| `createdAt` | TIMESTAMP | Creation date |

**Note:** The remaining WhatsApp tables (templates, broadcasts, auto_replies, analytics, notifications, blocked_numbers, account_alerts, security_events, phone_quality, user_opt_ins, webhook_events, contacts, orders, products, referrals, reactions, transactions) follow the same pattern with specialized fields for each function.

---

### 7. Patient Portal Tables (3 tables)

#### `patients` - Patients
Stores patient data registered in the patient portal.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Patient ID |
| `fullName` | VARCHAR(255) | Full name |
| `phone` | VARCHAR(20) | Phone number (unique) |
| `password` | VARCHAR(255) | Password |
| `address` | TEXT | Address |
| `age` | INT | Age |
| `gender` | ENUM | Gender (male, female) |
| `email` | VARCHAR(320) | Email |
| `isActive` | BOOLEAN | Is active |
| `lastLoginAt` | TIMESTAMP | Last login |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

**Indexes:**
- `phoneIdx` - Unique index on phone

#### `patientOtps` - Patient OTPs
Stores one-time passwords for patient login.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | OTP ID |
| `phone` | VARCHAR(20) | Phone number |
| `code` | VARCHAR(6) | OTP code |
| `expiresAt` | TIMESTAMP | Expiration date |
| `isUsed` | BOOLEAN | Is used |
| `createdAt` | TIMESTAMP | Creation date |

**Indexes:**
- `phoneIdx` - Index on phone

#### `patientResults` - Patient Results
Stores lab results, radiology, and medical reports.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Result ID |
| `patientId` | INT (FK) | Patient ID |
| `resultType` | ENUM | Result type (lab, radiology, report) |
| `title` | VARCHAR(255) | Title |
| `description` | TEXT | Description |
| `fileUrl` | VARCHAR(500) | File URL |
| `doctorName` | VARCHAR(255) | Doctor name |
| `resultDate` | TIMESTAMP | Result date |
| `status` | ENUM | Status (pending, ready, delivered) |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

**Indexes:**
- `patientIdx` - Index on patient ID

---

### 8. Tracking & Analytics Tables (4 tables)

#### `visitSessions` - Visit Sessions
Tracks each website visit with source and navigation path.

| Column | Type | Description |
|--------|------|-------------|
| `sessionId` | VARCHAR(64) | Session ID (unique) |
| `source` | VARCHAR(64) | Source |
| `utmSource` | VARCHAR(128) | UTM source |
| `utmMedium` | VARCHAR(128) | UTM medium |
| `utmCampaign` | VARCHAR(256) | UTM campaign |
| `utmContent` | VARCHAR(256) | UTM content |
| `utmTerm` | VARCHAR(256) | UTM term |
| `fbclid` | VARCHAR(256) | Facebook Click ID |
| `gclid` | VARCHAR(256) | Google Click ID |
| `landingPage` | VARCHAR(512) | Landing page |
| `referrer` | VARCHAR(512) | Referrer |
| `userAgent` | TEXT | User agent |
| `converted` | BOOLEAN | Is converted |
| `conversionType` | VARCHAR(64) | Conversion type |
| `conversionId` | INT | Conversion ID |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `trackingEvents` - Tracking Events
Records various tracking events on the website.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Event ID |
| `sessionId` | VARCHAR(64) | Session ID |
| `eventType` | VARCHAR(64) | Event type |
| `page` | VARCHAR(512) | Page |
| `metadata` | TEXT | Metadata (JSON) |
| `source` | VARCHAR(64) | Source |
| `createdAt` | TIMESTAMP | Creation date |

#### `pwaInstalls` - PWA Installs
Tracks PWA app installations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Install ID |
| `appType` | ENUM | App type (public, admin) |
| `userId` | INT (FK) | User ID |
| `userAgent` | TEXT | User agent |
| `platform` | VARCHAR(100) | Platform |
| `ipAddress` | VARCHAR(45) | IP address |
| `installedAt` | TIMESTAMP | Installation date |

#### `abandonedForms` - Abandoned Forms
Tracks incomplete forms (lost opportunities).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Form ID |
| `formType` | ENUM | Form type (appointment, offer, camp, general) |
| `phone` | VARCHAR(32) | Phone number |
| `name` | VARCHAR(256) | Name |
| `relatedId` | INT | Related ID |
| `relatedName` | VARCHAR(256) | Related name |
| `formData` | TEXT | Form data (JSON) |
| `source` | VARCHAR(64) | Source |
| `utmSource` | VARCHAR(128) | UTM source |
| `utmCampaign` | VARCHAR(256) | UTM campaign |
| `sessionId` | VARCHAR(64) | Session ID |
| `contacted` | BOOLEAN | Is contacted |
| `contactedAt` | TIMESTAMP | Contacted date |
| `converted` | BOOLEAN | Is converted |
| `convertedAt` | TIMESTAMP | Converted date |
| `createdAt` | TIMESTAMP | Creation date |

---

### 9. Other Tables (11 tables)

#### `comments` - Comments
Stores comments on various records (appointments, leads, etc.).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Comment ID |
| `entityType` | ENUM | Entity type (appointment, lead, offerLead, campRegistration) |
| `entityId` | INT | Entity ID |
| `content` | TEXT | Content |
| `userId` | INT (FK) | User ID |
| `userName` | VARCHAR(255) | User name |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

**Indexes:**
- `entityIdx` - Composite index on (entityType, entityId)
- `createdAtIdx` - Index on creation date

#### `followUpTasks` - Follow-up Tasks
Stores follow-up tasks for various records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Task ID |
| `entityType` | ENUM | Entity type (appointment, lead, offerLead, campRegistration) |
| `entityId` | INT | Entity ID |
| `title` | VARCHAR(255) | Title |
| `description` | TEXT | Description |
| `status` | ENUM | Status (pending, in_progress, completed, cancelled) |
| `priority` | ENUM | Priority (low, medium, high) |
| `dueDate` | TIMESTAMP | Due date |
| `assignedToId` | INT (FK) | Assignee ID |
| `assignedToName` | VARCHAR(255) | Assignee name |
| `createdById` | INT (FK) | Creator ID |
| `createdByName` | VARCHAR(255) | Creator name |
| `completedAt` | TIMESTAMP | Completed date |
| `completedById` | INT (FK) | Completed by ID |
| `completedByName` | VARCHAR(255) | Completed by name |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

**Indexes:**
- `entityIdx` - Composite index on (entityType, entityId)
- `statusIdx` - Index on status
- `dueDateIdx` - Index on due date
- `assignedToIdx` - Index on assignee ID

#### `auditLogs` - Audit Logs
Tracks all changes to records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Log ID |
| `entityType` | VARCHAR(50) | Entity type |
| `entityId` | INT | Entity ID |
| `action` | VARCHAR(50) | Action type (status_change, bulk_update, delete, create, update) |
| `oldValue` | TEXT | Old value (JSON) |
| `newValue` | TEXT | New value (JSON) |
| `userId` | INT (FK) | User ID |
| `userName` | VARCHAR(255) | User name |
| `notes` | TEXT | Notes |
| `createdAt` | TIMESTAMP | Creation date |

**Indexes:**
- `entityIdx` - Composite index on (entityType, entityId)
- `actionIdx` - Index on action type
- `userIdx` - Index on user ID

#### `savedFilters` - Saved Filters
Stores user's favorite filter configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Filter ID |
| `name` | VARCHAR(100) | Filter name |
| `pageType` | VARCHAR(50) | Page type |
| `filterConfig` | TEXT | Filter config (JSON) |
| `userId` | INT (FK) | User ID |
| `isDefault` | BOOLEAN | Is default |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

**Indexes:**
- `userPageIdx` - Composite index on (userId, pageType)

#### `sharedColumnTemplates` - Shared Column Templates
Stores admin-created column templates visible to all users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Template ID |
| `name` | VARCHAR(100) | Template name |
| `tableKey` | VARCHAR(50) | Table type |
| `columns` | TEXT | Column config (JSON) |
| `createdBy` | INT (FK) | Creator ID |
| `createdByName` | VARCHAR(255) | Creator name |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

**Indexes:**
- `tableKeyIdx` - Index on table type

#### `messageSettings` - Message Settings
Stores automated message configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Setting ID |
| `messageType` | VARCHAR(100) | Message type (unique) |
| `displayName` | VARCHAR(255) | Display name |
| `category` | ENUM | Category (patient_journey, executive_reports, task_management, doctor_notifications) |
| `messageContent` | TEXT | Message content |
| `isEnabled` | INT | Is enabled (0/1) |
| `deliveryChannel` | ENUM | Delivery channel (whatsapp_api, whatsapp_integration, both) |
| `availableVariables` | TEXT | Available variables (JSON) |
| `description` | TEXT | Description |
| `entityType` | ENUM | Entity type (appointment, camp_registration, offer_lead, all) |
| `triggerEvent` | ENUM | Trigger event (on_create, on_confirmed, on_arrived, on_completed, on_cancelled, on_reminder_24h, on_reminder_1h, manual) |
| `whatsappTemplateId` | INT (FK) | WhatsApp template ID |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `messageTemplates` - Message Templates
Stores WhatsApp message templates approved by Meta.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Template ID |
| `templateName` | VARCHAR(255) | Template name (unique) |
| `displayName` | VARCHAR(255) | Display name |
| `category` | ENUM | Category (MARKETING, UTILITY, AUTHENTICATION) |
| `languageCode` | VARCHAR(10) | Language code |
| `status` | ENUM | Status (PENDING, APPROVED, REJECTED, DISABLED) |
| `headerText` | TEXT | Header text |
| `bodyText` | TEXT | Body text |
| `footerText` | TEXT | Footer text |
| `buttons` | TEXT | Buttons (JSON) |
| `variables` | TEXT | Variables (JSON) |
| `metaTemplateId` | VARCHAR(255) | Meta template ID |
| `linkedMessageType` | VARCHAR(100) | Linked message type |
| `usageCount` | INT | Usage count |
| `lastUsedAt` | TIMESTAMP | Last used date |
| `description` | TEXT | Description |
| `createdBy` | INT (FK) | Creator ID |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `scheduled_messages` - Scheduled Messages
Stores messages scheduled for future sending.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Message ID |
| `conversationId` | INT (FK) | Conversation ID |
| `phoneNumber` | VARCHAR(20) | Phone number |
| `content` | TEXT | Content |
| `messageType` | ENUM | Message type (text, template) |
| `templateId` | INT (FK) | Template ID |
| `templateName` | VARCHAR(255) | Template name |
| `languageCode` | VARCHAR(20) | Language code |
| `scheduledAt` | TIMESTAMP | Scheduled date |
| `status` | ENUM | Status (pending, sent, failed, cancelled) |
| `sentAt` | TIMESTAMP | Sent date |
| `errorInfo` | TEXT | Error info |
| `createdBy` | INT (FK) | Creator ID |
| `createdAt` | TIMESTAMP | Creation date |

#### `quick_replies` - Quick Replies
Stores quick reply templates.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Reply ID |
| `name` | VARCHAR(255) | Name |
| `content` | TEXT | Content |
| `category` | VARCHAR(50) | Category |
| `isActive` | INT | Is active (0/1) |
| `usageCount` | INT | Usage count |
| `createdBy` | INT (FK) | Creator ID |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Update date |

#### `saved_searches` - Saved Searches
Stores saved search filters for conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Search ID |
| `userId` | INT (FK) | User ID |
| `name` | VARCHAR(255) | Name |
| `searchQuery` | VARCHAR(500) | Search query |
| `filterType` | VARCHAR(50) | Filter type |
| `dateRange` | VARCHAR(50) | Date range |
| `messageType` | VARCHAR(50) | Message type |
| `createdAt` | TIMESTAMP | Creation date |

#### `settings` - System Settings
Stores general system settings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Setting ID |
| `key` | VARCHAR(100) | Key (unique) |
| `value` | TEXT | Value |
| `description` | TEXT | Description |
| `updatedAt` | TIMESTAMP | Update date |

---

## 🔗 Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Users Table (users)                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ id, openId, username, password, name, email, role, isActive   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│   Access Requests       │ │   User Preferences      │ │       Teams             │
│ (accessRequests)        │ │ (userPreferences)       │ │    (teams)              │
│ openId → users.openId   │ │ userId → users.id       │ │ leaderId → users.id     │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
                                                                 │
                                                                 ▼
                                                    ┌─────────────────────────┐
                                                    │   Team Members          │
                                                    │ (teamMembers)           │
                                                    │ teamId → teams.id       │
                                                    │ userId → users.id       │
                                                    └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        Campaigns Table (campaigns)                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ id, name, slug, type, status, budget, dates, platforms        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│      Leads              │ │    Campaign Offers      │ │    Campaign Camps       │
│    (leads)              │ │ (campaignOffers)        │ │ (campaignCamps)         │
│ campaignId → campaigns.id│ │ campaignId → campaigns.id│ │ campaignId → campaigns.id│
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         Doctors Table (doctors)                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ id, name, slug, specialty, image, bio, experience             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Appointments Table (appointments)                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ id, campaignId, doctorId, fullName, phone, status, dates      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

<div align="center">

**نرعاكم كأهالينا - Caring like family**

Made with ❤️ by Abdullkwy Alhatef

</div>