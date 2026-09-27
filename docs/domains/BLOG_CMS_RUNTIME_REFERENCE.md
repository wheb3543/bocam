# المرجع التشغيلي للمدونة الطبية (Blog CMS Runtime Reference)

> **نطاق الوثيقة:** المدونة الطبية في منظومة BOCAM — صفحاتها العامة، إدارة محتواها، وجداولها، وأدوات فحص الجودة.
> **الحالة:** مُنفَّذة بالكامل ومُتحقَّق منها (2026-09-27)

---

## 1. ملخص النظام

المدونة نظام محتوى متكامل مبني على وحدة `05-cms-portal`، بثلاث طبقات:

| الطبقة | المسار | الصلاحية |
|---|---|---|
| الواجهة العامة | `/blog`, `/blog/:slug` | عامة |
| لوحة الإدارة | `/admin/content/blog` | `content.*` |
| الخادم (tRPC) | `content.blog.*` (إداري) + `blog.*` (عام) | — |

### قرارات التصميم الأساسية

1. **التصميم مطابق للمرجع** `hail.saudigermanhealth.com/ar/blog` مع إضافات تخدم الهوية: مسار تنقل، شريط مشاركة، وسوم، وإشعار طبي.
2. **المحرر معزول** في `BlogContentEditor.tsx` (مربع نص + شريط وسوم + معاينة حيّة) بلا اعتماديات جديدة.
3. **المدونة مدمجة في حوكمة CMS** القائمة لا نظام موازٍ: بوابة جودة نشر، سجل تدقيق، نسخ محفوظة، سلة محذوفات، مراجعة واعتماد، ونشر مؤجل.
4. **التعقيم على ثلاث طبقات**: عند الكتابة (خادم) ← عند القراءة (خدمة المحتوى) ← قبل الإدراج في DOM (عميل).
5. **البذر idempotent**: إعادة تشغيل السكربت لا تُنشئ تكراراً.

---

## 2. الجداول

### 2.1 `blogCategories` (12 عموداً)

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | int AI | مفتاح أساسي |
| `name` / `nameEn` | varchar | الاسم عربي/إنجليزي |
| `slug` | varchar unique | المعرّف في الرابط |
| `description` | text | وصف التصنيف |
| `color` | varchar(7) | لون مميّز `#rrggbb` |
| `sortOrder` | int | ترتيب العرض |
| `isActive` | enum(yes/no) | حالة التفعيل |
| `createdAt` / `updatedAt` / `deletedAt` | timestamp | تدقيق + حذف ناعم |

### 2.2 `blogPosts` (30 عموداً)

| المجموعة | الأعمدة |
|---|---|
| المحتوى | `title`, `titleEn`, `slug`, `excerpt`, `excerptEn`, `content` (MEDIUMTEXT), `contentEn` |
| الصورة | `coverImage`, `coverImageAlt` (إلزامي للنشر), `ogImage` |
| التصنيف | `categoryId` → `blogCategories.id` |
| المؤلف | `authorId` → `users.id`, `reviewerName`, `reviewDate` |
| الوسوم | `tags` (JSON) |
| الحساب | `readingTime` (دقائق، محسوب آلياً), `viewsCount` |
| الحالة | `status` (draft/published/archived), `isActive`, `isFeatured`, `sortOrder` |
| النشر | `publishedAt`, `scheduledFor` |
| SEO | `metaTitle`, `metaDescription`, `keywords` |

**الفهارس (12):** `slug` فريد، `categoryId`, `status`, `isActive`, `isFeatured`, `publishedAt`, `sortOrder`، وفهارس مركّبة للحالة والتصنيف.

### 2.3 التوسعات على جداول قائمة

`contentVersions.entityType` و `contentAuditLog.entityType` توسّعتا لتقبل `blogPost` و `blogCategory`، ما يتيح للمونة الاستفادة من: النسخ المحفوظة، سجل التدقيق، سلة المحذوفات، مراجعة الاعتماد، والنشر المؤجل عبر Heartbeat.

---

## 3. واجهة الخادم (tRPC)

### 3.1 المسار الإداري: `content.blog.*` (14 إجراء)

| الإجراء | الوصف |
|---|---|
| `list` | قائمة مقالات مع ترقيم وفلاتر (بحث، تصنيف، حالة، نشط، مميّز) |
| `getById` / `getBySlug` | جلب مقال واحد |
| `create` / `update` | إنشاء/تعديل مع تعقيم المحتوى وتسجيل التدقيق وحفظ نسخة |
| `delete` / `restore` | حذف ناعم واستعادة |
| `duplicate` | تكرار مقال مع توليد slug فريد |
| `publish` / `unpublish` | نشر/إلغاء نشر مع بوابة جودة النشر |
| `getOverview` | إحصاءات اللوحة (إجمالي، منشور، مسودة، مميّز، بلا صورة) |
| `categories.*` | إدارة التصنيفات (يمنع حذف تصنيف مستخدَم) |

### 3.2 المسار العام: `blog.*` (5 إجراءات)

| الإجراء | الوصف |
|---|---|
| `blog.list` | مقالات منشورة ونشطة فقط، 4 خيارات ترتيب مطابقة للمرجع + بحث + تصنيف + ترقيم |
| `blog.getBySlug` | مقال واحد + مقالات ذات صلة (نفس التصنيف) |
| `blog.categories` | التصنيفات النشطة مع عدّاد المقالات |
| `blog.featured` | المقالات المميزة لقسم المدونة بالصفحة الرئيسية |

**التخزين المؤقت:** نمط `blog:*` للعام و `admin:blog:*` للإداري، مع إبطال صريح عند كل كتابة.

