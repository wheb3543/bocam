/**
 * Update Checker System
 *
 * نظام التحقق من التحديثات من السيرفر المركزي
 *
 * الميزات:
 * - التحقق من التحديثات عند إقلاع النظام
 * - التحقق الدوري من التحديثات
 * - تجميد الواجهة عند وجود تحديث إجباري
 * - عرض شاشة التحميل والتثبيت
 * - دعم التحديثات الاختيارية والإجبارية
 *
 * @module updateChecker
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createLogger } from './logger';
import { getHardwareId, validateLicense } from './license';
import { downloadUpdate } from './updateDownloader';
import { installUpdate, rollbackUpdate } from './updateInstaller';
import {
  getUpdateState,
  saveUpdateState,
  logUpdateCheck,
  logUpdateCheckFailure,
  logUpdateProgress,
} from './updateState';
import type { UpdateInfo, UpdateCheckResponse, LocalUpdateState } from './updateTypes';

const logger = createLogger('updateChecker');

/**
 * الحصول على رابط السيرفر المركزي للتحديثات
 */
function getCentralUpdateUrl(): string {
  return process.env.CENTRAL_UPDATE_URL || 'https://api.ideahub.com/updates/check';
}

/**
 * الحصول على إصدار البروتوكول الحالي
 */
function getCurrentProtocolVersion(): string {
  return process.env.PROTOCOL_VERSION || '1.0.0';
}

/**
 * الحصول على إصدار النظام الحالي
 */
function getCurrentVersion(): string {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    logger.error('Error reading package.json:', error);
    return '1.0.0';
  }
}

/**
 * جمع بيانات التحقق من التحديثات
 */
function collectUpdateCheckData() {
  try {
    const hardwareId = getHardwareId();
    const licenseInfo = validateLicense();
    const currentTime = Math.floor(Date.now() / 1000);

    // إنشاء توقيع رقمي للطلب
    const payload = JSON.stringify({
      hid: hardwareId,
      ts: currentTime,
      ver: getCurrentVersion(),
      proto: getCurrentProtocolVersion(),
    });

    const signature = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      hardwareId,
      currentVersion: getCurrentVersion(),
      protocolVersion: getCurrentProtocolVersion(),
      licenseVersion: licenseInfo.version,
      timestamp: currentTime,
      signature,
    };
  } catch (error) {
    logger.error('Error collecting update check data:', error);
    throw new Error('Failed to collect update check data', { cause: error });
  }
}

/**
 * التحقق من التحديثات من السيرفر المركزي
 */
async function checkForUpdates(): Promise<UpdateCheckResponse | null> {
  try {
    const checkData = collectUpdateCheckData();
    const url = getCentralUpdateUrl();

    logger.info('Checking for updates from central server...');
    logger.info(`URL: ${url}`);
    logger.info(`Current Version: ${checkData.currentVersion}`);
    logger.info(`Protocol Version: ${checkData.protocolVersion}`);
    logger.info(`Hardware ID: ${checkData.hardwareId}`);

    // إرسال طلب POST
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BOCAM-CRM-UpdateChecker/1.0',
      },
      body: JSON.stringify(checkData),
      // eslint-disable-next-line no-undef
      signal: (AbortSignal as unknown as AbortSignalWithTimeout).timeout(15000), // 15 ثانية
    });

    if (response.ok) {
      const data: UpdateCheckResponse = await response.json();
      logger.info('Update check completed');

      if (data.hasUpdate) {
        logger.info(`New version available: ${data.latestVersion}`);
        logger.info(`Mandatory: ${data.update?.mandatory ? 'Yes' : 'No'}`);
        logger.info(`Release Notes: ${data.update?.releaseNotes}`);
      } else {
        logger.info('System is up to date');
      }

      // تسجيل النتيجة
      logUpdateCheck(data);

      return data;
    } else {
      logger.warn(`Update check failed with status: ${response.status}`);
      logUpdateCheckFailure(response.status);
      return null;
    }
  } catch (error) {
    // Silent failure - لا نوقف السيرفر إذا فشل التحقق
    logger.warn(
      'Update check failed (silent):',
      error instanceof Error ? error.message : 'Unknown error'
    );
    logUpdateCheckFailure(0);
    return null;
  }
}

/**
 * تنفيذ التحديث الكامل
 */
export async function executeUpdate(updateInfo: UpdateInfo): Promise<void> {
  try {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('STARTING UPDATE PROCESS');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('');
    logger.info(`Version: ${updateInfo.version}`);
    logger.info(`Mandatory: ${updateInfo.mandatory ? 'YES' : 'NO'}`);
    logger.info(`Size: ${(updateInfo.size / 1024 / 1024).toFixed(2)} MB`);
    logger.info('');

    // تحديث الحالة
    const state = getUpdateState();
    state.updateInProgress = true;
    state.pendingUpdate = updateInfo;
    saveUpdateState(state);

    // تنزيل التحديث
    const downloadPath = await downloadUpdate(updateInfo);

    // تثبيت التحديث
    await installUpdate(downloadPath, updateInfo);

    logger.info('');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('UPDATE COMPLETED SUCCESSFULLY');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('');
  } catch (error) {
    logger.error('Update process failed:', error);
    throw error;
  }
}

/**
 * التحقق مما إذا كان يجب تجميد الواجهة
 */
export function shouldFreezeInterface(): boolean {
  const state = getUpdateState();
  return state.pendingUpdate?.mandatory === true || state.updateInProgress === true;
}

