CREATE TABLE `cmsTrashRetentionPolicies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyKey` varchar(50) NOT NULL,
	`retentionDays` int NOT NULL DEFAULT 30,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`scheduleCronTaskUid` varchar(65),
	`lastPurgeAt` timestamp,
	`lastPurgeSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cmsTrashRetentionPolicies_id` PRIMARY KEY(`id`),
	CONSTRAINT `cmsTrashRetentionPolicies_policyKey_unique` UNIQUE(`policyKey`)
);
--> statement-breakpoint
CREATE INDEX `cmsTrashRetentionPolicies_scheduleCronTaskUid_idx` ON `cmsTrashRetentionPolicies` (`scheduleCronTaskUid`);