/**
 * Backup Local - دوال النسخ الاحتياطي المحلي
 * دوال للتعامل مع النسخ الاحتياطي المحلي
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from './logger';
import {
  ensureBackupDirectories,
  copyDirectory,
  calculateSize,
  ITEMS_TO_BACKUP,
} from './backup.helpers';
import type { BackupConfig } from './backup.types';

const execAsync = promisify(exec);
const logger = createLogger('backupManager');

/**
 * نسخ قاعدة البيانات
 */
async function backupDatabase(backupPath: string): Promise<void> {
  const dbBackupPath = path.join(backupPath, 'database');
  fs.mkdirSync(dbBackupPath, { recursive: true });

  // استخراج إعدادات قاعدة البيانات من البيئة
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    logger.warn('DATABASE_URL not found, skipping database backup');
    return;
  }

  try {
    // استخدام mysqldump للنسخ الاحتياطي
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbBackupFile = path.join(dbBackupPath, `database-${timestamp}.sql`);

    // تحليل DATABASE_URL للحصول على إعدادات الاتصال
    const url = new URL(dbUrl);
    const dbHost = url.hostname;
    const dbPort = url.port || '3306';
    const dbUser = url.username;
    const dbName = url.pathname.slice(1);

    const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${url.password} ${dbName} > ${dbBackupFile}`;

    await execAsync(command);
    logger.info(`Database backup created: ${dbBackupFile}`);
  } catch (error) {
    logger.error('Database backup failed:', error);
    throw error;
  }
}

/**
 * إنشاء نسخة احتياطية محلية
 */
export async function createLocalBackup(
  backupName: string,
  _config: BackupConfig
): Promise<string> {
  logger.info(`Creating local backup: ${backupName}`);

  ensureBackupDirectories();

  const backupPath = path.join(process.cwd(), 'backups', backupName);

  // حذف النسخة القديمة إذا وجدت
  if (fs.existsSync(backupPath)) {
    fs.rmSync(backupPath, { recursive: true, force: true });
  }

  fs.mkdirSync(backupPath, { recursive: true });

  for (const item of ITEMS_TO_BACKUP) {
    const sourcePath = path.join(process.cwd(), item);
    const destPath = path.join(backupPath, item);

    if (fs.existsSync(sourcePath)) {
      logger.info(`Backing up: ${item}`);

      if (fs.statSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  // نسخ قاعدة البيانات
  try {
    logger.info('Backing up database...');
    await backupDatabase(backupPath);
  } catch (error) {
    logger.warn('Database backup failed:', error);
  }

  // حساب حجم النسخة
  const backupSize = calculateSize(backupPath);
  logger.info(`Local backup created: ${backupPath} (${(backupSize / 1024 / 1024).toFixed(2)} MB)`);

  return backupPath;
}
