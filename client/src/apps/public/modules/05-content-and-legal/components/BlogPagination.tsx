/**
 * BlogPagination
 * ترقيم صفحات المدونة العامة
 *
 * يطابق نمط الموقع المرجعي: أرقام دائرية مع «…» عند وجود صفحات بعيدة،
 * إضافة إلى أسهم التنقل وزر «الصفحة التالية» بلغة صريحة (تحسين وصولية).
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

type BlogPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

/** يبني قائمة الصفحات المعروضة مع علامة «…» للصفحات المخفية. */
export function buildPageWindow(
  currentPage: number,
  totalPages: number,
  windowSize = 2
): Array<number | 'gap'> {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set<number>([1, totalPages]);
  for (
    let page = Math.max(2, currentPage - windowSize);
    page <= Math.min(totalPages - 1, currentPage + windowSize);
    page += 1
  ) {
    pages.add(page);
  }

  // note: نستخدم Array.from لأن هدف المشروع ES5 ولا يدعم spread على Set.
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: Array<number | 'gap'> = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      result.push('gap');
    }
    result.push(page);
  });

  return result;
}

export function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: BlogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const baseButton =
    'flex h-10 w-10 items-center justify-center rounded-full border text-[0.9rem] transition-all duration-200';
  const idleButton = `${baseButton} border-[#ddf0fb] bg-[#ebf6fc] text-[#212529] hover:border-[#1ca8e5] hover:bg-[#1ca8e5] hover:text-white`;
  const activeButton = `${baseButton} border-[#1ca8e5] bg-[#1ca8e5] font-semibold text-white`;

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-1 ${className}`}
      aria-label="تصفح صفحات المدونة الطبية"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
        disabled={safePage === 1}
        aria-label="الصفحة السابقة"
        className={`${idleButton} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {buildPageWindow(safePage, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span
            key={`gap-${index}`}
            className="flex h-10 w-8 items-center justify-center text-[#8ca4b8]"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === safePage ? 'page' : undefined}
            aria-label={`الصفحة ${item}`}
            className={item === safePage ? activeButton : idleButton}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
        disabled={safePage === totalPages}
        aria-label="الصفحة التالية"
        className={`${idleButton} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </nav>
  );
}

export default BlogPagination;
