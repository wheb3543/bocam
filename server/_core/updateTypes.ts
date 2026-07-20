/**
 * Update Checker Types
 *
 * تعريفات الأنواع لنظام التحقق من التحديثات
 */

/**
 * بيانات التحديث من السيرفر المركزي
 */
export interface UpdateInfo {
  version: string;
  mandatory: boolean;
  releaseDate: number;
  downloadUrl: string;
  checksum: string;
  size: number;
  releaseNotes: string;
  protocolVersion: string;
}

/**
 * استجابة السيرفر المركزي
 */
export interface UpdateCheckResponse {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  update?: UpdateInfo;
  serverTime: number;
}

/**
 * حالة التحديث المحلية
 */
export interface LocalUpdateState {
  lastCheck: number;
  pendingUpdate: UpdateInfo | null;
  updateInProgress: boolean;
  downloadPath: string | null;
  backupPath: string | null;
  updateProgress: number;
  updateStatus: 'idle' | 'downloading' | 'installing' | 'completed' | 'failed' | 'rolling_back';
  updateError: string | null;
}

/**
 * حالة التحديث المسموح بها
 */
export type UpdateStatus = LocalUpdateState['updateStatus'];
