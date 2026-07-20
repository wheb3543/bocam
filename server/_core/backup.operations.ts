/**
 * Backup Operations - العمليات الرئيسية للنسخ الاحتياطي
 * دوال للعمليات الرئيسية مثل إنشاء واستعادة وحذف النسخ الاحتياطية
 */

import fs from 'fs';
import path from 'path';
import { createLogger } from './logger';
import { BackupInfo, BackupConfig } from './backup.types';
import { calculateSize, copyDirectory, BACKUP_DIR, ITEMS_TO_RESTORE } from './backup.helpers';
import { createLocalBackup } from './backup.local';
import { createCloudBackup } from './backup.cloud';
import {
  saveBackupToDatabase,
  updateBackupStatus,
  getBackupById,
  deleteBackupFromDatabase,
} from './backup.storage';

const logger = createLogger('backupManager');

/**
 * حذف النسخ الاحتياطي القديمة
 */
async function cleanupOldBackups(retentionDays: number): Promise<void> {
  try {
    const { getDb } = await import('../database/db');
    const { sql } = await import('drizzle-orm');

    const db = await getDb();

    if (!db) {
      logger.warn('Database not available, skipping cleanup');
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // حذف من قاعدة البيانات
    await db.execute(sql`
      DELETE FROM backup
      WHERE created_at < ${cutoffDate}
      AND backup_status = 'completed'
    `);

    // حذف الملفات المحلية
    const backups = fs.readdirSync(BACKUP_DIR);
    for (const backup of backups) {
      const backupPath = path.join(BACKUP_DIR, backup);
      const stats = fs.statSync(backupPath);

      if (stats.mtime < cutoffDate) {
        fs.rmSync(backupPath, { recursive: true, force: true });
        logger.info(`Deleted old backup: ${backup}`);
      }
    }

    logger.info('Old backups cleaned up');
  } catch (error) {
    logger.error('Failed to cleanup old backups:', error);
    throw error;
  }
}

/**
 * إنشاء نسخة احتياطية كاملة
 */
export async function createBackup(backupName: string, config: BackupConfig): Promise<BackupInfo> {
  const backupInfo: BackupInfo = {
    backupName,
    backupType: config.backupType,
    backupPath: '',
    backupSize: 0,
    backupStatus: 'in_progress',
    backupLocation: config.backupLocation,
    cloudProvider: config.cloudProvider,
    metadata: {
      createdAt: new Date().toISOString(),
    },
  };

  try {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('STARTING BACKUP PROCESS');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // حفظ معلومات النسخ الاحتياطي في قاعدة البيانات
    const backupId = await saveBackupToDatabase(backupInfo);
    backupInfo.id = backupId;

    // إنشاء النسخة الاحتياطية المحلية
    const localPath = await createLocalBackup(backupName, config);
    backupInfo.backupPath = localPath;
    backupInfo.backupSize = calculateSize(localPath);

    // إنشاء النسخة الاحتياطية في السحابة إذا لزم الأمر
    if (config.backupLocation === 'cloud' || config.backupLocation === 'both') {
      await createCloudBackup(localPath, backupName, config);
      backupInfo.cloudPath = `${config.cloudProvider}/${backupName}`;
    }

    // تحديث الحالة إلى مكتمل
    backupInfo.backupStatus = 'completed';
    await updateBackupStatus(backupId, 'completed');

    // تنظيف النسخ القديمة
    if (config.retentionDays) {
      await cleanupOldBackups(config.retentionDays);
    }

    logger.info('BACKUP COMPLETED SUCCESSFULLY');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return backupInfo;
  } catch (error) {
    logger.error('BACKUP FAILED:', error);

    // تحديث الحالة إلى فاشل
    backupInfo.backupStatus = 'failed';
    backupInfo.errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (backupInfo.id) {
      await updateBackupStatus(backupInfo.id, 'failed', backupInfo.errorMessage);
    }

    throw error;
  }
}

/**
 * استعادة النسخة الاحتياطية
 */
export async function restoreBackup(backupId: number): Promise<void> {
  try {
    const backup = await getBackupById(backupId);

    if (!backup) {
      throw new Error('Backup not found');
    }

    logger.info(`Restoring backup: ${backup.backupName}`);

    // استعادة الملفات
    if (fs.existsSync(backup.backupPath)) {
      for (const item of ITEMS_TO_RESTORE) {
        const sourcePath = path.join(backup.backupPath, item);
        const destPath = path.join(process.cwd(), item);

        if (fs.existsSync(sourcePath)) {
          logger.info(`Restoring: ${item}`);

          if (fs.statSync(sourcePath).isDirectory()) {
            if (fs.existsSync(destPath)) {
              fs.rmSync(destPath, { recursive: true, force: true });
            }
            copyDirectory(sourcePath, destPath);
          } else {
            fs.copyFileSync(sourcePath, destPath);
          }
        }
      }
    }

    logger.info('Backup restored successfully');
  } catch (error) {
    logger.error('Restore failed:', error);
    throw error;
  }
}

/**
 * حذف النسخ الاحتياطي
 */
export async function deleteBackup(backupId: number): Promise<void> {
  try {
    const backup = await getBackupById(backupId);

    if (!backup) {
      throw new Error('Backup not found');
    }

    logger.info(`Deleting backup: ${backup.backupName}`);

    // حذف الملف المحلي
    if (fs.existsSync(backup.backupPath)) {
      fs.rmSync(backup.backupPath, { recursive: true, force: true });
    }

    // حذف من السحابة
    if (backup.cloudPath) {
      // TODO: إضافة حذف من السحابة
      logger.info(`Cloud deletion not implemented yet: ${backup.cloudPath}`);
    }

    // حذف من قاعدة البيانات
    await deleteBackupFromDatabase(backupId);

    logger.info('Backup deleted successfully');
  } catch (error) {
    logger.error('Delete failed:', error);
    throw error;
  }
}
