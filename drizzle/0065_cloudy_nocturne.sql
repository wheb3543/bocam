CREATE TABLE `colorScheme` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` varchar(50) NOT NULL,
	`type` enum('primary','secondary','accent','background','text','border'),
	`shade` varchar(20),
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `colorScheme_id` PRIMARY KEY(`id`),
	CONSTRAINT `colorScheme_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `contentAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('text','image','color','seo'),
	`entityId` int,
	`action` enum('create','update','delete'),
	`oldValue` text,
	`newValue` text,
	`userId` int,
	`ipAddress` varchar(50),
	`userAgent` text,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('text','image','color','seo') NOT NULL,
	`entityId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`data` text NOT NULL,
	`userId` int,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`alt` text,
	`section` varchar(100),
	`width` int,
	`height` int,
	`format` varchar(10),
	`size` int,
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `images_id` PRIMARY KEY(`id`),
	CONSTRAINT `images_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `seoSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageKey` varchar(255) NOT NULL,
	`language` varchar(10) DEFAULT 'ar',
	`title` varchar(255),
	`description` text,
	`keywords` text,
	`ogTitle` varchar(255),
	`ogDescription` text,
	`ogImage` varchar(500),
	`canonicalUrl` varchar(500),
	`robots` text,
	`structuredData` text,
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seoSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `seoSettings_pageKey_unique` UNIQUE(`pageKey`)
);
--> statement-breakpoint
CREATE TABLE `textContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'ar',
	`content` text NOT NULL,
	`section` varchar(100),
	`type` enum('text','title','subtitle','description','button','link'),
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `textContent_id` PRIMARY KEY(`id`),
	CONSTRAINT `textContent_key_unique` UNIQUE(`key`)
);
