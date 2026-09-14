import { useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Activity,
  ArrowLeft,
  Bot,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Layers,
  LayoutDashboard,
  MessageCircle,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

  const coreModules = [
    {
      id: 'dashboard',
      title: 'لوحة التحكم الإدارية',
      description: 'إحصائيات آنية، متابعة أداء الفرق، ومؤشرات الأداء التشغيلي المباشر للعيادات.',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-indigo-600',
      badge: 'المركز الرئيسي',
      href: '/system/dashboard',
    },
    {
      id: 'whatsapp',
      title: 'منظومة واتساب السحابية',
      description:
        'تكامل مباشر مع Meta Cloud API لإرسال الحملات، الأتمتة، وإدارة المحادثات الذكية.',
      icon: MessageCircle,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Meta Cloud API',
      href: '/admin/whatsapp',
    },
    {
      id: 'bookings',
      title: 'إدارة الحجوزات والمرضى',
      description: 'جدولة مواعيد الأطباء، متابعة العملاء المحتملين، والعروض والمخيمات الطبية.',
      icon: Calendar,
      color: 'from-violet-500 to-purple-600',
      badge: 'العمليات السريرية',
      href: '/admin/bookings',
    },
    {
      id: 'reports',
      title: 'التقارير وذكاء الأعمال',
      description: 'تحليلات مالية، أداء الحملات التسويقية، ومؤشرات تحويل العملاء بدقة متقدمة.',
      icon: FileSpreadsheet,
      color: 'from-amber-500 to-orange-600',
      badge: 'BI & Analytics',
      href: '/admin/reports/reports',
    },
    {
      id: 'teams',
      title: 'إدارة الفرق والمهام',
      description: 'توزيع المهام التشغيلية، متابعة فريق التسويق، وخدمة العملاء على مدار الساعة.',
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      badge: 'التعاون التشغيلي',
      href: '/admin/bookings/tasks',
    },
    {
      id: 'governance',
      title: 'الأمان والحوكمة والامتثال',
      description: 'إدارة الصلاحيات الدقيقة للكوادر، تشفير البيانات، والامتثال لسياسات الخصوصية.',
      icon: ShieldCheck,
      color: 'from-rose-500 to-red-600',
      badge: 'أمان معتمد',
      href: '/admin/settings',
    },
  ];

  const systemHighlights = [
    {
      label: 'محرك تشغيل متكامل',
      value: 'BOCAM Core 3.0',
      icon: Server,
    },
    {
      label: 'التكامل السحابي المباشر',
      value: 'Meta Official API',
      icon: Radio,
    },
    {
      label: 'حماية وتشفير البيانات',
      value: 'Enterprise Grade',
      icon: ShieldCheck,
    },
    {
      label: 'معدل الجاهزية والتشغيل',
      value: '99.9% Uptime',
      icon: Zap,
    },
  ];

  return (
    <div
      className="relative min-h-full w-full overflow-hidden bg-linear-to-b from-background via-muted/20 to-muted/40 p-4 md:p-8 lg:p-10 space-y-10"
      dir="rtl"
    >
      {/* Hero Showcase Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-primary/10 via-primary/5 to-background p-6 md:p-12 shadow-lg">
        {/* Subtle background glowing orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-5 text-center lg:text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>المنصة الذكية الرائدة لإدارة الرعاية الطبية</span>
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary hover:bg-primary/20 text-[10px] px-2 py-0"
              >
                BOCAM v3.0
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                نظام{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-teal-500">
                  بوكام
                </span>{' '}
                المتكامل
              </h1>
              <p className="text-lg md:text-xl font-medium text-muted-foreground">
                {COMPANY_ARABIC_NAME || APP_TITLE} — منظومة شاملة للعمليات السريرية، المواعيد
                الذكية، وحملات التواصل المتقدمة.
              </p>
            </div>

            <p className="text-sm md:text-base text-muted-foreground/90 leading-relaxed">
              حل متقدم ومصمم خصيصاً للارتقاء بجودة الخدمات الطبية، أتمتة تدفقات المرضى، وربط كافة
              أقسام المركز الطبي في واجهة تشغيل موحدة وذكية.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => handleNavigate('/system/dashboard')}
                className="gap-2 text-base font-bold shadow-md hover:shadow-lg transition-all"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>الدخول إلى لوحة التحكم الإدارية</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => handleNavigate('/admin/whatsapp')}
                className="gap-2 text-base border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
              >
                <MessageCircle className="h-5 w-5" />
                <span>مركز واتساب السحابي</span>
              </Button>
            </div>
          </div>

          {/* Brand Showcase Card */}
          <div className="w-full lg:w-auto flex justify-center">
            <div className="relative rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-6 shadow-xl max-w-sm w-full space-y-5">
              <div className="flex items-center gap-4 border-b border-border/60 pb-4">
                <img
                  src={APP_LOGO}
                  alt="BOCAM Logo"
                  className="h-16 w-16 object-contain rounded-xl p-1 bg-muted/30 border border-border/40 shadow-xs"
                />
                <div>
                  <h3 className="font-bold text-lg text-foreground">نظام بوكام</h3>
                  <p className="text-xs text-muted-foreground font-mono">BOCAM HEALTH OS</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>النظام نشط ومتصل</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">حالة الترخيص</span>
                  <Badge
                    variant="outline"
                    className="border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  >
                    مفعل وموثق
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">خدمة Meta Cloud</span>
                  <span className="font-medium text-foreground">متصلة رسمياً</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">تشفير البيانات</span>
                  <span className="font-medium text-foreground">AES-256 Cloud</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">بوابة المريض PWA</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">متاحة</span>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleNavigate('/system/dashboard')}
              >
                فتح مركز القيادة اليومي
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {systemHighlights.map((highlight, index) => {
          const Icon = highlight.icon;
          return (
            <Card key={index} className="border-border/60 bg-card/60 backdrop-blur-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{highlight.label}</p>
                  <p className="text-sm md:text-base font-bold text-foreground truncate">
                    {highlight.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Core Pillars / Launchpad Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span>مراكز وأعمدة نظام بوكام</span>
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              الوصول المباشر إلى المنظومات التشغيلية والإدارية المتكاملة
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate('/system/dashboard')}
            className="self-start sm:self-auto gap-1 text-xs"
          >
            <span>لوحة التحكم الشاملة</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                onClick={() => handleNavigate(module.href)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`p-3 rounded-xl bg-linear-to-br ${module.color} text-white shadow-xs`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-xs font-normal border-border/80">
                    {module.badge}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  <h3 className="font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{module.title}</span>
                    <ArrowLeft className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary" />
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Brand Info */}
      <div className="border-t border-border/60 pt-6 pb-2 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">
          نظام بوكام (BOCAM) لإدارة العمليات والأنشطة الطبية السحابية
        </p>
        <p>
          جميع الحقوق محفوظة © {new Date().getFullYear()} — تم التطوير بأحدث تقنيات الويب السحابية
          المتكاملة
        </p>
      </div>
    </div>
  );
}
