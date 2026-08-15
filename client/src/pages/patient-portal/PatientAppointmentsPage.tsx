import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { useFormatDate } from '@/hooks/export/useFormatDate';

import type { AppointmentWithDoctor } from "@shared/types";

type AppointmentFilter = 'upcoming' | 'past';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar } from 'lucide-react';
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
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          className={filter === 'upcoming' ? 'bg-green-600 hover:bg-green-700' : ''}
          onClick={() => setFilter('upcoming')}
        >
          القادمة
        </Button>
        <Button
          size="sm"
          variant={filter === 'past' ? 'default' : 'outline'}
          className={filter === 'past' ? 'bg-green-600 hover:bg-green-700' : ''}
          onClick={() => setFilter('past')}
        >
          السابقة
        </Button>
      </div>

      {!filtered.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>لا توجد مواعيد في هذا القسم</p>
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
