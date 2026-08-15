/**
 * Pages Router
 * Router لإدارة الصفحات
 */

import { z } from 'zod';
import { protectedProcedure, adminProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { eq, and, like, or } from 'drizzle-orm';
import { pages } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { cacheManager } from '../../services/redis';
import { auditLogService } from '../../services/content/auditLogService';

const logger = createLogger('pages');

const ADMIN_CACHE_TTL = 2 * 60; // 2 minutes for admin interfaces

function getAdminCacheKey(prefix: string, params: Record<string, unknown>): string {
  return `admin:${prefix}:${JSON.stringify(params)}`;
}

async function getFromAdminCache<T>(key: string): Promise<T | null> {
  return await cacheManager.get<T>(key);
}

async function setAdminCache(key: string, data: unknown): Promise<void> {
  await cacheManager.set(key, data, ADMIN_CACHE_TTL);
}

/**
 * إبطال Cache للواجهات الإدارية للصفحات
 */
export async function invalidateAdminPagesCache(): Promise<void> {
  await cacheManager.deletePattern('admin:pages:*');
}

/**
 * Schema للتحقق من بيانات الصفحات
 */
const pageSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  type: z.enum(['main', 'sub']).default('main'),
  parentId: z.number().optional(),
  titleAr: z.string().min(1).max(255),
  titleEn: z.string().min(1).max(255),
  metaTitleAr: z.string().max(255).optional(),
  metaTitleEn: z.string().max(255).optional(),
  metaDescriptionAr: z.string().optional(),
  metaDescriptionEn: z.string().optional(),
  keywordsAr: z.string().optional(),
  keywordsEn: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isActive: z.enum(['yes', 'no']).default('yes'),
  sortOrder: z.number().default(0),
  publishedAt: z.date().optional(),
});

