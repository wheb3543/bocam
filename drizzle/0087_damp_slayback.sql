CREATE TABLE `cmsPreviewTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`pageId` int NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'ar',
	`createdByUserId` int,
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cmsPreviewTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `cmsPreviewTokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `cmsPreviewTokens` ADD CONSTRAINT `cmsPreviewTokens_pageId_pages_id_fk` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `cmsPreviewTokens` ADD CONSTRAINT `cmsPreviewTokens_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `cmsPreviewTokens_pageId_idx` ON `cmsPreviewTokens` (`pageId`);--> statement-breakpoint
CREATE INDEX `cmsPreviewTokens_expiresAt_idx` ON `cmsPreviewTokens` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `cmsPreviewTokens_revokedAt_idx` ON `cmsPreviewTokens` (`revokedAt`);