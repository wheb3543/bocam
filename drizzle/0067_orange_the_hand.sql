ALTER TABLE `contentAuditLog` MODIFY COLUMN `entityType` enum('text','image','color','seo','page','section','sectionButton');--> statement-breakpoint
ALTER TABLE `sections` ADD `settings` text;