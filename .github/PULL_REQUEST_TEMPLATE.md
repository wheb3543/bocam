---
name: Pull Request Template
about: قالب فحص صارم قبل تسليم المهمة البرمجية
title: '[TYPE] [SCOPE]: Brief Description'
labels: ''
assignees: ''
---

# 📋 Pull Request Checklist - BOCAM Project

> **هذا القالب إلزامي لجميع Pull Requests. أكمل جميع البنود قبل فتح PR.**

---

## ✅ 1. معايير الدستور الهندسي (Engineering Constitution)

### 1.1 الالتزام بـ CODE_STYLE_GUIDELINES.md

- [ ] **لا استخدام `any`:** الكود لا يستخدم `any` نهائياً (استخدام `unknown` بدلاً منه)
- [ ] **تسمية صحيحة:** جميع الأسماء تتبع معايير التسمية (camelCase, PascalCase, kebab-case, UPPER_SNAKE_CASE)
- [ ] **دوال نظيفة:** جميع الدوال أصغر من 50 سطر وتقوم بمهمة واحدة
- [ ] **معالجة أخطاء:** معالجة أخطاء واضحة وصريحة مع custom error classes
- [ ] **أفضل الممارسات:** تجنب magic numbers/strings، استخدام early returns، تجنب deep nesting
- [ ] **ESLint:** لا أخطاء ESLint
- [ ] **Prettier:** الكود منسق بـ Prettier

### 1.2 الالتزام بـ DOCUMENTATION_POLICY.md

- [ ] **JSDoc إلزامي:** كل دالة جديدة/معدلة لها JSDoc كامل
- [ ] **توصيف المعاملات:** جميع المعاملات موثقة بـ `@param`
- [ ] **توصيف الإرجاع:** القيمة المرجعة موثقة بـ `@returns`
- [ ] **توصيف الأخطاء:** الأخطاء المحتملة موثقة بـ `@throws`
- [ ] **أمثلة الاستخدام:** الدوال العامة لها أمثلة بـ `@example`
- [ ] **تغييرات التوثيق:** تم تحديث README.md و/أو مستندات docs/ إذا لزم
- [ ] **Conventional Commits:** commit message يتبع Conventional Commits specification

### 1.3 الالتزام بـ CONTRIBUTING_GUIDELINES.md

