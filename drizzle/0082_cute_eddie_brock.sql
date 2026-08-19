CREATE TABLE `integration_audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('meta','whatsapp','x','linkedin','youtube','tiktok') NOT NULL,
	`connectionId` int,
	`assetId` int,
	`action` varchar(120) NOT NULL,
	`status` enum('started','succeeded','failed','skipped') NOT NULL,
	`correlationId` varchar(255),
	`summary` text,
	`errorMessage` text,
	`performedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integration_audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_connection_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`tokenType` enum('access','refresh','business','system') NOT NULL,
	`tokenEncrypted` text NOT NULL,
	`tokenExpiresAt` timestamp,
	`scopes` text,
	`encryptionKeyVersion` varchar(32) NOT NULL DEFAULT 'v1',
	`lastRefreshedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_connection_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `integrationConnectionTokens_connection_token_unique` UNIQUE(`connectionId`,`tokenType`)
);
--> statement-breakpoint
CREATE TABLE `integration_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('meta','whatsapp','x','linkedin','youtube','tiktok') NOT NULL,
	`connectionType` enum('meta_business','whatsapp_embedded_signup','social_oauth') NOT NULL,
	`status` enum('draft','authorization_pending','connected','reauthorization_required','expired','revoked','error','disconnected') NOT NULL DEFAULT 'draft',
	`displayName` varchar(255),
	`externalBusinessId` varchar(255),
	`grantedScopes` text,
	`authorizationMethod` varchar(80),
	`expiresAt` timestamp,
	`lastValidatedAt` timestamp,
	`lastError` text,
	`disconnectedAt` timestamp,
	`initiatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_delivery_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destinationId` int NOT NULL,
	`connectionId` int,
	`status` enum('queued','processing','succeeded','failed','cancelled') NOT NULL DEFAULT 'queued',
	`runAfter` timestamp NOT NULL DEFAULT (now()),
	`leasedUntil` timestamp,
	`attemptCount` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 5,
	`lastError` text,
	`providerRequestId` varchar(255),
	`idempotencyKey` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_delivery_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `integrationDeliveryJobs_destination_unique` UNIQUE(`destinationId`),
	CONSTRAINT `integrationDeliveryJobs_idempotency_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `integration_external_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`provider` enum('meta','whatsapp','x','linkedin','youtube','tiktok') NOT NULL,
	`assetType` enum('business_portfolio','page','instagram_account','whatsapp_business_account','whatsapp_phone_number','ad_account','pixel','dataset','profile','organization','channel') NOT NULL,
	`externalAssetId` varchar(255) NOT NULL,
	`parentExternalAssetId` varchar(255),
	`displayName` varchar(255),
	`avatarUrl` varchar(500),
	`capabilities` text,
	`metadata` text,
	`isSelected` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_external_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `integrationExternalAssets_provider_asset_unique` UNIQUE(`provider`,`externalAssetId`)
);
--> statement-breakpoint
CREATE TABLE `integration_oauth_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('meta','whatsapp','x','linkedin','youtube','tiktok') NOT NULL,
	`flow` enum('meta_business','whatsapp_embedded_signup','social_oauth') NOT NULL,
	`stateHash` varchar(128) NOT NULL,
	`codeVerifierEncrypted` text,
	`redirectUri` varchar(500) NOT NULL,
	`requestedScopes` text,
	`initiatedByUserId` int NOT NULL,
	`connectionId` int,
	`expiresAt` timestamp NOT NULL,
	`consumedAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integration_oauth_states_id` PRIMARY KEY(`id`),
	CONSTRAINT `integrationOauthStates_state_unique` UNIQUE(`stateHash`)
);
--> statement-breakpoint
CREATE TABLE `integration_webhook_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`assetId` int,
	`provider` enum('meta','whatsapp','x','linkedin','youtube','tiktok') NOT NULL,
	`callbackPath` varchar(500) NOT NULL,
	`subscribedFields` text,
	`externalSubscriptionId` varchar(255),
	`status` enum('pending','active','failed','disabled') NOT NULL DEFAULT 'pending',
	`verifiedAt` timestamp,
	`lastEventAt` timestamp,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_webhook_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `integration_audit_events` ADD CONSTRAINT `iae_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_audit_events` ADD CONSTRAINT `iae_asset_fk` FOREIGN KEY (`assetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_audit_events` ADD CONSTRAINT `iae_actor_fk` FOREIGN KEY (`performedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_connection_tokens` ADD CONSTRAINT `ict_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_connections` ADD CONSTRAINT `ic_actor_fk` FOREIGN KEY (`initiatedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_delivery_jobs` ADD CONSTRAINT `idj_dest_fk` FOREIGN KEY (`destinationId`) REFERENCES `social_publish_destinations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_delivery_jobs` ADD CONSTRAINT `idj_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_external_assets` ADD CONSTRAINT `ixa_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_oauth_states` ADD CONSTRAINT `ios_actor_fk` FOREIGN KEY (`initiatedByUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_oauth_states` ADD CONSTRAINT `ios_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_webhook_subscriptions` ADD CONSTRAINT `iws_conn_fk` FOREIGN KEY (`connectionId`) REFERENCES `integration_connections`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `integration_webhook_subscriptions` ADD CONSTRAINT `iws_asset_fk` FOREIGN KEY (`assetId`) REFERENCES `integration_external_assets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `integrationAuditEvents_provider_action_idx` ON `integration_audit_events` (`provider`,`action`);--> statement-breakpoint
CREATE INDEX `integrationAuditEvents_connection_idx` ON `integration_audit_events` (`connectionId`);--> statement-breakpoint
CREATE INDEX `integrationAuditEvents_created_idx` ON `integration_audit_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `integrationConnectionTokens_expiry_idx` ON `integration_connection_tokens` (`tokenExpiresAt`);--> statement-breakpoint
CREATE INDEX `integrationConnections_provider_status_idx` ON `integration_connections` (`provider`,`status`);--> statement-breakpoint
CREATE INDEX `integrationConnections_initiator_idx` ON `integration_connections` (`initiatedByUserId`);--> statement-breakpoint
CREATE INDEX `integrationConnections_external_business_idx` ON `integration_connections` (`provider`,`externalBusinessId`);--> statement-breakpoint
CREATE INDEX `integrationDeliveryJobs_dispatch_idx` ON `integration_delivery_jobs` (`status`,`runAfter`);--> statement-breakpoint
CREATE INDEX `integrationDeliveryJobs_lease_idx` ON `integration_delivery_jobs` (`leasedUntil`);--> statement-breakpoint
CREATE INDEX `integrationExternalAssets_connection_type_idx` ON `integration_external_assets` (`connectionId`,`assetType`);--> statement-breakpoint
CREATE INDEX `integrationExternalAssets_selected_idx` ON `integration_external_assets` (`isSelected`);--> statement-breakpoint
CREATE INDEX `integrationOauthStates_expiration_idx` ON `integration_oauth_states` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `integrationOauthStates_actor_idx` ON `integration_oauth_states` (`initiatedByUserId`);--> statement-breakpoint
CREATE INDEX `integrationWebhookSubscriptions_connection_asset_idx` ON `integration_webhook_subscriptions` (`connectionId`,`assetId`);--> statement-breakpoint
CREATE INDEX `integrationWebhookSubscriptions_status_idx` ON `integration_webhook_subscriptions` (`status`);
