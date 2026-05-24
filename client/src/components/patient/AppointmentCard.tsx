import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Stethoscope, ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

type AppointmentCardProps = {
  appointment: any;
  statusBadge: (status: string) => ReactNode;
  formatDate: (value: string | Date) => string;
  onOpenDetails?: () => void;
};

export default function AppointmentCard({
  appointment,
  statusBadge,
  formatDate,
  onOpenDetails,
}: AppointmentCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-green-100 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{appointment.fullName || "موعد طبي"}</p>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(appointment.appointmentDate || appointment.createdAt)}
              </span>
              {appointment.procedure && (
                <span className="inline-flex items-center gap-1">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {appointment.procedure}
                </span>
              )}
            </div>
          </div>
          {statusBadge(appointment.status)}
        </div>

        {onOpenDetails && (
          <div className="pt-3 mt-3 border-t">
            <Button variant="ghost" size="sm" className="w-full text-green-600" onClick={onOpenDetails}>
              تفاصيل الموعد
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
