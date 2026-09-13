# خطة المرحلة 17: الاختبارات والجودة

**الحالة:** مكتملة التنفيذ والتحقق  
**التاريخ:** 2026-09-13  
**المرحلة الرئيسية:** 17 من 19  
**النطاق:** `vitest.config.ts`، `playwright.config.ts`، `vitest.setup.ts`، `client/**/__tests__`، `server/**/__tests__`، `e2e/`، CI (`.github/workflows/ci.yml`)، وتقارير الجودة والتغطية

---

## 1. الغرض من المرحلة

تهدف هذه المرحلة إلى توثيق منظومة الاختبارات وهندسة الجودة (Testing & Quality Architecture) في مشروع **BOCAM CRM** وفقًا للسلوك الفعلي المعتمد في ملفات التكوين والاختبارات الحالية وأدوات التكامل المستمر (CI/CD)، دون تعديل للاختبارات القائمة أو تخفيف متطلبات الجودة.

تلتزم هذه المرحلة بالقواعد الملزمة الواردة في [docs/DOCUMENTATION_EXECUTION_PLAN.md](../DOCUMENTATION_EXECUTION_PLAN.md):
- حصر شامل ودقيق لهرم الاختبارات (وحدة، تكامل، E2E).
- توثيق بيئة العزل، والمحاكاة (Mocking)، والمتغيرات البيئية للاختبارات في `vitest.setup.ts`.
- توثيق مسارات الفحص والتحقق في CI وسلاسل الجودة (`quality:check`, `coverage:check`, `exports:check`, `schema:migrations:check`).
- توثيق الحدود الصريحة للاختبارات وما لا تثبته (Testing Boundaries & Non-proofs).
- إصدار المرجع التشغيلي المعتمد للاختبارات والجودة `docs/domains/TESTING_QUALITY_RUNTIME_REFERENCE.md`.

---

## 2. القواعد الملزمة للمرحلة

### 2.1 أصل الحقيقة
- الكود المصدري لملفات التكوين (`vitest.config.ts`, `playwright.config.ts`, `vitest.setup.ts`, `.github/workflows/ci.yml`) وسكربتات `package.json` هي مصدر الحقيقة الوحيد لإعدادات الاختبارات ومستويات التحقق.
- لا يُعتمد أي ادعاء بنسب التغطية أو جودة الكود إلا بما تدعمه القياسات المؤتمتة الصادرة من `scripts/coverage-baseline.mjs` و`scripts/generate-quality-report.mjs`.

### 2.2 نطاق المراجعة والتدقيق
1. **تكوين إطار الاختبارات Vitest:** إعدادات البيئة (`jsdom`), مسارات التضمين والاستثناء، ملفات الإعداد العامة `vitest.setup.ts`، وتكامل التغطية عبر `v8`.
2. **تكوين إطار Playwright E2E:** المتصفحات المدعومة (Chromium, Firefox, WebKit)، مسارات E2E الستة، والتقارير.
3. **هرم وتوزيع ملفات الاختبارات:** 196 ملف اختبار مقسمة بدقة بين:
   - 97 ملف اختبار خادم (`server/`).
   - 93 ملف اختبار واجهة ومكونات (`client/`).
   - 6 ملفات اختبار مسار شامل (`e2e/`).
4. **خطوط أساس التغطية والجودة:** `docs/COVERAGE_BASELINE.md`, `docs/COVERAGE_BASELINE.json`, `docs/PROJECT_QUALITY_CURRENT.md`, `docs/PROJECT_QUALITY_REPORT.md`.
5. **سير العمل الآلي في GitHub Actions:** تدفق الوظائف في `.github/workflows/ci.yml` (Lint -> Type Check -> Test -> Quality Baseline -> Security Scan -> Build).

---

## 3. النتائج الأولية للفحص والتدقيق

### 3.1 إعدادات وتكوين Vitest (`vitest.config.ts`)
- **بيئة التشغيل:** `environment: "jsdom"` لدعم اختبارات React والمكونات والمتصفح.
- **المسارات المشمولة:** كافة ملفات `server/**/*.test.ts`, `client/src/**/*.test.ts`, `client/src/**/*.test.tsx`.
- **الاستثناءات الصريحة:**
  - `client/src/hooks/__tests__/useExportUtils.test.ts`
  - `client/src/components/animations/__tests__/**`
  - `client/src/components/__tests__/**`
  - `client/src/__tests__/ChatWindow.test.tsx`
  - `client/src/__tests__/accessibility.test.tsx` (تُختبر إمكانية الوصول عمليًا وشاملًا عبر `@axe-core/playwright` في مسار E2E).
