/**
 * Blog Router
 * راوتر إدارة مقالات المدونة الطبية وتصنيفاتها
 *
 * يتبع نفس حوكمة بقية كيانات CMS: بوابة جودة نشر موحّدة، سجل تدقيق،
 * نسخ محفوظة للتراجع، حذف ناعم، وجدولة نشر مؤجلة.
 */

import { TRPCError } from '@trpc/server';
import { and, asc, count, desc, eq, isNull, like, or } from 'drizzle-orm';
import { z } from 'zod';
import { blogCategories, blogPosts } from '../../../../../drizzle/schema';
import { createLogger } from '../../../../_core/logger';
import { ensureDatabaseAvailable } from '../../../../_core/databaseGuard';
import { auditLogService } from '../../../../services/content/auditLogService';
import { cacheManager } from '../../../../services/redis';
import { contentVersionsService } from '../../../../services/content/contentVersionsService';
import { assertPublicationQuality } from '../../../../services/content/publicationQualityGate';
import { createContentPublishedNotification } from '../../../../services/notificationHelper';
import { router } from '../../../../_core/trpc';
import {
  assertContentCapability,
  contentCreateProcedure,
  contentDeleteProcedure,
  contentPublishProcedure,
  contentReadProcedure,
  contentRestoreProcedure,
  contentUpdateProcedure,
} from './authorization';
import {
  buildBlogExcerpt,
  calculateReadingTime,
  hasMeaningfulBlogContent,
  resolveUniqueBlogSlug,
  sanitizeBlogHtml,
  slugifyText,
} from '../../services/content/blogContentService';

const logger = createLogger('blog');

type DbClient = Awaited<ReturnType<typeof ensureDatabaseAvailable>>;

/**
 * إبطال كاش المدونة في واجهتي الإدارة والواجهة العامة.
 * يُستدعى عند أي عملية كتابة أو تغيير حالة نشر.
 */
export async function invalidateBlogCache(): Promise<void> {
  await cacheManager.deletePattern('blog:*');
  await cacheManager.deletePattern('admin:blog:*');
}

/** إبطال كاش واجهة الإدارة فقط. */
export async function invalidateAdminBlogCache(): Promise<void> {
  await cacheManager.deletePattern('admin:blog:*');
}

const blogCategoryInputSchema = z.object({
  name: z.string().trim().min(2, 'اسم التصنيف مطلوب').max(255),
  nameEn: z.string().trim().max(255).optional(),
  description: z.string().trim().max(2000).optional(),
  icon: z.string().trim().max(100).optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{3,8}$/, 'اللون يجب أن يكون بصيغة hex مثل #1ca8e5')
    .optional(),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isActive: z.enum(['yes', 'no']).default('yes'),
  qualityOverrideReason: z.string().trim().max(500).optional(),
});

const blogPostInputSchema = z.object({
  title: z.string().trim().min(3, 'عنوان المقال مطلوب').max(255),
  titleEn: z.string().trim().max(255).optional(),
  slug: z.string().trim().max(255).optional(),
  excerpt: z.string().trim().max(1000).optional(),
  excerptEn: z.string().trim().max(1000).optional(),
  content: z.string().min(1, 'محتوى المقال مطلوب').max(400_000),
  contentEn: z.string().max(400_000).optional(),
  coverImage: z.string().trim().max(500).optional(),
  coverImageAlt: z.string().trim().max(255).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  reviewerName: z.string().trim().max(255).optional(),
  reviewDate: z.coerce.date().nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isActive: z.enum(['yes', 'no']).default('yes'),
  isFeatured: z.enum(['yes', 'no']).default('no'),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  metaTitle: z.string().trim().max(255).optional(),
  metaDescription: z.string().trim().max(500).optional(),
  keywords: z.string().trim().max(1000).optional(),
  ogImage: z.string().trim().max(500).optional(),
  scheduledFor: z.coerce.date().nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  qualityOverrideReason: z.string().trim().max(500).optional(),
});

/** معيار الفرز الموحّد بين لوحة الإدارة والواجهة العامة. */
export type BlogSortOrder = 'created-desc' | 'created-asc' | 'title-asc' | 'title-desc';

