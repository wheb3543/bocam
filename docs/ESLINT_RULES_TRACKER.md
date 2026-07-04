# قواعد ESLint - تتبع التفعيل والحلول

هذا المستند يوضح قواعد ESLint المفعلة وغير المفعلة في المشروع، مرتبة حسب الأهمية، مع علامات للقواعد المفعلة وتحديثات عند حل المشكلات.

---

## القواعد المفعلة ✅

| القاعدة | المستوى | الوصف | الحالة | تاريخ التفعيل |
|---------|---------|-------|--------|--------------|
| `react-hooks/rules-of-hooks` | error | يضمن استدعاء React Hooks في نفس الترتيب في كل render، على مستوى أعلى من المكون | ✅ مفعلة | 2026-06-18 |
| `@typescript-eslint/no-non-null-assertion` | error | يمنع استخدام `!` (non-null assertion) | ✅ مفعلة | 2026-06-18 |
| `preserve-caught-error` | error | يضمن إضافة `cause` عند re-throwing errors | ✅ مفعلة | 2026-06-18 |
| `@typescript-eslint/no-explicit-any` | error | يمنع استخدام `any` في TypeScript | ✅ مفعلة | 2026-06-28 |
| `prefer-const` | error | يفضل استخدام const بدلاً من let | ✅ مفعلة | 2026-06-28 |
| `eqeqeq` | error | يفرض استخدام === بدلاً من == | ✅ مفعلة | 2026-06-28 |
| `curly` | error | يفرض استخدام أقواس معارضة دائماً | ✅ مفعلة | 2026-06-28 |
| `no-undef` | error | يمنع استخدام متغيرات غير معرفة | ✅ مفعلة | 2026-06-28 |
| `react-hooks/exhaustive-deps` | error | يضمن إضافة جميع dependencies في useEffect و useMemo | ✅ مفعلة | 2026-06-29 |
| `@typescript-eslint/no-unused-vars` | warn | يمنع المتغيرات غير المستخدمة في TypeScript | ✅ مفعلة | 2026-06-29 |

---

## القواعد غير المفعلة ❌ (مرتبة حسب الأهمية)

### المستوى: الأهمية العالية (High Priority)

| القاعدة | المستوى الحالي | المستوى المقترح | الوصف | الحالة | المشاكل المتوقعة |
|---------|---------------|----------------|-------|--------|------------------|

### المستوى: الأهمية المتوسطة (Medium Priority)

| القاعدة | المستوى الحالي | المستوى المقترح | الوصف | الحالة | المشاكل المتوقعة |
|---------|---------------|----------------|-------|--------|------------------|
| `@typescript-eslint/no-throw-literal` | off | error | يمنع رمي literals بدلاً من Error objects | ❌ غير مفعلة | معالجة أخطاء سيئة |
| `no-unused-vars` | off | warn | يمنع المتغيرات غير المستخدمة في JavaScript | ❌ غير مفعلة | كود غير نظيف |
| `no-console` | off | warn | يمنع استخدام console.log في production | ❌ غير مفعلة | تسريبات معلومات |
| `no-debugger` | off | error | يمنع استخدام debugger statement | ❌ غير مفعلة | debugger statements في production |

### المستوى: الأهمية المنخفضة (Low Priority)

