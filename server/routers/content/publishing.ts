import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router } from '../../_core/trpc';
import { permissionProcedure } from '../permissionProcedures';
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
const publishingViewProcedure = permissionProcedure('content.view', 'عرض مساحة النشر');
const publishingCreateProcedure = permissionProcedure('content.create', 'إنشاء مسودات النشر');
const publishingUpdateProcedure = permissionProcedure('content.update', 'تعديل مسودات النشر');
const publishingReviewProcedure = permissionProcedure('content.review', 'مراجعة مسودات النشر');
const publishingScheduleProcedure = permissionProcedure('content.schedule', 'جدولة النشر');
const publishingRetryProcedure = permissionProcedure('content.publish', 'إعادة محاولة النشر');

export const publishingRouter = router({
  overview: publishingViewProcedure.query(() => getSocialPublishingOverview()),

  post: publishingViewProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const post = await getSocialPublishPost(input.id);
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'مسودة النشر غير موجودة' });
      }
      return post;
    }),

  createDraft: publishingCreateProcedure
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

  updateDraft: publishingUpdateProcedure
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

  submitForReview: publishingUpdateProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => submitSocialPublishPostForReview(input.id, ctx.user.id)),

  review: publishingReviewProcedure
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

  schedule: publishingScheduleProcedure
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

  cancelSchedule: publishingScheduleProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ input }) => cancelSocialPublishSchedule(input.id)),

  retryDestination: publishingRetryProcedure
    .input(z.object({ destinationId: z.number().int().positive() }))
    .mutation(({ input }) => retrySocialPublishDelivery(input.destinationId)),
});