export const BLOG_SORT_ORDERS: readonly BlogSortOrder[] = [
  'created-desc',
  'created-asc',
  'title-asc',
  'title-desc',
];

/** يبني شرط الترتيب من معيار الفرز. */
export function buildBlogOrderBy(sort: BlogSortOrder) {
  switch (sort) {
    case 'created-asc':
      return [asc(blogPosts.publishedAt), asc(blogPosts.id)];
    case 'title-asc':
      return [asc(blogPosts.title), asc(blogPosts.id)];
    case 'title-desc':
      return [desc(blogPosts.title), desc(blogPosts.id)];
    case 'created-desc':
    default:
      return [desc(blogPosts.publishedAt), desc(blogPosts.id)];
  }
}

/** رسالة موحّدة عند محاولة نشر مقال بجسم فارغ. */
function emptyContentError(): TRPCError {
  return new TRPCError({
    code: 'PRECONDITION_FAILED',
    message: 'فشل فحص جودة النشر:\n• لا يمكن نشر مقال بجسم فارغ أو بلا محتوى مفيد.',
  });
}

/** يحفظ نسخة قابلة للتراجع في كل مرة تُنشأ أو تُعدَّل فيها مقال. */
async function saveBlogPostVersion(
  db: DbClient,
  post: typeof blogPosts.$inferSelect,
  userId: number | undefined,
  reason: string
) {
  await contentVersionsService.createVersion(db, {
    entityType: 'blogPost',
    entityId: post.id,
    data: post,
    userId,
    reason,
  });
}

