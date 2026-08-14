/**
 * Fix Pages Table Column Order
 * إصلاح ترتيب أعمدة جدول الصفحات
 * 
 * هذا الملف يعيد ترتيب الأعمدة لتطابق schema
 */

-- إنشاء جدول مؤقت بالترتيب الصحيح
CREATE TABLE pages_new LIKE pages;

-- نسخ البيانات
INSERT INTO pages_new (id, name, slug, type, parentId, titleAr, titleEn, metaTitleAr, metaTitleEn, metaDescriptionAr, metaDescriptionEn, keywordsAr, keywordsEn, isActive, sortOrder, createdAt, updatedAt, status, publishedAt, deletedAt)
SELECT id, name, slug, type, parentId, titleAr, titleEn, metaTitleAr, metaTitleEn, metaDescriptionAr, metaDescriptionEn, keywordsAr, keywordsEn, isActive, sortOrder, createdAt, updatedAt, status, publishedAt, deletedAt
FROM pages;

-- حذف الجدول القديم
DROP TABLE pages;

-- إعادة تسمية الجدول الجديد
RENAME TABLE pages_new TO pages;

-- إعادة إنشاء الفهارس
CREATE INDEX pages_slug_idx ON pages(slug);
CREATE INDEX pages_type_idx ON pages(type);
CREATE INDEX pages_parentId_idx ON pages(parentId);
CREATE INDEX pages_status_idx ON pages(status);
CREATE INDEX pages_isActive_idx ON pages(isActive);
CREATE INDEX pages_sortOrder_idx ON pages(sortOrder);
CREATE INDEX pages_typeParent_idx ON pages(type, parentId);
CREATE INDEX pages_statusActive_idx ON pages(status, isActive);
CREATE INDEX pages_deletedAt_idx ON pages(deletedAt);
