CREATE TABLE `meta_conversion_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`datasetAssetId` int,
	`eventName` varchar(100) NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`payloadEncrypted` text NOT NULL,
	`status` enum('queued','sending','succeeded','failed','cancelled') NOT NULL DEFAULT 'queued',
	`runAfter` timestamp NOT NULL DEFAULT (now()),
	`attemptCount` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 5,
	`lastError` text,
	`responseSummary` text,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meta_conversion_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `metaConversionEvents_event_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `meta_lead_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`leadFormId` int,
	`externalLeadId` varchar(255) NOT NULL,
	`eventKey` varchar(255) NOT NULL,
	`payloadEncrypted` text,
	`status` enum('received','processing','ingested','failed','ignored') NOT NULL DEFAULT 'received',
	`crmLeadId` int,
	`lastError` text,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meta_lead_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `metaLeadEvents_external_lead_unique` UNIQUE(`externalLeadId`),
	CONSTRAINT `metaLeadEvents_event_key_unique` UNIQUE(`eventKey`)
);
--> statement-breakpoint
CREATE TABLE `meta_lead_forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`pageAssetId` int,
	`externalFormId` varchar(255) NOT NULL,
	`externalPageId` varchar(255) NOT NULL,
	`displayName` varchar(255),
	`campaignId` int,
	`fieldMapping` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meta_lead_forms_id` PRIMARY KEY(`id`),
	CONSTRAINT `metaLeadForms_external_form_unique` UNIQUE(`externalFormId`)
);
--> statement-breakpoint
ALTER TABLE `meta_conversion_events` ADD CONSTRAINT `mce_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_conversion_events` ADD CONSTRAINT `mce_asset_fk` FOREIGN KEY (`datasetAssetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_lead_events` ADD CONSTRAINT `mle_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_lead_events` ADD CONSTRAINT `mle_form_fk` FOREIGN KEY (`leadFormId`) REFERENCES `meta_lead_forms`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_lead_events` ADD CONSTRAINT `mle_lead_fk` FOREIGN KEY (`crmLeadId`) REFERENCES `leads`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_lead_forms` ADD CONSTRAINT `mlf_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_lead_forms` ADD CONSTRAINT `mlf_asset_fk` FOREIGN KEY (`pageAssetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_lead_forms` ADD CONSTRAINT `mlf_campaign_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `metaConversionEvents_dispatch_idx` ON `meta_conversion_events` (`status`,`runAfter`);--> statement-breakpoint
CREATE INDEX `metaLeadEvents_status_idx` ON `meta_lead_events` (`status`,`receivedAt`);--> statement-breakpoint
CREATE INDEX `metaLeadForms_connection_idx` ON `meta_lead_forms` (`connectionId`);
