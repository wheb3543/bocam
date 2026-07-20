/**
 * Shared Templates Database Functions
 * دوال قاعدة البيانات المتعلقة بالقوالب المشتركة
 */

import { eq, desc } from 'drizzle-orm';
import { sharedColumnTemplates, InsertSharedColumnTemplate } from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * الحصول على قالب مشترك حسب المعرف
 */
export async function getSharedTemplate(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  const result = await db
    .select()
    .from(sharedColumnTemplates)
    .where(eq(sharedColumnTemplates.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * الحصول على جميع القوالب المشتركة
 */
export async function getAllSharedTemplates() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db.select().from(sharedColumnTemplates).orderBy(desc(sharedColumnTemplates.createdAt));
}

/**
 * الحصول على القوالب المشتركة حسب مفتاح الجدول
 */
export async function getSharedTemplates(tableKey: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db
    .select()
    .from(sharedColumnTemplates)
    .where(eq(sharedColumnTemplates.tableKey, tableKey));
}

/**
 * إنشاء قالب مشترك
 */
export async function createSharedTemplate(template: InsertSharedColumnTemplate) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const result = await db.insert(sharedColumnTemplates).values(template);
  return result;
}

/**
 * حذف قالب مشترك
 */
export async function deleteSharedTemplate(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  return db.delete(sharedColumnTemplates).where(eq(sharedColumnTemplates.id, id));
}

/**
 * تحديث قالب مشترك
 */
export async function updateSharedTemplate(
  id: number,
  template: Partial<InsertSharedColumnTemplate>
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  return db.update(sharedColumnTemplates).set(template).where(eq(sharedColumnTemplates.id, id));
}
