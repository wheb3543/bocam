# المرجع التشغيلي لطبقة الواجهة المشتركة وPWA وإمكانية الوصول

## بيانات الحوكمة والحالة المرجعية

| الحقل | القيمة المعتمدة |
|---|---|
| **الحالة** | `canonical` |
| **الجمهور** | مطور، مراجع واجهة، فريق أمان، مسؤول وصول، مهندس تشغيل |
| **المجال** | `frontend-platform` (الواجهة المشتركة، PWA، وإمكانية الوصول) |
| **المصدر** | `client/src/components/ui/`, `client/src/components/layout/`, `client/src/contexts/`, `client/src/hooks/`, `client/src/lib/`, `client/public/`, `client/src/index.css`, `client/src/App.tsx`, `client/src/main.tsx` |
| **آخر مراجعة** | 2026-09-13 |
| **المالك** | Frontend Engineering & Design System Team |
| **البديل** | لا يوجد (المرجع الشامل المعتمد لسلوك طبقة الواجهة المشتركة وPWA والوصول) |

---

## 1. المعمارية العامة لطبقة الواجهة (Frontend Architecture)

تعتمد الواجهة الأمامية لنظام **BOCAM CRM** على تقنيات React 19، TypeScript، Tailwind CSS v4، ومكتبة التوجيه الخفيفة `wouter`. ترتبط الواجهة بالخادم عبر طبقة tRPC المنمطة بالكامل مع مكتبة `@tanstack/react-query` لإدارة التخزين المؤقت وحالة الطلبات.

```
                              ┌────────────────────────────────────────┐
                              │            main.tsx (Root)             │
                              │     QueryClient + tRPC Provider        │
                              └──────────────────┬─────────────────────┘
                                                 │
                              ┌──────────────────▼─────────────────────┐
                              │                App.tsx                 │
                              │ ErrorBoundary > Theme > Language > Tip │
                              └──────────────────┬─────────────────────┘
                                                 │
          ┌──────────────────────────────────────┼──────────────────────────────────────┐
          │                                      │                                      │
┌─────────▼─────────┐                  ┌─────────▼─────────┐                  ┌─────────▼─────────┐
│   Public Portal   │                  │  Admin Workspace  │                  │  Patient Portal   │
│  (Marketing/SEO)  │                  │  (DashboardShell) │                  │  (Mobile-first)   │
│   PageLayout.tsx  │                  │ AdminTabs + Worksp│                  │ PatientPortalLay  │
└─────────┬─────────┘                  └─────────┬─────────┘                  └─────────┬─────────┘
          │                                      │                                      │
          └──────────────────────────────────────┼──────────────────────────────────────┘
                                                 │
                              ┌──────────────────▼─────────────────────┐
                              │         Shared System Layers           │
                              │  - UI Components (Radix + Tailwind v4) │
                              │  - Dual PWA Workers (sw.js / sw-admin) │
                              │  - A11y & ARIA Helpers (WCAG 2.1 AA)   │
                              │  - Offline & IndexedDB Fallbacks       │
                              └────────────────────────────────────────┘
```

---

## 2. شجرة الموفرات والتوجيه المركزي (`App.tsx` & `main.tsx`)

### 2.1 تهيئة وقت التشغيل (`client/src/main.tsx`)
- **QueryClient:** مُهيأ بخيارات استجابة فورية تمنع ظهور البيانات القديمة:
  - `refetchOnWindowFocus: false`
  - `retry: 1`
  - `staleTime: 0`
  - `gcTime: 0`
- **tRPC Client:** يستخدم `httpBatchLink` باتجاه `/api/trpc` مع محول البيانات `superjson`، وتمرير ملفات تعريف الارتباط الحية (`document.cookie`) لضمان المصادقة وحماية الجلسة.
- **إدارة دورة حياة الذاكرة المؤقتة:** توفر الدالة تهيئة فحص المعلمة `?reload=true` مع تفريغ آمن للكاش وعاملي الخدمة المسجلين عند طلب إعادة التحميل التام.

