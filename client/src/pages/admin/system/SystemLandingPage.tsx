/**
 * SystemLandingPage — شاشة النظام الرئيسية
 *
 * الشاشة الثابتة التي تظهر فور تسجيل الدخول وعند إغلاق كل التبويبات.
 * تستخدم نظام ألوان وتنسيق المشروع بالكامل (primary, secondary, muted, card …).
 */
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
  ArrowLeft,
  Activity,
  Zap,
} from 'lucide-react';
import { APP_LOGO } from '@/const';
import { COMPANY_ARABIC_NAME } from '@/config';

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
    document.title = `${COMPANY_ARABIC_NAME} | المنظومة السحابية الموحدة`;
  }, []);

  /** المنظومات الخمس الأساسية لبوكام [B · O · C · A · M] */
  const bocamModules = [
    {
      code: 'B',
      title: 'الحجوزات والجدولة',
      titleEn: 'Booking & Smart Scheduling',
      desc: 'جدولة العيادات ومواعيد الأطباء والمخيمات الميدانية مع التحكم الكامل بالطاقة الاستيعابية.',
      href: '/admin/bookings/appointments',
      Icon: Calendar,
      gradient: 'from-blue-500 to-cyan-400',
      ring: 'ring-blue-400/30',
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      glow: 'group-hover:shadow-blue-500/15',
    },
    {
      code: 'O',
      title: 'صندوق الوارد الموحد',
      titleEn: 'Omni-channel Inbox',
      desc: 'رسائل مركزية تجمع واتساب وفيسبوك وإنستغرام وتيليجرام والرسائل القصيرة مع الأتمتة السحابية.',
      href: '/admin/whatsapp',
      Icon: MessageCircle,
      gradient: 'from-emerald-500 to-teal-400',
      ring: 'ring-emerald-400/30',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-emerald-500/15',
    },
    {
      code: 'C',
      title: 'علاقات المرضى والبوابة',
      titleEn: 'CRM & Patient Portal',
      desc: 'سجلات طبية إلكترونية (EMR)، نتائج فحوصات وتقارير الأشعة، وملفات المرضى الرقمية.',
      href: '/admin/bookings/customers',
      Icon: Contact,
      gradient: 'from-violet-500 to-purple-400',
      ring: 'ring-violet-400/30',
      badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      glow: 'group-hover:shadow-violet-500/15',
    },
    {
      code: 'A',
      title: 'إدارة المحتوى والموقع',
      titleEn: 'Automated CMS',
      desc: 'البوابة التعريفية للمنشأة، المدونة الطبية التثقيفية، ونشر المحتوى والتحديثات المؤسسية.',
      href: '/admin/content/publishing',
      Icon: Globe,
      gradient: 'from-amber-500 to-orange-400',
      ring: 'ring-amber-400/30',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-amber-500/15',
    },
    {
      code: 'M',
      title: 'المهام والتواصل الاجتماعي',
      titleEn: 'Media Social & Tasks',
      desc: 'محور السوشيال ميديا، توزيع المهام الإدارية بين الأقسام، وتقييم أداء الكوادر الوظيفية.',
      href: '/admin/bookings/tasks',
      Icon: CheckSquare,
      gradient: 'from-rose-500 to-pink-400',
      ring: 'ring-rose-400/30',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      glow: 'group-hover:shadow-rose-500/15',
    },
  ];

  return (
    <div
      dir="rtl"
      className="relative flex h-full w-full flex-col overflow-hidden bg-background select-none"
    >
      {/* ─── خلفية إضاءة ناعمة ─── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-1/3 h-80 w-80 rounded-full bg-primary/8 blur-[90px]" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-secondary/8 blur-[90px]" />
        <div className="absolute top-1/2 right-0 h-56 w-56 rounded-full bg-primary/5 blur-[70px]" />
      </div>

      {/* ─── المحتوى الرئيسي ─── */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* ── الترويسة ── */}
        <header className="flex flex-col items-center gap-4 text-center">
          {/* شعار + وسم السحابة */}
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-card p-2.5 shadow-sm">
              <img src={APP_LOGO} alt="شعار بوكام" className="h-full w-full object-contain" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold text-primary">
              <Cloud className="h-3.5 w-3.5" />
              نظام سحابي متكامل · Cloud Platform
            </span>
          </div>

          {/* اسم النظام */}
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
                بوكام
              </span>
              <span className="mx-2 text-foreground">BOCAM</span>
            </h1>
            <p className="text-2xl font-bold text-muted-foreground sm:text-3xl">
              للمستشفيات والمنشآت الصحية
            </p>
          </div>

          {/* وصف مختصر */}
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            المنظومة السحابية المتخصصة في إدارة القنوات الرقمية والعمليات السريرية للمنشآت الصحية؛
            تشمل إدارة علاقات المرضى (CRM/EMR)، الحملات التسويقية، منصات التواصل الاجتماعي، الجدولة
            الذكية، وبوابة الموقع التفاعلي.
          </p>

          {/* زر الدخول */}
          <button
            type="button"
            onClick={() => handleNavigate('/system/dashboard')}
            className="group mt-1 inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.03] active:scale-95"
          >
            <LayoutDashboard className="h-4 w-4 transition-transform group-hover:rotate-12" />
            دخول لوحة المؤشرات التنفيذية
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </header>

        {/* ── بطاقات المنظومات الخمس ── */}
        <section className="w-full">
          {/* عنوان القسم */}
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              المراكز التشغيلية الخمسة الموحدة · B · O · C · A · M
            </div>
            <span className="hidden text-[11px] text-muted-foreground/60 sm:block">
              اضغط على أي مركز للانتقال السريع
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {bocamModules.map(
              ({ code, title, titleEn, desc, href, Icon, gradient, ring, badge, glow }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleNavigate(href)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 text-right shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${glow} hover:border-border/80`}
                >
                  {/* شريط لوني علوي */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} opacity-80 transition-opacity group-hover:opacity-100`}
                  />

                  <div className="space-y-2.5">
                    {/* رأس البطاقة: رمز الحرف + أيقونة */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-black font-mono shadow-xs ${badge}`}
                      >
                        {code}
                      </span>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                    </div>

                    {/* عنوان + وصف */}
                    <div>
                      <h3 className="text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                        {title}
                      </h3>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                        {titleEn}
                      </p>
                      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* تذييل البطاقة */}
                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] font-bold text-primary opacity-70 transition-opacity group-hover:opacity-100">
                    <span>فتح المركز</span>
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                  </div>
                </button>
              )
            )}
          </div>
        </section>

        {/* ── التذييل: مؤشرات الحالة + التوقيع ── */}
        <footer className="flex flex-col gap-2.5 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
          {/* مؤشرات الحالة */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              نظام سحابي مستقر 99.9%
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/8 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-3 w-3" />
              تشفير سريري وأمان معتمد
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/8 px-2.5 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              <Radio className="h-3 w-3" />
              Meta Cloud API نشط
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Zap className="h-3 w-3" />
              استجابة فورية &lt; 100ms
            </span>
          </div>

          {/* التوقيع */}
          <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span>صنع وتطوير بواسطة:</span>
            <span className="font-black text-foreground">
              آيديا للاستشارات والحلول التسويقية والرقمية
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
