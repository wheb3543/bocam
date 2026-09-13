# خطة المرحلة 16: الواجهة المشتركة وPWA وإمكانية الوصول

**الحالة:** مكتملة التنفيذ والتحقق  
**التاريخ:** 2026-09-13  
**المرحلة الرئيسية:** 16 من 19  
**النطاق:** `client/src/components/ui/`، `layout/`، `hooks/`، `contexts/`، `lib/`، `PWAManager`، offline pages، CSS/tokens، accessibility tests، ووثائق architecture/UI/accessibility

---

## 1. الغرض من المرحلة

تهدف هذه المرحلة إلى توثيق طبقة الواجهة المشتركة (Frontend Platform)، وتطبيقات الويب التقدمية (PWA)، ونظام التشغيل دون اتصال (Offline-first / Hybrid Offline)، ومعايير إمكانية الوصول (Accessibility - WCAG 2.1 AA)، ودعم اللغة والاتجاه (RTL/LTR) في المشروع بطريقة دقيقة ومطابقة تمامًا للسلوك الفعلي للكود والاختبارات.

تلتزم هذه المرحلة بالقواعد الملزمة الواردة في [docs/DOCUMENTATION_EXECUTION_PLAN.md](../DOCUMENTATION_EXECUTION_PLAN.md):
- الاعتماد الصارم على الكود المصدري والاختبارات الحالية كمصدر وحيد للحقيقة.
- عدم حذف أي وثائق تاريخية، وتحديث بياناتها الوصفية وتحديد البديل المرجعي لها.
- إنشاء المرجع التشغيلي الموحد لطبقة الواجهة والـ PWA والوصول `docs/domains/FRONTEND_PLATFORM_RUNTIME_REFERENCE.md`.
- توثيق حالات الواجهة المعيارية: التحميل (Loading)، الفراغ (Empty)، الخطأ (Error)، الحظر والصلاحيات (Unauthorized / FeatureLocked)، وعدم الاتصال (Offline).

---

## 2. القواعد الملزمة للمرحلة

### 2.1 أصل الحقيقة
- الكود المصدري في `client/src/` واختبارات Vitest وPlaywright E2E هي المرجع الأساسي لسلوك المكونات وتدفق الواجهات.
- لا يُعتمد أي وصف قديم لنظام التصميم أو مكتبة المكونات إلا بما تدعمه ملفات المكونات الفعلية في `client/src/components/ui/` و`client/src/index.css`.

### 2.2 نطاق المراجعة والتحقق
1. **نظام التوجيه والتخطيطات:** `App.tsx`، `DashboardShell.tsx`، `AdminWorkspace.tsx`، `AdminTabs.tsx`، `DashboardSidebarV2.tsx`، `TopNavbar.tsx`، `DashboardLayout.tsx`، `PageLayout.tsx`، `PatientPortalLayout.tsx`.
2. **المكونات المشتركة ونظام التصميم:** مكونات `client/src/components/ui/`، متغيرات Tailwind v4 وOKLCH في `client/src/index.css`، مكونات الجداول `client/src/components/common/`.
3. **السياقات والحالة العامة:** `LanguageContext.tsx` (RTL/LTR)، `ThemeContext.tsx` (Dark/Light)، إعدادات `trpc.Provider` و`QueryClient` في `main.tsx`.
4. **منظومة PWA والتشغيل دون اتصال:** نموذج عاملي الخدمة الثنائي (`sw.js` للعامة والمريض، `sw-admin.js` للإدارة)، ملفات البيان `manifest.json` و`manifest-admin.json`، مكون `PWAManager.tsx`، زر التثبيت `InstallPWAButton.tsx`، مؤشر الاتصال `OfflineIndicator.tsx`، وصفحة عدم الاتصال `OfflinePage.tsx` المعتمدة على IndexedDB.
5. **إمكانية الوصول والشمولية (Accessibility & A11y):** أدوات ARIA في `client/src/lib/accessibility.ts`، معايير WCAG 2.1 AA، روابط التخطي السريع `Skip to main content`، إدارة التركيز والتنقل بلوحة المفاتيح، واختبارات `@axe-core/playwright` و`accessibility.test.tsx`.

---

