/**
 * BlogPostPage - صفحة تفاصيل مقال المدونة (/blog/:slug)
 *
 * مطابقة للموقع المرجعي (SGH Hail /ar/medical-blog/...):
 *  1) ترويسة المقال: العنوان + المراجع الطبي + التاريخ + صورة الغلاف.
 *  2) جسم المقال المنسّق (تعقيم مزدوج قبل العرض).
 *  3) شريط مشاركة + وسوم.
 *  4) بانر الدعوة للحجز.
 *  5) قسم «المزيد من المقالات» ببطاقات التصنيف نفسه.
 *
 * إضافة إلى المرجع: مسار تنقل (breadcrumb) وشريط مشاركة ووقت قراءة.
 */

import { useEffect } from 'react';
import { Link, useParams } from 'wouter';
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  Clock,
  RefreshCw,
  ShieldCheck,
  Tag as TagIcon,
  Stethoscope,
} from 'lucide-react';

import PageLayout from '@/components/layout/PageLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { COMPANY_ARABIC_NAME } from '@/const';
import { PageProgress, FloatingButtons } from '@apps/public/shared/components';
import ReadingProgressBar from '../components/ReadingProgressBar';

import { BlogArticleBody } from '../components/BlogArticleBody';
import { BlogCard } from '../components/BlogCard';
import { BlogShareBar } from '../components/BlogShareBar';
import { usePublicBlogPost } from '../hooks/usePublicBlog';
import {
  buildBlogPostHref,
  clampExcerpt,
  formatBlogDate,
  formatReadingTime,
  parseBlogTags,
} from '../utils/blogPresentation';

