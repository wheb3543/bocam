/**
 * SEO Settings Router
 * Router لإدارة إعدادات SEO
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { eq, and, like, or } from 'drizzle-orm';
import { seoSettings } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';

const logger = createLogger('seoSettings');

/**
 * Schema للتحقق من بيانات SEO
 */
const seoSettingsSchema = z.object({
  pageId: z.number().optional(),
  pageKey: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  language: z.string().min(1).max(10),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  ogTitle: z.string().max(255).optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().max(500).optional(),
  canonicalUrl: z.string().max(500).optional(),
  robots: z.string().optional(),
  structuredData: z.string().optional(),
  isActive: z.enum(['yes', 'no']).default('yes'),
});

export const seoSettingsRouter = router({
  /**
   * الحصول على جميع إعدادات SEO
   */
  list: protectedProcedure
    .input(
      z.object({
        language: z.string().optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [];

      if (input.language) {
        conditions.push(eq(seoSettings.language, input.language));
      }
      if (input.isActive) {
        conditions.push(eq(seoSettings.isActive, input.isActive));
      }
      if (input.search) {
        conditions.push(
          or(
            like(seoSettings.pageKey, `%${input.search}%`),
            like(seoSettings.title || '', `%${input.search}%`)
          )
        );
      }

      const result = await db
        .select()
        .from(seoSettings)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(seoSettings.createdAt);

      return result;
    }),

  /**
   * الحصول على إعدادات SEO لصفحة واحدة بواسطة المعرف
   */
  getByPageId: protectedProcedure
    .input(z.object({ pageId: z.number(), language: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [eq(seoSettings.pageId, input.pageId)];
      if (input.language) {
        conditions.push(eq(seoSettings.language, input.language));
      }

      const result = await db
        .select()
        .from(seoSettings)
        .where(and(...conditions))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * الحصول على إعدادات SEO لصفحة واحدة بواسطة المفتاح
   */
  getByPageKey: protectedProcedure
    .input(z.object({ pageKey: z.string(), language: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [eq(seoSettings.pageKey, input.pageKey)];
      if (input.language) {
        conditions.push(eq(seoSettings.language, input.language));
      }

      const result = await db
        .select()
        .from(seoSettings)
        .where(and(...conditions))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * الحصول على إعدادات SEO لصفحة واحدة بواسطة الرابط
   */
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string(), language: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [eq(seoSettings.slug, input.slug)];
      if (input.language) {
        conditions.push(eq(seoSettings.language, input.language));
      }

      const result = await db
        .select()
        .from(seoSettings)
        .where(and(...conditions))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * الحصول على إعدادات SEO واحدة بواسطة المعرف
   */
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(seoSettings).where(eq(seoSettings.id, input.id)).limit(1);

    return result[0] || null;
  }),

  /**
   * إنشاء إعدادات SEO جديدة
   */
  create: protectedProcedure.input(seoSettingsSchema).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const insertId = await db
      .insert(seoSettings)
      .values({
        pageId: input.pageId,
        pageKey: input.pageKey,
        slug: input.slug,
        language: input.language,
        title: input.title,
        description: input.description,
        keywords: input.keywords,
        ogTitle: input.ogTitle,
        ogDescription: input.ogDescription,
        ogImage: input.ogImage,
        canonicalUrl: input.canonicalUrl,
        robots: input.robots,
        structuredData: input.structuredData,
        isActive: input.isActive,
      })
      .$returningId();

    logger.info(`SEO settings created: ${input.pageKey}`);

    return { success: true, id: Number(insertId) };
  }),

  /**
   * تحديث إعدادات SEO موجودة
   */
  update: protectedProcedure
    .input(
      seoSettingsSchema.extend({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      await db
        .update(seoSettings)
        .set({
          pageId: input.pageId,
          pageKey: input.pageKey,
          slug: input.slug,
          language: input.language,
          title: input.title,
          description: input.description,
          keywords: input.keywords,
          ogTitle: input.ogTitle,
          ogDescription: input.ogDescription,
          ogImage: input.ogImage,
          canonicalUrl: input.canonicalUrl,
          robots: input.robots,
          structuredData: input.structuredData,
          isActive: input.isActive,
        })
        .where(eq(seoSettings.id, input.id));

      logger.info(`SEO settings updated: ${input.id}`);

      return { success: true };
    }),

  /**
   * حذف إعدادات SEO
   */
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.delete(seoSettings).where(eq(seoSettings.id, input.id));

    logger.info(`SEO settings deleted: ${input.id}`);

    return { success: true };
  }),

  /**
   * الحصول على نظرة عامة على إعدادات SEO
   */
  getOverview: protectedProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const allSEO = await db.select().from(seoSettings);

    const total = allSEO.length;
    const active = allSEO.filter((s) => s.isActive === 'yes').length;

    return {
      total,
      active,
      inactive: total - active,
    };
  }),
});
