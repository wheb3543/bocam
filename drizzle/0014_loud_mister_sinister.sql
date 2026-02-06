ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','manager','staff','viewer') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `appointments` ADD `source` varchar(100);--> statement-breakpoint
ALTER TABLE `camps` ADD `freeOffers` text;--> statement-breakpoint
ALTER TABLE `camps` ADD `discountedOffers` text;--> statement-breakpoint
ALTER TABLE `camps` DROP COLUMN `campOffers`;