## 3. النتائج الأولية للفحص والتدقيق

### 3.1 هيكل التوجيه والتخطيطات
- **المدخل العام (`App.tsx`):**
  - شجرة الموفرات تبدأ بـ `ErrorBoundary` -> `ThemeProvider` -> `LanguageProvider` -> `TooltipProvider`.
  - طبقة التراكب العامة تشمل: `Toaster` (Sonner مع دعم `toastHashRouter`)، `PWAManager`، `OfflineIndicator`، `CookieConsentBanner`، `PrivacyPolicyConsentBanner`، `MetaPixel`، ووسائط التحديث الإجباري والاختياري.
  - التحقق من الترخيص عبر `trpc.license.getInfo`: إذا كان الترخيص غير صالح وكان المسار خارج `/activation` أو `/admin-login`، يُعاد التوجيه مباشرة إلى صفحة التفعيل `ActivationPage`.
  - التوجيه يعتمد على `wouter` مع دعم التقطيع الكسول (`lazy` و`Suspense`) لجميع الصفحات العامة وصفحات البوابة وصفحات لوحة التحكم.
- **تخطيط الإدارة الموحد (`DashboardShell.tsx`):**
  - إطار تشغيلي ثابت لا يعيد تحميل الإطار الخارجي عند التنقل بين مسارات الإدارة `/admin/*`.
  - يحتوي على شريط جانبي دائم `DashboardSidebarV2`، ونظام تبويبات متعدد `AdminTabs` يعتمد على الخطاف `useAdminTabs`، ومساحة عمل مركزية `AdminWorkspace` مع هياكل تحميل بديلة `AdminContentSkeleton`.
  - التحقق من جلسة المستخدم عبر `useAuth()` مع عرض واجهة تسجيل دخول سياقية للمسارات الإدارية.

### 3.2 نظام التصميم والسمات (CSS & Theming)
- يعتمد المشروع على **Tailwind CSS v4** (`@import "tailwindcss"; @import "tw-animate-css";`) مع تعريف السمات عبر `@theme inline`.
- فضاء الألوان يعتمد على **OKLCH** عالي التباين المتوافق مع معايير WCAG AA:
  - لون العلامة الرئيسي الأزرق: `oklch(0.623 0.15 220)`.
  - لون العلامة الثانوي الأخضر: `oklch(0.623 0.15 145)`.
  - دعم المستأجر الديناميكي عبر متغيرات CSS مثل `--tenant-primary` و`--tenant-secondary`.
- **الوضع الداكن (Dark Mode):**
  - يُدار عبر `ThemeContext.tsx` مع دعم التبديل السلس عبر فئة `.theme-transition`.
  - يُحفظ الخيار في `localStorage` تحت المفتاح `theme` ويُطبق على عنصر الجذر `document.documentElement.classList.add('dark')`.
- **دعم اللغة والاتجاه (RTL / LTR):**
  - يُدار عبر `LanguageContext.tsx` ويدعم اللغتين العربية (`ar` - اتجاه `rtl`) والإنجليزية (`en` - اتجاه `ltr`).
  - يتم ضبط `dir` و`lang` ديناميكيًا على `document.documentElement` مع حفظ الخيار في `localStorage`.
  - خط الطباعة الأساسي المعتمد هو خط `Cairo` لدعم المحتوى الطبي والإداري العربي.

### 3.3 منظومة PWA وعاملا الخدمة الثنائي (Dual Service Workers)
- المنصة تعتمد نمط **العزل الثنائي لعاملي الخدمة (Dual-Service Workers Pattern)**:
  1. **عامل خدمة البوابة العامة والمرضى (`/client/public/sw.js`):**
     - اسم الكاش: `sgh-public-v1` وكاش وقت التشغيل `sgh-public-runtime-v1`.
     - النطاق: المسار الجذري `/` وبوابة المريض `/patient-portal`، مع استثناء مسارات `/admin` و`/api`.
  2. **عامل خدمة لوحة التحكم الإدارية (`/client/public/sw-admin.js`):**
     - اسم الكاش: `sgh-admin-v2` وكاش وقت التشغيل `sgh-admin-runtime-v2`.
     - النطاق: مسارات `/admin` بشكل حصري ومستقل.
