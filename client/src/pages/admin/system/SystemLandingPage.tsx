import { useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Contact,
  LayoutDashboard,
  MessageCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { APP_LOGO, APP_TITLE, COMPANY_ARABIC_NAME } from '@/const';

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
    document.title = 'نظام بوكام | المنصة الموحدة';
  }, []);

  const quickLaunchItems = [
    {
      id: 'dashboard',
      title: 'لوحة التحكم',
      subtitle: 'المؤشرات والقيادة اليومية',
      href: '/system/dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200/60 dark:border-blue-800/40',
      hoverBorder: 'hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/30',
    },
    {
      id: 'whatsapp',
      title: 'منظومة واتساب',
      subtitle: 'المحادثات والأتمتة السحابية',
      href: '/admin/whatsapp',
      icon: MessageCircle,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg:
        'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/40',
      hoverBorder:
        'hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30',
    },
    {
      id: 'appointments',
      title: 'مواعيد الأطباء',
      subtitle: 'جدولة العيادات والحجوزات',
      href: '/admin/bookings/appointments',
      icon: Calendar,
      iconColor: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-50 dark:bg-violet-950/60 border-violet-200/60 dark:border-violet-800/40',
      hoverBorder: 'hover:border-violet-500/50 hover:bg-violet-50/40 dark:hover:bg-violet-950/30',
    },
    {
      id: 'customers',
      title: 'ملفات المرضى',
      subtitle: 'السجلات والبيانات الطبية',
      href: '/admin/bookings/customers',
      icon: Contact,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/40',
      hoverBorder: 'hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/30',
    },
    {
      id: 'reports',
      title: 'التقارير والتحليلات',
      subtitle: 'ذكاء الأعمال والإحصاءات',
      href: '/admin/reports/reports',
      icon: BarChart3,
      iconColor: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200/60 dark:border-teal-800/40',
      hoverBorder: 'hover:border-teal-500/50 hover:bg-teal-50/40 dark:hover:bg-teal-950/30',
    },
    {
      id: 'tasks',
      title: 'المهام التشغيلية',
      subtitle: 'متابعة وتوزيع أعمال الفرق',
      href: '/admin/bookings/tasks',
      icon: CheckSquare,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/60 dark:border-rose-800/40',
      hoverBorder: 'hover:border-rose-500/50 hover:bg-rose-50/40 dark:hover:bg-rose-950/30',
    },
  ];

  return (
    <div
      dir="rtl"
      className="relative flex h-full min-h-[calc(100vh-60px)] w-full items-center justify-center p-2 sm:p-4 select-none overflow-hidden"
    >
      {/* البطاقة المركزية الرئيسية بتصميم أنيق ومقتبس من معمارية SystemWelcomeCanvas */}
      <div className="relative flex w-full max-w-5xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-background to-muted/40 p-6 sm:p-8 lg:p-10 shadow-xl shadow-stone-900/[0.04] dark:shadow-none backdrop-blur-md max-h-full">
        {/* عناصر توهج جمالية هادئة في خلفية البطاقة */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/10"
        />

        <div className="relative z-10 mx-auto w-full text-center flex flex-col items-center justify-center h-full">
          {/* شارة وهوية النظام */}
          <div className="mx-auto mb-3 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border border-border/90 bg-card/95 p-3 shadow-xl shadow-stone-900/[0.06] backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <img
              src={APP_LOGO}
              alt="شعار نظام بوكام"
              className="h-full w-full object-contain drop-shadow-xs"
            />
          </div>

          {/* العنوان الترحيبي الرئيسي */}
          <h1 className="mt-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground drop-shadow-sm flex flex-col items-center justify-center leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-blue-600 to-teal-600 dark:from-primary dark:to-teal-400 mb-1">
              بوكام BOCAM
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mt-1">
              للمستشفيات
            </span>
          </h1>

          {/* النص الوصفي الهادئ */}
          <div className="mt-4 text-xs sm:text-sm md:text-base leading-relaxed font-semibold text-muted-foreground max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>نظام سحابي</span>
            </span>
            <p className="mt-2 text-balance leading-relaxed">
              النظام هو احد انظمه بوكام المتخصص في اداره القنوات الرقميه لشركات و المؤسسات في مختلف
              القطاعات وكذالك اداره العمليات الداخليه واداره الاقسام والموضفين عبر نضام اداره المهام
              واداره علاقات العملاء واداره التسويق واداره منصات التواصل الاجتماعي و الموقع
              الالكتروني وكذالك يحتوي على موقع الكتروني.
            </p>
          </div>

          {/* لوحة الوصول السريع (Quick Launchpad Grid) */}
          <div className="mt-6 w-full max-w-4xl rounded-2xl border border-border/80 bg-card/70 p-3 sm:p-4 shadow-xs backdrop-blur-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickLaunchItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.href)}
                    className={`group flex items-center gap-3 rounded-xl border border-border/70 bg-background/80 p-2.5 sm:p-3 text-right transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${item.hoverBorder}`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.iconBg} ${item.iconColor} shadow-2xs group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] sm:text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* مؤشرات الحالة الفنية والاستقرار */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              النظام جاهز ومستقر
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60 shadow-2xs">
              <Zap className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              استجابة لحظية فائقة
            </span>
            <span className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/60 shadow-2xs">
              <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              تشفير وأمان معتمد
            </span>
          </div>

          <div className="mt-6 text-[10px] sm:text-xs font-semibold text-muted-foreground/60 tracking-wide">
            صنع بواسطة: آيديا للاستشارات والحلول التسويقية والرقمية
          </div>
        </div>
      </div>
    </div>
  );
}
