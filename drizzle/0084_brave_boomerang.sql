ALTER TABLE `social_publish_accounts` ADD `connectionId` int;--> statement-breakpoint
ALTER TABLE `social_publish_accounts` ADD `connectionId` int;--> statement-breakpoint
ALTER TABLE `social_publish_accounts` ADD `integrationAssetId` int;--> statement-breakpoint
ALTER TABLE `social_publish_destinations` ADD `providerState` text;--> statement-breakpoint
ALTER TABLE `social_publish_accounts` ADD CONSTRAINT `sp_accounts_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_accounts` ADD CONSTRAINT `sp_accounts_asset_fk` FOREIGN KEY (`integrationAssetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `socialPublishAccounts_connection_idx` ON `social_publish_accounts` (`connectionId`);--> statement-breakpoint
CREATE INDEX `socialPublishAccounts_asset_idx` ON `social_publish_accounts` (`integrationAssetId`);
