/**
 * WhatsApp Scheduler Routes
 * مسارات المجدول لواتساب
 */

import { router } from '../../../../_core/trpc';
import { z } from 'zod';
import { permissionProcedure } from '../../../permissionProcedures';

const schedulerManagementProcedure = permissionProcedure(
  'operations.scheduler.manage',
  'إدارة المهام المجدولة لرسائل WhatsApp'
);

export const schedulerRouter = router({
  initializeScheduler: schedulerManagementProcedure.mutation(async () => {
    const { initializeScheduler } = await import('../../../../services/whatsappScheduler');
    return initializeScheduler();
  }),

  getScheduledTasks: schedulerManagementProcedure.query(async () => {
    const { getScheduledTasks } = await import('../../../../services/whatsappScheduler');
    return getScheduledTasks();
  }),

  stopTask: schedulerManagementProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }: { input: { taskId: string } }) => {
      const { stopTask } = await import('../../../../services/whatsappScheduler');
      return stopTask(input.taskId);
    }),

  resumeTask: schedulerManagementProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }: { input: { taskId: string } }) => {
      const { resumeTask } = await import('../../../../services/whatsappScheduler');
      return resumeTask(input.taskId);
    }),

  shutdownScheduler: schedulerManagementProcedure.mutation(async () => {
    const { shutdownScheduler } = await import('../../../../services/whatsappScheduler');
    return shutdownScheduler();
  }),

  runReminderJobs: schedulerManagementProcedure.mutation(async () => {
    const { runAppointmentReminderJobs } =
      await import('../../../../tasks/cron/appointmentReminders');
    const result = await runAppointmentReminderJobs();
    return result;
  }),
});
