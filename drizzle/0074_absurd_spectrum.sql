CREATE TABLE `social_inbox_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('messenger','instagram','x','linkedin','youtube') NOT NULL,
	`accountType` enum('page','profile','business','channel') NOT NULL DEFAULT 'profile',
	`displayName` varchar(255) NOT NULL,
	`externalAccountId` varchar(255) NOT NULL,
	`status` enum('disconnected','pending','connected','error') NOT NULL DEFAULT 'disconnected',
	`lastSyncedAt` timestamp,
	`lastError` text,
	`metadata` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_inbox_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_inbox_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int NOT NULL,
	`accountId` int NOT NULL,
	`platform` enum('messenger','instagram','x','linkedin','youtube') NOT NULL,
	`channelType` enum('message','comment') NOT NULL,
	`direction` enum('inbound','outbound','system') NOT NULL DEFAULT 'inbound',
	`externalItemId` varchar(255) NOT NULL,
	`authorExternalId` varchar(255),
	`authorName` varchar(255),
	`authorAvatarUrl` varchar(500),
	`content` text,
	`mediaUrl` varchar(500),
	`parentExternalId` varchar(255),
	`externalPublishedAt` timestamp,
	`isRead` boolean NOT NULL DEFAULT false,
	`status` enum('received','sent','pending','failed','deleted') NOT NULL DEFAULT 'received',
	`rawPayload` text,
	`sentByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_inbox_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_inbox_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`platform` enum('messenger','instagram','x','linkedin','youtube') NOT NULL,
	`channelType` enum('message','comment') NOT NULL,
	`externalThreadId` varchar(255) NOT NULL,
	`title` varchar(255),
	`participantExternalId` varchar(255),
	`participantName` varchar(255),
	`participantAvatarUrl` varchar(500),
	`preview` text,
	`postUrl` varchar(500),
	`unreadCount` int NOT NULL DEFAULT 0,
	`isRead` boolean NOT NULL DEFAULT false,
	`isArchived` boolean NOT NULL DEFAULT false,
	`isStarred` boolean NOT NULL DEFAULT false,
	`assignedToUserId` int,
	`lastActivityAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_inbox_threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `social_inbox_items` ADD CONSTRAINT `social_inbox_items_threadId_social_inbox_threads_id_fk` FOREIGN KEY (`threadId`) REFERENCES `social_inbox_threads`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_inbox_items` ADD CONSTRAINT `social_inbox_items_accountId_social_inbox_accounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `social_inbox_accounts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_inbox_items` ADD CONSTRAINT `social_inbox_items_sentByUserId_users_id_fk` FOREIGN KEY (`sentByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_inbox_threads` ADD CONSTRAINT `social_inbox_threads_accountId_social_inbox_accounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `social_inbox_accounts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_inbox_threads` ADD CONSTRAINT `social_inbox_threads_assignedToUserId_users_id_fk` FOREIGN KEY (`assignedToUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `socialInboxAccounts_platform_idx` ON `social_inbox_accounts` (`platform`);--> statement-breakpoint
CREATE INDEX `socialInboxAccounts_status_idx` ON `social_inbox_accounts` (`status`);--> statement-breakpoint
CREATE INDEX `socialInboxAccounts_externalAccount_idx` ON `social_inbox_accounts` (`platform`,`externalAccountId`);--> statement-breakpoint
CREATE INDEX `socialInboxItems_thread_idx` ON `social_inbox_items` (`threadId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `socialInboxItems_account_idx` ON `social_inbox_items` (`accountId`);--> statement-breakpoint
CREATE INDEX `socialInboxItems_platformChannel_idx` ON `social_inbox_items` (`platform`,`channelType`);--> statement-breakpoint
CREATE INDEX `socialInboxItems_externalItem_idx` ON `social_inbox_items` (`platform`,`externalItemId`);--> statement-breakpoint
CREATE INDEX `socialInboxItems_status_idx` ON `social_inbox_items` (`status`);--> statement-breakpoint
CREATE INDEX `socialInboxThreads_account_idx` ON `social_inbox_threads` (`accountId`);--> statement-breakpoint
CREATE INDEX `socialInboxThreads_platformChannel_idx` ON `social_inbox_threads` (`platform`,`channelType`);--> statement-breakpoint
CREATE INDEX `socialInboxThreads_externalThread_idx` ON `social_inbox_threads` (`platform`,`externalThreadId`);--> statement-breakpoint
CREATE INDEX `socialInboxThreads_activity_idx` ON `social_inbox_threads` (`lastActivityAt`);--> statement-breakpoint
CREATE INDEX `socialInboxThreads_assignedUser_idx` ON `social_inbox_threads` (`assignedToUserId`);