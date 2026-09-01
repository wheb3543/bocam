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
    <div className="space-y-5 pb-8">
      <AnimatedCard
        className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10"
        delay={0}
      >
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                أهلاً بك
              </p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">
                {patient?.fullName || 'مستخدم بوابة المريض'}
              </h2>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            تابع مواعيدك، نتائجك، وعروضك من مكان واحد في تجربة مريحة وآمنة.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-white/80 p-3 dark:border-emerald-900/30 dark:bg-background/40">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">المواعيد</span>
              </div>
              <p className="mt-2 text-lg font-bold">{appointments?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white/80 p-3 dark:border-amber-900/30 dark:bg-background/40">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">النتائج</span>
              </div>
              <p className="mt-2 text-lg font-bold">{results?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white/80 p-3 dark:border-sky-900/30 dark:bg-background/40">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                <Gift className="h-4 w-4" />
                <span className="text-xs font-medium">العروض</span>
              </div>
              <p className="mt-2 text-lg font-bold">{offers?.length ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">معلوماتك السريعة</p>
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
          <Button className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-sm hover:from-emerald-700 hover:to-green-700">
            <Plus className="h-4 w-4 ml-1" />
            حجز موعد
          </Button>
        </Link>
        <Link href="/patient-portal/results">
          <Button
            variant="outline"
            className="w-full rounded-xl border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-background dark:text-emerald-300"
          >
            <FileText className="h-4 w-4 ml-1" />
            نتائجي
          </Button>
        </Link>
        <Link href="/patient-portal/profile">
          <Button
            variant="outline"
            className="w-full rounded-xl border-sky-200 bg-white text-sky-700 hover:bg-sky-50 dark:bg-background dark:text-sky-300"
          >
            <Phone className="h-4 w-4 ml-1" />
            تواصل معنا
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-sm font-medium">استمرار آمن</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          جميع بياناتك محمية داخل بوابتك الشخصية، ويمكنك متابعة رحلتك العلاجية بسهولة.
        </p>
      </div>

      <Link href="/patient-portal/appointments">
        <Button
          variant="ghost"
          className="w-full justify-center text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/20"
        >
          عرض كل المواعيد
          <ArrowLeft className="h-4 w-4 mr-1" />
        </Button>
      </Link>
    </div>
  );
}
