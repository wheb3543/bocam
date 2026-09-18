# المعمارية المعيارية للخادم الخلفي (Server Modular Architecture)

## بيانات الحوكمة والحالة المرجعية

| الحقل | القيمة المعتمدة |
|---|---|
| **الحالة** | `canonical` |
| **المجال** | `backend-architecture` (هندسة الخادم والمعمارية المعيارية الخلفية) |
| **المصدر الأساسي** | `server/modules/`, `server/subsystems/`, `server/api/`, `server/services/`, `server/tasks/`, `server/routers/routers.ts` |
| **تاريخ الاعتماد** | 2026-09-18 |
| **المصممون** | Antigravity AI & BOCAM Lead Backend Engineering Team |
| **الجمهور** | مهندسو الخادم، مطورو الـ API، مهندسو قواعد البيانات، ومراجعو الأكواد |

---

## 1. فلسفة التصميم المعماري (Architectural Philosophy)

تمت إعادة هيكلة الخادم الخلفي لمنظومة **بُوكَام (BOCAM)** استناداً إلى معمارية معيارية ثلاثية الطبقات متوافقة تماماً مع معمارية الواجهة الأمامية (`client/src/apps/admin/modules/`):

- **التناظر المعماري التام (Frontend-Backend Symmetry)**: تطابق مباشر بين النطاقات الإدارية في الواجهة الأمامية والوحدات النطاقية في الخادم من الرقم 01 حتى 10.
- **عزل الأنظمة الفرعية المستقلة (Autonomous Subsystems Isolation)**: فصل الأنظمة ذات الطبيعة المستقلة كلياً (النسخ الاحتياطي، الترخيص الرقمي، وفاحص التحديثات) في مجلد مستقل `server/subsystems/` بعيداً عن كود المنظومة السريرية.
- **تنقية النواة الصلبة (`server/_core/`)**: حصر النواة في وظائف التشغيل الأساسية المجردة (الخادم Express، محرك tRPC، السجلات، الحراسة، ومحددات المعدل) ونقل كافة الخدمات النطاقية إلى مواقعها الوظيفية.
- **تنظيم نقاط النهاية الخارجية (`server/api/`)**: تجميع المسارات بحسب طبيعتها التشغيلية (المهام المجدولة `cron/`، خطافات الويب `webhooks/`، المصادقة `oauth/`، تكاملات ميتا `meta/`، ورفع الملفات `upload/`).
- **استراتيجية جسور التوافق المرحلية (Zero-Breakage Re-export Bridges)**: الحفاظ الكامل على عمل جميع المسارات والاستيرادات السابقة لضمان عدم حدوث أي انقطاع مع توجيه الراوتر الرئيسي `server/routers/routers.ts` مباشرة إلى الوحدات المعيارية الجديدة.

---

## 2. الهيكل الهرمي للمعمارية الخلفية (Server Directory Hierarchy)