### 2.2 شجرة الموفرات والطبقات العامة (`client/src/App.tsx`)
تلتزم شجرة التطبيق بالترتيب الصارم التالي:
1. `ErrorBoundary`: حماية التطبيق من الانهيار عند حدوث أخطاء غير معالجة في مكونات الواجهة وعرض واجهة تعافي بديلة.
2. `ThemeProvider`: توفير سمات التصميم (Light / Dark) مع تفعيل خيار التبديل السلس `switchable`.
3. `LanguageProvider`: إدارة لغة الواجهة والاتجاه (العربية `rtl` / الإنجليزية `ltr`).
4. `TooltipProvider`: إدارة تلميحات الشاشة المشتركة لكافة عناصر الواجهة.
5. **مكونات التراكب والخدمات المشتركة:**
   - `<Toaster />`: نظام التنبيهات المنبثقة المستند إلى Sonner مع دعم موجه الهاش `consumeToastHash`.
   - `<PWAManager />`: إدارة التثبيت الذكي لتطبيقات الويب التقدمية وعرض أدلة التثبيت.
   - `<OfflineIndicator />`: مؤشر اتصال الشبكة العلوي التفاعلي.
   - `<CookieConsentBanner />` & `<PrivacyPolicyConsentBanner />`: إدارة موافقات الخصوصية والامتثال القانوني.
   - `<MetaPixel />`: حقن أحداث التتبع والبيكسل للمسارات العامة.
   - `<OptionalUpdateBanner />`, `<UpdateProgressModal />`, `<MandatoryUpdateModal />`: منظومة التحديثات البرمجية الفورية.
   - `<PrefetchRoutes />`: جلب مسبق ذكي للمسارات الحرجة حسب السياق الحالي (الصفحة الرئيسية، الإدارة، بوابة المريض).

### 2.3 حارس الترخيص والتفعيل (License Gate)
- يستعلم التطبيق عن حالة الترخيص وقت التشغيل عبر `trpc.license.getInfo.useQuery()`.
- التحقق يعتمد على مطابقة التوقيع الرقمي وتاريخ الصلاحية ومعرف العتاد (Hardware ID).
- إذا كان الترخيص غير صالح (`!licenseInfo?.isValid`)، يتم حجب كافة مسارات التطبيق وتحويل العرض تلقائيًا إلى `<ActivationPage />` باستثناء مساري `/activation` و`/admin-login` لإتاحة تسجيل الدخول الإداري المحلي وطلب التفعيل.

---

## 3. معمارية التخطيط ومساحة العمل الإدارية (Admin Workspace Architecture)

### 3.1 الإطار الإداري المستقر (`DashboardShell.tsx`)
يعتمد النظام الإداري على معمارية الإطار المستقر (Persistent Chrome Pattern):
- عند تنقل المستخدم بين روابط لوحة التحكم المختلفة (`/admin/*`)، **لا يُعاد بناء الإطار الخارجي**.
- يظل الشريط الجانبي `DashboardSidebarV2` والشريط العلوي `TopNavbar` مثبتين في مكانهما دون أي وميض أو إعادة تحميل غير ضرورية.

### 3.2 نظام التبويبات المتعددة (`AdminTabs.tsx` & `useAdminTabs.ts`)
- يتيح للموظف والمسؤول فتح عدة شاشات تشغيلية في آن واحد والتنقل بينها بنقرة واحدة دون فقدان سياق الإدخال.
- يُدار عبر الخطاف المخصص `useAdminTabs(location)`:
  - إنشاء تبويب جديد تلقائيًا لكل مسار فرعي يُزار.
  - إغلاق التبويب والعودة السلسة إلى التبويب النشط السابق أو لوحة التحكم الرئيسية.
  - شريط التبويبات قابل للتمرير الأفقي بسلاسة (`overflow-x-auto`) مع دعم الاختصارات.

### 3.3 عزل مسارات العمل وعرض المحتوى (`AdminWorkspace.tsx` & `AdminTabContent.tsx`)
- تستخدم مساحة العمل `AdminWorkspace` تقنية الإخفاء الدلالي (`hidden={!active}` و`aria-hidden={!active}`) للمحافظة على حالة المكونات المفتوحة مسبقًا بدلاً من تفريغها من الذاكرة، مما يسرع التنقل التبادلي بين المهام.
- تعرض `AdminContentSkeleton` مظهر هيكلي احترافي (Skeleton UI) أثناء التحميل الكسول للمسارات المعقدة.

