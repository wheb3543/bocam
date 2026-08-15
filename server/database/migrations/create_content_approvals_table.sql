/**
 * Create Content Approvals Table Migration
 * إنشاء جدول موافقات المحتوى
 * 
 * هذا الجدول يخزن طلبات الموافقة على التغييرات في المحتوى
 * يسمح بعملية مراجعة وموافقة قبل نشر التغييرات
 */

CREATE TABLE IF NOT EXISTS contentApprovals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entityType VARCHAR(50) NOT NULL COMMENT 'نوع الكيان (textContent, image, media, page, section)',
  entityId INT NOT NULL COMMENT 'معرف الكيان',
  entityTypeVersion INT DEFAULT 0 NOT NULL COMMENT 'إصدار الكيان',
  requestedBy INT NOT NULL COMMENT 'معرف المستخدم الذي طلب الموافقة',
  requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'تاريخ طلب الموافقة',
  approvedBy INT NULL COMMENT 'معرف المستخدم الذي وافق',
  approvedAt TIMESTAMP NULL COMMENT 'تاريخ الموافقة',
  rejectedBy INT NULL COMMENT 'معرف المستخدم الذي رفض',
  rejectedAt TIMESTAMP NULL COMMENT 'تاريخ الرفض',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL COMMENT 'حالة الموافقة',
  rejectionReason TEXT NULL COMMENT 'سبب الرفض',
  changes TEXT NOT NULL COMMENT 'التغييرات المطلوبة (JSON)',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  -- Foreign Keys
  FOREIGN KEY (requestedBy) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (rejectedBy) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Indexes
  INDEX idx_entityType_entityId (entityType, entityId),
  INDEX idx_status (status),
  INDEX idx_requestedBy (requestedBy),
  INDEX idx_approvedBy (approvedBy),
  INDEX idx_rejectedBy (rejectedBy),
  INDEX idx_requestedAt (requestedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول موافقات المحتوى';
