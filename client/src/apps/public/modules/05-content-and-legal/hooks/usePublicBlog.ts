/**
 * Blog Public Hooks
 * خطافات جلب محتوى المدونة للواجهة العامة
 *
 * تغلّف استدعاءات tRPC العامة مع سياسات تخزين مؤقت متناسقة مع بقية
 * صفحات الموقع العامة (staleTime أطول للبيانات شبه الثابتة).
 */

import { trpc } from '@/lib/api/trpc';
import type { RouterOutputs } from '@core/types/trpc';

export type BlogListParams = {
  search?: string;
  categoryId?: number;
  sort?: 'created-desc' | 'created-asc' | 'title-asc' | 'title-desc';
  page?: number;
  limit?: number;
};

export type PublicBlogPost = RouterOutputs['blog']['list']['data'][number];
export type PublicBlogPostDetail = NonNullable<RouterOutputs['blog']['getBySlug']>;
export type PublicBlogCategory = RouterOutputs['blog']['categories'][number];

/** جلب قائمة مقالات المدونة مع ترقيم وتصفية وترتيب. */
export function usePublicBlogList(params: BlogListParams = {}) {
  return trpc.blog.list.useQuery(
    {
      search: params.search,
      categoryId: params.categoryId,
      sort: params.sort,
      page: params.page ?? 1,
      limit: params.limit ?? 12,
    },
    {
      // المقالات المنشورة لا تتغيّر إلا نادراً، ونعتمد كاش الخادم أيضاً.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
}

/** جلب مقال منشور واحد برابطه. */
export function usePublicBlogPost(slug: string | undefined) {
  return trpc.blog.getBySlug.useQuery(
    { slug: slug ?? '' },
    {
      enabled: Boolean(slug),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );
}

/** جلب التصنيفات النشطة التي تحتوي مقالات منشورة. */
export function usePublicBlogCategories() {
  return trpc.blog.categories.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** جلب المقالات المميزة لقسم المدونة بالصفحة الرئيسية. */
export function usePublicBlogFeatured(limit = 5) {
  return trpc.blog.featured.useQuery(
    { limit },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );
}
