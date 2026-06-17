import { useRoute } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Stethoscope, Clock, Phone, FileText } from 'lucide-react';

export default function PatientAppointmentDetailsPage() {
  const { formatDate } = useFormatDate();
  const [, params] = useRoute('/patient-portal/appointments/:id');
  const appointmentId = Number(params?.id);
  const { data: appointments, isLoading } = trpc.patientPortal.myAppointments.useQuery();
  const appointment = appointments?.find((item: any) => item.id === appointmentId);

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
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{appointment.fullName || 'موعد طبي'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            التاريخ
          </span>
          <span>{formatDate(appointment.appointmentDate || appointment.createdAt)}</span>
        </div>
        {appointment.procedure && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Stethoscope className="h-4 w-4" />
              الإجراء
            </span>
            <span>{appointment.procedure}</span>
          </div>
        )}
        {appointment.phone && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Phone className="h-4 w-4" />
              الهاتف
            </span>
            <span dir="ltr">{appointment.phone}</span>
          </div>
        )}
        <div className="pt-2 border-t">
          <Badge variant="outline">{appointment.status || 'pending'}</Badge>
        </div>
        {appointment.additionalNotes && (
          <div className="pt-2 border-t">
            <p className="text-muted-foreground inline-flex items-center gap-1 mb-1">
              <FileText className="h-4 w-4" />
              ملاحظات
            </p>
            <p>{appointment.additionalNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