- [ ] **فرع صحيح:** العمل في فرع منفصل (feature/*, bugfix/*, hotfix/*)
- [ ] **لا دمج مباشر:** لا دمج مباشر إلى main أو develop
- [ ] **اختبار محلي:** جميع الاختبارات تمر محلياً (`npm test`)
- [ ] **Coverage:** Coverage لا يقل عن 80% للـ unit tests
- [ ] **Regression:** تم إضافة regression tests لـ bug fixes
- [ ] **Size مناسب:** حجم معقول (لا يغير أكثر من 200 سطر إذا لم يكن ضروري)

---

## ✅ 2. معايير الكود (Code Quality)

### 2.1 الوظيفة والمنطق

- [ ] **الوظيفة صحيحة:** الكود يفعل ما يفترض أن يفعل
- [ ] **Edge Cases:** تم التعامل مع جميع edge cases
- [ ] **Validation:** التحقق من صحة البيانات (input validation)
- [ ] **Error Handling:** معالجة أخطاء شاملة وواضحة
- [ ] **Security:** لا ثغرات أمنية واضحة (SQL injection, XSS, etc.)

### 2.2 الأداء

- [ ] **لا leaks:** لا memory leaks أو resource leaks
- [ ] **لا loops غير ضرورية:** تجنب loops غير ضرورية أو nested عميقة
- [ ] **Database Queries:** Queries محسنة ومفهرسة
- [ ] **Async Operations:** استخدام صحيح لـ async/await

### 2.3 الاختبارات

- [ ] **Unit Tests:** Unit tests كافية للكود الجديد/المعدل
- [ ] **Integration Tests:** Integration tests للتكاملات الحرجة
- [ ] **Test Coverage:** Coverage كافي (>= 80% للـ unit tests)
- [ ] **Regression Tests:** Regression tests إذا كان bug fix
- [ ] **Tests Passing:** جميع الاختبارات تمر محلياً

---

## ✅ 3. معايير التوثيق (Documentation)

### 3.1 التوثيق التقني

- [ ] **JSDoc الكامل:** كل دالة جديدة/معدلة لها JSDoc
- [ ] **توصيف واضح:** توصيف واضح ودقيق للدالة/المكون
- [ ] **Parameters:** جميع المعاملات موثقة
- [ ] **Returns:** القيمة المرجعة موثقة
- [ ] **Throws:** الأخطاء موثقة (إذا تنطقي)
- [ ] **Examples:** أمثلة للدوال العامة

### 3.2 التوثيق العام

- [ ] **README.md:** تم تحديث README.md إذا لزم
- [ ] **API Docs:** تم تحديث API documentation إذا لزم
- [ ] **Database Schema:** تم تحديث schema documentation إذا لزم
- [ ] **CHANGELOG:** تم تحديث CHANGELOG.md للتغييرات الكبيرة

### 3.3 التعليقات

- [ ] **تعليقات مفيدة:** التعليقات تشرح "لماذا" وليس "ماذا"
- [ ] **لا تعليقات زائدة:** لا تعليقات لأسطر واضحة
- [ ] **TODOs:** TODOs نادرة ومبررة

---

## ✅ 4. معايير Git (Git Standards)

### 4.1 Commits

- [ ] **Conventional Commits:** Commits تتبع Conventional Commits
- [ ] **Subject Lines:** Subject lines موجزة وواضحة (<= 50 chars)
- [ ] **Body Descriptive:** Body يشرح "ماذا" و "لماذا" (وليس "كيف")
- [ ] **Footer:** Footer لـ issues/breaking changes إذا لزم
- [ ] **Atomic Commits:** Commits ذرية (قابلة للتراجع)

### 4.2 Branch Strategy

- [ ] **Branch Naming:** الفرع يتبع naming convention (feature/*, bugfix/*, hotfix/*)
- [ ] **Branch Source:** الفرع من الفرع الصحيح (develop للـ features/bugfixes, main للـ hotfixes)
- [ ] **Branch Clean:** فرع نظيف بدون commits عشوائية

### 4.3 Pull Request

- [ ] **PR Description:** وصف واضح ومفصل للتغييرات
- [ ] **Related Issues:** ربط مع issues المرتبطة
- [ ] **Screenshots:** Screenshots للتغييرات UI (إذا لزم)
- [ ] **Reviewers:** Request reviewers مناسبين

---

## ✅ 5. معايير Regression (Regression Prevention)

### 5.1 اختبار عدم كسر الميزات الحالية

- [ ] **Feature Testing:** اختبار جميع الميزات المتأثرة
- [ ] **Route Testing:** اختبار جميع routes المتأثرة
- [ ] **Database Testing:** اختبار database operations المتأثرة
- [ ] **API Testing:** اختبار API endpoints المتأثرة

### 5.2 اختبار بيئة التطوير

- [ ] **Local Testing:** تم اختبار محلياً بشكل شامل
- [ ] **Development Mode:** تم اختبار في `NODE_ENV=development`
- [ ] **Mocking Mode:** تم اختبار مع Mocking Mode مفعّل
- [ ] **Error Scenarios:** تم اختبار سيناريوهات الخطأ

### 5.3 اختبار التوافق

- [ ] **Browser Testing:** تم اختبار في المتصفحات المدعومة
- [ ] **Mobile Testing:** تم اختبار على mobile (إذا لزم)
- [ ] **API Compatibility:** API متوافق مع الإصدارات السابقة (إلا breaking change موثق)

---

## ✅ 6. معايير Mock Environment (Mocking Standards)

### 6.1 Mocking Implementation

- [ ] **Mock Mode:** تم استخدام Mock Mode في development (وفق MOCK_ENVIRONMENT_GUIDE.md)
- [ ] **Mock Services:** تم استخدام mock services للـ external APIs (WhatsApp, SMS, Email, Meta Pixel)
- [ ] **Console Logs:** Mock services تُخرج console logs واضحة
- [ ] **Environment Variables:** تم تحديث .env.example لـ MOCK_MODE

### 6.2 Mocking Verification

- [ ] **Mock Works:** Mock Mode يعمل بشكل صحيح
- [ ] **Real Works:** Real APIs تعمل عندما Mock Mode معطّل
- [ ] **No Production Mock:** Mock Mode معطّل تلقائياً في production

---

## 📝 الوصف (Description)

### النظرة العامة (Overview)

وصف موجز لهذا PR وماذا يفعل.

### التغييرات (Changes)

قائمة بالتغييرات الرئيسية:
- التغيير 1
- التغيير 2
- التغيير 3

### Type of Change

- [ ] 🐛 Bug fix (إصلاح خطأ)
- [ ] ✨ New feature (ميزة جديدة)
- [ ] ♻️ Code refactoring (إعادة كتابة)
- [ ] 📚 Documentation update (تحديث توثيق)
- [ ] 🎨 Style update (تحديث تنسيق)
- [ ] ♻️ Performance improvement (تحسين أداء)
- [ ] ✅ Test update (تحديث اختبارات)
- [ ] 💥 Breaking change (تغيير كسر التوافق)

### Related Issues

- Closes #[issue number]
- Relates to #[issue number]

---

## 🧪 الاختبار (Testing)

### Manual Testing

الخطوات التي اتبعتها لاختبار هذا التغيير يدوياً:
1. الخطوة 1
2. الخطوة 2
3. الخطوة 3

### Automated Testing

- [ ] Unit tests مضافة/محدثة
- [ ] Integration tests مضافة/محدثة
- [ ] E2E tests مضافة/محدثة
- [ ] جميع الاختبارات تمر محلياً: `npm test`

### Test Coverage

- [ ] Coverage للـ code الجديد: ___%
- [ ] Coverage الكلي: ___%

### Regression Testing

- [ ] تم اختبار عدم كسر الميزات الحالية
- [ ] تم اختبار سيناريوهات edge cases
- [ ] تم اختبار مع Mocking Mode
- [ ] تم اختبار بدون Mocking Mode

---

## 📸 Screenshots (Screenshots)

### قبل (Before)

*(أضف screenshots للواجهة قبل التغيير)*

### بعد (After)

*(أضف screenshots للواجهة بعد التغيير)*

---

## ⚠️ Breaking Changes

### هل يوجد breaking changes؟

- [ ] نعم
- [ ] لا

إذا كانت الإجابة نعم، وضح:
- ما الذي يتأثر؟
- كيف يجب أن يقوم المستخدمون بالترقية؟
- متى سيتم إزالة الإصدار القديم؟

---

## 💬 ملاحظات إضافية (Additional Notes)

أي معلومات إضافية قد تكون مفيدة للـ reviewers:

---

## ✅ التأكيد النهائي (Final Confirmation)

أؤكد أن:

- [ ] لقد قرأت وأتفهم `CODE_STYLE_GUIDELINES.md`
- [ ] لقد قرأت وأتفهم `DOCUMENTATION_POLICY.md`
- [ ] لقد قرأت وأتفهم `CONTRIBUTING_GUIDELINES.md`
- [ ] لقد قرأت وأتفهم `MOCK_ENVIRONMENT_GUIDE.md`
- [ ] لقد اتبعت جميع المعايير في هذا القالب
- [ ] لقد اختبرت الكود محلياً بشكل شامل
- [ ] لقد راجعت الكود الخاص بي (self-review)
- [ ] لقد مستعد لـ feedback وتعديلات

---

## 🔖 Approval

بعد استكمال جميع البنود، request reviewers لهذا PR.

**Reviewers:**
- @reviewer1
- @reviewer2

**Labels:**
- `needs-review` (بداية)
- `approved` (بعد الموافقة)
- `changes-requested` (بعد طلب تعديلات)
