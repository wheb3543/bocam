ALTER TABLE `seoSettings` ADD `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `seoSettings` ADD `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `seoSettings` ADD `deletedAt` timestamp;--> statement-breakpoint
UPDATE `seoSettings`
SET `status` = CASE WHEN `isActive` = 'yes' THEN 'published' ELSE 'draft' END,
    `publishedAt` = CASE WHEN `isActive` = 'yes' THEN `updatedAt` ELSE NULL END;--> statement-breakpoint
CREATE INDEX `seoSettings_pageId_idx` ON `seoSettings` (`pageId`);--> statement-breakpoint
CREATE INDEX `seoSettings_pageKey_idx` ON `seoSettings` (`pageKey`);--> statement-breakpoint
CREATE INDEX `seoSettings_slugLanguage_idx` ON `seoSettings` (`slug`,`language`);--> statement-breakpoint
CREATE INDEX `seoSettings_status_idx` ON `seoSettings` (`status`);--> statement-breakpoint
CREATE INDEX `seoSettings_deletedAt_idx` ON `seoSettings` (`deletedAt`);
