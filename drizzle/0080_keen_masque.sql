CREATE TABLE `social_publish_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('facebook','instagram','x','linkedin','youtube','tiktok') NOT NULL,
	`accountType` enum('page','profile','business','channel','organization') NOT NULL DEFAULT 'profile',
	`displayName` varchar(255) NOT NULL,
	`externalAccountId` varchar(255) NOT NULL,
	`avatarUrl` varchar(500),
	`connectionStatus` enum('disconnected','pending','connected','error','expired') NOT NULL DEFAULT 'disconnected',
	`capabilities` text,
	`lastValidatedAt` timestamp,
	`lastError` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_publish_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `socialPublishAccounts_external_unique` UNIQUE(`platform`,`externalAccountId`)
);
--> statement-breakpoint
CREATE TABLE `social_publish_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destinationId` int NOT NULL,
	`operation` enum('validate','upload','publish','status','retry','cancel') NOT NULL,
	`status` enum('started','succeeded','failed','skipped') NOT NULL,
	`httpStatus` int,
	`correlationId` varchar(255),
	`requestSummary` text,
	`responseSummary` text,
	`errorMessage` text,
	`performedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_publish_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_publish_destinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`accountId` int,
	`platform` enum('facebook','instagram','x','linkedin','youtube','tiktok') NOT NULL,
	`captionOverride` text,
	`settings` text,
	`publicationStatus` enum('not_ready','pending','queued','uploading','processing','published','failed','skipped','cancelled') NOT NULL DEFAULT 'not_ready',
	`externalPostId` varchar(255),
	`externalUrl` varchar(500),
	`lastAttemptAt` timestamp,
	`publishedAt` timestamp,
	`retryCount` int NOT NULL DEFAULT 0,
	`lastError` text,
	`idempotencyKey` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_publish_destinations_id` PRIMARY KEY(`id`),
	CONSTRAINT `socialPublishDestinations_idempotency_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `social_publish_post_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`mediaId` int NOT NULL,
	`role` enum('primary','cover','supplementary') NOT NULL DEFAULT 'primary',
	`sortOrder` int NOT NULL DEFAULT 0,
	`altText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_publish_post_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_publish_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`baseCaption` text,
	`contentType` enum('post','image','video','reel','story','short') NOT NULL DEFAULT 'post',
	`status` enum('draft','in_review','approved','scheduled','publishing','published','partial_failed','failed','cancelled') NOT NULL DEFAULT 'draft',
	`campaignId` int,
	`scheduledAt` timestamp,
	`timezone` varchar(64) NOT NULL DEFAULT 'Asia/Aden',
	`scheduleCronTaskUid` varchar(65),
	`metadata` text,
	`approvalNotes` text,
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`rejectedByUserId` int,
	`rejectedAt` timestamp,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_publish_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `social_publish_accounts` ADD CONSTRAINT `social_publish_accounts_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_attempts` ADD CONSTRAINT `sp_attempt_dest_fk` FOREIGN KEY (`destinationId`) REFERENCES `social_publish_destinations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_attempts` ADD CONSTRAINT `sp_attempt_user_fk` FOREIGN KEY (`performedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_destinations` ADD CONSTRAINT `social_publish_destinations_postId_social_publish_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `social_publish_posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_destinations` ADD CONSTRAINT `sp_dest_account_fk` FOREIGN KEY (`accountId`) REFERENCES `social_publish_accounts`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_post_media` ADD CONSTRAINT `social_publish_post_media_postId_social_publish_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `social_publish_posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_post_media` ADD CONSTRAINT `social_publish_post_media_mediaId_media_id_fk` FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_posts` ADD CONSTRAINT `social_publish_posts_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_posts` ADD CONSTRAINT `social_publish_posts_approvedByUserId_users_id_fk` FOREIGN KEY (`approvedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_posts` ADD CONSTRAINT `social_publish_posts_rejectedByUserId_users_id_fk` FOREIGN KEY (`rejectedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `socialPublishAccounts_platform_status_idx` ON `social_publish_accounts` (`platform`,`connectionStatus`);--> statement-breakpoint
CREATE INDEX `socialPublishAttempts_destination_created_idx` ON `social_publish_attempts` (`destinationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `socialPublishAttempts_operation_status_idx` ON `social_publish_attempts` (`operation`,`status`);--> statement-breakpoint
CREATE INDEX `socialPublishDestinations_post_idx` ON `social_publish_destinations` (`postId`);--> statement-breakpoint
CREATE INDEX `socialPublishDestinations_account_idx` ON `social_publish_destinations` (`accountId`);--> statement-breakpoint
CREATE INDEX `socialPublishDestinations_platform_status_idx` ON `social_publish_destinations` (`platform`,`publicationStatus`);--> statement-breakpoint
CREATE INDEX `socialPublishPostMedia_post_order_idx` ON `social_publish_post_media` (`postId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `socialPublishPostMedia_media_idx` ON `social_publish_post_media` (`mediaId`);--> statement-breakpoint
CREATE INDEX `socialPublishPosts_status_schedule_idx` ON `social_publish_posts` (`status`,`scheduledAt`);--> statement-breakpoint
CREATE INDEX `socialPublishPosts_campaign_idx` ON `social_publish_posts` (`campaignId`);--> statement-breakpoint
CREATE INDEX `socialPublishPosts_createdBy_idx` ON `social_publish_posts` (`createdByUserId`);--> statement-breakpoint
CREATE INDEX `socialPublishPosts_schedule_task_idx` ON `social_publish_posts` (`scheduleCronTaskUid`);
