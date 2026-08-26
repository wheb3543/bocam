import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router } from '../_core/trpc';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import {
  assignSocialInboxThread,
  createSocialInboxAccount,
  getSocialInboxCommentActionTarget,
  getSocialInboxStats,
  listSocialInboxCommentContexts,
  getSocialInboxThreadById,
  listSocialInboxAccounts,
  listSocialInboxThreads,
  markSocialInboxThreadRead,
  setSocialInboxThreadStarred,
  updateSocialInboxCommentEnrichment,
  updateSocialInboxCommentMetadata,
  updateSocialInboxCommentWorkflow,
  updateSocialInboxAccount,
} from '../database/db';
import { notifySocialInboxAssignment } from '../services/communicationNotificationService';
import { getMetaWebhookCredentials } from '../database/db/metaIntegrationSettings';
import { clearMetaSocialInboxTestData } from '../database/db/socialInbox';
import {
  enrichMetaCommentContext,
  replyToMetaComment,
  sendMetaCommentPrivateReply,
  setMetaCommentHidden,
} from '../integrations/meta/socialInboxMetaActions';
import { seedMetaSocialInboxTestData } from '../integrations/meta/seedMetaSocialInboxTestData';
import { permissionProcedure } from './permissionProcedures';

const platformSchema = z.enum(['messenger', 'instagram', 'facebook', 'x', 'linkedin', 'youtube']);
const channelTypeSchema = z.enum(['message', 'comment']);
const commentActionInput = z.object({
  threadId: z.number().int().positive(),
  itemId: z.number().int().positive(),
});
const socialInboxViewProcedure = permissionProcedure(
  'communications.view',
  'عرض صندوق البريد الموحد'
);
const socialInboxReplyProcedure = permissionProcedure(
  'communications.reply',
  'الرد على رسائل وتعليقات الصندوق الموحد'
);
const socialInboxAssignProcedure = permissionProcedure(
  'communications.assign',
  'إسناد محادثات وتعليقات الصندوق الموحد'
);
const socialInboxManagementProcedure = permissionProcedure(
  'communications.manage',
  'إدارة إعدادات صندوق البريد الموحد'
);

const socialInboxAdminProcedure = socialInboxManagementProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'إدارة بيانات اختبار Meta متاحة للمسؤول فقط',
    });
  }

  return next();
});

