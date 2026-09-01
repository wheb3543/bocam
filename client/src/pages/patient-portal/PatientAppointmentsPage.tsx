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

  const totalCount = appointments?.length ?? 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                مواعيدك
              </p>
              <h2 className="mt-1 text-xl font-black text-foreground">جدول المواعيد</h2>
            </div>
          </div>
          <div className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm dark:bg-background/50 dark:text-emerald-300">
            {totalCount} إجمالي
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white/80 px-3 py-2 shadow-sm dark:border-emerald-900/30 dark:bg-background/40">
        <p className="text-sm font-bold text-foreground">المواعيد القادمة</p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white/80 p-1.5 shadow-sm dark:border-emerald-900/30 dark:bg-background/40">
        <div className="grid grid-cols-2 gap-1">
          <Button
            size="sm"
            variant={filter === 'upcoming' ? 'default' : 'ghost'}
            className={
              filter === 'upcoming'
                ? 'h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700'
                : 'h-10 rounded-xl text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/20'
            }
            onClick={() => setFilter('upcoming')}
          >
            القادمة
          </Button>
          <Button
            size="sm"
            variant={filter === 'past' ? 'default' : 'ghost'}
            className={
              filter === 'past'
                ? 'h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700'
                : 'h-10 rounded-xl text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/20'
            }
            onClick={() => setFilter('past')}
          >
            السابقة
          </Button>
        </div>
      </div>

      {!filtered.length ? (
        <div className="rounded-[28px] border border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white py-12 text-center text-muted-foreground shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/10 dark:to-background">
          <Calendar className="mx-auto mb-3 h-10 w-10 text-emerald-400 opacity-80" />
          <p className="text-base font-bold text-foreground">لا توجد مواعيد في هذا القسم</p>
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
