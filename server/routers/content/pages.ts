/**
 * Pages Router
 * Router لإدارة الصفحات
 */

import { z } from 'zod';
import { router } from '../../_core/trpc';
import {
  assertContentCapability,
  contentCreateProcedure,
  contentDeleteProcedure,
  contentPublishProcedure,
  contentReadProcedure,
  contentRestoreProcedure,
  contentUpdateProcedure,
} from './authorization';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { eq, and, like, or, isNull, count } from 'drizzle-orm';
import { pages } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { cacheManager } from '../../services/redis';
import { auditLogService } from '../../services/content/auditLogService';
import { assertPublicationQuality } from '../../services/content/publicationQualityGate';
import { contentVersionsService } from '../../services/content/contentVersionsService';

const logger = createLogger('pages');

async function savePageVersion(
  db: any,
  page: typeof pages.$inferSelect,
  userId: number | undefined,
  reason: string
) {
  return contentVersionsService.createVersion(db, {
    entityType: 'page',
    entityId: page.id,
    data: page,
    userId,
    reason,
  });
}

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
  qualityOverrideReason: z.string().max(500).optional(),
});

export const pagesRouter = router({
  /**
   * الحصول على جميع الصفحات مع دعم البحث والتصفية والترحيل
   */
  list: contentReadProcedure
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

      const conditions = [isNull(pages.deletedAt)];

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
        const searchCondition = or(
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
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
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
        .select({ total: count() })
        .from(pages)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const response = {
        data: result,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: Number(totalCount[0]?.total ?? 0),
          totalPages: Math.ceil(Number(totalCount[0]?.total ?? 0) / input.limit),
        },
      };

      await setAdminCache(cacheKey, response);
      return response;
    }),

  /**
   * الحصول على صفحة واحدة بواسطة المعرف
   */
  getById: contentReadProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);

    return result[0] || null;
  }),

  /**
   * الحصول على صفحة واحدة بواسطة الرابط (slug)
   */
  getBySlug: contentReadProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(pages).where(eq(pages.slug, input.slug)).limit(1);

    return result[0] || null;
  }),

  /**
   * الحصول على الصفحات الفرعية لصفحة رئيسية
   */
  getSubPages: contentReadProcedure
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
  getMainPages: contentReadProcedure.query(async () => {
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
  create: contentCreateProcedure.input(pageSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    if (input.status === 'published') {
      await assertContentCapability(ctx.user, 'publish');
      await assertPublicationQuality(db, {
        entityType: 'page',
        candidate: input,
        role: ctx.user.role,
        userId: ctx.user.id,
        overrideReason: input.qualityOverrideReason,
      });
    }

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
    const id = Number(insertId[0]?.id);
    const [createdPage] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (createdPage) {
      await savePageVersion(db, createdPage, ctx.user.id, 'إنشاء الصفحة');
    }

    // تسجيل التغيير في سجل التدقيق
    await auditLogService.logChange(db, {
      entityType: 'page',
      entityId: id,
      action: 'create',
      userId: ctx.user?.id,
      newValue: JSON.stringify(input),
    });

    logger.info(`Page created: ${input.slug}`);

    // إبطال Cache للواجهات الإدارية
    await invalidateAdminPagesCache();

    return { success: true, id };
  }),

  /**
   * تحديث صفحة موجودة
   */
  update: contentUpdateProcedure
    .input(
      pageSchema.extend({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      if (input.status === 'published') {
        await assertContentCapability(ctx.user, 'publish');
        await assertPublicationQuality(db, {
          entityType: 'page',
          entityId: input.id,
          candidate: input,
          role: ctx.user.role,
          userId: ctx.user.id,
          overrideReason: input.qualityOverrideReason,
        });
      }

      // الحصول على القيمة القديمة قبل التحديث
      const oldPage = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);
      if (!oldPage[0]) {
        throw new Error('الصفحة غير موجودة.');
      }

      // التحقق من عدم تكرار slug (باستثناء الصفحة الحالية)
      const existingSlug = await db.select().from(pages).where(eq(pages.slug, input.slug)).limit(1);

      if (existingSlug.length > 0 && existingSlug[0].id !== input.id) {
        throw new Error('الرابط (slug) مستخدم بالفعل. الرجاء اختيار رابط آخر.');
      }

      await savePageVersion(db, oldPage[0], ctx.user.id, 'نسخة قبل تحديث الصفحة');

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
  delete: contentDeleteProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      // الحصول على الصفحة قبل الحذف
      const existing = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);
      if (!existing[0]) {
        throw new Error('الصفحة غير موجودة.');
      }
      await savePageVersion(db, existing[0], ctx.user.id, 'نسخة قبل حذف الصفحة');

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
  publish: contentPublishProcedure
    .input(z.object({ id: z.number(), qualityOverrideReason: z.string().max(500).optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [page] = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);
      if (!page) {
        throw new Error('الصفحة غير موجودة.');
      }

      const quality = await assertPublicationQuality(db, {
        entityType: 'page',
        entityId: input.id,
        candidate: page,
        role: ctx.user.role,
        userId: ctx.user.id,
        overrideReason: input.qualityOverrideReason,
      });

      await savePageVersion(db, page, ctx.user.id, 'نسخة قبل نشر الصفحة');

      await db
        .update(pages)
        .set({ status: 'published', publishedAt: new Date() })
        .where(eq(pages.id, input.id));

      logger.info(`Page published: ${input.id}`);
      await invalidateAdminPagesCache();

      return { success: true, qualityOverride: quality.overridden };
    }),

  /**
   * أرشفة صفحة - يتطلب صلاحيات admin
   */
  archive: contentPublishProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [page] = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);
      if (!page) {
        throw new Error('الصفحة غير موجودة.');
      }
      await savePageVersion(db, page, ctx.user.id, 'نسخة قبل أرشفة الصفحة');

      await db.update(pages).set({ status: 'archived' }).where(eq(pages.id, input.id));

      logger.info(`Page archived: ${input.id}`);

      // إبطال Cache للواجهات الإدارية
      await invalidateAdminPagesCache();

      return { success: true };
    }),

  /**
   * استعادة صفحة محذوفة
   */
  restore: contentRestoreProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      const [page] = await db.select().from(pages).where(eq(pages.id, input.id)).limit(1);
      if (!page) {
        throw new Error('الصفحة غير موجودة.');
      }
      await savePageVersion(db, page, ctx.user.id, 'نسخة قبل استعادة الصفحة المحذوفة');

      await db
        .update(pages)
        .set({ deletedAt: null, status: 'draft' })
        .where(eq(pages.id, input.id));

      logger.info(`Page restored: ${input.id}`);

      // إبطال Cache للواجهات الإدارية
      await invalidateAdminPagesCache();

      return { success: true };
    }),

  /**
   * نسخ صفحة
   */
  duplicate: contentCreateProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
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
  getOverview: contentReadProcedure.query(async () => {
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
