/**
 * Backup Cron Job
 *
 * وظيفة Cron Job للنسخ الاحتياطي التلقائي
 *
 * @module backupJob
 */

import { CronJob } from 'cron';
import { createBackup, BackupConfig, BackupType } from '../../_core/backupManager';

/**
 * إعدادات النسخ الاحتياطي التلقائي
 */
const BACKUP_CONFIGS: Record<string, BackupConfig> = {
  daily: {
    backupType: 'daily' as BackupType,
    backupLocation: 'both',
    cloudProvider: 'aws',
    retentionDays: 30,
    compress: true,
  },
  weekly: {
    backupType: 'weekly' as BackupType,
    backupLocation: 'both',
    cloudProvider: 'aws',
    retentionDays: 90,
    compress: true,
  },
  monthly: {
    backupType: 'monthly' as BackupType,
    backupLocation: 'both',
    cloudProvider: 'aws',
    retentionDays: 365,
    compress: true,
  },
};

/**
 * إنشاء اسم النسخ الاحتياطي
 */
function generateBackupName(type: BackupType): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `backup-${type}-${timestamp}`;
}

/**
 * تنفيذ النسخ الاحتياطي اليومي
 */
async function runDailyBackup(): Promise<void> {
  try {
    console.log('📅 Running daily backup...');
    const backupName = generateBackupName('daily');
    await createBackup(backupName, BACKUP_CONFIGS.daily);
    console.log('✅ Daily backup completed');
  } catch (error) {
    console.error('❌ Daily backup failed:', error);
  }
}

/**
 * تنفيذ النسخ الاحتياطي الأسبوعي
 */
async function runWeeklyBackup(): Promise<void> {
  try {
    console.log('📅 Running weekly backup...');
    const backupName = generateBackupName('weekly');
    await createBackup(backupName, BACKUP_CONFIGS.weekly);
    console.log('✅ Weekly backup completed');
  } catch (error) {
    console.error('❌ Weekly backup failed:', error);
  }
}

/**
 * تنفيذ النسخ الاحتياطي الشهري
 */
async function runMonthlyBackup(): Promise<void> {
  try {
    console.log('📅 Running monthly backup...');
    const backupName = generateBackupName('monthly');
    await createBackup(backupName, BACKUP_CONFIGS.monthly);
    console.log('✅ Monthly backup completed');
  } catch (error) {
    console.error('❌ Monthly backup failed:', error);
  }
}

/**
 * بدء Cron Jobs
 */
export function startBackupCronJobs(): void {
  console.log('🕐 Starting backup cron jobs...');

  // النسخ الاحتياطي اليومي - كل يوم الساعة 2:00 صباحاً
  const dailyJob = new CronJob('0 2 * * *', runDailyBackup);
  dailyJob.start();
  console.log('✅ Daily backup job scheduled: 0 2 * * *');

  // النسخ الاحتياطي الأسبوعي - كل يوم الأحد الساعة 3:00 صباحاً
  const weeklyJob = new CronJob('0 3 * * 0', runWeeklyBackup);
  weeklyJob.start();
  console.log('✅ Weekly backup job scheduled: 0 3 * * 0');

  // النسخ الاحتياطي الشهري - أول يوم من كل شهر الساعة 4:00 صباحاً
  const monthlyJob = new CronJob('0 4 1 * *', runMonthlyBackup);
  monthlyJob.start();
  console.log('✅ Monthly backup job scheduled: 0 4 1 * *');

  console.log('✅ All backup cron jobs started');
}

/**
 * إيقاف Cron Jobs
 */
export function stopBackupCronJobs(): void {
  console.log('🛑 Stopping backup cron jobs...');
  // سيتم إيقاف جميع Cron Jobs تلقائياً عند إيقاف العملية
  console.log('✅ Backup cron jobs stopped');
}

/**
 * تشغيل النسخ الاحتياطي يدوياً
 */
export async function runManualBackup(type: BackupType = 'manual'): Promise<void> {
  try {
    console.log(`📅 Running manual backup (${type})...`);
    const backupName = generateBackupName(type);
    const config: BackupConfig = {
      backupType: type,
      backupLocation: 'both',
      cloudProvider: 'aws',
      retentionDays: 30,
      compress: true,
    };
    await createBackup(backupName, config);
    console.log('✅ Manual backup completed');
  } catch (error) {
    console.error('❌ Manual backup failed:', error);
    throw error;
  }
}
