/**
 * Color Scheme Service
 * خدمة إدارة نظام الألوان
 */

import { colorScheme, type InsertColorScheme } from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { createLogger } from '../../_core/logger';

const logger = createLogger('colorSchemeService');

/**
 * الحصول على جميع الألوان
 */
export async function getAllColorSchemes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  filters?: {
    type?: string;
    shade?: string;
    isActive?: string;
    search?: string;
  }
) {
  try {
    const conditions = [];

    if (filters?.type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conditions.push(eq(colorScheme.type, filters.type as any));
    }
    if (filters?.shade) {
      conditions.push(eq(colorScheme.shade, filters.shade));
    }
    if (filters?.isActive) {
      conditions.push(eq(colorScheme.isActive, filters.isActive as 'yes' | 'no'));
    }

    const result = await db
      .select()
      .from(colorScheme)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(colorScheme.createdAt);

    return result;
  } catch (error) {
    logger.error('Error fetching color schemes:', error);
    throw error;
  }
}

/**
 * الحصول على لون بواسطة المفتاح
 */
export async function getColorSchemeByKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  key: string
) {
  try {
    const result = await db.select().from(colorScheme).where(eq(colorScheme.key, key)).limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching color scheme by key:', error);
    throw error;
  }
}

/**
 * الحصول على لون بواسطة المعرف
 */
export async function getColorSchemeById(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number
) {
  try {
    const result = await db.select().from(colorScheme).where(eq(colorScheme.id, id)).limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching color scheme by id:', error);
    throw error;
  }
}

/**
 * إنشاء لون جديد
 */
export async function createColorScheme(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  data: InsertColorScheme
) {
  try {
    const insertId = await db.insert(colorScheme).values(data).$returningId();
    logger.info(`Color scheme created: ${data.key}`);
    return { success: true, id: Number(insertId) };
  } catch (error) {
    logger.error('Error creating color scheme:', error);
    throw error;
  }
}

/**
 * تحديث لون موجود
 */
export async function updateColorScheme(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number,
  data: Partial<InsertColorScheme>
) {
  try {
    await db.update(colorScheme).set(data).where(eq(colorScheme.id, id));
    logger.info(`Color scheme updated: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error updating color scheme:', error);
    throw error;
  }
}

/**
 * حذف لون
 */
export async function deleteColorScheme(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number
) {
  try {
    await db.delete(colorScheme).where(eq(colorScheme.id, id));
    logger.info(`Color scheme deleted: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error deleting color scheme:', error);
    throw error;
  }
}

/**
 * الحصول على نظرة عامة على الألوان
 */
export async function getColorSchemeOverview(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any
) {
  try {
    const allColors = await db.select().from(colorScheme);

    const total = allColors.length;
    const active = allColors.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c.isActive === 'yes'
    ).length;

    return {
      total,
      active,
      inactive: total - active,
    };
  } catch (error) {
    logger.error('Error fetching color scheme overview:', error);
    throw error;
  }
}