```
server/
├── _core/                         # النواة التأسيسية الصلبة (خادم Express، tRPC، السجلات، الحراسة)
│   ├── index.ts                   # نقطة انطلاق الخادم وتهيئة البيئة
│   ├── trpc.ts                    # الإجراءات والموجهات الأساسية (public, protected, admin)
│   ├── databaseGuard.ts           # حارس صحة وتوفر قاعدة البيانات
│   ├── logger.ts                  # مسجل الأحداث والأخطاء المؤسسي
│   ├── rateLimiter.ts             # محددات معدل الطلبات وحماية الخادم
│   └── vite.ts                    # مكامل بيئة التطوير مع Vite
│
├── subsystems/                    # الأنظمة الفرعية التشغيلية المستقلة
│   ├── backup/                    # نظام النسخ الاحتياطي والاستعادة الذرية وجدولة الحفظ
│   ├── auto-update/               # محرك فحص وتطبيق التحديثات البرمجية
│   └── licensing/                 # إدارة التراخيص، التحقق المشفر، وربط مركز الدعم
│
├── modules/                       # الوحدات النطاقية المعيارية الثماني (مطابقة للواجهة الأمامية)
│   ├── 01-booking-scheduling/     # الحجوزات، المواعيد، العروض، والمخيمات
│   ├── 02-crm-patients/           # سجلات المرضى، الملف الطبي، ونتائج المختبر
│   ├── 03-omni-inbox/             # محادثات واتساب، الصندوق الموحد، وتكاملات التواصل
│   ├── 04-marketing-publishing/   # الحملات الإعلانية، النشر، وتتبع العائد (ROAS)
│   ├── 05-cms-portal/             # بوابة المحتوى الطبي، المقالات، والوسائط
│   ├── 06-tasks-projects/         # مهام الموظفين، تقييم الأداء، وفرق العمل
│   ├── 07-users-rbac/             # إدارة المستخدمين، الأدوار، ومصفوفة الصلاحيات
│   └── 10-system-settings/        # إعدادات النظام، سجلات التدقيق، والتقارير الشاملة
│
├── api/                           # واجهات برمجة التطبيقات ونقاط النهاية المعيارية
│   ├── cron/                      # مسارات المهام الدورية المحمية بـ Task UID
│   ├── webhooks/                  # مستقبلات إشعارات واتساب، فيسبوك، والمختبرات
│   ├── oauth/                     # تدفقات مصادقة منصات التواصل وتكاملات Meta
│   ├── meta/                      # واجهات ربط Meta Graph API و Cloud API
│   └── upload/                    # معالجة وتدقيق تصاريح رفع الوسائط والملفات
│
├── services/                      # الخدمات النطاقية المشتركة والمساعدة
│   ├── notificationHelper.ts      # منشئ ومعالج قوالب الإشعارات
│   ├── notificationPolicy.ts      # محرك سياسات وتفضيلات توزيع الإشعارات
│   ├── notificationDigestService.ts# مولد الملخصات الإشعارية اليومية
│   └── auditLogService.ts         # خدمة تسجيل التدقيق الموحدة
│
├── database/                      # طبقة الاتصال بقاعدة البيانات ومحركات الاستعلام
│   ├── db.ts                      # الاتصال بـ TiDB/MySQL عبر Drizzle ORM
│   └── db/                        # مستودعات البيانات النطاقية (Repositories)
│
├── tasks/                         # طوابير المعالجة الخلفية والمهام المجدولة
│   ├── cron/                      # المهام المجدولة الفورية
│   └── queues/                    # طوابير BullMQ لمعالجة الرسائل والوسائط
│
└── routers/                       # مجمع مسارات tRPC وجسور التوافق الخلفي
    ├── routers.ts                 # الراوتر الرئيسي (يستورد معيارياً من server/modules/*)
    └── [legacy-bridges].ts        # جسور تصدير للحفاظ على التوافق الخلفي
```

---

## 3. طبقة الأنظمة الفرعية المستقلة (`server/subsystems/`)

تم فصل ثلاثة أنظمة فرعية تعمل بصورة مستقلة عن الدورة السريرية للمستشفى:

| النظام الفرعي | المجلد | المكونات الرئيسية | المسؤولية الوظيفية |
|---|---|---|---|
| **النسخ الاحتياطي** | `subsystems/backup/` | `backup.ts`, `backup.operations.ts`, `backupManager.ts`, `backupAuditService.ts` | إنشاء نسخ احتياطية مشفرة، استعادة البيانات ذرية، وفحص سلامة الأرشيف دورياً |
| **التحديثات التلقائية** | `subsystems/auto-update/` | `updateChecker.ts`, `updateService.ts`, `migrations.ts` | فحص إصدارات النظام عبر الخادم المركزي وتطبيق التحديثات وقفل الصيانة |
| **الترخيص الرقمي** | `subsystems/licensing/` | `license.ts`, `centralLicenseRequest.ts`, `centralSupportTicket.ts` | التحقق من صحة ترخيص المنشأة الطبية، بصمة العتاد، وربط مركز الدعم الفني |

---

## 4. الوحدات النطاقية الثماني (`server/modules/`)

تتطابق وحدات الخادم الخلفي النطاقية مع هيكل وحدات الإدارة في الواجهة الأمامية:

