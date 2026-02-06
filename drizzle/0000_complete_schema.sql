-- Complete schema creation for SGH CRM Portal

CREATE TABLE `users` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `openId` varchar(64),
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin','manager','staff','viewer') NOT NULL DEFAULT 'user',
  `isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp
);

CREATE TABLE `campaigns` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text,
  `startDate` timestamp,
  `endDate` timestamp,
  `isActive` boolean NOT NULL DEFAULT true,
  `metaPixelId` varchar(100),
  `metaAccessToken` text,
  `whatsappEnabled` boolean NOT NULL DEFAULT false,
  `whatsappWelcomeMessage` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `leads` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `campaignId` int NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(320),
  `status` enum('new','contacted','booked','not_interested','no_answer') NOT NULL DEFAULT 'new',
  `source` varchar(100),
  `utmSource` varchar(100),
  `utmMedium` varchar(100),
  `utmCampaign` varchar(100),
  `utmContent` varchar(100),
  `notes` text,
  `emailSent` boolean NOT NULL DEFAULT false,
  `whatsappSent` boolean NOT NULL DEFAULT false,
  `bookingConfirmationSent` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `leadStatusHistory` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `leadId` int NOT NULL,
  `userId` int,
  `oldStatus` varchar(50),
  `newStatus` varchar(50) NOT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `settings` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `key` varchar(100) NOT NULL UNIQUE,
  `value` text,
  `description` text,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `doctors` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `specialization` varchar(255),
  `phone` varchar(20),
  `email` varchar(320),
  `bio` text,
  `image` varchar(500),
  `experience` int,
  `qualifications` text,
  `availability` text,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `appointments` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `leadId` int NOT NULL,
  `doctorId` int,
  `appointmentDate` timestamp,
  `appointmentTime` varchar(50),
  `status` enum('scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
  `notes` text,
  `confirmationSent` boolean NOT NULL DEFAULT false,
  `reminderSent` boolean NOT NULL DEFAULT false,
  `source` varchar(100),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `accessRequests` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int,
  `requestType` varchar(100),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reason` text,
  `requestedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `respondedAt` timestamp,
  `respondedBy` int,
  `response` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `camps` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
  `location` varchar(255),
  `startDate` timestamp,
  `endDate` timestamp,
  `capacity` int,
  `registeredCount` int DEFAULT 0,
  `image` varchar(500),
  `freeOffers` text,
  `discountedOffers` text,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `campRegistrations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `campId` int NOT NULL,
  `leadId` int NOT NULL,
  `registrationDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('registered','attended','cancelled','no_show') NOT NULL DEFAULT 'registered',
  `notes` text,
  `attendanceConfirmed` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `offers` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
  `discountPercentage` int,
  `discountAmount` decimal(10,2),
  `originalPrice` decimal(10,2),
  `finalPrice` decimal(10,2),
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `offerLeads` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `offerId` int NOT NULL,
  `leadId` int NOT NULL,
  `status` enum('sent','viewed','accepted','rejected','expired') NOT NULL DEFAULT 'sent',
  `sentDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `viewedDate` timestamp,
  `responseDate` timestamp,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
