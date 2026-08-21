/**
 * Content Versions Router
 * Router للنسخ المحفوظة للتراجع والإعادة
 */

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { adminProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { contentVersionsService } from '../../services/content/contentVersionsService';
import { createLogger } from '../../_core/logger';
import { textContent, images, colorScheme, seoSettings } from '../../../drizzle/schema';
import { auditLogService } from '../../services/content/auditLogService';
import {
  invalidateColorSchemeCache,
  invalidateImagesCache,
  invalidateSEOCache,
  invalidateTextContentCache,
} from '../public/content';

const logger = createLogger('contentVersionsRouter');

const entityTypeSchema = z.enum(['text', 'image', 'color', 'seo']);

function toDateOrNull(value: unknown): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('بيانات النسخة غير صالحة للاستعادة');
  }
  return value as Record<string, unknown>;
}

async function restoreVersionData(
  // Drizzle transaction type varies by deployment driver; all writes remain inside one transaction.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  entityType: z.infer<typeof entityTypeSchema>,
  entityId: number,
  data: unknown,
  userId?: number
) {
  const record = asRecord(data);

  if (entityType === 'text') {
    const parsed = z
      .object({
        key: z.string().min(1).max(255),
        language: z.string().min(1).max(10),
        content: z.string().min(1),
        section: z.string().max(100).nullable().optional(),
        sectionId: z.number().nullable().optional(),
        pageId: z.number().nullable().optional(),
        type: z.enum([
          'title',
          'subtitle',
          'description',
          'text',
          'button',
          'link',
          'label',
          'placeholder',
          'error',
          'success',
          'warning',
          'info',
        ]),
        status: z.enum(['draft', 'published', 'archived']),
        isActive: z.enum(['yes', 'no']),
        publishedAt: z.unknown().nullable().optional(),
        deletedAt: z.unknown().nullable().optional(),
      })
      .parse(record);
    const [current] = await tx
      .select()
      .from(textContent)
      .where(eq(textContent.id, entityId))
      .limit(1);
    if (!current) {
      throw new Error('المحتوى النصي المراد استعادته غير موجود');
    }
    await contentVersionsService.createVersion(tx, {
      entityType,
      entityId,
      data: current,
      userId,
      reason: 'نسخة أمان تلقائية قبل الاستعادة',
    });
    await tx
      .update(textContent)
      .set({
        ...parsed,
        publishedAt: toDateOrNull(parsed.publishedAt),
        deletedAt: toDateOrNull(parsed.deletedAt),
      })
      .where(eq(textContent.id, entityId));
    await auditLogService.logChange(tx, {
      entityType: 'text',
      entityId,
      action: 'update',
      userId,
      oldValue: JSON.stringify(current),
      newValue: JSON.stringify(parsed),
      reason: 'استعادة نسخة سابقة',
    });
    return;
  }

  if (entityType === 'image') {
    const parsed = z
      .object({
        key: z.string().min(1).max(255),
        url: z.string().min(1).max(500),
        altAr: z.string().nullable().optional(),
        altEn: z.string().nullable().optional(),
        section: z.string().max(100).nullable().optional(),
        sectionId: z.number().nullable().optional(),
        pageId: z.number().nullable().optional(),
        width: z.number().int().nullable().optional(),
        height: z.number().int().nullable().optional(),
        format: z.string().max(10).nullable().optional(),
        size: z.number().int().nullable().optional(),
        status: z.enum(['draft', 'published', 'archived']),
        isActive: z.enum(['yes', 'no']),
        publishedAt: z.unknown().nullable().optional(),
        deletedAt: z.unknown().nullable().optional(),
      })
      .parse(record);
    const [current] = await tx.select().from(images).where(eq(images.id, entityId)).limit(1);
    if (!current) {
      throw new Error('الصورة المراد استعادتها غير موجودة');
    }
    await contentVersionsService.createVersion(tx, {
      entityType,
      entityId,
      data: current,
      userId,
      reason: 'نسخة أمان تلقائية قبل الاستعادة',
    });
    await tx
      .update(images)
      .set({
        ...parsed,
        publishedAt: toDateOrNull(parsed.publishedAt),
        deletedAt: toDateOrNull(parsed.deletedAt),
      })
      .where(eq(images.id, entityId));
    await auditLogService.logChange(tx, {
      entityType: 'image',
      entityId,
      action: 'update',
      userId,
      oldValue: JSON.stringify(current),
      newValue: JSON.stringify(parsed),
      reason: 'استعادة نسخة سابقة',
    });
    return;
  }

  if (entityType === 'color') {
    const parsed = z
      .object({
        key: z.string().min(1).max(255),
        value: z.string().min(1).max(50),
        type: z
          .enum(['primary', 'secondary', 'accent', 'background', 'text', 'border'])
          .nullable()
          .optional(),
        shade: z.string().max(20).nullable().optional(),
        isActive: z.enum(['yes', 'no']),
      })
      .parse(record);
    const [current] = await tx
      .select()
      .from(colorScheme)
      .where(eq(colorScheme.id, entityId))
      .limit(1);
    if (!current) {
      throw new Error('اللون المراد استعادته غير موجود');
    }
    await contentVersionsService.createVersion(tx, {
      entityType,
      entityId,
      data: current,
      userId,
      reason: 'نسخة أمان تلقائية قبل الاستعادة',
    });
    await tx.update(colorScheme).set(parsed).where(eq(colorScheme.id, entityId));
    await auditLogService.logChange(tx, {
      entityType: 'color',
      entityId,
      action: 'update',
      userId,
      oldValue: JSON.stringify(current),
      newValue: JSON.stringify(parsed),
      reason: 'استعادة نسخة سابقة',
    });
    return;
  }

  const parsed = z
    .object({
      pageId: z.number().nullable().optional(),
      pageKey: z.string().max(255).nullable().optional(),
      slug: z.string().max(255).nullable().optional(),
      language: z.string().max(10).nullable().optional(),
      title: z.string().max(255).nullable().optional(),
      description: z.string().nullable().optional(),
      keywords: z.string().nullable().optional(),
      ogTitle: z.string().max(255).nullable().optional(),
      ogDescription: z.string().nullable().optional(),
      ogImage: z.string().max(500).nullable().optional(),
      canonicalUrl: z.string().max(500).nullable().optional(),
      robots: z.string().nullable().optional(),
      structuredData: z.string().nullable().optional(),
      isActive: z.enum(['yes', 'no']),
    })
    .parse(record);
  const [current] = await tx
    .select()
    .from(seoSettings)
    .where(eq(seoSettings.id, entityId))
    .limit(1);
  if (!current) {
    throw new Error('إعداد SEO المراد استعادته غير موجود');
  }
  await contentVersionsService.createVersion(tx, {
    entityType,
    entityId,
    data: current,
    userId,
    reason: 'نسخة أمان تلقائية قبل الاستعادة',
  });
  await tx.update(seoSettings).set(parsed).where(eq(seoSettings.id, entityId));
  await auditLogService.logChange(tx, {
    entityType: 'seo',
    entityId,
    action: 'update',
    userId,
    oldValue: JSON.stringify(current),
    newValue: JSON.stringify(parsed),
    reason: 'استعادة نسخة سابقة',
  });
}

export const contentVersionsRouter = router({
  /**
   * إنشاء نسخة جديدة
   */
  create: adminProcedure
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
  list: adminProcedure
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
  get: adminProcedure
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
  getLatest: adminProcedure
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
  restore: adminProcedure
    .input(z.object({ versionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const version = await contentVersionsService.getVersion(db, input.versionId);

      await db.transaction(async (tx: any) => {
        await restoreVersionData(
          tx,
          version.entityType,
          version.entityId,
          version.data,
          ctx.user.id
        );
      });

      if (version.entityType === 'text') {
        invalidateTextContentCache();
      }
      if (version.entityType === 'image') {
        invalidateImagesCache();
      }
      if (version.entityType === 'color') {
        invalidateColorSchemeCache();
      }
      if (version.entityType === 'seo') {
        invalidateSEOCache();
      }

      logger.info('Content version restored successfully', { versionId: input.versionId });
      return { success: true, entityType: version.entityType, entityId: version.entityId };
    }),

  delete: adminProcedure
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
  deleteAll: adminProcedure
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
