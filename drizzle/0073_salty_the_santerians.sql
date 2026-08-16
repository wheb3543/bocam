CREATE TABLE `media_folders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`parentId` int,
	`path` varchar(500) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_folders_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_folders_path_unique` UNIQUE(`path`)
);
--> statement-breakpoint
ALTER TABLE `seoSettings` DROP INDEX `seoSettings_pageKey_unique`;--> statement-breakpoint
ALTER TABLE `seoSettings` MODIFY COLUMN `pageKey` varchar(255);--> statement-breakpoint
ALTER TABLE `media` ADD `folderId` int;--> statement-breakpoint
ALTER TABLE `seoSettings` ADD `pageId` int;--> statement-breakpoint
ALTER TABLE `seoSettings` ADD `slug` varchar(255);--> statement-breakpoint
CREATE INDEX `media_folders_parent_idx` ON `media_folders` (`parentId`);--> statement-breakpoint
CREATE INDEX `media_folder_idx` ON `media` (`folderId`);