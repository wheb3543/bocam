import fs from 'fs';
import path from 'path';
import { ENV } from '../_core/env';

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
      console.log(`[File Upload] Created directory: ${uploadPath}`);
    }

    // حفظ الملف
    const filePath = path.join(uploadPath, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`[File Upload] File saved: ${filePath}`);

    // إرجاع URL عام للملف
    const publicUrl = `${ENV.fileUploadBaseUrl}/${filename}`;
    console.log(`[File Upload] Public URL: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    console.error('[File Upload] Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.log(`[File Upload] File deleted: ${filePath}`);
    }
  } catch (error) {
    console.error('[File Upload] Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
