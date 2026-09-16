CREATE TABLE `broadcast_recipient_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`broadcastId` int NOT NULL,
	`recipientId` int NOT NULL,
	`whatsappMessageId` varchar(255),
	`status` enum('sent','delivered','read','failed') NOT NULL DEFAULT 'sent',
	`errorCode` varchar(50),
	`errorMessage` text,
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcast_recipient_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`broadcastId` int NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`fullName` varchar(255),
	`email` varchar(320),
	`recipientType` enum('appointment','camp_registration','offer_lead','lead') NOT NULL,
	`recipientId` int NOT NULL,
	`sourceId` int,
	`sourceType` enum('appointment','camp_registration','offer_lead','lead') NOT NULL,
	`status` enum('pending','sent','delivered','read','failed') NOT NULL DEFAULT 'pending',
	`templateVariables` text,
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`readAt` timestamp,
	`errorInfo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcast_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exportType` enum('vcf','csv','google_sync') NOT NULL,
	`filterCriteria` text,
	`totalContacts` int NOT NULL DEFAULT 0,
	`exportedContacts` int NOT NULL DEFAULT 0,
	`failedContacts` int NOT NULL DEFAULT 0,
	`fileUrl` varchar(500),
	`fileKey` varchar(500),
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorInfo` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `contact_exports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`syncType` enum('export_to_google','import_from_google','sync_bidirectional') NOT NULL,
	`totalContacts` int NOT NULL DEFAULT 0,
	`syncedContacts` int NOT NULL DEFAULT 0,
	`failedContacts` int NOT NULL DEFAULT 0,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorInfo` text,
	`googleAccountEmail` varchar(320),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `contact_sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`slug` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `doctorScheduleExceptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`exceptionDate` varchar(20) NOT NULL,
	`isOff` boolean NOT NULL DEFAULT true,
	`customStartTime` varchar(10),
	`customEndTime` varchar(10),
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctorScheduleExceptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctorSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`endTime` varchar(10) NOT NULL,
	`slotDurationMinutes` int NOT NULL DEFAULT 30,
	`maxCapacityPerSlot` int NOT NULL DEFAULT 1,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctorSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_flow_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`flowId` varchar(255),
	`eventName` varchar(100) NOT NULL,
	`status` varchar(100),
	`availability` varchar(100),
	`latencyMs` int,
	`errorCode` varchar(100),
	`errorMessage` varchar(1000),
	`contextMessageId` varchar(255),
	`responseKeys` text,
	`flowTokenHash` varchar(64),
	`rawPayload` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_flow_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_webhook_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deliveryKey` varchar(64) NOT NULL,
	`eventType` varchar(16) NOT NULL,
	`metaMessageId` varchar(255) NOT NULL,
	`processingStatus` varchar(16) NOT NULL DEFAULT 'processing',
	`attempts` int NOT NULL DEFAULT 1,
	`processingStartedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`lastError` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_webhook_deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsapp_webhook_deliveries_deliveryKey_unique` UNIQUE(`deliveryKey`)
);
--> statement-breakpoint
ALTER TABLE `integration_audit_events` DROP FOREIGN KEY `integration_audit_events_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `integration_audit_events` DROP FOREIGN KEY `integration_audit_events_assetId_integration_external_assets_id_fk`;
--> statement-breakpoint
ALTER TABLE `integration_connection_tokens` DROP FOREIGN KEY `integration_connection_tokens_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `integration_delivery_jobs` DROP FOREIGN KEY `integration_delivery_jobs_destinationId_social_publish_destinations_id_fk`;
--> statement-breakpoint
ALTER TABLE `integration_delivery_jobs` DROP FOREIGN KEY `integration_delivery_jobs_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `integration_external_assets` DROP FOREIGN KEY `integration_external_assets_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `integration_oauth_states` DROP FOREIGN KEY `integration_oauth_states_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `integration_webhook_subscriptions` DROP FOREIGN KEY `integration_webhook_subscriptions_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `integration_webhook_subscriptions` DROP FOREIGN KEY `integration_webhook_subscriptions_assetId_integration_external_assets_id_fk`;
--> statement-breakpoint
ALTER TABLE `meta_conversion_events` DROP FOREIGN KEY `meta_conversion_events_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `meta_conversion_events` DROP FOREIGN KEY `meta_conversion_events_datasetAssetId_integration_external_assets_id_fk`;
--> statement-breakpoint
ALTER TABLE `meta_lead_events` DROP FOREIGN KEY `meta_lead_events_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `meta_lead_forms` DROP FOREIGN KEY `meta_lead_forms_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `meta_lead_forms` DROP FOREIGN KEY `meta_lead_forms_pageAssetId_integration_external_assets_id_fk`;
--> statement-breakpoint
ALTER TABLE `social_publish_accounts` DROP FOREIGN KEY `social_publish_accounts_connectionId_integration_connections_id_fk`;
--> statement-breakpoint
ALTER TABLE `social_publish_accounts` DROP FOREIGN KEY `social_publish_accounts_integrationAssetId_integration_external_assets_id_fk`;
--> statement-breakpoint
ALTER TABLE `social_publish_attempts` DROP FOREIGN KEY `social_publish_attempts_destinationId_social_publish_destinations_id_fk`;
--> statement-breakpoint
ALTER TABLE `social_publish_destinations` DROP FOREIGN KEY `social_publish_destinations_postId_social_publish_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `social_publish_destinations` DROP FOREIGN KEY `social_publish_destinations_accountId_social_publish_accounts_id_fk`;
--> statement-breakpoint
ALTER TABLE `appointments` ADD `departmentId` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `patientId` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `leadId` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `slotStartTime` varchar(10);--> statement-breakpoint
ALTER TABLE `appointments` ADD `slotEndTime` varchar(10);--> statement-breakpoint
ALTER TABLE `doctors` ADD `departmentId` int;--> statement-breakpoint
ALTER TABLE `doctors` ADD `visitingStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `doctors` ADD `visitingEndDate` timestamp;--> statement-breakpoint
ALTER TABLE `whatsapp_broadcasts` ADD `recipientSnapshot` text;--> statement-breakpoint
ALTER TABLE `whatsapp_broadcasts` ADD `headerImageUrl` varchar(2000);--> statement-breakpoint
ALTER TABLE `whatsapp_broadcasts` ADD `scheduleCronTaskUid` varchar(65);--> statement-breakpoint
CREATE INDEX `broadcast_recipient_results_broadcastId_idx` ON `broadcast_recipient_results` (`broadcastId`);--> statement-breakpoint
CREATE INDEX `broadcast_recipient_results_status_idx` ON `broadcast_recipient_results` (`status`);--> statement-breakpoint
CREATE INDEX `broadcast_recipients_broadcastId_idx` ON `broadcast_recipients` (`broadcastId`);--> statement-breakpoint
CREATE INDEX `broadcast_recipients_phone_idx` ON `broadcast_recipients` (`phoneNumber`);--> statement-breakpoint
CREATE INDEX `broadcast_recipients_status_idx` ON `broadcast_recipients` (`status`);--> statement-breakpoint
CREATE INDEX `broadcast_recipients_type_idx` ON `broadcast_recipients` (`recipientType`);--> statement-breakpoint
CREATE INDEX `contact_exports_status_idx` ON `contact_exports` (`status`);--> statement-breakpoint
CREATE INDEX `contact_exports_createdAt_idx` ON `contact_exports` (`createdAt`);--> statement-breakpoint
CREATE INDEX `contact_sync_logs_syncType_idx` ON `contact_sync_logs` (`syncType`);--> statement-breakpoint
CREATE INDEX `contact_sync_logs_status_idx` ON `contact_sync_logs` (`status`);--> statement-breakpoint
CREATE INDEX `contact_sync_logs_createdAt_idx` ON `contact_sync_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `doctorScheduleExceptions_doctorId_idx` ON `doctorScheduleExceptions` (`doctorId`);--> statement-breakpoint
CREATE INDEX `doctorScheduleExceptions_date_idx` ON `doctorScheduleExceptions` (`exceptionDate`);--> statement-breakpoint
CREATE INDEX `doctorSchedules_doctorId_idx` ON `doctorSchedules` (`doctorId`);--> statement-breakpoint
CREATE INDEX `whatsapp_flow_events_flowCreated_idx` ON `whatsapp_flow_events` (`flowId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `whatsapp_flow_events_eventCreated_idx` ON `whatsapp_flow_events` (`eventName`,`createdAt`);--> statement-breakpoint
CREATE INDEX `whatsapp_webhook_deliveries_metaMessageId_idx` ON `whatsapp_webhook_deliveries` (`metaMessageId`);--> statement-breakpoint
CREATE INDEX `whatsapp_webhook_deliveries_statusStarted_idx` ON `whatsapp_webhook_deliveries` (`processingStatus`,`processingStartedAt`);--> statement-breakpoint
ALTER TABLE `integration_audit_events` ADD CONSTRAINT `integration_audit_events_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_audit_events` ADD CONSTRAINT `integration_audit_events_asset_fk` FOREIGN KEY (`assetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_connection_tokens` ADD CONSTRAINT `integration_connection_tokens_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_delivery_jobs` ADD CONSTRAINT `integration_delivery_jobs_destination_fk` FOREIGN KEY (`destinationId`) REFERENCES `social_publish_destinations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_delivery_jobs` ADD CONSTRAINT `integration_delivery_jobs_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_external_assets` ADD CONSTRAINT `integration_external_assets_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_oauth_states` ADD CONSTRAINT `integration_oauth_states_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_webhook_subscriptions` ADD CONSTRAINT `integration_webhook_subscriptions_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_webhook_subscriptions` ADD CONSTRAINT `integration_webhook_subscriptions_asset_fk` FOREIGN KEY (`assetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_conversion_events` ADD CONSTRAINT `meta_conversion_events_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_conversion_events` ADD CONSTRAINT `meta_conversion_events_dataset_fk` FOREIGN KEY (`datasetAssetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_lead_events` ADD CONSTRAINT `meta_lead_events_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_lead_forms` ADD CONSTRAINT `meta_lead_forms_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `meta_lead_forms` ADD CONSTRAINT `meta_lead_forms_page_asset_fk` FOREIGN KEY (`pageAssetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_accounts` ADD CONSTRAINT `social_publish_accounts_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_accounts` ADD CONSTRAINT `social_publish_accounts_asset_fk` FOREIGN KEY (`integrationAssetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_attempts` ADD CONSTRAINT `social_publish_attempts_destination_fk` FOREIGN KEY (`destinationId`) REFERENCES `social_publish_destinations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_destinations` ADD CONSTRAINT `social_publish_destinations_post_fk` FOREIGN KEY (`postId`) REFERENCES `social_publish_posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_publish_destinations` ADD CONSTRAINT `social_publish_destinations_account_fk` FOREIGN KEY (`accountId`) REFERENCES `social_publish_accounts`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `appointments_patientId_idx` ON `appointments` (`patientId`);--> statement-breakpoint
CREATE INDEX `appointments_appointmentDate_idx` ON `appointments` (`appointmentDate`);--> statement-breakpoint
CREATE INDEX `whatsapp_broadcasts_schedule_cron_task_uid_idx` ON `whatsapp_broadcasts` (`scheduleCronTaskUid`);--> statement-breakpoint
CREATE INDEX `whatsapp_broadcasts_scheduled_at_idx` ON `whatsapp_broadcasts` (`scheduledAt`);