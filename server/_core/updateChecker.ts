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
import { getHardwareId, validateLicense } from './license';

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
}

/**
 * ملف حفظ حالة التحديث
 */
const UPDATE_STATE_FILE = '.update-state';
const UPDATE_LOG_FILE = '.update-log';

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
    };
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
    saveUpdateState(state);
    
    // في الإنتاج، هنا سيتم تجميد الواجهة وعرض شاشة التحميل
    console.log('🔒 Interface frozen. Showing update screen...');
    console.log('   Message: "جاري تحميل وتثبيت التحديث الآمن..."');
  } else {
    console.log('ℹ️  Optional update available. Administrator can install it manually.');
    console.log('');
    
    // حفظ التحديث كمعلق اختياري
    state.pendingUpdate = updateInfo;
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
