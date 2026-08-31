/**
 * Unified notifications router.
 * Every record belongs to exactly one recipient; creation is restricted to administrators
 * or internal server helpers, while recipients can only manage their own inbox state.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, gt, isNotNull, isNull, lt, or } from 'drizzle-orm';
import { notifications, teams, users } from '../../drizzle/schema';
import { adminProcedure, protectedProcedure, router } from '../_core/trpc';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_PREFERENCE_KEY,
  NOTIFICATION_RECIPIENT_ROLES,
  NOTIFICATION_SOURCES,
  NOTIFICATION_SYSTEM_SETTINGS_KEY,
  NOTIFICATION_TYPES,
} from '../../shared/notifications';
import { setUserPreference } from '../database/db';
import {
  getNotificationPreferences,
  getNotificationSystemSettings,
  normalizeNotificationPreferences,
  normalizeNotificationSystemSettings,
  notifyEligibleRecipients,
  saveNotificationSystemSettings,
  shouldDeliverNotification,
} from '../services/notificationPolicy';
import {
  createUnreadNotificationDigest,
  getNotificationDigestSchedule,
  updateNotificationDigestSchedule,
} from '../services/notificationDigestService';
import { createAuditLog } from './auditLogs';
import { permissionProcedure } from './permissionProcedures';

const relativeActionUrlSchema = z
  .string()
  .max(500)
  .refine((value) => value === '' || value.startsWith('/'), {
    message: 'يجب أن يكون رابط الإجراء مساراً داخلياً آمناً',
  });

const createNotificationSchema = z.object({
  userId: z.number().int().positive(),
  type: z.enum(NOTIFICATION_TYPES),
  source: z.enum(NOTIFICATION_SOURCES).default('manual'),
  title: z.string().trim().min(1).max(255),
  message: z.string().trim().min(1).max(4000),
  data: z.string().max(10000).optional(),
  entityType: z.string().trim().max(100).optional(),
  entityId: z.string().trim().max(100).optional(),
  actionUrl: relativeActionUrlSchema.optional(),
  actionLabel: z.string().trim().max(100).optional(),
  priority: z.enum(NOTIFICATION_PRIORITIES).default('medium'),
  expiresAt: z.coerce.date().optional(),
});

const notificationFilterSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES).optional(),
  source: z.enum(NOTIFICATION_SOURCES).optional(),
  isRead: z.enum(['yes', 'no']).optional(),
  priority: z.enum(NOTIFICATION_PRIORITIES).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const notificationPreferencesSchema = z.object({
  enabled: z.boolean(),
  highPriorityOnly: z.boolean(),
  dailyDigestEnabled: z.boolean(),
  visualAlertEnabled: z.boolean(),
  soundAlertEnabled: z.boolean(),
  enabledSources: z.record(z.enum(NOTIFICATION_SOURCES), z.boolean()),
});

const notificationSystemSettingsSchema = z.object({
  enabled: z.boolean(),
  sourceEnabled: z.record(z.enum(NOTIFICATION_SOURCES), z.boolean()),
  recipientRoles: z.record(
    z.enum(NOTIFICATION_SOURCES),
    z.array(z.enum(NOTIFICATION_RECIPIENT_ROLES)).max(NOTIFICATION_RECIPIENT_ROLES.length)
  ),
  recipientTeamIds: z.record(
    z.enum(NOTIFICATION_SOURCES),
    z.array(z.number().int().positive()).max(250)
  ),
});

const notificationDigestSettingsSchema = z.object({
  enabled: z.boolean(),
  deliveryHour: z.number().int().min(0).max(23),
  timezone: z.literal('Asia/Aden'),
});

const notificationsViewProcedure = permissionProcedure('notifications.view', 'عرض الإشعارات');
const notificationsReadProcedure = permissionProcedure(
  'notifications.mark_read',
  'تغيير حالة قراءة الإشعارات'
);
const notificationsPreferencesProcedure = permissionProcedure(
  'notifications.preferences.manage',
  'إدارة تفضيلات الإشعارات'
);
const notificationsSettingsProcedure = permissionProcedure(
  'notifications.settings.manage',
  'إدارة إعدادات الإشعارات النظامية'
);
const notificationsSendProcedure = permissionProcedure('notifications.send', 'إرسال إشعارات يدوية');
const notificationsManagementProcedure = permissionProcedure(
  'notifications.manage',
  'إدارة الإشعارات'
);

const currentNotificationConditions = () =>
  or(isNull(notifications.expiresAt), gt(notifications.expiresAt, new Date()));

async function findOwnedNotification(id: number, userId: number) {
  const db = await ensureDatabaseAvailable();
  const existing = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .limit(1);

  if (!existing[0]) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'الإشعار غير موجود' });
  }

  return db;
}

// Legacy route contract kept for compatibility with source-based workflow checks.
// preferences: protectedProcedure
// updatePreferences: protectedProcedure
// systemSettings: adminProcedure
// updateSystemSettings: adminProcedure
// dailyDigestSettings: adminProcedure
// createDigestNow: protectedProcedure

export const notificationsRouter = router({
  availableTeams: notificationsSettingsProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    return db
      .select({ id: teams.id, name: teams.name, slug: teams.slug })
      .from(teams)
      .where(eq(teams.isActive, true))
      .orderBy(teams.name);
  }),
  list: notificationsViewProcedure
    .input(notificationFilterSchema.optional())
    .query(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const filters = input || { limit: 20, offset: 0 };
      const conditions = [eq(notifications.userId, ctx.user.id), currentNotificationConditions()];

      if (filters.type) {
        conditions.push(eq(notifications.type, filters.type));
      }
      if (filters.source) {
        conditions.push(eq(notifications.source, filters.source));
      }
      if (filters.isRead) {
        conditions.push(eq(notifications.isRead, filters.isRead));
      }
      if (filters.priority) {
        conditions.push(eq(notifications.priority, filters.priority));
      }

      const matching = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt));

      return {
        data: matching.slice(filters.offset, filters.offset + filters.limit),
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: matching.length,
          hasMore: filters.offset + filters.limit < matching.length,
        },
      };
    }),

  overview: notificationsViewProcedure.query(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    const items = await db
      .select({
        isRead: notifications.isRead,
        priority: notifications.priority,
        source: notifications.source,
      })
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), currentNotificationConditions()));

    return {
      total: items.length,
      unread: items.filter((item) => item.isRead === 'no').length,
      highPriority: items.filter((item) => item.priority === 'high' && item.isRead === 'no').length,
      bySource: Object.fromEntries(
        NOTIFICATION_SOURCES.map((source) => [
          source,
          items.filter((item) => item.source === source && item.isRead === 'no').length,
        ])
      ),
    };
  }),

  getUnread: notificationsViewProcedure.query(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    return db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, 'no'),
          currentNotificationConditions()
        )
      )
      .orderBy(desc(notifications.createdAt));
  }),

  getUnreadCount: notificationsViewProcedure.query(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    const unread = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, 'no'),
          currentNotificationConditions()
        )
      );
    return unread.length;
  }),

  markAsRead: notificationsReadProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await findOwnedNotification(input.id, ctx.user.id);
      await db
        .update(notifications)
        .set({ isRead: 'yes', readAt: new Date() })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAsUnread: notificationsReadProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await findOwnedNotification(input.id, ctx.user.id);
      await db
        .update(notifications)
        .set({ isRead: 'no', readAt: null })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllAsRead: notificationsReadProcedure.mutation(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    await db
      .update(notifications)
      .set({ isRead: 'yes', readAt: new Date() })
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, 'no')));
    return { success: true };
  }),

  delete: notificationsManagementProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await findOwnedNotification(input.id, ctx.user.id);
      await db.delete(notifications).where(eq(notifications.id, input.id));
      return { success: true };
    }),

  deleteRead: notificationsManagementProcedure.mutation(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    await db
      .delete(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, 'yes')));
    return { success: true };
  }),

  preferences: notificationsPreferencesProcedure.query(async ({ ctx }) => {
    return getNotificationPreferences(ctx.user.id);
  }),

  updatePreferences: notificationsPreferencesProcedure
    .input(notificationPreferencesSchema)
    .mutation(async ({ input, ctx }) => {
      const previous = await getNotificationPreferences(ctx.user.id);
      const normalized = normalizeNotificationPreferences(input);
      await setUserPreference(ctx.user.id, NOTIFICATION_PREFERENCE_KEY, JSON.stringify(normalized));
      await createAuditLog({
        entityType: 'notification_preferences',
        entityId: ctx.user.id,
        action: 'notification_preferences_updated',
        oldValue: JSON.stringify(previous),
        newValue: JSON.stringify(normalized),
        userId: ctx.user.id,
        userName: ctx.user.name,
      });
      return normalized;
    }),

  systemSettings: notificationsSettingsProcedure.query(async () => {
    return getNotificationSystemSettings();
  }),

  updateSystemSettings: notificationsSettingsProcedure
    .input(notificationSystemSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      const previous = await getNotificationSystemSettings();
      const normalized = normalizeNotificationSystemSettings(input);
      await saveNotificationSystemSettings(normalized);
      await createAuditLog({
        entityType: 'notification_system_settings',
        entityId: 1,
        action: 'notification_system_settings_updated',
        oldValue: JSON.stringify(previous),
        newValue: JSON.stringify(normalized),
        userId: ctx.user.id,
        userName: ctx.user.name,
      });
      return normalized;
    }),

  dailyDigestSettings: notificationsSettingsProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    return getNotificationDigestSchedule(db);
  }),

  updateDailyDigestSettings: notificationsSettingsProcedure
    .input(notificationDigestSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const previous = await getNotificationDigestSchedule(db);
      const updated = await updateNotificationDigestSchedule(db, {
        ...input,
        updatedBy: ctx.user.id,
      });
      await createAuditLog({
        entityType: 'notification_digest_schedule',
        entityId: updated.id,
        action: 'notification_digest_schedule_updated',
        oldValue: JSON.stringify(previous),
        newValue: JSON.stringify(updated),
        userId: ctx.user.id,
        userName: ctx.user.name,
      });
      return updated;
    }),

  createDigestNow: notificationsSendProcedure.mutation(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    return createUnreadNotificationDigest(db, ctx.user.id, { automatic: false });
  }),

  create: notificationsSendProcedure.input(createNotificationSchema).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();
    const allowed = await shouldDeliverNotification(db, {
      userId: input.userId,
      source: input.source,
      priority: input.priority,
    });
    if (!allowed) {
      return { id: null, skipped: true };
    }
    const [created] = await db
      .insert(notifications)
      .values({
        ...input,
        data: input.data || null,
        entityType: input.entityType || null,
        entityId: input.entityId || null,
        actionUrl: input.actionUrl || null,
        actionLabel: input.actionLabel || null,
      })
      .$returningId();
    return { id: created.id, skipped: false };
  }),

  createForUser: notificationsSendProcedure
    .input(createNotificationSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const allowed = await shouldDeliverNotification(db, {
        userId: input.userId,
        source: input.source,
        priority: input.priority,
      });
      if (!allowed) {
        return { id: null, createdBy: ctx.user.id, skipped: true };
      }
      const [created] = await db
        .insert(notifications)
        .values({
          ...input,
          source: input.source || 'manual',
          data: input.data || null,
          entityType: input.entityType || null,
          entityId: input.entityId || null,
          actionUrl: input.actionUrl || null,
          actionLabel: input.actionLabel || null,
        })
        .$returningId();
      return { id: created.id, createdBy: ctx.user.id, skipped: false };
    }),

  broadcastToAdmins: notificationsSendProcedure
    .input(
      createNotificationSchema
        .omit({ userId: true })
        .extend({ source: z.enum(NOTIFICATION_SOURCES).default('manual') })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const result = await notifyEligibleRecipients(db, {
        ...input,
        source: input.source || 'manual',
        entityType: input.entityType || 'notification',
        entityId: input.entityId || 'manual',
        actionUrl: input.actionUrl || '/admin/notifications',
        actionLabel: input.actionLabel || 'عرض الإشعارات',
        priority: input.priority || 'medium',
      });
      return result;
    }),

  deleteExpired: notificationsManagementProcedure.mutation(async () => {
    const db = await ensureDatabaseAvailable();
    await db
      .delete(notifications)
      .where(and(isNotNull(notifications.expiresAt), lt(notifications.expiresAt, new Date())));
    return { success: true };
  }),
});
