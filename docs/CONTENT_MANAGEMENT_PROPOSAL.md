# مقترح صفحة إدارة المحتوى العامة
## Content Management System (CMS) Proposal

**التاريخ:** 23 يوليو 2026  
**المسار:** `/admin/content/content`  
**الهدف:** إدارة شاملة لمحتوى المنصة العامة (النصوص، الصور، الألوان، SEO، إلخ)

---

## 1. نظرة عامة

صفحة إدارة المحتوى العامة ستكون لوحة تحكم مركزية لإدارة جميع عناصر واجهة المستخدم والمحتوى الثابت في المنصة، مع استثناء العروض والمخيمات والأطباء (لها صفحات خاصة).

### الميزات الرئيسية
- ✅ إدارة النصوص والعناوين (متعدد اللغات)
- ✅ إدارة الصور والروابط
- ✅ إدارة الأيقونات والألوان
- ✅ إدارة الأحجام والخطوط
- ✅ إدارة SEO للصفحات
- ✅ معاينة فورية للتغييرات
- ✅ نظام التراجع/الإعادة (Undo/Redo)
- ✅ سجل التغييرات (Audit Log)
- ✅ النسخ الاحتياطي والاستعادة

---

## 2. البنية المقترحة للملفات

### 2.1 Client-Side Files

```
client/src/pages/admin/content/
├── ContentManagementPage.tsx              # الصفحة الرئيسية
├── components/
│   ├── ContentTabs.tsx                    # تبويبات الأقسام
│   ├── TextContentEditor.tsx              # محرر النصوص
│   ├── ImageManager.tsx                   # مدير الصور
│   ├── ColorSchemeEditor.tsx              # محرر الألوان
│   ├── SEOEditor.tsx                      # محرر SEO
│   ├── PreviewPanel.tsx                   # لوحة المعاينة
│   ├── ContentCard.tsx                    # بطاقة المحتوى
│   ├── ContentFilters.tsx                 # فلاتر البحث
│   └── dialogs/
│       ├── TextContentDialog.tsx          # حوار النصوص
│       ├── ImageUploadDialog.tsx          # حوار رفع الصور
│       ├── ColorSchemeDialog.tsx          # حوار الألوان
│       └── SEODialog.tsx                  # حوار SEO
├── hooks/
│   ├── useContentManagement.ts            # Hook رئيسي
│   ├── useTextContent.ts                  # Hook للنصوص
│   ├── useImages.ts                       # Hook للصور
│   ├── useColorScheme.ts                  # Hook للألوان
│   ├── useSEO.ts                          # Hook للـ SEO
│   └── usePreview.ts                      # Hook للمعاينة
└── types/
    └── content.types.ts                   # تعريفات الأنواع
```

### 2.2 Server-Side Files

```
server/routers/
├── content.ts                             # Router الرئيسي
└── content/
    ├── textContent.ts                     # Router للنصوص
    ├── images.ts                          # Router للصور
    ├── colorScheme.ts                     # Router للألوان
    └── seo.ts                             # Router للـ SEO

server/services/
└── content/
    ├── textContentService.ts              # خدمة النصوص
    ├── imageService.ts                    # خدمة الصور
    ├── colorSchemeService.ts              # خدمة الألوان
    ├── seoService.ts                      # خدمة SEO
    └── previewService.ts                  # خدمة المعاينة
```

### 2.3 Database Schema

