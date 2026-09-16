import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Stethoscope,
  X,
} from 'lucide-react';
import type { AppointmentWithDoctor } from '@shared/types';
import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: 'قيد الانتظار',
    bg: 'bg-amber-500/10 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  contacted: {
    label: 'تم التواصل',
    bg: 'bg-blue-500/10 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
  },
  confirmed: {
    label: 'مؤكد',
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  attended: {
    label: 'حضر',
    bg: 'bg-teal-500/10 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-500/20',
    dot: 'bg-teal-500',
  },
  completed: {
    label: 'مكتمل',
    bg: 'bg-purple-500/10 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
  },
  cancelled: {
    label: 'ملغي',
    bg: 'bg-rose-500/10 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/20',
    dot: 'bg-rose-500',
  },
};

interface AppointmentsCalendarViewProps {
  appointments: AppointmentWithDoctor[];
  onViewDetails?: (appointment: AppointmentWithDoctor) => void;
}

export default function AppointmentsCalendarView({
  appointments,
  onViewDetails,
}: AppointmentsCalendarViewProps) {
  const { formatPhoneDisplay } = usePhoneFormat();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<{
    dateStr: string;
    items: AppointmentWithDoctor[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group appointments by date string YYYY-MM-DD
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, AppointmentWithDoctor[]>();

    for (const apt of appointments) {
      let dateKey: string | null = null;
      if (apt.preferredDate) {
        dateKey = apt.preferredDate;
      } else if (apt.appointmentDate) {
        const d = new Date(apt.appointmentDate);
        if (!isNaN(d.getTime())) {
          dateKey = d.toISOString().split('T')[0];
        }
      }

      if (dateKey) {
        const existing = map.get(dateKey) || [];
        existing.push(apt);
        map.set(dateKey, existing);
      }
    }

    return map;
  }, [appointments]);

  // Generate calendar days for current month view
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      appointments: AppointmentWithDoctor[];
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Days from previous month to fill the first row
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        appointments: appointmentsByDate.get(dateStr) || [],
      });
    }

    // Days of the current month
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        appointments: appointmentsByDate.get(dateStr) || [],
      });
    }

    // Days from next month to complete grid rows
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        appointments: appointmentsByDate.get(dateStr) || [],
      });
    }

    return days;
  }, [year, month, appointmentsByDate]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="p-3.5 sm:p-4 border-b border-border/70 flex flex-wrap items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <CalendarIcon className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              {ARABIC_MONTHS[month]} {year}
            </h3>
            <p className="text-xs text-muted-foreground">إجمالي {appointments.length} موعد محمل</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs font-semibold h-8 px-3"
          >
            اليوم
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            className="size-8"
            aria-label="الشهر السابق"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="size-8"
            aria-label="الشهر القادم"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 border-b border-border/70 bg-muted/40 text-center py-2 text-xs font-bold text-muted-foreground">
        {ARABIC_DAYS.map((dayName, idx) => (
          <div key={dayName} className={idx === 5 ? 'text-amber-600 dark:text-amber-400' : ''}>
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6 min-h-0 overflow-y-auto divide-x divide-y divide-border/50 border-b border-border/50">
        {calendarDays.map((cell) => {
          const count = cell.appointments.length;
          const isSelected = selectedDayAppointments?.dateStr === cell.dateStr;

          return (
            <div
              key={cell.dateStr}
              onClick={() => {
                if (count > 0) {
                  setSelectedDayAppointments({ dateStr: cell.dateStr, items: cell.appointments });
                }
              }}
              className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                !cell.isCurrentMonth
                  ? 'bg-muted/15 text-muted-foreground/50'
                  : cell.isToday
                    ? 'bg-primary/5'
                    : isSelected
                      ? 'bg-primary/10'
                      : 'bg-card hover:bg-muted/20'
              } ${count > 0 ? 'cursor-pointer' : ''}`}
            >
              {/* Day Number & Count */}
              <div className="flex items-center justify-between">
                <span
                  className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    cell.isToday
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : cell.isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/60'
                  }`}
                >
                  {cell.date.getDate()}
                </span>

                {count > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 font-bold bg-primary/15 text-primary border-0"
                  >
                    {count}
                  </Badge>
                )}
              </div>

              {/* Appointments Badges inside cell */}
              <div className="space-y-1 my-1 overflow-hidden">
                {cell.appointments.slice(0, 2).map((apt) => {
                  const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                  const time = apt.slotStartTime || apt.preferredTime || '';

                  return (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails?.(apt);
                      }}
                      className={`text-[10px] sm:text-[11px] p-1 rounded-md border truncate font-medium flex items-center gap-1 hover:brightness-95 transition-all ${status.bg} ${status.text} ${status.border}`}
                      title={`${apt.fullName} - ${apt.doctorName || 'طبيب'}`}
                    >
                      <span className={`size-1.5 rounded-full shrink-0 ${status.dot}`} />
                      {time && <span className="font-mono text-[9px] shrink-0">{time}</span>}
                      <span className="truncate">{apt.fullName}</span>
                    </div>
                  );
                })}

                {count > 2 && (
                  <div className="text-[10px] text-muted-foreground font-semibold px-1">
                    +{count - 2} مواعيد أخرى
                  </div>
                )}
              </div>

              <div />
            </div>
          );
        })}
      </div>

      {/* Selected Day Drawer / Bottom Panel */}
      {selectedDayAppointments && (
        <div className="p-4 border-t border-border/80 bg-muted/20 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">
                مواعيد يوم: {selectedDayAppointments.dateStr}
              </h4>
              <Badge variant="outline" className="text-xs">
                {selectedDayAppointments.items.length} مواعيد
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDayAppointments(null)}
              className="text-xs h-7 text-muted-foreground gap-1"
            >
              <X className="size-3.5" />
              إغلاق القائمة
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {selectedDayAppointments.items.map((apt) => {
              const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={apt.id}
                  onClick={() => onViewDetails?.(apt)}
                  className="p-2.5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground truncate">
                      {apt.fullName}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${status.bg} ${status.text} ${status.border}`}
                    >
                      {status.label}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 truncate">
                        <Stethoscope className="size-3 text-primary shrink-0" />
                        <span>{apt.doctorName || `طبيب #${apt.doctorId}`}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {formatPhoneDisplay(apt.phone)}
                      </span>
                    </div>
                    {(apt.slotStartTime || apt.preferredTime) && (
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="size-3 text-muted-foreground shrink-0" />
                        <span>
                          {apt.slotStartTime || apt.preferredTime}{' '}
                          {apt.slotEndTime ? `- ${apt.slotEndTime}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