/**
 * الحصول على معلومات التحديث المعلق
 */
export function getPendingUpdate(): UpdateInfo | null {
  const state = getUpdateState();
  return state.pendingUpdate;
}

/**
 * معالجة التحديث المتاح
 */
function handleAvailableUpdate(updateInfo: UpdateInfo): void {
  const state = getUpdateState();

  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('UPDATE AVAILABLE');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('');
  logger.info(`Version: ${updateInfo.version}`);
  logger.info(`Mandatory: ${updateInfo.mandatory ? 'YES' : 'NO'}`);
  logger.info(`Size: ${(updateInfo.size / 1024 / 1024).toFixed(2)} MB`);
  logger.info(`Release Notes: ${updateInfo.releaseNotes}`);
  logger.info('');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (updateInfo.mandatory) {
    logger.warn('MANDATORY UPDATE DETECTED');
    logger.info('Interface will be frozen until update is installed.');
    logger.info('');

    // حفظ التحديث المعلق
    state.pendingUpdate = updateInfo;
    state.updateInProgress = true;
    state.updateStatus = 'idle';
    saveUpdateState(state);

    // بدء التحديث تلقائياً للتحديثات الإجبارية
    logger.info('Starting automatic update installation...');
    executeUpdate(updateInfo).catch((error) => {
      logger.error('Automatic update failed:', error);
      logUpdateProgress(
        `Automatic update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    });
  } else {
    logger.info('Optional update available. Administrator can install it manually.');
    logger.info('');

    // حفظ التحديث كمعلق اختياري
    state.pendingUpdate = updateInfo;
    state.updateStatus = 'idle';
    saveUpdateState(state);
  }
}

/**
 * تشغيل جدولة التحقق من التحديثات
 */
function startUpdateCheckerScheduler(): void {
  try {
    const checkInterval = 6 * 60 * 60 * 1000; // 6 ساعات

    logger.info('Starting update checker scheduler...');
    logger.info(`Interval: ${checkInterval / (60 * 60 * 1000)} hours`);
    logger.info(`Central Server: ${getCentralUpdateUrl()}`);

    // التحقق فوري عند البدء
    checkForUpdates()
      .then((response) => {
        if (response && response.hasUpdate && response.update) {
          handleAvailableUpdate(response.update);
        }
      })
      .catch((error) => {
        logger.error('Error in initial update check:', error);
      });

    // جدولة التحقق الدوري
    const intervalId = setInterval(() => {
      logger.info('Update check triggered');
      checkForUpdates()
        .then((response) => {
          if (response && response.hasUpdate && response.update) {
            handleAvailableUpdate(response.update);
          }
        })
        .catch((error) => {
          logger.error('Error in scheduled update check:', error);
        });
    }, checkInterval);

    // منع إنهاء العملية
    if (intervalId.unref) {
      intervalId.unref();
    }

    logger.info('Update checker scheduler started successfully');
  } catch (error) {
    logger.error('Error starting update checker scheduler:', error);
    // Silent failure - لا نوقف السيرفر بسبب مشاكل التحقق من التحديثات
  }
}

/**
 * تهيئة نظام التحقق من التحديثات
 * يتم استدعاؤه عند بدء السيرفر
 */
export function initializeUpdateChecker(): void {
  try {
    logger.info('');
    logger.info('Initializing Update Checker System...');
    logger.info('');

    // التحقق من وجود تحديث معلق
    const state = getUpdateState();
    if (state.pendingUpdate) {
      logger.warn('Pending update detected from previous check:');
      logger.info(`Version: ${state.pendingUpdate.version}`);
      logger.info(`Mandatory: ${state.pendingUpdate.mandatory ? 'Yes' : 'No'}`);

      if (state.pendingUpdate.mandatory) {
        logger.warn('This is a mandatory update. Interface will remain frozen.');
      }
    }

    // تشغيل جدولة التحقق من التحديثات
    startUpdateCheckerScheduler();

    logger.info('');
    logger.info('Update Checker System initialized successfully');
    logger.info('');
  } catch (error) {
    logger.error('Error initializing update checker system:', error);
    // Silent failure - لا نوقف السيرفر بسبب مشاكل التهيئة
  }
}

/**
 * دالة لاختبار التحقق من التحديثات يدوياً (للتطوير فقط)
 */
export async function testUpdateChecker(): Promise<void> {
  logger.info('Testing update checker system...');

  try {
    const response = await checkForUpdates();
    logger.info(`Test result: ${response ? 'SUCCESS' : 'FAILED'}`);

    if (response && response.hasUpdate && response.update) {
      handleAvailableUpdate(response.update);
    }
  } catch (error) {
    logger.error('Test failed:', error);
  }
}

/**
 * الحصول على حالة التحديث الحالية
 */
export function getUpdateStatus(): LocalUpdateState {
  return getUpdateState();
}

/**
 * بدء التحديث الاختياري يدوياً
 */
export async function startManualUpdate(): Promise<void> {
  const state = getUpdateState();

  if (!state.pendingUpdate) {
    throw new Error('No pending update available');
  }

  logger.info('Starting manual update...');
  await executeUpdate(state.pendingUpdate);
}

/**
 * بدء التراجع عن التحديث يدوياً
 */
export async function startManualRollback(): Promise<void> {
  logger.info('Starting manual rollback...');
  await rollbackUpdate();
}
