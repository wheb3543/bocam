-- Migration 0069: Add settings column to sections table
-- Migration 0069: إضافة عمود settings إلى جدول sections

-- إضافة عمود settings لتخزين الإعدادات المخصصة لكل نوع قسم
ALTER TABLE sections ADD COLUMN settings TEXT;
