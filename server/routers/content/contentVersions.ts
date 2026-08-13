/**
 * Content Versions Router
 * Router للنسخ المحفوظة للتراجع والإعادة
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { contentVersionsService } from '../../services/content/contentVersionsService';
import { createLogger } from '../../_core/logger';

const logger = createLogger('contentVersionsRouter');

export const contentVersionsRouter = router({
  /**
   * إنشاء نسخة جديدة
   */
  create: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['text', 'image', 'color', 'seo']),
        entityId: z.number(),
        data: z.any(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await ensureDatabaseAvailable();
        const version = await contentVersionsService.createVersion(db, {
          entityType: input.entityType,
          entityId: input.entityId,
          data: input.data,
          userId: ctx.user?.id,
          reason: input.reason,
        });
        logger.info('Created content version successfully', { versionId: version.id });
        return version;
      } catch (error) {
        logger.error('Error creating content version:', error);
        throw new Error('فشل في إنشاء نسخة المحتوى', { cause: error });
      }
    }),

  /**
   * الحصول على جميع نسخ المحتوى
   */
  list: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['text', 'image', 'color', 'seo']),
        entityId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await ensureDatabaseAvailable();
        const versions = await contentVersionsService.getVersions(db, input);
        logger.info('Fetched content versions successfully', { count: versions.length });
        return versions;
      } catch (error) {
        logger.error('Error fetching content versions:', error);
        throw new Error('فشل في جلب نسخ المحتوى', { cause: error });
      }
    }),

  /**
   * الحصول على نسخة محددة
   */
  get: protectedProcedure
    .input(
      z.object({
        versionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await ensureDatabaseAvailable();
        const version = await contentVersionsService.getVersion(db, input.versionId);
        logger.info('Fetched content version successfully', { versionId: input.versionId });
        return version;
      } catch (error) {
        logger.error('Error fetching content version:', error);
        throw new Error('فشل في جلب النسخة', { cause: error });
      }
    }),

  /**
   * الحصول على آخر نسخة
   */
  getLatest: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['text', 'image', 'color', 'seo']),
        entityId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await ensureDatabaseAvailable();
        const version = await contentVersionsService.getLatestVersion(db, input);
        logger.info('Fetched latest content version successfully');
        return version;
      } catch (error) {
        logger.error('Error fetching latest content version:', error);
        throw new Error('فشل في جلب آخر نسخة', { cause: error });
      }
    }),

  /**
   * حذف نسخة محددة
   */
  delete: protectedProcedure
    .input(
      z.object({
        versionId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await ensureDatabaseAvailable();
        await contentVersionsService.deleteVersion(db, input.versionId);
        logger.info('Deleted content version successfully', { versionId: input.versionId });
        return { success: true };
      } catch (error) {
        logger.error('Error deleting content version:', error);
        throw new Error('فشل في حذف النسخة', { cause: error });
      }
    }),

  /**
   * حذف جميع نسخ المحتوى
   */
  deleteAll: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['text', 'image', 'color', 'seo']),
        entityId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await ensureDatabaseAvailable();
        await contentVersionsService.deleteAllVersions(db, input);
        logger.info('Deleted all content versions successfully', input);
        return { success: true };
      } catch (error) {
        logger.error('Error deleting all content versions:', error);
        throw new Error('فشل في حذف جميع النسخ', { cause: error });
      }
    }),
});
