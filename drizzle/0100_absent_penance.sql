CREATE TABLE `integrationAlertSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enabled` enum('yes','no') NOT NULL DEFAULT 'yes',
	`leadTimeHours` int NOT NULL DEFAULT 72,
	`scheduleCronTaskUid` varchar(65),
	`lastRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrationAlertSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('approval_requested','approval_approved','approval_rejected','content_updated','content_deleted','content_published','booking_pending','booking_confirmed','booking_status_changed','message_received','comment_received','conversation_assigned','comment_assigned','task_assigned','task_due','task_overdue','lead_created','lead_status_changed','connection_error','authorization_expiring','campaign_review','integration_status','privacy_update','security','system') NOT NULL;--> statement-breakpoint
ALTER TABLE `integration_connections` ADD `authorizationExpiryNotifiedAt` timestamp;--> statement-breakpoint
CREATE INDEX `integration_alert_schedule_task_uid_idx` ON `integrationAlertSchedules` (`scheduleCronTaskUid`);