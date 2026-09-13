/**
 * Broadcast Execute Router
 * مسارات tRPC لتنفيذ البث وسجل الإرسال والتقارير.
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { broadcastExecutionService } from '../services/broadcastExecutionServiceV2';
import { TRPCError } from '@trpc/server';
import { getDb } from '../database/db';
import {
  broadcastRecipientResults,
  broadcastRecipients,
  whatsappBroadcasts,
} from '../../drizzle/schema';
import { desc, eq, inArray } from 'drizzle-orm';

const broadcastStatusSchema = z.enum(['draft', 'scheduled', 'sending', 'completed', 'failed']);

function assertBroadcastAdmin(user: { role?: string } | undefined) {
  if (user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can access broadcast records' });
  }
}

function makeRecipientStats(recipients: Array<{ status: string }>) {
  return recipients.reduce(
    (stats, recipient) => ({ ...stats, [recipient.status]: (stats[recipient.status] ?? 0) + 1 }),
    { pending: 0, sent: 0, delivered: 0, read: 0, failed: 0 } as Record<string, number>
  );
}

function resolveTrackingStats(
  broadcast: {
    recipientCount: number;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    failedCount: number;
  },
  recipients: Array<{ status: string }>,
  resultCount: number
) {
  const recordedStats = makeRecipientStats(recipients);
  const hasIndividualTracking =
    resultCount > 0 || recipients.some((recipient) => recipient.status !== 'pending');
  if (hasIndividualTracking) {
    return { recipientStats: recordedStats, trackingMode: 'per_recipient' as const };
  }

  const sent = broadcast.sentCount;
  const failed = broadcast.failedCount;
  const delivered = broadcast.deliveredCount;
  const read = broadcast.readCount;
  return {
    recipientStats: {
      pending: Math.max(0, broadcast.recipientCount - sent - failed),
      sent,
      delivered,
      read,
      failed,
    },
    trackingMode: 'aggregate_only' as const,
  };
}

export const broadcastExecuteRouter = router({
  /** إنشاء وإرسال بث جديد. */
  sendBroadcast: protectedProcedure
    .input(
      z.object({
        templateId: z.number().min(1),
        variables: z.record(z.string(), z.string()),
        headerDoctorId: z.number().int().positive().optional(),
        headerImageUrl: z.string().url().max(2000).optional(),
        recipients: z
          .array(z.object({ phone: z.string(), fullName: z.string(), source: z.string() }))
          .min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        assertBroadcastAdmin(ctx.user);
        const result = await broadcastExecutionService.executeBroadcast({
          templateId: input.templateId,
          variables: Object.fromEntries(
            Object.entries(input.variables).map(([key, value]) => [key, String(value)])
          ),
          headerDoctorId: input.headerDoctorId,
          headerImageUrl: input.headerImageUrl,
          recipients: input.recipients,
        });
        return {
          success: result.success,
          broadcastId: result.broadcastId,
          totalRecipients: result.totalRecipients,
          sentCount: result.sentCount,
          failureCount: result.failedCount,
        };
      } catch (error: any) {
        console.error('[broadcastExecuteRouter] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to send broadcast',
        });
      }
    }),

  getTemplateRequirements: protectedProcedure
    .input(z.object({ templateId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      assertBroadcastAdmin(ctx.user);
      return broadcastExecutionService.getTemplateHeaderRequirement(input.templateId);
    }),

  /** قائمة موحّدة للسجلات؛ يمكن تصفيتها للحملات المجدولة أو المرسلة. */
  getBroadcasts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        statuses: z.array(broadcastStatusSchema).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      assertBroadcastAdmin(ctx.user);
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }
      const whereClause = input.statuses?.length
        ? inArray(whatsappBroadcasts.status, input.statuses)
        : undefined;
      const broadcasts = whereClause
        ? await db
            .select()
            .from(whatsappBroadcasts)
            .where(whereClause)
            .orderBy(desc(whatsappBroadcasts.createdAt))
            .limit(input.limit)
            .offset(input.offset)
        : await db
            .select()
            .from(whatsappBroadcasts)
            .orderBy(desc(whatsappBroadcasts.createdAt))
            .limit(input.limit)
            .offset(input.offset);
      return { broadcasts, total: broadcasts.length };
    }),

  /** تفاصيل بث واحد، بما فيها حالة كل مستلم ونتائج Meta المسجلة. */
  getBroadcastDetails: protectedProcedure
    .input(z.object({ broadcastId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      assertBroadcastAdmin(ctx.user);
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }
      const broadcast = (
        await db
          .select()
          .from(whatsappBroadcasts)
          .where(eq(whatsappBroadcasts.id, input.broadcastId))
          .limit(1)
      )[0];
      if (!broadcast) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Broadcast not found' });
      }
      const recipients = await db
        .select()
        .from(broadcastRecipients)
        .where(eq(broadcastRecipients.broadcastId, input.broadcastId));
      const results = await db
        .select()
        .from(broadcastRecipientResults)
        .where(eq(broadcastRecipientResults.broadcastId, input.broadcastId))
        .orderBy(desc(broadcastRecipientResults.createdAt));
      return {
        broadcast,
        recipients,
        results,
        ...resolveTrackingStats(broadcast, recipients, results.length),
      };
    }),

  /** ملخص التقارير لكل بث، مستند إلى حالات المستلمين المسجلة فعلياً. */
  getBroadcastReports: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input, ctx }) => {
      assertBroadcastAdmin(ctx.user);
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }
      const broadcasts = await db
        .select()
        .from(whatsappBroadcasts)
        .orderBy(desc(whatsappBroadcasts.createdAt))
        .limit(input.limit);
      const reports = await Promise.all(
        broadcasts.map(async (broadcast) => {
          const recipients = await db
            .select()
            .from(broadcastRecipients)
            .where(eq(broadcastRecipients.broadcastId, broadcast.id));
          const results = await db
            .select()
            .from(broadcastRecipientResults)
            .where(eq(broadcastRecipientResults.broadcastId, broadcast.id));
          return { broadcast, ...resolveTrackingStats(broadcast, recipients, results.length) };
        })
      );
      return { reports };
    }),

  /** إلغاء بث مجدول قبل تنفيذه. */
  cancelBroadcast: protectedProcedure
    .input(z.object({ broadcastId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      assertBroadcastAdmin(ctx.user);
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }
      const broadcast = (
        await db
          .select()
          .from(whatsappBroadcasts)
          .where(eq(whatsappBroadcasts.id, input.broadcastId))
          .limit(1)
      )[0];
      if (!broadcast) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Broadcast not found' });
      }
      if (broadcast.status !== 'scheduled') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only scheduled broadcasts can be cancelled',
        });
      }
      await db
        .update(whatsappBroadcasts)
        .set({ status: 'draft', scheduledAt: null, scheduleCronTaskUid: null })
        .where(eq(whatsappBroadcasts.id, input.broadcastId));
      return { success: true, message: 'Broadcast cancelled successfully' };
    }),
});
