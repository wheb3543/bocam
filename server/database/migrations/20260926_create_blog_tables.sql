/**
 * Create Blog Tables Migration (المدونة الطبية)
 * إنشاء جداول المدونة الطبية وتصنيفاتها
 *
 * جداول مستقلة تديرها وحدة 05-cms-portal في تخطيط BOCAM:
 *  - blogCategories: تصنيفات المدونة المستخدمة للتصفية وربط المقالات
 *  - blogPosts: مقالات المدونة الطبية
 *
 * جميع الأوامر قابلة للتكرار (idempotent) ولا تعدل أي سجل منشور قائم.
 * يُفحص آلياً عبر: pnpm schema:migrations:check
 */

CREATE TABLE IF NOT EXISTS blogCategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT 'اسم التصنيف بالعربية',
  nameEn VARCHAR(255) NULL COMMENT 'اسم التصنيف بالإنجليزية',
  slug VARCHAR(255) NOT NULL COMMENT 'رابط التصنيف المختصر',
  description TEXT NULL COMMENT 'وصف مختصر للتصنيف',
  icon VARCHAR(100) NULL COMMENT 'اسم أيقونة من مكتبة lucide',
  color VARCHAR(20) NULL COMMENT 'لون التمييز البصري',
  sortOrder INT DEFAULT 0 NOT NULL COMMENT 'ترتيب العرض اليدوي',
  isActive ENUM('yes', 'no') DEFAULT 'yes' NOT NULL,
  deletedAt TIMESTAMP NULL COMMENT 'الحذف الناعم',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY blogCategories_slug_unique (slug),
  KEY blogCategories_slug_idx (slug),
  KEY blogCategories_isActive_idx (isActive),
  KEY blogCategories_sortOrder_idx (sortOrder),
  KEY blogCategories_deletedAt_idx (deletedAt),
  KEY blogCategories_isActiveSort_idx (isActive, sortOrder)
);

CREATE TABLE IF NOT EXISTS blogPosts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL COMMENT 'عنوان المقال بالعربية',
  titleEn VARCHAR(255) NULL COMMENT 'عنوان المقال بالإنجليزية',
  slug VARCHAR(255) NOT NULL COMMENT 'رابط المقال العام',
  excerpt TEXT NULL COMMENT 'مقتطف يظهر في بطاقة القائمة',
  excerptEn TEXT NULL,
  content MEDIUMTEXT NOT NULL COMMENT 'جسم المقال المنسق (HTML معقم)',
  contentEn MEDIUMTEXT NULL,
  coverImage VARCHAR(500) NULL COMMENT 'صورة الغلاف',
  coverImageAlt VARCHAR(255) NULL COMMENT 'النص البديل لصورة الغلاف',
  categoryId INT NULL COMMENT 'معرف التصنيف الطبي',
  authorId INT NULL COMMENT 'معرف كاتب المقال',
  reviewerName VARCHAR(255) NULL COMMENT 'اسم المراجع الطبي',
  reviewDate TIMESTAMP NULL COMMENT 'تاريخ المراجعة الطبية',
  tags TEXT NULL COMMENT 'مصفوفة JSON من الوسوم',
  readingTime INT DEFAULT 0 NOT NULL COMMENT 'وقت القراءة بالدقائق',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft' NOT NULL,
  isActive ENUM('yes', 'no') DEFAULT 'yes' NOT NULL,
  isFeatured ENUM('yes', 'no') DEFAULT 'no' NOT NULL COMMENT 'يظهر في قسم المدونة بالصفحة الرئيسية',
  sortOrder INT DEFAULT 0 NOT NULL COMMENT 'ترتيب يدوي للثبات',
  viewsCount INT DEFAULT 0 NOT NULL COMMENT 'عدّاد المشاهدات العامة',
  metaTitle VARCHAR(255) NULL COMMENT 'عنوان SEO المخصص',
  metaDescription TEXT NULL,
  keywords TEXT NULL,
  ogImage VARCHAR(500) NULL,
  scheduledFor TIMESTAMP NULL COMMENT 'موعد النشر المؤجل',
  publishedAt TIMESTAMP NULL,
  deletedAt TIMESTAMP NULL COMMENT 'الحذف الناعم',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY blogPosts_slug_unique (slug),
  KEY blogPosts_slug_idx (slug),
  KEY blogPosts_categoryId_idx (categoryId),
  KEY blogPosts_status_idx (status),
  KEY blogPosts_isActive_idx (isActive),
  KEY blogPosts_isFeatured_idx (isFeatured),
  KEY blogPosts_sortOrder_idx (sortOrder),
  KEY blogPosts_publishedAt_idx (publishedAt),
  KEY blogPosts_scheduledFor_idx (scheduledFor),
  KEY blogPosts_deletedAt_idx (deletedAt),
  KEY blogPosts_statusActive_idx (status, isActive),
  KEY blogPosts_categoryStatus_idx (categoryId, status)
);

/* توسيع أنواع كيانات سجل التدقيق ونسخ المحتوى لتشمل كيانات المدونة.
   نعيد تعريف العمود بالقيمة الكاملة مع الحفاظ على السجلات القائمة. */
ALTER TABLE contentAuditLog
  MODIFY COLUMN entityType ENUM(
    'text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton',
    'blogPost', 'blogCategory', 'operation'
  ) NULL;

ALTER TABLE contentVersions
  MODIFY COLUMN entityType ENUM(
    'text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton',
    'blogPost', 'blogCategory'
  ) NOT NULL;
