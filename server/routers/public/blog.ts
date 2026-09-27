/**
 * Public Blog Router
 * راوتر المدونة الطبية للواجهة العامة
 *
 * يقدّم بيانات `/blog` و `/blog/:slug` فقط: المقالات المنشورة والنشطة
 * وغير المحذوفة، فلا يُسرّب أي مسودة أو محتوى معطّل مهما كان معرّفه.
 */

import { z } from 'zod';
import { and, count, desc, eq, isNull, like, ne, or } from 'drizzle-orm';
import { blogCategories, blogPosts } from '../../../drizzle/schema';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { publicProcedure, router } from '../../_core/trpc';
import { cacheManager } from '../../services/redis';
import { sanitizeBlogHtml } from '../../modules/05-cms-portal/services/content/blogContentService';
import {
  buildBlogOrderBy,
  type BlogSortOrder,
} from '../../modules/05-cms-portal/routers/content/blog';

const CACHE_TTL = 5 * 60; // 5 دقائق
const RELATED_POSTS_LIMIT = 9; // يطابق سلايدر "المزيد من المقالات" في الموقع المرجعي

function cacheKey(prefix: string, params: Record<string, unknown>): string {
  return `${prefix}:${JSON.stringify(params)}`;
}

async function readCache<T>(key: string): Promise<T | null> {
  return cacheManager.get<T>(key);
}

async function writeCache(key: string, data: unknown): Promise<void> {
  await cacheManager.set(key, data, CACHE_TTL);
}

/**
 * الحقول التي تُعرض في بطاقة المقالة بقائمة المدونة.
 * نحددها صراحةً لأن قراءة الكاش تُرجعearly return، ولو كانت من النوع `unknown`
 * لأفسدت استنتاج أنواع tRPC فيصبح ناتج الإجراء `unknown` بدل شكله الحقيقي.
 */
const listPostFields = {
  id: blogPosts.id,
  title: blogPosts.title,
  slug: blogPosts.slug,
  excerpt: blogPosts.excerpt,
  coverImage: blogPosts.coverImage,
  coverImageAlt: blogPosts.coverImageAlt,
  readingTime: blogPosts.readingTime,
  publishedAt: blogPosts.publishedAt,
  categoryId: blogPosts.categoryId,
  categoryName: blogCategories.name,
} as const;

/** حقول بطاقة المقال في قسم «المزيد من المقالات» (بلا معلومات التصنيف). */
const cardPostFields = {
  id: blogPosts.id,
  title: blogPosts.title,
  slug: blogPosts.slug,
  excerpt: blogPosts.excerpt,
  coverImage: blogPosts.coverImage,
  coverImageAlt: blogPosts.coverImageAlt,
  readingTime: blogPosts.readingTime,
  publishedAt: blogPosts.publishedAt,
} as const;

/** يبني استعلام صفحات القائمة (مستخرج لتثبيت نوع الناتج). */
async function buildListRows(
  db: Awaited<ReturnType<typeof ensureDatabaseAvailable>>,
  where: ReturnType<typeof and>,
  sort: BlogSortOrder,
  limit: number,
  offset: number
) {
  return db
    .select(listPostFields)
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
    .where(where)
    .orderBy(...buildBlogOrderBy(sort))
    .limit(limit)
    .offset(offset);
}

/** بطاقة المقال المختصرة المستخدمة في الأقسام الجانبية والمقالات ذات الصلة. */
type BlogCardRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  readingTime: number;
  publishedAt: Date | null;
};

