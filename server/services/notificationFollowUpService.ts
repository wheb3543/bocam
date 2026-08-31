import { notifyEligibleRecipients } from './notificationPolicy';
import type { NotificationSource } from '../../shared/notifications';

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  contacted: 'تم التواصل',
  no_answer: 'لا توجد إجابة',
  confirmed: 'مؤكد',
  attended: 'حضر',
  completed: 'مكتمل',
  cancelled: 'ملغى',
};

type DbClient = Awaited<
  ReturnType<typeof import('../_core/databaseGuard').ensureDatabaseAvailable>
>;

export async function notifyRegistrationStatusFollowUp(
  db: DbClient,
  input: {
    source: Extract<NotificationSource, 'bookings' | 'camps' | 'offers'>;
    entityType: 'appointment' | 'camp_registration' | 'offer_lead';
    entityId: number;
    oldStatus: string;
    newStatus: string;
    actionUrl: string;
    actionLabel: string;
  }
) {
  if (!input.oldStatus || input.oldStatus === input.newStatus) {
    return { recipients: 0, skipped: 'unchanged' as const };
  }
  return notifyEligibleRecipients(db, {
    source: input.source,
    type: 'booking_status_changed',
    title: 'تحديث حالة تسجيل',
    message: `تغيرت حالة التسجيل من ${statusLabels[input.oldStatus] || input.oldStatus} إلى ${statusLabels[input.newStatus] || input.newStatus}.`,
    entityType: input.entityType,
    entityId: input.entityId,
    actionUrl: input.actionUrl,
    actionLabel: input.actionLabel,
    priority: input.newStatus === 'cancelled' ? 'high' : 'medium',
    data: JSON.stringify({ oldStatus: input.oldStatus, newStatus: input.newStatus }),
  });
}
