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
import AdmZip from 'adm-zip';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getHardwareId, validateLicense } from './license';

const execAsync = promisify(exec);

/**
 * بيانات التحديث من السيرفر المركزي
 */
interface UpdateInfo {
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
interface UpdateCheckResponse {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  update?: UpdateInfo;
  serverTime: number;
}

/**
 * حالة التحديث المحلية
 */
interface LocalUpdateState {
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
 * ملف حفظ حالة التحديث
 */
const UPDATE_STATE_FILE = '.update-state';
const UPDATE_LOG_FILE = '.update-log';
const UPDATES_DIR = 'updates';
const BACKUP_DIR = 'backups';

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
    console.error('❌ Error reading package.json:', error);
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
    
    const signature = crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex');
    
    return {
      hardwareId,
      currentVersion: getCurrentVersion(),
      protocolVersion: getCurrentProtocolVersion(),
      licenseVersion: licenseInfo.version,
      timestamp: currentTime,
      signature,
    };
  } catch (error) {
    console.error('❌ Error collecting update check data:', error);
    throw new Error('Failed to collect update check data');
  }
}

/**
 * التحقق من التحديثات من السيرفر المركزي
 */
async function checkForUpdates(): Promise<UpdateCheckResponse | null> {
  try {
    const checkData = collectUpdateCheckData();
    const url = getCentralUpdateUrl();
    
    console.log('🔄 Checking for updates from central server...');
    console.log(`   URL: ${url}`);
    console.log(`   Current Version: ${checkData.currentVersion}`);
    console.log(`   Protocol Version: ${checkData.protocolVersion}`);
    console.log(`   Hardware ID: ${checkData.hardwareId}`);
    
    // إرسال طلب POST
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BOCAM-CRM-UpdateChecker/1.0',
      },
      body: JSON.stringify(checkData),
      signal: AbortSignal.timeout(15000), // 15 ثانية
    });
    
    if (response.ok) {
      const data: UpdateCheckResponse = await response.json();
      console.log('✅ Update check completed');
      
      if (data.hasUpdate) {
        console.log(`📦 New version available: ${data.latestVersion}`);
        console.log(`   Mandatory: ${data.update?.mandatory ? 'Yes' : 'No'}`);
        console.log(`   Release Notes: ${data.update?.releaseNotes}`);
      } else {
        console.log('✅ System is up to date');
      }
      
      // تسجيل النتيجة
      logUpdateCheck(data);
      
      return data;
    } else {
      console.warn(`⚠️  Update check failed with status: ${response.status}`);
      logUpdateCheckFailure(response.status);
      return null;
    }
  } catch (error) {
    // Silent failure - لا نوقف السيرفر إذا فشل التحقق
    console.warn('⚠️  Update check failed (silent):', error instanceof Error ? error.message : 'Unknown error');
    logUpdateCheckFailure(0);
    return null;
  }
}

/**
 * تسجيل عملية التحقق من التحديثات
 */
function logUpdateCheck(data: UpdateCheckResponse): void {
  try {
    const logEntry = {
      timestamp: Math.floor(Date.now() / 1000),
      hasUpdate: data.hasUpdate,
      currentVersion: data.currentVersion,
      latestVersion: data.latestVersion,
      mandatory: data.update?.mandatory || false,
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
    console.warn('Failed to log update check:', error);
  }
}

/**
 * تسجيل فشل التحقق من التحديثات
 */
function logUpdateCheckFailure(statusCode: number): void {
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
    console.warn('Failed to log update check failure:', error);
  }
}

/**
 * حفظ حالة التحديث
 */
function saveUpdateState(state: LocalUpdateState): void {
  try {
    const filePath = path.join(process.cwd(), UPDATE_STATE_FILE);
    fs.writeFileSync(filePath, JSON.stringify(state), { mode: 0o600 });
  } catch (error) {
    console.error('❌ Error saving update state:', error);
  }
}

/**
 * قراءة حالة التحديث
 */
