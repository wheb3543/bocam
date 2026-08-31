import { and, eq, gte, inArray, isNotNull, isNull, lt, lte } from 'drizzle-orm';
import { integrationAlertSchedules, integrationConnections } from '../../drizzle/schema';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { notifyEligibleRecipients } from './notificationPolicy';

type IntegrationProvider = 'meta' | 'whatsapp' | 'x' | 'linkedin' | 'youtube' | 'tiktok';

function providerLabel(provider: IntegrationProvider) {
  const labels: Record<IntegrationProvider, string> = {
    meta: 'Meta',
    whatsapp: 'WhatsApp Business',
    x: 'X',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    tiktok: 'TikTok',
  };
  return labels[provider];
}

export async function notifyIntegrationIssue(input: {
  connectionId: number;
  provider: IntegrationProvider;
  event: 'connection_error' | 'authorization_expiring';
}) {
  const db = await ensureDatabaseAvailable();
  const expiring = input.event === 'authorization_expiring';
  return notifyEligibleRecipients(db, {
    source: 'integrations',
    type: input.event,
    title: expiring ? 'تفويض تكامل يقترب من الانتهاء' : 'فشل اتصال تكامل يحتاج مراجعة',
    message: expiring
      ? `تفويض ${providerLabel(input.provider)} يقترب من الانتهاء. راجع إعدادات الربط لتجنب توقف الخدمة.`
      : `تعذر إكمال أو استمرار اتصال ${providerLabel(input.provider)}. راجع إعدادات الربط وسجل التدقيق.`,
    entityType: 'integration_connection',
    entityId: input.connectionId,
    actionUrl: '/admin/communications/integration-settings',
    actionLabel: 'مراجعة التكاملات',
    priority: 'high',
    data: JSON.stringify({ provider: input.provider, event: input.event }),
  });
}

type DbClient = Awaited<ReturnType<typeof ensureDatabaseAvailable>>;

export async function getIntegrationAlertSchedule(db: DbClient) {
  const [schedule] = await db.select().from(integrationAlertSchedules).limit(1);
  if (schedule) {
    return schedule;
  }
  const [created] = await db
    .insert(integrationAlertSchedules)
    .values({ enabled: 'yes', leadTimeHours: 72 })
    .$returningId();
  return (
    await db
      .select()
      .from(integrationAlertSchedules)
      .where(eq(integrationAlertSchedules.id, created.id))
      .limit(1)
  )[0];
}

export async function attachIntegrationAlertTask(db: DbClient, taskUid: string) {
  const schedule = await getIntegrationAlertSchedule(db);
  await db
    .update(integrationAlertSchedules)
    .set({ scheduleCronTaskUid: taskUid, updatedAt: new Date() })
    .where(eq(integrationAlertSchedules.id, schedule.id));
  return getIntegrationAlertSchedule(db);
}

export async function dispatchIntegrationExpiryAlerts(taskUid: string, now = new Date()) {
  const db = await ensureDatabaseAvailable();
  const [schedule] = await db
    .select()
    .from(integrationAlertSchedules)
    .where(eq(integrationAlertSchedules.scheduleCronTaskUid, taskUid))
    .limit(1);
  if (!schedule || schedule.enabled !== 'yes') {
    return { skipped: 'disabled_or_orphan', alerted: 0 };
  }

  const windowEnd = new Date(now.getTime() + schedule.leadTimeHours * 60 * 60 * 1000);
  const expiring = await db
    .select({ id: integrationConnections.id, provider: integrationConnections.provider })
    .from(integrationConnections)
    .where(
      and(
        inArray(integrationConnections.status, ['connected', 'reauthorization_required']),
        isNotNull(integrationConnections.expiresAt),
        isNull(integrationConnections.authorizationExpiryNotifiedAt),
        gte(integrationConnections.expiresAt, now),
        lte(integrationConnections.expiresAt, windowEnd)
      )
    );
  const expired = await db
    .select({ id: integrationConnections.id, provider: integrationConnections.provider })
    .from(integrationConnections)
    .where(
      and(
        inArray(integrationConnections.status, ['connected', 'reauthorization_required']),
        isNotNull(integrationConnections.expiresAt),
        isNull(integrationConnections.authorizationExpiryNotifiedAt),
        lt(integrationConnections.expiresAt, now)
      )
    );

  let alerted = 0;
  for (const connection of expiring) {
    const result = await notifyIntegrationIssue({
      connectionId: connection.id,
      provider: connection.provider,
      event: 'authorization_expiring',
    });
    if (result.recipients > 0) {
      await db
        .update(integrationConnections)
        .set({ authorizationExpiryNotifiedAt: now })
        .where(eq(integrationConnections.id, connection.id));
      alerted += 1;
    }
  }
  for (const connection of expired) {
    const result = await notifyIntegrationIssue({
      connectionId: connection.id,
      provider: connection.provider,
      event: 'connection_error',
    });
    if (result.recipients > 0) {
      await db
        .update(integrationConnections)
        .set({ authorizationExpiryNotifiedAt: now, status: 'expired' })
        .where(eq(integrationConnections.id, connection.id));
      alerted += 1;
    }
  }

  await db
    .update(integrationAlertSchedules)
    .set({ lastRunAt: now, updatedAt: now })
    .where(eq(integrationAlertSchedules.id, schedule.id));
  return { skipped: null, alerted };
}