/** نتيجة صفحة المدونة العامة. */
type BlogListResult = {
  data: Array<{
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    coverImageAlt: string | null;
    readingTime: number;
    publishedAt: Date | null;
    categoryId: number | null;
    categoryName: string | null;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/** نتيجة تفاصيل مقال واحد مع مقالات ذات صلة. */
type BlogPostDetailResult = Omit<typeof blogPosts.$inferSelect, 'content' | 'contentEn'> & {
  content: string;
  contentEn: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  related: BlogCardRow[];
};

/** نتيجة قائمة التصنيفات مع عدّاد المقالات. */
type BlogCategoryResult = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  postsCount: number;
};

/** شرط أساسي: مقال منشور ونشط وغير محذوف. */
function publishedCondition() {
  return and(
    eq(blogPosts.status, 'published'),
    eq(blogPosts.isActive, 'yes'),
    isNull(blogPosts.deletedAt)
  );
}

const sortEnumSchema = z.enum(['created-desc', 'created-asc', 'title-asc', 'title-desc']);

const listInputSchema = z.object({
  search: z.string().trim().max(120).optional(),
  categoryId: z.number().int().positive().optional(),
  sort: sortEnumSchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
});

export const publicBlogRouter = router({
  /**
   * قائمة مقالات المدونة العامة مع الترقيم والتصفية والترتيب.
   */
  list: publicProcedure.input(listInputSchema).query(async ({ input }): Promise<BlogListResult> => {
    const key = cacheKey('blog:list', input);
    const cached = await readCache<BlogListResult>(key);
    if (cached) {
      return cached;
    }

    const db = await ensureDatabaseAvailable();
    const conditions = [publishedCondition()];

    if (input.categoryId) {
      conditions.push(eq(blogPosts.categoryId, input.categoryId));
    }
    if (input.search) {
      const term = `%${input.search}%`;
      const searchCondition = or(
        like(blogPosts.title, term),
        like(blogPosts.excerpt, term),
        like(blogPosts.keywords, term)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const where = and(...conditions);
    const sort = input.sort ?? 'created-desc';
    const offset = (input.page - 1) * input.limit;

    const [rows, totalRows] = await Promise.all([
      buildListRows(db, where, sort, input.limit, offset),
      db.select({ total: count() }).from(blogPosts).where(where),
    ]);

    const total = Number(totalRows[0]?.total ?? 0);
    const result: BlogListResult = {
      data: rows,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / input.limit)),
      },
    };

    await writeCache(key, result);
    return result;
  }),

  /**
   * جلب مقال منشور واحد برابطه، مع مقالات ذات صلة من التصنيف نفسه.
   * نعقّم المحتوى مرة أخرى هنا كطبقة دفاع ثانوية قبل الإرسال للعميل.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().trim().min(1).max(255) }))
    .query(async ({ input }): Promise<BlogPostDetailResult | null> => {
      const key = cacheKey('blog:post', { slug: input.slug });
      const cached = await readCache<BlogPostDetailResult | null>(key);
      if (cached !== null) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();

      const [row] = await db
        .select({ post: blogPosts, category: blogCategories })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
        .where(and(publishedCondition(), eq(blogPosts.slug, input.slug)))
        .limit(1);

      if (!row) {
        await writeCache(key, null);
        return null;
      }

      const relatedConditions = [publishedCondition(), ne(blogPosts.id, row.post.id)];
      if (row.post.categoryId) {
        relatedConditions.push(eq(blogPosts.categoryId, row.post.categoryId));
      }

      const related = await db
        .select(cardPostFields)
        .from(blogPosts)
        .where(and(...relatedConditions))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(RELATED_POSTS_LIMIT);

      const result = {
        ...row.post,
        content: sanitizeBlogHtml(row.post.content),
        contentEn: row.post.contentEn ? sanitizeBlogHtml(row.post.contentEn) : null,
        categoryName: row.category?.name ?? null,
        categorySlug: row.category?.slug ?? null,
        related,
      };

      await writeCache(key, result);
      return result;
    }),

  /** التصنيفات النشطة مع عدّاد المقالات المنشورة لكل تصنيف. */
  categories: publicProcedure.query(async (): Promise<BlogCategoryResult[]> => {
    const key = 'blog:categories';
    const cached = await readCache<BlogCategoryResult[]>(key);
    if (cached) {
      return cached;
    }

    const db = await ensureDatabaseAvailable();

    const rows = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        description: blogCategories.description,
        icon: blogCategories.icon,
        color: blogCategories.color,
      })
      .from(blogCategories)
      .where(and(eq(blogCategories.isActive, 'yes'), isNull(blogCategories.deletedAt)));

    const counts = await db
      .select({ categoryId: blogPosts.categoryId, total: count() })
      .from(blogPosts)
      .where(publishedCondition())
      .groupBy(blogPosts.categoryId);

    const countMap = new Map<number, number>();
    for (const row of counts) {
      if (row.categoryId !== null) {
        countMap.set(row.categoryId, Number(row.total));
      }
    }

    const result = rows
      .map((row) => ({ ...row, postsCount: countMap.get(row.id) ?? 0 }))
      // نخفي التصنيفات الفارغة حتى لا يقود المستخدم إلى صفحة بلا نتائج.
      .filter((row) => row.postsCount > 0);

    await writeCache(key, result);
    return result;
  }),

  /**
   * المقالات المميزة لقسم "أحدث المقالات" في الصفحة الرئيسية.
   */
  featured: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(12).default(5) }).optional())
    .query(async ({ input }): Promise<BlogCardRow[]> => {
      const limit = input?.limit ?? 5;
      const key = cacheKey('blog:featured', { limit });
      const cached = await readCache<BlogCardRow[]>(key);
      if (cached) {
        return cached;
      }

      const db = await ensureDatabaseAvailable();
      const rows = await db
        .select(cardPostFields)
        .from(blogPosts)
        .where(and(publishedCondition(), eq(blogPosts.isFeatured, 'yes')))
        .orderBy(...buildBlogOrderBy('created-desc'))
        .limit(limit);

      // إن لم يحدّد المحرر مقالات مميزة، نعرض أحدث المقالات بدل قسم فارغ.
      const fallback = rows.length
        ? rows
        : await db
            .select(cardPostFields)
            .from(blogPosts)
            .where(publishedCondition())
            .orderBy(...buildBlogOrderBy('created-desc'))
            .limit(limit);

      await writeCache(key, fallback);
      return fallback;
    }),

  /** المقالات الأقرب إلى الموضوع الحالي في التصنيف نفسه. */
  related: publicProcedure
    .input(
      z.object({
        categoryId: z.number().int().positive().optional(),
        excludeId: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(12).default(3),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const conditions = [publishedCondition()];

      if (input.excludeId) {
        conditions.push(ne(blogPosts.id, input.excludeId));
      }
      if (input.categoryId) {
        conditions.push(eq(blogPosts.categoryId, input.categoryId));
      }

      return db
        .select(cardPostFields)
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input.limit);
    }),
});
