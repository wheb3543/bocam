/**
 * Blog Admin Types
 * أنواع نموذج إدارة مقالات المدونة الطبية
 */

import type { RouterInputs, RouterOutputs } from '@core/types/trpc';

/** صف المقال في جدول الإدارة. */
export type BlogPostRow = RouterOutputs['content']['blog']['list']['data'][number];

/** ترقيم صفحات إدارة المقالات. */
export type BlogPagination = RouterOutputs['content']['blog']['list']['pagination'];

/** التصنيف في قائمة إدارة المدونة. */
export type BlogCategoryRow = RouterOutputs['content']['blog']['categories']['list'][number];

/** إحصاءات لوحة المدونة. */
export type BlogOverview = RouterOutputs['content']['blog']['getOverview'];

/** مدخلات الإنشاء/التعديل كما يطلبها tRPC. */
type BlogPostPayload = RouterInputs['content']['blog']['update'];

export type BlogStatus = 'draft' | 'published' | 'archived';
export type BlogActiveFlag = 'yes' | 'no';

export type BlogPostFormData = {
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  coverImage: string;
  coverImageAlt: string;
  categoryId: number | null;
  reviewerName: string;
  reviewDate: string;
  tagsInput: string;
  status: BlogStatus;
  isActive: BlogActiveFlag;
  isFeatured: BlogActiveFlag;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  scheduledFor: string;
  qualityOverrideReason: string;
};

export type BlogCategoryFormData = {
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: BlogActiveFlag;
};

export const initialBlogPostFormData: BlogPostFormData = {
  title: '',
  titleEn: '',
  slug: '',
  excerpt: '',
  excerptEn: '',
  content: '',
  contentEn: '',
  coverImage: '',
  coverImageAlt: '',
  categoryId: null,
  reviewerName: '',
  reviewDate: '',
  tagsInput: '',
  status: 'draft',
  isActive: 'yes',
  isFeatured: 'no',
  sortOrder: 0,
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  ogImage: '',
  scheduledFor: '',
  qualityOverrideReason: '',
};

export const initialBlogCategoryFormData: BlogCategoryFormData = {
  name: '',
  nameEn: '',
  description: '',
  icon: '',
  color: '#1ca8e5',
  sortOrder: 0,
  isActive: 'yes',
};

/** يحوّل وسوماً مفصولة بفواصل إلى مصفوفة، بعد تنظيفها وإزالة المكرّر. */
export function parseTagsInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[،,]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

/** يحوّل نموذج الواجهة إلى حمولة tRPC (مع تجاهل الحقول الفارغة). */
export function toBlogPostPayload(
  form: BlogPostFormData
): Omit<BlogPostPayload, 'id'> & { id?: number } {
  const optional = (value: string) => (value.trim() ? value.trim() : undefined);

  return {
    title: form.title.trim(),
    titleEn: optional(form.titleEn),
    slug: optional(form.slug),
    excerpt: optional(form.excerpt),
    excerptEn: optional(form.excerptEn),
    content: form.content,
    contentEn: optional(form.contentEn),
    coverImage: optional(form.coverImage),
    coverImageAlt: optional(form.coverImageAlt),
    categoryId: form.categoryId,
    reviewerName: optional(form.reviewerName),
    reviewDate: form.reviewDate ? new Date(form.reviewDate) : null,
    tags: parseTagsInput(form.tagsInput),
    status: form.status,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
    metaTitle: optional(form.metaTitle),
    metaDescription: optional(form.metaDescription),
    keywords: optional(form.keywords),
    ogImage: optional(form.ogImage),
    scheduledFor: form.scheduledFor ? new Date(form.scheduledFor) : null,
    qualityOverrideReason: optional(form.qualityOverrideReason),
  };
}

/** يحوّل سجل المقال من الخادم إلى قيم النموذج القابلة للتحرير. */
export function toBlogPostFormData(
  post: NonNullable<RouterOutputs['content']['blog']['getById']>
): BlogPostFormData {
  const toDateInput = (value: Date | null) =>
    value ? new Date(value).toISOString().slice(0, 10) : '';

  return {
    title: post.title ?? '',
    titleEn: post.titleEn ?? '',
    slug: post.slug ?? '',
    excerpt: post.excerpt ?? '',
    excerptEn: post.excerptEn ?? '',
    content: post.content ?? '',
    contentEn: post.contentEn ?? '',
    coverImage: post.coverImage ?? '',
    coverImageAlt: post.coverImageAlt ?? '',
    categoryId: post.categoryId ?? null,
    reviewerName: post.reviewerName ?? '',
    reviewDate: toDateInput(post.reviewDate),
    tagsInput: (() => {
      try {
        const parsed: unknown = JSON.parse(post.tags ?? '[]');
        return Array.isArray(parsed) ? parsed.map((tag) => String(tag)).join('، ') : '';
      } catch {
        return post.tags ?? '';
      }
    })(),
    status: (post.status as BlogStatus) ?? 'draft',
    isActive: (post.isActive as BlogActiveFlag) ?? 'yes',
    isFeatured: (post.isFeatured as BlogActiveFlag) ?? 'no',
    sortOrder: post.sortOrder ?? 0,
    metaTitle: post.metaTitle ?? '',
    metaDescription: post.metaDescription ?? '',
    keywords: post.keywords ?? '',
    ogImage: post.ogImage ?? '',
    scheduledFor: toDateInput(post.scheduledFor),
    qualityOverrideReason: '',
  };
}