- **إدارة التثبيت الذكي (`PWAManager.tsx` & `usePWAInstall.ts`):**
  - كشف نوع التطبيق من المسار (`admin` أو `public`).
  - إظهار بانر تثبيت ذكي بعد مهلة زمنية، وزر تثبيت عائم دائم لصفحات الإدارة.
  - دليل إرشادي تفاعلي خاص بمستخدمي iOS (Safari -> مشاركة -> إضافة إلى الشاشة الرئيسية).
  - حفظ إغلاق التنبيهات في `localStorage` لمدة 7 أيام لتفادي إزعاج المستخدم.
- **العمل دون اتصال وحفظ البيانات (`OfflineIndicator.tsx` & `OfflinePage.tsx`):**
  - مراقبة أحداث `window.online` و`window.offline` مع مؤشر علوي منزلق سلس.
  - صفحة عدم اتصال متخصصة تقرأ المواعيد المحفوظة محليًا من قاعدة بيانات المتصفح **IndexedDB** وتتيح إعادة المحاولة عند عودة الشبكة.

### 3.4 إمكانية الوصول (Accessibility & WCAG 2.1 AA)
- **مكتبة مساعدات الوصول (`client/src/lib/accessibility.ts`):**
  - دوال توليد خصائص ARIA دقيقة: `getButtonAriaProps`, `getLinkAriaProps`, `getImageAriaProps`, `getInputAriaProps`, `getDialogAriaProps`, `getAlertAriaProps`, `getTableAriaProps`.
  - إدارة التركيز وتنقل الأسهم: `trapFocus`, `handleArrowNavigation`.
  - الإعلانات الصوتية لقارئات الشاشة: `announceToScreenReader`, `createLiveRegion`.
- **معالم HTML الدلالية وروابط التخطي:**
  - كل تخطيط (`DashboardLayout`, `PageLayout`, `PatientPortalLayout`) يوفر رابط تخطي سريع مخفي يظهر عند التركيز: `<a href="#main-content" className="sr-only focus:not-sr-only ...">تخطى إلى المحتوى الرئيسي</a>`.
  - استخدام علامات دلالية واضحة: `<header>`, `<nav>`, `<main id="main-content" role="main">`, `<footer>`.
- **الاختبارات الآلية:**
  - اختبارات Vitest في `client/src/__tests__/accessibility.test.tsx` تتحقق من المعالم وروابط التخطي وسمات ARIA للأزرار وحقول الإدخال.
  - اختبارات Playwright E2E في `e2e/accessibility.spec.ts` تستخدم محرك `@axe-core/playwright` لفحص خلو الصفحة الرئيسية ولوحة التحكم من أي انتهاكات لمعايير WCAG AA.

---

## 4. خطة التنفيذ المعتمدة للمرحلة 16

1. إنشاء المرجع التشغيلي المعتمد لطبقة الواجهة المشتركة وPWA وإمكانية الوصول:
   `docs/domains/FRONTEND_PLATFORM_RUNTIME_REFERENCE.md`
2. تحديث التوثيقات القائمة ببيانات الحوكمة والربط بالمرجع التشغيلي:
   - `docs/architecture/PWA_OFFLINE_ARCHITECTURE.md`
   - `docs/architecture/HOOKS_DOCUMENTATION.md`
   - `docs/ACCESSIBILITY_IMPROVEMENT_REPORT.md`
3. تحديث مصفوفة تغطية التوثيق `docs/DOCUMENTATION_COVERAGE_MATRIX.md` لتسجيل طبقة الواجهة بحالة `canonical`.
4. تحديث فهرس الوثائق المركزي `docs/README.md`.
5. تحديث الخطة التنفيذية `docs/DOCUMENTATION_EXECUTION_PLAN.md` لتسجيل اكتمال المراحل 0–16 وطلب إذن بدء المرحلة 17.
6. إصدار تقرير إغلاق المرحلة 16 `docs/PHASE_16_FRONTEND_PLATFORM_CLOSURE.md`.
7. تسجيل وتحديث سجل الوثائق `docs/DOCUMENTATION_REGISTRY.json` والتحقق عبر `pnpm docs:check`.
