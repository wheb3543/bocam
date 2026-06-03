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

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

const execAsync = promisify(exec);

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
  metadata?: any;
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

/**
 * مسارات النسخ الاحتياطي
 */
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const TEMP_DIR = path.join(process.cwd(), 'temp-backup');

/**
 * إنشاء مجلدات النسخ الاحتياطي
 */
function ensureBackupDirectories(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

/**
 * حساب حجم الملف/المجلد
 */
function calculateSize(filePath: string): number {
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    let totalSize = 0;
    const files = fs.readdirSync(filePath);
    for (const file of files) {
      const fullPath = path.join(filePath, file);
      totalSize += calculateSize(fullPath);
    }
    return totalSize;
  }
  return stats.size;
}

/**
 * حساب hash للملف
 */
function calculateHash(filePath: string): string {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex');
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
 * إنشاء نسخة احتياطية محلية
 */
async function createLocalBackup(backupName: string, config: BackupConfig): Promise<string> {
  console.log(`💾 Creating local backup: ${backupName}`);
  
  ensureBackupDirectories();
  
  const backupPath = path.join(BACKUP_DIR, backupName);
  
  // حذف النسخة القديمة إذا وجدت
  if (fs.existsSync(backupPath)) {
    fs.rmSync(backupPath, { recursive: true, force: true });
  }
  
  fs.mkdirSync(backupPath, { recursive: true });
  
  // الملفات والمجلدات للنسخ الاحتياطي
  const itemsToBackup = [
    'package.json',
    'package-lock.json',
    'pnpm-lock.yaml',
    'tsconfig.json',
    'vite.config.ts',
    'server',
    'client',
    'shared',
    'uploads',
  ];
  
  for (const item of itemsToBackup) {
    const sourcePath = path.join(process.cwd(), item);
    const destPath = path.join(backupPath, item);
    
    if (fs.existsSync(sourcePath)) {
      console.log(`   Backing up: ${item}`);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }
  
  // نسخ قاعدة البيانات
  try {
    console.log('   Backing up database...');
    await backupDatabase(backupPath);
  } catch (error) {
    console.warn('⚠️  Database backup failed:', error);
  }
  
  // حساب حجم النسخة
  const backupSize = calculateSize(backupPath);
  console.log(`✅ Local backup created: ${backupPath} (${(backupSize / 1024 / 1024).toFixed(2)} MB)`);
  
  return backupPath;
}

/**
 * نسخ قاعدة البيانات
 */
async function backupDatabase(backupPath: string): Promise<void> {
  const dbBackupPath = path.join(backupPath, 'database');
  fs.mkdirSync(dbBackupPath, { recursive: true });
  
  // استخراج إعدادات قاعدة البيانات من البيئة
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn('⚠️  DATABASE_URL not found, skipping database backup');
    return;
  }
  
  try {
    // استخدام mysqldump للنسخ الاحتياطي
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbBackupFile = path.join(dbBackupPath, `database-${timestamp}.sql`);
    
    // تحليل DATABASE_URL للحصول على إعدادات الاتصال
    const url = new URL(dbUrl);
    const dbHost = url.hostname;
    const dbPort = url.port || '3306';
    const dbUser = url.username;
    const dbName = url.pathname.slice(1);
    
    const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${url.password} ${dbName} > ${dbBackupFile}`;
    
    await execAsync(command);
    console.log(`✅ Database backup created: ${dbBackupFile}`);
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    throw error;
  }
}

/**
 * إنشاء نسخة احتياطية في السحابة
 */
async function createCloudBackup(backupPath: string, backupName: string, config: BackupConfig): Promise<void> {
  console.log(`☁️  Creating cloud backup: ${backupName}`);
  
  if (!config.cloudProvider) {
    console.warn('⚠️  No cloud provider specified, skipping cloud backup');
    return;
  }
  
  if (config.cloudProvider === 'aws') {
    await uploadToS3(backupPath, backupName);
  } else if (config.cloudProvider === 'r2') {
    await uploadToR2(backupPath, backupName);
  }
}

/**
 * رفع النسخة الاحتياطية إلى AWS S3
 */
async function uploadToS3(backupPath: string, backupName: string): Promise<void> {
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    
    const bucketName = process.env.AWS_S3_BUCKET || 'bocam-backups';
    
    // رفع الملفات بشكل متكرر
    const uploadFile = async (filePath: string, key: string) => {
      const fileStream = fs.createReadStream(filePath);
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileStream,
      });
      
      await s3Client.send(command);
      console.log(`   Uploaded: ${key}`);
    };
    
    const uploadDirectory = async (dirPath: string, baseKey: string) => {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const key = path.join(baseKey, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
          await uploadDirectory(fullPath, key);
        } else {
          await uploadFile(fullPath, key);
        }
      }
    };
    
    await uploadDirectory(backupPath, backupName);
    console.log('✅ Cloud backup uploaded to S3');
  } catch (error) {
    console.error('❌ S3 upload failed:', error);
    throw error;
  }
}

/**
 * رفع النسخة الاحتياطية إلى Cloudflare R2
 */
async function uploadToR2(backupPath: string, backupName: string): Promise<void> {
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT || 'https://<accountid>.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
    
    const bucketName = process.env.R2_BUCKET_NAME || 'bocam-backups';
    
    // رفع الملفات بشكل متكرر
    const uploadFile = async (filePath: string, key: string) => {
      const fileStream = fs.createReadStream(filePath);
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileStream,
      });
      
      await r2Client.send(command);
      console.log(`   Uploaded: ${key}`);
    };
    
    const uploadDirectory = async (dirPath: string, baseKey: string) => {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const key = path.join(baseKey, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
          await uploadDirectory(fullPath, key);
        } else {
          await uploadFile(fullPath, key);
        }
      }
    };
    
    await uploadDirectory(backupPath, backupName);
    console.log('✅ Cloud backup uploaded to R2');
  } catch (error) {
    console.error('❌ R2 upload failed:', error);
    throw error;
  }
}

/**
 * حفظ معلومات النسخ الاحتياطي في قاعدة البيانات
 */
async function saveBackupToDatabase(backupInfo: BackupInfo): Promise<number> {
  try {
    const db = await getDb();
    
    if (!db) {
      throw new Error('Database not available');
    }
    
    const result = await db.execute(sql`
      INSERT INTO backup (
        backup_name,
        backup_type,
        backup_path,
        backup_size,
        backup_status,
        backup_location,
        cloud_provider,
        cloud_path,
        metadata
      ) VALUES (
        ${backupInfo.backupName},
        ${backupInfo.backupType},
        ${backupInfo.backupPath},
        ${backupInfo.backupSize},
        ${backupInfo.backupStatus},
        ${backupInfo.backupLocation},
        ${backupInfo.cloudProvider || null},
        ${backupInfo.cloudPath || null},
        ${JSON.stringify(backupInfo.metadata || {})}
      )
    `);
    
    console.log('✅ Backup info saved to database');
    const rows = result as any;
    return rows.insertId;
  } catch (error) {
    console.error('❌ Failed to save backup to database:', error);
    throw error;
  }
}

/**
 * تحديث حالة النسخ الاحتياطي في قاعدة البيانات
 */
async function updateBackupStatus(backupId: number, status: BackupStatus, errorMessage?: string): Promise<void> {
  try {
    const db = await getDb();
    
    if (!db) {
      throw new Error('Database not available');
    }
    
    await db.execute(sql`
      UPDATE backup
      SET backup_status = ${status},
          error_message = ${errorMessage || null},
          completed_at = ${status === 'completed' ? new Date() : null}
      WHERE id = ${backupId}
    `);
    
    console.log(`✅ Backup status updated: ${status}`);
  } catch (error) {
    console.error('❌ Failed to update backup status:', error);
    throw error;
  }
}

/**
 * الحصول على تاريخ النسخ الاحتياطي
 */
export async function getBackupHistory(limit: number = 50): Promise<BackupInfo[]> {
  try {
    const db = await getDb();
    
    if (!db) {
      throw new Error('Database not available');
    }
    
    const result = await db.execute(sql`
      SELECT * FROM backup
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);
    
    const rows = result as any;
    return rows as BackupInfo[];
  } catch (error) {
    console.error('❌ Failed to get backup history:', error);
    throw error;
  }
}

