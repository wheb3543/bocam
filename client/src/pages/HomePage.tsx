/**
 * HomePage - الصفحة الرئيسية
 * 
 * Main landing page with hospital information and platform overview
 * Optimized for mobile and desktop with enhanced visual design and responsive layout
 */
import { Heart, Stethoscope, Calendar, TrendingUp, ArrowLeft, Users, Clock, Award, Shield, Activity, Sparkles, ArrowUp, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import InstallPWAButton from "@/components/InstallPWAButton";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({ doctors: 0, specialties: 0, patients: 0 });
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const statsRef = useState({ doctors: 22, specialties: 15, patients: 1000 })[0];

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
      setParallaxOffset(scrollTop * 0.1);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!animationsEnabled) return;

    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;

      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedStats({
          doctors: Math.floor(statsRef.doctors * progress),
          specialties: Math.floor(statsRef.specialties * progress),
          patients: Math.floor(statsRef.patients * progress),
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedStats({
            doctors: statsRef.doctors,
            specialties: statsRef.specialties,
            patients: statsRef.patients,
          });
        }
      }, interval);

      return () => clearInterval(timer);
    };

    animateStats();
  }, [animationsEnabled, statsRef]);

  useEffect(() => {
    if (!animationsEnabled) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('[data-scroll-reveal]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, [animationsEnabled]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAnimations = () => {
    setAnimationsEnabled(!animationsEnabled);
  };

  const services = [
    {
      icon: Stethoscope,
      title: "حجز مواعيد الأطباء",
      description: "احجز موعدك مع أفضل الأطباء والاستشاريين في مختلف التخصصات",
      link: "/doctors",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      borderColor: "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600",
    },
    {
      icon: TrendingUp,
      title: "العروض الطبية",
      description: "استفد من عروضنا الطبية المميزة بأسعار تنافسية وخدمات متكاملة",
      link: "/offers",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600",
    },
    {
      icon: Heart,
      title: "المخيمات الطبية الخيرية",
      description: "خدمات طبية مجانية للمجتمع ضمن مسؤوليتنا الاجتماعية",
      link: "/camps",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      borderColor: "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600",
    },
  ];

  const stats = [
    { number: `${animatedStats.doctors}+`, label: "طبيب واستشاري", icon: Users, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/30" },
    { number: `${animatedStats.specialties}+`, label: "تخصص طبي", icon: Activity, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { number: `${animatedStats.patients}+`, label: "مريض سعيد", icon: Heart, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/30" },
    { number: "24/7", label: "خدمة متواصلة", icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
  ];

  const features = [
    { icon: Award, title: "معايير عالمية", description: "نقدم خدمات طبية متميزة بمعايير عالمية" },
    { icon: Shield, title: "رعاية شاملة", description: "رعاية صحية متكاملة لجميع المرضى" },
    { icon: Stethoscope, title: "أطباء متخصصون", description: "نخبة من الأطباء والاستشاريين المتخصصين" },
  ];

  return (
    <>
      <SEO 
        title="المستشفى السعودي الألماني - صنعاء | احجز موعدك الآن"
        description="احجز موعدك مع أفضل الأطباء في المستشفى السعودي الألماني بصنعاء. خدمات طبية متميزة، عروض خاصة، ومخيمات صحية مجانية. اتصل الآن: 8000018"
        image="/sgh-logo-full.png"
        keywords="المستشفى السعودي الألماني, صنعاء, حجز موعد, أطباء, عروض طبية, مخيمات صحية, استشارات طبية, 8000018"
      />
      <div className={`min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden ${!animationsEnabled ? 'animations-disabled' : ''}`} dir="rtl">
      
      {/* Skip Links */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
      >
        تخطى إلى المحتوى الرئيسي
      </a>
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-particle"
            style={{
              width: Math.random() * 8 + 4 + 'px',
              height: Math.random() * 8 + 4 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: i % 2 === 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)',
              animation: `particle ${Math.random() * 20 + 20}s linear infinite`,
              animationDelay: Math.random() * 5 + 's',
            }}
          />
        ))}
      </div>
      <Navbar />
      
      {/* Animation Toggle Button */}
      <button
        onClick={toggleAnimations}
        className="fixed top-20 left-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-gray-200 dark:border-gray-700"
        aria-label={animationsEnabled ? "إيقاف الحركات" : "تشغيل الحركات"}
      >
        {animationsEnabled ? <Pause className="w-5 h-5 text-green-600" /> : <Play className="w-5 h-5 text-green-600" />}
      </button>

      {/* Hero Section */}
      <section id="main-content" className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-green-600 via-green-700 to-blue-600 text-white overflow-hidden relative min-h-[700px]">
        {/* Animated Images Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating Medical Images */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-image"
              style={{
                left: `${15 + (i * 20)}%`,
                top: `${15 + (i * 15)}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${12 + i}s`,
              }}
            >
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                  {i % 3 === 0 && <Stethoscope className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/80" />}
                  {i % 3 === 1 && <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/80" />}
                  {i % 3 === 2 && <Activity className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/80" />}
                </div>
                <div className="absolute inset-0 bg-white/20 blur-xl animate-glow" />
              </div>
            </div>
          ))}
        </div>
        {/* Animated Heart Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Green Ribbon - from right */}
          <div className="absolute bottom-0 right-0 w-full h-full">
            <div className="absolute bottom-0 right-0 w-32 h-96 bg-gradient-to-l from-green-400 to-green-300 opacity-20 animate-ribbon-green"
                 style={{
                   animation: 'ribbonGreen 6s ease-in-out infinite',
                   clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                   borderRadius: '50%',
                   filter: 'blur(2px)',
                   boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)'
                 }}>
            </div>
          </div>
          {/* Blue Ribbon - from right */}
          <div className="absolute bottom-0 right-0 w-full h-full">
            <div className="absolute bottom-0 right-0 w-32 h-96 bg-gradient-to-l from-blue-400 to-blue-300 opacity-20 animate-ribbon-blue"
                 style={{
                   animation: 'ribbonBlue 6s ease-in-out infinite',
                   animationDelay: '0.5s',
                   clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                   borderRadius: '50%',
                   filter: 'blur(2px)',
                   boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
                 }}>
            </div>
          </div>
          {/* Heart Icon at Center Top */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-heart-pulse">
            <div className="relative">
              <Heart className="h-8 w-8 text-green-300 opacity-30" />
              <div className="absolute inset-0 bg-green-300 opacity-20 blur-xl animate-glow" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative inline-block mb-6 sm:mb-8 md:mb-10">
              <img
                src="/sgh-logo-full.png"
                alt={APP_TITLE}
                className="h-20 sm:h-24 md:h-32 lg:h-36 w-auto mx-auto animate-logo-float"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 blur-2xl animate-logo-glow" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-1 animate-text-shimmer bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent bg-[length:200%_auto]">
              {APP_TITLE}
            </h1>
            <p className="text-base sm:text-xl md:text-3xl mb-2 sm:mb-3 text-green-100 font-semibold">
              Saudi German Hospital
            </p>
            <p className="text-sm sm:text-lg md:text-2xl mb-6 sm:mb-8 md:mb-10 text-blue-100 font-medium">
              نرعاكم كأهالينا - Caring like family
            </p>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto px-2 text-white/95 bg-black/20 rounded-lg p-4">
              منصة الحجز الإلكترونية للمستشفى السعودي الألماني - صنعاء. احجز موعدك مع أفضل
              الأطباء والاستشاريين في مختلف التخصصات الطبية، استفد من العروض الطبية المميزة
              والخصومات الخاصة، وشارك في المخيمات الطبية الخيرية المجانية التي ننظمها
              بشكل دوري لخدمة المجتمع. نوفر لك تجربة حجز سهلة وسريعة من خلال منصتنا
              الإلكترونية المتكاملة.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-3 sm:px-0">
              <Link href="/doctors">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white dark:bg-card text-green-600 hover:bg-green-50 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-green-500/30 hover:scale-105 transition-all h-12 sm:h-14 px-6 sm:px-8"
                  aria-label="احجز موعدك الآن مع أفضل الأطباء"
                >
                  احجز موعدك الآن
                  <ArrowLeft className="mr-2 h-5 w-5 sm:h-6 sm:w-6 rotate-180" aria-hidden="true" />
                </Button>
              </Link>
              <a href="tel:8000018" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white/90 text-white hover:bg-white/20 text-base sm:text-lg font-medium backdrop-blur-sm h-12 sm:h-14 px-6 sm:px-8 hover:scale-105 transition-all"
                  aria-label="اتصل بالمستشفى على الرقم 8000018"
                >
                  اتصل بنا: 8000018
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-0"></div>

      {/* Stats Section - Enhanced */}
      <section id="stats-section" data-scroll-reveal className="py-12 sm:py-16 md:py-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm relative opacity-0 transform translate-y-8 transition-all duration-700 ease-out" style={{ opacity: visibleSections['stats-section'] ? 1 : 0, transform: visibleSections['stats-section'] ? 'translateY(0)' : 'translateY(32px)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 animate-card-appear cursor-pointer flex-1 min-w-[200px] sm:min-w-[250px]" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-4 sm:mb-5 animate-icon-bounce`}>
                  <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${stat.color}`} />
                </div>
                <div className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${stat.color} mb-2 sm:mb-3`}>
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground dark:text-foreground font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-0"></div>

      {/* Services Section - Enhanced */}
      <section id="services-section" data-scroll-reveal className="py-12 sm:py-16 md:py-24 bg-muted/50 dark:bg-gray-950 relative opacity-0 transform translate-y-8 transition-all duration-700 ease-out" style={{ opacity: visibleSections['services-section'] ? 1 : 0, transform: visibleSections['services-section'] ? 'translateY(0)' : 'translateY(32px)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 md:mb-18">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground dark:text-white mb-4 sm:mb-5 md:mb-7 animate-text-shimmer bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent bg-[length:200%_auto]">
              خدماتنا الإلكترونية
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed bg-gray-200/70 dark:bg-gray-800/70 rounded-lg p-4">
              نوفر لك منصة إلكترونية متكاملة لحجز المواعيد مع الأطباء والاستشاريين في مختلف التخصصات،
              الاستفادة من العروض الطبية المميزة والخصومات الخاصة، والمشاركة في المخيمات الطبية الخيرية
              المجانية التي ننظمها بشكل دوري لخدمة المجتمع. تجربة حجز سهلة وسريعة في متناول يدك.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {services.map((service, index) => (
              <Card
                key={index}
                className={`hover:shadow-2xl transition-all cursor-pointer border-2 ${service.borderColor} dark:bg-gray-800/50 group bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:scale-105 animate-card-appear`}
                style={{ animationDelay: `${0.4 + index * 0.15}s` }}
              >
                <CardHeader className="pb-4 sm:pb-5 md:pb-6 p-6 sm:p-7 md:p-8">
                  <div
                    className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl ${service.bgColor} flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform relative`}
                  >
                    <service.icon className={`h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 ${service.color}`} />
                    <Sparkles className={`absolute -top-1 -right-1 h-5 w-5 ${service.color} animate-sparkle`} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-foreground dark:text-white text-right">{service.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base md:text-lg text-right dark:text-muted-foreground leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 sm:px-7 sm:pb-7 md:px-8 md:pb-8">
                  <Link href={service.link}>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-base sm:text-lg md:text-xl font-semibold shadow-md hover:shadow-xl hover:shadow-green-500/30 h-11 sm:h-12 md:h-13 transition-all"
                      aria-label={`استكشف ${service.title}`}
                    >
                      استكشف الآن
                      <ArrowLeft className="mr-2 h-5 w-5 sm:h-6 sm:w-6 rotate-180" aria-hidden="true" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-0"></div>

      {/* About Section - Enhanced with features */}
      <section id="about-section" data-scroll-reveal className="py-12 sm:py-16 md:py-24 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm relative opacity-0 transform translate-y-8 transition-all duration-700 ease-out" style={{ opacity: visibleSections['about-section'] ? 1 : 0, transform: visibleSections['about-section'] ? 'translateY(0)' : 'translateY(32px)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground dark:text-white mb-6 sm:mb-8 md:mb-10 text-center animate-text-shimmer bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent bg-[length:200%_auto]">
              عن المستشفى السعودي الألماني
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground dark:text-muted-foreground text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 leading-relaxed px-2 bg-gray-200/70 dark:bg-gray-800/70 rounded-lg p-4">
              المستشفى السعودي الألماني - صنعاء هو أحد أبرز المؤسسات الصحية في اليمن، حيث نقدم خدمات طبية
              متميزة بمعايير عالمية. نحن ملتزمون بتوفير رعاية صحية شاملة ومتكاملة لجميع المرضى،
              مع نخبة من الأطباء والاستشاريين المتخصصين في مختلف التخصصات الطبية. نؤمن بأهمية
              المسؤولية المجتمعية، ولذلك نقيم بشكل دوري مخيمات طبية خيرية مجانية لخدمة المجتمع
              وتقديم الرعاية الصحية للمحتاجين.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-10 sm:mb-12 md:mb-16">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-row sm:flex-col items-center sm:items-center gap-5 sm:gap-5 p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700/50 text-center hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 animate-card-appear" style={{ animationDelay: `${0.8 + index * 0.15}s` }}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-xl sm:rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0 relative">
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-green-600 dark:text-green-400 animate-icon-bounce" />
                    <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-green-500 animate-sparkle" />
                  </div>
                  <div className="text-right sm:text-center">
                    <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground dark:text-white mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground dark:text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-base sm:text-lg md:text-xl text-muted-foreground dark:text-muted-foreground leading-relaxed space-y-4 sm:space-y-5 text-right max-w-3xl mx-auto px-2">
              <p>
                يضم المستشفى نخبة من الأطباء والاستشاريين المتخصصين في مختلف المجالات
                الطبية، مع توفير أحدث التقنيات والأجهزة الطبية لضمان أفضل النتائج العلاجية.
              </p>
              <p>
                نؤمن بأهمية المسؤولية المجتمعية، ولذلك نقيم بشكل دوري مخيمات طبية خيرية
                مجانية لخدمة المجتمع وتقديم الرعاية الصحية للمحتاجين.
              </p>
            </div>

            {/* Hospital Image */}
            <div className="mt-12 sm:mt-16 md:mt-20">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center relative overflow-hidden">
                  <img
                    src="/sgh-logo-full.png"
                    alt="صورة شعار المستشفى السعودي الألماني - صنعاء"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    style={{ transform: `scale(1.1) translateY(${parallaxOffset}px)` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-8 sm:pb-12">
                    <div className="text-center text-white">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">المستشفى السعودي الألماني - صنعاء</h3>
                      <p className="text-sm sm:text-base md:text-lg opacity-90">نقدم خدمات طبية متميزة بمعايير عالمية</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-0"></div>

      {/* CTA Section */}
      <section id="cta-section" data-scroll-reveal className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-green-600 via-green-700 to-blue-600 text-white overflow-hidden relative opacity-0 transform translate-y-8 transition-all duration-700 ease-out" style={{ opacity: visibleSections['cta-section'] ? 1 : 0, transform: visibleSections['cta-section'] ? 'translateY(0)' : 'translateY(32px)' }}>
        {/* Animated Heart Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Green Ribbon - from right */}
          <div className="absolute bottom-0 right-0 w-full h-full">
            <div className="absolute bottom-0 right-0 w-32 h-96 bg-gradient-to-l from-green-400 to-green-300 opacity-20 animate-ribbon-green"
                 style={{
                   animation: 'ribbonGreen 6s ease-in-out infinite',
                   clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                   borderRadius: '50%',
                   filter: 'blur(2px)',
                   boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)'
                 }}>
            </div>
          </div>
          {/* Blue Ribbon - from right */}
          <div className="absolute bottom-0 right-0 w-full h-full">
            <div className="absolute bottom-0 right-0 w-32 h-96 bg-gradient-to-l from-blue-400 to-blue-300 opacity-20 animate-ribbon-blue"
                 style={{
                   animation: 'ribbonBlue 6s ease-in-out infinite',
                   animationDelay: '0.5s',
                   clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                   borderRadius: '50%',
                   filter: 'blur(2px)',
                   boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
                 }}>
            </div>
          </div>
          {/* Heart Icon at Center Top */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-heart-pulse">
            <div className="relative">
              <Heart className="h-8 w-8 text-green-300 opacity-30" />
              <div className="absolute inset-0 bg-green-300 opacity-20 blur-xl animate-glow" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="container mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-7 leading-tight px-1 animate-text-shimmer bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent bg-[length:200%_auto]">
            جاهزون لخدمتك على مدار الساعة
          </h2>
          <p className="text-base sm:text-lg md:text-2xl lg:text-3xl mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto text-white/95 px-2 bg-black/20 rounded-lg p-4">
            فريقنا الطبي المتميز من الأطباء والاستشاريين في انتظارك. احجز موعدك الآن أو اتصل بنا
            على الرقم المجاني 8000018 للاستفسار والحصول على المعلومات الطبية التي تحتاجها.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-3 sm:px-0">
            <Link href="/doctors">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white dark:bg-card text-green-600 hover:bg-green-50 text-base sm:text-lg md:text-xl font-semibold shadow-xl hover:shadow-2xl hover:shadow-green-500/30 hover:scale-105 transition-all h-12 sm:h-14 px-8 sm:px-10"
                aria-label="احجز موعدك مع أفضل الأطباء"
              >
                احجز موعدك
                <Calendar className="mr-2 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </Button>
            </Link>
            <a href="tel:8000018" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-white/90 text-white hover:bg-white/20 text-base sm:text-lg md:text-xl font-medium backdrop-blur-sm h-12 sm:h-14 px-8 sm:px-10 hover:scale-105 transition-all"
                aria-label="اتصل بالمستشفى على الرقم 8000018"
              >
                اتصل: 8000018
              </Button>
            </a>
          </div>
        </div>
      </section>

      <InstallPWAButton />
      <Footer />
      
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-bounce"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>

    {/* CSS Animations */}
    <style>{`
      @keyframes particle {
        0% {
          transform: translateY(100vh) translateX(0) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 0.5;
        }
        90% {
          opacity: 0.5;
        }
        100% {
          transform: translateY(-100vh) translateX(50px) rotate(360deg);
          opacity: 0;
        }
      }

      @keyframes ribbonGreen {
        0% {
          transform: translateX(100%) translateY(100%) rotate(30deg);
          opacity: 0;
        }
        20% {
          opacity: 0.4;
        }
        40% {
          transform: translateX(50%) translateY(50%) rotate(15deg);
          opacity: 0.3;
        }
        60% {
          opacity: 0.4;
        }
        80% {
          transform: translateX(0%) translateY(-50%) rotate(-15deg);
          opacity: 0.3;
        }
        100% {
          transform: translateX(-100%) translateY(-200%) rotate(-30deg);
          opacity: 0;
        }
      }

      @keyframes ribbonBlue {
        0% {
          transform: translateX(100%) translateY(100%) rotate(-30deg);
          opacity: 0;
        }
        20% {
          opacity: 0.4;
        }
        40% {
          transform: translateX(50%) translateY(50%) rotate(-15deg);
          opacity: 0.3;
        }
        60% {
          opacity: 0.4;
        }
        80% {
          transform: translateX(0%) translateY(-50%) rotate(15deg);
          opacity: 0.3;
        }
        100% {
          transform: translateX(-100%) translateY(-200%) rotate(30deg);
          opacity: 0;
        }
      }

      @keyframes heartPulse {
        0%, 100% {
          transform: translateX(-50%) scale(1);
          opacity: 0.3;
        }
        25% {
          transform: translateX(-50%) scale(1.1);
          opacity: 0.4;
        }
        50% {
          transform: translateX(-50%) scale(1.2);
          opacity: 0.5;
        }
        75% {
          transform: translateX(-50%) scale(1.1);
          opacity: 0.4;
        }
      }

      @keyframes logoFloat {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-8px);
        }
      }

      @keyframes logoGlow {
        0%, 100% {
          opacity: 0;
        }
        50% {
          opacity: 0.25;
        }
      }

      @keyframes glow {
        0%, 100% {
          opacity: 0.15;
          transform: scale(1);
        }
        50% {
          opacity: 0.3;
          transform: scale(1.05);
        }
      }

      @keyframes textShimmer {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

      @keyframes cardAppear {
        0% {
          opacity: 0;
          transform: translateY(15px) scale(0.97);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes iconBounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-4px);
        }
      }

      @keyframes sparkle {
        0%, 100% {
          opacity: 0;
          transform: scale(0) rotate(0deg);
        }
        50% {
          opacity: 1;
          transform: scale(1) rotate(180deg);
        }
      }

      .animate-particle {
        animation: particle linear infinite;
        will-change: transform, opacity;
      }

      .animate-ribbon-green {
        animation: ribbonGreen 6s ease-in-out infinite;
        will-change: transform, opacity;
      }

      .animate-ribbon-blue {
        animation: ribbonBlue 6s ease-in-out infinite;
        will-change: transform, opacity;
      }

      .animate-heart-pulse {
        animation: heartPulse 2s ease-in-out infinite;
        will-change: transform, opacity;
      }

      .animate-logo-float {
        animation: logoFloat 3s ease-in-out infinite;
        will-change: transform;
      }

      .animate-logo-glow {
        animation: logoGlow 3s ease-in-out infinite;
        will-change: opacity;
      }

      .animate-glow {
        animation: glow 2s ease-in-out infinite;
        will-change: opacity, transform;
      }

      .animate-text-shimmer {
        animation: textShimmer 3s ease-in-out infinite;
        will-change: background-position;
      }

      .animate-card-appear {
        animation: cardAppear 0.6s ease-out;
        will-change: opacity, transform;
      }

      .animate-icon-bounce {
        animation: iconBounce 2s ease-in-out infinite;
        will-change: transform;
      }

      @keyframes floatImage {
        0%, 100% {
          transform: translateY(0) translateX(0) rotate(0deg);
          opacity: 0.7;
        }
        25% {
          transform: translateY(-15px) translateX(8px) rotate(3deg);
          opacity: 0.85;
        }
        50% {
          transform: translateY(-8px) translateX(-8px) rotate(-3deg);
          opacity: 0.75;
        }
        75% {
          transform: translateY(-20px) translateX(4px) rotate(2deg);
          opacity: 0.9;
        }
      }

      .animate-sparkle {
        animation: sparkle 2s ease-in-out infinite;
        will-change: opacity, transform;
      }

      .animate-float-image {
        animation: floatImage ease-in-out infinite;
        will-change: transform, opacity;
      }

      .animations-disabled * {
        animation: none !important;
        transition: none !important;
      }
    `}</style>
    </>
  );
}
