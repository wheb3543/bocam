CREATE TABLE `notificationDigestSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`deliveryHour` int NOT NULL DEFAULT 9,
	`timezone` varchar(64) NOT NULL DEFAULT 'Asia/Aden',
	`scheduleCronTaskUid` varchar(65),
	`lastDigestDate` varchar(10),
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationDigestSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('approval_requested','approval_approved','approval_rejected','content_updated','content_deleted','content_published','booking_pending','booking_confirmed','booking_status_changed','campaign_review','integration_status','privacy_update','security','system') NOT NULL;--> statement-breakpoint
CREATE INDEX `notificationDigestSchedules_taskUid_idx` ON `notificationDigestSchedules` (`scheduleCronTaskUid`);