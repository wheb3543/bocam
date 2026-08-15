/**
 * Image Service
 * خدمة إدارة الصور
 */

import { images, type InsertImage } from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { createLogger } from '../../_core/logger';

const logger = createLogger('imageService');

/**
 * الحصول على جميع الصور
 */
export async function getAllImages(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  filters?: {
    section?: string;
    format?: string;
    isActive?: string;
    search?: string;
  }
) {
  try {
    const conditions = [];

    if (filters?.section) {
      conditions.push(eq(images.section, filters.section));
    }
    if (filters?.format) {
      conditions.push(eq(images.format, filters.format));
    }
    if (filters?.isActive) {
      conditions.push(eq(images.isActive, filters.isActive as 'yes' | 'no'));
    }

    const result = await db
      .select()
      .from(images)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(images.createdAt);

    return result;
  } catch (error) {
    logger.error('Error fetching images:', error);
    throw error;
  }
}

/**
 * الحصول على صورة بواسطة المفتاح
 */
export async function getImageByKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  key: string
) {
  try {
    const result = await db.select().from(images).where(eq(images.key, key)).limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching image by key:', error);
    throw error;
  }
}

/**
 * الحصول على صورة بواسطة المعرف
 */
export async function getImageById(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number
) {
  try {
    const result = await db.select().from(images).where(eq(images.id, id)).limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching image by id:', error);
    throw error;
  }
}

/**
 * إنشاء صورة جديدة
 */
export async function createImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  data: InsertImage
) {
  try {
    const insertId = await db.insert(images).values(data).$returningId();
    logger.info(`Image created: ${data.key}`);
    return { success: true, id: Number(insertId) };
  } catch (error) {
    logger.error('Error creating image:', error);
    throw error;
  }
}

/**
 * تحديث صورة موجودة
 */
export async function updateImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number,
  data: Partial<InsertImage>
) {
  try {
    await db.update(images).set(data).where(eq(images.id, id));
    logger.info(`Image updated: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error updating image:', error);
    throw error;
  }
}

/**
 * حذف صورة
 */
export async function deleteImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number
) {
  try {
    await db.delete(images).where(eq(images.id, id));
    logger.info(`Image deleted: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * الحصول على نظرة عامة على الصور
 */
export async function getImageOverview(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any
) {
  try {
    const allImages = await db.select().from(images);

    const total = allImages.length;
    const active = allImages.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (i: any) => i.isActive === 'yes'
    ).length;

    return {
      total,
      active,
      inactive: total - active,
    };
  } catch (error) {
    logger.error('Error fetching image overview:', error);
    throw error;
  }
}
