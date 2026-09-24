import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  day: string;
  month: string;
  image: string;
}

const NEWS_LIST: NewsItem[] = [
  {
    id: 'n1',
    title: 'إشارة إلى البيان الصادر عن هيئة السوق المالية بالمملكة العربية السعودية',
    day: '25',
    month: 'أيار',
    image: '/sgh/news/news-1.jpg',
  },
  {
    id: 'n2',
    title: 'السعودي الألماني الصحية تُعزِّز مكانتها كأكبر مجموعةٍ في شبكة Mayo Clinic بالمنطقة',
    day: '1',
    month: 'تشرين الأول',
    image: '/sgh/news/news-2.jpg',
  },
  {
    id: 'n3',
    title: 'عيادة اضطرابات النوم – تشخيص وعلاج متكامل فرع المدينة',
    day: '24',
    month: 'آذار',
    image: '/sgh/news/news-3.jpg',
  },
  {
    id: 'n4',
    title: 'أمل جديد لمريضة استعادت قدرتها على الحركة بعد عملية جراحية متطورة',
    day: '9',
    month: 'كانون الثاني',
    image: '/sgh/news/news-4.jpg',
  },
];

export default function SghNewsSection() {
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = isMobile ? 1 : 2;
  const totalPages = Math.ceil(NEWS_LIST.length / itemsPerPage);

  const handlePrev = () => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) {
      return;
    }
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 40) {
      // Swiped left
      handleNext();
    } else if (diff < -40) {
      // Swiped right
      handlePrev();
    }
    setTouchStart(null);
  };

  const safePage = page % totalPages;
  const visibleNews = NEWS_LIST.slice(
    safePage * itemsPerPage,
    safePage * itemsPerPage + itemsPerPage
  );

  return (
    <section
      id="news"
      className="section-news my-6 sm:my-8 bg-white select-none overflow-hidden"
      dir="rtl"
    >
      {/* SGH Hail: .inner-section with authentic #f8f8f8 background card: 1rem (16px) on mobile, 3rem (48px) on desktop */}
      <div className="inner-section w-full bg-[#f8f8f8] py-4 sm:py-12 px-4 sm:px-12 rounded-none sm:rounded-2xl">
        {/* Inner Content Grid: .col-md-10.offset-md-1 (max-w-[1140px] mx-auto) */}
        <div className="max-w-[1140px] mx-auto">
          {/* Header with CTA */}
          <div className="section-header with-cta flex items-center justify-between mb-6 sm:mb-12">
            <h2 className="text-[24px] sm:text-[32px] font-bold text-[#212529] tracking-tight m-0">
              الاخبار
            </h2>

            <a
              href="/#news"
              className="btn btn-primary bg-[#1ca8e5] hover:bg-[#1694cc] text-white text-[13.5px] sm:text-[16px] font-normal px-4 sm:px-[22.4px] py-1 sm:py-[6px] rounded-[30px] transition-colors shadow-xs inline-flex items-center justify-center cursor-pointer"
            >
              عرض المزيد
            </a>
          </div>

          {/* 2-Columns News Grid with Decorative Gray Offset Block & Deep Blue Calendar Badges */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {visibleNews.map((item) => (
              <div
                key={item.id}
                className="relative group cursor-pointer pr-3 pt-3 sm:pr-6 sm:pt-6"
              >
                {/* SGH Authentic Offset Background Box (#eee): 1.5rem (24px) on desktop, 0.75rem (12px) on mobile with hover translation */}
                <div className="absolute top-0 right-0 w-[calc(100%-12px)] sm:w-[calc(100%-24px)] h-[calc(100%-12px)] sm:h-[calc(100%-24px)] bg-[#eeeeee] transition-all duration-300 group-hover:top-3 group-hover:right-3 sm:group-hover:top-6 sm:group-hover:right-6 pointer-events-none -z-0" />

                {/* Main Photo Container with exact SGH 60% aspect ratio (padding-top: 60%) */}
                <div className="relative z-10 w-full pt-[60%] overflow-hidden bg-slate-100 shadow-xs border-3 border-[#eeeeee]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* SGH Deep Royal Blue Calendar Badge */}
                  <div className="date absolute top-0 right-4 sm:right-6 z-20 w-[56px] min-h-[58px] sm:w-[65px] sm:min-h-[67px] bg-[#2b5ea9] text-white flex flex-col items-center justify-center p-1.5 sm:p-2 text-center shadow-md">
                    <span className="text-[22px] sm:text-[26px] font-bold leading-none tracking-tight">
                      {item.day}
                    </span>
                    <p className="text-[11px] sm:text-[13px] font-normal leading-tight mt-0.5 sm:mt-1 mb-0 opacity-95">
                      {item.month}
                    </p>
                  </div>
                </div>

                {/* Article Headline */}
                <h3 className="relative z-10 text-[15px] sm:text-[19px] font-bold text-[#212529] group-hover:text-[#1ca8e5] transition-colors leading-[1.35] mt-3 sm:mt-4 text-right">
                  <a href="/#news">{item.title}</a>
                </h3>
              </div>
            ))}
          </div>

          {/* Carousel Pagination Controls */}
          <div className="navigator flex items-center justify-center gap-3 pt-8 sm:pt-10">
            <button
              onClick={handlePrev}
              className="na-slider-actions prev w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 flex items-center justify-center text-slate-700 transition-all shadow-sm cursor-pointer active:scale-95"
              aria-label="السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="na-slider-actions next w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 flex items-center justify-center text-slate-700 transition-all shadow-sm cursor-pointer active:scale-95"
              aria-label="التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