### 3.4 حماية الميزات والصلاحيات في التوجيه (`ProtectedRoute.tsx`)
- يحمي مكون `ProtectedRoute` الصفحات بناءً على تراخيص الميزات عبر الخطاف `useLicense()`:
  - إذا كانت الميزة معطلة في مفتاح الترخيص، يُعاد التوجيه فورًا إلى `/feature-locked/:feature`.
  - يوفر المكون البديل الخفيف `FeatureRoute` لعرض عناصر واجهة بديلة (Fallback UI) دون إجبار المتصفح على الانتقال لمسار جديد.

---

## 4. نظام التصميم والسمات (Design System & Theming)

### 4.1 مواصفات Tailwind CSS v4 وفضاء الألوان OKLCH
تعتمد المنصة مواصفات Tailwind CSS الحديثة مع إعلان المتغيرات عبر `@theme inline` وتهيئة رموز الألوان بفضاء **OKLCH** لضمان أعلى مستويات الدقة والتباين البصري وفق معايير WCAG AA:

| المتغير | القيمة الافتراضية | الاستخدام الدلالي |
|---|---|---|
| `--color-primary` | `oklch(0.623 0.15 220)` | اللون الأساسي لعلامة المستشفى (الأزرق الطبي) |
| `--color-primary-foreground` | `oklch(0.99 0 0)` | نصوص الأزرار والعناصر الأولية (أبيض ناصع عالي التباين) |
| `--color-secondary` | `oklch(0.623 0.15 145)` | اللون الثانوي المعتمد (الأخضر الصحي) |
| `--color-destructive` | `oklch(0.577 0.245 27.325)` | عمليات الحذف والتحذيرات الحرجة والأخطاء |
| `--color-background` | `oklch(1 0 0)` (فاتح) / `gray-950` (داكن) | خلفية التطبيق العامة |
| `--color-card` | `oklch(1 0 0)` (فاتح) / `gray-900` (داكن) | بطاقات البيانات ومساحات العمل |
| `--radius` | `0.65rem` | استدارة الحواف المتسقة لجميع حقول الإدخال والبطاقات |

### 4.2 الوضع الداكن المتكيف (Adaptive Dark Mode)
- يُدار عبر `ThemeContext.tsx` ومزود `ThemeProvider`:
  - إمكانية التبديل بين `light` و`dark`.
  - حفظ التفضيل في التخزين المحلي `localStorage.getItem('theme')`.
  - تطبيق فئة `.dark` على عنصر الجذر `document.documentElement`.
  - تأثير الانتقال التدريجي المخصص عبر فئة `.theme-transition` التي تُزال تلقائيًا بعد اكتمال التحول (350ms) لمنع أي بطء في الأداء.

### 4.3 دعم اتجاه الواجهة واللغة (RTL & Internationalization)
- الواجهة مصممة أساسًا بنمط **RTL-First** للغة العربية:
  - يُدار عبر `LanguageContext.tsx`.
  - ضبط دقيق لسمات الجذر: `document.documentElement.dir = 'rtl'` و`document.documentElement.lang = 'ar'`.
  - الخط الأساسي المعتمد هو خط `Cairo` المناسب للطباعة وقراءة البيانات الطبية العربية.
  - دعم الانقلاب الديناميكي إلى LTR للغة الإنجليزية عند التبديل.

---

## 5. مكتبة المكونات المشتركة وعقد الحالات المعيارية (UI Components & States)

