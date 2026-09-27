/**
 * BlogListPage - صفحة المدونة الطبية العامة (/blog)
 *
 * التصميم مطابق للموقع المرجعي (SGH Hail /ar/blog) ومعزّف المشروع:
 *  1) بانر مضغوط بعنوان «المدونة الطبية».
 *  2) شريط تصفية: بحث + تصنيفات + ترتيب (4 خيارات مطابقة للمرجع).
 *  3) شبكة بطاقات المقالات 3 أعمدة + ترقيم دائري.
 *  4) حالات تحميل وخطأ وعدم وجود نتائج.
 *  5) بانر دعوة للحجز بنفس تدرّج صفحة الأقسام.
 *
 * حالة الصفحة تُشتق من عنوان URL لتبقى قابلة للمشاركة.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearch, useLocation } from 'wouter';
import { Calendar, ChevronDown, ChevronLeft, RefreshCw, Search, SearchX, X } from 'lucide-react';

import PageLayout from '@/components/layout/PageLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicSEOSettings } from '@/hooks/usePublicContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { COMPANY_ARABIC_NAME } from '@/const';
import { PageProgress, FloatingButtons } from '@apps/public/shared/components';

import { BlogCard } from '../components/BlogCard';
import { BlogPagination } from '../components/BlogPagination';
import { usePublicBlogCategories, usePublicBlogList } from '../hooks/usePublicBlog';

const BLOG_BANNER_IMAGE = '/sgh/blog/blog-3.jpg';
const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'created-desc', label: 'ترتيب تنازلي بالتاريخ' },
  { value: 'created-asc', label: 'ترتيب تصاعدي بالتاريخ' },
  { value: 'title-asc', label: 'ترتيب تصاعدي بالإسم' },
  { value: 'title-desc', label: 'ترتيب تنازلي بالإسم' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

/** يبني رابط صفحة المدونة مع معاملاتها. */
export function buildBlogListHref(params: {
  q?: string;
  categoryId: number | null;
  sort: SortValue;
  page: number;
}): string {
  const search = new URLSearchParams();
  if (params.q?.trim()) {
    search.set('q', params.q.trim());
  }
  if (params.categoryId) {
    search.set('category', String(params.categoryId));
  }
  if (params.sort !== 'created-desc') {
    search.set('sort', params.sort);
  }
  if (params.page > 1) {
    search.set('page', String(params.page));
  }
  const query = search.toString();
  return query ? `/blog?${query}` : '/blog';
}