export const socialInboxRouter = router({
  accounts: socialInboxViewProcedure.query(() => listSocialInboxAccounts()),

  createAccount: socialInboxManagementProcedure
    .input(
      z.object({
        platform: platformSchema,
        accountType: z.enum(['page', 'profile', 'business', 'channel']).default('profile'),
        displayName: z.string().trim().min(1).max(255),
        externalAccountId: z.string().trim().min(1).max(255),
        status: z.enum(['disconnected', 'pending', 'connected', 'error']).default('pending'),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) =>
      createSocialInboxAccount({
        ...input,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      })
    ),

  updateAccount: socialInboxManagementProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        displayName: z.string().trim().min(1).max(255).optional(),
        status: z.enum(['disconnected', 'pending', 'connected', 'error']).optional(),
        externalAccountId: z.string().trim().min(1).max(255).optional(),
        lastSyncedAt: z.coerce.date().nullable().optional(),
        lastError: z.string().max(10000).nullable().optional(),
        metadata: z.record(z.string(), z.unknown()).nullable().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, metadata, ...patch } = input;
      return updateSocialInboxAccount(id, {
        ...patch,
        metadata: metadata === undefined ? undefined : metadata ? JSON.stringify(metadata) : null,
      });
    }),

  stats: socialInboxViewProcedure.query(() => getSocialInboxStats()),

  threads: socialInboxViewProcedure
    .input(
      z
        .object({
          platform: platformSchema.optional(),
          channelType: channelTypeSchema.optional(),
          search: z.string().trim().max(100).optional(),
          unreadOnly: z.boolean().optional(),
        })
        .optional()
    )
    .query(({ input }) => listSocialInboxThreads(input ?? {})),

  commentContexts: socialInboxViewProcedure
    .input(
      z
        .object({
          platform: z.enum(['facebook', 'instagram']).optional(),
          search: z.string().trim().max(100).optional(),
          unreadOnly: z.boolean().optional(),
          followUpOnly: z.boolean().optional(),
        })
        .optional()
    )
    .query(({ input }) => listSocialInboxCommentContexts(input ?? {})),

  thread: socialInboxViewProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ input }) => getSocialInboxThreadById(input.id)),

  markRead: socialInboxViewProcedure
    .input(z.object({ id: z.number().int().positive(), isRead: z.boolean() }))
    .mutation(({ input }) => markSocialInboxThreadRead(input.id, input.isRead)),

  setStarred: socialInboxViewProcedure
    .input(z.object({ id: z.number().int().positive(), isStarred: z.boolean() }))
    .mutation(({ input }) => setSocialInboxThreadStarred(input.id, input.isStarred)),

  assign: socialInboxAssignProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        assignedToUserId: z.number().int().positive().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const context = await getSocialInboxThreadById(input.id);
      if (!context) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة غير موجودة' });
      }

      const result = await assignSocialInboxThread(input.id, input.assignedToUserId);
      if (input.assignedToUserId && context.thread.assignedToUserId !== input.assignedToUserId) {
        const db = await ensureDatabaseAvailable();
        void notifySocialInboxAssignment(db, {
          threadId: input.id,
          channelType: context.thread.channelType,
          assignedUserId: input.assignedToUserId,
          actorUserId: ctx.user.id,
        }).catch(() => undefined);
      }
      return result;
    }),

  updateCommentWorkflow: socialInboxAssignProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        isFollowUpRequired: z.boolean().optional(),
        assignedToUserId: z.number().int().positive().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const context = await getSocialInboxThreadById(input.id);
      if (!context) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'سياق التعليق غير موجود' });
      }
      const { id, ...patch } = input;
      const result = await updateSocialInboxCommentWorkflow(id, patch);
      if (patch.assignedToUserId && context.thread.assignedToUserId !== patch.assignedToUserId) {
        const db = await ensureDatabaseAvailable();
        void notifySocialInboxAssignment(db, {
          threadId: id,
          channelType: 'comment',
          assignedUserId: patch.assignedToUserId,
          actorUserId: ctx.user.id,
        }).catch(() => undefined);
      }
      return result;
    }),

  replyToComment: socialInboxReplyProcedure
    .input(commentActionInput.extend({ message: z.string().trim().min(1).max(1000) }))
    .mutation(async ({ input }) => {
      const target = await getSocialInboxCommentActionTarget(input.threadId, input.itemId);
      const credentials = await getMetaWebhookCredentials();
      if (!credentials?.pageAccessToken) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'يلزم تفعيل Page Access Token في إعدادات Meta',
        });
      }
      return replyToMetaComment(
        {
          platform: target.thread.platform as 'facebook' | 'instagram',
          accountExternalId: target.account.externalAccountId,
          commentExternalId: target.item.externalItemId,
          sourceExternalId:
            (target.commentContext as { sourceExternalId?: string } | null)?.sourceExternalId ??
            target.thread.externalThreadId,
          occurredAt: target.item.externalPublishedAt,
        },
        input.message,
        credentials.pageAccessToken
      );
    }),

  setCommentHidden: socialInboxReplyProcedure
    .input(commentActionInput.extend({ isHidden: z.boolean() }))
    .mutation(async ({ input }) => {
      const target = await getSocialInboxCommentActionTarget(input.threadId, input.itemId);
      const credentials = await getMetaWebhookCredentials();
      if (!credentials?.pageAccessToken) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'يلزم تفعيل Page Access Token في إعدادات Meta',
        });
      }
      const result = await setMetaCommentHidden(
        {
          platform: target.thread.platform as 'facebook' | 'instagram',
          accountExternalId: target.account.externalAccountId,
          commentExternalId: target.item.externalItemId,
          sourceExternalId:
            (target.commentContext as { sourceExternalId?: string } | null)?.sourceExternalId ??
            target.thread.externalThreadId,
          occurredAt: target.item.externalPublishedAt,
        },
        input.isHidden,
        credentials.pageAccessToken
      );
      await updateSocialInboxCommentMetadata(input.itemId, {
        ...(target.commentMetadata as Record<string, unknown> | null),
        isHidden: input.isHidden,
      });
      return result;
    }),

  sendCommentPrivateReply: socialInboxReplyProcedure
    .input(commentActionInput.extend({ message: z.string().trim().min(1).max(1000) }))
    .mutation(async ({ input }) => {
      const target = await getSocialInboxCommentActionTarget(input.threadId, input.itemId);
      const capabilities = target.commentMetadata as { canReplyPrivately?: boolean } | null;
      if (capabilities?.canReplyPrivately === false) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Meta لا تسمح برد خاص على هذا التعليق',
        });
      }
      const credentials = await getMetaWebhookCredentials();
      if (!credentials?.pageAccessToken) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'يلزم تفعيل Page Access Token في إعدادات Meta',
        });
      }
      return sendMetaCommentPrivateReply(
        {
          platform: target.thread.platform as 'facebook' | 'instagram',
          accountExternalId: target.account.externalAccountId,
          commentExternalId: target.item.externalItemId,
          sourceExternalId:
            (target.commentContext as { sourceExternalId?: string } | null)?.sourceExternalId ??
            target.thread.externalThreadId,
          occurredAt: target.item.externalPublishedAt,
        },
        input.message,
        credentials.pageAccessToken
      );
    }),

  enrichCommentContext: socialInboxManagementProcedure
    .input(commentActionInput)
    .mutation(async ({ input }) => {
      const target = await getSocialInboxCommentActionTarget(input.threadId, input.itemId);
      const credentials = await getMetaWebhookCredentials();
      if (!credentials?.pageAccessToken) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'يلزم تفعيل Page Access Token في إعدادات Meta',
        });
      }
      const result = await enrichMetaCommentContext(
        {
          platform: target.thread.platform as 'facebook' | 'instagram',
          accountExternalId: target.account.externalAccountId,
          commentExternalId: target.item.externalItemId,
          sourceExternalId:
            (target.commentContext as { sourceExternalId?: string } | null)?.sourceExternalId ??
            target.thread.externalThreadId,
          occurredAt: target.item.externalPublishedAt,
        },
        credentials.pageAccessToken
      );
      await Promise.all([
        updateSocialInboxCommentEnrichment(input.threadId, {
          postUrl: result.context.sourceUrl,
          commentContext: result.context,
        }),
        updateSocialInboxCommentMetadata(input.itemId, result.commentMetadata),
      ]);
      return { success: true, context: result.context };
    }),

  seedMetaTestData: socialInboxAdminProcedure.mutation(() => seedMetaSocialInboxTestData()),

  clearMetaTestData: socialInboxAdminProcedure.mutation(() => clearMetaSocialInboxTestData()),
});