### 5.1 تصنيف مكونات `client/src/components/ui/`
تغلف المنصة مكونات Radix UI البدائية مع تخصيصات شاملة للوصول ودعم العربية:
- **المكونات التفاعلية:** `button.tsx` (مع اكتشاف النص وإضافة `aria-label` تلقائيًا للأزرار الأيقونية)، `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`, `slider.tsx`, `toggle.tsx`, `radio-group.tsx`.
- **مكونات العرض والتراكب:** `dialog.tsx`, `alert-dialog.tsx`, `sheet.tsx`, `popover.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `hover-card.tsx`.
- **مكونات التخطيط والبيانات:** `card.tsx`, `table.tsx`, `tabs.tsx`, `accordion.tsx`, `collapsible.tsx`, `scroll-area.tsx`, `resizable.tsx`, `separator.tsx`, `breadcrumb.tsx`, `pagination.tsx`.
- **مكونات الملاحظات والمؤشرات:** `alert.tsx`, `badge.tsx`, `progress.tsx`, `skeleton.tsx`, `spinner.tsx`, `empty.tsx`, `sonner.tsx`.

### 5.2 مصفوفة حالات الواجهة المعيارية (Interface States Contract)

| الحالة | المكون المسؤول | السلوك القياسي | المعايير والمتطلبات |
|---|---|---|---|
| **التحميل (Loading)** | `AdminContentSkeleton`, `skeleton.tsx`, `spinner.tsx` | عرض هياكل تحميل مطابقة لأبعاد البطاقات والجداول والقوائم المتوقعة | يمنع الشاشات البيضاء؛ يعلن لبرامج قارئات الشاشة عن حالة التحميل عبر `aria-busy="true"`. |
| **الفراغ (Empty)** | `empty.tsx`, `EntityFilters.tsx` | عرض رسم توضيحي مناسب، رسالة تفسيرية بالعربية، وزر إجراء واضح (CTA) | توجيه المستخدم لاتخاذ إجراء إيجابي (إضافة سجل جديد، مسح الفلاتر). |
| **الخطأ (Error)** | `ErrorBoundary.tsx`, Sonner `toast.error` | بطاقة خطأ مخصصة تتيح زر «إعادة المحاولة» وتفاصيل الخطأ للمطورين | عدم تسريب تفاصيل التتبع الداخلي (stack trace) في الإنتاج مع حفظ السجلات. |
| **الصلاحيات والحظر (Locked / Unauthorized)** | `FeatureLockedPage.tsx`, `Unauthorized.tsx` | إشعار سياقي يوضح أن الميزة غير مشمولة في الترخيص أو تتطلب ترقية الصلاحيات | إبقاء التنقل العام متاحًا وإتاحة خيار «طلب ترقية الميزة». |
| **انقطاع الاتصال (Offline)** | `OfflineIndicator.tsx`, `OfflinePage.tsx` | شريط تحذيري أحمر ثابت يتبدل إلى الأخضر عند العودة، وصفحة قراءة للمواعيد المحفوظة | إمكانية استعراض المواعيد المحفوظة محليًا وإعادة المزامنة. |

---

## 6. منظومة تطبيقات الويب التقدمية (PWA & Offline Architecture)

### 6.1 نموذج عاملي الخدمة الثنائي (Dual Service Workers Pattern)
تعتمد المنصة نمط العزل الكامل لحماية بيانات لوحة التحكم من التداخل مع كاش بوابة المريض والزوار:

```
                           ┌────────────────────────────────────────┐
                           │          نظام الـ PWA المنفصل          │
                           └──────────────────┬─────────────────────┘
                                              │
                 ┌────────────────────────────┴────────────────────────────┐
                 ▼                                                         ▼
    ┌─────────────────────────┐                               ┌─────────────────────────┐
    │ عامل خدمة الواجهة العامة│                               │ عامل خدمة لوحة الإدارة  │
    │   client/public/sw.js   │                               │ client/public/sw-admin  │
    ├─────────────────────────┤                               ├─────────────────────────┤
    │ الكاش: sgh-public-v1    │                               │ الكاش: sgh-admin-v2     │
    │ النطاق: / و /patient    │                               │ النطاق: /admin فقط      │
    │ البيان: manifest.json   │                               │ البيان: manifest-admin  │
    │ استثناء: مسارات /admin  │                               │ استثناء: مسارات العامة  │
    └─────────────────────────┘                               └─────────────────────────┘
