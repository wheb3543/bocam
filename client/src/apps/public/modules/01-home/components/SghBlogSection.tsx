/**
 * SghBlogSection - قسم «أحدث المقالات» في الصفحة الرئيسية
 *
 * يجلب المقالات المميزة من إدارة المدونة عبر tRPC بدل المحتوى الثابت،
 * ويعرض أكثرها تمييزاً مع شريط تنقل تلقائي. التصميم يطابق هوية SGH:
 * صندوق داخلي #f8f8f8، بطاقة بيضاء، وزر «عرض المزيد» أزرق.
 */
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import {
  clampExcerpt,
  formatBlogDate,
  formatReadingTime,
} from '../../05-content-and-legal/utils/blogPresentation';

const FALLBACK_COVER = '/sgh/blog/blog-1.jpg';

export default function SghBlogSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {
    data: posts = [],
    isLoading,
    isError,
    refetch,
  } = trpc.blog.featured.useQuery({ limit: 5 }, { placeholderData: (previous) => previous });

  // تنقل تلقائي كل 8 ثوانٍ، ويتوقف عند وجود مقال واحد فقط.
  useEffect(() => {
    if (posts.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [posts.length]);

  useEffect(() => {
    if (currentIndex > posts.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, posts.length]);

  const currentPost = posts[currentIndex];
  const currentHref = currentPost ? `/blog/${encodeURIComponent(currentPost.slug)}` : '/blog';

  return (
    <section id="blog" className="section-blog my-6 bg-white sm:my-8" dir="rtl">
      <div className="container mx-auto max-w-[1380px] px-[15px]">
        <div className="inner-section w-full rounded-none bg-[#f8f8f8] px-4 py-10 sm:rounded-2xl sm:px-12 sm:py-12">
          <div className="mx-auto w-full max-w-[1140px]">
            {/* الترويسة */}
            <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <h2 className="m-0 text-[28px] font-bold tracking-tight text-[#212529] sm:text-[32px]">
                أحدث المقالات
              </h2>
              <Link href="/blog">
                <span className="inline-block rounded-[30px] bg-[#1ca8e5] px-[22.4px] py-[6px] text-[15px] font-normal text-white shadow-xs transition-colors hover:bg-[#1896cd] sm:text-[16px]">
                  عرض المزيد
                </span>
              </Link>
            </header>

            {/* بطاقة المقال */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-6 shadow-xs sm:p-8 lg:p-10">
              {isLoading && (
                <div className="flex flex-col items-center gap-8 md:flex-row">
                  <Skeleton className="h-[260px] w-full rounded-xl md:w-[385px] md:shrink-0" />
                  <div className="w-full space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              )}

              {isError && (
                <div className="py-10 text-center">
                  <p className="text-sm text-[#565656]">تعذّر تحميل أحدث المقالات حالياً.</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-4 inline-flex items-center gap-2 rounded-[30px] border border-[#1ca8e5] px-4 py-2 text-sm font-medium text-[#1ca8e5] transition-colors hover:bg-[#1ca8e5] hover:text-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {!isLoading && !isError && !currentPost && (
                <p className="py-10 text-center text-sm text-[#565656]">
                  لا توجد مقالات منشورة في المدونة الطبية بعد.
                </p>
              )}

              {currentPost && (
                <div className="flex min-h-[320px] flex-col items-center gap-8 md:flex-row lg:gap-12">
                  <Link
                    href={currentHref}
                    className="group block h-[260px] w-full overflow-hidden rounded-xl shadow-xs sm:h-[308px] md:w-[385px] md:shrink-0"
                    aria-label={currentPost.title}
                  >
                    <img
                      key={currentPost.id}
                      src={currentPost.coverImage?.trim() || FALLBACK_COVER}
                      alt={currentPost.coverImageAlt?.trim() || currentPost.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col items-start justify-start text-right">
                    <h3 className="mb-2 text-[22px] font-bold leading-[1.25] text-[#212529] sm:text-[26px] lg:text-[28px]">
                      <Link href={currentHref} className="transition-colors hover:text-[#1ca8e5]">
                        {currentPost.title}
                      </Link>
                    </h3>

                    <div className="mb-4 flex flex-wrap items-center gap-4 text-[13.6px] text-[#8ca4b8] sm:mb-6">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatReadingTime(currentPost.readingTime)}
                      </span>
                      <span>{formatBlogDate(currentPost.publishedAt)}</span>
                    </div>

                    <p className="line-clamp-4 text-[14.5px] leading-[24px] text-[#333333] sm:text-[15.2px]">
                      {clampExcerpt(currentPost.excerpt)}
                    </p>
                  </div>
                </div>
              )}

              {/* أزرار التنقل بين المقالات */}
              {posts.length > 1 && (
                <div className="flex items-center justify-start gap-2 pt-6">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
                    }
                    aria-label="المقال السابق"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-95"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % posts.length)}
                    aria-label="المقال التالي"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