| القاعدة | المستوى الحالي | المستوى المقترح | الوصف | الحالة | المشاكل المتوقعة |
|---------|---------------|----------------|-------|--------|------------------|
| `@typescript-eslint/ban-ts-comment` | off | warn | يمنع استخدام @ts-ignore و @ts-nocheck | ❌ غير مفعلة | تجاوز type checking |
| `@typescript-eslint/no-empty-function` | off | warn | يمنع الدوال الفارغة | ❌ غير مفعلة | كود غير مفيد |
| `@typescript-eslint/no-var-requires` | off | error | يمنع استخدام require بدلاً من import | ❌ غير مفعلة | syntax قديم |
| `react/react-in-jsx-scope` | off | off | يطلب import React في JSX (غير مطلوب في React 17+) | ❌ غير مفعلة | غير ضروري |
| `react/prop-types` | off | off | يطلب تعريف prop-types (غير مطلوب مع TypeScript) | ❌ غير مفعلة | غير ضروري |
| `react/display-name` | off | warn | يطلب تعريف displayName للمكونات | ❌ غير مفعلة | debugging أفضل |
| `no-alert` | off | warn | يمنع استخدام alert() | ❌ غير مفعلة | تجربة مستخدم سيئة |
| `no-prototype-builtins` | off | warn | يمنع استخدام Object.prototype methods مباشرة | ❌ غير مفعلة | bugs محتملة |
| `no-empty` | off | warn | يمنع الكتل الفارغة | ❌ غير مفعلة | كود غير مفيد |
| `no-constant-condition` | off | warn | يمنع الشروط الثابتة | ❌ غير مفعلة | كود غير منطقي |
| `no-fallthrough` | off | warn | يمنع fallthrough في switch بدون break | ❌ غير مفعلة | bugs محتملة |
| `no-case-declarations` | off | warn | يمنع declarations في case بدون block | ❌ غير مفعلة | scope issues |
| `no-redeclare` | off | error | يمنع إعادة تعريف المتغيرات | ❌ غير مفعلة | bugs محتملة |
| `no-sequences` | off | warn | يمنع استخدام comma operator | ❌ غير مفعلة | كود غير مقروء |
| `no-return-await` | off | warn | يمنع return await غير ضروري | ❌ غير مفعلة | أداء أبطأ |
| `no-async-promise-executor` | off | error | يمنع async function في Promise executor | ❌ غير مفعلة | bugs محتملة |
| `no-promise-executor-return` | off | error | يمنع return في Promise executor | ❌ غير مفعلة | bugs محتملة |
| `no-control-regex` | off | warn | يمنع control characters في regex | ❌ غير مفعلة | bugs محتملة |
| `no-useless-assignment` | off | warn | يمنع التعيينات غير المستخدمة | ❌ غير مفعلة | كود غير نظيف |
| `no-useless-catch` | off | warn | يمنع catch blocks غير المستخدمة | ❌ غير مفعلة | كود غير نظيف |
| `no-useless-escape` | off | warn | يمنع escape characters غير ضرورية | ❌ غير مفعلة | كود غير نظيف |
| `no-unused-eslint-disable-comments` | off | warn | يمنع unused eslint-disable comments | ❌ غير مفعلة | كود غير نظيف |
| `no-throw-literal` | off | error | يمنع رمي literals بدلاً من Error objects | ❌ غير مفعلة | معالجة أخطاء سيئة |

---

## سجل التفعيلات

### 2026-06-18
- ✅ تفعيل `react-hooks/rules-of-hooks` (error)
  - الحل: نقل جميع React Hooks إلى مستوى أعلى من المكون قبل أي early returns
  - الملفات المتأثرة: `CampStatsPage.tsx`, `OfferLeadsManagement.tsx`
  - الحالة: تم الحل بنجاح

- ✅ تفعيل `@typescript-eslint/no-non-null-assertion` (error)
  - الحل: استبدال `!` بـ optional chaining `?.` و nullish coalescing `??` و فحوصات صريحة
  - الملفات المتأثرة:
    - Client: `tracking.test.ts`, `ChatWindow.tsx`, `TasksSection.tsx`, `CustomerProfilesHooks.test.ts`, `ResizableTable.test.ts`, `DashboardSidebar.tsx`, `ColumnVisibility.tsx`, `useTableFeatures.sort.test.ts`, `usePersistFn.ts`, `useSSE.ts`, `main.tsx`, `PWAStatsPage.tsx`, `UsersManagementPage.tsx`, `WhatsAppTemplatesPage.tsx`
    - Server: `pubsub.ts`, `db.ts`, `camps.ts`, `templateSyncService.ts`, `whatsappAuditLog.ts`
  - الحالة: تم الحل بنجاح (54 تحذير في 18 ملف)

