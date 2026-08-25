CREATE TABLE `taskReminderSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enabled` enum('yes','no') NOT NULL DEFAULT 'yes',
	`leadTimeHours` int NOT NULL DEFAULT 24,
	`scheduleCronTaskUid` varchar(65),
	`lastRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taskReminderSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `followUpTasks` ADD `dueReminderSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `followUpTasks` ADD `overdueReminderSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `tasks` ADD `dueReminderSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `tasks` ADD `overdueReminderSentAt` timestamp;--> statement-breakpoint
CREATE INDEX `task_reminder_schedule_task_uid_idx` ON `taskReminderSchedules` (`scheduleCronTaskUid`);