export const pagesRouter = router({
  /**
   * الحصول على جميع الصفحات مع دعم البحث والتصفية والترحيل
   */
  list: protectedProcedure
    .input(
      z.object({
        type: z.enum(['main', 'sub']).optional(),
        parentId: z.number().optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        search: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getAdminCacheKey('pages:list', input);
      const cached = await getFromAdminCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const conditions = [];

      if (input.type) {
        conditions.push(eq(pages.type, input.type));
      }
      if (input.parentId !== undefined) {
        conditions.push(eq(pages.parentId, input.parentId));
      }
      if (input.isActive) {
        conditions.push(eq(pages.isActive, input.isActive));
      }
      if (input.status) {
        conditions.push(eq(pages.status, input.status));
      }
      if (input.search) {
        conditions.push(
          or(
            like(pages.name, `%${input.search}%`),
            like(pages.slug, `%${input.search}%`),
            like(pages.titleAr, `%${input.search}%`),
            like(pages.titleEn, `%${input.search}%`),
            like(pages.metaTitleAr, `%${input.search}%`),
            like(pages.metaTitleEn, `%${input.search}%`),
            like(pages.metaDescriptionAr, `%${input.search}%`),
            like(pages.metaDescriptionEn, `%${input.search}%`),
            like(pages.keywordsAr, `%${input.search}%`),
            like(pages.keywordsEn, `%${input.search}%`)
          )
        );
      }

      const offset = (input.page - 1) * input.limit;

      const result = await db
        .select()
        .from(pages)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(pages.sortOrder)
        .limit(input.limit)
        .offset(offset);

      // الحصول على العدد الإجمالي للنتائج
      const totalCount = await db
        .select({ count: pages.id })
        .from(pages)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const response = {
        data: result,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / input.limit),
        },
      };

      await setAdminCache(cacheKey, response);
      return response;
    }),

  /**
   * الحصول على صفحة واحدة بواسطة المعرف
   */
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);

    return result[0] || null;
  }),

  /**
   * الحصول على صفحة واحدة بواسطة الرابط (slug)
   */
  getBySlug: protectedProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(pages).where(eq(pages.slug, input.slug)).limit(1);

    return result[0] || null;
  }),

  /**
   * الحصول على الصفحات الفرعية لصفحة رئيسية
   */
  getSubPages: protectedProcedure
    .input(z.object({ parentId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const result = await db
        .select()
        .from(pages)
        .where(eq(pages.parentId, input.parentId))
        .orderBy(pages.sortOrder);

      return result;
    }),

  /**
   * الحصول على الصفحات الرئيسية فقط
   */
  getMainPages: protectedProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const result = await db
      .select()
      .from(pages)
      .where(eq(pages.type, 'main'))
      .orderBy(pages.sortOrder);

    return result;
  }),

  /**
   * إنشاء صفحة جديدة
   */
  create: protectedProcedure.input(pageSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    // التحقق من عدم تكرار slug
    const existingSlug = await db.select().from(pages).where(eq(pages.slug, input.slug)).limit(1);

    if (existingSlug.length > 0) {
      throw new Error('الرابط (slug) مستخدم بالفعل. الرجاء اختيار رابط آخر.');
    }

    const insertId = await db
      .insert(pages)
      .values({
        name: input.name,
        slug: input.slug,
        type: input.type,
        parentId: input.parentId,
        titleAr: input.titleAr,
        titleEn: input.titleEn,
        metaTitleAr: input.metaTitleAr,
        metaTitleEn: input.metaTitleEn,
        metaDescriptionAr: input.metaDescriptionAr,
        metaDescriptionEn: input.metaDescriptionEn,
        keywordsAr: input.keywordsAr,
        keywordsEn: input.keywordsEn,
        status: input.status,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
        publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
      })
      .$returningId();

    // تسجيل التغيير في سجل التدقيق
    await auditLogService.logChange(db, {
      entityType: 'page',
      entityId: Number(insertId),
      action: 'create',
      userId: ctx.user?.id,
      newValue: JSON.stringify(input),
    });

    logger.info(`Page created: ${input.slug}`);

    // إبطال Cache للواجهات الإدارية
    await invalidateAdminPagesCache();

    return { success: true, id: Number(insertId[0].id) };
  }),

  /**
   * تحديث صفحة موجودة
   */
  update: protectedProcedure
    .input(
      pageSchema.extend({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      // الحصول على القيمة القديمة قبل التحديث
      const oldPage = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);

      // التحقق من عدم تكرار slug (باستثناء الصفحة الحالية)
      const existingSlug = await db.select().from(pages).where(eq(pages.slug, input.slug)).limit(1);

      if (existingSlug.length > 0 && existingSlug[0].id !== input.id) {
        throw new Error('الرابط (slug) مستخدم بالفعل. الرجاء اختيار رابط آخر.');
      }

      await db
        .update(pages)
        .set({
          name: input.name,
          slug: input.slug,
          type: input.type,
          parentId: input.parentId,
          titleAr: input.titleAr,
          titleEn: input.titleEn,
          metaTitleAr: input.metaTitleAr,
          metaTitleEn: input.metaTitleEn,
          metaDescriptionAr: input.metaDescriptionAr,
          metaDescriptionEn: input.metaDescriptionEn,
          keywordsAr: input.keywordsAr,
          keywordsEn: input.keywordsEn,
          status: input.status,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
          publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
        })
        .where(eq(pages.id, input.id));

      // تسجيل التغيير في سجل التدقيق
      await auditLogService.logChange(db, {
        entityType: 'page',
        entityId: input.id,
        action: 'update',
        userId: ctx.user?.id,
        oldValue: oldPage[0] ? JSON.stringify(oldPage[0]) : undefined,
        newValue: JSON.stringify(input),
      });

      logger.info(`Page updated: ${input.id}`);

      // إبطال Cache للواجهات الإدارية
      await invalidateAdminPagesCache();

      return { success: true };
    }),

  /**
   * حذف صفحة (حذف ناعم) - يتطلب صلاحيات admin
   */
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    // الحصول على الصفحة قبل الحذف
    const existing = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);

    await db.update(pages).set({ deletedAt: new Date() }).where(eq(pages.id, input.id));

    // تسجيل التغيير في سجل التدقيق
    await auditLogService.logChange(db, {
      entityType: 'page',
      entityId: input.id,
      action: 'delete',
      userId: ctx.user?.id,
      oldValue: existing && existing.length > 0 ? JSON.stringify(existing[0]) : undefined,
    });

    logger.info(`Page soft deleted: ${input.id}`);

    // إبطال Cache للواجهات الإدارية
    await invalidateAdminPagesCache();

    return { success: true };
  }),

  /**
   * نشر صفحة - يتطلب صلاحيات admin
   */
  publish: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db
      .update(pages)
      .set({ status: 'published', publishedAt: new Date() })
      .where(eq(pages.id, input.id));

    logger.info(`Page published: ${input.id}`);

    // إبطال Cache للواجهات الإدارية
    await invalidateAdminPagesCache();

    return { success: true };
  }),

  /**
   * أرشفة صفحة - يتطلب صلاحيات admin
   */
  archive: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.update(pages).set({ status: 'archived' }).where(eq(pages.id, input.id));

    logger.info(`Page archived: ${input.id}`);

    // إبطال Cache للواجهات الإدارية
    await invalidateAdminPagesCache();

    return { success: true };
  }),

  /**
   * استعادة صفحة محذوفة
   */
  restore: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.update(pages).set({ deletedAt: null, status: 'draft' }).where(eq(pages.id, input.id));

    logger.info(`Page restored: ${input.id}`);

    // إبطال Cache للواجهات الإدارية
    await invalidateAdminPagesCache();

    return { success: true };
  }),

  /**
   * نسخ صفحة
   */
  duplicate: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    // الحصول على الصفحة الأصلية
    const originalPage = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);

    if (!originalPage[0]) {
      throw new Error('الصفحة غير موجودة');
    }

    const page = originalPage[0];

    // إنشاء نسخة من الصفحة
    const insertId = await db
      .insert(pages)
      .values({
        name: `${page.name} (نسخة)`,
        slug: `${page.slug}-copy-${Date.now()}`,
        type: page.type,
        parentId: page.parentId,
        titleAr: `${page.titleAr} (نسخة)`,
        titleEn: `${page.titleEn} (Copy)`,
        metaTitleAr: page.metaTitleAr,
        metaTitleEn: page.metaTitleEn,
        metaDescriptionAr: page.metaDescriptionAr,
        metaDescriptionEn: page.metaDescriptionEn,
        keywordsAr: page.keywordsAr,
        keywordsEn: page.keywordsEn,
        status: 'draft', // النسخة تكون مسودة افتراضياً
        isActive: 'no', // النسخة تكون معطلة افتراضياً
        sortOrder: page.sortOrder + 1,
        publishedAt: null, // النسخة ليس لها تاريخ نشر
      })
      .$returningId();

    logger.info(`Page duplicated: ${input.id} -> ${insertId}`);

    return { success: true, id: Number(insertId) };
  }),

  /**
   * الحصول على نظرة عامة على الصفحات
   */
  getOverview: protectedProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const allPages = await db.select().from(pages);

    const total = allPages.length;
    const active = allPages.filter((p) => p.isActive === 'yes').length;
    const mainPages = allPages.filter((p) => p.type === 'main').length;
    const subPages = allPages.filter((p) => p.type === 'sub').length;

    return {
      total,
      active,
      inactive: total - active,
      mainPages,
      subPages,
    };
  }),
});
