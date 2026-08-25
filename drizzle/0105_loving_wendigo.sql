CREATE TABLE `operationalAlertStates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operationKey` varchar(80) NOT NULL,
	`status` enum('healthy','degraded') NOT NULL DEFAULT 'healthy',
	`lastFailureAt` timestamp,
	`lastRecoveryAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operationalAlertStates_id` PRIMARY KEY(`id`),
	CONSTRAINT `operationalAlertStates_operationKey_unique` UNIQUE(`operationKey`)
);
--> statement-breakpoint
CREATE TABLE `updateCheckSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enabled` enum('yes','no') NOT NULL DEFAULT 'yes',
	`scheduleCronTaskUid` varchar(65),
	`lastRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `updateCheckSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `operational_alert_states_operation_key_idx` ON `operationalAlertStates` (`operationKey`);--> statement-breakpoint
CREATE INDEX `update_check_schedule_task_uid_idx` ON `updateCheckSchedules` (`scheduleCronTaskUid`);