- **إعدادات التغطية:** موفر `v8` مع إخراج تقارير `text`, `json`, `html`, `lcov`. حد التغطية الأدنى المعياري مضبوط عند 50% للأسطر والوظائف والشعب والعبارات في المناطق المشمولة.

### 3.2 بيئة العزل والمحاكاة (`vitest.setup.ts`)
- **المتغيرات البيئية الآمنة:**
  - `LICENSE_HARDWARE_ID`: قيمة افتراضية ثابتة للاختبارات (`42004E494300`).
  - `DATABASE_URL`: رابط محلي لقاعدة البيانات لا يؤثر على أي بيئة حية.
  - `OAUTH_SERVER_URL` و`META_APP_ID`: قيم تجريبية معزولة.
- **المحاكاة الشاملة لواجهات المتصفح (Browser APIs Mocks):**
  - محاكاة دقيقة لـ `localStorage` و`sessionStorage` مع دعم `getItem`, `setItem`, `removeItem`, `clear`.
  - محاكاة `window.matchMedia` لدعم اختبارات الوضع الداكن وتجاوب الشاشة.
  - محاكاة `EventSource` لدعم اختبارات البث اللحظي SSE ورسائل WhatsApp وتنبيهات الخادم.
  - تحميل ممتد لـ `@testing-library/jest-dom` للتحقق من عناصر DOM.

### 3.3 إعدادات وتكوين Playwright E2E (`playwright.config.ts`)
- **دليل الاختبارات:** `./e2e`.
- **البيئة والمنافذ:** تشغيل خادم التطوير التلقائي عبر `pnpm dev` على `http://localhost:3000` بمهلة انتظار 120 ثانية.
- **التغطية عبر المتصفحات:** Chromium, Firefox, WebKit.
- **مسارات E2E الستة الأساسية:**
  1. `accessibility.spec.ts`: فحص الامتثال لـ WCAG 2.1 AA عبر `@axe-core/playwright`.
  2. `admin-dashboard.spec.ts`: تنقل لوحة التحكم والإطار الإداري والتبويبات.
  3. `auth.spec.ts`: تسجيل الدخول، حماية الجلسة، والتحقق من الصلاحيات.
  4. `basic.spec.ts`: جاهزية الصفحة الرئيسية والمعالم الأساسية.
  5. `patient-portal.spec.ts`: بوابة المريض، تسجيل الدخول بـ OTP، وعرض المواعيد.
  6. `whatsapp.spec.ts`: تكامل WhatsApp، إدارة القوالب، وصندوق المراسلة.

### 3.4 سلاسل فحص الجودة والتكامل المستمر (`.github/workflows/ci.yml`)
- تسلسل البوابات الإلزامية في CI:
  1. `lint`: `pnpm lint` (ESLint) و`pnpm format:check` (Prettier).
  2. `type-check`: `pnpm check` (`tsc --noEmit`).
  3. `test`: `pnpm test` (تشغيل الاختبارات)، `pnpm test:coverage` (قياس التغطية)، و`pnpm coverage:check` (مقارنة خط الأساس مع `docs/COVERAGE_BASELINE.json`).
  4. `quality-baseline`: `pnpm quality:check`, `pnpm exports:check`, `pnpm schema:migrations:check`.
  5. `security-scan`: فحص ثغرات التبعيات عبر Snyk.
  6. `build`: بناء الحزمة الإنتاجية الموحدة `pnpm build`.

---

## 4. خطة التنفيذ المعتمدة للمرحلة 17

1. إنشاء المرجع التشغيلي المعتمد للاختبارات وهندسة الجودة:
   `docs/domains/TESTING_QUALITY_RUNTIME_REFERENCE.md`
2. تحديث وتأطير الوثائق القائمة ببيانات الحوكمة وفق المعيار 3.3:
   - `docs/TESTING_GUIDE.md`
   - `docs/guides/TESTING_GUIDE.md`
   - `docs/TEST_COVERAGE_FINAL_REPORT.md`
   - `docs/PROJECT_QUALITY_REPORT.md`
   - `docs/COVERAGE_BASELINE.md`
3. تحديث مصفوفة تغطية التوثيق `docs/DOCUMENTATION_COVERAGE_MATRIX.md` لترقية صف الاختبارات والجودة إلى `canonical`.
4. تحديث فهرس الوثائق المركزي `docs/README.md`.
5. تحديث الخطة التنفيذية `docs/DOCUMENTATION_EXECUTION_PLAN.md` لتسجيل اكتمال المراحل 0–17 وطلب إذن بدء المرحلة 18.
6. إصدار تقرير إغلاق المرحلة 17 `docs/PHASE_17_TESTING_QUALITY_CLOSURE.md`.
7. تسجيل وتحديث سجل الوثائق `docs/DOCUMENTATION_REGISTRY.json` والتحقق عبر `pnpm docs:check`.
