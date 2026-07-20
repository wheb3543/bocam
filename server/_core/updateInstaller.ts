/**
 * Update Installer
 *
 * تثبيت التحديثات والتراجع عنها
 */

import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from './logger';
import {
  updateUpdateStatus,
  logUpdateProgress,
  getUpdateState,
  saveUpdateState,
  copyDirectory,
} from './updateState';
import type { UpdateInfo } from './updateTypes';

const execAsync = promisify(exec);
const logger = createLogger('updateInstaller');
const BACKUP_DIR = 'backups';

/**
 * إنشاء نسخة احتياطية من النظام الحالي
 */
export async function createBackup(): Promise<string> {
  try {
    logger.info('Creating backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(process.cwd(), BACKUP_DIR, backupName);

    fs.mkdirSync(backupPath, { recursive: true });

    // نسخ الملفات المهمة
    const filesToBackup = [
      'package.json',
      'package-lock.json',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'vite.config.ts',
      'server',
      'client',
      'shared',
    ];

    for (const file of filesToBackup) {
      const sourcePath = path.join(process.cwd(), file);
      const destPath = path.join(backupPath, file);

      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          copyDirectory(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    }

    logger.info(`Backup created: ${backupPath}`);
    logUpdateProgress(`Backup created: ${backupName}`);

    // تحديث الحالة
    const state = getUpdateState();
    state.backupPath = backupPath;
    saveUpdateState(state);

    return backupPath;
  } catch (error) {
    logger.error('Backup failed:', error);
    logUpdateProgress(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * تثبيت التحديث
 */
export async function installUpdate(updatePath: string, updateInfo: UpdateInfo): Promise<void> {
  try {
    logger.info('Starting installation...');
    updateUpdateStatus('installing', 0, null);
    logUpdateProgress('Starting installation...');

    // إنشاء نسخة احتياطية
    await createBackup();

    logger.info('Extracting update...');
    updateUpdateStatus('installing', 20, null);
    logUpdateProgress('Extracting update package...');

    // فك الضغط باستخدام adm-zip
    const zip = new AdmZip(updatePath);
    const extractPath = path.join(process.cwd(), 'temp-update');

    // حذف مجلد temp-update إذا موجود
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }

    // فك الضغط
    zip.extractAllTo(extractPath, true);
    logger.info(`Update extracted to: ${extractPath}`);
    logUpdateProgress('Update extracted successfully');

    updateUpdateStatus('installing', 50, null);

    // استبدال الملفات
    logger.info('Replacing files...');
    updateUpdateStatus('installing', 60, null);
    logUpdateProgress('Replacing files...');

    const filesToReplace = [
      'package.json',
      'package-lock.json',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'vite.config.ts',
      'server',
      'client',
      'shared',
    ];

    for (const file of filesToReplace) {
      const sourcePath = path.join(extractPath, file);
      const destPath = path.join(process.cwd(), file);

      if (fs.existsSync(sourcePath)) {
        logger.info(`Replacing: ${file}`);

        if (fs.statSync(sourcePath).isDirectory()) {
          // حذف الدليل القديم
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { recursive: true, force: true });
          }
          // نسخ الدليل الجديد
          copyDirectory(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    }

    logger.info('Files replaced');
    logUpdateProgress('Files replaced successfully');
    updateUpdateStatus('installing', 70, null);

    // حذف مجلد temp-update
    fs.rmSync(extractPath, { recursive: true, force: true });
    logger.info('Cleanup completed');

    // تشغيل الترحيلات إذا لزم الأمر
    logger.info('Running migrations...');
    updateUpdateStatus('installing', 80, null);
    logUpdateProgress('Running database migrations...');

    try {
      await execAsync('pnpm db:push');
      logger.info('Migrations completed');
      logUpdateProgress('Database migrations completed');
    } catch (migrationError) {
      logger.warn('Migration failed (might not have migrations):', migrationError);
      logUpdateProgress('Migration skipped or failed');
    }

    updateUpdateStatus('installing', 90, null);

    // تحديث package.json
    logger.info('Updating package.json...');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.version = updateInfo.version;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    logger.info('Version updated');
    logUpdateProgress('Version updated successfully');

    updateUpdateStatus('installing', 100, null);

    logger.info('Installation completed');
    logUpdateProgress('Installation completed successfully');

    // تحديث الحالة
    const state = getUpdateState();
    state.updateStatus = 'completed';
    state.updateProgress = 100;
    state.updateError = null;
    state.pendingUpdate = null;
    state.updateInProgress = false;
    saveUpdateState(state);

    // إعادة التشغيل التلقائية
    logger.info('Restarting server...');
    logUpdateProgress('Restarting server...');
    await restartServer();
  } catch (error) {
    logger.error('Installation failed:', error);
    updateUpdateStatus('failed', 0, error instanceof Error ? error.message : 'Unknown error');
    logUpdateProgress(
      `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    // محاولة التراجع تلقائياً
    logger.info('Attempting automatic rollback...');
    try {
      await rollbackUpdate();
    } catch (rollbackError) {
      logger.error('Automatic rollback failed:', rollbackError);
      logUpdateProgress('Automatic rollback failed');
    }

    throw error;
  }
}

/**
 * التراجع عن التحديث
 */
export async function rollbackUpdate(): Promise<void> {
  try {
    logger.info('Starting rollback...');
    updateUpdateStatus('rolling_back', 0, null);
    logUpdateProgress('Starting rollback...');

    const state = getUpdateState();

    if (!state.backupPath || !fs.existsSync(state.backupPath)) {
      throw new Error('No backup found for rollback');
    }

    logger.info(`Restoring from backup: ${state.backupPath}`);
    updateUpdateStatus('rolling_back', 30, null);

    const backupPath = state.backupPath;
    const filesToRestore = [
      'package.json',
      'package-lock.json',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'vite.config.ts',
      'server',
      'client',
      'shared',
    ];

    for (const file of filesToRestore) {
      const sourcePath = path.join(backupPath, file);
      const destPath = path.join(process.cwd(), file);

      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          // حذف الدليل القديم
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { recursive: true, force: true });
          }
          // نسخ الدليل الجديد
          copyDirectory(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    }

    updateUpdateStatus('rolling_back', 100, null);

    logger.info('Rollback completed');
    logUpdateProgress('Rollback completed successfully');

    // تحديث الحالة
    state.updateStatus = 'idle';
    state.updateProgress = 0;
    state.updateError = null;
    state.pendingUpdate = null;
    state.updateInProgress = false;
    state.backupPath = null;
    saveUpdateState(state);
  } catch (error) {
    logger.error('Rollback failed:', error);
    updateUpdateStatus('failed', 0, error instanceof Error ? error.message : 'Unknown error');
    logUpdateProgress(
      `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

/**
 * إعادة تشغيل السيرفر بعد التحديث
 */
async function restartServer(): Promise<void> {
  logger.info('Restarting server...');
  logUpdateProgress('Restarting server...');

  // إيقاف العملية الحالية
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  logger.info('Shutting down for restart...');
  logUpdateProgress('Shutting down...');

  // إعادة تشغيل السيرفر باستخدام PM2 أو systemd
  try {
    // محاولة استخدام PM2 إذا كان موجوداً
    await execAsync('pm2 restart bocam-crm');
    logger.info('Server restarted via PM2');
  } catch {
    // إذا فشل PM2، حاول استخدام systemd
    try {
      await execAsync('sudo systemctl restart bocam-crm');
      logger.info('Server restarted via systemd');
    } catch {
      // إذا فشل كل شيء، أوقف العملية الحالية
      logger.warn('Could not restart via PM2 or systemd, exiting...');
      process.exit(0);
    }
  }
}
