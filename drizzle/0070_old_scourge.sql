CREATE TABLE `media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`type` enum('image','video','audio','document','other') NOT NULL DEFAULT 'image',
	`mimeType` varchar(100),
	`fileName` varchar(255),
	`altAr` text,
	`altEn` text,
	`descriptionAr` text,
	`descriptionEn` text,
	`section` varchar(100),
	`sectionId` int,
	`pageId` int,
	`width` int,
	`height` int,
	`duration` int,
	`format` varchar(10),
	`size` int,
	`thumbnailUrl` varchar(500),
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_sectionId_sections_id_fk` FOREIGN KEY (`sectionId`) REFERENCES `sections`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_pageId_pages_id_fk` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `media_type_idx` ON `media` (`type`);--> statement-breakpoint
CREATE INDEX `media_section_idx` ON `media` (`section`);--> statement-breakpoint
CREATE INDEX `media_sectionId_idx` ON `media` (`sectionId`);--> statement-breakpoint
CREATE INDEX `media_pageId_idx` ON `media` (`pageId`);--> statement-breakpoint
CREATE INDEX `media_isActive_idx` ON `media` (`isActive`);--> statement-breakpoint
CREATE INDEX `media_pageSection_idx` ON `media` (`pageId`,`section`);--> statement-breakpoint
CREATE INDEX `media_typePage_idx` ON `media` (`type`,`pageId`);