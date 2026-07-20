/**
 * Settings Database Functions
 * دوال قاعدة البيانات المتعلقة بالإعدادات العامة
 */

import { eq } from 'drizzle-orm';
import { settings, InsertSetting } from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * الحصول على إعداد حسب المفتاح
 */
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * إنشاء أو تحديث إعداد
 */
export async function upsertSetting(setting: InsertSetting) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  return db
    .insert(settings)
    .values(setting)
    .onDuplicateKeyUpdate({ set: { value: setting.value, updatedAt: new Date() } });
}
