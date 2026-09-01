import { useRoute } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import type { AppointmentWithDoctor } from '@shared/types';

import { useFormatDate } from '@/hooks/export/useFormatDate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Stethoscope, Phone, FileText } from 'lucide-react';

export default function PatientAppointmentDetailsPage() {
  const { formatDate } = useFormatDate();
  const [, params] = useRoute('/patient-portal/appointments/:id');
  const appointmentId = Number(params?.id);
  const { data: appointments, isLoading } = trpc.patientPortal.myAppointments.useQuery();
  const appointment = appointments?.find(
    (item: AppointmentWithDoctor) => item.id === appointmentId
  );

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>الموعد غير موجود أو لا تملك صلاحية عرضه.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <Card className="overflow-hidden rounded-[30px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 shadow-[0_18px_40px_rgba(16,185,129,0.10)] dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                  تفاصيل الموعد
                </p>
                <CardTitle className="mt-1 text-xl font-black text-foreground">
                  {appointment.fullName || 'موعد طبي'}
                </CardTitle>
              </div>
            </div>
            <Badge className="rounded-full border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
              {appointment.status || 'pending'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-[24px] border border-emerald-100 bg-white/80 p-3 shadow-sm dark:border-emerald-900/30 dark:bg-background/50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
              ملخص الموعد
            </p>
            <p className="mt-1 text-base font-bold text-foreground">
              {appointment.procedure || 'زيارة طبية'} ·{' '}
              {formatDate(appointment.appointmentDate || appointment.createdAt)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40">
              <p className="text-xs text-muted-foreground">تاريخ الموعد</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                {formatDate(appointment.appointmentDate || appointment.createdAt)}
              </p>
            </div>
            {appointment.procedure && (
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40">
                <p className="text-xs text-muted-foreground">الإجراء</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                  {appointment.procedure}
                </p>
              </div>
            )}
            {appointment.phone && (
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40 sm:col-span-2">
                <p className="text-xs text-muted-foreground">رقم التواصل</p>
                <p
                  className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground"
                  dir="ltr"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  {appointment.phone}
                </p>
              </div>
            )}
          </div>

          {appointment.additionalNotes && (
            <div className="rounded-[24px] border border-border/80 bg-white/80 p-4 shadow-sm dark:bg-background/40">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                <FileText className="h-4 w-4 text-emerald-600" />
                ملاحظات الموعد
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {appointment.additionalNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
