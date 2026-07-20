/**
 * Backup Storage - دوال تخزين النسخ الاحتياطي في قاعدة البيانات
 * دوال للتعامل مع تخزين واسترجاع معلومات النسخ الاحتياطي من قاعدة البيانات
 */

import { getDb } from '../database/db';
import { sql } from 'drizzle-orm';
import { createLogger } from './logger';
import { BackupInfo, BackupStatus } from './backup.types';

const logger = createLogger('backupManager');

/**
 * حفظ معلومات النسخ الاحتياطي في قاعدة البيانات
 */
export async function saveBackupToDatabase(backupInfo: BackupInfo): Promise<number> {
  try {
    const db = await getDb();

    if (!db) {
      throw new Error('Database not available');
    }

    const result = await db.execute(sql`
      INSERT INTO backup (
        backup_name,
        backup_type,
        backup_path,
        backup_size,
        backup_status,
        backup_location,
        cloud_provider,
        cloud_path,
        metadata
      ) VALUES (
        ${backupInfo.backupName},
        ${backupInfo.backupType},
        ${backupInfo.backupPath},
        ${backupInfo.backupSize},
        ${backupInfo.backupStatus},
        ${backupInfo.backupLocation},
        ${backupInfo.cloudProvider || null},
        ${backupInfo.cloudPath || null},
        ${JSON.stringify(backupInfo.metadata || {})}
      )
    `);

    logger.info('Backup info saved to database');
    const rows = result as unknown as { insertId: number };
    return rows.insertId;
  } catch (error) {
    logger.error('Failed to save backup to database:', error);
    throw error;
  }
}

/**
 * تحديث حالة النسخ الاحتياطي في قاعدة البيانات
 */
export async function updateBackupStatus(
  backupId: number,
  status: BackupStatus,
  errorMessage?: string
): Promise<void> {
  try {
    const db = await getDb();

    if (!db) {
      throw new Error('Database not available');
    }

    await db.execute(sql`
      UPDATE backup
      SET backup_status = ${status},
          error_message = ${errorMessage || null},
          completed_at = ${status === 'completed' ? new Date() : null}
      WHERE id = ${backupId}
    `);

    logger.info(`Backup status updated: ${status}`);
  } catch (error) {
    logger.error('Failed to update backup status:', error);
    throw error;
  }
}

/**
 * الحصول على تاريخ النسخ الاحتياطي
 */
export async function getBackupHistory(limit: number = 50): Promise<BackupInfo[]> {
  try {
    const db = await getDb();

    if (!db) {
      throw new Error('Database not available');
    }

    const result = await db.execute(sql`
      SELECT * FROM backup
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);

    const rows = result as unknown as BackupInfo[];
    return rows;
  } catch (error) {
    logger.error('Failed to get backup history:', error);
    throw error;
  }
}

/**
 * حذف النسخ الاحتياطي من قاعدة البيانات
 */
export async function deleteBackupFromDatabase(backupId: number): Promise<void> {
  try {
    const db = await getDb();

    if (!db) {
      throw new Error('Database not available');
    }

    await db.execute(sql`
      DELETE FROM backup WHERE id = ${backupId}
    `);

    logger.info('Backup deleted from database');
  } catch (error) {
    logger.error('Failed to delete backup from database:', error);
    throw error;
  }
}

/**
 * الحصول على معلومات نسخة احتياطية من قاعدة البيانات
 */
export async function getBackupById(backupId: number): Promise<BackupInfo | null> {
  try {
    const db = await getDb();

    if (!db) {
      throw new Error('Database not available');
    }

    const result = await db.execute(sql`
      SELECT * FROM backup WHERE id = ${backupId}
    `);

    const rows = result as unknown as BackupInfo[];
    return rows[0] || null;
  } catch (error) {
    logger.error('Failed to get backup by id:', error);
    throw error;
  }
}
