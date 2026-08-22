-- استكمال جداول CMS التشغيلية للبيئات التي أُنشئت فيها pages وtextContent فقط.
-- جميع الأوامر قابلة للتكرار ولا تعدل أي سجل منشور قائم.

CREATE TABLE IF NOT EXISTS `contentAuditLog` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entityType` ENUM('text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton') NULL,
  `entityId` INT NULL,
  `action` ENUM('create', 'update', 'delete') NULL,
  `oldValue` TEXT NULL,
  `newValue` TEXT NULL,
  `userId` INT NULL,
  `ipAddress` VARCHAR(50) NULL,
  `userAgent` TEXT NULL,
  `reason` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `contentAuditLog_entity_idx` (`entityType`, `entityId`),
  KEY `contentAuditLog_createdAt_idx` (`createdAt`)
);

CREATE TABLE IF NOT EXISTS `contentVersions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entityType` ENUM('text', 'image', 'color', 'seo') NOT NULL,
  `entityId` INT NOT NULL,
  `versionNumber` INT NOT NULL,
  `data` TEXT NOT NULL,
  `userId` INT NULL,
  `reason` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `contentVersions_entity_idx` (`entityType`, `entityId`),
  KEY `contentVersions_createdAt_idx` (`createdAt`)
);

CREATE TABLE IF NOT EXISTS `sections` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `pageId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `titleAr` VARCHAR(255) NULL,
  `titleEn` VARCHAR(255) NULL,
  `subtitleAr` VARCHAR(255) NULL,
  `subtitleEn` VARCHAR(255) NULL,
  `type` ENUM('slider', 'text', 'text-cards', 'stats-cards', 'image-cards', 'image', 'video', 'hero', 'cta', 'features', 'testimonials', 'faq', 'contact', 'pricing', 'team', 'gallery', 'timeline', 'custom') NOT NULL DEFAULT 'text',
  `settings` TEXT NULL,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isActive` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
  `publishedAt` TIMESTAMP NULL,
  `deletedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sections_pageId_idx` (`pageId`),
  KEY `sections_type_idx` (`type`),
  KEY `sections_status_idx` (`status`),
  KEY `sections_isActive_idx` (`isActive`),
  KEY `sections_sortOrder_idx` (`sortOrder`),
  KEY `sections_pageType_idx` (`pageId`, `type`),
  KEY `sections_pageActive_idx` (`pageId`, `isActive`),
  KEY `sections_statusPage_idx` (`status`, `pageId`),
  KEY `sections_deletedAt_idx` (`deletedAt`),
  CONSTRAINT `sections_pageId_fk` FOREIGN KEY (`pageId`) REFERENCES `pages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `sectionButtons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sectionId` INT NOT NULL,
  `textAr` VARCHAR(255) NOT NULL,
  `textEn` VARCHAR(255) NOT NULL,
  `link` VARCHAR(500) NOT NULL,
  `style` ENUM('primary', 'secondary', 'outline', 'ghost') NOT NULL DEFAULT 'primary',
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isActive` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
  `deletedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sectionButtons_sectionId_idx` (`sectionId`),
  KEY `sectionButtons_sortOrder_idx` (`sortOrder`),
  KEY `sectionButtons_deletedAt_idx` (`deletedAt`),
  CONSTRAINT `sectionButtons_sectionId_fk` FOREIGN KEY (`sectionId`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
