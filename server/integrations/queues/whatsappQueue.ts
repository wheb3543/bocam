import { Queue, Worker, Job } from 'bullmq';
import { getRedisConnection } from '../../services/redis';
import { sendWhatsAppTemplateMessage } from '../../services/whatsappCloudAPI';
import { createLogger } from '../../_core/logger';

const logger = createLogger('whatsappQueue');

// Check if Redis is available
let redisCheckPromise: Promise<boolean> | null = null;

async function checkRedisConnection(): Promise<boolean> {
  if (redisCheckPromise) {
    return redisCheckPromise;
  }

  redisCheckPromise = (async () => {
    try {
      const redis = getRedisConnection();
      await redis.ping();
      logger.info('Redis connection successful');
      return true;
    } catch {
      logger.warn('Redis not available, will send messages directly');
      return false;
    }
  })();

  return redisCheckPromise;
}

/**
 * WhatsApp Message Queue
 * Handles async sending of WhatsApp messages with retry mechanism
 */

export interface WhatsAppMessageJob {
  type?: 'text' | 'template';
  to?: string;
  phone?: string;
  message?: string;
  templateName?: string;
  language?: string;
  components?: Array<{
    type: 'header' | 'body' | 'footer' | 'button';
    parameters?: Array<{ type: 'text' | 'payload'; text?: string; payload?: string }>;
    sub_type?: 'quick_reply';
    index?: number;
  }>;
  category?: 'marketing' | 'utility' | 'authentication';
  metadata?: {
    bookingId?: number;
    bookingType?: 'appointment' | 'offer' | 'camp';
    patientName?: string;
  };
  timestamp?: Date;
}

// Create the queue (will be initialized only if Redis is available)
let whatsappQueue: Queue<WhatsAppMessageJob> | null = null;
let whatsappWorker: Worker<WhatsAppMessageJob, unknown, string> | null = null;

async function initializeQueue() {
  if (whatsappQueue) {
    return whatsappQueue;
  }

  const redisAvailable = await checkRedisConnection();
  if (!redisAvailable) {
    return null;
  }

  whatsappQueue = new Queue<WhatsAppMessageJob>('whatsapp-messages', {
    // Type assertion required due to BullMQ's strict Redis connection typing
    // Our Redis implementation is compatible but doesn't match BullMQ's exact type expectations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: getRedisConnection() as any,
    defaultJobOptions: {
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 seconds
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 1000, // Keep last 1000 completed jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      },
    },
  });

  return whatsappQueue;
}

export { whatsappQueue };

// Create the worker (will be initialized only if Redis is available)
async function initializeWorker() {
  if (whatsappWorker) {
    return whatsappWorker;
  }

  const redisAvailable = await checkRedisConnection();
  if (!redisAvailable) {
    return null;
  }

  whatsappWorker = new Worker<WhatsAppMessageJob, unknown, string>(
    'whatsapp-messages',
    async (job: Job<WhatsAppMessageJob>) => {
      const { to, phone, templateName, language, components, category, metadata } = job.data;
      const phoneNumber = to || phone || '';

      logger.info(`Processing job ${job.id} for ${phoneNumber}`);

      try {
        const result = await sendWhatsAppTemplateMessage(
          phoneNumber,
          {
            templateName: templateName || '',
            languageCode: language || 'ar',
            components: components || [],
          },
          category ? { category } : undefined
        );

        logger.info(`Job ${job.id} completed successfully`);

        return {
          success: true,
          messageId: result.messageId,
          metadata,
        };
      } catch (error) {
        logger.error(`Job ${job.id} failed:`, error);
        throw error; // Will trigger retry
      }
    },
    {
      // Type assertion required due to BullMQ's strict Redis connection typing
      // Our Redis implementation is compatible but doesn't match BullMQ's exact type expectations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      connection: getRedisConnection() as any,
      concurrency: 5, // Process up to 5 messages concurrently
    }
  );

  return whatsappWorker;
}

export { whatsappWorker };

// Initialize worker and set up event listeners
initializeWorker().then((worker) => {
  if (worker) {
    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} has been completed`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} has failed with error:`, err.message);
    });

    worker.on('error', (err) => {
      logger.error('Worker error:', err);
    });
  }
});

/**
 * Add a WhatsApp message to the queue (or send directly if Redis unavailable)
 */
export async function queueWhatsAppMessage(data: WhatsAppMessageJob): Promise<string> {
  const queue = await initializeQueue();

  if (!queue) {
    // Fallback: Send directly without queue
    logger.info('Redis unavailable, sending message directly');
    try {
      const phoneNumber = data.to || data.phone || '';
      const result = await sendWhatsAppTemplateMessage(
        phoneNumber,
        {
          templateName: data.templateName || '',
          languageCode: data.language || 'ar',
          components: data.components || [],
        },
        data.category ? { category: data.category } : undefined
      );
      logger.info('Message sent directly:', result.messageId);
      return result.messageId || 'direct-send';
    } catch (error) {
      logger.error('Direct send failed:', error);
      throw error;
    }
  }

  const job = await queue.add('send-message', data, {
    priority: data.category === 'authentication' ? 1 : data.category === 'utility' ? 2 : 3,
  });

  logger.info(`Added job ${job.id} to queue`);
  return job.id?.toString() || '';
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const queue = await initializeQueue();

  if (!queue) {
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

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
    redisAvailable: true,
  };
}

/**
 * Retry all failed jobs
 */
export async function retryFailedJobs(): Promise<number> {
  const queue = await initializeQueue();
  if (!queue) {
    return 0;
  }

  const failedJobs = await queue.getFailed();
  let retried = 0;

  for (const job of failedJobs) {
    await job.retry();
    retried++;
  }

  logger.info(`Retried ${retried} failed jobs`);
  return retried;
}

/**
 * Clean old jobs
 */
export async function cleanOldJobs(): Promise<void> {
  const queue = await initializeQueue();
  if (!queue) {
    return;
  }

  await queue.clean(24 * 3600 * 1000, 1000, 'completed'); // Clean completed jobs older than 24h
  await queue.clean(7 * 24 * 3600 * 1000, 0, 'failed'); // Clean failed jobs older than 7 days
  logger.info('Old jobs cleaned');
}
