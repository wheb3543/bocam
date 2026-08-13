/**
 * SEO Settings Service
 * خدمة إدارة إعدادات SEO
 */

import { seoSettings, type InsertSEOSettings } from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { createLogger } from '../../_core/logger';

const logger = createLogger('seoService');

/**
 * الحصول على جميع إعدادات SEO
 */
export async function getAllSEOSettings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  filters?: {
    language?: string;
    isActive?: string;
    search?: string;
  }
) {
  try {
    const conditions = [];

    if (filters?.language) {
      conditions.push(eq(seoSettings.language, filters.language));
    }
    if (filters?.isActive) {
      conditions.push(eq(seoSettings.isActive, filters.isActive as 'yes' | 'no'));
    }

    const result = await db
      .select()
      .from(seoSettings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(seoSettings.createdAt);

    return result;
  } catch (error) {
    logger.error('Error fetching SEO settings:', error);
    throw error;
  }
}

/**
 * الحصول على إعدادات SEO لصفحة بواسطة المفتاح
 */
export async function getSEOSettingsByPageKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  pageKey: string,
  language?: string
) {
  try {
    const conditions = [eq(seoSettings.pageKey, pageKey)];
    if (language) {
      conditions.push(eq(seoSettings.language, language));
    }

    const result = await db
      .select()
      .from(seoSettings)
      .where(and(...conditions))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching SEO settings by page key:', error);
    throw error;
  }
}

/**
 * الحصول على إعدادات SEO بواسطة المعرف
 */
export async function getSEOSettingsById(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number
) {
  try {
    const result = await db.select().from(seoSettings).where(eq(seoSettings.id, id)).limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching SEO settings by id:', error);
    throw error;
  }
}

/**
 * إنشاء إعدادات SEO جديدة
 */
export async function createSEOSettings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  data: InsertSEOSettings
) {
  try {
    const insertId = await db.insert(seoSettings).values(data).$returningId();
    logger.info(`SEO settings created: ${data.pageKey}`);
    return { success: true, id: Number(insertId) };
  } catch (error) {
    logger.error('Error creating SEO settings:', error);
    throw error;
  }
}

/**
 * تحديث إعدادات SEO موجودة
 */
export async function updateSEOSettings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number,
  data: Partial<InsertSEOSettings>
) {
  try {
    await db.update(seoSettings).set(data).where(eq(seoSettings.id, id));
    logger.info(`SEO settings updated: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error updating SEO settings:', error);
    throw error;
  }
}

/**
 * حذف إعدادات SEO
 */
export async function deleteSEOSettings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number
) {
  try {
    await db.delete(seoSettings).where(eq(seoSettings.id, id));
    logger.info(`SEO settings deleted: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error deleting SEO settings:', error);
    throw error;
  }
}

/**
 * الحصول على نظرة عامة على إعدادات SEO
 */
export async function getSEOSettingsOverview(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any
) {
  try {
    const allSEO = await db.select().from(seoSettings);

    const total = allSEO.length;
    const active = allSEO.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.isActive === 'yes'
    ).length;

    return {
      total,
      active,
      inactive: total - active,
    };
  } catch (error) {
    logger.error('Error fetching SEO settings overview:', error);
    throw error;
  }
}
