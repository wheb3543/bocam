-- جدول إعدادات SEO المستقل لبيئات CMS التي لم تتلق ترحيلات المحتوى التاريخية.
CREATE TABLE IF NOT EXISTS `seoSettings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `pageId` INT NULL,
  `pageKey` VARCHAR(255) NULL,
  `slug` VARCHAR(255) NULL,
  `language` VARCHAR(10) NULL DEFAULT 'ar',
  `title` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `keywords` TEXT NULL,
  `ogTitle` VARCHAR(255) NULL,
  `ogDescription` TEXT NULL,
  `ogImage` VARCHAR(500) NULL,
  `canonicalUrl` VARCHAR(500) NULL,
  `robots` TEXT NULL,
  `structuredData` TEXT NULL,
  `isActive` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `seoSettings_slug_language_idx` (`slug`, `language`),
  KEY `seoSettings_page_language_idx` (`pageId`, `language`),
  KEY `seoSettings_pageKey_language_idx` (`pageKey`, `language`)
);
