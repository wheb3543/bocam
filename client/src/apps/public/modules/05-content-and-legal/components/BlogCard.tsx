/**
 * BlogCard
 * بطاقة مقال في قائمة المدونة العامة
 *
 * مطابقة لبنية الموقع المرجعي (SGH Hail /ar/blog):
 *   a.image (صورة الغلاف) ← .content (h2 العنوان + p المقتطف)
 *   ← .date (أيقونة الساعة + التاريخ) ← .actions (زر «عرض المزيد»)
 *
 * ألوان الهوية مأخوذة من معرّف المشروع: أزرق #1ca8e5، أخضر #2eb34b،
 * وخلفية فاتحة #f8f8f8 — نفس نظام صفحة الأقسام والعيادات.
 */

import { Link } from 'wouter';
import { Calendar, ChevronLeft, Clock, Tag } from 'lucide-react';
import {
  buildBlogPostHref,
  clampExcerpt,
  formatBlogDate,
  formatReadingTime,
} from '../utils/blogPresentation';
import type { PublicBlogPost } from '../hooks/usePublicBlog';

export type BlogCardVariant = 'grid' | 'compact';

type BlogCardProps = {
  post: Pick<
    PublicBlogPost,
    'id' | 'title' | 'slug' | 'excerpt' | 'coverImage' | 'coverImageAlt' | 'publishedAt'
  > & {
    readingTime?: number | null;
    categoryName?: string | null;
  };
  /** compact يُستخدم في سلايدر «المزيد من المقالات» بصفحة المقال. */
  variant?: BlogCardVariant;
  className?: string;
};

const FALLBACK_COVER = '/sgh/blog/blog-1.jpg';

export function BlogCard({ post, variant = 'grid', className = '' }: BlogCardProps) {
  const href = buildBlogPostHref(post.slug);
  const cover = post.coverImage?.trim() || FALLBACK_COVER;
  const coverAlt = post.coverImageAlt?.trim() || post.title;
  const date = formatBlogDate(post.publishedAt);
  const readingTime = formatReadingTime(post.readingTime);

  if (variant === 'compact') {
    return (
      <article
        className={`group h-full overflow-hidden rounded-[10px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(28,168,229,0.25)] sm:rounded-[18px] ${className}`}
      >
        <Link href={href} className="block" aria-label={post.title}>
          <span className="relative block h-[150px] w-full border-[5px] border-[#f8f8f8] bg-[#f8f8f8]">
            <img
              src={cover}
              alt={coverAlt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
          </span>
          <h3 className="px-3 pt-3 text-[0.98rem] font-bold leading-snug text-[#212529] transition-colors group-hover:text-[#1ca8e5] sm:text-[1.05rem]">
            {post.title}
          </h3>
        </Link>
      </article>
    );
  }

  return (
    <article className={`h-full ${className}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(28,168,229,0.25)] sm:rounded-[24px]">
        {/* صورة الغلاف: a.image في الموقع المرجعي */}
        <Link
          href={href}
          aria-label={post.title}
          className="relative block h-[200px] w-full border-[5px] border-[#f8f8f8] bg-[#f8f8f8] bg-cover bg-center bg-no-repeat sm:h-[220px]"
          style={{ backgroundImage: `url(${cover})` }}
        >
          <span
            className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
          {post.categoryName && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-[30px] border border-white/70 bg-white/95 px-2.5 py-1 text-[0.7rem] font-bold text-[#1ca8e5] shadow-sm backdrop-blur-sm">
              <Tag className="h-3 w-3" />
              {post.categoryName}
            </span>
          )}
        </Link>

        {/* المحتوى: .content ← h2 + p في الموقع المرجعي */}
        <div className="flex flex-1 flex-col px-4 pt-4">
          <h2 className="text-[1.05rem] font-semibold leading-snug text-[#212529] sm:text-[1.15rem]">
            <Link href={href} className="transition-colors hover:text-[#1ca8e5]">
              {post.title}
            </Link>
          </h2>

          <p className="mt-2 line-clamp-3 text-[0.875rem] leading-relaxed text-[#565656]">
            {clampExcerpt(post.excerpt) ||
              'مقال تثقيفي طبي من فريق أطباء المستشفى، يشرح الأعراض والعلاج والإرشادات الوقائية.'}
          </p>

          {/* التاريخ ووقت القراءة */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.78rem] text-[#8ca4b8]">
            {date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {date}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readingTime}
            </span>
          </div>
        </div>

        {/* الإجراء: btn btn-primary btn-compact btn-outline في الموقع المرجعي */}
        <div className="mt-4 flex items-center gap-2 border-t border-[#f1f4f6] px-4 py-4">
          <Link
            href={href}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[30px] border border-[#1ca8e5] bg-transparent px-4 py-[0.4rem] text-[0.8rem] font-medium text-[#1ca8e5] transition-all duration-200 hover:bg-[#1ca8e5] hover:text-white"
          >
            <span>عرض المزيد</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
