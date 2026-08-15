/**
 * Notifications Router
 * Router لإدارة الإشعارات
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { notifications } from '../../drizzle/schema';
import { eq, and, desc, lt, isNull } from 'drizzle-orm';
import { protectedProcedure, router } from '../_core/trpc';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { createLogger } from '../_core/logger';

const logger = createLogger('notifications');

/**
 * Schema لإنشاء إشعار جديد
 */
const createNotificationSchema = z.object({
  userId: z.number(),
  type: z.enum([
    'approval_requested',
    'approval_approved',
    'approval_rejected',
    'content_updated',
    'content_deleted',
    'content_published',
    'system',
  ]),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  data: z.string().optional(), // JSON string
  actionUrl: z.string().url().optional().or(z.literal('')),
  actionLabel: z.string().max(100).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  expiresAt: z.date().optional(),
});

/**
 * Schema لتحديث إشعار
 */
const updateNotificationSchema = z.object({
  id: z.number(),
  isRead: z.enum(['yes', 'no']).optional(),
  readAt: z.date().optional(),
  actionUrl: z.string().url().optional().or(z.literal('')),
  actionLabel: z.string().max(100).optional(),
});

/**
 * Schema لفلترة الإشعارات
 */
const notificationFilterSchema = z.object({
  type: z
    .enum([
      'approval_requested',
      'approval_approved',
      'approval_rejected',
      'content_updated',
      'content_deleted',
      'content_published',
      'system',
    ])
    .optional(),
  isRead: z.enum(['yes', 'no']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const notificationsRouter = router({
  /**
   * الحصول على جميع الإشعارات للمستخدم الحالي
   */
  list: protectedProcedure
    .input(notificationFilterSchema.optional())
    .query(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const userId = ctx.user.id;
      const filters = input || { limit: 20, offset: 0 };

      // بناء شروط الفلترة
      const conditions = [eq(notifications.userId, userId)];

      if (filters.type) {
        conditions.push(eq(notifications.type, filters.type));
      }

      if (filters.isRead) {
        conditions.push(eq(notifications.isRead, filters.isRead));
      }

      if (filters.priority) {
        conditions.push(eq(notifications.priority, filters.priority));
      }

      // الحصول على الإشعارات
      const data = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(filters.limit)
        .offset(filters.offset);

      // الحصول على العدد الكلي
      const totalResult = await db
        .select({ count: notifications.id })
        .from(notifications)
        .where(and(...conditions));

      const total = totalResult.length;

      return {
        data,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total,
          hasMore: filters.offset + filters.limit < total,
        },
      };
    }),

  /**
   * الحصول على إشعار محدد
   */
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    const notification = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)))
      .limit(1);

    if (!notification[0]) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'الإشعار غير موجود',
      });
    }

    return notification[0];
  }),

  /**
   * الحصول على الإشعارات غير المقروءة
   */
  getUnread: protectedProcedure.query(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    const unread = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, 'no')))
      .orderBy(desc(notifications.createdAt));

    return unread;
  }),

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, 'no')));

    return result.length;
  }),

  /**
   * إنشاء إشعار جديد
   */
  create: protectedProcedure.input(createNotificationSchema).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();
    const [notification] = await db
      .insert(notifications)
      .values({
        ...input,
        actionUrl: input.actionUrl || null,
        actionLabel: input.actionLabel || null,
      })
      .$returningId();

    return notification.id;
  }),

  /**
   * تحديث إشعار
   */
  update: protectedProcedure.input(updateNotificationSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    // التحقق من أن الإشعار يخص المستخدم الحالي
    const existing = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)))
      .limit(1);

    if (!existing[0]) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'الإشعار غير موجود',
      });
    }

    // تحديث الإشعار
    const updateData: any = {};
    if (input.isRead !== undefined) {
      updateData.isRead = input.isRead;
      if (input.isRead === 'yes' && !input.readAt) {
        updateData.readAt = new Date();
      }
    }
    if (input.actionUrl !== undefined) {
      updateData.actionUrl = input.actionUrl || null;
    }
    if (input.actionLabel !== undefined) {
      updateData.actionLabel = input.actionLabel || null;
    }

    await db.update(notifications).set(updateData).where(eq(notifications.id, input.id));

    return { success: true };
  }),

  /**
   * تحديد إشعار كمقروء
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      // التحقق من أن الإشعار يخص المستخدم الحالي
      const existing = await db
        .select()
        .from(notifications)
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'الإشعار غير موجود',
        });
      }

      await db
        .update(notifications)
        .set({
          isRead: 'yes',
          readAt: new Date(),
        })
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    await db
      .update(notifications)
      .set({
        isRead: 'yes',
        readAt: new Date(),
      })
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, 'no')));

    return { success: true };
  }),

  /**
   * حذف إشعار
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      // التحقق من أن الإشعار يخص المستخدم الحالي
      const existing = await db
        .select()
        .from(notifications)
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'الإشعار غير موجود',
        });
      }

      await db.delete(notifications).where(eq(notifications.id, input.id));

      return { success: true };
    }),

  /**
   * حذف جميع الإشعارات المقروءة
   */
  deleteRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    await db
      .delete(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, 'yes')));

    return { success: true };
  }),

  /**
   * حذف الإشعارات المنتهية الصلاحية
   */
  deleteExpired: protectedProcedure.mutation(async () => {
    const db = await ensureDatabaseAvailable();
    await db
      .delete(notifications)
      .where(and(isNull(notifications.expiresAt), lt(notifications.expiresAt, new Date())));

    return { success: true };
  }),

  /**
   * إنشاء إشعار لمستخدم محدد (للاستخدام الداخلي)
   */
  createForUser: protectedProcedure.input(createNotificationSchema).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();
    const [notification] = await db
      .insert(notifications)
      .values({
        ...input,
        actionUrl: input.actionUrl || null,
        actionLabel: input.actionLabel || null,
      })
      .$returningId();

    return notification.id;
  }),
});