- ✅ تفعيل `preserve-caught-error` (error)
  - الحل: الكود الحالي يتبع القاعدة بالفعل (تم حلها يدوياً سابقاً)
  - الحالة: تم الحل بنجاح (0 errors, 0 warnings)

### 2026-06-28
- ✅ تفعيل `@typescript-eslint/no-explicit-any` (error)
  - الحل: استبدال `any` بواجهات TypeScript مناسبة و `unknown` و `keyof`
  - الملفات المتأثرة:
    - Client: `MetaPixel.tsx`, `AppointmentsTab.tsx`, `WhatsAppPhoneQualityPage.tsx`, `WhatsAppWebhookInspectorPage.tsx`, `PatientAppointmentDetailsPage.tsx`, `PatientAppointmentsPage.tsx`, `PatientDashboard.tsx`, `PatientResultDetailsPage.tsx`, `PatientResultsPage.tsx`
  - الحالة: تم الحل بنجاح (16 خطأ في 9 ملفات)
  - الواجهات المضافة: `ConnectionStatus`, `SavedSearch`, `SSEMessageEvent`, `AutoReplyRule`, `SearchMessage`, `ConversationCost`, `QualityRecord`, `QualityWebhookEvent`, `WebhookEvent`

- ✅ تفعيل `prefer-const` (error)
  - الحل: استبدال `let` بـ `const` للمتغيرات التي لا يتم إعادة تعيينها
  - الملفات المتأثرة:
    - Client: `AppointmentsTab.tsx`, `CampRegistrationsManagement.tsx`, `OfferLeadsManagement.tsx`, `useSlugGenerator.ts`, `usePhoneFormat.ts`, `advancedExport.ts`, `Home.tsx`, `AppointmentsManagementPage.tsx`, `UsersManagementPage.tsx`, `ChatWindow.test.tsx`
  - الحالة: تم الحل بنجاح (13 خطأ في 10 ملفات)

- ✅ تفعيل `eqeqeq` (error)
  - الحل: استبدال `==` بـ `===` و `!=` بـ `!==`
  - الملفات المتأثرة:
    - Client: `ChatWindow.tsx`, `CustomerProfilesHooks.test.ts`, `useTableFeatures.sort.test.ts`, `useFilterUtils.ts`, `useTableFeatures.ts`
  - الحالة: تم الحل بنجاح (30 خطأ في 5 ملفات)

- ✅ تفعيل `curly` (error)
  - الحل: إضافة أقواس معارضة لجميع عبارات if/else
  - الملفات المتأثرة: جميع الملفات التي تحتوي على عبارات if بدون أقواس
  - الحالة: تم الحل بنجاح (530 خطأ تم إصلاحها تلقائياً)

- ✅ تفعيل `no-undef` (error)
  - الحل: إضافة المتغيرات العالمية المفقودة إلى ESLint config (React, Blob, URL, FormData, إلخ)
  - الملفات المتأثرة: جميع الملفات التي تستخدم متغيرات عالمية
  - الحالة: تم الحل بنجاح (416 خطأ تم حلها بإضافة 62 متغير عالمي)

- ✅ تفعيل `react-hooks/exhaustive-deps` (error)
  - الحل: إضافة dependencies المفقودة، استخدام useMemo للقيم المحسوبة، تعريف الدوال داخل useEffect أو استخدام useCallback
  - الملفات المتأثرة:
    - Client: `ChatWindow.tsx`, `CustomerProfilesTab.tsx`, `DoctorsManagement.tsx`, `AppointmentsTab.tsx`, `CampRegistrationsManagement.tsx`, `CampsManagement.tsx`, `DashboardSidebar.tsx`, `DashboardSidebarV2.tsx`, `NotificationCenter.tsx`, `OfferLeadsManagement.tsx`, `OffersManagement.tsx`, `UpdateProgressModal.tsx`, `OfflinePage.tsx`, `MessageSettingsPage.tsx`, `AppointmentsManagementPage.tsx`, `BookingsManagementPage.tsx`, `LeadsManagementPage.tsx`, `CampStatsPage.tsx`, `UsersManagementPage.tsx`, `DoctorDetailPage.tsx`, `OfferDetailPage.tsx`, `DetailedStatsCards.tsx`, `QuickPatientSearch.tsx`, `RecentActivity.tsx`, `SourceAnalytics.tsx`
  - الحالة: تم الحل بنجاح (38 خطأ تم حلها في 24 ملف)

