/**
 * Update Downloader
 *
 * تنزيل التحديثات مع التحقق من Checksum
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createLogger } from './logger';
import {
  updateUpdateStatus,
  logUpdateProgress,
  ensureUpdateDirectories,
  getUpdateState,
  saveUpdateState,
} from './updateState';
import type { UpdateInfo } from './updateTypes';

const logger = createLogger('updateDownloader');
const UPDATES_DIR = 'updates';

/**
 * تنزيل التحديث مع التحقق من Checksum
 */
export async function downloadUpdate(updateInfo: UpdateInfo): Promise<string> {
  try {
    logger.info('Starting download...');
    logger.info(`URL: ${updateInfo.downloadUrl}`);
    logger.info(`Expected size: ${(updateInfo.size / 1024 / 1024).toFixed(2)} MB`);

    updateUpdateStatus('downloading', 0, null);
    logUpdateProgress('Starting download...');

    ensureUpdateDirectories();

    const response = await fetch(updateInfo.downloadUrl, {
      // eslint-disable-next-line no-undef
      signal: (AbortSignal as unknown as AbortSignalWithTimeout).timeout(300000), // 5 دقائق
    });

    if (!response.ok) {
      throw new Error(`Download failed with status: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : updateInfo.size;
    let downloadedBytes = 0;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response body reader');
    }

    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      chunks.push(value);
      downloadedBytes += value.length;

      const progress = (downloadedBytes / totalBytes) * 100;
      updateUpdateStatus('downloading', progress, null);

      if (progress % 10 === 0) {
        logger.info(`Download progress: ${progress.toFixed(0)}%`);
      }
    }

    const buffer = Buffer.concat(chunks);

    logger.info('Download completed');
    logger.info(`Downloaded size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

    // التحقق من Checksum
    logger.info('Verifying checksum...');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    if (hash !== updateInfo.checksum) {
      throw new Error(`Checksum mismatch: expected ${updateInfo.checksum}, got ${hash}`);
    }

    logger.info('Checksum verified');

    // حفظ الملف
    const fileName = `update-${updateInfo.version}.zip`;
    const filePath = path.join(process.cwd(), UPDATES_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    logger.info(`Update saved to: ${filePath}`);
    logUpdateProgress(`Update downloaded and verified: ${fileName}`);

    // تحديث الحالة
    const state = getUpdateState();
    state.downloadPath = filePath;
    state.updateProgress = 100;
    saveUpdateState(state);

    return filePath;
  } catch (error) {
    logger.error('Download failed:', error);
    updateUpdateStatus('failed', 0, error instanceof Error ? error.message : 'Unknown error');
    logUpdateProgress(
      `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}