export const blogRouter = router({
  /**
   * قائمة مقالات المدونة للوحة الإدارة (تشمل المسودات والمنشورة).
   */
  list: contentReadProcedure
    .input(
      z.object({
        search: z.string().trim().max(200).optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        categoryId: z.number().int().positive().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const conditions = [isNull(blogPosts.deletedAt)];

      if (input.status) {
        conditions.push(eq(blogPosts.status, input.status));
      }
      if (input.isActive) {
        conditions.push(eq(blogPosts.isActive, input.isActive));
      }
      if (input.categoryId) {
        conditions.push(eq(blogPosts.categoryId, input.categoryId));
      }
      if (input.search) {
        const term = `%${input.search}%`;
        const searchCondition = or(
          like(blogPosts.title, term),
          like(blogPosts.titleEn, term),
          like(blogPosts.slug, term),
          like(blogPosts.excerpt, term),
          like(blogPosts.reviewerName, term)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      const where = and(...conditions);
      const offset = (input.page - 1) * input.limit;

      const [rows, totalRows] = await Promise.all([
        db
          .select({
            id: blogPosts.id,
            title: blogPosts.title,
            slug: blogPosts.slug,
            excerpt: blogPosts.excerpt,
            coverImage: blogPosts.coverImage,
            coverImageAlt: blogPosts.coverImageAlt,
            status: blogPosts.status,
            isActive: blogPosts.isActive,
            isFeatured: blogPosts.isFeatured,
            sortOrder: blogPosts.sortOrder,
            readingTime: blogPosts.readingTime,
            viewsCount: blogPosts.viewsCount,
            categoryId: blogPosts.categoryId,
            categoryName: blogCategories.name,
            reviewerName: blogPosts.reviewerName,
            publishedAt: blogPosts.publishedAt,
            scheduledFor: blogPosts.scheduledFor,
            createdAt: blogPosts.createdAt,
            updatedAt: blogPosts.updatedAt,
          })
          .from(blogPosts)
          .leftJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
          .where(where)
          .orderBy(...buildBlogOrderBy('created-desc'), asc(blogPosts.sortOrder))
          .limit(input.limit)
          .offset(offset),
        db.select({ total: count() }).from(blogPosts).where(where),
      ]);

      const total = Number(totalRows[0]?.total ?? 0);

      return {
        data: rows,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  /** جلب مقال واحد بالمعرّف (يشمل المسودات). */
  getById: contentReadProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const [row] = await db
        .select({ post: blogPosts, category: blogCategories })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
        .where(and(eq(blogPosts.id, input.id), isNull(blogPosts.deletedAt)))
        .limit(1);

      if (!row) {
        return null;
      }

      return {
        ...row.post,
        categoryName: row.category?.name ?? null,
        categorySlug: row.category?.slug ?? null,
      };
    }),

  /** إحصاءات سريعة لبطاقات لوحة إدارة المدونة. */
  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const [rows, categoryRows] = await Promise.all([
      db
        .select({
          status: blogPosts.status,
          isActive: blogPosts.isActive,
          isFeatured: blogPosts.isFeatured,
        })
        .from(blogPosts)
        .where(isNull(blogPosts.deletedAt)),
      db.select({ total: count() }).from(blogCategories).where(isNull(blogCategories.deletedAt)),
    ]);

    return {
      total: rows.length,
      published: rows.filter((r) => r.status === 'published').length,
      draft: rows.filter((r) => r.status === 'draft').length,
      archived: rows.filter((r) => r.status === 'archived').length,
      featured: rows.filter((r) => r.isFeatured === 'yes').length,
      inactive: rows.filter((r) => r.isActive === 'no').length,
      categories: Number(categoryRows[0]?.total ?? 0),
    };
  }),

  /** حذف كل مفاتيح كاش المدونة (تشغيل يدوي عند الحاجة). */
  purgeCache: contentUpdateProcedure.mutation(async () => {
    await invalidateBlogCache();
    return { success: true };
  }),

  /**
   * إنشاء مقال جديد.
   * نعقّم جسم المحتوى على الخادم، ونحسب وقت القراءة، ونولّد رابطاً فريداً.
   */
  create: contentCreateProcedure.input(blogPostInputSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    if (input.status === 'published') {
      await assertContentCapability(ctx.user, 'publish');
      // دفاع متعدد الطبقات: لا ننشر قشرة فارغة أو محتوى تالف بالكامل.
      if (!hasMeaningfulBlogContent(input.content)) {
        throw emptyContentError();
      }
    }

    const slug = await resolveUniqueBlogSlug(db, input.slug || input.title);
    const content = sanitizeBlogHtml(input.content);
    const contentEn = input.contentEn ? sanitizeBlogHtml(input.contentEn) : null;
    const excerpt = input.excerpt?.trim() || buildBlogExcerpt(content) || input.title;
    const readingTime = calculateReadingTime(content);

    if (input.status === 'published') {
      await assertPublicationQuality(db, {
        entityType: 'blogPost',
        candidate: {
          slug,
          title: input.title,
          description: input.metaDescription || excerpt,
          url: input.coverImage,
          altAr: input.coverImageAlt,
        },
        role: ctx.user.role,
        userId: ctx.user.id,
        overrideReason: input.qualityOverrideReason,
      });
    }

    const insertId = await db
      .insert(blogPosts)
      .values({
        title: input.title,
        titleEn: input.titleEn ?? null,
        slug,
        excerpt,
        excerptEn: input.excerptEn?.trim() || null,
        content,
        contentEn,
        coverImage: input.coverImage || null,
        coverImageAlt: input.coverImageAlt || null,
        categoryId: input.categoryId ?? null,
        authorId: ctx.user.id,
        reviewerName: input.reviewerName || null,
        reviewDate: input.reviewDate ?? null,
        tags: input.tags && input.tags.length > 0 ? JSON.stringify(input.tags) : null,
        readingTime,
        status: input.status,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
        metaTitle: input.metaTitle || null,
        metaDescription: input.metaDescription || null,
        keywords: input.keywords || null,
        ogImage: input.ogImage || input.coverImage || null,
        scheduledFor: input.scheduledFor ?? null,
        publishedAt:
          input.status === 'published' ? (input.publishedAt ?? new Date()) : input.publishedAt,
      })
      .$returningId();

    const id = Number(insertId[0]?.id);
    const [created] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (created) {
      await saveBlogPostVersion(db, created, ctx.user.id, 'إنشاء مقال المدونة');
    }

    await auditLogService.logChange(db, {
      entityType: 'blogPost',
      entityId: id,
      action: 'create',
      userId: ctx.user.id,
      newValue: JSON.stringify({ ...input, slug, readingTime }),
    });

    if (input.status === 'published') {
      await createContentPublishedNotification(db, {
        userId: ctx.user.id,
        entityType: 'blogPost',
        entityId: id,
        entityName: input.title,
      });
    }

    await invalidateBlogCache();
    logger.info(`Blog post created: ${slug}`);

    return { success: true, id, slug, readingTime };
  }),

  /** تحديث مقال قائم مع إعادة حساب الرابط إن تغيّر العنوان. */
  update: contentUpdateProcedure
    .input(blogPostInputSchema.extend({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      const [current] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.id, input.id), isNull(blogPosts.deletedAt)))
        .limit(1);

      if (!current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المقال غير موجود.' });
      }

      if (input.status === 'published') {
        await assertContentCapability(ctx.user, 'publish');
        if (!hasMeaningfulBlogContent(input.content)) {
          throw emptyContentError();
        }
      }

      const content = sanitizeBlogHtml(input.content);
      const contentEn = input.contentEn ? sanitizeBlogHtml(input.contentEn) : null;
      const excerpt = input.excerpt?.trim() || buildBlogExcerpt(content) || input.title;
      const readingTime = calculateReadingTime(content);

      // نُبقي الرابط السابق إلا إذا غيّره المحرر صراحةً أو تغيّر العنوان.
      const shouldRebuildSlug =
        (Boolean(input.slug) && input.slug !== current.slug) || input.title !== current.title;
      const slug = shouldRebuildSlug
        ? await resolveUniqueBlogSlug(db, input.slug || input.title, { excludeId: input.id })
        : current.slug;

      await db
        .update(blogPosts)
        .set({
          title: input.title,
          titleEn: input.titleEn ?? null,
          slug,
          excerpt,
          excerptEn: input.excerptEn?.trim() || null,
          content,
          contentEn,
          coverImage: input.coverImage || null,
          coverImageAlt: input.coverImageAlt || null,
          categoryId: input.categoryId ?? null,
          reviewerName: input.reviewerName || null,
          reviewDate: input.reviewDate ?? null,
          tags: input.tags && input.tags.length > 0 ? JSON.stringify(input.tags) : null,
          readingTime,
          status: input.status,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
          sortOrder: input.sortOrder,
          metaTitle: input.metaTitle || null,
          metaDescription: input.metaDescription || null,
          keywords: input.keywords || null,
          ogImage: input.ogImage || input.coverImage || null,
          scheduledFor: input.scheduledFor ?? null,
          publishedAt:
            input.status === 'published' && !current.publishedAt
              ? (input.publishedAt ?? new Date())
              : input.publishedAt,
        })
        .where(eq(blogPosts.id, input.id));

      const [updated] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);
      if (updated) {
        await saveBlogPostVersion(db, updated, ctx.user.id, 'تحديث مقال المدونة');
      }

      await auditLogService.logChange(db, {
        entityType: 'blogPost',
        entityId: input.id,
        action: 'update',
        userId: ctx.user.id,
        oldValue: JSON.stringify({
          title: current.title,
          slug: current.slug,
          status: current.status,
        }),
        newValue: JSON.stringify({ title: input.title, slug, status: input.status }),
      });

      await invalidateBlogCache();

      return { success: true, slug, readingTime };
    }),

  /** حذف ناعم للمقال (يظهر في سلة محذوفات CMS). */
  delete: contentDeleteProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [current] = await db
        .select({ id: blogPosts.id, title: blogPosts.title, status: blogPosts.status })
        .from(blogPosts)
        .where(and(eq(blogPosts.id, input.id), isNull(blogPosts.deletedAt)))
        .limit(1);

      if (!current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المقال غير موجود أو محذوف مسبقاً.' });
      }

      await db
        .update(blogPosts)
        .set({ deletedAt: new Date(), status: 'archived' })
        .where(eq(blogPosts.id, input.id));

      await auditLogService.logChange(db, {
        entityType: 'blogPost',
        entityId: input.id,
        action: 'delete',
        userId: ctx.user.id,
        oldValue: JSON.stringify(current),
        reason: 'حذف ناعم لمقال المدونة',
      });

      await invalidateBlogCache();
      return { success: true };
    }),

  /** استعادة مقال محذوف من سلة المحذوفات. */
  restore: contentRestoreProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [current] = await db
        .select({ status: blogPosts.status })
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);

      if (!current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المقال غير موجود.' });
      }

      await db
        .update(blogPosts)
        .set({
          deletedAt: null,
          status: current.status === 'archived' ? 'draft' : current.status,
        })
        .where(eq(blogPosts.id, input.id));

      await auditLogService.logChange(db, {
        entityType: 'blogPost',
        entityId: input.id,
        action: 'update',
        userId: ctx.user.id,
        reason: 'استعادة مقال المدونة من سلة المحذوفات',
      });

      await invalidateBlogCache();
      return { success: true };
    }),

  /** تكرار مقال كمسودة جديدة (يحصل على رابط فريد تلقائياً). */
  duplicate: contentCreateProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [source] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.id, input.id), isNull(blogPosts.deletedAt)))
        .limit(1);

      if (!source) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المقال غير موجود.' });
      }

      const slug = await resolveUniqueBlogSlug(db, `${source.title} نسخة`);
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = source;

      const insertId = await db
        .insert(blogPosts)
        .values({
          ...rest,
          title: `${source.title} (نسخة)`,
          slug,
          status: 'draft',
          isActive: 'no',
          isFeatured: 'no',
          publishedAt: null,
          scheduledFor: null,
          viewsCount: 0,
          authorId: ctx.user.id,
        })
        .$returningId();

      const newId = Number(insertId[0]?.id);
      await auditLogService.logChange(db, {
        entityType: 'blogPost',
        entityId: newId,
        action: 'create',
        userId: ctx.user.id,
        newValue: JSON.stringify({ duplicatedFrom: input.id, slug }),
      });

      await invalidateBlogCache();
      return { success: true, id: newId, slug };
    }),

  /** نشر أو إلغاء نشر مقال سريعاً دون فتح النموذج. */
  publish: contentPublishProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        published: z.boolean(),
        qualityOverrideReason: z.string().trim().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [current] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.id, input.id), isNull(blogPosts.deletedAt)))
        .limit(1);

      if (!current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المقال غير موجود.' });
      }

      if (input.published && !hasMeaningfulBlogContent(current.content)) {
        throw emptyContentError();
      }

      await db
        .update(blogPosts)
        .set({
          status: input.published ? 'published' : 'draft',
          isActive: input.published ? 'yes' : current.isActive,
          publishedAt: input.published ? (current.publishedAt ?? new Date()) : current.publishedAt,
        })
        .where(eq(blogPosts.id, input.id));

      const [updated] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);
      if (updated) {
        await saveBlogPostVersion(
          db,
          updated,
          ctx.user.id,
          input.published ? 'نشر مقال' : 'إلغاء نشر مقال'
        );
      }

      await auditLogService.logChange(db, {
        entityType: 'blogPost',
        entityId: input.id,
        action: 'update',
        userId: ctx.user.id,
        oldValue: JSON.stringify({ status: current.status }),
        newValue: JSON.stringify({ status: input.published ? 'published' : 'draft' }),
      });

      await invalidateBlogCache();
      return { success: true };
    }),

  /* ─────────────────────────── التصنيفات ─────────────────────────── */

  categories: router({
    /** قائمة التصنيفات مع عدّاد المقالات المنشورة لكل تصنيف. */
    list: contentReadProcedure
      .input(
        z.object({
          includeInactive: z.boolean().default(false),
          search: z.string().trim().max(120).optional(),
        })
      )
      .query(async ({ input }) => {
        const db = await ensureDatabaseAvailable();
        const conditions = [isNull(blogCategories.deletedAt)];

        if (!input.includeInactive) {
          conditions.push(eq(blogCategories.isActive, 'yes'));
        }
        if (input.search) {
          const term = `%${input.search}%`;
          const searchCondition = or(
            like(blogCategories.name, term),
            like(blogCategories.nameEn, term)
          );
          if (searchCondition) {
            conditions.push(searchCondition);
          }
        }

        const rows = await db
          .select({
            id: blogCategories.id,
            name: blogCategories.name,
            nameEn: blogCategories.nameEn,
            slug: blogCategories.slug,
            description: blogCategories.description,
            icon: blogCategories.icon,
            color: blogCategories.color,
            sortOrder: blogCategories.sortOrder,
            isActive: blogCategories.isActive,
            createdAt: blogCategories.createdAt,
            updatedAt: blogCategories.updatedAt,
          })
          .from(blogCategories)
          .where(and(...conditions))
          .orderBy(asc(blogCategories.sortOrder), asc(blogCategories.name));

        const counts = await db
          .select({ categoryId: blogPosts.categoryId, total: count() })
          .from(blogPosts)
          .where(and(isNull(blogPosts.deletedAt), eq(blogPosts.status, 'published')))
          .groupBy(blogPosts.categoryId);

        const countMap = new Map<number, number>();
        for (const row of counts) {
          if (row.categoryId !== null) {
            countMap.set(row.categoryId, Number(row.total));
          }
        }

        return rows.map((row) => ({ ...row, postsCount: countMap.get(row.id) ?? 0 }));
      }),

    create: contentCreateProcedure
      .input(blogCategoryInputSchema)
      .mutation(async ({ input, ctx }) => {
        const db = await ensureDatabaseAvailable();
        const [existing] = await db
          .select({ id: blogCategories.id })
          .from(blogCategories)
          .where(and(eq(blogCategories.name, input.name), isNull(blogCategories.deletedAt)))
          .limit(1);

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'يوجد تصنيف بنفس الاسم. الرجاء اختيار اسم آخر.',
          });
        }

        const baseSlug = slugifyText(input.name) || 'category';

        const insertId = await db
          .insert(blogCategories)
          .values({
            name: input.name,
            nameEn: input.nameEn ?? null,
            slug: baseSlug,
            description: input.description ?? null,
            icon: input.icon || null,
            color: input.color || null,
            sortOrder: input.sortOrder,
            isActive: input.isActive,
          })
          .$returningId();

        const id = Number(insertId[0]?.id);
        await auditLogService.logChange(db, {
          entityType: 'blogCategory',
          entityId: id,
          action: 'create',
          userId: ctx.user.id,
          newValue: JSON.stringify(input),
        });

        await invalidateBlogCache();
        return { success: true, id };
      }),

    update: contentUpdateProcedure
      .input(blogCategoryInputSchema.extend({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const db = await ensureDatabaseAvailable();
        await db
          .update(blogCategories)
          .set({
            name: input.name,
            nameEn: input.nameEn ?? null,
            description: input.description ?? null,
            icon: input.icon || null,
            color: input.color || null,
            sortOrder: input.sortOrder,
            isActive: input.isActive,
          })
          .where(and(eq(blogCategories.id, input.id), isNull(blogCategories.deletedAt)));

        await auditLogService.logChange(db, {
          entityType: 'blogCategory',
          entityId: input.id,
          action: 'update',
          userId: ctx.user.id,
          newValue: JSON.stringify(input),
        });

        await invalidateBlogCache();
        return { success: true };
      }),

    /** حذف ناعم للتصنيف؛ يُمنع الحذف إذا كانت هناك مقالات مرتبطة به. */
    delete: contentDeleteProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const db = await ensureDatabaseAvailable();
        const [{ total }] = await db
          .select({ total: count() })
          .from(blogPosts)
          .where(and(eq(blogPosts.categoryId, input.id), isNull(blogPosts.deletedAt)));

        if (Number(total) > 0) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `لا يمكن حذف التصنيف لارتباطه بـ ${total} مقالاً. انقل المقالات أولاً.`,
          });
        }

        await db
          .update(blogCategories)
          .set({ deletedAt: new Date() })
          .where(eq(blogCategories.id, input.id));

        await auditLogService.logChange(db, {
          entityType: 'blogCategory',
          entityId: input.id,
          action: 'delete',
          userId: ctx.user.id,
          reason: 'حذف ناعم لتصنيف المدونة',
        });

        await invalidateBlogCache();
        return { success: true };
      }),
  }),
});
