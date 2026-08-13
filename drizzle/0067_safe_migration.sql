-- Migration آمن لإضافة جداول الصفحات والأقسام وتحديث جداول المحتوى
-- Safe migration to add pages and sections tables and update content tables

-- 1. إنشاء جدول الصفحات
CREATE TABLE IF NOT EXISTS `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`type` enum('main','sub') NOT NULL DEFAULT 'main',
	`parentId` int,
	`titleAr` varchar(255) NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`metaTitleAr` varchar(255),
	`metaTitleEn` varchar(255),
	`metaDescriptionAr` text,
	`metaDescriptionEn` text,
	`keywordsAr` text,
	`keywordsEn` text,
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);

-- 2. إنشاء جدول الأقسام
CREATE TABLE IF NOT EXISTS `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`titleEn` varchar(255),
	`subtitleAr` varchar(255),
	`subtitleEn` varchar(255),
	`type` enum('slider','text','text-cards','stats-cards','image-cards','image','video','hero','cta','features','testimonials','faq','contact','pricing','team','gallery','timeline','custom') NOT NULL DEFAULT 'text',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sections_id` PRIMARY KEY(`id`)
);

-- 3. إنشاء جدول أزرار الأقسام
CREATE TABLE IF NOT EXISTS `sectionButtons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionId` int NOT NULL,
	`textAr` varchar(255) NOT NULL,
	`textEn` varchar(255) NOT NULL,
	`link` varchar(500) NOT NULL,
	`style` enum('primary','secondary','outline','ghost') NOT NULL DEFAULT 'primary',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sectionButtons_id` PRIMARY KEY(`id`)
);

-- 4. إضافة أعمدة جديدة إلى جدول textContent
ALTER TABLE `textContent` ADD COLUMN `sectionId` int;
ALTER TABLE `textContent` ADD COLUMN `pageId` int;

-- 5. تحديث نوع عمود type في textContent (إضافة أنواع جديدة)
-- هذا آمن لأننا نضيف قيم جديدة فقط، لا نحذف القيم القديمة
ALTER TABLE `textContent` 
MODIFY COLUMN `type` enum('title','subtitle','description','text','button','link','label','placeholder','error','success','warning','info') 
NOT NULL DEFAULT 'text';

-- 6. إضافة أعمدة جديدة إلى جدول images
ALTER TABLE `images` ADD COLUMN `altAr` text;
ALTER TABLE `images` ADD COLUMN `altEn` text;
ALTER TABLE `images` ADD COLUMN `sectionId` int;
ALTER TABLE `images` ADD COLUMN `pageId` int;

-- 7. نسخ البيانات من alt إلى altAr و altEn
UPDATE `images` SET `altAr` = `alt` WHERE `alt` IS NOT NULL;
UPDATE `images` SET `altEn` = `alt` WHERE `alt` IS NOT NULL;

-- 8. حذف عمود alt القديم من images
ALTER TABLE `images` DROP COLUMN `alt`;
