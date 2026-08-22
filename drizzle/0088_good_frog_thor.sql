ALTER TABLE `contentVersions` MODIFY COLUMN `entityType` enum('text','image','color','seo','sectionButton') NOT NULL;--> statement-breakpoint
ALTER TABLE `sectionButtons` ADD `status` enum('draft','published','archived') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `sectionButtons` ADD `publishedAt` timestamp;--> statement-breakpoint
UPDATE `sectionButtons` SET `status` = 'published', `publishedAt` = `updatedAt` WHERE `deletedAt` IS NULL;--> statement-breakpoint
CREATE INDEX `sectionButtons_status_idx` ON `sectionButtons` (`status`);--> statement-breakpoint
CREATE INDEX `sectionButtons_sectionStatus_idx` ON `sectionButtons` (`sectionId`,`status`);
