import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { useFormatDate } from '@/hooks/export/useFormatDate';

import type { AppointmentWithDoctor } from '@shared/types';

type AppointmentFilter = 'upcoming' | 'past';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock3 } from 'lucide-react';
import AppointmentCard from '@/components/patient/AppointmentCard';

export default function PatientAppointmentsPage() {
  const [, navigate] = useLocation();
  const { formatDate } = useFormatDate();
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const { data: appointments, isLoading } = trpc.patientPortal.myAppointments.useQuery();

  const statusBadge = (status: string) => {
    const map: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      new: { label: 'جديد', variant: 'default' },
      confirmed: { label: 'مؤكد', variant: 'default' },
      completed: { label: 'مكتمل', variant: 'secondary' },
      cancelled: { label: 'ملغي', variant: 'destructive' },
      pending: { label: 'قيد الانتظار', variant: 'outline' },
      contacted: { label: 'تم التواصل', variant: 'secondary' },
    };
    const info = map[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const all = appointments || [];
    const upcoming = all
      .filter((apt) => new Date(apt.appointmentDate || apt.createdAt) >= now)
      .sort(
        (a, b) =>
          new Date(a.appointmentDate || a.createdAt).getTime() -
          new Date(b.appointmentDate || b.createdAt).getTime()
      );
    const past = all
      .filter((apt) => new Date(apt.appointmentDate || apt.createdAt) < now)
      .sort(
        (a, b) =>
          new Date(b.appointmentDate || b.createdAt).getTime() -
          new Date(a.appointmentDate || a.createdAt).getTime()
      );
    return filter === 'upcoming' ? upcoming : past;
  }, [appointments, filter]);

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              مواعيدك
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">جدول المواعيد</h2>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          className={
            filter === 'upcoming' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-200'
          }
          onClick={() => setFilter('upcoming')}
        >
          المواعيد القادمة
        </Button>
        <Button
          size="sm"
          variant={filter === 'past' ? 'default' : 'outline'}
          className={
            filter === 'past' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-200'
          }
          onClick={() => setFilter('past')}
        >
          السابقة
        </Button>
      </div>

      {!filtered.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/70 py-12 text-center text-muted-foreground">
          <Calendar className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p className="text-base font-medium">لا توجد مواعيد في هذا القسم</p>
          <p className="mt-1 text-sm">سنظهر لك المواعيد الجديدة فور إضافتها.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appointment: AppointmentWithDoctor) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              statusBadge={statusBadge}
              formatDate={formatDate}
              onOpenDetails={() => navigate(`/patient-portal/appointments/${appointment.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