/**
 * حذف النسخ الاحتياطي القديمة
 */
async function cleanupOldBackups(retentionDays: number): Promise<void> {
  try {
    const db = await getDb();
    
    if (!db) {
      console.warn('Database not available, skipping cleanup');
      return;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    // حذف من قاعدة البيانات
    await db.execute(sql`
      DELETE FROM backup
      WHERE created_at < ${cutoffDate}
      AND backup_status = 'completed'
    `);
    
    // حذف الملفات المحلية
    const backups = fs.readdirSync(BACKUP_DIR);
    for (const backup of backups) {
      const backupPath = path.join(BACKUP_DIR, backup);
      const stats = fs.statSync(backupPath);
      
      if (stats.mtime < cutoffDate) {
        fs.rmSync(backupPath, { recursive: true, force: true });
        console.log(`🗑️  Deleted old backup: ${backup}`);
      }
    }
    
    console.log('✅ Old backups cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup old backups:', error);
    throw error;
  }
}

/**
 * إنشاء نسخة احتياطية كاملة
 */
export async function createBackup(backupName: string, config: BackupConfig): Promise<BackupInfo> {
  const backupInfo: BackupInfo = {
    backupName,
    backupType: config.backupType,
    backupPath: '',
    backupSize: 0,
    backupStatus: 'in_progress',
    backupLocation: config.backupLocation,
    cloudProvider: config.cloudProvider,
    metadata: {
      createdAt: new Date().toISOString(),
    },
  };
  
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 STARTING BACKUP PROCESS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // حفظ معلومات النسخ الاحتياطي في قاعدة البيانات
    const backupId = await saveBackupToDatabase(backupInfo);
    backupInfo.id = backupId;
    
    // إنشاء النسخة الاحتياطية المحلية
    const localPath = await createLocalBackup(backupName, config);
    backupInfo.backupPath = localPath;
    backupInfo.backupSize = calculateSize(localPath);
    
    // إنشاء النسخة الاحتياطية في السحابة إذا لزم الأمر
    if (config.backupLocation === 'cloud' || config.backupLocation === 'both') {
      await createCloudBackup(localPath, backupName, config);
      backupInfo.cloudPath = `${config.cloudProvider}/${backupName}`;
    }
    
    // تحديث الحالة إلى مكتمل
    backupInfo.backupStatus = 'completed';
    await updateBackupStatus(backupId, 'completed');
    
    // تنظيف النسخ القديمة
    if (config.retentionDays) {
      await cleanupOldBackups(config.retentionDays);
    }
    
    console.log('✅ BACKUP COMPLETED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return backupInfo;
  } catch (error) {
    console.error('❌ BACKUP FAILED:', error);
    
    // تحديث الحالة إلى فاشل
    backupInfo.backupStatus = 'failed';
    backupInfo.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (backupInfo.id) {
      await updateBackupStatus(backupInfo.id, 'failed', backupInfo.errorMessage);
    }
    
    throw error;
  }
}

/**
 * استعادة النسخة الاحتياطية
 */
export async function restoreBackup(backupId: number): Promise<void> {
  try {
    const db = await getDb();
    
    if (!db) {
      throw new Error('Database not available');
    }
    
    // الحصول على معلومات النسخ الاحتياطي
    const result = await db.execute(sql`
      SELECT * FROM backup WHERE id = ${backupId}
    `);
    
    const rows = result as any;
    const backup = rows[0] as BackupInfo;
    
    if (!backup) {
      throw new Error('Backup not found');
    }
    
    console.log(`🔄 Restoring backup: ${backup.backupName}`);
    
    // استعادة الملفات
    if (fs.existsSync(backup.backupPath)) {
      const itemsToRestore = [
        'package.json',
        'package-lock.json',
        'pnpm-lock.yaml',
        'tsconfig.json',
        'vite.config.ts',
        'server',
        'client',
        'shared',
      ];
      
      for (const item of itemsToRestore) {
        const sourcePath = path.join(backup.backupPath, item);
        const destPath = path.join(process.cwd(), item);
        
        if (fs.existsSync(sourcePath)) {
          console.log(`   Restoring: ${item}`);
          
          if (fs.statSync(sourcePath).isDirectory()) {
            if (fs.existsSync(destPath)) {
              fs.rmSync(destPath, { recursive: true, force: true });
            }
            copyDirectory(sourcePath, destPath);
          } else {
            fs.copyFileSync(sourcePath, destPath);
          }
        }
      }
    }
    
    console.log('✅ Backup restored successfully');
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  }
}

/**
 * حذف النسخ الاحتياطي
 */
export async function deleteBackup(backupId: number): Promise<void> {
  try {
    const db = await getDb();
    
    if (!db) {
      throw new Error('Database not available');
    }
    
    // الحصول على معلومات النسخ الاحتياطي
    const result = await db.execute(sql`
      SELECT * FROM backup WHERE id = ${backupId}
    `);
    
    const rows = result as any;
    const backup = rows[0] as BackupInfo;
    
    if (!backup) {
      throw new Error('Backup not found');
    }
    
    console.log(`🗑️  Deleting backup: ${backup.backupName}`);
    
    // حذف الملف المحلي
    if (fs.existsSync(backup.backupPath)) {
      fs.rmSync(backup.backupPath, { recursive: true, force: true });
    }
    
    // حذف من السحابة
    if (backup.cloudPath) {
      // TODO: إضافة حذف من السحابة
      console.log(`   Cloud deletion not implemented yet: ${backup.cloudPath}`);
    }
    
    // حذف من قاعدة البيانات
    await db.execute(sql`
      DELETE FROM backup WHERE id = ${backupId}
    `);
    
    console.log('✅ Backup deleted successfully');
  } catch (error) {
    console.error('❌ Delete failed:', error);
    throw error;
  }
}
