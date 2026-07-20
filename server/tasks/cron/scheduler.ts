/**
 * Cron scheduler - runs deactivation jobs daily at midnight
 * جدولة المهام التلقائية - تشغيل مهام إلغاء التنشيط يومياً في منتصف الليل
 */
import { runDeactivationJobs } from './deactivateExpired';
import { pollLabResults } from './labResultsPoller';
import { createLogger } from '../../_core/logger';

const logger = createLogger('scheduler');

/**
 * Initialize cron scheduler
 * تهيئة جدولة المهام
 */
export function initCronScheduler() {
  logger.info('Initializing scheduler...');

  // Run lab results polling immediately and every 60 seconds
  pollLabResults();
  setInterval(pollLabResults, 60 * 1000);

  // Run immediately on startup (for testing)
  runDeactivationJobs().then(() => {
    logger.info('Initial deactivation job completed');
  });

  // Schedule daily job at midnight
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Next midnight

  const msUntilMidnight = midnight.getTime() - now.getTime();

  // Wait until midnight, then run every 24 hours
  setTimeout(() => {
    runDeactivationJobs();

    // Run every 24 hours
    setInterval(
      () => {
        runDeactivationJobs();
      },
      24 * 60 * 60 * 1000
    ); // 24 hours in milliseconds
  }, msUntilMidnight);

  logger.info(
    `Scheduler initialized. Lab results polling every 60 seconds. Next deactivation run in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`
  );
}

/**
 * Alternative: Simple interval-based scheduler (runs every 24 hours from startup)
 * بديل: جدولة بسيطة بناءً على الفترة الزمنية (كل 24 ساعة من وقت التشغيل)
 */
export function initSimpleCronScheduler() {
  logger.info('Initializing simple scheduler (24h interval)...');

  // Run immediately on startup
  runDeactivationJobs();

  // Run every 24 hours
  setInterval(
    () => {
      runDeactivationJobs();
    },
    24 * 60 * 60 * 1000
  ); // 24 hours in milliseconds

  logger.info('Simple scheduler initialized. Running every 24 hours.');
}
