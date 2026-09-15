import { useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  Cloud,
  Contact,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowLeft,
  Activity,
} from 'lucide-react';
import { APP_LOGO } from '@/const';

interface SystemLandingPageProps {
  onOpenTab?: (href: string) => void;
  [key: string]: unknown;
}

export default function SystemLandingPage({ onOpenTab }: SystemLandingPageProps = {}) {
  const [, setLocation] = useLocation();

  const handleNavigate = (href: string) => {
    if (onOpenTab) {
      onOpenTab(href);
    } else {
      setLocation(href);
    }
  };

  useEffect(() => {
    document.title = 'بوكام BOCAM للمستشفيات | المنظومة السحابية الموحدة';
  }, []);

  // المنظومات الخمس الأساسية لبوكام [B - O - C - A - M]
  const bocamSubsystems = [
    {
      code: 'B',
      title: 'الحجوزات والجدولة',
      englishTitle: 'Booking & Smart Scheduling',
      description:
        'جدولة العيادات، مواعيد الأطباء، والمخيمات الميدانية مع التحكم بالطاقة الاستيعابية.',
      href: '/admin/bookings/appointments',
      icon: Calendar,
      accentColor: 'from-blue-600 to-cyan-500',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      cardHover: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
    },
    {
      code: 'O',
      title: 'صندوق الوارد الموحد',
      englishTitle: 'Omni-channel Inbox',
      description:
        'منظومة مركزية للمحادثات، وتكامل واتساب، فيسبوك، إنستغرام، وتيليجرام مع الأتمتة السحابية.',
      href: '/admin/whatsapp',
      icon: MessageCircle,
      accentColor: 'from-emerald-600 to-teal-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      cardHover: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    },
    {
      code: 'C',
      title: 'علاقات المرضى والبوابة',
      englishTitle: 'CRM & Patient Portal',
      description: 'إدارة السجلات الطبية (EMR)، نتائج الفحوصات والتقارير، وملفات المرضى الرقمية.',
      href: '/admin/bookings/customers',
      icon: Contact,
      accentColor: 'from-violet-600 to-purple-500',
      badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      cardHover: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
    },
    {
      code: 'A',
      title: 'إدارة المحتوى والموقع',
      englishTitle: 'Automated CMS',
      description:
        'البوابة التعريفية للمنشأة، المدونة الطبية التثقيفية، ونشر المحتوى والتحديثات المؤسسية.',
      href: '/admin/content/publishing',
      icon: Globe,
      accentColor: 'from-amber-600 to-orange-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      cardHover: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
    },
    {
      code: 'M',
      title: 'المهام والتواصل الاجتماعي',
      englishTitle: 'Media Social & Tasks',
      description:
        'محور السوشيال ميديا، إدارة وتوزيع المهام الإدارية بين الأقسام، وتقييم أداء الكوادر.',
      href: '/admin/bookings/tasks',
      icon: CheckSquare,
      accentColor: 'from-rose-600 to-pink-500',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      cardHover: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
    },
  ];

  return (
    <div
      dir="rtl"
      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-3 sm:p-5 lg:p-6 select-none bg-gradient-to-b from-background via-background/95 to-muted/30"
    >
      {/* خلفية جمالية وإضاءات ناعمة (Ambient Glowing Orbs) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-primary/15 blur-[100px] dark:bg-primary/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-[100px] dark:bg-emerald-500/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[90px]"
      />

      {/* المحتوى الرئيسي المركزي */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between gap-4 lg:gap-6 min-h-0">
        {/* الترويسة الرئيسية والهوية المؤسسية */}
        <div className="flex flex-col items-center text-center">
          {/* الوسم العلوي والشعار */}
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-border/80 bg-card/90 p-2.5 shadow-md shadow-primary/5 backdrop-blur-md transition-transform duration-300 hover:scale-105">
              <img
                src={APP_LOGO}
                alt="شعار بوكام"
                className="h-full w-full object-contain drop-shadow-xs"
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-xs">
              <Cloud className="h-3.5 w-3.5 text-primary" />
              <span>نظام سحابي متكامل • Cloud Healthcare Platform</span>
            </div>
          </div>

          {/* اسم النظام الضخم جداً */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-foreground">
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-blue-600 to-teal-500 dark:from-primary dark:via-blue-400 dark:to-teal-300">
              بوكام BOCAM
            </span>{' '}
            <span className="text-foreground inline-block mt-1 sm:mt-0 font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              للمستشفيات
            </span>
          </h1>

          {/* النص الوصفي المتكامل والمضبوط لغوياً */}
          <p className="mt-2.5 sm:mt-3 max-w-4xl text-xs sm:text-sm md:text-base font-medium text-muted-foreground leading-relaxed">
            المنظومة السحابية المتخصصة في إدارة القنوات الرقمية والعمليات السريرية للمنشآت الصحية؛
            تشمل إدارة العمليات الداخلية والأقسام والكوادر عبر نظام المهام وتقييم الأداء، إدارة
            علاقات المرضى والعملاء (CRM & EMR)، الحملات التسويقية، منصات التواصل الاجتماعي، وبوابة
            الموقع الإلكتروني التفاعلي.
          </p>

          {/* زر الانتقال المباشر للوحة التحكم التنفيذية */}
          <div className="mt-3 sm:mt-4">
            <button
              type="button"
              onClick={() => handleNavigate('/system/dashboard')}
              className="group inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-gradient-to-r from-primary to-emerald-600 px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4 transition-transform group-hover:rotate-12" />
              <span>دخول لوحة المؤشرات والقيادة التنفيذية</span>
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>

        {/* عرض المراكز الخمسة الأساسية لبوكام [B • O • C • A • M] */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>المراكز التشغيلية الخمسة الموحدة [B • O • C • A • M]</span>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground/70 hidden sm:inline-block">
              اضغط على أي مركز للانتقال السريع
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {bocamSubsystems.map((subsystem) => {
              const Icon = subsystem.icon;
              return (
                <button
                  key={subsystem.code}
                  type="button"
                  onClick={() => handleNavigate(subsystem.href)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/75 p-3.5 sm:p-4 text-right backdrop-blur-md transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 cursor-pointer ${subsystem.cardHover}`}
                >
                  {/* خط لوني علوي مميز */}
                  <div
                    className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${subsystem.accentColor} opacity-70 group-hover:opacity-100 transition-opacity`}
                  />

                  <div>
                    {/* الرأس: الرمز الدلالي والأيقونة */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-black font-mono shadow-2xs ${subsystem.badgeBg}`}
                      >
                        {subsystem.code}
                      </span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* عنوان المركز */}
                    <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {subsystem.title}
                    </h3>
                    <p className="text-[10px] font-semibold text-muted-foreground/60 tracking-wider uppercase mt-0.5">
                      {subsystem.englishTitle}
                    </p>

                    {/* الوصف المختصر */}
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                      {subsystem.description}
                    </p>
                  </div>

                  {/* تذييل البطاقة */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-[11px] font-bold text-primary opacity-80 group-hover:opacity-100">
                    <span>فتح المركز</span>
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* مؤشرات البنية السحابية والتذييل المؤسسي */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-border/50 text-[11px] font-semibold text-muted-foreground">
          {/* مؤشرات الحالة الفنية المباشرة */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" />
              <span>نظام سحابي مستقر 99.9%</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <ShieldCheck className="h-3 w-3" />
              <span>تشفير سريري وأمان معتمد</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Radio className="h-3 w-3" />
              <span>Meta Cloud API نشط</span>
            </span>
          </div>

          {/* التوقيع الرسمي للجهة المطورة */}
          <div className="flex items-center gap-1.5 text-center sm:text-left text-xs font-bold text-foreground/80">
            <span>صنع وتطوير بواسطة:</span>
            <span className="text-primary font-black">
              آيديا للاستشارات والحلول التسويقية والرقمية
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
