/**
 * Public Content Router
 * Router عام لجلب المحتوى من قاعدة البيانات للواجهات العامة
 */

import { z } from 'zod';
import { publicProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { eq, and, count, inArray, isNull, gt, ne } from 'drizzle-orm';
import {
  textContent,
  images,
  colorScheme,
  seoSettings,
  pages,
  sections,
  sectionButtons,
  cmsPreviewTokens,
} from '../../../drizzle/schema';
import { createHash } from 'node:crypto';
import { cacheManager } from '../../services/redis';

const CACHE_TTL = 5 * 60; // 5 minutes in seconds

function getCacheKey(prefix: string, params: Record<string, unknown>): string {
  return `${prefix}:${JSON.stringify(params)}`;
}

async function getFromCache<T>(key: string): Promise<T | null> {
  return await cacheManager.get<T>(key);
}

async function setCache(key: string, data: unknown): Promise<void> {
  await cacheManager.set(key, data, CACHE_TTL);
}

/**
 * إبطال Cache للمحتوى النصي
 */
export async function invalidateTextContentCache(): Promise<void> {
  await cacheManager.deletePattern('text:*');
}

/**
 * إبطال Cache للصور
 */
export async function invalidateImagesCache(): Promise<void> {
  await cacheManager.deletePattern('images:*');
}

/**
 * إبطال Cache لمخطط الألوان
 */
export async function invalidateColorSchemeCache(): Promise<void> {
  await cacheManager.deletePattern('colors:*');
}

/**
 * إبطال Cache لإعدادات SEO
 */
export async function invalidateSEOCache(): Promise<void> {
  await cacheManager.deletePattern('seo:*');
}

/**
 * إبطال Cache لصفحة كاملة
 */
export async function invalidatePageContentCache(): Promise<void> {
  await cacheManager.deletePattern('page:*');
}

/**
 * إبطال Cache بالكامل
 */
export async function invalidateAllCache(): Promise<void> {
  await cacheManager.flush();
}

/**
 * إبطال Cache للصفحات
 */
export async function invalidatePagesCache(): Promise<void> {
  await cacheManager.deletePattern('pages:*');
}

/**
 * إبطال Cache للأقسام
 */
export async function invalidateSectionsCache(): Promise<void> {
  await cacheManager.deletePattern('sections:*');
}

export const publicContentRouter = router({
  /**
   * الحصول على المحتوى النصي العام
   */
  getTextContent: publicProcedure
    .input(
      z.object({
        key: z.string().optional(),
        language: z.string().default('ar'),
        section: z.string().optional(),
        type: z.enum(['text', 'title', 'subtitle', 'description', 'button', 'link']).optional(),
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [
        eq(textContent.isActive, 'yes'),
        eq(textContent.language, input.language),
        eq(textContent.status, 'published'),
        isNull(textContent.deletedAt),
      ];

      if (input.key) {
        conditions.push(eq(textContent.key, input.key));
      }
      if (input.section) {
        conditions.push(eq(textContent.section, input.section));
      }
      if (input.type) {
        conditions.push(eq(textContent.type, input.type));
      }

      const limit = input.limit || 50;
      const offset = input.offset || 0;

      const [content, totalCountResult] = await Promise.all([
        db
          .select()
          .from(textContent)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(textContent)
          .where(and(...conditions)),
      ]);

      return {
        data: content,
        pagination: {
          limit,
          offset,
          total: totalCountResult[0]?.count || 0,
          hasMore: offset + limit < (totalCountResult[0]?.count || 0),
        },
      };
    }),

  /**
   * الحصول على الصور العامة
   */
  getImages: publicProcedure
    .input(
      z.object({
        key: z.string().optional(),
        section: z.string().optional(),
        format: z.string().optional(),
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [
        eq(images.isActive, 'yes'),
        eq(images.status, 'published'),
        isNull(images.deletedAt),
      ];

      if (input.key) {
        conditions.push(eq(images.key, input.key));
      }
      if (input.section) {
        conditions.push(eq(images.section, input.section));
      }
      if (input.format) {
        conditions.push(eq(images.format, input.format));
      }

      const limit = input.limit || 50;
      const offset = input.offset || 0;

      const [imagesList, totalCountResult] = await Promise.all([
        db
          .select()
          .from(images)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(images)
          .where(and(...conditions)),
      ]);

      return {
        data: imagesList,
        pagination: {
          limit,
          offset,
          total: totalCountResult[0]?.count || 0,
          hasMore: offset + limit < (totalCountResult[0]?.count || 0),
        },
      };
    }),

  /**
   * الحصول على نظام الألوان العام
   */
  getColorScheme: publicProcedure
    .input(
      z.object({
        key: z.string().optional(),
        type: z.enum(['primary', 'secondary', 'accent', 'background', 'text', 'border']).optional(),
        shade: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('colors', input);
      const cached = await getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const conditions = [eq(colorScheme.isActive, 'yes')];

      if (input.key) {
        conditions.push(eq(colorScheme.key, input.key));
      }
      if (input.type) {
        conditions.push(eq(colorScheme.type, input.type));
      }
      if (input.shade) {
        conditions.push(eq(colorScheme.shade, input.shade));
      }

      const colors = await db
        .select()
        .from(colorScheme)
        .where(and(...conditions));

      await setCache(cacheKey, colors);
      return colors;
    }),

  /**
   * الحصول على إعدادات SEO العامة
   */
  getSEOSettings: publicProcedure
    .input(
      z.object({
        pageKey: z.string().optional(),
        slug: z.string().optional(),
        language: z.string().default('ar'),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('seo', input);
      const cached = await getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const conditions = [
        eq(seoSettings.isActive, 'yes'),
        eq(seoSettings.language, input.language),
        eq(seoSettings.status, 'published'),
        isNull(seoSettings.deletedAt),
      ];

      if (input.pageKey) {
        conditions.push(eq(seoSettings.pageKey, input.pageKey));
      }
      if (input.slug) {
        conditions.push(eq(seoSettings.slug, input.slug));
      }

      const seo = await db
        .select()
        .from(seoSettings)
        .where(and(...conditions));

      await setCache(cacheKey, seo);
      return seo;
    }),

  /**
   * الحصول على كل المحتوى العام لصفحة معينة
   */
  getPageContent: publicProcedure
    .input(
      z.object({
        section: z.string(),
        language: z.string().default('ar'),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('page', input);
      const cached = await getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const [textContents, imagesList, colors] = await Promise.all([
        db
          .select()
          .from(textContent)
          .where(
            and(
              eq(textContent.isActive, 'yes'),
              eq(textContent.language, input.language),
              eq(textContent.section, input.section),
              eq(textContent.status, 'published'),
              isNull(textContent.deletedAt)
            )
          ),
        db
          .select()
          .from(images)
          .where(
            and(
              eq(images.isActive, 'yes'),
              eq(images.section, input.section),
              eq(images.status, 'published'),
              isNull(images.deletedAt)
            )
          ),
        db.select().from(colorScheme).where(eq(colorScheme.isActive, 'yes')),
      ]);

      const result = {
        textContents,
        images: imagesList,
        colors,
      };

      await setCache(cacheKey, result);
      return result;
    }),

  /**
   * الحصول على الصفحات العامة
   */
  getPages: publicProcedure
    .input(
      z.object({
        type: z.enum(['main', 'sub']).optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        language: z.string().default('ar'),
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [
        eq(pages.isActive, input.isActive || 'yes'),
        eq(pages.status, 'published'),
        isNull(pages.deletedAt),
      ];

      if (input.type) {
        conditions.push(eq(pages.type, input.type));
      }

      const limit = input.limit || 50;
      const offset = input.offset || 0;

      const [pagesList, totalCountResult] = await Promise.all([
        db
          .select()
          .from(pages)
          .where(and(...conditions))
          .orderBy(pages.sortOrder)
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(pages)
          .where(and(...conditions)),
      ]);

      return {
        data: pagesList,
        pagination: {
          limit,
          offset,
          total: totalCountResult[0]?.count || 0,
          hasMore: offset + limit < (totalCountResult[0]?.count || 0),
        },
      };
    }),

  /**
   * الحصول على صفحة بواسطة الرابط (slug)
   */
  getPageBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        language: z.string().default('ar'),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('pageBySlug', input);
      const cached = await getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const page = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.slug, input.slug),
            eq(pages.isActive, 'yes'),
            eq(pages.status, 'published'),
            isNull(pages.deletedAt)
          )
        )
        .limit(1);

      await setCache(cacheKey, page[0] || null);
      return page[0] || null;
    }),

  /**
   * الحصول على الأقسام العامة
   */
  getSections: publicProcedure
    .input(
      z.object({
        pageId: z.number().optional(),
        type: z.string().optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [
        eq(sections.isActive, input.isActive || 'yes'),
        eq(sections.status, 'published'),
        isNull(sections.deletedAt),
      ];

      if (input.pageId) {
        conditions.push(eq(sections.pageId, input.pageId));
      }
      if (input.type) {
        conditions.push(eq(sections.type, input.type as any));
      }

      const limit = input.limit || 50;
      const offset = input.offset || 0;

      const [sectionsList, totalCountResult] = await Promise.all([
        db
          .select()
          .from(sections)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(sections.sortOrder)
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(sections)
          .where(conditions.length > 0 ? and(...conditions) : undefined),
      ]);

      return {
        data: sectionsList,
        pagination: {
          limit,
          offset,
          total: totalCountResult[0]?.count || 0,
          hasMore: offset + limit < (totalCountResult[0]?.count || 0),
        },
      };
    }),

  /**
   * الحصول على أقسام صفحة معينة
   */
  getSectionsByPageId: publicProcedure
    .input(
      z.object({
        pageId: z.number(),
        isActive: z.enum(['yes', 'no']).optional(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('sectionsByPageId', input);
      const cached = await getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const sectionsList = await db
        .select()
        .from(sections)
        .where(
          and(
            eq(sections.pageId, input.pageId),
            eq(sections.isActive, input.isActive || 'yes'),
            eq(sections.status, 'published'),
            isNull(sections.deletedAt)
          )
        )
        .orderBy(sections.sortOrder);

      await setCache(cacheKey, sectionsList);
      return sectionsList;
    }),

  /**
   * الحصول على كل المحتوى لصفحة معينة بواسطة pageId
   */
  getPageContentByPageId: publicProcedure
    .input(
      z.object({
        pageId: z.number(),
        language: z.string().default('ar'),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('pageContentByPageId', input);
      const cached = await getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const [textContents, imagesList, colors, sectionsList] = await Promise.all([
        db
          .select()
          .from(textContent)
          .where(
            and(
              eq(textContent.isActive, 'yes'),
              eq(textContent.language, input.language),
              eq(textContent.pageId, input.pageId),
              eq(textContent.status, 'published'),
              isNull(textContent.deletedAt)
            )
          ),
        db
          .select()
          .from(images)
          .where(
            and(
              eq(images.isActive, 'yes'),
              eq(images.pageId, input.pageId),
              eq(images.status, 'published'),
              isNull(images.deletedAt)
            )
          ),
        db.select().from(colorScheme).where(eq(colorScheme.isActive, 'yes')),
        db
          .select()
          .from(sections)
          .where(
            and(
              eq(sections.pageId, input.pageId),
              eq(sections.isActive, 'yes'),
              eq(sections.status, 'published'),
              isNull(sections.deletedAt)
            )
          )
          .orderBy(sections.sortOrder),
      ]);

      const sectionIds = sectionsList.map((section) => section.id);
      const sectionButtonsList =
        sectionIds.length > 0
          ? await db
              .select()
              .from(sectionButtons)
              .where(
                and(
                  inArray(sectionButtons.sectionId, sectionIds),
                  eq(sectionButtons.isActive, 'yes'),
                  eq(sectionButtons.status, 'published'),
                  isNull(sectionButtons.deletedAt)
                )
              )
              .orderBy(sectionButtons.sortOrder)
          : [];

      // إنشاء خريطة من sectionId إلى section name
      const sectionIdToNameMap = new Map<number, string>();
      sectionsList.forEach((section) => {
        sectionIdToNameMap.set(section.id, section.name);
      });

      // تحديث textContents لإضافة section name
      const textContentsWithSectionName = textContents.map((item) => ({
        ...item,
        sectionName: item.sectionId
          ? sectionIdToNameMap.get(item.sectionId) || item.section
          : item.section,
      }));

      // تحديث images لإضافة section name
      const imagesWithSectionName = imagesList.map((item) => ({
        ...item,
        sectionName: item.sectionId
          ? sectionIdToNameMap.get(item.sectionId) || item.section
          : item.section,
      }));

      const result = {
        textContents: textContentsWithSectionName,
        images: imagesWithSectionName,
        colors,
        sections: sectionsList,
        sectionButtons: sectionButtonsList,
        sectionIdToNameMap: Object.fromEntries(sectionIdToNameMap),
      };

      await setCache(cacheKey, result);
      return result;
    }),

  /**
   * يعيد نسخة المسودة فقط عند تقديم رمز معاينة قصير العمر. هذا المسار لا يستخدم
   * cache عام ولا يستعلم بالـslug، حتى لا تصبح مسودة الصفحة قابلة للاكتشاف.
   */
  getDraftPreview: publicProcedure
    .input(z.object({ token: z.string().min(40).max(128) }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const tokenHash = createHash('sha256').update(input.token).digest('hex');
      const now = new Date();
      const previewToken = await db
        .select()
        .from(cmsPreviewTokens)
        .where(
          and(
            eq(cmsPreviewTokens.tokenHash, tokenHash),
            gt(cmsPreviewTokens.expiresAt, now),
            isNull(cmsPreviewTokens.revokedAt)
          )
        )
        .limit(1);

      if (!previewToken[0]) {
        return null;
      }

      const language = previewToken[0].language;
      const page = await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, previewToken[0].pageId), isNull(pages.deletedAt)))
        .limit(1);
      if (!page[0]) {
        return null;
      }

      const [textContents, imagesList, colors, sectionsList] = await Promise.all([
        db
          .select()
          .from(textContent)
          .where(
            and(
              eq(textContent.isActive, 'yes'),
              eq(textContent.language, language),
              eq(textContent.pageId, page[0].id),
              ne(textContent.status, 'archived'),
              isNull(textContent.deletedAt)
            )
          ),
        db
          .select()
          .from(images)
          .where(
            and(
              eq(images.isActive, 'yes'),
              eq(images.pageId, page[0].id),
              ne(images.status, 'archived'),
              isNull(images.deletedAt)
            )
          ),
        db.select().from(colorScheme).where(eq(colorScheme.isActive, 'yes')),
        db
          .select()
          .from(sections)
          .where(
            and(
              eq(sections.pageId, page[0].id),
              eq(sections.isActive, 'yes'),
              ne(sections.status, 'archived'),
              isNull(sections.deletedAt)
            )
          )
          .orderBy(sections.sortOrder),
      ]);

      const sectionIds = sectionsList.map((section) => section.id);
      const sectionButtonsList =
        sectionIds.length > 0
          ? await db
              .select()
              .from(sectionButtons)
              .where(
                and(
                  inArray(sectionButtons.sectionId, sectionIds),
                  eq(sectionButtons.isActive, 'yes'),
                  ne(sectionButtons.status, 'archived'),
                  isNull(sectionButtons.deletedAt)
                )
              )
              .orderBy(sectionButtons.sortOrder)
          : [];

      const sectionIdToNameMap = new Map<number, string>();
      sectionsList.forEach((section) => sectionIdToNameMap.set(section.id, section.name));
      const withSectionName = <T extends { sectionId: number | null; section: string | null }>(
        items: T[]
      ) =>
        items.map((item) => ({
          ...item,
          sectionName: item.sectionId
            ? sectionIdToNameMap.get(item.sectionId) || item.section
            : item.section,
        }));

      return {
        language,
        page: page[0],
        textContents: withSectionName(textContents),
        images: withSectionName(imagesList),
        colors,
        sections: sectionsList,
        sectionButtons: sectionButtonsList,
        expiresAt: previewToken[0].expiresAt,
      };
    }),

  /**
   * الحصول على أزرار قسم معين
   */
  getSectionButtons: publicProcedure
    .input(
      z.object({
        sectionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('sectionButtons', input);
      const cached = await getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const buttons = await db
        .select()
        .from(sectionButtons)
        .where(
          and(
            eq(sectionButtons.sectionId, input.sectionId),
            eq(sectionButtons.isActive, 'yes'),
            eq(sectionButtons.status, 'published'),
            isNull(sectionButtons.deletedAt)
          )
        )
        .orderBy(sectionButtons.sortOrder);

      await setCache(cacheKey, buttons);
      return buttons;
    }),
});
