/**
 * Text Content Router
 * Router لإدارة المحتوى النصي
 */

import { z } from 'zod';
import { protectedProcedure, adminProcedure, router } from '../../_core/trpc';
import {
  contentEditProcedure,
  contentPublishProcedure,
  contentReadProcedure,
  assertContentCapability,
} from './authorization';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { eq, and, like, or, sql, inArray, isNull, count } from 'drizzle-orm';
import { textContent } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { invalidateTextContentCache } from '../public/content';
import {
  createContentUpdatedNotification,
  createContentDeletedNotification,
  createContentPublishedNotification,
} from '../../_core/notificationHelper';
import { cacheManager } from '../../services/redis';
import { auditLogService } from '../../services/content/auditLogService';

const logger = createLogger('textContent');

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
 * إبطال Cache للواجهات الإدارية للمحتوى النصي
 */
export async function invalidateAdminTextContentCache(): Promise<void> {
  await cacheManager.deletePattern('admin:textContent:*');
}

/**
 * Schema للتحقق من بيانات المحتوى النصي
 */
const textContentSchema = z.object({
  key: z.string().min(1).max(255),
  language: z.string().min(1).max(10),
  content: z.string().min(1),
  section: z.string().max(100).optional(),
  sectionId: z.number().optional(),
  pageId: z.number().optional(),
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
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isActive: z.enum(['yes', 'no']).default('yes'),
  publishedAt: z.date().optional(),
});

const homepageRequiredTextKeys = [
  'hero.title.ar',
  'hero.subtitle.ar',
  'hero.description.ar',
  'hero.button.ar',
  'stats.doctors.label.ar',
  'stats.specialties.label.ar',
  'stats.patients.label.ar',
  'stats.service.label.ar',
  'services.title.ar',
  'services.description.ar',
  'services.doctors.title.ar',
  'services.doctors.description.ar',
  'services.offers.title.ar',
  'services.offers.description.ar',
  'services.camps.title.ar',
  'services.camps.description.ar',
  'services.explore.button.ar',
  'about.title.ar',
  'about.description.ar',
  'about.features.global.title.ar',
  'about.features.global.description.ar',
  'about.features.comprehensive.title.ar',
  'about.features.comprehensive.description.ar',
  'about.features.specialized.title.ar',
  'about.features.specialized.description.ar',
  'about.additional.text1.ar',
  'about.additional.text2.ar',
  'about.image.caption.ar',
  'cta.title.ar',
  'cta.description.ar',
  'cta.book.button.ar',
  'cta.call.button.ar',
  'accessibility.skip.link.ar',
  'accessibility.back.to.top.ar',
  'accessibility.toggle.animations.ar',
  'accessibility.start.animations.ar',
] as const;

