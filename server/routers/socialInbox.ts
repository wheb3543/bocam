import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { canAccessSocialInbox } from '../../shared/socialInboxAccess';
import { protectedProcedure, router } from '../_core/trpc';
import {
  assignSocialInboxThread,
  createSocialInboxAccount,
  getSocialInboxStats,
  listSocialInboxCommentContexts,
  getSocialInboxThreadById,
  listSocialInboxAccounts,
  listSocialInboxThreads,
  markSocialInboxThreadRead,
  setSocialInboxThreadStarred,
  updateSocialInboxAccount,
} from '../database/db';
import { clearMetaSocialInboxTestData } from '../database/db/socialInbox';
import { seedMetaSocialInboxTestData } from '../integrations/meta/seedMetaSocialInboxTestData';

const platformSchema = z.enum(['messenger', 'instagram', 'facebook', 'x', 'linkedin', 'youtube']);
const channelTypeSchema = z.enum(['message', 'comment']);
const socialInboxProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!canAccessSocialInbox(ctx.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'ليس لديك صلاحية الوصول إلى صندوق البريد الموحد',
    });
  }

  return next();
});

const socialInboxAdminProcedure = socialInboxProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'إدارة بيانات اختبار Meta متاحة للمسؤول فقط',
    });
  }

  return next();
});

export const socialInboxRouter = router({
  accounts: socialInboxProcedure.query(() => listSocialInboxAccounts()),

  createAccount: socialInboxProcedure
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

  updateAccount: socialInboxProcedure
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

  stats: socialInboxProcedure.query(() => getSocialInboxStats()),

  threads: socialInboxProcedure
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

  commentContexts: socialInboxProcedure
    .input(
      z
        .object({
          platform: z.enum(['facebook', 'instagram']).optional(),
          search: z.string().trim().max(100).optional(),
          unreadOnly: z.boolean().optional(),
        })
        .optional()
    )
    .query(({ input }) => listSocialInboxCommentContexts(input ?? {})),

  thread: socialInboxProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ input }) => getSocialInboxThreadById(input.id)),

  markRead: socialInboxProcedure
    .input(z.object({ id: z.number().int().positive(), isRead: z.boolean() }))
    .mutation(({ input }) => markSocialInboxThreadRead(input.id, input.isRead)),

  setStarred: socialInboxProcedure
    .input(z.object({ id: z.number().int().positive(), isStarred: z.boolean() }))
    .mutation(({ input }) => setSocialInboxThreadStarred(input.id, input.isStarred)),

  assign: socialInboxProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        assignedToUserId: z.number().int().positive().nullable(),
      })
    )
    .mutation(({ input }) => assignSocialInboxThread(input.id, input.assignedToUserId)),

  seedMetaTestData: socialInboxAdminProcedure.mutation(() => seedMetaSocialInboxTestData()),

  clearMetaTestData: socialInboxAdminProcedure.mutation(() => clearMetaSocialInboxTestData()),
});
