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

  // Smooth continuous animation without pause-on-hover to match SGH Hail behavior
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
    <section className="w-full bg-white py-0 overflow-hidden" dir="rtl">
      {/* عرض وارتفاع حاوية السلايدر بالموقع المرجعي: container بعرض 1350px ونسبة ~93.75% من الشاشة مع ارتفاع ~580px */}
      <div className="container mx-auto px-0 sm:px-4 max-w-[1350px]">
        <div className="relative w-full h-[460px] sm:h-[500px] md:h-[540px] lg:h-[580px] overflow-hidden bg-black select-none group">
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
                  {/* تظليل سفلي متدرج خفيف للشرائح النصية كالأصل */}
                  {slide.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Clickable Area for Full Graphic Banners (Slide 1) */}
                {slide.isGraphicBanner && slide.slideLink && (
                  <a
                    href={slide.slideLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10 cursor-pointer"
                    aria-label="رابط الشريحة"
                  />
                )}

                {/* زر تحميل التطبيق في الشريحة الثانية (Download Now) بموضعه الدقيق في المساحة المخصصة أسفل الشارات وبجانب QR */}
                {slide.id === 2 && slide.button && (
                  <div className="absolute right-[12%] sm:right-[16%] md:right-[20%] lg:right-[23%] top-[72%] sm:top-[70%] md:top-[68%] z-10">
                    <a
                      href={slide.button.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-[#00a3e0] hover:bg-[#0092c8] active:bg-[#0081b0] text-white text-xs sm:text-sm md:text-base font-semibold px-6 sm:px-8 py-2 sm:py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                    >
                      {slide.button.label}
                    </a>
                  </div>
                )}

                {/* أماكن النصوص والأزرار للشرائح الأخرى (3، 4، 5) - موسط أفقياً في الثلث السفلي مباشرة فوق الكاونتر */}
                {slide.title && (
                  <div className="absolute inset-x-0 bottom-24 sm:bottom-28 md:bottom-30 flex flex-col items-center justify-center text-center px-4 sm:px-8 z-10 pointer-events-none">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] whitespace-nowrap text-center mb-4 sm:mb-5 tracking-wide">
                      {slide.title}
                    </h1>

                    {slide.button && (
                      <div className="pointer-events-auto">
                        <a
                          href={slide.button.href}
                          className="inline-flex items-center justify-center bg-[#00a3e0] hover:bg-[#0092c8] active:bg-[#0081b0] text-white text-base sm:text-lg font-medium px-8 sm:px-10 py-2 sm:py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
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

          {/* الأسهم الجانبية التي تظهر عند التمرير بالماوس فوق السلايدر (Hover) في الطرف الأيمن والأيسر */}
          <button
            onClick={prevSlide}
            aria-label="الشريحة السابقة"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-16 sm:w-12 sm:h-20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-300 focus:outline-none"
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:-translate-x-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="الشريحة التالية"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-16 sm:w-12 sm:h-20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-300 focus:outline-none"
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:translate-x-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
          </button>

          {/* مكان المؤشرات الدائرية والخط الرابط السفلي */}
          <div
            className="absolute bottom-3 sm:bottom-5 inset-x-0 z-20 flex items-center justify-center"
            dir="ltr"
          >
            <div className="relative w-full max-w-4xl lg:max-w-5xl px-6 sm:px-12 flex items-center justify-between">
              {/* الخط الأفقي الرفيع الرابط خلف الدوائر */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1px] bg-white/40 pointer-events-none z-0" />

              {slides.map((slide, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(idx)}
                    aria-label={`انتقال للشريحة ${idx + 1}`}
                    className="relative z-10 w-[52px] h-[52px] flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none group/thumb"
                  >
                    {/* حلقة التوقيت التنازلي للشريحة النشطة */}
                    {isActive ? (
                      <svg
                        width="52px"
                        height="52px"
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

                    {/* الصورة الدائرية المصغرة */}
                    <div
                      className={`w-[34px] h-[34px] rounded-full overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition-all duration-300 ${
                        isActive
                          ? 'scale-105 ring-2 ring-white'
                          : 'opacity-85 group-hover/thumb:opacity-100 group-hover/thumb:scale-110 ring-1 ring-white/70'
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
      </div>
    </section>
  );
}
