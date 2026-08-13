-- Migration 0068: Update contentAuditLog entityType enum
-- Migration 0068: تحديث enum entityType في جدول contentAuditLog

-- إضافة القيم الجديدة إلى enum entityType
ALTER TABLE contentAuditLog MODIFY COLUMN entityType ENUM('text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton');
