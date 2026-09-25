import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useBookingModal } from '@/hooks/booking/useBookingModal';

interface OfferPackage {
  id: string;
  title: string;
  price: number;
  image: string;
}

const OFFERS_LIST: OfferPackage[] = [
  {
    id: 'o1',
    title: 'باقة الربو',
    price: 1250,
    image: '/sgh/offers/offer-1.png',
  },
  {
    id: 'o2',
    title: 'باقة الانسداد الشعبي للمدخنين',
    price: 770,
    image: '/sgh/offers/offer-2.jpg',
  },
  {
    id: 'o3',
    title: 'إبرة النيوفوند',
    price: 1199,
    image: '/sgh/offers/offer-3.jpg',
  },
  {
    id: 'o4',
    title: 'جلسة بلازما متطورة',
    price: 1199,
    image: '/sgh/offers/offer-4.jpg',
  },
];

export default function SghOffersSection() {
  const { openBookingModal } = useBookingModal();
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
  const totalPages = Math.ceil(OFFERS_LIST.length / itemsPerPage);

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
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const safePage = page % totalPages;
  const visibleOffers = OFFERS_LIST.slice(
    safePage * itemsPerPage,
    safePage * itemsPerPage + itemsPerPage
  );

  return (
    <div id="offers" className="select-none" dir="rtl">
      {/* 1. Full-Width Cyan CTA Banner (section-cta) */}
      <section className="section section-cta relative overflow-hidden bg-[#1ca8e5] py-6 px-4 lg:px-8 text-white shadow-sm">
        {/* Subtle decorative geometric overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(115deg, rgba(255, 255, 255, 0.25) 0%, transparent 45%, rgba(0, 0, 0, 0.1) 100%)',
          }}
        />

        <div className="container max-w-[1380px] mx-auto px-[15px] relative z-10">
          <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <header className="section-header with-cta text-right">
              <h2 className="text-[20px] sm:text-[24px] lg:text-[27px] font-bold text-white leading-snug">
                احصل على أفضل العروض اليوم!
                <i className="block text-[13px] sm:text-[14.5px] font-normal not-italic text-white/95 mt-1 font-light">
                  لقد قمنا بجمع قائمة بالعروض المذهلة عبر الإنترنت لتحويل حياتك الصحية إلى الأفضل.
                </i>
              </h2>
            </header>

            <a
              href="/offers"
              className="btn btn-primary btn-white bg-white hover:bg-slate-50 text-[#1ca8e5] text-[15px] sm:text-[16px] font-bold px-7 py-2.5 rounded-full transition-all shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 active:scale-95"
            >
              <span>جميع العروض</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. Offers Packages Carousel (section-offers) */}
      <section className="section section-offers py-8 sm:py-10 bg-white">
        {/* Standardized Unified Container Margins */}
        <div className="container max-w-[1380px] mx-auto px-[15px]">
          <div className="inner-section max-w-[1140px] mx-auto px-4 sm:px-6">
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {visibleOffers.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openBookingModal()}
                  className="relative w-full pt-[70%] overflow-hidden group cursor-pointer shadow-md rounded-xs border border-slate-100"
                >
                  {/* Background Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Curved Price Badge in Top-Left Corner (in LTR) or Top-Right (in RTL) */}
                  <div className="price-badge absolute top-0 left-0 bg-[#1ca8e5] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-br-[32px] sm:rounded-br-[36px] shadow-sm flex items-baseline gap-1.5 z-20">
                    <span className="text-[10px] sm:text-[12px] font-bold tracking-wider opacity-95">
                      SAR
                    </span>
                    <span className="text-[20px] sm:text-[28px] font-bold leading-none">
                      {item.price}
                    </span>
                  </div>

                  {/* Deep Blue Bottom Gradient for title readability */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none z-10"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #0d4e9c 100%)',
                    }}
                  />

                  {/* Title in Bottom-Right Corner: font-size 1rem (16px) on mobile, 24-28px on desktop */}
                  <h3 className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 z-20 text-[16px] sm:text-[24px] lg:text-[26px] font-bold text-white drop-shadow-md leading-tight text-right max-w-[85%] sm:max-w-[70%] m-0">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>

            {/* SGH Carousel Pagination Navigation Controls */}
            <div className="navigator flex items-center justify-center gap-3 pt-8 sm:pt-10">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-[#1ca8e5] hover:bg-[#168fca] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer active:scale-95"
                aria-label="السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-[#1ca8e5] hover:bg-[#168fca] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer active:scale-95"
                aria-label="التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
