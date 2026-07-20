/**
 * Backup Types - تعريفات الأنواع لنظام النسخ الاحتياطي
 * تعريفات الأنواع المشتركة لنظام إدارة النسخ الاحتياطي
 */

/**
 * أنواع النسخ الاحتياطي
 */
export type BackupType = 'manual' | 'daily' | 'weekly' | 'monthly';

/**
 * حالة النسخ الاحتياطي
 */
export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * موقع النسخ الاحتياطي
 */
export type BackupLocation = 'local' | 'cloud' | 'both';

/**
 * معلومات النسخ الاحتياطي
 */
export interface BackupInfo {
  id?: number;
  backupName: string;
  backupType: BackupType;
  backupPath: string;
  backupSize: number;
  backupStatus: BackupStatus;
  backupLocation: BackupLocation;
  cloudProvider?: string;
  cloudPath?: string;
  createdAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * إعدادات النسخ الاحتياطي
 */
export interface BackupConfig {
  backupType: BackupType;
  backupLocation: BackupLocation;
  cloudProvider?: 'aws' | 'r2';
  retentionDays?: number;
  compress?: boolean;
}
