import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { trpc } from '@/lib/api/trpc';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Home, Calendar, Gift, FileText, User, Plus } from 'lucide-react';
import PrivacyPolicyUpdateAlert from './PrivacyPolicyUpdateAlert';

type PatientPortalLayoutProps = {
  children: ReactNode;
};

const NAV_ITEMS = [
  { key: 'home', href: '/patient-portal/home', label: 'الرئيسية', icon: Home },
  { key: 'appointments', href: '/patient-portal/appointments', label: 'المواعيد', icon: Calendar },
  { key: 'offers', href: '/patient-portal/offers', label: 'العروض', icon: Gift },
  { key: 'results', href: '/patient-portal/results', label: 'النتائج', icon: FileText },
  { key: 'profile', href: '/patient-portal/profile', label: 'حسابي', icon: User },
] as const;

function resolveActiveKey(pathname: string): string {
  if (pathname.startsWith('/patient-portal/appointments')) {
    return 'appointments';
  }
  if (
    pathname.startsWith('/patient-portal/offers') ||
    pathname.startsWith('/patient-portal/camps')
  ) {
    return 'offers';
  }
  if (pathname.startsWith('/patient-portal/results')) {
    return 'results';
  }
  if (pathname.startsWith('/patient-portal/profile')) {
    return 'profile';
  }
  return 'home';
}

function resolveTitle(pathname: string): string {
  if (pathname.startsWith('/patient-portal/appointments/')) {
    return 'تفاصيل الموعد';
  }
  if (pathname.startsWith('/patient-portal/appointments')) {
    return 'المواعيد';
  }
  if (pathname.startsWith('/patient-portal/offers')) {
    return 'العروض';
  }
  if (pathname.startsWith('/patient-portal/camps')) {
    return 'المخيمات';
  }
  if (pathname.startsWith('/patient-portal/results/')) {
    return 'تفاصيل النتيجة';
  }
  if (pathname.startsWith('/patient-portal/results')) {
    return 'النتائج الطبية';
  }
  if (pathname.startsWith('/patient-portal/profile')) {
    return 'حسابي';
  }
  return 'بوابة المريض';
}

function resolveBackHref(pathname: string): string | null {
  if (pathname.startsWith('/patient-portal/appointments/')) {
    return '/patient-portal/appointments';
  }
  if (pathname.startsWith('/patient-portal/results/')) {
    return '/patient-portal/results';
  }
  return null;
}

const PAGE_ORDER: Record<string, number> = {
  home: 0,
  appointments: 1,
  offers: 2,
  results: 3,
  profile: 4,
};

export default function PatientPortalLayout({ children }: PatientPortalLayoutProps) {
  const [location, navigate] = useLocation();
  const { data: patient, isLoading } = trpc.patientPortal.me.useQuery();
  const previousOrder = useRef<number>(PAGE_ORDER.home);

  const activeKey = useMemo(() => resolveActiveKey(location), [location]);
  const pageTitle = useMemo(() => resolveTitle(location), [location]);
  const backHref = useMemo(() => resolveBackHref(location), [location]);
  const shouldShowFab = activeKey === 'home' || activeKey === 'appointments';

  useEffect(() => {
    if (!isLoading && !patient) {
      navigate('/patient-portal/login');
    }
  }, [isLoading, patient, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 via-white to-green-50/20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const currentOrder = PAGE_ORDER[activeKey] ?? PAGE_ORDER.home;
  const slideFrom = currentOrder >= previousOrder.current ? 28 : -28;
  previousOrder.current = currentOrder;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-green-50/70 via-white to-green-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
      dir="rtl"
    >
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100] focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
      >
        تخطى إلى المحتوى الرئيسي
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-green-100 bg-white/90 dark:border-gray-800 dark:bg-gray-900/90 backdrop-blur-xl safe-top">
        <div className="mx-auto max-w-5xl px-3 sm:px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {backHref ? (
                <Link href={backHref}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 shadow-sm dark:from-green-900/40 dark:to-emerald-900/20 dark:text-green-300">
                  <Home className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{pageTitle}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  مرحباً {patient.fullName}
                </p>
              </div>
            </div>
            <div className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              بوابة المريض
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="px-3 pb-24 pt-20 sm:px-4 sm:pt-20" role="main">
        <div className="mx-auto max-w-5xl">
          <div className="pt-1">
            <PrivacyPolicyUpdateAlert />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, x: slideFrom }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -slideFrom }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mx-auto max-w-5xl"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {shouldShowFab && (
        <Link href="/doctors">
          <Button
            className="fixed bottom-24 left-4 z-40 h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/30 hover:from-green-700 hover:to-emerald-700 safe-bottom"
            size="icon"
            aria-label="حجز موعد جديد"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      )}

      {/* Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-green-100 bg-white/95 dark:border-gray-800 dark:bg-gray-900/95 backdrop-blur-xl safe-bottom"
        role="navigation"
        aria-label="التنقل في بوابة المريض"
      >
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-5 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;
            return (
              <Link key={item.key} href={item.href}>
                <button
                  className={`flex h-full w-full flex-col items-center justify-center gap-1 rounded-t-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] leading-none">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
