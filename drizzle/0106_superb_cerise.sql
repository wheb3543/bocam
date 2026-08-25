CREATE TABLE `roleDefinitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`baseRole` enum('user','admin','manager','staff','viewer','team_leader') NOT NULL,
	`permissions` text NOT NULL,
	`isSystem` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roleDefinitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `roleDefinitions_key_unique` UNIQUE(`key`),
	CONSTRAINT `role_definitions_key_idx` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `userRoleAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleDefinitionId` int NOT NULL,
	`assignedBy` int,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userRoleAssignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `userRoleAssignments_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `userRoleAssignments` ADD CONSTRAINT `userRoleAssignments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userRoleAssignments` ADD CONSTRAINT `userRoleAssignments_roleDefinitionId_roleDefinitions_id_fk` FOREIGN KEY (`roleDefinitionId`) REFERENCES `roleDefinitions`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userRoleAssignments` ADD CONSTRAINT `userRoleAssignments_assignedBy_users_id_fk` FOREIGN KEY (`assignedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `role_definitions_active_idx` ON `roleDefinitions` (`isActive`);--> statement-breakpoint
CREATE INDEX `user_role_assignments_role_idx` ON `userRoleAssignments` (`roleDefinitionId`);