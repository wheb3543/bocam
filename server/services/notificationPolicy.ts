import { eq, inArray } from 'drizzle-orm';
import { notifications, users } from '../../drizzle/schema';
import { getSetting, getUserPreference, upsertSetting } from '../database/db';
import {
  NOTIFICATION_PREFERENCE_KEY,
  NOTIFICATION_SOURCES,
  NOTIFICATION_SYSTEM_SETTINGS_KEY,
  type NotificationPreferences,
  type NotificationPriority,
  type NotificationRecipientRole,
  type NotificationSource,
  type NotificationSystemSettings,
  type NotificationType,
} from '../../shared/notifications';

const ALL_OPERATIONAL_ROLES: NotificationRecipientRole[] = [
  'admin',
  'manager',
  'staff',
  'team_leader',
];

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  highPriorityOnly: false,
  dailyDigestEnabled: false,
  visualAlertEnabled: true,
  soundAlertEnabled: false,
  enabledSources: {
    content: true,
    bookings: true,
    camps: true,
    offers: true,
    whatsapp: true,
    social_inbox: true,
    tasks: true,
    campaigns: true,
    integrations: true,
    privacy: true,
    security: true,
    system: true,
    manual: true,
  },
};

export const DEFAULT_NOTIFICATION_SYSTEM_SETTINGS: NotificationSystemSettings = {
  enabled: true,
  sourceEnabled: { ...DEFAULT_NOTIFICATION_PREFERENCES.enabledSources },
  recipientRoles: {
    content: ['admin', 'manager'],
    bookings: ALL_OPERATIONAL_ROLES,
    camps: ALL_OPERATIONAL_ROLES,
    offers: ALL_OPERATIONAL_ROLES,
    whatsapp: ALL_OPERATIONAL_ROLES,
    social_inbox: ALL_OPERATIONAL_ROLES,
    tasks: ALL_OPERATIONAL_ROLES,
    campaigns: ['admin', 'manager', 'team_leader'],
    integrations: ['admin', 'manager'],
    privacy: ['admin', 'manager'],
    security: ['admin'],
    system: ['admin', 'manager'],
    manual: ['admin'],
  },
};

function parseJson(value: string | null | undefined): unknown {
  if (!value) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return typeof value === 'object' && value !== null;
}

function isRolesRecord(value: unknown): value is Record<string, NotificationRecipientRole[]> {
  return typeof value === 'object' && value !== null;
}

export function normalizeNotificationPreferences(value: unknown): NotificationPreferences {
  const candidate = value as Partial<NotificationPreferences> | undefined;
  const sourceCandidate = isBooleanRecord(candidate?.enabledSources)
    ? candidate?.enabledSources
    : {};

  return {
    enabled: candidate?.enabled !== false,
    highPriorityOnly: candidate?.highPriorityOnly === true,
    dailyDigestEnabled: candidate?.dailyDigestEnabled === true,
    visualAlertEnabled: candidate?.visualAlertEnabled !== false,
    soundAlertEnabled: candidate?.soundAlertEnabled === true,
    enabledSources: Object.fromEntries(
      NOTIFICATION_SOURCES.map((source) => [source, sourceCandidate[source] !== false])
    ) as Record<NotificationSource, boolean>,
  };
}

export function normalizeNotificationSystemSettings(value: unknown): NotificationSystemSettings {
  const candidate = value as Partial<NotificationSystemSettings> | undefined;
  const sourceCandidate = isBooleanRecord(candidate?.sourceEnabled) ? candidate.sourceEnabled : {};
  const roleCandidate = isRolesRecord(candidate?.recipientRoles) ? candidate.recipientRoles : {};

  return {
    enabled: candidate?.enabled !== false,
    sourceEnabled: Object.fromEntries(
      NOTIFICATION_SOURCES.map((source) => [source, sourceCandidate[source] !== false])
    ) as Record<NotificationSource, boolean>,
    recipientRoles: Object.fromEntries(
      NOTIFICATION_SOURCES.map((source) => [
        source,
        Array.isArray(roleCandidate[source]) && roleCandidate[source].length > 0
          ? roleCandidate[source]
          : DEFAULT_NOTIFICATION_SYSTEM_SETTINGS.recipientRoles[source],
      ])
    ) as Record<NotificationSource, NotificationRecipientRole[]>,
  };
}

export async function getNotificationPreferences(userId: number) {
  const preference = await getUserPreference(userId, NOTIFICATION_PREFERENCE_KEY);
  return normalizeNotificationPreferences(parseJson(preference?.preferenceValue));
}

export async function getNotificationSystemSettings() {
  const setting = await getSetting(NOTIFICATION_SYSTEM_SETTINGS_KEY);
  return normalizeNotificationSystemSettings(parseJson(setting?.value));
}

export async function saveNotificationSystemSettings(value: unknown) {
  const normalized = normalizeNotificationSystemSettings(value);
  await upsertSetting({
    key: NOTIFICATION_SYSTEM_SETTINGS_KEY,
    value: JSON.stringify(normalized),
    description: 'سياسة الإشعارات الموحدة وإعدادات التنبيه التشغيلية',
  });
  return normalized;
}

export async function shouldDeliverNotification(
  db: any,
  input: { userId: number; source: NotificationSource; priority?: NotificationPriority }
) {
  const systemSettings = await getNotificationSystemSettings();
  const priority = input.priority || 'medium';
  if (!systemSettings.enabled || !systemSettings.sourceEnabled[input.source]) {
    return false;
  }

  const [recipient] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);
  if (!recipient || !systemSettings.recipientRoles[input.source].includes(recipient.role)) {
    return false;
  }

  const preferences = await getNotificationPreferences(input.userId);
  if (!preferences.enabled || !preferences.enabledSources[input.source]) {
    return false;
  }
  return !preferences.highPriorityOnly || priority === 'high';
}

export async function notifyEligibleRecipients(
  db: any,
  input: {
    source: NotificationSource;
    type: NotificationType;
    title: string;
    message: string;
    entityType: string;
    entityId: string | number;
    actionUrl: string;
    actionLabel: string;
    priority?: NotificationPriority;
    data?: string;
  }
) {
  const systemSettings = await getNotificationSystemSettings();
  const priority = input.priority || 'medium';

  if (!systemSettings.enabled || !systemSettings.sourceEnabled[input.source]) {
    return { recipients: 0, skipped: 'system_disabled' as const };
  }

  const roles = systemSettings.recipientRoles[input.source];
  if (roles.length === 0) {
    return { recipients: 0, skipped: 'no_roles' as const };
  }

  const candidates = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.role, roles));

  const eligibleUserIds = (
    await Promise.all(
      candidates.map(async (candidate: { id: number }) =>
        (await shouldDeliverNotification(db, {
          userId: candidate.id,
          source: input.source,
          priority,
        }))
          ? candidate.id
          : null
      )
    )
  ).filter((userId): userId is number => userId !== null);

  if (eligibleUserIds.length === 0) {
    return { recipients: 0, skipped: 'recipient_preferences' as const };
  }

  await db.insert(notifications).values(
    eligibleUserIds.map((userId) => ({
      ...input,
      userId,
      priority,
      entityId: String(input.entityId),
      data: input.data || null,
    }))
  );
  return { recipients: eligibleUserIds.length, skipped: null };
}
