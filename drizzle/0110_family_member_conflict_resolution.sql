ALTER TABLE `patients` DROP INDEX `patients_phone_unique`;--> statement-breakpoint
CREATE INDEX `idx_patients_phone_name` ON `patients` (`phone`, `fullName`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `patientRelationships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `primaryPatientId` int NOT NULL,
  `relatedPatientId` int NOT NULL,
  `relationship` enum('self','father','mother','son','daughter','husband','wife','brother','sister','grandfather','grandmother','other') NOT NULL DEFAULT 'other',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_rel_primary_idx` (`primaryPatientId`),
  KEY `patient_rel_related_idx` (`relatedPatientId`),
  UNIQUE KEY `patient_rel_unique_idx` (`primaryPatientId`, `relatedPatientId`)
);
