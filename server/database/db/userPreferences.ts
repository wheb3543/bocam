/**
 * User Preferences Database Functions
 * دوال قاعدة البيانات المتعلقة بتفضيلات المستخدم
 */

import { eq } from 'drizzle-orm';
import { userPreferences } from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * الحصول على تفضيل مستخدم
 */
export async function getUserPreference(userId: number, preferenceKey: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  const { and } = await import('drizzle-orm');
  const result = await db
    .select()
    .from(userPreferences)
    .where(
      and(eq(userPreferences.userId, userId), eq(userPreferences.preferenceKey, preferenceKey))
    )
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * تعيين تفضيل مستخدم
 */
export async function setUserPreference(
  userId: number,
  preferenceKey: string,
  preferenceValue: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  return db
    .insert(userPreferences)
    .values({ userId, preferenceKey, preferenceValue })
    .onDuplicateKeyUpdate({ set: { preferenceValue, updatedAt: new Date() } });
}

/**
 * الحصول على جميع تفضيلات مستخدم
 */
export async function getAllUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
}
