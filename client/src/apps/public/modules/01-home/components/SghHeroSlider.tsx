import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Calendar, ArrowLeft } from 'lucide-react';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { Link } from 'wouter';

interface SlideItem {
  id: number;
  title?: string;
  subtitle?: string;
  badge?: string;
  image: string;
  isGraphicBanner?: boolean;
  primaryAction?: {
    label: string;
    type: 'booking' | 'link';
    href?: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export default function SghHeroSlider() {
  const { openBookingModal } = useBookingModal();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides: SlideItem[] = [
    {
      id: 1,
      image: '/sgh/banner1.jpg',
      isGraphicBanner: true,
    },
    {
      id: 2,
      title: 'تطبيق السعودي الألماني الصحية - رعايتك في متناول يدك',
      subtitle:
        'إدارة مواعيدك، نتائج الفحوصات المخبرية، تقارير الأشعة، واستشارات الأطباء في أي وقت ومن أي مكان.',
      badge: 'التطبيق الذكي الموحد',
      image: '/sgh/slide2.jpg',
      primaryAction: {
        label: 'تحميل التطبيق الآن',
        type: 'link',
        href: 'https://saudigermanhealth.com/en/mobile-application-0',
      },
      secondaryAction: {
        label: 'احجز موعد',
        href: '#booking',
      },
    },
    {
      id: 3,
      title: 'أكبر مجموعة مستشفيات خاصة في الشرق الأوسط',
      subtitle:
        'رعايتنا تصنع الفرق في منطقة حائل والمملكة العربية السعودية، بتقديم أحدث الخدمات الطبية المتكاملة بمعايير عالمية.',
      badge: 'السعودي الألماني الصحية · حائل',
      image: '/sgh/slide3.jpg',
      primaryAction: {
        label: 'احجز موعدك الآن',
        type: 'booking',
      },
      secondaryAction: {
        label: 'عرض المزيد عن المستشفى',
        href: '#about',
      },
    },
    {
      id: 4,
      title: 'توفير رعاية مبتكرة وشاملة تركز على حاجات المرضى',
      subtitle:
        'نخبة من كبار الأطباء والاستشاريين وحملة البورد الدولي في أكثر من 40 تخصصاً دقيقاً لضمان أفضل مسار علاجي.',
      badge: 'نخبة الاستشاريين والأطباء',
      image: '/sgh/slide4.jpg',
      primaryAction: {
        label: 'تصفح جميع الأطباء',
        type: 'link',
        href: '/doctors',
      },
      secondaryAction: {
        label: 'حجز موعد مباشر',
        href: '#booking',
      },
    },
    {
      id: 5,
      title: 'الرعاية الصحية العالمية أقرب إليك في حائل',
      subtitle:
        'تجهيزات فائقة التطور، أجنحة عناية حثيثة متقدمة، وطوارئ تعمل 24 ساعة بأعلى درجات الجاهزية والسرعة.',
      badge: 'تجهيزات طبية ومختبرات متطورة',
      image: '/sgh/slide5.jpg',
      primaryAction: {
        label: 'جميع التخصصات الطبية',
        type: 'link',
        href: '/departments',
      },
      secondaryAction: {
        label: 'العروض الطبية',
        href: '/offers',
      },
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) {
      return;
    }
    const interval = setInterval(() => {
      nextSlide();
    }, 6500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div
      className="relative w-full h-[440px] sm:h-[500px] md:h-[550px] lg:h-[580px] overflow-hidden bg-slate-900 select-none"
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
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 transition-transform duration-7000 ease-out"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {slide.isGraphicBanner ? (
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#101738]/90 via-[#1E2B6D]/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </>
              )}
            </div>

            {/* Slide Content if not pure graphic banner */}
            {!slide.isGraphicBanner && (
              <div className="relative h-full container mx-auto px-6 sm:px-12 lg:px-20 flex items-center">
                <div className="max-w-2xl text-white space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                  {slide.badge && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
                      <span>{slide.badge}</span>
                    </div>
                  )}

                  {slide.title && (
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                      {slide.title}
                    </h1>
                  )}

                  {slide.subtitle && (
                    <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-xl line-clamp-3">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-2">
                    {slide.primaryAction?.type === 'booking' ? (
                      <button
                        onClick={() => openBookingModal()}
                        className="px-6 py-3 rounded-full bg-[#00a3e0] hover:bg-[#008fc5] text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-white" />
                        <span>{slide.primaryAction.label}</span>
                      </button>
                    ) : slide.primaryAction ? (
                      <a
                        href={slide.primaryAction.href}
                        className="px-6 py-3 rounded-full bg-[#00a3e0] hover:bg-[#008fc5] text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center gap-2"
                      >
                        <span>{slide.primaryAction.label}</span>
                        <ArrowLeft className="w-4 h-4" />
                      </a>
                    ) : null}

                    {slide.secondaryAction && (
                      <a
                        href={slide.secondaryAction.href}
                        className="px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-medium text-sm sm:text-base border border-white/30 backdrop-blur-md transition-all"
                      >
                        {slide.secondaryAction.label}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="الشريحة السابقة"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="الشريحة التالية"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Authentic SGH Thumbnail Line Indicators exactly like ref_slider_loaded.png */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-6 flex items-center justify-between">
        {/* Horizontal background line connecting thumbnails */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1.5px] bg-white/40 pointer-events-none z-0" />

        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`انتقال للشريحة ${idx + 1}`}
              className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-lg ${
                isActive
                  ? 'border-white scale-125 ring-4 ring-white/40'
                  : 'border-white/60 opacity-80 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img
                src={slide.image}
                alt={`مصغرة الشريحة ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
