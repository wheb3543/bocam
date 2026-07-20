/**
 * Update State Management
 *
 * إدارة حالة التحديث المحلية
 */

import fs from 'fs';
import path from 'path';
import { createLogger } from './logger';
import type { LocalUpdateState, UpdateStatus } from './updateTypes';

const logger = createLogger('updateState');

const UPDATE_STATE_FILE = '.update-state';
const UPDATE_LOG_FILE = '.update-log';
const UPDATES_DIR = 'updates';
const BACKUP_DIR = 'backups';

/**
 * الحالة الافتراضية للتحديث
 */
const DEFAULT_UPDATE_STATE: LocalUpdateState = {
  lastCheck: 0,
  pendingUpdate: null,
  updateInProgress: false,
  downloadPath: null,
  backupPath: null,
  updateProgress: 0,
  updateStatus: 'idle',
  updateError: null,
};

/**
 * قراءة حالة التحديث
 */
export function getUpdateState(): LocalUpdateState {
  try {
    const filePath = path.join(process.cwd(), UPDATE_STATE_FILE);

    if (!fs.existsSync(filePath)) {
      return { ...DEFAULT_UPDATE_STATE };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    logger.warn('Error reading update state:', error);
    return { ...DEFAULT_UPDATE_STATE };
  }
}

/**
 * حفظ حالة التحديث
 */
export function saveUpdateState(state: LocalUpdateState): void {
  try {
    const filePath = path.join(process.cwd(), UPDATE_STATE_FILE);
    fs.writeFileSync(filePath, JSON.stringify(state), { mode: 0o600 });
  } catch (error) {
    logger.error('Error saving update state:', error);
  }
}

/**
 * تحديث حالة التحديث
 */
export function updateUpdateStatus(
  status: UpdateStatus,
  progress: number,
  error: string | null = null
): void {
  const state = getUpdateState();
  state.updateStatus = status;
  state.updateProgress = progress;
  if (error) {
    state.updateError = error;
  }
  saveUpdateState(state);
}

/**
 * تسجيل عملية التحقق من التحديثات
 */
export function logUpdateCheck(data: {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  mandatory?: boolean;
}): void {
  try {
    const logEntry = {
      timestamp: Math.floor(Date.now() / 1000),
      hasUpdate: data.hasUpdate,
      currentVersion: data.currentVersion,
      latestVersion: data.latestVersion,
      mandatory: data.mandatory || false,
    };

    const logPath = path.join(process.cwd(), UPDATE_LOG_FILE);
    const logs = JSON.parse(fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf-8') : '[]');

    logs.push(logEntry);

    // الاحتفاظ بآخر 50 سجل فقط
    if (logs.length > 50) {
      logs.shift();
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    logger.warn('Failed to log update check:', error);
  }
}

/**
 * تسجيل فشل التحقق من التحديثات
 */
export function logUpdateCheckFailure(statusCode: number): void {
  try {
    const logEntry = {
      timestamp: Math.floor(Date.now() / 1000),
      status: 'failed',
      statusCode,
    };

    const logPath = path.join(process.cwd(), UPDATE_LOG_FILE);
    const logs = JSON.parse(fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf-8') : '[]');

    logs.push(logEntry);

    if (logs.length > 50) {
      logs.shift();
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    logger.warn('Failed to log update check failure:', error);
  }
}

/**
 * تسجيل تقدم التحديث
 */
export function logUpdateProgress(message: string): void {
  const logEntry = {
    timestamp: Math.floor(Date.now() / 1000),
    type: 'progress',
    message,
  };

  const logPath = path.join(process.cwd(), UPDATE_LOG_FILE);
  const logs = JSON.parse(fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf-8') : '[]');

  logs.push(logEntry);

  if (logs.length > 50) {
    logs.shift();
  }

  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
}

/**
 * إنشاء المجلدات المطلوبة للتحديثات
 */
export function ensureUpdateDirectories(): void {
  const updatesPath = path.join(process.cwd(), UPDATES_DIR);
  const backupPath = path.join(process.cwd(), BACKUP_DIR);

  if (!fs.existsSync(updatesPath)) {
    fs.mkdirSync(updatesPath, { recursive: true });
  }

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
}

/**
 * نسخ دليل بشكل متكرر
 */
export function copyDirectory(source: string, destination: string): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
