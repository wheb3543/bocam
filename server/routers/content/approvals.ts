/**
 * Content Approvals Router
 * Router لإدارة موافقات المحتوى
 *
 * يسمح بطلب الموافقة على التغييرات في المحتوى
 * ومراجعة وموافقة أو رفض هذه التغييرات
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { contentApprovals } from '../../../drizzle/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { createLogger } from '../../_core/logger';
import {
  createApprovalRequestedNotification,
  createApprovalApprovedNotification,
  createApprovalRejectedNotification,
} from '../../_core/notificationHelper';

const logger = createLogger('approvals');

/**
 * Schema لطلب موافقة جديد
 */
const createApprovalSchema = z.object({
  entityType: z.enum(['textContent', 'image', 'media', 'page', 'section']),
  entityId: z.number(),
  entityTypeVersion: z.number().default(0),
  changes: z.string(), // JSON string
});

/**
 * Schema للموافقة على طلب
 */
const approveApprovalSchema = z.object({
  id: z.number(),
});

/**
 * Schema لرفض طلب
 */
const rejectApprovalSchema = z.object({
  id: z.number(),
  rejectionReason: z.string().optional(),
});

/**
 * Schema لتحديث حالة الموافقة
 */
const updateApprovalStatusSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'approved', 'rejected']),
  rejectionReason: z.string().optional(),
});

