/**
 * Content Versions Service
 * خدمة النسخ المحفوظة للتراجع والإعادة
 */

import { contentVersions } from '../../../drizzle/schema';
import { eq, desc, and, max } from 'drizzle-orm';
import { createLogger } from '../../_core/logger';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';

type DbClient = Awaited<ReturnType<typeof ensureDatabaseAvailable>>;

const logger = createLogger('contentVersionsService');

export type ContentVersionEntityType =
  'text' | 'image' | 'color' | 'seo' | 'page' | 'section' | 'sectionButton';

/**
 * ContentVersionsService - خدمة النسخ المحفوظة
 */
export class ContentVersionsService {
  /**
   * إنشاء نسخة جديدة من المحتوى
   */

  async createVersion(
    db: DbClient,
    params: {
      entityType: ContentVersionEntityType;
      entityId: number;
      data: unknown;
      userId?: number;
      reason?: string;
    }
  ) {
    try {
      // الحصول على آخر رقم نسخة
      const lastVersion = await db
        .select({ versionNumber: max(contentVersions.versionNumber) })
        .from(contentVersions)
        .where(
          and(
            eq(contentVersions.entityType, params.entityType),
            eq(contentVersions.entityId, params.entityId)
          )
        );

      const nextVersionNumber = (lastVersion[0]?.versionNumber || 0) + 1;

      // إنشاء النسخة الجديدة
      const [newVersion] = await db
        .insert(contentVersions)
        .values({
          entityType: params.entityType,
          entityId: params.entityId,
          versionNumber: nextVersionNumber,
          data: JSON.stringify(params.data),
          userId: params.userId,
          reason: params.reason,
          createdAt: new Date(),
        })
        .$returningId();

      logger.info('Created new content version', {
        entityType: params.entityType,
        entityId: params.entityId,
        versionNumber: nextVersionNumber,
      });

      return newVersion;
    } catch (error) {
      logger.error('Error creating content version:', error);
      throw new Error('فشل في إنشاء نسخة المحتوى', { cause: error } as ErrorOptions);
    }
  }

  /**
   * الحصول على جميع نسخ المحتوى
   */

  async getVersions(
    db: DbClient,
    params: {
      entityType: ContentVersionEntityType;
      entityId: number;
    }
  ) {
    try {
      const versions = await db
        .select()
        .from(contentVersions)
        .where(
          and(
            eq(contentVersions.entityType, params.entityType),
            eq(contentVersions.entityId, params.entityId)
          )
        )
        .orderBy(desc(contentVersions.versionNumber));

      return versions.map((version: { data: string } & Record<string, unknown>) => ({
        ...version,
        data: JSON.parse(version.data),
      }));
    } catch (error) {
      logger.error('Error fetching content versions:', error);
      throw new Error('فشل في جلب نسخ المحتوى', { cause: error } as ErrorOptions);
    }
  }

  /**
   * الحصول على نسخة محددة
   */
  async getVersion(db: DbClient, versionId: number) {
    try {
      const [version] = await db
        .select()
        .from(contentVersions)
        .where(eq(contentVersions.id, versionId));

      if (!version) {
        throw new Error('النسخة غير موجودة');
      }

      return {
        ...version,
        data: JSON.parse(version.data),
      };
    } catch (error) {
      logger.error('Error fetching content version:', error);
      throw new Error('فشل في جلب النسخة', { cause: error } as ErrorOptions);
    }
  }

  /**
   * الحصول على آخر نسخة
   */

  async getLatestVersion(
    db: DbClient,
    params: {
      entityType: ContentVersionEntityType;
      entityId: number;
    }
  ) {
    try {
      const [version] = await db
        .select()
        .from(contentVersions)
        .where(
          and(
            eq(contentVersions.entityType, params.entityType),
            eq(contentVersions.entityId, params.entityId)
          )
        )
        .orderBy(desc(contentVersions.versionNumber))
        .limit(1);

      if (!version) {
        return null;
      }

      return {
        ...version,
        data: JSON.parse(version.data),
      };
    } catch (error) {
      logger.error('Error fetching latest content version:', error);
      throw new Error('فشل في جلب آخر نسخة', { cause: error } as ErrorOptions);
    }
  }

  /**
   * حذف نسخة محددة
   */
  async deleteVersion(db: DbClient, versionId: number) {
    try {
      await db.delete(contentVersions).where(eq(contentVersions.id, versionId));

      logger.info('Deleted content version', { versionId });
    } catch (error) {
      logger.error('Error deleting content version:', error);
      throw new Error('فشل في حذف النسخة', { cause: error } as ErrorOptions);
    }
  }

  /**
   * حذف جميع نسخ المحتوى
   */

  async deleteAllVersions(
    db: DbClient,
    params: {
      entityType: ContentVersionEntityType;
      entityId: number;
    }
  ) {
    try {
      await db
        .delete(contentVersions)
        .where(
          and(
            eq(contentVersions.entityType, params.entityType),
            eq(contentVersions.entityId, params.entityId)
          )
        );

      logger.info('Deleted all content versions', params);
    } catch (error) {
      logger.error('Error deleting all content versions:', error);
      throw new Error('فشل في حذف جميع النسخ', { cause: error } as ErrorOptions);
    }
  }
}

export const contentVersionsService = new ContentVersionsService();
