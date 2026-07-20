/**
 * Backup Cloud - دوال النسخ الاحتياطي السحابي
 * دوال للتعامل مع النسخ الاحتياطي في السحابة (AWS S3, Cloudflare R2)
 */

import fs from 'fs';
import path from 'path';
import { createLogger } from './logger';
import { BackupConfig } from './backup.types';

const logger = createLogger('backupManager');

/**
 * إنشاء نسخة احتياطية في السحابة
 */
export async function createCloudBackup(
  backupPath: string,
  backupName: string,
  config: BackupConfig
): Promise<void> {
  logger.info(`Creating cloud backup: ${backupName}`);

  if (!config.cloudProvider) {
    logger.warn('No cloud provider specified, skipping cloud backup');
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
      logger.info(`Uploaded: ${key}`);
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
    logger.info('Cloud backup uploaded to S3');
  } catch (error) {
    logger.error('S3 upload failed:', error);
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
      logger.info(`Uploaded: ${key}`);
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
    logger.info('Cloud backup uploaded to R2');
  } catch (error) {
    logger.error('R2 upload failed:', error);
    throw error;
  }
}
