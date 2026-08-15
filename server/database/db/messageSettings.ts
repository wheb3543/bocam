/**
 * Message Settings Database Functions
 * دوال قاعدة البيانات المتعلقة بإعدادات الرسائل
 */

import { eq } from 'drizzle-orm';
import { messageSettings, InsertMessageSetting } from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * الحصول على جميع إعدادات الرسائل
 */
export async function getAllMessageSettings() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db.select().from(messageSettings);
}

/**
 * الحصول على إعدادات الرسائل حسب الفئة
 */
export async function getMessageSettingsByCategory(category: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const { sql } = await import('drizzle-orm');
  return db
    .select()
    .from(messageSettings)
    .where(sql`${messageSettings.category} = ${category}`);
}

/**
 * الحصول على إعداد رسالة حسب النوع
 */
export async function getMessageSettingByType(type: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  const result = await db
    .select()
    .from(messageSettings)
    .where(eq(messageSettings.messageType, type))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * تحديث إعداد رسالة
 */
export async function updateMessageSetting(id: number, setting: Partial<InsertMessageSetting>) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  return db.update(messageSettings).set(setting).where(eq(messageSettings.id, id));
}

/**
 * تحديث إعداد رسالة (للتوافق مع الاستدعاءات القديمة)
 */
export async function updateMessageSettingCompat(
  setting: Partial<InsertMessageSetting> & { id?: number }
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  if (setting.id) {
    return db.update(messageSettings).set(setting).where(eq(messageSettings.id, setting.id));
  }
  throw new Error('ID is required for update');
}

/**
 * تبديل حالة تفعيل إعداد رسالة
 */
export async function toggleMessageSettingEnabled(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const setting = await db
    .select()
    .from(messageSettings)
    .where(eq(messageSettings.id, id))
    .limit(1);
  if (setting.length === 0) {
    throw new Error('Setting not found');
  }
  return db
    .update(messageSettings)
    .set({ isEnabled: setting[0].isEnabled === 1 ? 0 : 1 })
    .where(eq(messageSettings.id, id));
}