```sql
-- جدول النصوص والعناوين
CREATE TABLE textContent (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,        -- مفتاح فريد (مثال: hero.title)
  language VARCHAR(10) DEFAULT 'ar',       -- اللغة (ar, en)
  content TEXT NOT NULL,                   -- المحتوى
  section VARCHAR(100),                     -- القسم (hero, footer, etc)
  type ENUM('text', 'title', 'subtitle', 'description', 'button', 'link'),
  isActive ENUM('yes', 'no') DEFAULT 'yes',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الصور
CREATE TABLE images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,        -- مفتاح فريد
  url VARCHAR(500) NOT NULL,               -- رابط الصورة
  alt TEXT,                                -- نص بديل للوصولية
  section VARCHAR(100),                   -- القسم
  width INT,                               -- العرض
  height INT,                              -- الارتفاع
  format VARCHAR(10),                      -- الصيغة (jpg, png, webp)
  size INT,                                -- الحجم بالبايت
  isActive ENUM('yes', 'no') DEFAULT 'yes',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الألوان
CREATE TABLE colorScheme (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,        -- مفتاح فريد (primary, secondary, etc)
  value VARCHAR(50) NOT NULL,              -- قيمة اللون (hex, hsl, rgb)
  type ENUM('primary', 'secondary', 'accent', 'background', 'text', 'border'),
  shade VARCHAR(20),                        -- الدرجة (50, 100, 500, 900)
  isActive ENUM('yes', 'no') DEFAULT 'yes',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول SEO
CREATE TABLE seoSettings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pageKey VARCHAR(255) NOT NULL UNIQUE,    -- مفتاح الصفحة
  language VARCHAR(10) DEFAULT 'ar',
  title VARCHAR(255),                      -- عنوان الصفحة
  description TEXT,                        -- وصف الصفحة
  keywords TEXT,                           -- كلمات مفتاحية (JSON array)
  ogTitle VARCHAR(255),                    -- عنوان Open Graph
  ogDescription TEXT,                      -- وصف Open Graph
  ogImage VARCHAR(500),                    -- صورة Open Graph
  canonicalUrl VARCHAR(500),               -- الرابط الأساسي
  robots TEXT,                             -- تعليمات الروبوتات
  structuredData TEXT,                     -- البيانات المهيكلة (JSON)
  isActive ENUM('yes', 'no') DEFAULT 'yes',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول سجل التغييرات
CREATE TABLE contentAuditLog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entityType ENUM('text', 'image', 'color', 'seo'),
  entityId INT,
  action ENUM('create', 'update', 'delete'),
  oldValue TEXT,                           -- القيمة القديمة (JSON)
  newValue TEXT,                           -- القيمة الجديدة (JSON)
  userId INT,
  ipAddress VARCHAR(50),
  userAgent TEXT,
  reason TEXT,                             -- سبب التغيير
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. الميزات التفصيلية

### 3.1 إدارة النصوص والعناوين
- **الوظائف:**
  - إضافة/تعديل/حذف النصوص
  - دعم متعدد اللغات (العربية، الإنجليزية)
  - تصنيف النصوص حسب القسم (Hero, Footer, Header, etc)
  - تصنيف حسب النوع (Title, Subtitle, Description, Button, Link)
  - بحث وفلترة سريع
  - معاينة فورية للنصوص

- **أنواع النصوص:**
  - عناوين الصفحات (Page Titles)
  - عناوين الأقسام (Section Titles)
  - نصوص الأزرار (Button Text)
  - روابط التنقل (Navigation Links)
  - نصوص الوصف (Descriptions)
  - رسائل الخطأ (Error Messages)
  - نصوص الإشعارات (Notification Messages)

### 3.2 إدارة الصور والروابط
- **الوظائف:**
  - رفع الصور (Drag & Drop)
  - ضغط وتحسين الصور تلقائياً
  - إنشاء نسخ متعددة الأحجام
  - إدارة النص البديل (Alt Text) للوصولية
  - تصنيف الصور حسب القسم
  - معاينة الصور قبل الحفظ
  - حذف الصور غير المستخدمة

- **أنواع الصور:**
  - شعارات (Logos)
  - صور البانر (Banners)
  - صور الخلفية (Backgrounds)
  - أيقونات (Icons)
  - صور المنتجات/الخدمات
  - صور الفريق
  - صور Open Graph

### 3.3 إدارة الألوان والخطوط
- **الوظائف:**
  - محرر ألوان تفاعلي
  - إنشاء أنظمة ألوان متسقة
  - دعم Dark Mode
  - معاينة الألوان على المكونات
  - تصدير/استيراد أنظمة الألوان
  - التحقق من تباين الألوان (WCAG)

- **أنواع الألوان:**
  - الألوان الأساسية (Primary)
  - الألوان الثانوية (Secondary)
  - ألوان التمييز (Accent)
  - ألوان الخلفية (Background)
  - ألوان النصوص (Text)
  - ألوان الحدود (Border)

### 3.4 إدارة SEO
- **الوظائف:**
  - تعديل عناوين الصفحات
  - تعديل أوصاف الصفحات
  - إدارة الكلمات المفتاحية
  - إعداد Open Graph
  - إعداد Twitter Cards
  - إضافة البيانات المهيكلة (Schema.org)
  - إدارة الروابط الأساسية (Canonical URLs)
  - تعليمات الروبوتات (Robots.txt)
  - معاينة نتائج البحث

### 3.5 المعاينة الفورية
- **الوظائف:**
  - معاينة التغييرات في الوقت الفعلي
  - تبديل بين الأجهزة (Desktop, Tablet, Mobile)
  - تبديل بين الأوضاع (Light/Dark)
  - مقارنة قبل/بعد
  - مشاركة رابط المعاينة

### 3.6 نظام التراجع/الإعادة
- **الوظائف:**
  - حفظ نسخ تلقائية
  - التراجع عن التغييرات
  - استعادة النسخ السابقة
  - مقارنة النسخ
  - تصدير النسخ

### 3.7 سجل التغييرات
- **الوظائف:**
  - تسجيل جميع التغييرات
  - عرض من قام التغيير
  - عرض وقت التغيير
  - عرض سبب التغيير
  - تصدير السجل

---

## 4. معايير الجودة والالتزام

### 4.1 معايير الكود
- ✅ **TypeScript:** استخدام صارم مع `strict: true`
- ✅ **ESLint:** الالتزام بقواعد المشروع
- ✅ **Prettier:** تنسيق الكود تلقائياً
- ✅ **JSDoc:** توثيق جميع الدوال والمكونات
- ✅ **Naming Conventions:** camelCase للدوال، PascalCase للمكونات

### 4.2 معايير الوصولية (WAI-ARIA)
- ✅ **WCAG 2.1 AA:** الالتزام بمستوى AA
- ✅ **Semantic HTML:** استخدام عناصر HTML الدلالية
- ✅ **Keyboard Navigation:** دعم التنقل بلوحة المفاتيح
- ✅ **Screen Readers:** دعم قارئات الشاشة
- ✅ **Color Contrast:** تباين الألوان 4.5:1 للنصوص
- ✅ **Alt Text:** نص بديل لجميع الصور
- ✅ **Focus Indicators:** مؤشرات واضحة للتركيز

### 4.3 معايير الأداء
- ✅ **Code Splitting:** تقسيم الكود حسب الحاجة
- ✅ **Lazy Loading:** تحميل بطيء للمكونات الثقيلة
- ✅ **Image Optimization:** ضغط الصور وتحسينها
- ✅ **Caching:** استخدام التخزين المؤقت الذكي
- ✅ **Bundle Size:** الحفاظ على حجم الحزمة صغيراً

### 4.4 معايير الأمان
- ✅ **Input Validation:** التحقق من جميع المدخلات
- ✅ **XSS Prevention:** منع هجمات XSS
- ✅ **CSRF Protection:** حماية من CSRF
- ✅ **Rate Limiting:** تحديد معدل الطلبات
- ✅ **Authentication:** التحقق من الهوية
- ✅ **Authorization:** التحقق من الصلاحيات

### 4.5 معايير التصميم
- ✅ **Responsive Design:** تصميم متجاوب
- ✅ **Mobile First:** البدء بالجوال أولاً
- ✅ **Dark Mode:** دعم الوضع المظلم
- ✅ **RTL Support:** دعم الاتجاه من اليمين لليسار
- ✅ **Consistent Spacing:** مسافات متسقة
- ✅ **Typography:** خطوط واضحة ومقروءة

---

## 5. خطة التنفيذ المرحلية

### المرحلة 1: البنية الأساسية (Priority: High)
**المدة:** 2-3 أيام

**المهام:**
1. إنشاء جداول قاعدة البيانات
   - [ ] إنشاء جدول `textContent`
   - [ ] إنشاء جدول `images`
   - [ ] إنشاء جدول `colorScheme`
   - [ ] إنشاء جدول `seoSettings`
   - [ ] إنشاء جدول `contentAuditLog`
   - [ ] إضافة الفهارس (Indexes)

2. إنشاء ملفات الأنواع (Types)
   - [ ] إنشاء `content.types.ts`
   - [ ] تعريف `TextContent`
   - [ ] تعريف `Image`
   - [ ] تعريف `ColorScheme`
   - [ ] تعريف `SEOSettings`
   - [ ] تعريف `AuditLog`

3. إنشاء Routers الأساسية
   - [ ] إنشاء `server/routers/content.ts`
   - [ ] إنشاء `server/routers/content/textContent.ts`
   - [ ] إنشاء `server/routers/content/images.ts`
   - [ ] إنشاء `server/routers/content/colorScheme.ts`
   - [ ] إنشاء `server/routers/content/seo.ts`

4. إنشاء الخدمات (Services)
   - [ ] إنشاء `server/services/content/textContentService.ts`
   - [ ] إنشاء `server/services/content/imageService.ts`
   - [ ] إنشاء `server/services/content/colorSchemeService.ts`
   - [ ] إنشاء `server/services/content/seoService.ts`

### المرحلة 2: واجهة المستخدم الأساسية (Priority: High)
**المدة:** 3-4 أيام

**المهام:**
1. إنشاء الصفحة الرئيسية
   - [ ] إنشاء `ContentManagementPage.tsx`
   - [ ] إضافة `DashboardLayout`
   - [ ] إضافة التبويبات (Tabs)

2. إنشاء المكونات الأساسية
   - [ ] إنشاء `ContentTabs.tsx`
   - [ ] إنشاء `ContentCard.tsx`
   - [ ] إنشاء `ContentFilters.tsx`

3. إنشاء Hooks
   - [ ] إنشاء `useContentManagement.ts`
   - [ ] إنشاء `useTextContent.ts`
   - [ ] إنشاء `useImages.ts`
   - [ ] إنشاء `useColorScheme.ts`
   - [ ] إنشاء `useSEO.ts`

4. إنشاء الحوارات (Dialogs)
   - [ ] إنشاء `TextContentDialog.tsx`
   - [ ] إنشاء `ImageUploadDialog.tsx`
   - [ ] إنشاء `ColorSchemeDialog.tsx`
   - [ ] إنشاء `SEODialog.tsx`

### المرحلة 3: محرر النصوص (Priority: High)
**المدة:** 2-3 أيام

**المهام:**
1. إنشاء محرر النصوص
   - [ ] إنشاء `TextContentEditor.tsx`
   - [ ] إضافة دعم Rich Text
   - [ ] إضافة دعم متعدد اللغات
   - [ ] إضافة معاينة فورية

2. إنشاء CRUD Operations
   - [ ] إنشاء (Create)
   - [ ] قراءة (Read)
   - [ ] تحديث (Update)
   - [ ] حذف (Delete)

3. إضافة البحث والفلترة
   - [ ] بحث بالنص
   - [ ] فلترة بالقسم
   - [ ] فلترة بالنوع
   - [ ] فلترة باللغة

### المرحلة 4: مدير الصور (Priority: Medium)
**المدة:** 2-3 أيام

**المهام:**
1. إنشاء مدير الصور
   - [ ] إنشاء `ImageManager.tsx`
   - [ ] إضافة رفع الصور (Upload)
   - [ ] إضافة ضغط الصور
   - [ ] إضافة معاينة الصور

2. إدارة الصور
   - [ ] إضافة/تعديل/حذف الصور
   - [ ] إدارة النص البديل
   - [ ] تصنيف الصور
   - [ ] معاينة الصور

3. تحسين الصور
   - [ ] ضغط تلقائي
   - [ ] إنشاء نسخ متعددة
   - [ ] تحويل الصيغ
   - [ ] تحسين الأداء

### المرحلة 5: محرر الألوان (Priority: Medium)
**المدة:** 2-3 أيام

**المهام:**
1. إنشاء محرر الألوان
   - [ ] إنشاء `ColorSchemeEditor.tsx`
   - [ ] إضافة منتقي الألوان
   - [ ] إضافة معاينة الألوان
   - [ ] إضافة التحقق من التباين

2. إدارة الألوان
   - [ ] إضافة/تعديل/حذف الألوان
   - [ ] إنشاء أنظمة ألوان
   - [ ] دعم Dark Mode
   - [ ] تصدير/استيراد

3. التحقق من المعايير
   - [ ] التحقق من تباين الألوان
   - [ ] التحقق من WCAG
   - [ ] اقتراح تحسينات

### المرحلة 6: محرر SEO (Priority: Medium)
**المدة:** 2-3 أيام

**المهام:**
1. إنشاء محرر SEO
   - [ ] إنشاء `SEOEditor.tsx`
   - [ ] إضافة حقول العنوان والوصف
   - [ ] إضافة حقول الكلمات المفتاحية
   - [ ] إضافة حقول Open Graph

2. إدارة SEO
   - [ ] إضافة/تعديل/حذف الإعدادات
   - [ ] إدارة البيانات المهيكلة
   - [ ] إدارة الروابط الأساسية
   - [ ] معاينة نتائج البحث

3. التحقق من SEO
   - [ ] التحقق من طول العنوان
   - [ ] التحقق من طول الوصف
   - [ ] التحقق من الكلمات المفتاحية
   - [ ] اقتراح تحسينات

### المرحلة 7: المعاينة الفورية (Priority: High)
**المدة:** 2-3 أيام

**المهام:**
1. إنشاء لوحة المعاينة
   - [ ] إنشاء `PreviewPanel.tsx`
   - [ ] إضافة تبديل الأجهزة
   - [ ] إضافة تبديل الأوضاع
   - [ ] إضافة مقارنة قبل/بعد

2. ربط المعاينة بالبيانات
   - [ ] ربط بالنصوص
   - [ ] ربط بالصور
   - [ ] ربط بالألوان
   - [ ] ربط بـ SEO

3. تحسين المعاينة
   - [ ] تحديث فوري
   - [ ] مشاركة رابط
   - [ ] تصدير المعاينة
   - [ ] طباعة المعاينة

### المرحلة 8: نظام التراجع/الإعادة (Priority: Low)
**المدة:** 2-3 أيام

**المهام:**
1. إنشاء نظام النسخ
   - [ ] حفظ نسخ تلقائية
   - [ ] حفظ نسخ يدوية
   - [ ] إدارة النسخ
   - [ ] مقارنة النسخ

2. إضافة التراجع/الإعادة
   - [ ] التراجع عن التغييرات
   - [ ] إعادة التغييرات
   - [ ] استعادة نسخة
   - [ ] مقارنة النسخ

3. تحسين النظام
   - [ ] تحديد عدد النسخ
   - [ ] تنظيف النسخ القديمة
   - [ ] تصدير النسخ
   - [ ] استيراد النسخ

### المرحلة 9: سجل التغييرات (Priority: Medium)
**المدة:** 1-2 يوم

**المهام:**
1. إنشاء سجل التغييرات
   - [ ] تسجيل التغييرات
   - [ ] عرض السجل
   - [ ] تصفية السجل
   - [ ] تصدير السجل

2. تحسين السجل
   - [ ] عرض التفاصيل
   - [ ] عرض المقارنة
   - [ ] إضافة الفلاتر
   - [ ] إضافة البحث

### المرحلة 10: الاختبار والتحسين (Priority: High)
**المدة:** 2-3 أيام

**المهام:**
1. اختبار الوظائف
   - [ ] اختبار CRUD
   - [ ] اختبار البحث والفلترة
   - [ ] اختبار المعاينة
   - [ ] اختبار التراجع/الإعادة

2. اختبار الأداء
   - [ ] اختبار سرعة التحميل
   - [ ] اختبار حجم الحزمة
   - [ ] اختبار استهلاك الذاكرة
   - [ ] تحسين الأداء

3. اختبار الوصولية
   - [ ] اختبار لوحة المفاتيح
   - [ ] اختبار قارئات الشاشة
   - [ ] اختبار تباين الألوان
   - [ ] تحسين الوصولية

4. اختبار الأمان
   - [ ] اختبار XSS
   - [ ] اختبار CSRF
   - [ ] اختبار التحقق من الصلاحيات
   - [ ] تحسين الأمان

5. التوثيق
   - [ ] توثيق المكونات
   - [ ] توثيق الـ API
   - [ ] توثيق الاستخدام
   - [ ] إنشاء دليل المستخدم

---

## 6. التقنيات المستخدمة

### Frontend
- **React 18+** - مكتبة واجهة المستخدم
- **TypeScript** - للكتابة الصارمة
- **TailwindCSS** - للتنسيق
- **shadcn/ui** - للمكونات الجاهزة
- **Lucide React** - للأيقونات
- **Sonner** - للإشعارات
- **React Hook Form** - للنماذج
- **Zod** - للتحقق من البيانات
- **TanStack Query** - لإدارة البيانات
- **Monaco Editor** - لمحرر النصوص المتقدم

### Backend
- **tRPC** - للـ API
- **Drizzle ORM** - لقاعدة البيانات
- **MySQL** - قاعدة البيانات
- **Sharp** - لمعالجة الصور
- **Zod** - للتحقق من البيانات

### Tools
- **ESLint** - لفحص الكود
- **Prettier** - لتنسيق الكود
- **Vitest** - للاختبار
- **Playwright** - للاختبار E2E

---

## 7. نقاط مهمة يجب مراعاتها

### 7.1 الأداء
- استخدام Code Splitting لتقسيم الكود
- استخدام Lazy Loading للمكونات الثقيلة
- ضغط الصور تلقائياً
- استخدام التخزين المؤقت الذكي
- تحسين حجم الحزمة

### 7.2 الأمان
- التحقق من جميع المدخلات
- منع هجمات XSS و CSRF
- تحديد معدل الطلبات
- التحقق من الهوية والصلاحيات
- تشفير البيانات الحساسة

### 7.3 الوصولية
- الالتزام بـ WCAG 2.1 AA
- دعم التنقل بلوحة المفاتيح
- دعم قارئات الشاشة
- تباين الألوان 4.5:1
- نص بديل لجميع الصور

### 7.4 التصميم
- تصميم متجاوب
- دعم Dark Mode
- دعم RTL
- مسافات متسقة
- خطوط واضحة ومقروءة

### 7.5 التوثيق
- توثيق جميع الدوال والمكونات
- استخدام JSDoc
- إنشاء دليل المستخدم
- توثيق الـ API
- إضافة أمثلة الاستخدام

---

## 8. الفوائد المتوقعة

### 8.1 للمستخدمين
- ✅ سهولة إدارة المحتوى
- ✅ معاينة فورية للتغييرات
- ✅ دعم متعدد اللغات
- ✅ تحسين SEO
- ✅ تحسين الأداء

### 8.2 للمطورين
- ✅ كود منظم وقابل للصيانة
- ✅ توثيق شامل
- ✅ اختبار شامل
- ✅ سهولة التوسع
- ✅ معايير جودة عالية

### 8.3 للمنصة
- ✅ تحسين الأداء
- ✅ تحسين الأمان
- ✅ تحسين الوصولية
- ✅ تحسين SEO
- ✅ تحسين تجربة المستخدم

---

## 9. الإحصائيات المتوقعة

| المرحلة | المدة | عدد المهام | الأولوية |
|---------|-------|-----------|----------|
| المرحلة 1 | 2-3 أيام | 12 | High |
| المرحلة 2 | 3-4 أيام | 16 | High |
| المرحلة 3 | 2-3 أيام | 10 | High |
| المرحلة 4 | 2-3 أيام | 10 | Medium |
| المرحلة 5 | 2-3 أيام | 10 | Medium |
| المرحلة 6 | 2-3 أيام | 10 | Medium |
| المرحلة 7 | 2-3 أيام | 10 | High |
| المرحلة 8 | 2-3 أيام | 10 | Low |
| المرحلة 9 | 1-2 يوم | 8 | Medium |
| المرحلة 10 | 2-3 أيام | 15 | High |
| **المجموع** | **20-30 يوم** | **111** | - |

---

## 10. التوصيات

1. **البدء بالمراحل ذات الأولوية العالية** (1, 2, 3, 7, 10)
2. **إنشاء prototype سريع** للمعاينة
3. **اختبار كل مرحلة** قبل الانتقال للتالية
4. **جمع ملاحظات المستخدمين** باستمرار
5. **تحسين الأداء** باستمرار
6. **تحديث التوثيق** مع كل تغيير
7. **الالتزام بمعايير الجودة** في كل مرحلة
8. **استخدام Git** لإدارة النسخ
9. **إنشاء Branch** لكل مرحلة
10. **مراجعة الكود** قبل الدمج

---

**حالة المقترح:** ✅ جاهز للمراجعة والتنفيذ

**ملاحظات:** يرجى مراجعة هذا المقترح وإعطاء الموافقة للبدء في التنفيذ.