export const approvalsRouter = router({
  /**
   * الحصول على جميع طلبات الموافقة
   */
  list: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['textContent', 'image', 'media', 'page', 'section']).optional(),
        entityId: z.number().optional(),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        requestedBy: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [];

      if (input.entityType) {
        conditions.push(eq(contentApprovals.entityType, input.entityType));
      }
      if (input.entityId) {
        conditions.push(eq(contentApprovals.entityId, input.entityId));
      }
      if (input.status) {
        conditions.push(eq(contentApprovals.status, input.status));
      }
      if (input.requestedBy) {
        conditions.push(eq(contentApprovals.requestedBy, input.requestedBy));
      }

      const approvals = await db
        .select()
        .from(contentApprovals)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(contentApprovals.requestedAt))
        .limit(input.limit)
        .offset(input.offset);

      // الحصول على العدد الكلي
      const [{ count }] = await db
        .select({ count: contentApprovals.id })
        .from(contentApprovals)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        data: approvals,
        pagination: {
          limit: input.limit,
          offset: input.offset,
          total: count,
          hasMore: input.offset + input.limit < count,
        },
      };
    }),

  /**
   * الحصول على طلب موافقة بواسطة المعرف
   */
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const approval = await db
      .select()
      .from(contentApprovals)
      .where(eq(contentApprovals.id, input.id))
      .limit(1);

    if (!approval || approval.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'طلب الموافقة غير موجود',
      });
    }

    return approval[0];
  }),

  /**
   * إنشاء طلب موافقة جديد
   */
  create: protectedProcedure.input(createApprovalSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    // التحقق من عدم وجود طلب موافقة معلق لنفس الكيان
    const existingApproval = await db
      .select()
      .from(contentApprovals)
      .where(
        and(
          eq(contentApprovals.entityType, input.entityType),
          eq(contentApprovals.entityId, input.entityId),
          eq(contentApprovals.status, 'pending')
        )
      )
      .limit(1);

    if (existingApproval && existingApproval.length > 0) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'يوجد طلب موافقة معلق لهذا الكيان بالفعل',
      });
    }

    const insertId = await db
      .insert(contentApprovals)
      .values({
        ...input,
        requestedBy: ctx.user.id,
      })
      .$returningId();

    const newApproval = await db
      .select()
      .from(contentApprovals)
      .where(eq(contentApprovals.id, insertId[0].id))
      .limit(1);

    logger.info(`Content approval request created: ${insertId[0].id} by user ${ctx.user.id}`);

    // إنشاء إشعار للمستخدمين المصرح لهم بالموافقة
    // TODO: الحصول على قائمة المستخدمين المصرح لهم بالموافقة
    // await createApprovalRequestedNotification(db, {
    //   userId: adminUserId,
    //   entityType: input.entityType,
    //   entityId: input.entityId,
    //   entityName: `Entity ${input.entityId}`,
    // });

    return newApproval[0];
  }),

  /**
   * الموافقة على طلب
   */
  approve: protectedProcedure.input(approveApprovalSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    const [approval] = await db
      .select()
      .from(contentApprovals)
      .where(eq(contentApprovals.id, input.id))
      .limit(1);

    if (!approval) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'طلب الموافقة غير موجود',
      });
    }

    if (approval.status !== 'pending') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'يمكن الموافقة فقط على الطلبات المعلقة',
      });
    }

    await db
      .update(contentApprovals)
      .set({
        status: 'approved',
        approvedBy: ctx.user.id,
        approvedAt: new Date(),
      })
      .where(eq(contentApprovals.id, input.id));

    const updatedApproval = await db
      .select()
      .from(contentApprovals)
      .where(eq(contentApprovals.id, input.id))
      .limit(1);

    logger.info(`Content approval ${input.id} approved by user ${ctx.user.id}`);

    // إنشاء إشعار للمستخدم الذي طلب الموافقة
    if (approval.requestedBy !== ctx.user.id) {
      await createApprovalApprovedNotification(db, {
        userId: approval.requestedBy,
        entityType: approval.entityType,
        entityId: approval.entityId,
        entityName: `Entity ${approval.entityId}`,
      });
    }

    return updatedApproval[0];
  }),

  /**
   * رفض طلب
   */
  reject: protectedProcedure.input(rejectApprovalSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    const [approval] = await db
      .select()
      .from(contentApprovals)
      .where(eq(contentApprovals.id, input.id))
      .limit(1);

    if (!approval) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'طلب الموافقة غير موجود',
      });
    }

    if (approval.status !== 'pending') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'يمكن رفض فقط الطلبات المعلقة',
      });
    }

    await db
      .update(contentApprovals)
      .set({
        status: 'rejected',
        rejectedBy: ctx.user.id,
        rejectedAt: new Date(),
        rejectionReason: input.rejectionReason || null,
      })
      .where(eq(contentApprovals.id, input.id));

    const updatedApproval = await db
      .select()
      .from(contentApprovals)
      .where(eq(contentApprovals.id, input.id))
      .limit(1);

    logger.info(`Content approval ${input.id} rejected by user ${ctx.user.id}`);

    // إنشاء إشعار للمستخدم الذي طلب الموافقة
    if (approval.requestedBy !== ctx.user.id) {
      await createApprovalRejectedNotification(db, {
        userId: approval.requestedBy,
        entityType: approval.entityType,
        entityId: approval.entityId,
        entityName: `Entity ${approval.entityId}`,
        rejectionReason: input.rejectionReason,
      });
    }

    return updatedApproval[0];
  }),

  /**
   * تحديث حالة الموافقة
   */
  updateStatus: protectedProcedure
    .input(updateApprovalStatusSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      const [approval] = await db
        .select()
        .from(contentApprovals)
        .where(eq(contentApprovals.id, input.id))
        .limit(1);

      if (!approval) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'طلب الموافقة غير موجود',
        });
      }

      const updateData: any = {
        status: input.status,
      };

      if (input.status === 'approved') {
        updateData.approvedBy = ctx.user.id;
        updateData.approvedAt = new Date();
      } else if (input.status === 'rejected') {
        updateData.rejectedBy = ctx.user.id;
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = input.rejectionReason || null;
      }

      await db.update(contentApprovals).set(updateData).where(eq(contentApprovals.id, input.id));

      const updatedApproval = await db
        .select()
        .from(contentApprovals)
        .where(eq(contentApprovals.id, input.id))
        .limit(1);

      logger.info(
        `Content approval ${input.id} status updated to ${input.status} by user ${ctx.user.id}`
      );

      return updatedApproval[0];
    }),

  /**
   * حذف طلب الموافقة
   */
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.delete(contentApprovals).where(eq(contentApprovals.id, input.id));

    logger.info(`Content approval ${input.id} deleted`);

    return { id: input.id };
  }),

  /**
   * الحصول على طلبات الموافقة المعلقة
   */
  getPending: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const approvals = await db
        .select()
        .from(contentApprovals)
        .where(eq(contentApprovals.status, 'pending'))
        .orderBy(asc(contentApprovals.requestedAt))
        .limit(input.limit)
        .offset(input.offset);

      // الحصول على العدد الكلي
      const [{ count }] = await db
        .select({ count: contentApprovals.id })
        .from(contentApprovals)
        .where(eq(contentApprovals.status, 'pending'));

      return {
        data: approvals,
        pagination: {
          limit: input.limit,
          offset: input.offset,
          total: count,
          hasMore: input.offset + input.limit < count,
        },
      };
    }),

  /**
   * الحصول على طلبات الموافقة للمستخدم الحالي
   */
  getMyApprovals: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [eq(contentApprovals.requestedBy, ctx.user.id)];

      if (input.status) {
        conditions.push(eq(contentApprovals.status, input.status));
      }

      const approvals = await db
        .select()
        .from(contentApprovals)
        .where(and(...conditions))
        .orderBy(desc(contentApprovals.requestedAt))
        .limit(input.limit)
        .offset(input.offset);

      // الحصول على العدد الكلي
      const [{ count }] = await db
        .select({ count: contentApprovals.id })
        .from(contentApprovals)
        .where(and(...conditions));

      return {
        data: approvals,
        pagination: {
          limit: input.limit,
          offset: input.offset,
          total: count,
          hasMore: input.offset + input.limit < count,
        },
      };
    }),
});
