-- جدول سجل النشاطات
-- يستخدم لتتبع جميع العمليات المهمة في النظام

CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id VARCHAR(100) NULL,
  description TEXT NULL,
  metadata JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجل التحديثات
-- يستخدم لتتبع عمليات التحديث

CREATE TABLE IF NOT EXISTS update_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  previous_version VARCHAR(50) NULL,
  update_type ENUM('manual', 'automatic', 'mandatory') NOT NULL,
  status ENUM('pending', 'downloading', 'installing', 'completed', 'failed', 'rolling_back') NOT NULL,
  progress INT DEFAULT 0,
  download_path VARCHAR(255) NULL,
  backup_path VARCHAR(255) NULL,
  error_message TEXT NULL,
  release_notes TEXT NULL,
  started_by INT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_version (version),
  INDEX idx_status (status),
  INDEX idx_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجل النسخ الاحتياطية
-- يستخدم لتتبع عمليات النسخ الاحتياطي

CREATE TABLE IF NOT EXISTS backup_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  backup_type ENUM('daily', 'weekly', 'manual') NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'failed') NOT NULL,
  database_size BIGINT NULL,
  files_size BIGINT NULL,
  total_size BIGINT NULL,
  backup_path VARCHAR(255) NULL,
  cloud_provider VARCHAR(50) NULL,
  cloud_path VARCHAR(255) NULL,
  retention_days INT DEFAULT 30,
  error_message TEXT NULL,
  started_by INT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  INDEX idx_status (status),
  INDEX idx_backup_type (backup_type),
  INDEX idx_started_at (started_at),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول إشعارات النظام
-- يستخدم لإدارة إشعارات النظام

CREATE TABLE IF NOT EXISTS system_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  action_url VARCHAR(255) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
