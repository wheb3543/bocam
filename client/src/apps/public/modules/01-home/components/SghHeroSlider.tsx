import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SlideItem {
  id: number;
  image: string;
  isGraphicBanner?: boolean;
  slideLink?: string;
  title?: string;
  button?: {
    label: string;
    href: string;
  };
}

const SLIDE_DURATION = 6500; // 6.5 seconds per slide
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~213.6

export default function SghHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressStartTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  const slides: SlideItem[] = [
    {
      id: 1,
      image: '/sgh/banner1.jpg',
      isGraphicBanner: true,
    },
    {
      id: 2,
      image: '/sgh/slide2.jpg',
      isGraphicBanner: true,
      slideLink: 'https://saudigermanhealth.com/en/mobile-application-0',
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
      title: 'توفير رعاية مبتكرة وشاملة\nتركز على حاجات المرضى',
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
    elapsedBeforePauseRef.current = 0;
    progressStartTimeRef.current = Date.now();
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide, slides.length]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, goToSlide, slides.length]);

  // Smooth animation of the circular SVG countdown progress ring
  useEffect(() => {
    if (isPaused) {
      elapsedBeforePauseRef.current += Date.now() - progressStartTimeRef.current;
      return;
    }

    progressStartTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = elapsedBeforePauseRef.current + (Date.now() - progressStartTimeRef.current);
      const currentProgress = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
      setProgress(currentProgress);

      if (elapsed >= SLIDE_DURATION) {
        nextSlide();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div
      className="relative w-full h-[440px] sm:h-[500px] md:h-[560px] lg:h-[600px] overflow-hidden bg-black select-none"
      dir="rtl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Slide Background Image */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Subtle natural darkening for text readability on non-graphic slides */}
              {!slide.isGraphicBanner && (
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/25 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Clickable Area for Graphic Banners */}
            {slide.isGraphicBanner && slide.slideLink && (
              <a
                href={slide.slideLink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10 cursor-pointer"
                aria-label="رابط الشريحة"
              />
            )}

            {/* Slide Content */}
            {!slide.isGraphicBanner && (
              <div className="relative h-full container mx-auto px-6 sm:px-12 lg:px-20 max-w-6xl flex items-center">
                <div className="max-w-2xl text-white space-y-5 text-right z-10">
                  {slide.title && (
                    <h1 className="text-2xl sm:text-3xl md:text-[40px] font-medium leading-tight text-white drop-shadow-md whitespace-pre-line">
                      {slide.title}
                    </h1>
                  )}

                  {slide.button && (
                    <div className="pt-2">
                      <a
                        href={slide.button.href}
                        className="inline-flex items-center justify-center bg-[#1ca8e5] hover:bg-[#1594ce] text-white text-[16px] font-normal px-[22.4px] py-[6px] h-[38px] rounded-full border border-[#1ca8e5] shadow-none transition-colors cursor-pointer"
                      >
                        {slide.button.label}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Transparent Navigation Arrows on Sides */}
      <button
        onClick={prevSlide}
        aria-label="الشريحة السابقة"
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer group focus:outline-none"
      >
        <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:-translate-x-1 drop-shadow-md" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="الشريحة التالية"
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer group focus:outline-none"
      >
        <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:translate-x-1 drop-shadow-md" />
      </button>

      {/* Authentic SGH Thumbnail Bar with Connecting Line & SVG Circular Progress Ring */}
      <div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-8 flex items-center justify-between"
        dir="ltr"
      >
        {/* Horizontal background line connecting thumbnails */}
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[1.5px] bg-white/50 pointer-events-none z-0" />

        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              aria-label={`انتقال للشريحة ${idx + 1}`}
              className="relative z-10 w-[54px] h-[54px] flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none group"
            >
              {/* Circular SVG Countdown Progress Ring for Active Slide */}
              {isActive ? (
                <svg
                  width="54px"
                  height="54px"
                  viewBox="0 0 70 70"
                  className="absolute inset-0 m-auto pointer-events-none -rotate-90"
                >
                  <circle
                    cx="35"
                    cy="35"
                    r={RADIUS}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="35"
                    cy="35"
                    r={RADIUS}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}

              {/* Inner Circle Thumbnail Image */}
              <div
                className={`w-[34px] h-[34px] rounded-full overflow-hidden shadow-[0_0_6px_rgba(0,0,0,0.5)] transition-transform duration-300 ${
                  isActive
                    ? 'scale-105 ring-2 ring-white'
                    : 'opacity-80 group-hover:opacity-100 group-hover:scale-110'
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
  );
}
