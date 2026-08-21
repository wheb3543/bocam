/**
 * Content Approvals Router
 * Router لإدارة موافقات المحتوى
 *
 * يسمح بطلب الموافقة على التغييرات في المحتوى
 * ومراجعة وموافقة أو رفض هذه التغييرات
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  contentApprovals,
  contentAuditLog,
  contentVersions,
  images,
  media,
  pages,
  sections,
  textContent,
  users,
} from '../../../drizzle/schema';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import { adminProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { createLogger } from '../../_core/logger';
import {
  contentEditProcedure,
  contentReadProcedure,
  contentReviewProcedure,
} from './authorization';
import {
  createApprovalRequestedNotification,
  createApprovalApprovedNotification,
  createApprovalRejectedNotification,
} from '../../_core/notificationHelper';
import { invalidateImagesCache, invalidateTextContentCache } from '../public/content';
import { invalidateAdminTextContentCache } from './textContent';
import { invalidateAdminPagesCache } from './pages';
import { invalidateAdminSectionsCache } from './sections';

const logger = createLogger('approvals');

/**
 * Schema لطلب موافقة جديد
 */
const createApprovalSchema = z.object({
  entityType: z.enum(['textContent', 'image', 'media', 'page', 'section']),
  entityId: z.number(),
  entityTypeVersion: z.number().default(0),
  changes: z.string(), // JSON string
  assignedReviewerId: z.number().nullable().optional(),
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
  status: z.enum(['rejected']),
  rejectionReason: z.string().optional(),
});

const assignReviewerSchema = z.object({
  id: z.number(),
  assignedReviewerId: z.number().nullable(),
});

const approvalChangesSchema = z
  .object({
    changes: z.record(z.string(), z.unknown()).optional(),
    data: z.record(z.string(), z.unknown()).optional(),
    patch: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const textContentChangeSchema = z
  .object({
    key: z.string().min(1).max(255).optional(),
    language: z.string().min(1).max(10).optional(),
    content: z.string().min(1).optional(),
    section: z.string().max(100).nullable().optional(),
    sectionId: z.number().int().nullable().optional(),
    pageId: z.number().int().nullable().optional(),
    type: z
      .enum([
        'title',
        'subtitle',
        'description',
        'text',
        'button',
        'link',
        'label',
        'placeholder',
        'error',
        'success',
        'warning',
        'info',
      ])
      .optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    isActive: z.enum(['yes', 'no']).optional(),
    publishedAt: z.coerce.date().nullable().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'لا تحتوي حمولة الموافقة على تغييرات قابلة للتطبيق'
  );

const imageChangeSchema = z
  .object({
    key: z.string().min(1).max(255).optional(),
    url: z.string().min(1).max(500).optional(),
    altAr: z.string().nullable().optional(),
    altEn: z.string().nullable().optional(),
    section: z.string().max(100).nullable().optional(),
    sectionId: z.number().int().nullable().optional(),
    pageId: z.number().int().nullable().optional(),
    width: z.number().int().positive().nullable().optional(),
    height: z.number().int().positive().nullable().optional(),
    format: z.string().max(10).nullable().optional(),
    size: z.number().int().nonnegative().nullable().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    isActive: z.enum(['yes', 'no']).optional(),
    publishedAt: z.coerce.date().nullable().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'لا تحتوي حمولة الموافقة على تغييرات قابلة للتطبيق'
  );

const mediaChangeSchema = imageChangeSchema.extend({
  type: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
  mimeType: z.string().max(100).nullable().optional(),
  fileName: z.string().max(255).nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  folderId: z.number().int().nullable().optional(),
  duration: z.number().int().nonnegative().nullable().optional(),
  thumbnailUrl: z.string().max(500).nullable().optional(),
});

const pageChangeSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    slug: z.string().min(1).max(255).optional(),
    type: z.enum(['main', 'sub']).optional(),
    parentId: z.number().int().nullable().optional(),
    titleAr: z.string().min(1).max(255).optional(),
    titleEn: z.string().min(1).max(255).optional(),
    metaTitleAr: z.string().max(255).nullable().optional(),
    metaTitleEn: z.string().max(255).nullable().optional(),
    metaDescriptionAr: z.string().nullable().optional(),
    metaDescriptionEn: z.string().nullable().optional(),
    keywordsAr: z.string().nullable().optional(),
    keywordsEn: z.string().nullable().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    isActive: z.enum(['yes', 'no']).optional(),
    sortOrder: z.number().int().min(0).optional(),
    publishedAt: z.coerce.date().nullable().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'لا تحتوي حمولة الموافقة على تغييرات قابلة للتطبيق'
  );

const sectionChangeSchema = z
  .object({
    pageId: z.number().int().positive().optional(),
    name: z.string().min(1).max(255).optional(),
    titleAr: z.string().max(255).nullable().optional(),
    titleEn: z.string().max(255).nullable().optional(),
    subtitleAr: z.string().max(255).nullable().optional(),
    subtitleEn: z.string().max(255).nullable().optional(),
    type: z
      .enum([
        'slider',
        'text',
        'text-cards',
        'stats-cards',
        'image-cards',
        'image',
        'video',
        'hero',
        'cta',
        'features',
        'testimonials',
        'faq',
        'contact',
        'pricing',
        'team',
        'gallery',
        'timeline',
        'custom',
      ])
      .optional(),
    settings: z.string().nullable().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.enum(['yes', 'no']).optional(),
    publishedAt: z.coerce.date().nullable().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'لا تحتوي حمولة الموافقة على تغييرات قابلة للتطبيق'
  );

function parseApprovalChanges(serializedChanges: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(serializedChanges);
  } catch {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'تعذر قراءة حمولة التغييرات في طلب الموافقة.',
    });
  }

  const envelope = approvalChangesSchema.safeParse(parsed);
  if (!envelope.success) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'حمولة التغييرات غير صالحة أو تحتوي على بنية غير مدعومة.',
    });
  }

  return envelope.data.changes ?? envelope.data.data ?? envelope.data.patch ?? envelope.data;
}

