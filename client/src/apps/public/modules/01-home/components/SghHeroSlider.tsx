import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SlideItem {
  id: number;
  image: string;
  isGraphicBanner?: boolean;
  slideLink?: string;
  title?: string | React.ReactNode;
  button?: {
    label: string;
    href: string;
  };
}

const SLIDE_DURATION = 6500; // 6.5 seconds per slide (matches SGH Hail)
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~213.63

export default function SghHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressStartTimeRef = useRef<number>(Date.now());

  const slides: SlideItem[] = [
    {
      id: 1,
      image: '/sgh/banner1.jpg',
      isGraphicBanner: true,
      slideLink: 'https://hail.saudigermanhealth.com/ar',
    },
    {
      id: 2,
      image: '/sgh/slide2.jpg',
      isGraphicBanner: false,
      button: {
        label: 'Download Now',
        href: 'https://saudigermanhealth.com/en/mobile-application-0',
      },
    },
    {
      id: 3,
      image: '/sgh/slide3.jpg',
      title: 'أكبر مجموعة مستشفيات خاصة في الشرق الأوسط',
      button: {
        label: 'عرض المزيد',
        href: '/#about',
      },
    },
    {
      id: 4,
      image: '/sgh/slide4.jpg',
      title: (
        <>
          توفير رعاية مبتكرة وشاملة
          <br />
          تركز على حاجات المرضى
        </>
      ),
      button: {
        label: 'جميع الأطباء',
        href: '/doctors',
      },
    },
    {
      id: 5,
      image: '/sgh/slide5.jpg',
      title: 'الرعاية الصحية العالمية أقرب إليك',
      button: {
        label: 'جميع التخصصات الطبية',
        href: '/departments',
      },
    },
  ];

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setProgress(0);
    progressStartTimeRef.current = Date.now();
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide, slides.length]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, goToSlide, slides.length]);

  // Continuous timer matching SGH Hail na-main-slider
  useEffect(() => {
    progressStartTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - progressStartTimeRef.current;
      const currentProgress = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
      setProgress(currentProgress);

      if (elapsed >= SLIDE_DURATION) {
        nextSlide();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentSlide, nextSlide]);

  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <section
      className="sgh-hero-surface layout slider-layout w-full bg-white py-0 overflow-hidden"
      dir="rtl"
    >
      {/* Responsive slider container matching SGH Hail height: 45% ratio on all screen sizes */}
      <div className="relative w-full h-[195px] sm:h-[310px] md:h-[450px] lg:h-[607px] overflow-hidden bg-black select-none group">
        {/* Slides List */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Subtle dark gradient overlay for text readability as in reference */}
                {slide.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
                )}
              </div>

              {/* Clickable Area for Full Graphic Banner */}
              {slide.isGraphicBanner && slide.slideLink && (
                <a
                  href={slide.slideLink}
                  className="absolute inset-0 z-10 cursor-pointer"
                  aria-label="رابط الشريحة"
                />
              )}

              {/* Centered Text and Button Container (.na-slide-text) - Matches reference site mobile 0.9rem */}
              {(slide.title || slide.button) && (
                <div className="absolute inset-x-0 bottom-[22px] sm:bottom-[36px] md:bottom-[60px] lg:bottom-[76px] flex flex-col items-center justify-center text-center px-3 z-10">
                  {slide.title && (
                    <h1 className="text-[13px] sm:text-[18px] md:text-[28px] lg:text-[36px] font-medium text-white text-center mb-1 sm:mb-2 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-w-[90%]">
                      {slide.title}
                    </h1>
                  )}

                  {slide.button && (
                    <div className="mt-0.5 sm:mt-1">
                      <a
                        href={slide.button.href}
                        target={slide.button.href.startsWith('http') ? '_blank' : undefined}
                        rel={
                          slide.button.href.startsWith('http') ? 'noopener noreferrer' : undefined
                        }
                        className="inline-flex h-[38px] items-center justify-center bg-[#1ca8e5] hover:bg-[#1896cd] text-white text-[11px] sm:text-[13px] md:text-[16px] font-normal px-2.5 sm:px-4 sm:py-1 md:px-[22.4px] md:py-[6px] rounded-[30px] transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg leading-tight"
                      >
                        {slide.button.label}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Left Arrow Action (.na-slider-actions.prev) - width: 50px-100px */}
        <button
          onClick={prevSlide}
          aria-label="الشريحة السابقة"
          className="absolute left-0 top-0 bottom-0 w-[40px] sm:w-[70px] lg:w-[100px] z-20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none bg-gradient-to-r from-black/25 to-transparent"
        >
          <ChevronLeft className="w-6 h-6 sm:w-9 sm:h-9 lg:w-11 lg:h-11 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] transition-transform hover:-translate-x-1" />
        </button>

        {/* Right Arrow Action (.na-slider-actions.next) - width: 50px-100px */}
        <button
          onClick={nextSlide}
          aria-label="الشريحة التالية"
          className="absolute right-0 top-0 bottom-0 w-[40px] sm:w-[70px] lg:w-[100px] z-20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none bg-gradient-to-l from-black/25 to-transparent"
        >
          <ChevronRight className="w-6 h-6 sm:w-9 sm:h-9 lg:w-11 lg:h-11 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] transition-transform hover:translate-x-1" />
        </button>

        {/* Thumbnails Navigation Loader (.na-slides-loader) - Responsive compact design for mobile */}
        <div
          className="absolute bottom-[4px] sm:bottom-[6px] inset-x-0 z-20 flex items-center justify-center px-2 sm:px-[50px] lg:px-[67.5px]"
          dir="ltr"
        >
          <div className="relative w-[85%] sm:w-full max-w-[1215px] h-[30px] sm:h-[42px] md:h-[50px] flex items-center justify-between">
            {/* Horizontal Connecting White Line Passing Behind Thumb Centers */}
            <div className="absolute left-[12px] sm:left-[18px] md:left-[25px] right-[12px] sm:right-[18px] md:right-[25px] top-1/2 -translate-y-1/2 h-[1px] bg-white/40 pointer-events-none z-0" />

            {slides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
                  className="relative z-10 w-[24px] h-[24px] sm:w-[36px] sm:h-[36px] md:w-[50px] md:h-[50px] flex items-center justify-center cursor-pointer focus:outline-none group/thumb"
                >
                  {/* SVG Countdown Ring Indicator on Active Slide */}
                  {isActive && (
                    <svg
                      viewBox="0 0 70 70"
                      className="absolute inset-0 w-full h-full m-auto pointer-events-none -rotate-90"
                    >
                      {/* Static faint background circle */}
                      <circle
                        cx="35"
                        cy="35"
                        r={RADIUS}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="2"
                      />
                      {/* Animated progress circle */}
                      <circle
                        cx="35"
                        cy="35"
                        r={RADIUS}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                  )}

                  {/* Circular Thumbnail Preview Image */}
                  <div
                    className={`w-[16px] h-[16px] sm:w-[24px] sm:h-[24px] md:w-[34px] md:h-[34px] rounded-full overflow-hidden transition-all duration-300 ${
                      isActive
                        ? 'ring-1.5 sm:ring-2 ring-white scale-100 shadow-[0_0_6px_rgba(0,0,0,0.6)]'
                        : 'opacity-85 group-hover/thumb:opacity-100 group-hover/thumb:scale-105 ring-1 ring-white/60 shadow-[0_0_4px_rgba(0,0,0,0.42)]'
                    }`}
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
