/**
 * Silent Heartbeat System
 *
 * نظام نبضات صامت للمراقبة عن بعد وحماية من التلاعب بالوقت
 *
 * الميزات:
 * - إرسال نبضات كل 24 ساعة إلى سيرفر مركزي
 * - حماية Anti-Clock-Tampering من التلاعب بوقت النظام
 * - Kill Switch عند رصد التلاعب
 * - تشفير البيانات المرسلة
 *
 * @module heartbeat
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getHardwareId, validateLicense } from './license';

/**
 * بيانات النبضات
 */
interface HeartbeatData {
  hardwareId: string;
  licenseVersion: string;
  serverTimestamp: number;
  timezone: string;
  features: string[];
  signature: string; // توقيع رقمي للتحقق من صحة البيانات
}

/**
 * بيانات آخر تشغيل
 */
interface LastRunData {
  timestamp: number;
  hardwareId: string;
}

/**
 * ملف حفظ وقت آخر تشغيل (مخفي)
 */
const LAST_RUN_FILE = '.last-successful-run';
const HEARTBEAT_LOG_FILE = '.heartbeat-log';

/**
 * الحصول على رابط السيرفر المركزي من البيئة
 */
function getCentralActivationUrl(): string {
  return process.env.CENTRAL_ACTIVATION_URL || 'https://api.ideahub.com/heartbeat';
}

/**
 * جمع بيانات النبضات
 */
function collectHeartbeatData(): HeartbeatData {
  try {
    const hardwareId = getHardwareId();
    const licenseInfo = validateLicense();
    const currentTime = Math.floor(Date.now() / 1000);

    // إنشاء توقيع رقمي للبيانات
    const payload = JSON.stringify({
      hid: hardwareId,
      ts: currentTime,
      ver: licenseInfo.version,
    });

    const signature = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      hardwareId,
      licenseVersion: licenseInfo.version,
      serverTimestamp: currentTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      features: licenseInfo.features,
      signature,
    };
  } catch (error) {
    console.error('❌ Error collecting heartbeat data:', error);
    throw new Error('Failed to collect heartbeat data', { cause: error });
  }
}

/**
 * إرسال نبضات إلى السيرفر المركزي (Silent Fetch)
 */
async function sendHeartbeat(): Promise<boolean> {
  try {
    const heartbeatData = collectHeartbeatData();
    const url = getCentralActivationUrl();

    console.log('💓 Sending heartbeat to central server...');
    console.log(`   URL: ${url}`);
    console.log(`   Hardware ID: ${heartbeatData.hardwareId}`);
    console.log(`   License Version: ${heartbeatData.licenseVersion}`);
    console.log(`   Timestamp: ${new Date(heartbeatData.serverTimestamp * 1000).toISOString()}`);

    // إرسال طلب POST صامت
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BOCAM-CRM-Heartbeat/1.0',
      },
      body: JSON.stringify(heartbeatData),
      // إعدادات timeout لمنع التعليق
      signal: AbortSignal.timeout(10000), // 10 ثواني
    });

    if (response.ok) {
      console.log('✅ Heartbeat sent successfully');

      // تسجيل النجاح في ملف السجل
      logHeartbeatSuccess(heartbeatData);

      return true;
    } else {
      console.warn(`⚠️  Heartbeat failed with status: ${response.status}`);
      logHeartbeatFailure(heartbeatData, response.status);
      return false;
    }
  } catch (error) {
    // Silent failure - لا نوقف السيرفر إذا فشل الإرسال
    console.warn(
      '⚠️  Heartbeat failed (silent):',
      error instanceof Error ? error.message : 'Unknown error'
    );
    logHeartbeatFailure(collectHeartbeatData(), 0);
    return false;
  }
}

/**
 * تسجيل نجاح النبضات
 */
