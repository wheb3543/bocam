import fs from 'fs';
import path from 'path';
import { ENV } from '../_core/env';
import { createLogger } from '../_core/logger';

const logger = createLogger('fileUpload');

/**
 * File Upload Service
 * خدمة رفع الملفات لتخزين PDFs نتائج المختبر
 */

/**
 * رفع ملف PDF إلى سيرفر الملفات المحلي
 * @param buffer - محتوى الملف كـ Buffer
 * @param filename - اسم الملف
 * @returns URL عام للملف
 */
export async function uploadPdfFile(buffer: Buffer, filename: string): Promise<string> {
  try {
    // إنشاء مجلد التخزين إذا لم يكن موجوداً
    const uploadPath = ENV.fileUploadPath;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.info(`Created directory: ${uploadPath}`);
    }

    // حفظ الملف
    const filePath = path.join(uploadPath, filename);
    fs.writeFileSync(filePath, buffer);
    logger.info(`File saved: ${filePath}`);

    // إرجاع URL عام للملف
    const publicUrl = `${ENV.fileUploadBaseUrl}/${filename}`;
    logger.info(`Public URL: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw new Error(
      `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error }
    );
  }
}

/**
 * حذف ملف من سيرفر الملفات
 * @param filename - اسم الملف
 */
export async function deletePdfFile(filename: string): Promise<void> {
  try {
    const filePath = path.join(ENV.fileUploadPath, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filePath}`);
    }
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw new Error(
      `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error }
    );
  }
}
