CREATE TABLE `social_platform_integration_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('x','linkedin','youtube','tiktok') NOT NULL,
	`clientId` varchar(255),
	`clientSecretEncrypted` text,
	`requestedScopes` text,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`lastError` text,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_platform_integration_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `socialPlatformIntegrations_platform_unique` UNIQUE(`platform`)
);
--> statement-breakpoint
ALTER TABLE `social_platform_integration_settings` ADD CONSTRAINT `social_platform_integration_settings_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;