export const textContentRouter = router({
  /**
   * الحصول على جميع المحتوى النصي مع دعم البحث والتصفية والترحيل
   */
  list: contentReadProcedure
    .input(
      z.object({
        language: z.string().optional(),
        section: z.string().optional(),
        sectionId: z.number().optional(),
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
      const cacheKey = getAdminCacheKey('textContent:list', input);
      const cached = await getFromAdminCache(cacheKey);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const conditions = [isNull(textContent.deletedAt)];

      if (input.language) {
        conditions.push(eq(textContent.language, input.language));
      }
      if (input.section) {
        conditions.push(eq(textContent.section, input.section));
      }
      if (input.sectionId) {
        conditions.push(eq(textContent.sectionId, input.sectionId));
      }
      if (input.pageId) {
        conditions.push(eq(textContent.pageId, input.pageId));
      }
      if (input.type) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conditions.push(eq(textContent.type, input.type as any));
      }
      if (input.isActive) {
        conditions.push(eq(textContent.isActive, input.isActive));
      }
      if (input.status) {
        conditions.push(eq(textContent.status, input.status));
      }
      if (input.search) {
        const searchCondition = or(
          like(textContent.key, `%${input.search}%`),
          like(textContent.content, `%${input.search}%`),
          like(textContent.section, `%${input.search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      const offset = (input.page - 1) * input.limit;

      const result = await db
        .select()
        .from(textContent)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(textContent.createdAt)
        .limit(input.limit)
        .offset(offset);

      // الحصول على العدد الإجمالي للنتائج
      const totalCount = await db
        .select({ total: count() })
        .from(textContent)
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
   * الحصول على محتوى نصي واحد بواسطة المفتاح
   */
  getByKey: contentReadProcedure
    .input(z.object({ key: z.string(), language: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [eq(textContent.key, input.key)];
      if (input.language) {
        conditions.push(eq(textContent.language, input.language));
      }

      const result = await db
        .select()
        .from(textContent)
        .where(and(...conditions))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * الحصول على محتوى نصي واحد بواسطة المعرف
   */
  getById: contentReadProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(textContent).where(eq(textContent.id, input.id)).limit(1);

    return result[0] || null;
  }),

  /**
   * إنشاء محتوى نصي جديد
   */
  create: contentEditProcedure.input(textContentSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    if (input.status === 'published') {
      assertContentCapability(ctx.user.role, 'publish');
    }

    // التحقق من عدم تكرار key
    const existingKey = await db
      .select()
      .from(textContent)
      .where(eq(textContent.key, input.key))
      .limit(1);

    if (existingKey.length > 0) {
      throw new Error('المفتاح (key) مستخدم بالفعل. الرجاء اختيار مفتاح آخر.');
    }

    const insertId = await db
      .insert(textContent)
      .values({
        key: input.key,
        language: input.language,
        content: input.content,
        section: input.section,
        sectionId: input.sectionId,
        pageId: input.pageId,
        type: input.type,
        status: input.status,
        isActive: input.isActive,
        publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
      })
      .$returningId();

    // تسجيل التغيير في سجل التدقيق
    await auditLogService.logChange(db, {
      entityType: 'text',
      entityId: Number(insertId),
      action: 'create',
      userId: ctx.user?.id,
      newValue: JSON.stringify(input),
    });

    logger.info(`Text content created: ${input.key}`);

    // إبطال Cache للواجهات الإدارية والعامة
    await invalidateAdminTextContentCache();
    invalidateTextContentCache();

    // إنشاء إشعار للمستخدم الحالي
    if (ctx.user?.id) {
      await createContentUpdatedNotification(db, {
        userId: ctx.user.id,
        entityType: 'textContent',
        entityId: Number(insertId),
        entityName: input.key,
      });
    }

    return { success: true, id: Number(insertId) };
  }),

  /**
   * تحديث محتوى نصي موجود
   */
  update: contentEditProcedure
    .input(
      textContentSchema.extend({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      if (input.status === 'published') {
        assertContentCapability(ctx.user.role, 'publish');
      }

      // الحصول على القيمة القديمة قبل التحديث
      const oldContent = await db
        .select()
        .from(textContent)
        .where(eq(textContent.id, input.id))
        .limit(1);

      await db
        .update(textContent)
        .set({
          key: input.key,
          language: input.language,
          content: input.content,
          section: input.section,
          sectionId: input.sectionId,
          pageId: input.pageId,
          type: input.type,
          status: input.status,
          isActive: input.isActive,
          publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
        })
        .where(eq(textContent.id, input.id));

      // تسجيل التغيير في سجل التدقيق
      await auditLogService.logChange(db, {
        entityType: 'text',
        entityId: input.id,
        action: 'update',
        userId: ctx.user?.id,
        oldValue: oldContent[0] ? JSON.stringify(oldContent[0]) : undefined,
        newValue: JSON.stringify(input),
      });

      logger.info(`Text content updated: ${input.id}`);

      // إبطال Cache للواجهات الإدارية والعامة
      await invalidateAdminTextContentCache();
      invalidateTextContentCache();

      // إنشاء إشعار للمستخدم الحالي
      if (ctx.user?.id) {
        await createContentUpdatedNotification(db, {
          userId: ctx.user.id,
          entityType: 'textContent',
          entityId: input.id,
          entityName: input.key,
        });
      }

      return { success: true };
    }),

  /**
   * حذف محتوى نصي (حذف ناعم) - يتطلب صلاحيات admin
   */
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    // الحصول على المحتوى قبل الحذف
    const existing = await db
      .select()
      .from(textContent)
      .where(eq(textContent.id, input.id))
      .limit(1);

    await db.update(textContent).set({ deletedAt: new Date() }).where(eq(textContent.id, input.id));

    // تسجيل التغيير في سجل التدقيق
    await auditLogService.logChange(db, {
      entityType: 'text',
      entityId: input.id,
      action: 'delete',
      userId: ctx.user?.id,
      oldValue: existing && existing.length > 0 ? JSON.stringify(existing[0]) : undefined,
    });

    logger.info(`Text content deleted: ${input.id}`);

    // إبطال Cache للواجهات الإدارية والعامة
    await invalidateAdminTextContentCache();
    invalidateTextContentCache();

    // إنشاء إشعار للمستخدم الحالي
    if (ctx.user?.id && existing && existing.length > 0) {
      await createContentDeletedNotification(db, {
        userId: ctx.user.id,
        entityType: 'textContent',
        entityId: input.id,
        entityName: existing[0].key,
      });
    }

    return { success: true };
  }),

  /**
   * نشر محتوى نصي - يتطلب صلاحيات admin
   */
  publish: contentPublishProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      // الحصول على المحتوى قبل النشر
      const existing = await db
        .select()
        .from(textContent)
        .where(eq(textContent.id, input.id))
        .limit(1);

      await db
        .update(textContent)
        .set({ status: 'published', publishedAt: new Date() })
        .where(eq(textContent.id, input.id));

      logger.info(`Text content published: ${input.id}`);

      // إبطال Cache للواجهات الإدارية والعامة
      await invalidateAdminTextContentCache();
      invalidateTextContentCache();

      // إنشاء إشعار للمستخدم الحالي
      if (ctx.user?.id && existing && existing.length > 0) {
        await createContentPublishedNotification(db, {
          userId: ctx.user.id,
          entityType: 'textContent',
          entityId: input.id,
          entityName: existing[0].key,
        });
      }

      return { success: true };
    }),

  /**
   * أرشفة محتوى نصي - يتطلب صلاحيات admin
   */
  archive: contentPublishProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      await db.update(textContent).set({ status: 'archived' }).where(eq(textContent.id, input.id));

      logger.info(`Text content archived: ${input.id}`);

      // إبطال Cache للواجهات الإدارية والعامة
      await invalidateAdminTextContentCache();
      invalidateTextContentCache();

      return { success: true };
    }),

  /**
   * استعادة محتوى نصي محذوف
   */
  restore: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db
      .update(textContent)
      .set({ deletedAt: null, status: 'draft' })
      .where(eq(textContent.id, input.id));

    logger.info(`Text content restored: ${input.id}`);

    // إبطال Cache للواجهات الإدارية والعامة
    await invalidateAdminTextContentCache();
    invalidateTextContentCache();

    return { success: true };
  }),

  /**
   * نسخ محتوى نصي
   */
  duplicate: contentEditProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      // الحصول على المحتوى الأصلي
      const originalContent = await db
        .select()
        .from(textContent)
        .where(eq(textContent.id, input.id))
        .limit(1);

      if (!originalContent[0]) {
        throw new Error('المحتوى النصي غير موجود');
      }

      const content = originalContent[0];

      // إنشاء نسخة من المحتوى النصي
      const insertId = await db
        .insert(textContent)
        .values({
          key: `${content.key}-copy-${Date.now()}`,
          language: content.language,
          content: content.content,
          section: content.section,
          sectionId: content.sectionId,
          pageId: content.pageId,
          type: content.type,
          status: 'draft', // النسخة تكون مسودة افتراضياً
          isActive: 'no', // النسخة تكون معطلة افتراضياً
          publishedAt: null, // النسخة ليس لها تاريخ نشر
        })
        .$returningId();

      logger.info(`Text content duplicated: ${input.id} -> ${insertId}`);

      // إبطال Cache للواجهات الإدارية والعامة
      await invalidateAdminTextContentCache();
      invalidateTextContentCache();

      return { success: true, id: Number(insertId) };
    }),

  /**
   * الحصول على نظرة عامة على المحتوى النصي
   */
  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const allContent = await db.select().from(textContent);

    const total = allContent.length;
    const active = allContent.filter((c) => c.isActive === 'yes').length;

    return {
      total,
      active,
      inactive: total - active,
    };
  }),

  /**
   * تصدير المحتوى النصي
   */
  export: contentReadProcedure
    .input(
      z.object({
        language: z.string().optional(),
        section: z.string().optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [];

      if (input.language) {
        conditions.push(eq(textContent.language, input.language));
      }
      if (input.section) {
        conditions.push(eq(textContent.section, input.section));
      }
      if (input.status) {
        conditions.push(eq(textContent.status, input.status));
      }

      const result = await db
        .select()
        .from(textContent)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(textContent.createdAt);

      return {
        data: result,
        exportedAt: new Date(),
        count: result.length,
      };
    }),

  /**
   * استيراد المحتوى النصي - يتطلب صلاحيات admin
   */
  import: adminProcedure
    .input(
      z.object({
        data: z.array(
          z.object({
            key: z.string(),
            language: z.string(),
            content: z.string(),
            section: z.string().optional(),
            sectionId: z.number().optional(),
            pageId: z.number().optional(),
            type: z
              .enum([
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
              ])
              .optional(),
            status: z.enum(['draft', 'published', 'archived']).optional(),
            isActive: z.enum(['yes', 'no']).optional(),
          })
        ),
        overwrite: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const imported = [];
      const skipped = [];
      const errors = [];

      for (const item of input.data) {
        try {
          // التحقق من وجود المفتاح
          const existing = await db
            .select()
            .from(textContent)
            .where(eq(textContent.key, item.key))
            .limit(1);

          if (existing.length > 0 && !input.overwrite) {
            skipped.push({ key: item.key, reason: 'already exists' });
            continue;
          }

          if (existing.length > 0 && input.overwrite) {
            // تحديث السجل الموجود
            await db
              .update(textContent)
              .set({
                language: item.language,
                content: item.content,
                section: item.section,
                sectionId: item.sectionId,
                pageId: item.pageId,
                type: item.type,
                status: item.status || 'draft',
                isActive: item.isActive || 'yes',
                publishedAt: item.status === 'published' ? new Date() : null,
              })
              .where(eq(textContent.key, item.key));
            imported.push({ key: item.key, action: 'updated' });
          } else {
            // إنشاء سجل جديد
            await db.insert(textContent).values({
              key: item.key,
              language: item.language,
              content: item.content,
              section: item.section,
              sectionId: item.sectionId,
              pageId: item.pageId,
              type: item.type,
              status: item.status || 'draft',
              isActive: item.isActive || 'yes',
              publishedAt: item.status === 'published' ? new Date() : null,
            });
            imported.push({ key: item.key, action: 'created' });
          }
        } catch (error) {
          errors.push({
            key: item.key,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // إبطال Cache للمحتوى النصي
      invalidateTextContentCache();

      logger.info(
        `Text content import completed: ${imported.length} imported, ${skipped.length} skipped, ${errors.length} errors`
      );

      return {
        success: true,
        imported,
        skipped,
        errors,
        total: input.data.length,
      };
    }),

  /**
   * الحصول على المحتوى المحذوف
   */
  getDeleted: contentReadProcedure
    .input(
      z.object({
        language: z.string().optional(),
        section: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [];

      // إضافة شرط deletedAt ليس null
      conditions.push(sql`${textContent.deletedAt} is not null`);

      if (input.language) {
        conditions.push(eq(textContent.language, input.language));
      }
      if (input.section) {
        conditions.push(eq(textContent.section, input.section));
      }

      const offset = (input.page - 1) * input.limit;

      const result = await db
        .select()
        .from(textContent)
        .where(and(...conditions))
        .orderBy(textContent.deletedAt)
        .limit(input.limit)
        .offset(offset);

      // الحصول على العدد الإجمالي للنتائج المحذوفة
      const totalCount = await db
        .select({ count: textContent.id })
        .from(textContent)
        .where(and(...conditions));

      return {
        data: result,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / input.limit),
        },
      };
    }),

  /**
   * يقيس اكتمال النصوص المنشورة التي تستهلكها الصفحة الرئيسية الفعلية.
   */
  getHomepageReadiness: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const records = await db
      .select({ key: textContent.key, status: textContent.status, isActive: textContent.isActive })
      .from(textContent)
      .where(inArray(textContent.key, [...homepageRequiredTextKeys]));

    const availableKeys = new Set(
      records
        .filter((record) => record.status === 'published' && record.isActive === 'yes')
        .map((record) => record.key)
    );
    const missingKeys = homepageRequiredTextKeys.filter((key) => !availableKeys.has(key));

    return {
      total: homepageRequiredTextKeys.length,
      published: availableKeys.size,
      missingKeys,
      isReady: missingKeys.length === 0,
    };
  }),

  /**
   * إضافة بيانات الصفحة الرئيسية
   */
  seedHomepage: contentPublishProcedure.mutation(async () => {
    const db = await ensureDatabaseAvailable();
    const { pages } = await import('../../../drizzle/schema');
    const { eq, and } = await import('drizzle-orm');

    // 1. التحقق من وجود صفحة الصفحة الرئيسية
    const existingPages = await db.select().from(pages).where(eq(pages.slug, 'home'));

    let homepageId: number;

    if (existingPages.length === 0) {
      const insertResult = await db.insert(pages).values({
        name: 'الصفحة الرئيسية',
        slug: 'home',
        type: 'main',
        parentId: null,
        titleAr: 'المستشفى السعودي الألماني - صنعاء',
        titleEn: 'Saudi German Hospital – Sana’a',
        metaTitleAr: 'المستشفى السعودي الألماني - صنعاء | احجز موعدك الآن',
        metaTitleEn: 'Saudi German Hospital – Sana’a | Book Your Appointment Now',
        metaDescriptionAr:
          'احجز موعدك مع أفضل الأطباء في المستشفى السعودي الألماني بصنعاء. خدمات طبية متميزة، عروض خاصة، ومخيمات صحية مجانية.',
        metaDescriptionEn:
          'Book your appointment with the best doctors at Saudi German Hospital – Sana’a. Excellent medical services, special offers, and free medical camps.',
        keywordsAr:
          'المستشفى السعودي الألماني, صنعاء, حجز موعد, أطباء, عروض طبية, مخيمات صحية, استشارات طبية',
        keywordsEn:
          'Saudi German Hospital, Sana’a, book appointment, doctors, medical offers, health camps, medical consultations',
        isActive: 'yes',
        sortOrder: 1,
        status: 'published',
        publishedAt: new Date(),
      });

      homepageId = insertResult[0].insertId;
      logger.info(`Homepage page created: ${homepageId}`);
    } else {
      homepageId = existingPages[0].id;
      logger.info(`Homepage page exists: ${homepageId}`);
    }

    // 2. إضافة المحتوى النصي
    const contentData = [
      // Hero Section
      {
        key: 'hero.title.ar',
        language: 'ar',
        content: 'نرعاكم كأهالينا',
        section: 'hero',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'hero.title.en',
        language: 'en',
        content: 'Caring for You Like Family',
        section: 'hero',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'hero.subtitle.ar',
        language: 'ar',
        content: 'خدمات طبية متميزة بأعلى معايير الجودة',
        section: 'hero',
        pageId: homepageId,
        type: 'subtitle' as const,
      },
      {
        key: 'hero.subtitle.en',
        language: 'en',
        content: 'Excellent medical services with highest quality standards',
        section: 'hero',
        pageId: homepageId,
        type: 'subtitle' as const,
      },
      {
        key: 'hero.description.ar',
        language: 'ar',
        content: 'احجز موعدك مع أفضل الأطباء في صنعاء',
        section: 'hero',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'hero.description.en',
        language: 'en',
        content: "Book your appointment with the best doctors in Sana'a",
        section: 'hero',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'hero.button.ar',
        language: 'ar',
        content: 'احجز موعدك الآن',
        section: 'hero',
        pageId: homepageId,
        type: 'button' as const,
      },
      {
        key: 'hero.button.en',
        language: 'en',
        content: 'Book Your Appointment Now',
        section: 'hero',
        pageId: homepageId,
        type: 'button' as const,
      },

      // Stats Section
      {
        key: 'stats.doctors.label.ar',
        language: 'ar',
        content: 'طبيب واستشاري',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.doctors.label.en',
        language: 'en',
        content: 'Doctors and Consultants',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.specialties.label.ar',
        language: 'ar',
        content: 'تخصص طبي',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.specialties.label.en',
        language: 'en',
        content: 'Medical Specialties',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.patients.label.ar',
        language: 'ar',
        content: 'مريض سعيد',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.patients.label.en',
        language: 'en',
        content: 'Happy Patients',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.service.label.ar',
        language: 'ar',
        content: 'خدمة متواصلة',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'stats.service.label.en',
        language: 'en',
        content: 'Continuous Service',
        section: 'stats',
        pageId: homepageId,
        type: 'text' as const,
      },

      // Services Section
      {
        key: 'services.title.ar',
        language: 'ar',
        content: 'خدماتنا الإلكترونية',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.title.en',
        language: 'en',
        content: 'Our Electronic Services',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.doctors.title.ar',
        language: 'ar',
        content: 'حجز مواعيد الأطباء',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.doctors.title.en',
        language: 'en',
        content: 'Doctor Appointments',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.explore.button.ar',
        language: 'ar',
        content: 'استكشف الآن',
        section: 'services',
        pageId: homepageId,
        type: 'button' as const,
      },
      {
        key: 'services.explore.button.en',
        language: 'en',
        content: 'Explore Now',
        section: 'services',
        pageId: homepageId,
        type: 'button' as const,
      },

      // About Section
      {
        key: 'about.title.ar',
        language: 'ar',
        content: 'عن المستشفى السعودي الألماني - صنعاء',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'about.title.en',
        language: 'en',
        content: 'About Saudi German Hospital – Sana’a',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'about.features.global.title.ar',
        language: 'ar',
        content: 'معايير عالمية',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'about.features.global.title.en',
        language: 'en',
        content: 'World-Class Standards',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },

      // CTA Section
      {
        key: 'cta.title.ar',
        language: 'ar',
        content: 'ابدأ رحلتك الصحية معنا',
        section: 'cta',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'cta.title.en',
        language: 'en',
        content: 'Start Your Health Journey With Us',
        section: 'cta',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'cta.book.button.ar',
        language: 'ar',
        content: 'احجز موعدك',
        section: 'cta',
        pageId: homepageId,
        type: 'button' as const,
      },
      {
        key: 'cta.book.button.en',
        language: 'en',
        content: 'Book Your Appointment',
        section: 'cta',
        pageId: homepageId,
        type: 'button' as const,
      },
      {
        key: 'services.description.ar',
        language: 'ar',
        content: 'منصة إلكترونية متكاملة لحجز المواعيد والاستفادة من العروض والمخيمات الطبية.',
        section: 'services',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'services.doctors.description.ar',
        language: 'ar',
        content: 'احجز موعدك مع أفضل الأطباء والاستشاريين في مختلف التخصصات.',
        section: 'services',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'services.offers.title.ar',
        language: 'ar',
        content: 'العروض الطبية',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.offers.description.ar',
        language: 'ar',
        content: 'استفد من عروضنا الطبية المميزة بأسعار تنافسية وخدمات متكاملة.',
        section: 'services',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'services.camps.title.ar',
        language: 'ar',
        content: 'المخيمات الطبية الخيرية',
        section: 'services',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'services.camps.description.ar',
        language: 'ar',
        content: 'خدمات طبية مجانية للمجتمع ضمن مسؤوليتنا الاجتماعية.',
        section: 'services',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'about.description.ar',
        language: 'ar',
        content: 'نقدم رعاية صحية شاملة بمعايير عالمية وبفريق من الأطباء والاستشاريين المتخصصين.',
        section: 'about',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'about.features.global.description.ar',
        language: 'ar',
        content: 'نقدم خدمات طبية متميزة بمعايير عالمية.',
        section: 'about',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'about.features.comprehensive.title.ar',
        language: 'ar',
        content: 'رعاية شاملة',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'about.features.comprehensive.description.ar',
        language: 'ar',
        content: 'رعاية صحية متكاملة لجميع المرضى.',
        section: 'about',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'about.features.specialized.title.ar',
        language: 'ar',
        content: 'أطباء متخصصون',
        section: 'about',
        pageId: homepageId,
        type: 'title' as const,
      },
      {
        key: 'about.features.specialized.description.ar',
        language: 'ar',
        content: 'نخبة من الأطباء والاستشاريين المتخصصين.',
        section: 'about',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'about.additional.text1.ar',
        language: 'ar',
        content: 'نستخدم أحدث التقنيات والأجهزة لضمان أفضل النتائج الصحية.',
        section: 'about',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'about.additional.text2.ar',
        language: 'ar',
        content: 'نلتزم بالمسؤولية المجتمعية من خلال المخيمات الطبية الخيرية.',
        section: 'about',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'about.image.caption.ar',
        language: 'ar',
        content: 'المستشفى السعودي الألماني - صنعاء',
        section: 'about',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'cta.description.ar',
        language: 'ar',
        content: 'فريقنا الطبي في انتظارك. احجز موعدك أو تواصل معنا للاستفسار.',
        section: 'cta',
        pageId: homepageId,
        type: 'description' as const,
      },
      {
        key: 'cta.call.button.ar',
        language: 'ar',
        content: 'اتصل بنا',
        section: 'cta',
        pageId: homepageId,
        type: 'button' as const,
      },
      {
        key: 'accessibility.skip.link.ar',
        language: 'ar',
        content: 'تخطى إلى المحتوى الرئيسي',
        section: 'accessibility',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'accessibility.back.to.top.ar',
        language: 'ar',
        content: 'العودة إلى الأعلى',
        section: 'accessibility',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'accessibility.toggle.animations.ar',
        language: 'ar',
        content: 'إيقاف الحركات',
        section: 'accessibility',
        pageId: homepageId,
        type: 'text' as const,
      },
      {
        key: 'accessibility.start.animations.ar',
        language: 'ar',
        content: 'تشغيل الحركات',
        section: 'accessibility',
        pageId: homepageId,
        type: 'text' as const,
      },
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const item of contentData) {
      const existing = await db
        .select()
        .from(textContent)
        .where(and(eq(textContent.key, item.key), eq(textContent.language, item.language)));

      if (existing.length === 0) {
        await db.insert(textContent).values({
          ...item,
          isActive: 'yes',
          status: 'published',
          publishedAt: new Date(),
        });
        addedCount++;
      } else {
        skippedCount++;
      }
    }

    logger.info(`Homepage content seeded: ${addedCount} added, ${skippedCount} skipped`);

    // إبطال Cache للمحتوى النصي
    invalidateTextContentCache();

    return {
      success: true,
      homepageId,
      addedCount,
      skippedCount,
      total: contentData.length,
    };
  }),
});