- ✅ تفعيل `@typescript-eslint/no-unused-vars` (warn)
  - الحل: تفعيل القاعدة مع إعدادات مناسبة لتجنب المتغيرات غير المستخدمة التي تبدأ بـ _ أو المتغيرات في معاملات الدوال
  - الملفات المتأثرة: جميع الملفات التي تحتوي على متغيرات غير مستخدمة
  - الحالة: تم التفعيل بنجاح (442 تحذير، تم تفعيل القاعدة كـ warn للسماح بتنظيف الكود تدريجياً)

### 2026-06-30
- ✅ تحسين BulkActionsManager وإزالة المتغيرات غير المستخدمة
  - الحل: إضافة وظائف متقدمة للمكون، تحديث 4 ملفات، إزالة المتغيرات غير المستخدمة
  - الملفات المتأثرة:
    - `BulkActionsManager.tsx` - إضافة وظائف جديدة
    - `AppointmentsTab.tsx` - تحديث لاستخدام الوظائف الجديدة، إزالة bulkUpdateDialogOpen
    - `CampRegistrationsManagement.tsx` - تحديث لاستخدام الوظائف الجديدة، إزالة bulkUpdateDialogOpen
    - `OfferLeadsManagement.tsx` - تحديث لاستخدام الوظائف الجديدة، إزالة bulkUpdateDialogOpen
    - `AppointmentsManagementPage.tsx` - تحديث لاستخدام الوظائف الجديدة، إزالة bulkUpdateDialogOpen
  - الحالة: تم التحسين بنجاح (تم إزالة 4 متغيرات غير مستخدمة، إضافة 8 وظائف جديدة)

---

## الخطة المقترحة للتفعيل

### المرحلة 1: الأهمية العالية
1. ✅ `react-hooks/rules-of-hooks` - تم التفعيل
2. ✅ `@typescript-eslint/no-non-null-assertion` - تم التفعيل
3. ✅ `preserve-caught-error` - تم التفعيل
4. ✅ `@typescript-eslint/no-explicit-any` - تم التفعيل
5. ✅ `prefer-const` - تم التفعيل
6. `@typescript-eslint/no-unused-vars` - يحتاج تنظيف الكود
7. `react-hooks/exhaustive-deps` - يحتاج مراجعة dependencies

### المرحلة 2: الأهمية المتوسطة
1. ✅ `eqeqeq` - تم التفعيل
2. ✅ `curly` - تم التفعيل
3. ✅ `no-undef` - تم التفعيل
4. ✅ `react-hooks/exhaustive-deps` - تم التفعيل
5. ✅ `@typescript-eslint/no-unused-vars` - تم التفعيل
6. `no-console` - يحتاج إزالة console.logs
7. `no-debugger` - يمكن تفعيله بسهولة
8. `@typescript-eslint/no-throw-literal` - يحتاج مراجعة

### المرحلة 3: الأهمية المنخفضة
1. `no-redeclare` - يمكن تفعيله بسهولة
2. `no-async-promise-executor` - يمكن تفعيله بسهولة
3. `no-promise-executor-return` - يمكن تفعيله بسهولة
4. `no-throw-literal` - يحتاج مراجعة
5. `react/display-name` - يمكن تفعيله بسهولة
6. البقية - يمكن تفعيلها تدريجياً

---

## ملاحظات

- **React 17+**: قواعد `react/react-in-jsx-scope` و `react/prop-types` غير ضرورية مع TypeScript
- **TypeScript**: قاعدة `@typescript-eslint/no-explicit-any` مهمة جداً لضمان type safety
- **Performance**: قاعدة `no-return-await` يمكن تحسين الأداء
- **Security**: قاعدة `no-console` مهمة لمنع تسريبات المعلومات في production
