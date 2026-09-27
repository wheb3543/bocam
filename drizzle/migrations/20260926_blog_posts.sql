-- =====================================================================
-- المدونة الطبية: جداول المقالات والتصنيفات + توسيع أنواع كيانات CMS
-- ---------------------------------------------------------------------
-- جميع الأوامر قابلة للتكرار (idempotent) ولا تعدل أي سجل منشور قائم.
-- يُشغَّل عبر: node scripts/database/run-migrations.mjs
-- ويُفحص آلياً عبر: pnpm schema:migrations:check
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) جدول تصنيفات المدونة الطبية
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `blogCategories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `nameEn` VARCHAR(255) NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(100) NULL,
  `color` VARCHAR(20) NULL,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isActive` ENUM('yes','no') NOT NULL DEFAULT 'yes',
  `deletedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blogCategories_slug_unique` (`slug`),
  KEY `blogCategories_slug_idx` (`slug`),
  KEY `blogCategories_isActive_idx` (`isActive`),
  KEY `blogCategories_sortOrder_idx` (`sortOrder`),
  KEY `blogCategories_deletedAt_idx` (`deletedAt`),
  KEY `blogCategories_isActiveSort_idx` (`isActive`, `sortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2) جدول مقالات المدونة الطبية
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `blogPosts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `titleEn` VARCHAR(255) NULL,
  `slug` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NULL,
  `excerptEn` TEXT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `contentEn` MEDIUMTEXT NULL,
  `coverImage` VARCHAR(500) NULL,
  `coverImageAlt` VARCHAR(255) NULL,
  `categoryId` INT NULL,
  `authorId` INT NULL,
  `reviewerName` VARCHAR(255) NULL,
  `reviewDate` TIMESTAMP NULL,
  `tags` TEXT NULL,
  `readingTime` INT NOT NULL DEFAULT 0,
  `status` ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  `isActive` ENUM('yes','no') NOT NULL DEFAULT 'yes',
  `isFeatured` ENUM('yes','no') NOT NULL DEFAULT 'no',
  `sortOrder` INT NOT NULL DEFAULT 0,
  `viewsCount` INT NOT NULL DEFAULT 0,
  `metaTitle` VARCHAR(255) NULL,
  `metaDescription` TEXT NULL,
  `keywords` TEXT NULL,
  `ogImage` VARCHAR(500) NULL,
  `scheduledFor` TIMESTAMP NULL,
  `publishedAt` TIMESTAMP NULL,
  `deletedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blogPosts_slug_unique` (`slug`),
  KEY `blogPosts_slug_idx` (`slug`),
  KEY `blogPosts_categoryId_idx` (`categoryId`),
  KEY `blogPosts_status_idx` (`status`),
  KEY `blogPosts_isActive_idx` (`isActive`),
  KEY `blogPosts_isFeatured_idx` (`isFeatured`),
  KEY `blogPosts_sortOrder_idx` (`sortOrder`),
  KEY `blogPosts_publishedAt_idx` (`publishedAt`),
  KEY `blogPosts_scheduledFor_idx` (`scheduledFor`),
  KEY `blogPosts_deletedAt_idx` (`deletedAt`),
  KEY `blogPosts_statusActive_idx` (`status`, `isActive`),
  KEY `blogPosts_categoryStatus_idx` (`categoryId`, `status`),
  CONSTRAINT `blogPosts_categoryId_fk` FOREIGN KEY (`categoryId`)
    REFERENCES `blogCategories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `blogPosts_authorId_fk` FOREIGN KEY (`authorId`)
    REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3) توسيع أنواع كيانات سجل التدقيق ونسخ المحتوى لتشمل كيانات المدونة
--    نُعيد تعريف العمود بالقيمة الكاملة مع الحفاظ على السجلات القائمة.
-- ---------------------------------------------------------------------
ALTER TABLE `contentAuditLog`
  MODIFY COLUMN `entityType` ENUM(
    'text','image','color','seo','page','section','sectionButton',
    'blogPost','blogCategory','operation'
  ) NULL;

ALTER TABLE `contentVersions`
  MODIFY COLUMN `entityType` ENUM(
    'text','image','color','seo','page','section','sectionButton',
    'blogPost','blogCategory'
  ) NOT NULL;
