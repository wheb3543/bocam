ALTER TABLE `notifications` MODIFY COLUMN `type` enum('approval_requested','approval_approved','approval_rejected','content_updated','content_deleted','content_published','booking_pending','booking_confirmed','campaign_review','integration_status','privacy_update','security','system') NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `source` enum('content','bookings','campaigns','integrations','privacy','security','system','manual') DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `entityType` varchar(100);--> statement-breakpoint
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `entityId` varchar(100);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `notifications_source_idx` ON `notifications` (`source`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `notifications_userIdSource_idx` ON `notifications` (`userId`,`source`);
