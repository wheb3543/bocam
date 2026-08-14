/**
 * Create Notifications Table Migration
 * إنشاء جدول الإشعارات
 * 
 * يخزّن جميع الإشعارات للمستخدمين مع دعم أنواع متعددة من الإشعارات
 */

-- Create notifications table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('approval_requested', 'approval_approved', 'approval_rejected', 'content_updated', 'content_deleted', 'content_published', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  isRead ENUM('yes', 'no') DEFAULT 'no' NOT NULL,
  readAt TIMESTAMP NULL,
  actionUrl VARCHAR(500),
  actionLabel VARCHAR(100),
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium' NOT NULL,
  expiresAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  -- Foreign key to users table
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance
CREATE INDEX notifications_userId_idx ON notifications(userId);
CREATE INDEX notifications_type_idx ON notifications(type);
CREATE INDEX notifications_isRead_idx ON notifications(isRead);
CREATE INDEX notifications_priority_idx ON notifications(priority);
CREATE INDEX notifications_createdAt_idx ON notifications(createdAt);
CREATE INDEX notifications_userIdIsRead_idx ON notifications(userId, isRead);
CREATE INDEX notifications_userIdCreatedAt_idx ON notifications(userId, createdAt);