export default function BlogListPage() {
  // useSearch() من wouter يُرجع نص الاستعلام كاملاً، لا مصفوفة.
  const search = useSearch();
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { openBookingModal } = useBookingModal();

  const { data: blogSEO = [] } = usePublicSEOSettings({ slug: 'blog', language });
  const blogSEOEntry = blogSEO[0];

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(() => {
    const parsed = Number(searchParams.get('category'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  });
  const [sort, setSort] = useState<SortValue>(() => {
    const raw = searchParams.get('sort');
    return SORT_OPTIONS.some((option) => option.value === raw)
      ? (raw as SortValue)
      : 'created-desc';
  });
  const [page, setPage] = useState(() => {
    const parsed = Number(searchParams.get('page'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  });

  const categoriesQuery = usePublicBlogCategories();
  const listQuery = usePublicBlogList({
    search: searchParams.get('q') || undefined,
    categoryId: categoryId ?? undefined,
    sort,
    page,
    limit: ITEMS_PER_PAGE,
  });

  // نبقي العنوان مصدر الحقيقة للحالة عند تغيّر المرشّحات.
  useEffect(() => {
    setLocation(buildBlogListHref({ q: searchInput, categoryId, sort, page: 1 }), {
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, categoryId, sort]);

  useEffect(() => {
    if (page > 1) {
      setLocation(buildBlogListHref({ q: searchInput, categoryId, sort, page }), {
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const posts = listQuery.data?.data ?? [];
  const pagination = listQuery.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const hasActiveFilters = Boolean(searchInput.trim()) || categoryId !== null;

  const selectedCategory = useMemo(
    () => categoriesQuery.data?.find((category) => category.id === categoryId) ?? null,
    [categoriesQuery.data, categoryId]
  );

  const resetFilters = () => {
    setSearchInput('');
    setCategoryId(null);
    setSort('created-desc');
    setPage(1);
  };

  return (
    <PageLayout
      title={blogSEOEntry?.title || `المدونة الطبية | ${COMPANY_ARABIC_NAME}`}
      description={
        blogSEOEntry?.description ||
        'مدونة طبية تثقيفية مكتوبة ومراجعة من أطباء أخصائيين: مقالات عن الأعراض والعلاج والإرشادات الوقائية.'
      }
      keywords={blogSEOEntry?.keywords || 'مدونة طبية, مقالات طبية, توعية صحية, أمراض, علاج'}
      useContainer={false}
    >
      <PageProgress />
      <FloatingButtons />

      {/* ===== 1) بانر مضغوط (Compact Featured Image) ===== */}
      <section
        className="sgh-hero-surface relative w-full overflow-hidden bg-[#0f6d95] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BLOG_BANNER_IMAGE})` }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-l from-black/55 via-black/35 to-black/10"
          aria-hidden="true"
        />
        <div className="w-full pt-[34%] sm:pt-[22%]" aria-hidden="true" />

        <div className="absolute inset-0 flex items-center">
          <div className="relative z-10 mx-auto w-full max-w-[1380px] px-[15px]">
            <nav
              className="mb-2 flex items-center gap-2 text-[0.75rem] text-white/85"
              aria-label="مسار التنقل"
            >
              <Link href="/" className="transition-colors hover:text-white">
                الرئيسية
              </Link>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="font-medium text-white">المدونة الطبية</span>
            </nav>
            <h1 className="text-[28px] font-medium leading-tight text-white [text-shadow:0_0_10px_rgba(0,0,0,0.6)] sm:text-[40px]">
              المدونة الطبية
            </h1>
            <p className="mt-3 max-w-[560px] text-[0.85rem] leading-relaxed text-white/95 [text-shadow:0_0_10px_rgba(0,0,0,0.6)] sm:text-[1rem]">
              مقالات تثقيفية طبية مكتوبة ومراجعة من أطباء أخصائيين، تساعدك على فهم الأعراض واختيار
              العلاج المناسب.
            </p>
          </div>
        </div>
      </section>

      {/* ===== 2) شريط التصفية ===== */}
      <section className="w-full bg-white pb-16 pt-6 sm:pt-10">
        <div className="mx-auto w-full max-w-[1380px] px-[15px]">
          <div className="relative overflow-hidden rounded-none bg-[#f8f8f8] p-4 sm:rounded-2xl sm:p-6 lg:p-8">
            <div
              className="pointer-events-none absolute -top-[50%] left-[30%] z-0 h-[200%] w-[200%] rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, rgba(226, 226, 226, 0.6) 0%, rgba(226, 226, 226, 0.2) 40%, transparent 70%)',
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* التصنيفات */}
              <div>
                <div className="mb-2 text-[1rem] text-[#212529] sm:text-[1.1rem]">
                  تصفية حسب التصنيف
                </div>
                <ul className="flex flex-wrap gap-2">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId(null);
                        setPage(1);
                      }}
                      aria-pressed={categoryId === null}
                      className={`rounded-[30px] border px-3 py-1 text-[0.85rem] transition-all duration-300 ${
                        categoryId === null
                          ? 'border-[#1c93bd78] bg-white font-semibold text-[#1ca8e5]'
                          : 'border-[#9fcde045] bg-[#1c93bd14] text-[#1d93bd] hover:border-[#1c93bd78] hover:bg-white'
                      }`}
                    >
                      الكل
                    </button>
                  </li>
                  {(categoriesQuery.data ?? []).map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryId(category.id);
                          setPage(1);
                        }}
                        aria-pressed={categoryId === category.id}
                        className={`rounded-[30px] border px-3 py-1 text-[0.85rem] transition-all duration-300 ${
                          categoryId === category.id
                            ? 'border-[#1c93bd78] bg-white font-semibold text-[#1ca8e5]'
                            : 'border-[#9fcde045] bg-[#1c93bd14] text-[#1d93bd] hover:border-[#1c93bd78] hover:bg-white'
                        }`}
                      >
                        {category.name}
                        <span className="ms-1.5 text-[0.72rem] opacity-70">
                          ({category.postsCount})
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* البحث والترتيب */}
              <div className="flex flex-col gap-3 md:items-end">
                <div className="flex w-full items-center gap-2 rounded-[30px] border border-[#343a40] bg-white px-3 transition-shadow focus-within:shadow-[0_0_10px_rgba(0,0,0,0.2)] md:max-w-[380px]">
                  <Search className="h-4 w-4 flex-shrink-0 text-[#565656]" />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        setPage(1);
                      }
                    }}
                    placeholder="ابحث في المقالات الطبية..."
                    aria-label="البحث في المقالات"
                    dir="rtl"
                    className="h-11 w-full border-0 bg-transparent text-[0.9rem] outline-none"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        setPage(1);
                      }}
                      className="p-1 text-[#565656] transition-colors hover:text-[#1ca8e5]"
                      title="مسح البحث"
                      aria-label="مسح البحث"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="relative inline-flex w-full overflow-hidden rounded-[30px] border border-[#343a40] bg-white transition-shadow hover:shadow-[0_0_10px_rgba(0,0,0,0.2)] md:max-w-[260px]">
                  <select
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value as SortValue);
                      setPage(1);
                    }}
                    aria-label="ترتيب المقالات"
                    className="w-full cursor-pointer appearance-none bg-white py-[0.6rem] pl-[3.2rem] pr-4 text-[0.9rem] text-[#343a40] outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a5a5a]"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* عدّاد النتائج */}
            <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e6e6] pt-4">
              <p className="text-[0.8rem] text-[#565656]">
                {listQuery.isLoading ? (
                  'جارٍ تحميل المقالات...'
                ) : (
                  <>
                    {hasActiveFilters ? 'النتائج المطابقة: ' : 'إجمالي المقالات المنشورة: '}
                    <span className="font-semibold text-[#1ca8e5]">
                      {pagination?.total ?? 0}
                    </span>{' '}
                    مقال
                    {selectedCategory ? ` في تصنيف «${selectedCategory.name}»` : ''}
                  </>
                )}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[0.8rem] font-medium text-[#1ca8e5] transition-colors hover:text-[#0f6d95]"
                >
                  <X className="h-3.5 w-3.5" />
                  إلغاء التصفية
                </button>
              )}
            </div>
          </div>

          {/* حالات التحميل والخطأ والفراغ */}
          {listQuery.isLoading && (
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {Array.from({ length: 6 }, (_, index) => (
                <li
                  key={index}
                  className="overflow-hidden rounded-[10px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.08)] sm:rounded-[24px]"
                >
                  <Skeleton className="h-[220px] w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-9 w-full rounded-[30px]" />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {listQuery.isError && (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
              <h3 className="mt-3 text-lg font-bold text-foreground">تعذّر تحميل المقالات</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                حدث خطأ أثناء جلب قائمة المقالات. يرجى المحاولة مرة أخرى.
              </p>
              <button
                type="button"
                onClick={() => listQuery.refetch()}
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-[30px] border border-[#1ca8e5] px-4 py-2 text-sm font-medium text-[#1ca8e5] transition-colors hover:bg-[#1ca8e5] hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </button>
            </div>
          )}

          {!listQuery.isLoading && !listQuery.isError && posts.length === 0 && (
            <div className="mx-auto mt-8 max-w-lg space-y-4 rounded-3xl border border-dashed border-[#d7dee3] bg-[#f8f8f8] p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-[#9aa3ab] shadow-sm">
                <SearchX className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-[#212529]">لا توجد مقالات لعرضها</h3>
              <p className="text-sm leading-relaxed text-[#565656]">
                {hasActiveFilters
                  ? 'لا توجد مقالات مطابقة لتصفيتك الحالية. جرّب كلمة بحث أخرى أو ألغِ التصفية.'
                  : 'لم تُنشر أي مقالات في المدونة الطبية بعد.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 rounded-[30px] border border-[#1ca8e5] px-5 py-2 text-sm font-medium text-[#1ca8e5] transition-colors hover:bg-[#1ca8e5] hover:text-white"
                >
                  إلغاء التصفية وعرض كل المقالات
                </button>
              )}
            </div>
          )}

          {/* ===== 3) شبكة البطاقات + الترقيم ===== */}
          {!listQuery.isLoading && !listQuery.isError && posts.length > 0 && (
            <>
              <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {posts.map((post) => (
                  <li key={post.id} className="h-full">
                    <BlogCard post={post} />
                  </li>
                ))}
              </ul>

              <BlogPagination
                currentPage={pagination?.page ?? 1}
                totalPages={totalPages}
                onPageChange={(next) => {
                  setPage(next);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="mt-10"
              />
            </>
          )}
        </div>
      </section>

      {/* ===== 4) بانر الدعوة للحجز ===== */}
      <section className="w-full bg-white pb-16">
        <div className="mx-auto w-full max-w-[1380px] px-[15px]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0f6d95] via-[#1ca8e5] to-[#2eb34b] px-6 py-10 text-white sm:px-12 sm:py-12">
            <div
              className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-[620px]">
                <h2 className="text-[22px] font-bold sm:text-[28px]">
                  هل لديك استفسار طبي بعد قراءة المقالات؟
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
                  فريق خدمة المرضى في {COMPANY_ARABIC_NAME} جاهز لمساعدتك في اختيار التخصص المناسب،
                  وحجز موعدك في الوقت الذي يناسبك.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openBookingModal()}
                  className="inline-flex items-center gap-2 rounded-[30px] bg-white px-6 py-2.5 text-sm font-semibold text-[#1ca8e5] shadow-sm transition-all hover:bg-white/90"
                >
                  <Calendar className="h-4 w-4" />
                  احجز موعدك الآن
                </button>
                <Link
                  href="/departments"
                  className="rounded-[30px] border border-white/70 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  تصفّح الأقسام
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