| # | الوحدة النطاقية | الموجهات (Routers) | الخدمات المدمجة (Services) |
|---|---|---|---|
| **01** | `01-booking-scheduling` | `appointments.ts`, `doctors.ts`, `offers.ts`, `camps.ts`, `campRegistrations/`, `offerLeads/`, `queue.ts`, `leads.ts`, `bookingSettings.ts` | `appointmentService`, `leadScoringService`, `campCapacityService` |
| **02** | `02-crm-patients` | `customers.ts`, `patientResults.ts`, `patientPortalRouter.ts` | `patientRecordService`, `labIntegrationService`, `radiologyReportService` |
| **03** | `03-omni-inbox` | `whatsapp/`, `socialInbox.ts`, `quickReplies.ts`, `whatsappTemplateTest.ts` | `whatsappClient`, `messageRoutingService`, `audioTranscodingService` |
| **04** | `04-marketing-publishing` | `campaigns.ts`, `projects.ts`, `metaIntegration.ts`, `marketingTracking.ts` | `broadcastExecutionService`, `campaignAnalyticsService`, `adSpendTrackingService` |
| **05** | `05-cms-portal` | `content/` (`pages.ts`, `sections.ts`, `textContent.ts`, `images.ts`, `media.ts`, `seo.ts`, `approvals.ts`, `trash.ts`, `importExport.ts`) | `deferredPublicationService`, `publicationQualityGate`, `contentVersionService` |
| **06** | `06-tasks-projects` | `tasks.ts`, `followUpTasks.ts`, `teamMembers.ts` | `taskReminderService`, `workAssignmentService`, `performanceEvaluationService` |
| **07** | `07-users-rbac` | `users.ts`, `roleManagement.ts`, `permissionProcedures.ts` | `rolePermissionService`, `userSessionService`, `accessControlService` |
| **10** | `10-system-settings` | `notifications.ts`, `auditLogs.ts`, `reports.ts`, `charts.ts`, `tracking.ts`, `pwa.ts`, `systemHealth.ts` | `auditLogService`, `systemHealthService`, `notificationPolicyService` |

---

## 5. طبقة واجهات API الخارجية (`server/api/`)

تم تصنيف نقاط النهاية العامة والوسيطة إلى مجلدات متخصصة:

- **`api/cron/`**: مسارات الجدولة الدورية (مثل `notificationDigestScheduledRoute.ts`, `taskReminderScheduledRoute.ts`, `cmsPublishingScheduledRoute.ts`)، وجميعها محمي بحراسة `assertCronTaskUid` أو التحقق من هوية النظام.
- **`api/webhooks/`**: قنوات استقبال الإشعارات الفورية من Meta و WhatsApp Cloud API ومختبرات التحاليل مع التحقق من التوقيع الرقمي (HMAC-SHA256).
- **`api/oauth/`**: معالجة تفويض منصات التواصل وإعادة توجيه رموز الوصول وتبادلها.
- **`api/meta/`**: مغلفات الاتصال بـ Meta Graph API و Facebook CAPI وتنسيق البيانات المشتركة.
- **`api/upload/`**: استقبال الوسائط والملفات الطبية والتحقق من الأنواع المسموحة وإجراءات الأمان ضد البرمجيات الخبيثة.

---

## 6. مجمع المسارات الرئيسي وجسور التوافق (`server/routers/routers.ts`)

يعتمد موجه الخادم الرئيسي `appRouter` على الاستيراد المعياري المباشر من واجهات البراميل (`index.ts`) للوحدات النطاقية:

```typescript
import { bookingSchedulingRouter } from '../modules/01-booking-scheduling';
import { crmPatientsRouter } from '../modules/02-crm-patients';
import { omniInboxRouter } from '../modules/03-omni-inbox';
import { marketingPublishingRouter } from '../modules/04-marketing-publishing';
import { cmsPortalRouter } from '../modules/05-cms-portal';
import { tasksProjectsRouter } from '../modules/06-tasks-projects';
import { usersRbacRouter } from '../modules/07-users-rbac';
import { systemSettingsRouter } from '../modules/10-system-settings';
```

مع الحفاظ التام على ملفات جسور التوافق الخفيف (`Re-export Bridges`) في مجلد `server/routers/` بحيث تظل أي استيرادات سابقة تعمل بكفاءة تامة ودون أي كسر برمجي.

---

## 7. معايير الجودة والتحقق (Verification & Quality Assurance)

يخضع الخادم الخلفي لبروتوكول فحص صارم يشمل:

1. **فحص الأنواع البرمجية الشامل (TypeScript Zero-Error Check)**:
   ```bash
   pnpm check
   # tsc --noEmit: 0 errors
   ```
2. **فحص وحدات الأنظمة الفرعية والوحدات النطاقية (Vitest)**:
   ```bash
   pnpm vitest run server/subsystems
   # Tests: 18 passed (18) | Suites: 6 passed (6)
   ```
3. **فحص ترابط الواجهة الأمامية مع الخادم الخلفي**:
   ```bash
   pnpm vitest run client/src
   # Tests: 733 passed (733) | Suites: 81 passed (81)
   ```
4. **فحص سجل التوثيق الهندسي**:
   ```bash
   pnpm docs:check
   # Registry verified successfully
   ```
