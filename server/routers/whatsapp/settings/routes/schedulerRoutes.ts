/**
 * WhatsApp Scheduler Routes
 * مسارات المجدول لواتساب
 */

import { protectedProcedure, router } from '../../../../_core/trpc';
import { z } from 'zod';

export const schedulerRouter = router({
  initializeScheduler: protectedProcedure.mutation(async () => {
    const { initializeScheduler } = await import('../../../../services/whatsappScheduler');
    return initializeScheduler();
  }),

  getScheduledTasks: protectedProcedure.query(async () => {
    const { getScheduledTasks } = await import('../../../../services/whatsappScheduler');
    return getScheduledTasks();
  }),

  stopTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }: { input: { taskId: string } }) => {
      const { stopTask } = await import('../../../../services/whatsappScheduler');
      return stopTask(input.taskId);
    }),

  resumeTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }: { input: { taskId: string } }) => {
      const { resumeTask } = await import('../../../../services/whatsappScheduler');
      return resumeTask(input.taskId);
    }),

  shutdownScheduler: protectedProcedure.mutation(async () => {
    const { shutdownScheduler } = await import('../../../../services/whatsappScheduler');
    return shutdownScheduler();
  }),

  runReminderJobs: protectedProcedure.mutation(async () => {
    const { runAppointmentReminderJobs } =
      await import('../../../../tasks/cron/appointmentReminders');
    const result = await runAppointmentReminderJobs();
    return result;
  }),
});