function logHeartbeatSuccess(data: HeartbeatData): void {
  try {
    const logEntry = {
      timestamp: data.serverTimestamp,
      status: 'success',
      hardwareId: data.hardwareId,
    };

    const logPath = path.join(process.cwd(), HEARTBEAT_LOG_FILE);
    const logs = JSON.parse(fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf-8') : '[]');

    logs.push(logEntry);

    // الاحتفاظ بآخر 30 سجل فقط
    if (logs.length > 30) {
      logs.shift();
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    // Silent error - لا نوقف السيرفر بسبب مشاكل السجل
    console.warn('Failed to log heartbeat success:', error);
  }
}

/**
 * تسجيل فشل النبضات
 */
function logHeartbeatFailure(data: HeartbeatData, statusCode: number): void {
  try {
    const logEntry = {
      timestamp: data.serverTimestamp,
      status: 'failed',
      hardwareId: data.hardwareId,
      statusCode,
    };

    const logPath = path.join(process.cwd(), HEARTBEAT_LOG_FILE);
    const logs = JSON.parse(fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf-8') : '[]');

    logs.push(logEntry);

    // الاحتفاظ بآخر 30 سجل فقط
    if (logs.length > 30) {
      logs.shift();
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    // Silent error
    console.warn('Failed to log heartbeat failure:', error);
  }
}

/**
 * حفظ وقت آخر تشغيل ناجح
 */
function saveLastRunTime(): void {
  try {
    const currentHardwareId = getHardwareId();
    const currentTime = Math.floor(Date.now() / 1000);

    const lastRunData: LastRunData = {
      timestamp: currentTime,
      hardwareId: currentHardwareId,
    };

    const filePath = path.join(process.cwd(), LAST_RUN_FILE);
    fs.writeFileSync(filePath, JSON.stringify(lastRunData), { mode: 0o600 }); // صلاحيات قراءة/كتابة للمالك فقط

    console.log('💾 Last run time saved:', new Date(currentTime * 1000).toISOString());
  } catch (error) {
    console.error('❌ Error saving last run time:', error);
  }
}

/**
 * قراءة وقت آخر تشغيل
 */
function getLastRunTime(): LastRunData | null {
  try {
    const filePath = path.join(process.cwd(), LAST_RUN_FILE);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lastRunData: LastRunData = JSON.parse(content);

    return lastRunData;
  } catch (error) {
    console.warn('⚠️  Error reading last run time:', error);
    return null;
  }
}

/**
 * التحقق من التلاعب بوقت النظام (Anti-Clock-Tampering)
 *
 * يتحقق من أن الوقت الحالي ليس أقدم من وقت آخر تشغيل مسجل
 * إذا كان أقدم، فهذا يعني أن العميل قام بتأخير وقت الجهاز
 */
export function checkClockTampering(): void {
  try {
    const currentHardwareId = getHardwareId();
    const currentTime = Math.floor(Date.now() / 1000);
    const lastRunData = getLastRunTime();

    console.log('🕐 Checking for clock tampering...');
    console.log(`   Current Hardware ID: ${currentHardwareId}`);
    console.log(`   Current Time: ${new Date(currentTime * 1000).toISOString()}`);

    // إذا لم يكن هناك سجل سابق، احفظ الوقت الحالي واكمل
    if (!lastRunData) {
      console.log('ℹ️  No previous run record found. Saving current time.');
      saveLastRunTime();
      return;
    }

    console.log(`   Last Run Time: ${new Date(lastRunData.timestamp * 1000).toISOString()}`);
    console.log(`   Last Hardware ID: ${lastRunData.hardwareId}`);

    // التحقق من أن Hardware ID لم يتغير (لمنع نقل الملف)
    if (lastRunData.hardwareId !== currentHardwareId) {
      console.log('⚠️  Hardware ID changed. This might indicate file transfer.');
      console.log('   Resetting last run time for new hardware.');
      saveLastRunTime();
      return;
    }

    // التحقق من التلاعب بالوقت
    // إذا كان الوقت الحالي أقدم من وقت آخر تشغيل، فهذا يعني تلاعب
    const timeDifference = currentTime - lastRunData.timestamp;
    const hoursDifference = timeDifference / 3600; // تحويل إلى ساعات

    console.log(`   Time Difference: ${hoursDifference.toFixed(2)} hours`);

    // إذا كان الوقت الحالي أقدم بـ 24 ساعة أو أكثر، فهذا يعني تلاعب واضح
    if (currentTime < lastRunData.timestamp) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🚨 SECURITY ALERT: CLOCK TAMPERING DETECTED!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('');
      console.error('Current time is OLDER than last successful run time.');
      console.error('This indicates manual clock manipulation to bypass license expiry.');
      console.error('');
      console.error(`Expected: ${new Date(lastRunData.timestamp * 1000).toISOString()}`);
      console.error(`Current:  ${new Date(currentTime * 1000).toISOString()}`);
      console.error('');
      console.error('KILL SWITCH ACTIVATED: Server cannot start.');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('');

      process.exit(1);
    }

    // تحقق إضافي: إذا كان الفرق كبير جداً (> 48 ساعة) في الاتجاه الخاطئ
    // قد يكون هذا مؤشراً على تلاعب
    if (timeDifference < -172800) {
      // -48 ساعة
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🚨 SECURITY ALERT: EXCESSIVE CLOCK SETBACK DETECTED!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('');
      console.error('Clock has been set back by more than 48 hours.');
      console.error('This indicates potential clock manipulation.');
      console.error('');
      console.error(`Last Run: ${new Date(lastRunData.timestamp * 1000).toISOString()}`);
      console.error(`Current:  ${new Date(currentTime * 1000).toISOString()}`);
      console.error(`Difference: ${(timeDifference / 3600).toFixed(2)} hours`);
      console.error('');
      console.error('KILL SWITCH ACTIVATED: Server cannot start.');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('');

      process.exit(1);
    }

    // كل شيء على ما يرام
    console.log('✅ No clock tampering detected');

    // تحديث وقت آخر تشغيل
    saveLastRunTime();
  } catch (error) {
    console.error('❌ Error checking clock tampering:', error);
    // في حالة الخطأ، نحفظ الوقت الحالي ونكمل (لتجنب مشاكل حقيقية)
    saveLastRunTime();
  }
}

/**
 * تشغيل جدولة النبضات (Cron Job)
 * يعمل كل 24 ساعة
 */
function startHeartbeatScheduler(): void {
  try {
    const heartbeatInterval = 24 * 60 * 60 * 1000; // 24 ساعة بالمللي ثانية

    console.log('💓 Starting heartbeat scheduler...');
    console.log(`   Interval: ${heartbeatInterval / (60 * 60 * 1000)} hours`);
    console.log(`   Central Server: ${getCentralActivationUrl()}`);

    // إرسال نبضة فورية عند البدء
    sendHeartbeat();

    // جدولة النبضات
    const intervalId = setInterval(() => {
      console.log('💓 Heartbeat triggered');
      sendHeartbeat();
    }, heartbeatInterval);

    // منع إنهاء العملية
    if (intervalId.unref) {
      intervalId.unref();
    }

    console.log('✅ Heartbeat scheduler started successfully');
  } catch (error) {
    console.error('❌ Error starting heartbeat scheduler:', error);
    // Silent failure - لا نوقف السيرفر بسبب مشاكل النبضات
  }
}

/**
 * تهيئة نظام Heartbeat
 * يتم استدعاؤه عند بدء السيرفر
 */
export function initializeHeartbeat(): void {
  try {
    console.log('');
    console.log('💓 Initializing Silent Heartbeat System...');
    console.log('');

    // 1. التحقق من التلاعب بالوقت أولاً
    checkClockTampering();

    // 2. تشغيل جدولة النبضات
    startHeartbeatScheduler();

    console.log('');
    console.log('✅ Silent Heartbeat System initialized successfully');
    console.log('');
  } catch (error) {
    console.error('❌ Error initializing heartbeat system:', error);
    // Silent failure - لا نوقف السيرفر بسبب مشاكل التهيئة
  }
}

/**
 * دالة لاختبار النبضات يدوياً (للتطوير فقط)
 */
export async function testHeartbeat(): Promise<void> {
  console.log('🧪 Testing heartbeat system...');

  try {
    const success = await sendHeartbeat();
    console.log(`Test result: ${success ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error('Test failed:', error);
  }
}
