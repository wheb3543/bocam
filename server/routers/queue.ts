import { z } from 'zod';
import { router } from '../_core/trpc';
import { createLogger } from '../_core/logger';
import { permissionProcedure } from './permissionProcedures';

const logger = createLogger('queue');
const queueManagementProcedure = permissionProcedure(
  'operations.queue.manage',
  'إدارة طابور رسائل WhatsApp'
);

function maskPhoneNumber(value: string | undefined) {
  if (!value) {
    return null;
  }
  const visibleSuffix = value.slice(-3);
  return `${'•'.repeat(Math.max(0, value.length - visibleSuffix.length))}${visibleSuffix}`;
}

export const queueRouter = router({
  /**
   * Get queue statistics
   */
  getStats: queueManagementProcedure.query(async () => {
    try {
      const { getQueueStats } = await import('../integrations/queues/whatsappQueue');
      const stats = await getQueueStats();
      return stats;
    } catch (error) {
      logger.error('Failed to get stats:', error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        total: 0,
        redisAvailable: false,
      };
    }
  }),

  /**
   * Get recent jobs
   */
  getRecentJobs: queueManagementProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const { getQueueStats } = await import('../integrations/queues/whatsappQueue');
        const stats = await getQueueStats();

        // If Redis is not available, return empty array
        if (!stats.redisAvailable) {
          return [];
        }

        const { whatsappQueue } = await import('../integrations/queues/whatsappQueue');

        // Check if queue is initialized
        if (!whatsappQueue) {
          return [];
        }

        // Get jobs from different states
        const [completed, failed, active, waiting] = await Promise.all([
          whatsappQueue.getJobs(['completed'], 0, Math.floor(input.limit / 4)),
          whatsappQueue.getJobs(['failed'], 0, Math.floor(input.limit / 4)),
          whatsappQueue.getJobs(['active'], 0, Math.floor(input.limit / 4)),
          whatsappQueue.getJobs(['waiting'], 0, Math.floor(input.limit / 4)),
        ]);

        const allJobs = [...completed, ...failed, ...active, ...waiting];

        // Sort by timestamp descending
        allJobs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Format jobs
        const formattedJobs = await Promise.all(
          allJobs.slice(0, input.limit).map(async (job) => ({
            id: job.id,
            phone: maskPhoneNumber(job.data.to),
            templateName: job.data.templateName,
            bookingType: job.data.metadata?.bookingType || null,
            hasPatientContext: Boolean(job.data.metadata?.patientName),
            state: await job.getState(),
            timestamp: job.timestamp || Date.now(),
            attempts: job.attemptsMade,
            hasError: Boolean(job.failedReason),
          }))
        );

        return formattedJobs;
      } catch (error) {
        logger.error('Failed to get recent jobs:', error);
        return [];
      }
    }),
});
