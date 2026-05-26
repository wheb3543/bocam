import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useFormatDate } from "@/hooks/useFormatDate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, FileText, Gift, Phone, Plus, ArrowLeft } from "lucide-react";
import AnimatedCard from "@/components/AnimatedCard";

export default function PatientHomePage() {
  const { formatDate } = useFormatDate();
  const { data: patient } = trpc.patientPortal.me.useQuery();
  const { data: appointments, isLoading: appointmentsLoading } = trpc.patientPortal.myAppointments.useQuery();
  const { data: results, isLoading: resultsLoading } = trpc.patientPortal.myResults.useQuery();
  const { data: offers, isLoading: offersLoading } = trpc.patientPortal.myOfferBookings.useQuery();

  const latestAppointment = appointments?.[0];
  const latestResult = results?.[0];
  const latestOffer = offers?.[0];

  return (
    <div className="space-y-4">
      <AnimatedCard
        className="rounded-2xl shadow-sm border-green-100 dark:border-gray-700 bg-gradient-to-l from-green-50 to-white dark:from-gray-800 dark:to-gray-900"
        delay={0}
      >
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground">أهلاً بك</p>
          <h2 className="text-lg font-bold mt-1">{patient?.fullName || "مستخدم بوابة المريض"}</h2>
          <p className="text-sm text-muted-foreground mt-1">تابع مواعيدك ونتائجك وكل ما يخص رحلتك العلاجية.</p>
        </CardContent>
      </AnimatedCard>

      <div className="grid grid-cols-1 gap-3">
        <AnimatedCard className="rounded-2xl shadow-sm" delay={0.1}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              آخر موعد
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {appointmentsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
            ) : latestAppointment ? (
              <p>{latestAppointment.fullName || "موعد طبي"} - {formatDate(latestAppointment.appointmentDate || latestAppointment.createdAt)}</p>
            ) : (
              <p className="text-muted-foreground">لا توجد مواعيد حالياً</p>
            )}
          </CardContent>
        </AnimatedCard>

        <AnimatedCard className="rounded-2xl shadow-sm" delay={0.2}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-600" />
              أحدث نتيجة
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {resultsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
            ) : latestResult ? (
              <p>{latestResult.title} - {formatDate(latestResult.resultDate || latestResult.createdAt)}</p>
            ) : (
              <p className="text-muted-foreground">لا توجد نتائج جديدة</p>
            )}
          </CardContent>
        </AnimatedCard>

        <AnimatedCard className="rounded-2xl shadow-sm" delay={0.3}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gift className="h-4 w-4 text-blue-600" />
              عرض قادم
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {offersLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
            ) : latestOffer ? (
              <p>{latestOffer.fullName || "حجز عرض"} - {formatDate(latestOffer.createdAt)}</p>
            ) : (
              <p className="text-muted-foreground">لا توجد عروض محجوزة</p>
            )}
          </CardContent>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/doctors">
          <Button className="w-full rounded-xl bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 ml-1" />
            حجز موعد
          </Button>
        </Link>
        <Link href="/patient-portal/results">
          <Button variant="outline" className="w-full rounded-xl">
            <FileText className="h-4 w-4 ml-1" />
            نتائجي
          </Button>
        </Link>
        <Link href="/patient-portal/profile">
          <Button variant="outline" className="w-full rounded-xl">
            <Phone className="h-4 w-4 ml-1" />
            تواصل معنا
          </Button>
        </Link>
      </div>

      <Link href="/patient-portal/appointments">
        <Button variant="ghost" className="w-full text-green-600">
          عرض كل المواعيد
          <ArrowLeft className="h-4 w-4 mr-1" />
        </Button>
      </Link>
    </div>
  );
}
