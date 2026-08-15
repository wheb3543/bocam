CREATE TABLE `pages` (
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
--> statement-breakpoint
CREATE TABLE `sectionButtons` (
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
--> statement-breakpoint
CREATE TABLE `sections` (
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
--> statement-breakpoint
ALTER TABLE `textContent` MODIFY COLUMN `type` enum('title','subtitle','description','text','button','link','label','placeholder','error','success','warning','info') NOT NULL DEFAULT 'text';--> statement-breakpoint
ALTER TABLE `images` ADD `altAr` text;--> statement-breakpoint
ALTER TABLE `images` ADD `altEn` text;--> statement-breakpoint
ALTER TABLE `images` ADD `sectionId` int;--> statement-breakpoint
ALTER TABLE `images` ADD `pageId` int;--> statement-breakpoint
ALTER TABLE `textContent` ADD `sectionId` int;--> statement-breakpoint
ALTER TABLE `textContent` ADD `pageId` int;--> statement-breakpoint
ALTER TABLE `images` DROP COLUMN `alt`;