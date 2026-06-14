import { ReactNode, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/lib/api/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Home, Calendar, Gift, FileText, User, Plus } from "lucide-react";

type PatientPortalLayoutProps = {
  children: ReactNode;
};

const NAV_ITEMS = [
  { key: "home", href: "/patient-portal/home", label: "الرئيسية", icon: Home },
  { key: "appointments", href: "/patient-portal/appointments", label: "المواعيد", icon: Calendar },
  { key: "offers", href: "/patient-portal/offers", label: "العروض", icon: Gift },
  { key: "results", href: "/patient-portal/results", label: "النتائج", icon: FileText },
  { key: "profile", href: "/patient-portal/profile", label: "حسابي", icon: User },
] as const;

function resolveActiveKey(pathname: string): string {
  if (pathname.startsWith("/patient-portal/appointments")) return "appointments";
  if (pathname.startsWith("/patient-portal/offers") || pathname.startsWith("/patient-portal/camps")) return "offers";
  if (pathname.startsWith("/patient-portal/results")) return "results";
  if (pathname.startsWith("/patient-portal/profile")) return "profile";
  return "home";
}

function resolveTitle(pathname: string): string {
  if (pathname.startsWith("/patient-portal/appointments/")) return "تفاصيل الموعد";
  if (pathname.startsWith("/patient-portal/appointments")) return "المواعيد";
  if (pathname.startsWith("/patient-portal/offers")) return "العروض";
  if (pathname.startsWith("/patient-portal/camps")) return "المخيمات";
  if (pathname.startsWith("/patient-portal/results/")) return "تفاصيل النتيجة";
  if (pathname.startsWith("/patient-portal/results")) return "النتائج الطبية";
  if (pathname.startsWith("/patient-portal/profile")) return "حسابي";
  return "بوابة المريض";
}

function resolveBackHref(pathname: string): string | null {
  if (pathname.startsWith("/patient-portal/appointments/")) return "/patient-portal/appointments";
  if (pathname.startsWith("/patient-portal/results/")) return "/patient-portal/results";
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
  const shouldShowFab = activeKey === "home" || activeKey === "appointments";

  useEffect(() => {
    if (!isLoading && !patient) {
      navigate("/patient-portal/login");
    }
  }, [isLoading, patient, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 via-white to-green-50/20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!patient) return null;

  const currentOrder = PAGE_ORDER[activeKey] ?? PAGE_ORDER.home;
  const slideFrom = currentOrder >= previousOrder.current ? 28 : -28;
  previousOrder.current = currentOrder;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/70 via-white to-green-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" dir="rtl">
      <header className="fixed top-0 left-0 right-0 z-40 border-b bg-white/95 dark:bg-gray-900/90 backdrop-blur safe-top">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {backHref ? (
              <Link href={backHref}>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{pageTitle}</p>
              <p className="text-[11px] text-muted-foreground truncate">مرحباً {patient.fullName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-24 px-3 sm:px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, x: slideFrom }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideFrom }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {shouldShowFab && (
        <Link href="/doctors">
          <Button
            className="fixed bottom-20 left-4 z-40 h-12 w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700 safe-bottom"
            size="icon"
            aria-label="حجز موعد جديد"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 dark:bg-gray-900/95 backdrop-blur safe-bottom">
        <div className="grid grid-cols-5 h-16 max-w-4xl mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;
            return (
              <Link key={item.key} href={item.href}>
                <button
                  className={`h-full w-full flex flex-col items-center justify-center gap-1 transition-colors ${
                    isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "scale-110" : ""}`} />
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
