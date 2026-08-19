import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../../_core/trpc';
import {
  cancelSocialPublishSchedule,
  createSocialPublishDraft,
  getSocialPublishPost,
  getSocialPublishingOverview,
  reviewSocialPublishPost,
  retrySocialPublishDelivery,
  scheduleSocialPublishPost,
  submitSocialPublishPostForReview,
  updateSocialPublishDraft,
} from '../../database/db';

const platformSchema = z.enum(['facebook', 'instagram', 'x', 'linkedin', 'youtube', 'tiktok']);
const contentTypeSchema = z.enum(['post', 'image', 'video', 'reel', 'story', 'short']);
const publishingRoles = ['admin', 'manager', 'team_leader', 'staff'] as const;

const publishingProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!publishingRoles.includes(ctx.user.role as (typeof publishingRoles)[number])) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'ليس لديك صلاحية الوصول إلى صفحة النشر' });
  }
  return next();
});

const reviewerProcedure = publishingProcedure.use(async ({ ctx, next }) => {
  if (!['admin', 'manager', 'team_leader'].includes(ctx.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'الموافقة على النشر تتطلب صلاحية إشرافية' });
  }
  return next();
});

export const publishingRouter = router({
  overview: publishingProcedure.query(() => getSocialPublishingOverview()),

  post: publishingProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const post = await getSocialPublishPost(input.id);
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'مسودة النشر غير موجودة' });
      }
      return post;
    }),

  createDraft: publishingProcedure
    .input(
      z.object({
        title: z.string().trim().min(3).max(255),
        baseCaption: z.string().max(10000).nullable().optional(),
        contentType: contentTypeSchema,
        platforms: z.array(platformSchema).min(1).max(6),
        mediaIds: z.array(z.number().int().positive()).max(20).default([]),
        campaignId: z.number().int().positive().nullable().optional(),
        timezone: z.string().trim().min(1).max(64).default('Asia/Aden'),
      })
    )
    .mutation(({ ctx, input }) =>
      createSocialPublishDraft({ ...input, createdByUserId: ctx.user.id })
    ),

  updateDraft: publishingProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        title: z.string().trim().min(3).max(255),
        baseCaption: z.string().max(10000).nullable().optional(),
        contentType: contentTypeSchema,
        campaignId: z.number().int().positive().nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...patch } = input;
      return updateSocialPublishDraft(id, ctx.user.id, patch);
    }),

  submitForReview: publishingProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => submitSocialPublishPostForReview(input.id, ctx.user.id)),

  review: reviewerProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        decision: z.enum(['approved', 'rejected']),
        notes: z.string().trim().max(2000).nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      reviewSocialPublishPost(input.id, ctx.user.id, input.decision, input.notes)
    ),

  schedule: reviewerProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        scheduledAt: z.coerce.date(),
        timezone: z.string().trim().min(1).max(64).default('Asia/Aden'),
      })
    )
    .mutation(({ input }) =>
      scheduleSocialPublishPost(input.id, input.scheduledAt, input.timezone)
    ),

  cancelSchedule: reviewerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ input }) => cancelSocialPublishSchedule(input.id)),

  retryDestination: reviewerProcedure
    .input(z.object({ destinationId: z.number().int().positive() }))
    .mutation(({ input }) => retrySocialPublishDelivery(input.destinationId)),
});