function parseEntityChanges<T extends z.ZodType>(
  schema: T,
  serializedChanges: string
): z.output<T> {
  const result = schema.safeParse(parseApprovalChanges(serializedChanges));
  if (!result.success) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `تعذر تطبيق التغييرات المعتمدة: ${result.error.issues[0]?.message ?? 'بيانات غير صالحة'}`,
    });
  }
  return result.data;
}

const reviewerRoles = ['admin', 'manager', 'team_leader'] as const;

export const approvalsRouter = router({
  /**
   * الحصول على جميع طلبات الموافقة
   */
  list: contentReadProcedure
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
  getById: contentReadProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
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
  create: contentEditProcedure.input(createApprovalSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    if (input.assignedReviewerId) {
      const [assignedReviewer] = await db
        .select({ id: users.id, role: users.role, isActive: users.isActive })
        .from(users)
        .where(eq(users.id, input.assignedReviewerId))
        .limit(1);

      if (
        !assignedReviewer ||
        assignedReviewer.isActive !== 'yes' ||
        !reviewerRoles.includes(assignedReviewer.role as (typeof reviewerRoles)[number])
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'المستخدم المحدد لا يملك صلاحية مراجعة المحتوى أو حسابه غير نشط.',
        });
      }
    }

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

    const reviewers = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(inArray(users.role, ['admin', 'manager', 'team_leader']), eq(users.isActive, 'yes'))
      );

    await Promise.all(
      reviewers
        .filter(
          (reviewer) =>
            reviewer.id !== ctx.user.id &&
            (!input.assignedReviewerId || reviewer.id === input.assignedReviewerId)
        )
        .map((reviewer) =>
          createApprovalRequestedNotification(db, {
            userId: reviewer.id,
            entityType: input.entityType,
            entityId: input.entityId,
            entityName: `Entity ${input.entityId}`,
          })
        )
    );

    return newApproval[0];
  }),

  /**
   * قائمة المراجعين الذين يمكن تعيينهم لطلبات المحتوى.
   */
  getEligibleReviewers: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    return db
      .select({ id: users.id, name: users.name, role: users.role })
      .from(users)
      .where(and(inArray(users.role, [...reviewerRoles]), eq(users.isActive, 'yes')))
      .orderBy(asc(users.name));
  }),

  /**
   * تعيين مراجع محدد أو إزالة التعيين من طلب معلق.
   */
  assignReviewer: contentReviewProcedure
    .input(assignReviewerSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [approval] = await db
        .select({ id: contentApprovals.id, status: contentApprovals.status })
        .from(contentApprovals)
        .where(eq(contentApprovals.id, input.id))
        .limit(1);

      if (!approval) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'طلب الموافقة غير موجود.' });
      }
      if (approval.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'لا يمكن تغيير المراجع بعد حسم طلب الموافقة.',
        });
      }

      if (input.assignedReviewerId) {
        const [reviewer] = await db
          .select({ id: users.id, role: users.role, isActive: users.isActive })
          .from(users)
          .where(eq(users.id, input.assignedReviewerId))
          .limit(1);

        if (
          !reviewer ||
          reviewer.isActive !== 'yes' ||
          !reviewerRoles.includes(reviewer.role as (typeof reviewerRoles)[number])
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'المستخدم المحدد لا يملك صلاحية مراجعة المحتوى أو حسابه غير نشط.',
          });
        }
      }

      await db
        .update(contentApprovals)
        .set({ assignedReviewerId: input.assignedReviewerId })
        .where(eq(contentApprovals.id, input.id));

      logger.info(`Content approval ${input.id} reviewer assigned by user ${ctx.user.id}`);
      return { success: true, id: input.id, assignedReviewerId: input.assignedReviewerId };
    }),

  /**
   * الموافقة على طلب
   */
  approve: contentReviewProcedure.input(approveApprovalSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    const { approval, entityType, approvedAt } = await db.transaction(async (tx) => {
      const [pendingApproval] = await tx
        .select()
        .from(contentApprovals)
        .where(eq(contentApprovals.id, input.id))
        .limit(1);

      if (!pendingApproval) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'طلب الموافقة غير موجود.' });
      }
      if (pendingApproval.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'يمكن الموافقة فقط على الطلبات المعلقة.',
        });
      }
      if (
        pendingApproval.assignedReviewerId !== null &&
        pendingApproval.assignedReviewerId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'هذا الطلب معيّن لمراجع آخر ولا يمكن اعتماده من حسابك.',
        });
      }

      let previousEntity: unknown;
      let approvedChanges: unknown;
      let auditEntityType: 'text' | 'image' | 'page' | 'section';
      let versionEntityType: 'text' | 'image' | null = null;
      let applyChanges: () => Promise<unknown>;

      if (pendingApproval.entityType === 'textContent') {
        const changes = parseEntityChanges(textContentChangeSchema, pendingApproval.changes);
        const [existing] = await tx
          .select()
          .from(textContent)
          .where(eq(textContent.id, pendingApproval.entityId))
          .limit(1);
        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'المحتوى النصي المطلوب لم يعد موجوداً.',
          });
        }
        previousEntity = existing;
        approvedChanges = changes;
        auditEntityType = 'text';
        versionEntityType = 'text';
        applyChanges = () =>
          tx.update(textContent).set(changes).where(eq(textContent.id, pendingApproval.entityId));
      } else if (pendingApproval.entityType === 'image') {
        const changes = parseEntityChanges(imageChangeSchema, pendingApproval.changes);
        const [existing] = await tx
          .select()
          .from(images)
          .where(eq(images.id, pendingApproval.entityId))
          .limit(1);
        if (!existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'الصورة المطلوبة لم تعد موجودة.' });
        }
        previousEntity = existing;
        approvedChanges = changes;
        auditEntityType = 'image';
        versionEntityType = 'image';
        applyChanges = () =>
          tx.update(images).set(changes).where(eq(images.id, pendingApproval.entityId));
      } else if (pendingApproval.entityType === 'media') {
        const changes = parseEntityChanges(mediaChangeSchema, pendingApproval.changes);
        const [existing] = await tx
          .select()
          .from(media)
          .where(eq(media.id, pendingApproval.entityId))
          .limit(1);
        if (!existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'الوسيط المطلوب لم يعد موجوداً.' });
        }
        previousEntity = existing;
        approvedChanges = changes;
        auditEntityType = 'image';
        applyChanges = () =>
          tx.update(media).set(changes).where(eq(media.id, pendingApproval.entityId));
      } else if (pendingApproval.entityType === 'page') {
        const changes = parseEntityChanges(pageChangeSchema, pendingApproval.changes);
        const [existing] = await tx
          .select()
          .from(pages)
          .where(eq(pages.id, pendingApproval.entityId))
          .limit(1);
        if (!existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'الصفحة المطلوبة لم تعد موجودة.' });
        }
        previousEntity = existing;
        approvedChanges = changes;
        auditEntityType = 'page';
        applyChanges = () =>
          tx.update(pages).set(changes).where(eq(pages.id, pendingApproval.entityId));
      } else {
        const changes = parseEntityChanges(sectionChangeSchema, pendingApproval.changes);
        const [existing] = await tx
          .select()
          .from(sections)
          .where(eq(sections.id, pendingApproval.entityId))
          .limit(1);
        if (!existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'القسم المطلوب لم يعد موجوداً.' });
        }
        previousEntity = existing;
        approvedChanges = changes;
        auditEntityType = 'section';
        applyChanges = () =>
          tx.update(sections).set(changes).where(eq(sections.id, pendingApproval.entityId));
      }

      if (versionEntityType) {
        await tx.insert(contentVersions).values({
          entityType: versionEntityType,
          entityId: pendingApproval.entityId,
          versionNumber: Math.max(1, pendingApproval.entityTypeVersion),
          data: JSON.stringify(previousEntity),
          userId: ctx.user.id,
          reason: `نسخة أمان قبل تطبيق طلب الموافقة #${pendingApproval.id}`,
        });
      }

      await applyChanges();
      await tx.insert(contentAuditLog).values({
        entityType: auditEntityType,
        entityId: pendingApproval.entityId,
        action: 'update',
        oldValue: JSON.stringify(previousEntity),
        newValue: JSON.stringify(approvedChanges),
        userId: ctx.user.id,
        reason: `تطبيق طلب الموافقة #${pendingApproval.id}`,
      });

      const approvedAt = new Date();
      await tx
        .update(contentApprovals)
        .set({ status: 'approved', approvedBy: ctx.user.id, approvedAt })
        .where(and(eq(contentApprovals.id, input.id), eq(contentApprovals.status, 'pending')));

      return { approval: pendingApproval, entityType: pendingApproval.entityType, approvedAt };
    });

    if (entityType === 'textContent') {
      await invalidateAdminTextContentCache();
      invalidateTextContentCache();
    }
    if (entityType === 'image') {
      invalidateImagesCache();
    }
    if (entityType === 'page') {
      await invalidateAdminPagesCache();
    }
    if (entityType === 'section') {
      await invalidateAdminSectionsCache();
    }

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

    return { ...approval, status: 'approved' as const, approvedBy: ctx.user.id, approvedAt };
  }),

  /**
   * رفض طلب
   */
  reject: contentReviewProcedure.input(rejectApprovalSchema).mutation(async ({ input, ctx }) => {
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
    if (approval.assignedReviewerId !== null && approval.assignedReviewerId !== ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'هذا الطلب معيّن لمراجع آخر ولا يمكن رفضه من حسابك.',
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
  updateStatus: contentReviewProcedure
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

      if (approval.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'يمكن تحديث حالة الطلبات المعلقة فقط.',
        });
      }
      if (approval.assignedReviewerId !== null && approval.assignedReviewerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'هذا الطلب معيّن لمراجع آخر ولا يمكن رفضه من حسابك.',
        });
      }

      const updateData: any = {
        status: input.status,
        rejectedBy: ctx.user.id,
        rejectedAt: new Date(),
        rejectionReason: input.rejectionReason || null,
      };

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
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.delete(contentApprovals).where(eq(contentApprovals.id, input.id));

    logger.info(`Content approval ${input.id} deleted`);

    return { id: input.id };
  }),

  /**
   * الحصول على طلبات الموافقة المعلقة
   */
  getPending: contentReviewProcedure
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
  getMyApprovals: contentReadProcedure
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