```

### 6.2 نظام إدارة التثبيت الذكي (`PWAManager.tsx` & `usePWAInstall.ts`)
- كشف نوع التطبيق من المسار الحالي (`admin` للأزرق الإداري، و`public` للأخضر الصحي).
- إظهار بانر تثبيت ذكي بعد 10 ثوانٍ عند توفر حدث المتصفح `beforeinstallprompt`.
- إظهار زر تثبيت عائم دائم لصفحات الإدارة بمجرد دعم المتصفح للـ PWA.
- توفير نافذة إرشادية تفاعلية لمستخدمي هواتف Apple iOS توضح خطوات: مشاركة Safari -> «إضافة إلى الشاشة الرئيسية».
- حفظ تفضيل إغلاق البانر في `localStorage` لمدة 7 أيام تفاديًا للتكرار المزعج.

### 6.3 التخزين المؤقت دون اتصال وقاعدة بيانات IndexedDB
- عند انقطاع الاتصال بالإنترنت، يظهر المكون `OfflineIndicator` في أعلى الشاشة.
- يتيح المسار `/offline` عبر المكون `OfflinePage` الوصول إلى المواعيد الطبية المحفوظة محليًا في قاعدة بيانات **IndexedDB** تحت مخزن `appointments`.
- يقرأ التطبيق توقيت آخر مزامنة ناجحة `lastSyncTime` ويعرض تفاصيل المواعيد حتى عودة الاتصال.

---

## 7. إمكانية الوصول الشاملة (Accessibility & WCAG 2.1 Level AA)

### 7.1 معالم HTML الدلالية وروابط التخطي
- توفر جميع التخطيطات الرئيسية (`DashboardLayout`, `PageLayout`, `PatientPortalLayout`) رابط التخطي السريع الموجه لقارئات الشاشة ومستخدمي لوحة المفاتيح:
  ```html
  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100] ...">
    تخطى إلى المحتوى الرئيسي
  </a>
  ```
- بناء هيكلي دلالي صارم: `<header>`, `<nav>`, `<main id="main-content" role="main">`, `<footer>`.

### 7.2 مكتبة مساعدات ARIA (`client/src/lib/accessibility.ts`)
توفر المكتبة أدوات موحدة تضمن التزام المكونات بمعايير WCAG:
- `getButtonAriaProps()`: توليد سمات الأزرار (`role`, `aria-label`, `aria-describedby`, `aria-pressed`, `aria-expanded`, `aria-disabled`).
- `getLinkAriaProps()`: دعم تمييز الصفحة الحالية عبر `aria-current="page"`.
- `getInputAriaProps()`: ربط الحقول برسائل الأخطاء عبر `aria-invalid` و`aria-errormessage`.
- `getDialogAriaProps()`: إدارة حوارات النوافذ المنبثقة وحصر التركيز داخلها (`trapFocus`).
- `announceToScreenReader()` & `createLiveRegion()`: إعلان التحديثات الحية وتنبيهات الخادم لقارئات الشاشة باستخدام مناطق `aria-live="polite"` و`aria-live="assertive"`.

### 7.3 الاختبارات الآلية لإمكانية الوصول
- **اختبارات المكونات (Vitest):** `client/src/__tests__/accessibility.test.tsx` تفحص معالم التخطيطات وسمات الأزرار وحقول الإدخال.
- **اختبارات المتصفح الحية (Playwright E2E):** `e2e/accessibility.spec.ts` تشغل ماسح `@axe-core/playwright` على الصفحة الرئيسية ولوحة التحكم وتؤكد عدم وجود أي انتهاكات لمعايير WCAG 2.1 AA.

---

## 8. دليل الخطافات والسياقات الأساسية (Hooks & Contexts Catalog)

| الخطاف / السياق | المسار | الوظيفة ودور التشغيل |
|---|---|---|
| `LanguageContext` / `useLanguage` | `client/src/contexts/LanguageContext.tsx` | إدارة لغة التطبيق (`ar`/`en`) وتوجيه الصفحة (`rtl`/`ltr`) وحفظها في التخزين المحلي |
| `ThemeContext` / `useTheme` | `client/src/contexts/ThemeContext.tsx` | إدارة الوضع الليلي/النهاري مع التبديل السلس عبر `.theme-transition` |
| `useAuth` | `client/src/_core/hooks/useAuth.ts` | توفير بيانات المستخدم الحالي، حالة التحميل، دوال تسجيل الدخول والخروج عبر tRPC |
| `useTableFeatures` | `client/src/hooks/table/useTableFeatures.ts` | نظام موحد للجداول: فرز، إخفاء/إظهار الأعمدة، تجميد الأعمدة، إعادة الترتيب والتحجيم |
| `usePWAInstall` | `client/src/hooks/integrations/usePWAInstall.ts` | إدارة دورة حياة تثبيت PWA، كشف نظام iOS، وحفظ حالة التجاهل |
| `useAdminTabs` | `client/src/hooks/layout/useAdminTabs.ts` | فتح وإغلاق وتتبع التبويبات المتعددة في مساحة العمل الإدارية |
| `useSidebarNotifications` | `client/src/hooks/layout/useSidebarNotifications.ts` | جلب وإدارة شارات العدادات والتنبيهات المباشرة في القائمة الجانبية |
| `useLicense` | `client/src/hooks/integrations/useLicense.ts` | التحقق من تفعيل الميزات البرمجية وفق الترخيص الرقمي المعتمد |
| `useFormatDate` | `client/src/hooks/export/useFormatDate.ts` | تنسيق التواريخ وفق التقويم المحلي والمنطقة الزمنية المعتمدة للعيادات |
| `useFilterUtils` | `client/src/hooks/table/useFilterUtils.ts` | فلاتر الجداول المتقدمة والبحث المتعدد وحفظ الفلاتر المفضلة |

---

## 9. مصفوفة المطابقة مع الاختبارات الفعلية

| المجال المختبر | ملف الاختبار الفعلي | ما يتم إثباته في الاختبار |
|---|---|---|
| معالم الوصول وARIA | `client/src/__tests__/accessibility.test.tsx` | وجود `<main>`, روابط التخطي السريع، وسمات `aria-label` للأزرار |
| الوضع الليلي والسمات | `client/src/__tests__/darkMode.test.ts` | استمرار خيار السمة في `localStorage` وتطبيق فئة `.dark` |
| الإطار الإداري والتبويبات | `client/src/__tests__/adminLayoutVerification.test.ts` | ثبات `DashboardShell`، استقلالية مسارات العمل، وعدم استخدام التوجيه القسري للرابط |
| مساحة العمل ومحتوى التبويب | `client/src/components/layout/AdminWorkspace.test.tsx` | الحفاظ على حالة التبويبات المتعددة باستخدام خاصية `hidden` الدلالية |
| فحوصات محرك axe-core | `e2e/accessibility.spec.ts` | اجتياز مسح `@axe-core/playwright` الكامل للصفحة الرئيسية ولوحة التحكم |
| حقول الإدخال وإمكانية الوصول | `client/src/components/ui/input.test.tsx` | دعم `aria-invalid`, `aria-describedby`, والتوافق مع لوحة المفاتيح |
| الهوية البصرية ورأس الصفحة | `client/src/__tests__/uiP0.test.tsx` & `brandingP0Completion.test.tsx` | توحيد رأس `AdminPageHeader` والشعار وألوان العلامة |

---

## 10. القيود المعمارية والحدود المعتمدة

1. **عزل عاملي الخدمة:** لا يجوز دمج `sw.js` و`sw-admin.js` في عامل خدمة واحد؛ إذ إن عزل الصلاحيات وحماية مسارات الإدارة يعتمد على انفصال نطاقي التخزين المؤقت.
2. **استقرار الإطار الإداري:** يمنع استخدام وسوم الروابط التقليدية `<a href="...">` داخل لوحة التحكم؛ إذ يجب استخدام موجه `wouter` أو الخطاف `useAdminTabs` لتفادي إعادة تحميل الإطار الخارجي وفقدان التبويبات المفتوحة.
3. **التصميم عبر الرموز الدلالية:** يمنع تضمين ألوان صريحة (Hardcoded hex/rgb colors) في المكونات الجديدة؛ يجب استخدام الرموز الدلالية المعتمدة في `client/src/index.css` المتوافقة مع السمتين الفاتحة والداكنة.
4. **معايير الوصول الإلزامية:** أي زر أيقوني أو عنصر تفاعلي دون نص مرئي يجب أن يحتوي على سمة `aria-label` صريحة ومفهومة بالعربية لضمان اجتياز فحوصات axe-core.