const FALLBACK_COVER = '/sgh/blog/blog-1.jpg';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { openBookingModal } = useBookingModal();
  const postQuery = usePublicBlogPost(slug);
  const post = postQuery.data;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (postQuery.isLoading) {
    return (
      <PageLayout
        title={`جارٍ تحميل المقال | ${COMPANY_ARABIC_NAME}`}
        description="جارٍ تحميل محتوى المقال الطبي."
        useContainer={false}
      >
        <PageProgress />
        <div className="mx-auto w-full max-w-[900px] px-[15px] py-16">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="mt-4 h-4 w-1/2" />
          <Skeleton className="mt-8 h-[280px] w-full rounded-2xl" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-5/6" />
        </div>
      </PageLayout>
    );
  }

  if (postQuery.isError || !post) {
    return (
      <PageLayout
        title={`مقال غير متاح | ${COMPANY_ARABIC_NAME}`}
        description="المقال المطلوب غير متاح حالياً."
        useContainer={false}
      >
        <PageProgress />
        <FloatingButtons />
        <div className="mx-auto w-full max-w-[620px] px-[15px] py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f8f8f8] text-[#9aa3ab]">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-[#212529]">المقال غير متاح</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#565656]">
            قد يكون المقال غير منشور أو أن رابطه تغيّر. يمكنك العودة إلى المدونة الطبية لقراءة باقي
            المقالات.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/blog"
              className="rounded-[30px] bg-[#1ca8e5] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1694cc]"
            >
              العودة إلى المدونة
            </Link>
            <button
              type="button"
              onClick={() => postQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-[30px] border border-[#1ca8e5] px-5 py-2.5 text-sm font-medium text-[#1ca8e5] transition-colors hover:bg-[#1ca8e5] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const cover = post.coverImage?.trim() || FALLBACK_COVER;
  const coverAlt = post.coverImageAlt?.trim() || post.title;
  const publishedDate = formatBlogDate(post.publishedAt);
  const readingTime = formatReadingTime(post.readingTime);
  const tags = parseBlogTags(post.tags);
  const reviewDate = post.reviewDate ? formatBlogDate(post.reviewDate) : '';
  const pageHref = buildBlogPostHref(post.slug);
  const seoDescription = post.metaDescription?.trim() || clampExcerpt(post.excerpt, 160);

  return (
    <PageLayout
      title={post.metaTitle?.trim() || `${post.title} | المدونة الطبية`}
      description={seoDescription || post.title}
      keywords={post.keywords?.trim() || `مقال طبي, ${post.title}`}
      image={post.ogImage?.trim() || cover}
      useContainer={false}
    >
      <PageProgress />
      <ReadingProgressBar color="blue" />
      <FloatingButtons />

      {/* ===== 1) مسار التنقل ===== */}
      <div className="w-full bg-[#f8f8f8] py-3">
        <nav
          className="mx-auto flex w-full max-w-[1380px] flex-wrap items-center gap-2 px-[15px] text-[0.8rem] text-[#565656]"
          aria-label="مسار التنقل"
        >
          <Link href="/" className="transition-colors hover:text-[#1ca8e5]">
            الرئيسية
          </Link>
          <ChevronLeft className="h-3.5 w-3.5" />
          <Link href="/blog" className="transition-colors hover:text-[#1ca8e5]">
            المدونة الطبية
          </Link>
          {post.categoryName && (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <Link
                href={`/blog?category=${post.categoryId}`}
                className="transition-colors hover:text-[#1ca8e5]"
              >
                {post.categoryName}
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* ===== 2) ترويسة المقال: العنوان + المراجع + صورة الغلاف ===== */}
      <article className="w-full bg-white pb-16 pt-6 sm:pt-10">
        <div className="mx-auto w-full max-w-[1380px] px-[15px]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* العنوان والبيانات */}
            <div className="lg:col-span-7">
              {post.categoryName && (
                <span className="inline-flex items-center gap-1.5 rounded-[30px] bg-[#1ca8e5]/10 px-3 py-1 text-[0.78rem] font-semibold text-[#1ca8e5]">
                  <TagIcon className="h-3.5 w-3.5" />
                  {post.categoryName}
                </span>
              )}

              <h1 className="mt-3 text-[24px] font-bold leading-[1.4] text-[#212529] sm:text-[32px]">
                {post.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.82rem] text-[#8ca4b8]">
                {publishedDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {publishedDate}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readingTime}
                </span>
              </div>

              {post.reviewerName && (
                <div className="mt-4 inline-flex items-start gap-2 rounded-xl border border-[#e6e6e6] bg-[#f8f8f8] px-4 py-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2eb34b]" />
                  <div className="text-[0.82rem] leading-relaxed text-[#565656]">
                    <span className="font-semibold text-[#212529]">
                      تمت المراجعة الطبية بواسطة:
                    </span>{' '}
                    {post.reviewerName}
                    {reviewDate && <span className="block">آخر تحديث: {reviewDate}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* صورة الغلاف */}
            <div className="lg:col-span-5">
              <img
                src={cover}
                alt={coverAlt}
                loading="lazy"
                className="h-[220px] w-full rounded-2xl border-[5px] border-[#f8f8f8] object-cover shadow-sm sm:h-[300px]"
              />
            </div>
          </div>

          {/* ===== 3) جسم المقال + المشاركة + الوسوم ===== */}
          <div className="mx-auto mt-10 w-full max-w-[900px]">
            {post.excerpt && (
              <p className="mb-6 rounded-xl border-s-4 border-[#1ca8e5] bg-[#f8f8f8] px-5 py-4 text-[15px] leading-[1.9] text-[#565656]">
                {clampExcerpt(post.excerpt, 400)}
              </p>
            )}

            <BlogArticleBody html={post.content} />

            <div className="mt-10 border-t border-[#e6e6e6] pt-6">
              <BlogShareBar title={post.title} url={pageHref} />

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#212529]">
                    <TagIcon className="h-4 w-4 text-[#1ca8e5]" />
                    الوسوم:
                  </span>
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?q=${encodeURIComponent(tag)}`}
                      className="rounded-[30px] border border-[#d7dee3] px-3 py-1 text-[0.78rem] text-[#565656] transition-colors hover:border-[#1ca8e5] hover:text-[#1ca8e5]"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-start gap-2 rounded-xl bg-[#f8f8f8] p-4 text-[0.8rem] leading-relaxed text-[#565656]">
                <Stethoscope className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1ca8e5]" />
                <p>
                  هذه المادة تثقيافية عامة ولا تُغني عن استشارة الطبيب المختص. لا تبدأ أي علاج أو
                  تغيّر جرعة دواء دون إشراف طبي.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* ===== 4) بانر الدعوة للحجز ===== */}
      <section className="w-full bg-white pb-12">
        <div className="mx-auto w-full max-w-[1380px] px-[15px]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0f6d95] via-[#1ca8e5] to-[#2eb34b] px-6 py-9 text-white sm:px-12 sm:py-11">
            <div
              className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-[620px]">
                <h2 className="text-[20px] font-bold sm:text-[26px]">
                  رافق الرعاية الصحية بمعايير عالمية
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  احصل على استشارة لجميع الاستفسارات الطبية والعلاجات اليوم.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openBookingModal()}
                className="rounded-[30px] bg-white px-6 py-2.5 text-sm font-semibold text-[#1ca8e5] shadow-sm transition-all hover:bg-white/90"
              >
                إحجز موعد
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5) المزيد من المقالات ===== */}
      {post.related.length > 0 && (
        <section className="w-full bg-[#f8f8f8] py-12 sm:py-16">
          <div className="mx-auto w-full max-w-[1380px] px-[15px]">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-[#212529] sm:text-[28px]">
                  المزيد من المقالات
                </h2>
                {post.categoryName && (
                  <p className="mt-1 text-[0.9rem] text-[#565656]">
                    مقالات ذات صلة في تصنيف {post.categoryName}
                  </p>
                )}
              </div>
              <Link
                href="/blog"
                className="rounded-[30px] bg-[#1ca8e5] px-5 py-2 text-[0.85rem] font-medium text-white transition-colors hover:bg-[#1694cc]"
              >
                عرض المزيد
              </Link>
            </div>

            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {post.related.map((related) => (
                <li key={related.id} className="h-full">
                  <BlogCard post={related} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
