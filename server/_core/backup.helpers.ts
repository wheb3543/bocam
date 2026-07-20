/**
 * Backup Helpers - دوال مساعدة لنظام النسخ الاحتياطي
 * دوال مساعدة عامة للتعامل مع الملفات والمجلدات
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * مسارات النسخ الاحتياطي
 */
export const BACKUP_DIR = path.join(process.cwd(), 'backups');
export const TEMP_DIR = path.join(process.cwd(), 'temp-backup');

/**
 * إنشاء مجلدات النسخ الاحتياطي
 */
export function ensureBackupDirectories(): void {
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
export function calculateSize(filePath: string): number {
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
export function calculateHash(filePath: string): string {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex');
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

/**
 * الملفات والمجلدات للنسخ الاحتياطي
 */
export const ITEMS_TO_BACKUP = [
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

/**
 * الملفات والمجلدات للاستعادة
 */
export const ITEMS_TO_RESTORE = [
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
  'vite.config.ts',
  'server',
  'client',
  'shared',
];
