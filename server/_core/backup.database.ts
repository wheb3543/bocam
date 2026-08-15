/**
 * Backup Database - دوال النسخ الاحتياطي لقاعدة البيانات
 * دوال للتعامل مع نسخ قاعدة البيانات الاحتياطية
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from './logger';

const execAsync = promisify(exec);
const logger = createLogger('backupManager');

/**
 * نسخ قاعدة البيانات
 */
export async function backupDatabase(backupPath: string): Promise<void> {
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
