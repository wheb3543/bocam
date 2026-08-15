/**
 * Appointment Helpers
 * دوال مساعدة للمواعيد
 */

import { createLogger } from '../../../_core/logger';
import { eq } from 'drizzle-orm';
import { appointments } from '../../../../drizzle/schema';
import { invalidateEntityCache } from '../../../services/cacheInvalidator';

const logger = createLogger('appointments');

// Build timestamp fields based on status
export function buildStatusTimestamps(status: string): Record<string, Date> {
  const now = new Date();
  const statusTimestamps: Record<string, Date> = {};

  if (status === 'contacted') {
    statusTimestamps.contactedAt = now;
  } else if (status === 'confirmed') {
    statusTimestamps.confirmedAt = now;
  } else if (status === 'attended') {
    statusTimestamps.attendedAt = now;
  } else if (status === 'completed') {
    statusTimestamps.completedAt = now;
  } else if (status === 'cancelled') {
    statusTimestamps.cancelledAt = now;
  }

  return statusTimestamps;
}

// Invalidate appointment caches
export function invalidateAppointmentCaches() {
  invalidateEntityCache('appointments');
}

// Send WhatsApp message for status change
export async function sendStatusWhatsAppMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDoctorById: (id: number) => Promise<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatchWhatsAppMessage: any,
  appointmentId: number,
  status: string,
  userId?: number
) {
  const [appt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (appt?.phone) {
    const doctor = await getDoctorById(appt.doctorId || 0);
    const triggerMap: Record<string, string> = {
      confirmed: 'on_confirmed',
      مؤكد: 'on_confirmed',
      attended: 'on_arrived',
      حضر: 'on_arrived',
      completed: 'on_completed',
      مكتمل: 'on_completed',
      cancelled: 'on_cancelled',
      ملغي: 'on_cancelled',
    };
    const triggerEvent = triggerMap[status];
    if (triggerEvent) {
      await dispatchWhatsAppMessage({
        entityType: 'appointment',
        triggerEvent: triggerEvent as
          'on_confirmed' | 'on_arrived' | 'on_completed' | 'on_cancelled',
        phone: appt.phone,
        recipientName: appt.fullName || undefined,
        variables: {
          name: appt.fullName || 'المريض',
          doctor: doctor?.name || 'غير محدد',
          date: appt.preferredDate || 'غير محدد',
          time: appt.preferredTime || 'غير محدد',
          service: appt.procedure || 'فحص عام',
        },
        entityId: appointmentId,
        sentBy: userId,
      }).catch((err: unknown) => logger.error('Appointment status trigger error:', err));
    }
  }
}
