-- تأسيس نواة CMS للبيئات التي لم تتلق جداول المحتوى التاريخية.
-- لا يحذف هذا الترحيل أي جدول أو سجل قائم، ويمكن تشغيله أكثر من مرة بأمان.
CREATE TABLE IF NOT EXISTS `pages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `type` ENUM('main', 'sub') NOT NULL DEFAULT 'main',
  `parentId` INT NULL,
  `titleAr` VARCHAR(255) NOT NULL,
  `titleEn` VARCHAR(255) NOT NULL,
  `metaTitleAr` VARCHAR(255) NULL,
  `metaTitleEn` VARCHAR(255) NULL,
  `metaDescriptionAr` TEXT NULL,
  `metaDescriptionEn` TEXT NULL,
  `keywordsAr` TEXT NULL,
  `keywordsEn` TEXT NULL,
  `isActive` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
  `sortOrder` INT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `publishedAt` TIMESTAMP NULL,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`),
  KEY `pages_status_idx` (`status`),
  KEY `pages_isActive_idx` (`isActive`),
  KEY `pages_sortOrder_idx` (`sortOrder`)
);

CREATE TABLE IF NOT EXISTS `textContent` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(255) NOT NULL,
  `language` VARCHAR(10) NOT NULL DEFAULT 'ar',
  `content` TEXT NOT NULL,
  `section` VARCHAR(100) NULL,
  `sectionId` INT NULL,
  `pageId` INT NULL,
  `type` ENUM('title', 'subtitle', 'description', 'text', 'button', 'link', 'label', 'placeholder', 'error', 'success', 'warning', 'info') NOT NULL DEFAULT 'text',
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `isActive` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
  `publishedAt` TIMESTAMP NULL,
  `deletedAt` TIMESTAMP NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `textContent_key_unique` (`key`),
  KEY `textContent_page_language_idx` (`pageId`, `language`),
  KEY `textContent_status_page_idx` (`status`, `pageId`),
  KEY `textContent_deleted_at_idx` (`deletedAt`),
  CONSTRAINT `textContent_page_fk` FOREIGN KEY (`pageId`) REFERENCES `pages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- تكمل هذه العبارة البيئات القديمة التي تملك جدول pages بالفعل لكنه يفتقد دورة النشر.
ALTER TABLE `pages`
  ADD COLUMN IF NOT EXISTS `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS `publishedAt` TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS `deletedAt` TIMESTAMP NULL;
