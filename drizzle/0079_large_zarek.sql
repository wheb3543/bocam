ALTER TABLE `social_inbox_threads` ADD `isFollowUpRequired` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `social_inbox_threads` ADD `isFollowUpRequired` boolean NOT NULL DEFAULT false;
CREATE INDEX `socialInboxThreads_followUp_idx` ON `social_inbox_threads` (`isFollowUpRequired`);
