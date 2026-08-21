/**
 * Images Router
 * Router لإدارة الصور
 */

import { z } from 'zod';
import { adminProcedure, router } from '../../_core/trpc';
import {
  assertContentCapability,
  contentEditProcedure,
  contentReadProcedure,
} from './authorization';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { eq, and, like, or, isNull } from 'drizzle-orm';
import { images } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';

const logger = createLogger('images');

/**
 * Schema للتحقق من بيانات الصور
 */
const imageSchema = z.object({
  key: z.string().min(1).max(255),
  url: z.string().min(1).max(500),
  altAr: z.string().optional(),
  altEn: z.string().optional(),
  section: z.string().max(100).optional(),
  sectionId: z.number().optional(),
  pageId: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().max(10).optional(),
  size: z.number().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isActive: z.enum(['yes', 'no']).default('yes'),
  publishedAt: z.date().optional(),
});

export const imagesRouter = router({
  /**
   * الحصول على جميع الصور
   */
  list: contentReadProcedure
    .input(
      z.object({
        section: z.string().optional(),
        sectionId: z.number().optional(),
        pageId: z.number().optional(),
        format: z.string().optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [isNull(images.deletedAt)];

      if (input.section) {
        conditions.push(eq(images.section, input.section));
      }
      if (input.sectionId) {
        conditions.push(eq(images.sectionId, input.sectionId));
      }
      if (input.pageId) {
        conditions.push(eq(images.pageId, input.pageId));
      }
      if (input.format) {
        conditions.push(eq(images.format, input.format));
      }
      if (input.isActive) {
        conditions.push(eq(images.isActive, input.isActive));
      }
      if (input.search) {
        const textSearch = or(
          like(images.key, `%${input.search}%`),
          like(images.altAr || '', `%${input.search}%`),
          like(images.altEn || '', `%${input.search}%`)
        );
        if (textSearch) {
          conditions.push(textSearch);
        }
      }

      const result = await db
        .select()
        .from(images)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(images.createdAt);

      return result;
    }),

  /**
   * الحصول على صورة واحدة بواسطة المفتاح
   */
  getByKey: contentReadProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db
      .select()
      .from(images)
      .where(and(eq(images.key, input.key), isNull(images.deletedAt)))
      .limit(1);

    return result[0] || null;
  }),

  /**
   * الحصول على صورة واحدة بواسطة المعرف
   */
  getById: contentReadProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db
      .select()
      .from(images)
      .where(and(eq(images.id, input.id), isNull(images.deletedAt)))
      .limit(1);

    return result[0] || null;
  }),

  /**
   * إنشاء صورة جديدة
   */
  create: contentEditProcedure.input(imageSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    if (input.status === 'published') {
      assertContentCapability(ctx.user.role, 'publish');
    }

    const insertId = await db
      .insert(images)
      .values({
        key: input.key,
        url: input.url,
        altAr: input.altAr,
        altEn: input.altEn,
        section: input.section,
        sectionId: input.sectionId,
        pageId: input.pageId,
        width: input.width,
        height: input.height,
        format: input.format,
        size: input.size,
        status: input.status,
        isActive: input.isActive,
        publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
      })
      .$returningId();

    logger.info(`Image created: ${input.key}`);

    return { success: true, id: Number(insertId) };
  }),

  /**
   * تحديث صورة موجودة
   */
  update: contentEditProcedure
    .input(
      imageSchema.extend({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      if (input.status === 'published') {
        assertContentCapability(ctx.user.role, 'publish');
      }

      await db
        .update(images)
        .set({
          key: input.key,
          url: input.url,
          altAr: input.altAr,
          altEn: input.altEn,
          section: input.section,
          sectionId: input.sectionId,
          pageId: input.pageId,
          width: input.width,
          height: input.height,
          format: input.format,
          size: input.size,
          status: input.status,
          isActive: input.isActive,
          publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
        })
        .where(eq(images.id, input.id));

      logger.info(`Image updated: ${input.id}`);

      return { success: true };
    }),

  /**
   * حذف صورة (حذف ناعم)
   */
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.update(images).set({ deletedAt: new Date() }).where(eq(images.id, input.id));

    logger.info(`Image soft deleted: ${input.id}`);

    return { success: true };
  }),

  /**
   * الحصول على نظرة عامة على الصور
   */
  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const allImages = await db.select().from(images).where(isNull(images.deletedAt));

    const total = allImages.length;
    const active = allImages.filter((i) => i.isActive === 'yes').length;

    return {
      total,
      active,
      inactive: total - active,
    };
  }),
});
