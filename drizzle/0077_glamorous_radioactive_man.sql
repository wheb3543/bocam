CREATE TABLE `meta_integration_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` varchar(255),
	`facebookPageId` varchar(255),
	`instagramAccountId` varchar(255),
	`appSecretEncrypted` text,
	`verifyTokenEncrypted` text,
	`pageAccessTokenEncrypted` text,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meta_integration_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `meta_integration_settings` ADD CONSTRAINT `meta_integration_settings_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;