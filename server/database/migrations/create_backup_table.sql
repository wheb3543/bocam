-- Create backup table for tracking backup operations
CREATE TABLE IF NOT EXISTS backup (
  id INT AUTO_INCREMENT PRIMARY KEY,
  backup_name VARCHAR(255) NOT NULL,
  backup_type ENUM('manual', 'daily', 'weekly', 'monthly') NOT NULL DEFAULT 'manual',
  backup_path VARCHAR(512) NOT NULL,
  backup_size BIGINT NOT NULL,
  backup_status ENUM('pending', 'in_progress', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  backup_location ENUM('local', 'cloud', 'both') NOT NULL DEFAULT 'local',
  cloud_provider VARCHAR(50) NULL,
  cloud_path VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  error_message TEXT NULL,
  metadata JSON NULL,
  INDEX idx_backup_type (backup_type),
  INDEX idx_backup_status (backup_status),
  INDEX idx_created_at (created_at),
  INDEX idx_backup_location (backup_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create backup_files table for tracking files in each backup
CREATE TABLE IF NOT EXISTS backup_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  backup_id INT NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_size BIGINT NOT NULL,
  file_hash VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (backup_id) REFERENCES backup(id) ON DELETE CASCADE,
  INDEX idx_backup_id (backup_id),
  INDEX idx_file_path (file_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create backup_schedule table for automated backup schedules
CREATE TABLE IF NOT EXISTS backup_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_name VARCHAR(255) NOT NULL,
  schedule_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
  schedule_cron VARCHAR(100) NOT NULL,
  backup_type ENUM('full', 'incremental') NOT NULL DEFAULT 'full',
  backup_location ENUM('local', 'cloud', 'both') NOT NULL DEFAULT 'local',
  retention_days INT NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_run TIMESTAMP NULL,
  next_run TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_schedule_type (schedule_type),
  INDEX idx_is_active (is_active),
  INDEX idx_next_run (next_run)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default backup schedules
INSERT INTO backup_schedule (schedule_name, schedule_type, schedule_cron, backup_type, backup_location, retention_days, is_active, next_run) VALUES
('Daily Backup', 'daily', '0 2 * * *', 'full', 'both', 30, TRUE, DATE_ADD(NOW(), INTERVAL 1 DAY)),
('Weekly Backup', 'weekly', '0 2 * * 0', 'full', 'both', 90, TRUE, DATE_ADD(NOW(), INTERVAL 7 DAY)),
('Monthly Backup', 'monthly', '0 2 1 * *', 'full', 'both', 365, TRUE, DATE_ADD(NOW(), INTERVAL 1 MONTH))
ON DUPLICATE KEY UPDATE schedule_name=VALUES(schedule_name);
