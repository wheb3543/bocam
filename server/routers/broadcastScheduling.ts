/**
 * Broadcast Scheduling Router
 * مسارات tRPC لجدولة البث
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { broadcastSchedulerService } from '../services/broadcastSchedulerService';
import { TRPCError } from '@trpc/server';
import { parse as parseCookie } from 'cookie';
import { COOKIE_NAME } from '@shared/const';
import { listHeartbeatJobs } from '../_core/heartbeatJobs';

type ScheduledBroadcastWithHeartbeat = Awaited<
  ReturnType<typeof broadcastSchedulerService.getScheduledBroadcasts>
>[number] & {
  heartbeat: {
    status: 'active' | 'paused' | 'not_found' | 'unavailable' | 'not_created';
    isEnabled: boolean | null;
    nextExecutionAt: string | null;
    lastExecutedAt: string | null;
  };
};

async function attachHeartbeatStatus(
  broadcasts: Awaited<ReturnType<typeof broadcastSchedulerService.getScheduledBroadcasts>>,
  sessionToken: string
): Promise<ScheduledBroadcastWithHeartbeat[]> {
  const taskUids = broadcasts
    .map((broadcast) => broadcast.scheduleCronTaskUid)
    .filter((taskUid): taskUid is string => Boolean(taskUid));
  if (!taskUids.length) {
    return broadcasts.map((broadcast) => ({
      ...broadcast,
      heartbeat: {
        status: 'not_created',
        isEnabled: null,
        nextExecutionAt: null,
        lastExecutedAt: null,
      },
    }));
  }

  try {
    const { jobs } = await listHeartbeatJobs(sessionToken, { page: 1, pageSize: 100 });
    const jobsByTaskUid = new Map(jobs.map((job) => [job.taskUid, job]));
    return broadcasts.map((broadcast) => {
      if (!broadcast.scheduleCronTaskUid) {
        return {
          ...broadcast,
          heartbeat: {
            status: 'not_created',
            isEnabled: null,
            nextExecutionAt: null,
            lastExecutedAt: null,
          },
        };
      }
      const job = jobsByTaskUid.get(broadcast.scheduleCronTaskUid);
      if (!job) {
        return {
          ...broadcast,
          heartbeat: {
            status: 'not_found',
            isEnabled: null,
            nextExecutionAt: null,
            lastExecutedAt: null,
          },
        };
      }
      return {
        ...broadcast,
        heartbeat: {
          status: job.isEnable ? 'active' : 'paused',
          isEnabled: job.isEnable,
          nextExecutionAt: job.nextExecutionAt ?? null,
          lastExecutedAt: job.lastExecutedAt ?? null,
        },
      };
    });
  } catch (error) {
    console.error('[broadcastScheduling] Unable to retrieve Heartbeat task status:', error);
    return broadcasts.map((broadcast) => ({
      ...broadcast,
      heartbeat: {
        status: broadcast.scheduleCronTaskUid ? 'unavailable' : 'not_created',
        isEnabled: null,
        nextExecutionAt: null,
        lastExecutedAt: null,
      },
    }));
  }
}

function resolveSessionToken(cookieHeader?: string): string {
  if (!cookieHeader) {
    return '';
  }
  const parsed = parseCookie(cookieHeader);
  return parsed[COOKIE_NAME] || parsed['admin_session'] || '';
}

export const broadcastSchedulingRouter = router({
  createScheduledBroadcast: protectedProcedure
    .input(
      z.object({
        templateId: z.number().int().positive(),
        variables: z.record(z.string(), z.string()),
        headerImageUrl: z.string().url().max(2000).optional(),
        recipients: z
          .array(
            z.object({
              phone: z.string().min(1),
              fullName: z.string().min(1),
              source: z.string().min(1),
            })
          )
          .min(1),
        scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        scheduledTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can schedule broadcasts' });
      }
      const sessionToken = resolveSessionToken(ctx.req.headers.cookie);
      try {
        return await broadcastSchedulerService.createScheduledBroadcast(
          {
            ...input,
            scheduledTime:
              input.scheduledTime.length === 5 ? `${input.scheduledTime}:00` : input.scheduledTime,
            createdBy: ctx.user.id,
          },
          sessionToken
        );
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to create scheduled broadcast',
        });
      }
    }),

  /**
   * جدولة بث جديد
   */
  scheduleBroadcast: protectedProcedure
    .input(
      z.object({
        broadcastId: z.number(),
        scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        scheduledTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await broadcastSchedulerService.scheduleBroadcast(
          input.broadcastId,
          input.scheduledDate,
          input.scheduledTime
        );
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to schedule broadcast',
        });
      }
    }),

  /**
   * تحديث موعد البث المجدول
   */
  updateScheduledBroadcast: protectedProcedure
    .input(
      z.object({
        broadcastId: z.number(),
        scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        scheduledTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await broadcastSchedulerService.updateScheduledBroadcast(
          input.broadcastId,
          input.scheduledDate,
          input.scheduledTime
        );
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to update scheduled broadcast',
        });
      }
    }),

  /**
   * إلغاء بث مجدول
   */
  cancelScheduledBroadcast: protectedProcedure
    .input(z.object({ broadcastId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const result = await broadcastSchedulerService.cancelScheduledBroadcast(input.broadcastId);
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to cancel scheduled broadcast',
        });
      }
    }),

  /**
   * الحصول على الرسائل المجدولة
   */
  getScheduledBroadcasts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can access scheduled broadcasts',
      });
    }
    try {
      const broadcasts = await broadcastSchedulerService.getScheduledBroadcasts();
      const sessionToken = resolveSessionToken(ctx.req.headers.cookie);
      return attachHeartbeatStatus(broadcasts, sessionToken);
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to fetch scheduled broadcasts',
      });
    }
  }),
});
