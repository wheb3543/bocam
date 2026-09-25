import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Partner {
  name: string;
  logo: string;
}

const PARTNERS: Partner[] = [
  { name: 'مدنت', logo: '/sgh/insurance/mednet.png' },
  { name: 'عناية السعودية', logo: '/sgh/insurance/3inaya.png' },
  { name: 'تكافل الراجحي', logo: '/sgh/insurance/alrajhi.png' },
  { name: 'سايكو', logo: '/sgh/insurance/saico.png' },
  { name: 'غلوب ميد', logo: '/sgh/insurance/globemed.png' },
  { name: 'بوبا العربية', logo: '/sgh/insurance/bupa.png' },
  { name: 'التعاونية للتأمين', logo: '/sgh/insurance/tawuniya.png' },
  { name: 'ميدغلف', logo: '/sgh/insurance/medgulf.png' },
  { name: 'نكست كير', logo: '/sgh/insurance/nextcare.png' },
  { name: 'ملاذ للتأمين', logo: '/sgh/insurance/malath.png' },
  { name: 'TCS', logo: '/sgh/insurance/tcs.png' },
  { name: 'AXA', logo: '/sgh/insurance/axa.png' },
  { name: 'شركة التأمين الخليجية', logo: '/sgh/insurance/gulfinsurance.png' },
];

export default function SghInsuranceCarousel() {
  const [startIndex, setStartIndex] = useState(0);
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

  const itemsPerPage = isMobile ? 1 : 4;

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % PARTNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + PARTNERS.length) % PARTNERS.length);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % PARTNERS.length);
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

  // Get current circular items
  const visiblePartners: Partner[] = [];
  for (let i = 0; i < itemsPerPage; i++) {
    visiblePartners.push(PARTNERS[(startIndex + i) % PARTNERS.length]);
  }

  return (
    <section
      className="section section-carousel my-6 sm:my-8 bg-white select-none overflow-hidden"
      dir="rtl"
    >
      {/* SGH Hail: .inner-section with authentic #f8f8f8 background card: 1rem (16px) on mobile, 3rem (48px) on desktop */}
      <div className="container max-w-[1380px] mx-auto px-[15px]">
        <div className="inner-section w-full bg-[#f8f8f8] py-4 sm:py-12 px-4 sm:px-12 rounded-none sm:rounded-2xl">
          {/* Inner Content Grid: .col-md-10.offset-md-1 (max-w-[1140px] mx-auto) */}
          <div className="max-w-[1140px] mx-auto">
            <header className="section-header text-center mb-6 sm:mb-10">
              <h2 className="text-[24px] sm:text-[32px] font-bold text-[#212529] tracking-tight m-0">
                شركاء التأمين
              </h2>
            </header>

            {/* Clean Logo Row: 1 logo on mobile, 4 logos on desktop with exact 140px container */}
            <div
              className="w-full mx-auto"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-8 items-center justify-items-center">
                {visiblePartners.map((partner, idx) => (
                  <div
                    key={`${partner.name}-${idx}`}
                    className="w-full h-[140px] flex items-center justify-center p-2 sm:p-4 transition-transform duration-300 hover:scale-105"
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-[85px] sm:max-h-[95px] max-w-[200px] sm:max-w-[220px] w-auto h-auto object-contain filter drop-shadow-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Minimal Delicate Chevron Navigation Arrows (< and >) */}
            <div className="navigator flex items-center justify-center gap-3 pt-6 sm:pt-8">
              <button
                onClick={handlePrev}
                className="na-slider-actions prev text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer active:scale-95"
                aria-label="السابق"
              >
                <ChevronRight className="w-5 h-5 stroke-[2]" />
              </button>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <button
                onClick={handleNext}
                className="na-slider-actions next text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer active:scale-95"
                aria-label="التالي"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
