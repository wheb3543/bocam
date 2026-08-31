import { and, eq, gte, sql } from 'drizzle-orm';
import { notificationDigestSchedules, notifications, users } from '../../drizzle/schema';
import { createNotification } from '../_core/notificationHelper';
import { getNotificationPreferences } from './notificationPolicy';
import type { NotificationDigestScheduleSettings } from '../../shared/notifications';

const DEFAULT_DIGEST_SETTINGS: NotificationDigestScheduleSettings = {
  enabled: true,
  deliveryHour: 9,
  timezone: 'Asia/Aden',
  scheduleCronTaskUid: null,
  lastDigestDate: null,
};

function dateParts(timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || '0';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}

type DbClient = Awaited<
  ReturnType<typeof import('../_core/databaseGuard').ensureDatabaseAvailable>
>;

export async function getNotificationDigestSchedule(db: DbClient) {
  const [schedule] = await db.select().from(notificationDigestSchedules).limit(1);
  if (schedule) {
    return schedule;
  }
  const [created] = await db
    .insert(notificationDigestSchedules)
    .values(DEFAULT_DIGEST_SETTINGS)
    .$returningId();
  return (
    await db
      .select()
      .from(notificationDigestSchedules)
      .where(eq(notificationDigestSchedules.id, created.id))
      .limit(1)
  )[0];
}

export async function updateNotificationDigestSchedule(
  db: DbClient,
  input: Pick<NotificationDigestScheduleSettings, 'enabled' | 'deliveryHour' | 'timezone'> & {
    updatedBy: number;
  }
) {
  const schedule = await getNotificationDigestSchedule(db);
  await db
    .update(notificationDigestSchedules)
    .set({
      enabled: input.enabled,
      deliveryHour: input.deliveryHour,
      timezone: input.timezone,
      updatedBy: input.updatedBy,
      updatedAt: new Date(),
    })
    .where(eq(notificationDigestSchedules.id, schedule.id));
  return getNotificationDigestSchedule(db);
}

export async function attachNotificationDigestTask(db: DbClient, taskUid: string) {
  const schedule = await getNotificationDigestSchedule(db);
  await db
    .update(notificationDigestSchedules)
    .set({ scheduleCronTaskUid: taskUid, updatedAt: new Date() })
    .where(eq(notificationDigestSchedules.id, schedule.id));
  return getNotificationDigestSchedule(db);
}

export async function createUnreadNotificationDigest(
  db: DbClient,
  userId: number,
  options: { automatic: boolean }
) {
  const preferences = await getNotificationPreferences(userId);
  if (options.automatic && !preferences.dailyDigestEnabled) {
    return { created: false, reason: 'preference_disabled' as const };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      count: sql<number>`COUNT(*)`,
      highPriority: sql<number>`SUM(CASE WHEN ${notifications.priority} = 'high' THEN 1 ELSE 0 END)`,
    })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, 'no'),
        gte(notifications.createdAt, since)
      )
    );
  const unread = Number(rows[0]?.count || 0);
  const highPriority = Number(rows[0]?.highPriority || 0);
  if (unread === 0) {
    return { created: false, reason: 'no_unread' as const };
  }

  const created = await createNotification(db, {
    userId,
    type: 'system',
    source: 'system',
    title: options.automatic ? 'ملخصك اليومي للإشعارات' : 'ملخص الإشعارات عند الطلب',
    message:
      highPriority > 0
        ? `لديك ${unread} إشعاراً غير مقروء، منها ${highPriority} عالية الأولوية خلال آخر 24 ساعة.`
        : `لديك ${unread} إشعاراً غير مقروء خلال آخر 24 ساعة.`,
    entityType: 'notification_digest',
    entityId: `${userId}-${Date.now()}`,
    actionUrl: '/admin/notifications?isRead=no',
    actionLabel: 'عرض غير المقروءة',
    priority: highPriority > 0 ? 'high' : 'low',
    data: JSON.stringify({ unread, highPriority, automatic: options.automatic }),
  });
  return {
    created: created !== null,
    reason: created === null ? ('policy_disabled' as const) : null,
  };
}

export async function dispatchDailyUnreadNotificationDigests(taskUid: string) {
  const db = await import('../_core/databaseGuard').then(({ ensureDatabaseAvailable }) =>
    ensureDatabaseAvailable()
  );
  const [schedule] = await db
    .select()
    .from(notificationDigestSchedules)
    .where(eq(notificationDigestSchedules.scheduleCronTaskUid, taskUid))
    .limit(1);
  if (!schedule || !schedule.enabled) {
    return { skipped: 'disabled_or_orphan', delivered: 0 };
  }

  const now = dateParts(schedule.timezone);
  if (now.hour !== schedule.deliveryHour || schedule.lastDigestDate === now.date) {
    return { skipped: 'outside_delivery_window', delivered: 0 };
  }

  const recipients = await db.select({ id: users.id }).from(users).where(eq(users.isActive, 'yes'));
  let delivered = 0;
  for (const recipient of recipients) {
    const result = await createUnreadNotificationDigest(db, recipient.id, { automatic: true });
    if (result.created) {
      delivered += 1;
    }
  }
  await db
    .update(notificationDigestSchedules)
    .set({ lastDigestDate: now.date, updatedAt: new Date() })
    .where(eq(notificationDigestSchedules.id, schedule.id));
  return { skipped: null, delivered };
}
