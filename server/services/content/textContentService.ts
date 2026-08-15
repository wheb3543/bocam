/**
 * Text Content Service
 * خدمة إدارة المحتوى النصي
 */

import { textContent, type InsertTextContent } from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { createLogger } from '../../_core/logger';

const logger = createLogger('textContentService');

/**
 * الحصول على جميع المحتوى النصي
 */
export async function getAllTextContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  filters?: {
    language?: string;
    section?: string;
    type?: string;
    isActive?: string;
    search?: string;
  }
) {
  try {
    const conditions = [];

    if (filters?.language) {
      conditions.push(eq(textContent.language, filters.language));
    }
    if (filters?.section) {
      conditions.push(eq(textContent.section, filters.section));
    }
    if (filters?.type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conditions.push(eq(textContent.type, filters.type as any));
    }
    if (filters?.isActive) {
      conditions.push(eq(textContent.isActive, filters.isActive as 'yes' | 'no'));
    }

    const result = await db
      .select()
      .from(textContent)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(textContent.createdAt);

    return result;
  } catch (error) {
    logger.error('Error fetching text content:', error);
    throw error;
  }
}

/**
 * الحصول على محتوى نصي بواسطة المفتاح
 */
export async function getTextContentByKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  key: string,
  language?: string
) {
  try {
    const conditions = [eq(textContent.key, key)];
    if (language) {
      conditions.push(eq(textContent.language, language));
    }

    const result = await db
      .select()
      .from(textContent)
      .where(and(...conditions))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching text content by key:', error);
    throw error;
  }
}

/**
 * الحصول على محتوى نصي بواسطة المعرف
 */
export async function getTextContentById(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number
) {
  try {
    const result = await db.select().from(textContent).where(eq(textContent.id, id)).limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching text content by id:', error);
    throw error;
  }
}

/**
 * إنشاء محتوى نصي جديد
 */
export async function createTextContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  data: InsertTextContent
) {
  try {
    const insertId = await db.insert(textContent).values(data).$returningId();
    logger.info(`Text content created: ${data.key}`);
    return { success: true, id: Number(insertId) };
  } catch (error) {
    logger.error('Error creating text content:', error);
    throw error;
  }
}

/**
 * تحديث محتوى نصي موجود
 */
export async function updateTextContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number,
  data: Partial<InsertTextContent>
) {
  try {
    await db.update(textContent).set(data).where(eq(textContent.id, id));
    logger.info(`Text content updated: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error updating text content:', error);
    throw error;
  }
}

/**
 * حذف محتوى نصي
 */
export async function deleteTextContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  id: number
) {
  try {
    await db.delete(textContent).where(eq(textContent.id, id));
    logger.info(`Text content deleted: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error deleting text content:', error);
    throw error;
  }
}

/**
 * الحصول على نظرة عامة على المحتوى النصي
 */
export async function getTextContentOverview(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any
) {
  try {
    const allContent = await db.select().from(textContent);

    const total = allContent.length;
    const active = allContent.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c.isActive === 'yes'
    ).length;

    return {
      total,
      active,
      inactive: total - active,
    };
  } catch (error) {
    logger.error('Error fetching text content overview:', error);
    throw error;
  }
}