---

## 4. الواجهة العامة

المسارات في `client/src/apps/public/routes.tsx` ومربوطة في `App.tsx`:

| المسار | المكوّن | الوصف |
|---|---|---|
| `/blog` | `BlogListPage.tsx` | بانر مضغوط + بحث + تصنيفات + ترتيب + شبكة 3 أعمدة + ترقيم + CTA |
| `/blog/:slug` | `BlogPostPage.tsx` | مسار تنقل + عنوان + مراجع + صورة + وقت قراءة + مشاركة + وسوم + إشعار طبي + ذات صلة |

مكوّنات `modules/05-content-and-legal/`:

| المكوّن | المسؤولية |
|---|---|
| `BlogCard.tsx` | بطاقة بنسخ المرجع (صورة ← محتوى ← تاريخ ← زر) + نسخة `compact` |
| `BlogPagination.tsx` | نمط `1 2 3 4 … 75` مع نافذة قابلة للاختبار |
| `BlogSortSelect.tsx` | خيارات الترتيب الأربعة |
| `BlogCategoryFilter.tsx` | فلتر التصنيفات |
| `BlogShareBar.tsx` | واتساب/فيسبوك/إكس/نسخ مع بديل Clipboard |
| `BlogArticleBody.tsx` | تعقيم ثالث + تنسيق HTML طبي |
| `utils/blogPresentation.ts` | تاريخ عربي، اقتطاع، وقت قراءة، وسوم، روابط آمنة |

قسم المدونة بالصفحة الرئيسية (`SghBlogSection.tsx`) يجلب المقالات المميزة عبر `trpc.blog.featured` مع حالات تحميل وخطأ وفراغ. روابط Navbar وFooter تشير إلى `/blog`.

---

## 5. لوحة الإدارة

المسار `/admin/content/blog` داخل مجموعة **إدارة المحتوى** في `sidebarNavigation.ts`.

| الملف | المسؤولية |
|---|---|
| `blog/pages/BlogManagementPage.tsx` | إحصاءات + تخطيط + فلاتر + حوار |
| `blog/components/BlogPostTable.tsx` | جدول بحالات وإجراءات سريعة + حذف ناعم |
| `blog/components/BlogPostDialog.tsx` | 3 تبويبات: المحتوى / النشر / SEO |
| `blog/components/BlogContentEditor.tsx` | **محرر معزول**: مربع نص + شريط 11 وسم + معاينة حيّة |
| `blog/components/BlogCategoryManager.tsx` | إدارة التصنيفات |
| `blog/hooks/useBlogPosts.ts` | حالة + طفرات + بوابة الجودة + سجل التدقيق |
| `blog/types/blog.types.ts` | تحويل النموذج ↔ tRPC مع اختبارات |

---

## 6. بوابات الجودة

| البوابة | الوصف |
|---|---|
| جودة النشر | `publicationQualityGate.ts` — يتطلب صورة غلاف ونصاً بديلاً ونطاقاً صحيحاً |
| سلامة النص | `sanitizeBlogHtml` — قائمة وسوم مسموحة، منع `<script>`/`onerror=`/`javascript:`، `rel="noopener noreferrer"`، `loading="lazy"` |
| سلامة الرابط | `buildBlogSlug` — توحيد الهمزات والتاء المربوطة والتشكيل، ولاحقة رقمية عند التكرار |
| سلامة النص العربي | `scripts/qa/check-arabic-integrity.mjs` — يكشف الرموز اللاتينية والمحارف الآسيوية والتشويش في المحتوى المولّد |
| سلامة الأنواع | `types/checks/blog-output-types.ts` — حارس أنواع يفشل البناء إذا انكسر استنتاج مخرجات tRPC (يحوّل `{}` إلى أخطاء في الواجهة) |

---

## 7. البيانات الأولية

```bash
pnpm db:seed:blog
```

يبذر: 4 تصنيفات، 5 مقالات (3 مميزة)، 8 نصوص CMS لصفحة المدونة، وإعداد SEO لصفحة `/blog`.
السكربت **idempotent**: التشغيل الثاني يُحدّث ولا يُكرّر (تم التحقق: `0 جديد، 5 محدّث`).

**أدوات التحقق:**

```bash
node scripts/qa/check-blog-tables.mjs          # وجود الجداول وأعمدتها
pnpm blog:seed-check                           # سلامة المحتوى وكشف XSS
pnpm qa:arabic <file>                          # سلامة النصوص العربية المولّدة
```

---

## 8. الترحيل

`server/database/migrations/20260926_create_blog_tables.sql` — idempotent، ينشئ الجداول ويوسّع أعمدة ENUM. يُقرأ عبر `run-migrations.mjs` ويُتحقق منه عبر `schema:migrations:check` (118 جدول).

> **ملاحظة:** العبارات التوضيحية داخل ملفات الترحيل يجب أن تكون تعليقات كتلية `/* */` لا تعليقات سطرية `--`، لأن الفاحص الآلي يتجاهل السطور التي تبدأ بـ `--` وقد يفقد العبارات بصمت.

---

## 9. الأوامر المعتمدة

```bash
pnpm db:migrate              # تنفيذ الترحيلات
pnpm db:seed:blog            # بذر المدونة
pnpm check                   # فحص TypeScript
pnpm docs:check              # فحص سجل التوثيق
pnpm schema:migrations:check # مطابقة المخطط مع الترحيلات
pnpm blog:router-check       # فحص ربط راوترات المدونة
pnpm migrations:sql-lint     # فحص صياغة عبارات الترحيل
```

