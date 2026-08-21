CREATE TABLE IF NOT EXISTS `contentApprovals` (
  `id` int AUTO_INCREMENT NOT NULL,
  `entityType` varchar(50) NOT NULL,
  `entityId` int NOT NULL,
  `entityTypeVersion` int NOT NULL DEFAULT 0,
  `requestedBy` int NOT NULL,
  `requestedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `assignedReviewerId` int,
  `approvedBy` int,
  `approvedAt` timestamp,
  `rejectedBy` int,
  `rejectedAt` timestamp,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `rejectionReason` text,
  `changes` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `contentApprovals_id` PRIMARY KEY(`id`),
  KEY `contentApprovals_entityTypeEntityId_idx` (`entityType`,`entityId`),
  KEY `contentApprovals_status_idx` (`status`),
  KEY `contentApprovals_requestedBy_idx` (`requestedBy`),
  KEY `contentApprovals_assignedReviewer_idx` (`assignedReviewerId`),
  KEY `contentApprovals_approvedBy_idx` (`approvedBy`),
  KEY `contentApprovals_rejectedBy_idx` (`rejectedBy`),
  KEY `contentApprovals_requestedAt_idx` (`requestedAt`),
  CONSTRAINT `contentApprovals_requestedBy_users_id_fk` FOREIGN KEY (`requestedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade,
  CONSTRAINT `contentApprovals_assignedReviewerId_users_id_fk` FOREIGN KEY (`assignedReviewerId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade,
  CONSTRAINT `contentApprovals_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade,
  CONSTRAINT `contentApprovals_rejectedBy_users_id_fk` FOREIGN KEY (`rejectedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade
) ENGINE=InnoDB;--> statement-breakpoint
SET @needs_assigned_reviewer_column = (
  SELECT COUNT(*) = 0
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'contentApprovals'
    AND COLUMN_NAME = 'assignedReviewerId'
);--> statement-breakpoint
SET @assigned_reviewer_column_sql = IF(
  @needs_assigned_reviewer_column,
  'ALTER TABLE `contentApprovals` ADD COLUMN `assignedReviewerId` int NULL',
  'SELECT 1'
);--> statement-breakpoint
PREPARE assigned_reviewer_column_stmt FROM @assigned_reviewer_column_sql;--> statement-breakpoint
EXECUTE assigned_reviewer_column_stmt;--> statement-breakpoint
DEALLOCATE PREPARE assigned_reviewer_column_stmt;--> statement-breakpoint
SET @needs_assigned_reviewer_fk = (
  SELECT COUNT(*) = 0
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'contentApprovals'
    AND CONSTRAINT_NAME = 'contentApprovals_assignedReviewerId_users_id_fk'
);--> statement-breakpoint
SET @assigned_reviewer_fk_sql = IF(
  @needs_assigned_reviewer_fk,
  'ALTER TABLE `contentApprovals` ADD CONSTRAINT `contentApprovals_assignedReviewerId_users_id_fk` FOREIGN KEY (`assignedReviewerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);--> statement-breakpoint
PREPARE assigned_reviewer_fk_stmt FROM @assigned_reviewer_fk_sql;--> statement-breakpoint
EXECUTE assigned_reviewer_fk_stmt;--> statement-breakpoint
DEALLOCATE PREPARE assigned_reviewer_fk_stmt;
