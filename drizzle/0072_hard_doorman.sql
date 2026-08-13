CREATE TABLE `contentApprovals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`entityTypeVersion` int NOT NULL DEFAULT 0,
	`requestedBy` int NOT NULL,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`approvedBy` int,
	`approvedAt` timestamp,
	`rejectedBy` int,
	`rejectedAt` timestamp,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`changes` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentApprovals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('approval_requested','approval_approved','approval_rejected','content_updated','content_deleted','content_published','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`data` text,
	`isRead` enum('yes','no') NOT NULL DEFAULT 'no',
	`readAt` timestamp,
	`actionUrl` varchar(500),
	`actionLabel` varchar(100),
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `images` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `media` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `pages` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `sectionButtons` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `sections` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `textContent` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `contentApprovals` ADD CONSTRAINT `contentApprovals_requestedBy_users_id_fk` FOREIGN KEY (`requestedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `contentApprovals` ADD CONSTRAINT `contentApprovals_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `contentApprovals` ADD CONSTRAINT `contentApprovals_rejectedBy_users_id_fk` FOREIGN KEY (`rejectedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `contentApprovals_entityTypeEntityId_idx` ON `contentApprovals` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `contentApprovals_status_idx` ON `contentApprovals` (`status`);--> statement-breakpoint
CREATE INDEX `contentApprovals_requestedBy_idx` ON `contentApprovals` (`requestedBy`);--> statement-breakpoint
CREATE INDEX `contentApprovals_approvedBy_idx` ON `contentApprovals` (`approvedBy`);--> statement-breakpoint
CREATE INDEX `contentApprovals_rejectedBy_idx` ON `contentApprovals` (`rejectedBy`);--> statement-breakpoint
CREATE INDEX `contentApprovals_requestedAt_idx` ON `contentApprovals` (`requestedAt`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `notifications_isRead_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `notifications_priority_idx` ON `notifications` (`priority`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_userIdIsRead_idx` ON `notifications` (`userId`,`isRead`);--> statement-breakpoint
CREATE INDEX `notifications_userIdCreatedAt_idx` ON `notifications` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `images_deletedAt_idx` ON `images` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `media_deletedAt_idx` ON `media` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `pages_deletedAt_idx` ON `pages` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `sections_deletedAt_idx` ON `sections` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `textContent_deletedAt_idx` ON `textContent` (`deletedAt`);