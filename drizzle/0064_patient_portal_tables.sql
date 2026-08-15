CREATE TABLE IF NOT EXISTS `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `address` text,
  `age` int DEFAULT NULL,
  `gender` enum('male','female') NOT NULL,
  `email` varchar(320) DEFAULT NULL,
  `isActive` boolean NOT NULL DEFAULT true,
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patients_phone_unique` (`phone`),
  KEY `patients_phone_idx` (`phone`)
);

CREATE TABLE IF NOT EXISTS `patientOtps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `isUsed` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `patientOtps_phone_idx` (`phone`)
);

CREATE TABLE IF NOT EXISTS `patientResults` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patientId` int NOT NULL,
  `resultType` enum('lab','radiology','report') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `fileUrl` varchar(500) DEFAULT NULL,
  `doctorName` varchar(255) DEFAULT NULL,
  `resultDate` timestamp NULL DEFAULT NULL,
  `status` enum('pending','ready','delivered') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patientResults_patient_idx` (`patientId`)
);
