# قواعد ESLint - تتبع التفعيل والحلول

هذا المستند يوضح قواعد ESLint المفعلة وغير المفعلة في المشروع، مرتبة حسب الأهمية، مع علامات للقواعد المفعلة وتحديثات عند حل المشكلات.

---

## القواعد المفعلة ✅

| القاعدة | المستوى | الوصف | الحالة | تاريخ التفعيل |
|---------|---------|-------|--------|--------------|
| `react-hooks/rules-of-hooks` | error | يضمن استدعاء React Hooks في نفس الترتيب في كل render، على مستوى أعلى من المكون | ✅ مفعلة | 2026-06-18 |
| `@typescript-eslint/no-non-null-assertion` | warn | يمنع استخدام `!` (non-null assertion) | ✅ مفعلة | 2026-06-18 |
| `preserve-caught-error` | error | يضمن إضافة `cause` عند re-throwing errors | ✅ مفعلة | 2026-06-18 |

---

## القواعد غير المفعلة ❌ (مرتبة حسب الأهمية)

### المستوى: الأهمية العالية (High Priority)

| القاعدة | المستوى الحالي | المستوى المقترح | الوصف | الحالة | المشاكل المتوقعة |
|---------|---------------|----------------|-------|--------|------------------|
| `@typescript-eslint/no-explicit-any` | off | error | يمنع استخدام `any` في TypeScript | ❌ غير مفعلة | فقدان type safety |
| `@typescript-eslint/no-unused-vars` | off | warn | يمنع المتغيرات غير المستخدمة | ❌ غير مفعلة | كود غير نظيف |
| `react-hooks/exhaustive-deps` | off | warn | يضمن إضافة جميع dependencies في useEffect و useMemo | ❌ غير مفعلة | bugs محتملة في React |
| `prefer-const` | off | error | يفضل استخدام const بدلاً من let | ❌ غير مفعلة | كود غير نظيف |

### المستوى: الأهمية المتوسطة (Medium Priority)

| القاعدة | المستوى الحالي | المستوى المقترح | الوصف | الحالة | المشاكل المتوقعة |
|---------|---------------|----------------|-------|--------|------------------|
| `@typescript-eslint/no-throw-literal` | off | error | يمنع رمي literals بدلاً من Error objects | ❌ غير مفعلة | معالجة أخطاء سيئة |
| `no-unused-vars` | off | warn | يمنع المتغيرات غير المستخدمة في JavaScript | ❌ غير مفعلة | كود غير نظيف |
| `no-console` | off | warn | يمنع استخدام console.log في production | ❌ غير مفعلة | تسريبات معلومات |
| `no-debugger` | off | error | يمنع استخدام debugger statement | ❌ غير مفعلة | debugger statements في production |
| `eqeqeq` | off | error | يفرض استخدام === بدلاً من == | ❌ غير مفعلة | bugs محتملة من type coercion |
| `curly` | off | error | يفرض استخدام أقواس معارضة دائماً | ❌ غير مفعلة | bugs محتملة من syntax |
| `no-undef` | off | error | يمنع استخدام متغيرات غير معرفة | ❌ غير مفعلة | runtime errors |

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

- ✅ تفعيل `@typescript-eslint/no-non-null-assertion` (warn)
  - الحل: استبدال `!` بـ optional chaining `?.` و nullish coalescing `??` و فحوصات صريحة
  - الملفات المتأثرة:
    - Client: `tracking.test.ts`, `ChatWindow.tsx`, `TasksSection.tsx`, `CustomerProfilesHooks.test.ts`, `ResizableTable.test.ts`, `DashboardSidebar.tsx`, `ColumnVisibility.tsx`, `useTableFeatures.sort.test.ts`, `usePersistFn.ts`, `useSSE.ts`, `main.tsx`, `PWAStatsPage.tsx`, `UsersManagementPage.tsx`, `WhatsAppTemplatesPage.tsx`
    - Server: `pubsub.ts`, `db.ts`, `camps.ts`, `templateSyncService.ts`, `whatsappAuditLog.ts`
  - الحالة: تم الحل بنجاح (54 تحذير في 18 ملف)

- ✅ تفعيل `preserve-caught-error` (error)
  - الحل: الكود الحالي يتبع القاعدة بالفعل (تم حلها يدوياً سابقاً)
  - الحالة: تم الحل بنجاح (0 errors, 0 warnings)

---

## الخطة المقترحة للتفعيل

### المرحلة 1: الأهمية العالية
1. ✅ `react-hooks/rules-of-hooks` - تم التفعيل
2. ✅ `@typescript-eslint/no-non-null-assertion` - تم التفعيل
3. ✅ `preserve-caught-error` - تم التفعيل
4. `@typescript-eslint/no-explicit-any` - يحتاج مراجعة شاملة للكود
5. `@typescript-eslint/no-unused-vars` - يحتاج تنظيف الكود
6. `react-hooks/exhaustive-deps` - يحتاج مراجعة dependencies
7. `prefer-const` - يمكن تفعيله بسهولة

### المرحلة 2: الأهمية المتوسطة
1. `eqeqeq` - يمكن تفعيله بسهولة
2. `curly` - يمكن تفعيله بسهولة
3. `no-undef` - يمكن تفعيله بسهولة
4. `no-console` - يحتاج إزالة console.logs
5. `no-debugger` - يمكن تفعيله بسهولة
6. `@typescript-eslint/no-throw-literal` - يحتاج مراجعة
7. `no-unused-vars` - يحتاج تنظيف الكود

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
