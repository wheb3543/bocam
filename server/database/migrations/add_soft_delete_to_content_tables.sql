/**
 * Add Soft Delete to Content Tables Migration
 * إضافة الحذف الناعم للجداول الرئيسية للمحتوى
 * 
 * يضيف حقل deletedAt للجداول التالية:
 * - textContent
 * - images
 * - media
 * - pages
 * - sections
 * - sectionButtons
 */

-- Add deletedAt column to textContent table
ALTER TABLE textContent ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL COMMENT 'تاريخ الحذف الناعم' AFTER publishedAt;

-- Add deletedAt column to images table
ALTER TABLE images ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL COMMENT 'تاريخ الحذف الناعم' AFTER publishedAt;

-- Add deletedAt column to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL COMMENT 'تاريخ الحذف الناعم' AFTER publishedAt;

-- Add deletedAt column to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL COMMENT 'تاريخ الحذف الناعم' AFTER publishedAt;

-- Add deletedAt column to sections table
ALTER TABLE sections ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL COMMENT 'تاريخ الحذف الناعم' AFTER publishedAt;

-- Add deletedAt column to sectionButtons table
ALTER TABLE sectionButtons ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL COMMENT 'تاريخ الحذف الناعم' AFTER isActive;

-- Create indexes after adding columns
CREATE INDEX IF NOT EXISTS textContent_deletedAt_idx ON textContent(deletedAt);
CREATE INDEX IF NOT EXISTS images_deletedAt_idx ON images(deletedAt);
CREATE INDEX IF NOT EXISTS media_deletedAt_idx ON media(deletedAt);
CREATE INDEX IF NOT EXISTS pages_deletedAt_idx ON pages(deletedAt);
CREATE INDEX IF NOT EXISTS sections_deletedAt_idx ON sections(deletedAt);
