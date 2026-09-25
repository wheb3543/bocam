/**
 * HomePage - الصفحة الرئيسية لمستشفى السعودي الألماني - صنعاء
 *
 * تصميم مطابق بدقة تامة للهيكل البصري، الألوان، الأقسام، والمكونات التفاعلية لمجموعة السعودي الألماني:
 * فرع صنعاء (الجمهورية اليمنية)
 */
import { useState, useEffect } from 'react';
import { ArrowUp, Clock, MessageCircle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import SghHeroSlider from '../components/SghHeroSlider';
import SghQuickMenu from '../components/SghQuickMenu';
import SghDoctorsSection from '../components/SghDoctorsSection';
import SghDepartmentsSection from '../components/SghDepartmentsSection';
import SghFeaturedSection from '../components/SghFeaturedSection';
import SghBlogSection from '../components/SghBlogSection';
import SghNewsSection from '../components/SghNewsSection';
import SghOffersSection from '../components/SghOffersSection';
import SghInsuranceCarousel from '../components/SghInsuranceCarousel';
import SghPatientFeedback from '../components/SghPatientFeedback';
import SghBranchesMap from '../components/SghBranchesMap';
import SghBranchSwitcher from '@/apps/public/layout/SghBranchSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicSEOSettings } from '@/hooks/usePublicContent';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { COMPANY_PHONE, APP_LOGO } from '@/const';

export default function HomePage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { openBookingModal } = useBookingModal();

  const { language } = useLanguage();
  const { data: homeSEOSettings = [] } = usePublicSEOSettings({ slug: 'home', language });
  const homeSEO = homeSEOSettings[0];

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-[60] pointer-events-none">
        <div
          className="h-full bg-[#2eb34b] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <PageLayout
        title={homeSEO?.title || `المستشفى السعودي الألماني - صنعاء | أكبر صرح طبي في اليمن`}
        description={
          homeSEO?.description ||
          `المستشفى السعودي الألماني بصنعاء - رعاية صحية متقدمة بمعايير ألمانية وعالمية، نخبة من كبار الأطباء والاستشاريين، عيادات متطورة، طوارئ 24 ساعة، وأحدث غرف العمليات والعناية المركزة في اليمن.`
        }
        image={homeSEO?.ogImage || APP_LOGO}
        keywords={
          homeSEO?.keywords ||
          `المستشفى السعودي الألماني صنعاء, مستشفى الألماني صنعاء, المستشفى السعودي الألماني اليمن, أطباء صنعاء, حجز موعد صنعاء, شارع الستين, مستشفيات اليمن, طوارئ صنعاء`
        }
        showInstallPWA={false}
        useContainer={true}
      >
        {/* Main Content Sections in exact SGH Hail sequence */}
        {/* 2. Hero Banner Slider */}
        <SghHeroSlider />

        {/* 3. Quick Action Menu Full-Width Green Strip */}
        <SghQuickMenu />

        {/* 4. Doctors Section with "أطباء متخصصون" */}
        <SghDoctorsSection />

        {/* 5. Medical Departments Mosaic */}
        <SghDepartmentsSection />

        {/* 6. Featured Hospital Overview & Stats */}
        <SghFeaturedSection />

        {/* 7. Medical Blog Articles */}
        <SghBlogSection />

        {/* 8. News & Events with Square Date Badges */}
        <SghNewsSection />

        {/* 9. Offers Full-Width Cyan CTA Banner & Packages Carousel */}
        <SghOffersSection />

        {/* 10. Insurance Partners Carousel */}
        <SghInsuranceCarousel />

        {/* 11. Patient Feedback Card */}
        <SghPatientFeedback />

        {/* 12. Branches Map & Hospital Locations */}
        <SghBranchesMap />
      </PageLayout>

      {/* Sticky Cyan Side Tab: "احجز الآن" exactly like reference site */}
      <button
        onClick={() => openBookingModal()}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-[#1ca8e5] hover:bg-[#168fca] text-white px-3 py-4 rounded-r-2xl shadow-2xl flex flex-col items-center gap-2 cursor-pointer transition-all hover:pl-4 group select-none"
        aria-label="احجز الآن"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-bold [writing-mode:vertical-rl] tracking-wider py-1">
          احجز الآن
        </span>
      </button>

      {/* Floating WhatsApp Quick Contact Button */}
      {COMPANY_PHONE && (
        <a
          href={`https://wa.me/${COMPANY_PHONE.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer active:scale-95"
          aria-label="تواصل معنا عبر واتساب"
        >
          <MessageCircle className="w-7 h-7 fill-white" />
        </a>
      )}

      {/* Back to Top Floating Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full bg-[#007242] hover:bg-[#2eb34b] text-white shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer active:scale-95 border border-white/20"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Fixed Domain / Branch Switcher matching SGH Group exactly */}
      <SghBranchSwitcher currentBranchId="sanaa" />
    </>
  );
}
