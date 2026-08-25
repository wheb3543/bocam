/**
 * Sections Router
 * Router لإدارة الأقسام
 */

import { z } from 'zod';
import { adminProcedure, router } from '../../_core/trpc';
import {
  assertContentCapability,
  contentEditProcedure,
  contentPublishProcedure,
  contentReadProcedure,
} from './authorization';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { eq, and, like, or, isNull, count } from 'drizzle-orm';
import { sections } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { cacheManager } from '../../services/redis';
import { auditLogService } from '../../services/content/auditLogService';
import { assertPublicationQuality } from '../../services/content/publicationQualityGate';
import { contentVersionsService } from '../../services/content/contentVersionsService';

const logger = createLogger('sections');

async function saveSectionVersion(
  db: any,
  section: typeof sections.$inferSelect,
  userId: number | undefined,
  reason: string
) {
  return contentVersionsService.createVersion(db, {
    entityType: 'section',
    entityId: section.id,
    data: section,
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
 * إبطال Cache للواجهات الإدارية للأقسام
 */
export async function invalidateAdminSectionsCache(): Promise<void> {
  await cacheManager.deletePattern('admin:sections:*');
}

/**
 * Schema للتحقق من بيانات الأقسام
 */
const sectionSchema = z.object({
  pageId: z.number(),
  name: z.string().min(1).max(255),
  titleAr: z.string().max(255).optional(),
  titleEn: z.string().max(255).optional(),
  subtitleAr: z.string().max(255).optional(),
  subtitleEn: z.string().max(255).optional(),
  type: z
    .enum([
      'slider',
      'text',
      'text-cards',
      'stats-cards',
      'image-cards',
      'image',
      'video',
      'hero',
      'cta',
      'features',
      'testimonials',
      'faq',
      'contact',
      'pricing',
      'team',
      'gallery',
      'timeline',
      'custom',
    ])
    .default('text'),
  settings: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  sortOrder: z.number().default(0),
  isActive: z.enum(['yes', 'no']).default('yes'),
  publishedAt: z.date().optional(),
  qualityOverrideReason: z.string().max(500).optional(),
});

export const sectionsRouter = router({
  /**
   * الحصول على جميع الأقسام
   */
  list: contentReadProcedure
    .input(
      z.object({
        pageId: z.number().optional(),
        type: z.string().optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        search: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getAdminCacheKey('sections:list', input);
      const cached = await getFromAdminCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const conditions = [isNull(sections.deletedAt)];

      if (input.pageId) {
        conditions.push(eq(sections.pageId, input.pageId));
      }
      if (input.type) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conditions.push(eq(sections.type, input.type as any));
      }
      if (input.isActive) {
        conditions.push(eq(sections.isActive, input.isActive));
      }
      if (input.status) {
        conditions.push(eq(sections.status, input.status));
      }
      if (input.search) {
        const searchCondition = or(
          like(sections.name, `%${input.search}%`),
          like(sections.titleAr, `%${input.search}%`),
          like(sections.titleEn, `%${input.search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      const offset = (input.page - 1) * input.limit;

      const result = await db
        .select()
        .from(sections)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(sections.sortOrder)
        .limit(input.limit)
        .offset(offset);

      // الحصول على العدد الإجمالي للنتائج
      const totalCount = await db
        .select({ total: count() })
        .from(sections)
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
   * الحصول على قسم واحد بواسطة المعرف
   */
  getById: contentReadProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(sections).where(eq(sections.id, input.id)).limit(1);

    return result[0] || null;
  }),

  /**
   * الحصول على أقسام صفحة معينة
   */
  getByPageId: contentReadProcedure
    .input(z.object({ pageId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const result = await db
        .select()
        .from(sections)
        .where(eq(sections.pageId, input.pageId))
        .orderBy(sections.sortOrder);

      return result;
    }),

  /**
   * الحصول على الأقسام النشطة لصفحة معينة
   */
  getActiveByPageId: contentReadProcedure
    .input(z.object({ pageId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const result = await db
        .select()
        .from(sections)
        .where(and(eq(sections.pageId, input.pageId), eq(sections.isActive, 'yes')))
        .orderBy(sections.sortOrder);

      return result;
    }),

  /**
   * إنشاء قسم جديد
   */
  create: contentEditProcedure.input(sectionSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    if (input.status === 'published') {
      await assertContentCapability(ctx.user, 'publish');
      await assertPublicationQuality(db, {
        entityType: 'section',
        candidate: input,
        role: ctx.user.role,
        userId: ctx.user.id,
        overrideReason: input.qualityOverrideReason,
      });
    }

    const insertId = await db
      .insert(sections)
      .values({
        pageId: input.pageId,
        name: input.name,
        titleAr: input.titleAr,
        titleEn: input.titleEn,
        subtitleAr: input.subtitleAr,
        subtitleEn: input.subtitleEn,
        type: input.type,
        settings: input.settings,
        status: input.status,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
        publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
      })
      .$returningId();
    const id = Number(insertId[0]?.id);
    const [createdSection] = await db.select().from(sections).where(eq(sections.id, id)).limit(1);
    if (createdSection) {
      await saveSectionVersion(db, createdSection, ctx.user.id, 'إنشاء القسم');
    }

    // تسجيل التغيير في سجل التدقيق
    await auditLogService.logChange(db, {
      entityType: 'section',
      entityId: id,
      action: 'create',
      userId: ctx.user?.id,
      newValue: JSON.stringify(input),
    });

    logger.info(`Section created: ${input.name}`);

    // إبطال Cache للواجهات الإدارية
    await invalidateAdminSectionsCache();

    return { success: true, id };
  }),

  /**
   * تحديث قسم موجود
   */
  update: contentEditProcedure
    .input(
      sectionSchema.extend({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      if (input.status === 'published') {
        await assertContentCapability(ctx.user, 'publish');
        await assertPublicationQuality(db, {
          entityType: 'section',
          entityId: input.id,
          candidate: input,
          role: ctx.user.role,
          userId: ctx.user.id,
          overrideReason: input.qualityOverrideReason,
        });
      }

      // الحصول على القيمة القديمة قبل التحديث
      const oldSection = await db.select().from(sections).where(eq(sections.id, input.id)).limit(1);
      if (!oldSection[0]) {
        throw new Error('القسم غير موجود.');
      }

      await saveSectionVersion(db, oldSection[0], ctx.user.id, 'نسخة قبل تحديث القسم');

      await db
        .update(sections)
        .set({
          pageId: input.pageId,
          name: input.name,
          titleAr: input.titleAr,
          titleEn: input.titleEn,
          subtitleAr: input.subtitleAr,
          subtitleEn: input.subtitleEn,
          type: input.type,
          settings: input.settings,
          status: input.status,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
          publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
        })
        .where(eq(sections.id, input.id));

      // تسجيل التغيير في سجل التدقيق
      await auditLogService.logChange(db, {
        entityType: 'section',
        entityId: input.id,
        action: 'update',
        userId: ctx.user?.id,
        oldValue: oldSection[0] ? JSON.stringify(oldSection[0]) : undefined,
        newValue: JSON.stringify(input),
      });

      logger.info(`Section updated: ${input.id}`);

      // إبطال Cache للواجهات الإدارية
      await invalidateAdminSectionsCache();

      return { success: true };
    }),

  /**
   * حذف قسم (حذف ناعم) - يتطلب صلاحيات admin
   */
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    // الحصول على القسم قبل الحذف
    const existing = await db.select().from(sections).where(eq(sections.id, input.id)).limit(1);
    if (!existing[0]) {
      throw new Error('القسم غير موجود.');
    }
    await saveSectionVersion(db, existing[0], ctx.user.id, 'نسخة قبل حذف القسم');

    await db.update(sections).set({ deletedAt: new Date() }).where(eq(sections.id, input.id));

    // تسجيل التغيير في سجل التدقيق
    await auditLogService.logChange(db, {
      entityType: 'section',
      entityId: input.id,
      action: 'delete',
      userId: ctx.user?.id,
      oldValue: existing && existing.length > 0 ? JSON.stringify(existing[0]) : undefined,
    });

    logger.info(`Section soft deleted: ${input.id}`);

    // إبطال Cache للواجهات الإدارية
    await invalidateAdminSectionsCache();

    return { success: true };
  }),

  /**
   * نشر قسم - يتطلب صلاحيات admin
   */
  publish: contentPublishProcedure
    .input(z.object({ id: z.number(), qualityOverrideReason: z.string().max(500).optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [section] = await db.select().from(sections).where(eq(sections.id, input.id)).limit(1);
      if (!section) {
        throw new Error('القسم غير موجود.');
      }

      const quality = await assertPublicationQuality(db, {
        entityType: 'section',
        entityId: input.id,
        candidate: section,
        role: ctx.user.role,
        userId: ctx.user.id,
        overrideReason: input.qualityOverrideReason,
      });

      await saveSectionVersion(db, section, ctx.user.id, 'نسخة قبل نشر القسم');

      await db
        .update(sections)
        .set({ status: 'published', publishedAt: new Date() })
        .where(eq(sections.id, input.id));

      logger.info(`Section published: ${input.id}`);
      await invalidateAdminSectionsCache();

      return { success: true, qualityOverride: quality.overridden };
    }),

  /**
   * أرشفة قسم - يتطلب صلاحيات admin
   */
  archive: contentPublishProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [section] = await db.select().from(sections).where(eq(sections.id, input.id)).limit(1);
      if (!section) {
        throw new Error('القسم غير موجود.');
      }
      await saveSectionVersion(db, section, ctx.user.id, 'نسخة قبل أرشفة القسم');

      await db.update(sections).set({ status: 'archived' }).where(eq(sections.id, input.id));

      logger.info(`Section archived: ${input.id}`);

      // إبطال Cache للواجهات الإدارية
      await invalidateAdminSectionsCache();

      return { success: true };
    }),

  /**
   * استعادة قسم محذوف
   */
  restore: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    const [section] = await db.select().from(sections).where(eq(sections.id, input.id)).limit(1);
    if (!section) {
      throw new Error('القسم غير موجود.');
    }
    await saveSectionVersion(db, section, ctx.user.id, 'نسخة قبل استعادة القسم المحذوف');

    await db
      .update(sections)
      .set({ deletedAt: null, status: 'draft' })
      .where(eq(sections.id, input.id));

    logger.info(`Section restored: ${input.id}`);

    // إبطال Cache للواجهات الإدارية
    await invalidateAdminSectionsCache();

    return { success: true };
  }),

  /**
   * نسخ قسم
   */
  duplicate: contentEditProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      // الحصول على القسم الأصلي
      const originalSection = await db
        .select()
        .from(sections)
        .where(eq(sections.id, input.id))
        .limit(1);

      if (!originalSection[0]) {
        throw new Error('القسم غير موجود');
      }

      const section = originalSection[0];

      // إنشاء نسخة من القسم
      const insertId = await db
        .insert(sections)
        .values({
          pageId: section.pageId,
          name: `${section.name} (نسخة)`,
          titleAr: section.titleAr,
          titleEn: section.titleEn,
          subtitleAr: section.subtitleAr,
          subtitleEn: section.subtitleEn,
          type: section.type,
          status: 'draft', // النسخة تكون مسودة افتراضياً
          sortOrder: section.sortOrder + 1,
          isActive: 'no', // النسخة تكون معطلة افتراضياً
          publishedAt: null, // النسخة ليس لها تاريخ نشر
        })
        .$returningId();

      logger.info(`Section duplicated: ${input.id} -> ${insertId}`);

      // إبطال Cache للواجهات الإدارية
      await invalidateAdminSectionsCache();

      return { success: true, id: Number(insertId) };
    }),

  /**
   * تحديث ترتيب الأقسام
   */
  reorder: contentEditProcedure
    .input(
      z.object({
        sections: z.array(
          z.object({
            id: z.number(),
            sortOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      for (const section of input.sections) {
        await db
          .update(sections)
          .set({ sortOrder: section.sortOrder })
          .where(eq(sections.id, section.id));
      }

      logger.info(`Sections reordered: ${input.sections.length} sections`);

      return { success: true };
    }),

  /**
   * الحصول على نظرة عامة على الأقسام
   */
  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const allSections = await db.select().from(sections);

    const total = allSections.length;
    const active = allSections.filter((s) => s.isActive === 'yes').length;

    // Count by type
    const typeCounts: Record<string, number> = {};
    allSections.forEach((s) => {
      typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
    });

    return {
      total,
      active,
      inactive: total - active,
      typeCounts,
    };
  }),
});
