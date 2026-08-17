import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  assignSocialInboxThread,
  createSocialInboxAccount,
  getSocialInboxStats,
  getSocialInboxThreadById,
  listSocialInboxAccounts,
  listSocialInboxThreads,
  markSocialInboxThreadRead,
  setSocialInboxThreadStarred,
  updateSocialInboxAccount,
} from '../database/db';

const platformSchema = z.enum(['messenger', 'instagram', 'facebook', 'x', 'linkedin', 'youtube']);
const channelTypeSchema = z.enum(['message', 'comment']);

export const socialInboxRouter = router({
  accounts: protectedProcedure.query(() => listSocialInboxAccounts()),

  createAccount: protectedProcedure
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

  updateAccount: protectedProcedure
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

  stats: protectedProcedure.query(() => getSocialInboxStats()),

  threads: protectedProcedure
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

  thread: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ input }) => getSocialInboxThreadById(input.id)),

  markRead: protectedProcedure
    .input(z.object({ id: z.number().int().positive(), isRead: z.boolean() }))
    .mutation(({ input }) => markSocialInboxThreadRead(input.id, input.isRead)),

  setStarred: protectedProcedure
    .input(z.object({ id: z.number().int().positive(), isStarred: z.boolean() }))
    .mutation(({ input }) => setSocialInboxThreadStarred(input.id, input.isStarred)),

  assign: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        assignedToUserId: z.number().int().positive().nullable(),
      })
    )
    .mutation(({ input }) => assignSocialInboxThread(input.id, input.assignedToUserId)),
});
