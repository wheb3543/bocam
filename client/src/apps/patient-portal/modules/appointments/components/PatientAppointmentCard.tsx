import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Stethoscope, ChevronLeft, Clock, User } from 'lucide-react';
import { ReactNode } from 'react';
import type { AppointmentWithDoctor } from '@shared/types';
import {
  RELATIONSHIP_LABELS,
  getRelationshipBadgeStyle,
} from '@/components/patient/FamilyMembersFilter';

type ExtendedAppointment = Omit<Partial<AppointmentWithDoctor>, 'createdAt' | 'doctorName'> & {
  id: number;
  fullName?: string;
  beneficiaryName?: string;
  relationship?: string;
  doctorName?: string | null;
  doctorSpecialty?: string | null;
  departmentName?: string | null;
  slotStartTime?: string | null;
  appointmentTime?: string | null;
  procedure?: string | null;
  status: string;
  appointmentDate?: string | Date | null;
  createdAt?: string | Date;
};

interface AppointmentCardProps {
  appointment: ExtendedAppointment;
  statusBadge: (status: string) => ReactNode;
  formatDate: (value: string | Date) => string;
  onOpenDetails?: () => void;
}

export default function AppointmentCard({
  appointment,
  statusBadge,
  formatDate,
  onOpenDetails,
}: AppointmentCardProps) {
  const beneficiary = appointment.beneficiaryName || appointment.fullName;
  const isFamilyMember = appointment.relationship && appointment.relationship !== 'self';
  const relLabel = appointment.relationship
    ? RELATIONSHIP_LABELS[appointment.relationship] || appointment.relationship
    : null;
  const timeDisplay = appointment.slotStartTime || appointment.appointmentTime;

  return (
    <Card className="rounded-2xl shadow-sm border-emerald-100 dark:border-gray-700 hover:border-emerald-200 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* عنوان الموعد مع الطبيب أو الإجراء */}
            <div className="flex items-center flex-wrap gap-2">
              <p className="text-sm font-bold text-foreground truncate">
                {appointment.doctorName
                  ? `د. ${appointment.doctorName}`
                  : appointment.procedure || 'موعد طبي'}
              </p>
              {appointment.doctorSpecialty && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                  {appointment.doctorSpecialty}
                </span>
              )}
            </div>

            {/* اسم المستفيد والشارة العائلية */}
            {beneficiary && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3 text-muted-foreground/70" />
                <span className="font-medium text-foreground/80">{beneficiary}</span>
                {isFamilyMember && relLabel && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md border font-normal ${getRelationshipBadgeStyle(
                      appointment.relationship
                    )}`}
                  >
                    {relLabel}
                  </span>
                )}
              </div>
            )}

            {/* تفاصيل التاريخ والوقت والإجراء */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                {formatDate(appointment.appointmentDate || appointment.createdAt || new Date())}
              </span>
              {timeDisplay && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  <span dir="ltr">{timeDisplay}</span>
                </span>
              )}
              {appointment.procedure && appointment.doctorName && (
                <span className="inline-flex items-center gap-1">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                  {appointment.procedure}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0">{statusBadge(appointment.status)}</div>
        </div>

        {onOpenDetails && (
          <div className="pt-2.5 mt-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/20 text-xs font-semibold h-8"
              onClick={onOpenDetails}
            >
              تفاصيل الموعد
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
