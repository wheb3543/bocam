ALTER TABLE `doctorSchedules` ADD `isMorningActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `doctorSchedules` ADD `morningStartTime` varchar(10) DEFAULT '09:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `doctorSchedules` ADD `morningEndTime` varchar(10) DEFAULT '13:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `doctorSchedules` ADD `isEveningActive` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `doctorSchedules` ADD `eveningStartTime` varchar(10) DEFAULT '16:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `doctorSchedules` ADD `eveningEndTime` varchar(10) DEFAULT '20:00' NOT NULL;