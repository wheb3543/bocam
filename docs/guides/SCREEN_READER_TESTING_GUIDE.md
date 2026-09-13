# دليل الاختبار اليدوي مع Screen Readers

## نظرة عامة
هذا الدليل يشرح كيفية اختبار إمكانية الوصول في التطبيق باستخدام screen readers. الاختبار اليدوي ضروري للتأكد من أن جميع المكونات تعمل بشكل صحيح مع screen readers.

## Screen Readers المدعومة

### Windows
- **NVDA** (مجاني ومفتوح المصدر) - الأكثر استخداماً للاختبار
- **JAWS** (تجاري) - شائع في بيئات العمل

### macOS
- **VoiceOver** (مدمج) - screen reader الافتراضي في macOS

### iOS
- **VoiceOver** (مدمج) - screen reader الافتراضي في iOS

### Android
- **TalkBack** (مدمج) - screen reader الافتراضي في Android

## خطوات الاختبار

### 1. إعداد البيئة

#### Windows (NVDA)
1. قم بتحميل وتثبيت NVDA من https://www.nvaccess.org/
2. شغل التطبيق
3. استخدم `Ctrl + Alt + N` لتشغيل/إيقاف NVDA
4. استخدم `NVDA + Q` للخروج

#### macOS (VoiceOver)
1. VoiceOver مدمج في macOS
2. استخدم `Cmd + F5` لتشغيل/إيقاف VoiceOver
3. استخدم `Cmd + Option + F8` للوصول إلى VoiceOver Utility

#### iOS (VoiceOver)
1. اذهب إلى Settings > Accessibility > VoiceOver
2. قم بتشغيل VoiceOver
3. استخدم ثلاث نقرات سريعة على الشاشة لتشغيل/إيقاف

#### Android (TalkBack)
1. اذهب إلى Settings > Accessibility > TalkBack
2. قم بتشغيل TalkBack
3. استخدم زر Volume Up + Volume Down معاً لتشغيل/إيقاف

### 2. اختبار المكونات الأساسية

#### Navigation
- [ ] يمكن التنقل بين الصفحات باستخدام keyboard
- [ ] يمكن الوصول إلى جميع الروابط
- [ ] يمكن الوصول إلى جميع الأزرار
- [ ] يمكن الوصول إلى جميع النماذج (forms)
- [ ] skip navigation links تعمل بشكل صحيح

#### Forms
- [ ] جميع حقول الإدخال لها labels واضحة
- [ ] error messages مرتبطة بـ fields
- [ ] يمكن التنقل بين حقول الإدخال باستخدام Tab
- [ ] validation messages مقروءة من قبل screen reader

#### Tables
- [ ] table headers لها `scope` attributes
- [ ] يمكن قراءة table structure بشكل صحيح
- [ ] sortable headers يمكن فرزها باستخدام keyboard
- [ ] table caption موجود ومقروء

#### Carousel
- [ ] يمكن التنقل بين الشرائح باستخدام keyboard
- [ ] رقم الشريحة الحالية مقروء
- [ ] يمكن معرفة عدد الشرائح الكلي
- [ ] الشريحة النشطة معلنة

#### Toasts/Notifications
- [ ] الإشعارات مقروءة تلقائياً
- [ ] يمكن إغلاق الإشعارات باستخدام keyboard
- [ ] الإشعارات لا تقطع التصفح

#### Dialogs/Modals
- [ ] focus محاصر داخل dialog
- [ ] يمكن إغلاق dialog باستخدام Escape
- [ ] focus يعود إلى العنصر السابق بعد الإغلاق
- [ ] dialog title مقروء

### 3. اختبار Keyboard Navigation

- [ ] يمكن التنقل في جميع الصفحات باستخدام Tab
- [ ] focus order منطقي وواضح
- [ ] focus indicators واضحة ومرئية
- [ ] يمكن استخدام Enter/Space لتفعيل الأزرار
- [ ] يمكن استخدام Arrow keys للتنقل في lists
- [ ] يمكن استخدام Escape للإغلاق

### 4. اختبار Color Contrast

- [ ] النص على الخلفية واضح وسهل القراءة
- [ ] النص في dark mode واضح
- [ ] النص في light mode واضح
- [ ] الأزرار واضحة وسهلة التمييز
- [ ] الروابط واضحة وسهلة التمييز

### 5. اختبار Responsive Design

- [ ] التطبيق يعمل بشكل صحيح على mobile
- [ ] التطبيق يعمل بشكل صحيح على tablet
- [ ] التطبيق يعمل بشكل صحيح على desktop
- [ ] touch targets كافية (44px minimum)
- [ ] يمكن الوصول إلى جميع الميزات على جميع الأحجام

### 6. اختبار Landmarks

- [ ] يمكن التنقل بين landmarks باستخدام screen reader
- [ ] `<main>` landmark موجود ومقروء
- [ ] `<nav>` landmark موجود ومقروء
- [ ] `<header>` landmark موجود ومقروء
- [ ] `<footer>` landmark موجود ومقروء
- [ ] skip links تعمل بشكل صحيح

## قائمة التحقق النهائية

### Critical (حرجة)
- [ ] يمكن الوصول إلى جميع الميزات الأساسية باستخدام keyboard فقط
- [ ] جميع الأزرار والروابط يمكن الوصول إليها
- [ ] جميع forms يمكن تعبئتها وإرسالها
- [ ] error messages واضحة ومفهومة

### Important (مهمة)
- [ ] screen reader يقرأ المحتوى بشكل صحيح
- [ ] navigation منطقي وسهل الاستخدام
- [ ] focus indicators واضحة
- [ ] color contrast يفي بمعايير WCAG AA

### Nice to Have (مرغوبة)
- [ ] shortcuts للتنقل السريع
- [ ] custom labels واضحة ومفصلة
- [ ] help text متاح عند الحاجة

## أدوات الاختبار الإضافية

### Browser Extensions
- **Axe DevTools** - لفحص إمكانية الوصول في المتصفح
- **WAVE** - لتقييم إمكانية الوصول بصرياً
- **Lighthouse** - لفحص إمكانية الوصول تلقائياً

### Online Tools
- **WebAIM Contrast Checker** - لفحص color contrast
- **ARIA Validator** - للتحقق من صحة ARIA attributes
- **Nu Html Checker** - للتحقق من صحة HTML

## تقرير النتائج

بعد إكمال الاختبار، قم بتسجيل:

1. **Screen Reader المستخدم:** (NVDA/JAWS/VoiceOver/TalkBack)
2. **المتصفح:** (Chrome/Firefox/Safari/Edge)
3. **نظام التشغيل:** (Windows/macOS/iOS/Android)
4. **المشاكل المكتشفة:**
   - [ ] وصف المشكلة
   - [ ] خطوات إعادة الإنتاج
   - [ ] الشدة (Critical/Important/Minor)
5. **الاقتراحات:**
   - [ ] تحسينات مقترحة
   - [ ] أولويات التنفيذ

## الموارد الإضافية

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Accessibility Tutorials](https://webaim.org/techniques/)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [NVDA User Guide](https://www.nvaccess.org/documentation/)
- [VoiceOver User Guide](https://www.apple.com/accessibility/voiceover/)

---

**ملاحظة:** هذا الاختبار اليدوي ضروري للتأكد من أن جميع التحسينات المنفذة تعمل بشكل صحيح مع screen readers الفعلية. الاختبار الآلي لا يمكنه استبدال الاختبار اليدوي تماماً.
