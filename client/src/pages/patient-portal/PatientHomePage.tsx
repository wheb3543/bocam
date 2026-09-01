import { Link } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Calendar,
  FileText,
  Gift,
  Phone,
  Plus,
  ArrowLeft,
  Clock3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import AnimatedCard from '@/components/AnimatedCard';

export default function PatientHomePage() {
  const { formatDate } = useFormatDate();
  const { data: patient } = trpc.patientPortal.me.useQuery();
  const { data: appointments, isLoading: appointmentsLoading } =
    trpc.patientPortal.myAppointments.useQuery();
  const { data: results, isLoading: resultsLoading } = trpc.patientPortal.myResults.useQuery();
  const { data: offers, isLoading: offersLoading } = trpc.patientPortal.myOfferBookings.useQuery();

  const latestAppointment = appointments?.[0];
  const latestResult = results?.[0];
  const latestOffer = offers?.[0];

  return (
    <div className="space-y-6 pb-8">
      <AnimatedCard
        className="overflow-hidden rounded-[30px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 shadow-[0_18px_40px_rgba(16,185,129,0.10)] dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10"
        delay={0}
      >
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                أهلاً بك
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-foreground sm:text-[2rem]">
                {patient?.fullName || 'مستخدم بوابة المريض'}
              </h2>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 p-3 text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            تابع مواعيدك، نتائجك، وعروضك من مكان واحد في تجربة مريحة وآمنة.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-3 shadow-sm dark:border-emerald-900/30 dark:bg-background/40">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">المواعيد</span>
              </div>
              <p className="mt-2 text-xl font-extrabold text-foreground">
                {appointments?.length ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white/90 p-3 shadow-sm dark:border-amber-900/30 dark:bg-background/40">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">النتائج</span>
              </div>
              <p className="mt-2 text-xl font-extrabold text-foreground">{results?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white/90 p-3 shadow-sm dark:border-sky-900/30 dark:bg-background/40">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                <Gift className="h-4 w-4" />
                <span className="text-xs font-medium">العروض</span>
              </div>
              <p className="mt-2 text-xl font-extrabold text-foreground">{offers?.length ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
              اليوم
            </p>
            <p className="mt-1 text-base font-bold text-foreground">ملفك الطبي في متناول يدك</p>
          </div>
          <div className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-emerald-700 shadow-sm dark:bg-background/40 dark:text-emerald-300">
            قائمة متابعة
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-bold text-foreground">معلوماتك السريعة</p>
        <div className="grid grid-cols-1 gap-3">
          <AnimatedCard
            className="rounded-2xl border border-border/80 bg-card/90 shadow-sm"
            delay={0.1}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-emerald-600" />
                آخر موعد
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {appointmentsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  جاري التحميل
                </div>
              ) : latestAppointment ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {latestAppointment.fullName || 'موعد طبي'}
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>
                      {formatDate(latestAppointment.appointmentDate || latestAppointment.createdAt)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد مواعيد حالياً</p>
              )}
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            className="rounded-2xl border border-border/80 bg-card/90 shadow-sm"
            delay={0.2}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-amber-600" />
                أحدث نتيجة
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {resultsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  جاري التحميل
                </div>
              ) : latestResult ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{latestResult.title}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>{formatDate(latestResult.resultDate || latestResult.createdAt)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد نتائج جديدة</p>
              )}
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            className="rounded-2xl border border-border/80 bg-card/90 shadow-sm"
            delay={0.3}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4 text-sky-600" />
                عرض قادم
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {offersLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                  جاري التحميل
                </div>
              ) : latestOffer ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{latestOffer.fullName || 'حجز عرض'}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>{formatDate(latestOffer.createdAt)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد عروض محجوزة</p>
              )}
            </CardContent>
          </AnimatedCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href="/doctors">
          <Button className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-green-700">
            <Plus className="ml-1 h-4 w-4" />
            حجز موعد
          </Button>
        </Link>
        <Link href="/patient-portal/results">
          <Button
            variant="outline"
            className="h-12 w-full rounded-2xl border-emerald-200 bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-50 dark:bg-background dark:text-emerald-300"
          >
            <FileText className="ml-1 h-4 w-4" />
            نتائجي
          </Button>
        </Link>
        <Link href="/patient-portal/profile">
          <Button
            variant="outline"
            className="h-12 w-full rounded-2xl border-sky-200 bg-white text-sky-700 shadow-sm transition hover:bg-sky-50 dark:bg-background dark:text-sky-300"
          >
            <Phone className="ml-1 h-4 w-4" />
            تواصل معنا
          </Button>
        </Link>
      </div>

      <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4 shadow-sm dark:border-emerald-900/30 dark:from-emerald-950/15 dark:to-green-950/10">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-sm font-bold">استمرار آمن</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          جميع بياناتك محمية داخل بوابتك الشخصية، ويمكنك متابعة رحلتك العلاجية بسهولة.
        </p>
      </div>

      <Link href="/patient-portal/appointments">
        <Button
          variant="ghost"
          className="w-full justify-center rounded-2xl border border-transparent bg-transparent px-4 py-3 text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/20"
        >
          عرض كل المواعيد
          <ArrowLeft className="mr-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
