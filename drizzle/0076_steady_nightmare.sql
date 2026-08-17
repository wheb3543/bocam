CREATE TABLE `social_inbox_webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('meta') NOT NULL DEFAULT 'meta',
	`platform` enum('messenger','instagram','facebook') NOT NULL,
	`accountExternalId` varchar(255) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`eventKey` varchar(512) NOT NULL,
	`rawPayload` text NOT NULL,
	`processingStatus` enum('received','processed','ignored','failed') NOT NULL DEFAULT 'received',
	`processingError` text,
	`processedAt` timestamp,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_inbox_webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `socialInboxWebhookEvents_eventKey_unique` UNIQUE(`eventKey`)
);
--> statement-breakpoint
CREATE INDEX `socialInboxWebhookEvents_account_idx` ON `social_inbox_webhook_events` (`platform`,`accountExternalId`);--> statement-breakpoint
CREATE INDEX `socialInboxWebhookEvents_status_idx` ON `social_inbox_webhook_events` (`processingStatus`);