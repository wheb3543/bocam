/**
 * Arrival Welcome Route
 * مسار إرسال رسالة الوصول
 */

import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { ensureDatabaseAvailable } from '../../../_core/databaseGuard';
import { appointments } from '../../../../drizzle/schema';
import { getDoctorById } from '../../../database/db';

export async function sendArrivalWelcome({ input }: { input: Record<string, unknown> }) {
  const appointmentId = input.appointmentId as number;

  const db = await ensureDatabaseAvailable();

  // Get appointment details
  const appointment = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);
  if (appointment.length === 0) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'الحجز غير موجود' });
  }

  const appt = appointment[0];
  const doctor = await getDoctorById(appt.doctorId);

  // Send automated arrival welcome message
  const { sendPatientArrivalWelcome, formatTimeForMessage } =
    await import('../../../services/messaging');
  const result = await sendPatientArrivalWelcome({
    phone: appt.phone,
    name: appt.fullName,
    doctor: doctor?.name || 'غير محدد',
    time: appt.appointmentDate ? formatTimeForMessage(new Date(appt.appointmentDate)) : 'غير محدد',
  });

  return result;
}
