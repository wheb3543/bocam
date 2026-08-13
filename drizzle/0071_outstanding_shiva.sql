ALTER TABLE `images` ADD `status` enum('draft','published','archived') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `images` ADD `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `media` ADD `status` enum('draft','published','archived') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `pages` ADD `status` enum('draft','published','archived') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `pages` ADD `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `sections` ADD `status` enum('draft','published','archived') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `sections` ADD `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `textContent` ADD `status` enum('draft','published','archived') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `textContent` ADD `publishedAt` timestamp;--> statement-breakpoint
CREATE INDEX `images_status_idx` ON `images` (`status`);--> statement-breakpoint
CREATE INDEX `images_statusPage_idx` ON `images` (`status`,`pageId`);--> statement-breakpoint
CREATE INDEX `media_status_idx` ON `media` (`status`);--> statement-breakpoint
CREATE INDEX `media_statusPage_idx` ON `media` (`status`,`pageId`);--> statement-breakpoint
CREATE INDEX `pages_status_idx` ON `pages` (`status`);--> statement-breakpoint
CREATE INDEX `pages_statusActive_idx` ON `pages` (`status`,`isActive`);--> statement-breakpoint
CREATE INDEX `sections_status_idx` ON `sections` (`status`);--> statement-breakpoint
CREATE INDEX `sections_statusPage_idx` ON `sections` (`status`,`pageId`);--> statement-breakpoint
CREATE INDEX `textContent_status_idx` ON `textContent` (`status`);--> statement-breakpoint
CREATE INDEX `textContent_statusPage_idx` ON `textContent` (`status`,`pageId`);