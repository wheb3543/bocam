/**
 * Appointment Reminders Job
 * ترسل المهمة تذكيرات WhatsApp قبل 24 ساعة وقبل ساعة من الموعد.
 * يستدعيها Heartbeat عبر المسار المحمي بدلاً من مؤقتات داخل الخادم.
 */

import { getDb } from '../../database/db';
import { appointments, whatsappNotifications } from '../../../drizzle/schema';
import { and, between, eq, sql } from 'drizzle-orm';
import { sendAppointmentReminder } from '../../services/whatsappAppointments';
import { createLogger } from '../../_core/logger';
import { notifyEligibleRecipients } from '../../services/notificationPolicy';

const logger = createLogger('appointmentReminders');
const MAX_RETRIES = 3;

type ReminderType = 'reminder_24h' | 'reminder_1h';

async function getAppointmentsNeedingReminder(
  windowStart: Date,
  windowEnd: Date,
  notifType: ReminderType
) {
  const db = await getDb();
  if (!db) {
    logger.warn('Database not available, skipping reminder check');
    return [];
  }

  try {
    const upcomingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          between(appointments.appointmentDate, windowStart, windowEnd),
          sql`${appointments.status} IN ('pending', 'confirmed', 'contacted')`
        )
      );

    if (upcomingAppointments.length === 0) {
      return [];
    }

    const appointmentIds = upcomingAppointments.map((appointment) => appointment.id);
    const alreadySent = await db
      .select({ entityId: whatsappNotifications.entityId })
      .from(whatsappNotifications)
      .where(
        and(
          eq(whatsappNotifications.entityType, 'appointment'),
          eq(whatsappNotifications.notificationType, notifType),
          sql`${whatsappNotifications.entityId} IN (${sql.join(
            appointmentIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      );

    const alreadySentIds = new Set(alreadySent.map((record) => record.entityId));
    return upcomingAppointments.filter((appointment) => !alreadySentIds.has(appointment.id));
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    return [];
  }
}

async function notifyReminderFailure(
  appointmentId: number,
  reminderType: ReminderType,
  event: 'reminder_contact_missing' | 'reminder_delivery_failed'
) {
  try {
    const db = await getDb();
    if (!db) {
      return;
    }
    await notifyEligibleRecipients(db, {
      source: 'bookings',
      type: 'booking_message_failed',
      title:
        event === 'reminder_contact_missing' ? 'تعذر إرسال تذكير موعد' : 'فشل إرسال تذكير موعد',
      message:
        event === 'reminder_contact_missing'
          ? 'تعذر إرسال تذكير موعد لغياب بيانات الاتصال. راجع الحجز قبل الاستحقاق.'
          : 'تعذر إرسال تذكير موعد بعد محاولات الإعادة. راجع القناة والحجز.',
      entityType: 'appointment',
      entityId: appointmentId,
      actionUrl: '/admin/bookings/appointments',
      actionLabel: 'عرض المواعيد',
      priority: 'medium',
      data: JSON.stringify({ event, reminderType }),
    });
  } catch (error) {
    logger.warn('Could not create appointment reminder failure notification:', error);
  }
}

async function sendReminderWithRetry(
  appt: {
    id: number;
    phone?: string | null;
    fullName?: string | null;
    appointmentDate: Date | string | null;
    createdAt: Date | string;
  },
  hoursUntil: number,
  notifType: ReminderType
): Promise<{ success: boolean; error?: string }> {
  const baseDelay = 1000;
  const maxDelay = 10000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await sendAppointmentReminder({
        appointmentId: appt.id,
        phone: appt.phone || '',
        patientName: appt.fullName || 'المريض',
        doctorName: '',
        appointmentTime:
          appt.appointmentDate instanceof Date
            ? appt.appointmentDate
            : new Date(appt.appointmentDate || appt.createdAt),
        hoursUntil,
      });
      if (result.success) {
        return { success: true };
      }
      if (attempt === MAX_RETRIES) {
        return { success: false, error: result.error };
      }
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    logger.warn(
      `${notifType} reminder failed for appointment #${appt.id} (attempt ${attempt + 1}/${MAX_RETRIES + 1}). Retrying in ${delay}ms...`
    );
    await new Promise<void>((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  return { success: false, error: 'Max retries exceeded' };
}

async function sendReminders(hoursUntil: 24 | 1, reminderType: ReminderType) {
  const now = new Date();
  const windowStart =
    hoursUntil === 24
      ? new Date(now.getTime() + 23.5 * 60 * 60 * 1000)
      : new Date(now.getTime() + 45 * 60 * 1000);
  const windowEnd =
    hoursUntil === 24
      ? new Date(now.getTime() + 24.5 * 60 * 60 * 1000)
      : new Date(now.getTime() + 75 * 60 * 1000);
  const toRemind = await getAppointmentsNeedingReminder(windowStart, windowEnd, reminderType);

  if (toRemind.length === 0) {
    logger.info(`No ${hoursUntil}h reminders needed`);
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  for (const appointment of toRemind) {
    if (!appointment.phone) {
      failed += 1;
      void notifyReminderFailure(appointment.id, reminderType, 'reminder_contact_missing');
      continue;
    }
    const result = await sendReminderWithRetry(appointment, hoursUntil, reminderType);
    if (result.success) {
      sent += 1;
      logger.info(`${hoursUntil}h reminder sent for appointment #${appointment.id}`);
    } else {
      failed += 1;
      void notifyReminderFailure(appointment.id, reminderType, 'reminder_delivery_failed');
      logger.warn(
        `Failed to send ${hoursUntil}h reminder for appointment #${appointment.id}: ${result.error}`
      );
    }
  }
  return { sent, failed };
}

/** تشغيل فحوصات التذكير؛ يستدعيها فقط مسار Heartbeat المحمي. */
export async function runAppointmentReminderJobs() {
  logger.info('Running appointment reminder jobs...');
  try {
    const [result24h, result1h] = await Promise.all([
      sendReminders(24, 'reminder_24h'),
      sendReminders(1, 'reminder_1h'),
    ]);
    logger.info(
      `Done. 24h: ${result24h.sent} sent, ${result24h.failed} failed. 1h: ${result1h.sent} sent, ${result1h.failed} failed.`
    );
    return { success: true, reminders24h: result24h, reminders1h: result1h };
  } catch (error) {
    logger.error('Unexpected reminder job error:', error);
    return { success: false, error: String(error) };
  }
}