function getUpdateState(): LocalUpdateState {
  try {
    const filePath = path.join(process.cwd(), UPDATE_STATE_FILE);

    if (!fs.existsSync(filePath)) {
      return {
        lastCheck: 0,
        pendingUpdate: null,
        updateInProgress: false,
        downloadPath: null,
        backupPath: null,
        updateProgress: 0,
        updateStatus: 'idle',
        updateError: null,
      };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('⚠️  Error reading update state:', error);
    return {
      lastCheck: 0,
      pendingUpdate: null,
      updateInProgress: false,
      downloadPath: null,
      backupPath: null,
      updateProgress: 0,
      updateStatus: 'idle',
      updateError: null,
    };
  }
}

/**
 * إنشاء المجلدات المطلوبة للتحديثات
 */
function ensureUpdateDirectories(): void {
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
 * تحديث حالة التحديث
 */
function updateUpdateStatus(
  status: LocalUpdateState['updateStatus'],
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
 * تسجيل تقدم التحديث
 */
function logUpdateProgress(message: string): void {
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
 * تنزيل التحديث مع التحقق من Checksum
 */
async function downloadUpdate(updateInfo: UpdateInfo): Promise<string> {
  try {
    console.log('📥 Starting download...');
    console.log(`   URL: ${updateInfo.downloadUrl}`);
    console.log(`   Expected size: ${(updateInfo.size / 1024 / 1024).toFixed(2)} MB`);

    updateUpdateStatus('downloading', 0, null);
    logUpdateProgress('Starting download...');

    ensureUpdateDirectories();

    const response = await fetch(updateInfo.downloadUrl, {
      signal: AbortSignal.timeout(300000), // 5 دقائق
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
      if (done) break;

      chunks.push(value);
      downloadedBytes += value.length;

      const progress = (downloadedBytes / totalBytes) * 100;
      updateUpdateStatus('downloading', progress, null);

      if (progress % 10 === 0) {
        console.log(`   Download progress: ${progress.toFixed(0)}%`);
      }
    }

    const buffer = Buffer.concat(chunks);

    console.log('✅ Download completed');
    console.log(`   Downloaded size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

    // التحقق من Checksum
    console.log('🔍 Verifying checksum...');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    if (hash !== updateInfo.checksum) {
      throw new Error(`Checksum mismatch: expected ${updateInfo.checksum}, got ${hash}`);
    }

    console.log('✅ Checksum verified');

    // حفظ الملف
    const fileName = `update-${updateInfo.version}.zip`;
    const filePath = path.join(process.cwd(), UPDATES_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ Update saved to: ${filePath}`);
    logUpdateProgress(`Update downloaded and verified: ${fileName}`);

    // تحديث الحالة
    const state = getUpdateState();
    state.downloadPath = filePath;
    state.updateProgress = 100;
    saveUpdateState(state);

    return filePath;
  } catch (error) {
    console.error('❌ Download failed:', error);
    updateUpdateStatus('failed', 0, error instanceof Error ? error.message : 'Unknown error');
    logUpdateProgress(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * إنشاء نسخة احتياطية من النظام الحالي
 */
async function createBackup(): Promise<string> {
  try {
    console.log('💾 Creating backup...');

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

    console.log(`✅ Backup created: ${backupPath}`);
    logUpdateProgress(`Backup created: ${backupName}`);

    // تحديث الحالة
    const state = getUpdateState();
    state.backupPath = backupPath;
    saveUpdateState(state);

    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    logUpdateProgress(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * نسخ دليل بشكل متكرر
 */
function copyDirectory(source: string, destination: string): void {
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

/**
 * تثبيت التحديث
 */
async function installUpdate(updatePath: string, updateInfo: UpdateInfo): Promise<void> {
  try {
    console.log('🔧 Starting installation...');
    updateUpdateStatus('installing', 0, null);
    logUpdateProgress('Starting installation...');

    // إنشاء نسخة احتياطية
    await createBackup();

    console.log('📦 Extracting update...');
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
    console.log(`✅ Update extracted to: ${extractPath}`);
    logUpdateProgress('Update extracted successfully');
    
    updateUpdateStatus('installing', 50, null);

    // استبدال الملفات
    console.log('🔄 Replacing files...');
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
        console.log(`   Replacing: ${file}`);
        
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

    console.log('✅ Files replaced');
    logUpdateProgress('Files replaced successfully');
    updateUpdateStatus('installing', 70, null);

    // حذف مجلد temp-update
    fs.rmSync(extractPath, { recursive: true, force: true });
    console.log('✅ Cleanup completed');

    // تشغيل الترحيلات إذا لزم الأمر
    console.log('🗄️  Running migrations...');
    updateUpdateStatus('installing', 80, null);
    logUpdateProgress('Running database migrations...');
    
    try {
      await execAsync('pnpm db:push');
      console.log('✅ Migrations completed');
      logUpdateProgress('Database migrations completed');
    } catch (migrationError) {
      console.warn('⚠️  Migration failed (might not have migrations):', migrationError);
      logUpdateProgress('Migration skipped or failed');
    }

    updateUpdateStatus('installing', 90, null);

    // تحديث package.json
    console.log('📝 Updating package.json...');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.version = updateInfo.version;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Version updated');
    logUpdateProgress('Version updated successfully');

    updateUpdateStatus('installing', 100, null);

    console.log('✅ Installation completed');
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
    console.log('🔄 Restarting server...');
    logUpdateProgress('Restarting server...');
    await restartServer();
  } catch (error) {
    console.error('❌ Installation failed:', error);
    updateUpdateStatus('failed', 0, error instanceof Error ? error.message : 'Unknown error');
    logUpdateProgress(`Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

    // محاولة التراجع تلقائياً
    console.log('🔄 Attempting automatic rollback...');
    try {
      await rollbackUpdate();
    } catch (rollbackError) {
      console.error('❌ Automatic rollback failed:', rollbackError);
      logUpdateProgress('Automatic rollback failed');
    }

    throw error;
  }
}

/**
 * التراجع عن التحديث
 */
async function rollbackUpdate(): Promise<void> {
  try {
    console.log('🔄 Starting rollback...');
    updateUpdateStatus('rolling_back', 0, null);
    logUpdateProgress('Starting rollback...');

    const state = getUpdateState();

    if (!state.backupPath || !fs.existsSync(state.backupPath)) {
      throw new Error('No backup found for rollback');
    }

    console.log(`📦 Restoring from backup: ${state.backupPath}`);
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

    console.log('✅ Rollback completed');
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
    console.error('❌ Rollback failed:', error);
    updateUpdateStatus('failed', 0, error instanceof Error ? error.message : 'Unknown error');
    logUpdateProgress(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * إعادة تشغيل السيرفر بعد التحديث
 */
async function restartServer(): Promise<void> {
  console.log('🔄 Restarting server...');
  logUpdateProgress('Restarting server...');

  // إيقاف العملية الحالية
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('👋 Shutting down for restart...');
  logUpdateProgress('Shutting down...');
  
  // إعادة تشغيل السيرفر باستخدام PM2 أو systemd
  try {
    // محاولة استخدام PM2 إذا كان موجوداً
    await execAsync('pm2 restart bocam-crm');
    console.log('✅ Server restarted via PM2');
  } catch (pm2Error) {
    // إذا فشل PM2، حاول استخدام systemd
    try {
      await execAsync('sudo systemctl restart bocam-crm');
      console.log('✅ Server restarted via systemd');
    } catch (systemdError) {
      // إذا فشل كل شيء، أوقف العملية الحالية
      console.log('⚠️  Could not restart via PM2 or systemd, exiting...');
      process.exit(0);
    }
  }
}

/**
 * تنفيذ التحديث الكامل
 */
export async function executeUpdate(updateInfo: UpdateInfo): Promise<void> {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 STARTING UPDATE PROCESS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`Version: ${updateInfo.version}`);
    console.log(`Mandatory: ${updateInfo.mandatory ? 'YES' : 'NO'}`);
    console.log(`Size: ${(updateInfo.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('');

    // تحديث الحالة
    const state = getUpdateState();
    state.updateInProgress = true;
    state.pendingUpdate = updateInfo;
    saveUpdateState(state);

    // تنزيل التحديث
    const downloadPath = await downloadUpdate(updateInfo);

    // تثبيت التحديث
    await installUpdate(downloadPath, updateInfo);

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ UPDATE COMPLETED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // إعادة تشغيل السيرفر
    restartServer();
  } catch (error) {
    console.error('❌ Update process failed:', error);
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

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 UPDATE AVAILABLE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`Version: ${updateInfo.version}`);
  console.log(`Mandatory: ${updateInfo.mandatory ? 'YES' : 'NO'}`);
  console.log(`Size: ${(updateInfo.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Release Notes: ${updateInfo.releaseNotes}`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (updateInfo.mandatory) {
    console.log('⚠️  MANDATORY UPDATE DETECTED');
    console.log('   Interface will be frozen until update is installed.');
    console.log('');

    // حفظ التحديث المعلق
    state.pendingUpdate = updateInfo;
    state.updateInProgress = true;
    state.updateStatus = 'idle';
    saveUpdateState(state);

    // بدء التحديث تلقائياً للتحديثات الإجبارية
    console.log('� Starting automatic update installation...');
    executeUpdate(updateInfo).catch((error) => {
      console.error('❌ Automatic update failed:', error);
      logUpdateProgress(`Automatic update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    });
  } else {
    console.log('ℹ️  Optional update available. Administrator can install it manually.');
    console.log('');

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
    
    console.log('🔄 Starting update checker scheduler...');
    console.log(`   Interval: ${checkInterval / (60 * 60 * 1000)} hours`);
    console.log(`   Central Server: ${getCentralUpdateUrl()}`);
    
    // التحقق فوري عند البدء
    checkForUpdates().then((response) => {
      if (response && response.hasUpdate && response.update) {
        handleAvailableUpdate(response.update);
      }
    }).catch((error) => {
      console.error('❌ Error in initial update check:', error);
    });
    
    // جدولة التحقق الدوري
    const intervalId = setInterval(() => {
      console.log('🔄 Update check triggered');
      checkForUpdates().then((response) => {
        if (response && response.hasUpdate && response.update) {
          handleAvailableUpdate(response.update);
        }
      }).catch((error) => {
        console.error('❌ Error in scheduled update check:', error);
      });
    }, checkInterval);
    
    // منع إنهاء العملية
    if (intervalId.unref) {
      intervalId.unref();
    }
    
    console.log('✅ Update checker scheduler started successfully');
    
  } catch (error) {
    console.error('❌ Error starting update checker scheduler:', error);
    // Silent failure - لا نوقف السيرفر بسبب مشاكل التحقق من التحديثات
  }
}

/**
 * تهيئة نظام التحقق من التحديثات
 * يتم استدعاؤه عند بدء السيرفر
 */
export function initializeUpdateChecker(): void {
  try {
    console.log('');
    console.log('🔄 Initializing Update Checker System...');
    console.log('');
    
    // التحقق من وجود تحديث معلق
    const state = getUpdateState();
    if (state.pendingUpdate) {
      console.log('⚠️  Pending update detected from previous check:');
      console.log(`   Version: ${state.pendingUpdate.version}`);
      console.log(`   Mandatory: ${state.pendingUpdate.mandatory ? 'Yes' : 'No'}`);
      
      if (state.pendingUpdate.mandatory) {
        console.log('   ⚠️  This is a mandatory update. Interface will remain frozen.');
      }
    }
    
    // تشغيل جدولة التحقق من التحديثات
    startUpdateCheckerScheduler();
    
    console.log('');
    console.log('✅ Update Checker System initialized successfully');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error initializing update checker system:', error);
    // Silent failure - لا نوقف السيرفر بسبب مشاكل التهيئة
  }
}

/**
 * دالة لاختبار التحقق من التحديثات يدوياً (للتطوير فقط)
 */
export async function testUpdateChecker(): Promise<void> {
  console.log('🧪 Testing update checker system...');

  try {
    const response = await checkForUpdates();
    console.log(`Test result: ${response ? 'SUCCESS' : 'FAILED'}`);

    if (response && response.hasUpdate && response.update) {
      handleAvailableUpdate(response.update);
    }
  } catch (error) {
    console.error('Test failed:', error);
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

  console.log('🚀 Starting manual update...');
  await executeUpdate(state.pendingUpdate);
}

/**
 * بدء التراجع عن التحديث يدوياً
 */
export async function startManualRollback(): Promise<void> {
  console.log('🔄 Starting manual rollback...');
  await rollbackUpdate();
  restartServer();
}
