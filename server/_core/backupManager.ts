/**
 * Backup Manager Module
 *
 * نظام إدارة النسخ الاحتياطي التلقائي واليدوي
 *
 * الميزات:
 * - النسخ الاحتياطي اليدوي والتلقائي
 * - تخزين النسخ محلياً وفي السحابة
 * - إدارة جداول النسخ الاحتياطي في قاعدة البيانات
 * - دعم AWS S3 و Cloudflare R2
 * - إدارة الاحتفاظ بالنسخ القديمة
 *
 * @module backupManager
 */

export { BackupType, BackupStatus, BackupLocation, BackupInfo, BackupConfig } from './backup.types';

export { createBackup, restoreBackup, deleteBackup } from './backup.operations';

export { getBackupHistory } from './backup.storage';

export {
  BACKUP_DIR,
  TEMP_DIR,
  ensureBackupDirectories,
  calculateSize,
  calculateHash,
  copyDirectory,
} from './backup.helpers';
