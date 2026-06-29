import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { storagePut } from '../services/storage';
import crypto from 'crypto';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((c) => {
    const [name, value] = c.trim().split('=');
    if (name && value) cookies[name] = decodeURIComponent(value);
  });
  const token = cookies['admin_session'];
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }
  try {
    jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

/**
 * Upload Route - يوفر endpoint لرفع الملفات إلى S3
 *
 * POST /api/upload
 * - يقبل ملف واحد (field name: "file")
 * - يقبل حقل "folder" اختياري لتحديد المجلد في S3
 * - يعيد { url, key }
 */

// إعداد multer للتخزين المؤقت في الذاكرة
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    // السماح بالصور فقط
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `نوع الملف غير مدعوم: ${file.mimetype}. الأنواع المسموحة: ${allowedTypes.join(', ')}`
        )
      );
    }
  },
});

/**
 * توليد اسم ملف فريد مع suffix عشوائي
 */
function generateUniqueFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();
  return `${baseName}-${timestamp}-${randomSuffix}.${ext}`;
}

export function createUploadRouter(): Router {
  const router = Router();

  router.post(
    '/api/upload',
    requireAuth,
    upload.single('file'),
    async (req: Request, res: Response) => {
      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ error: 'لم يتم إرسال ملف' });
        }

        const folder = (req.body?.folder as string) || 'uploads';
        const uniqueFileName = generateUniqueFileName(file.originalname);
        const fileKey = `${folder}/${uniqueFileName}`;

        const { url, key } = await storagePut(fileKey, file.buffer, file.mimetype);

        return res.json({ url, key });
      } catch (error) {
        console.error('[Upload] Error:', error);
        const message = error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الملف';
        return res.status(500).json({ error: message });
      }
    }
  );

  // Multer error handling
  router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'حجم الملف يتجاوز الحد المسموح (10MB)' });
      }
      return res.status(400).json({ error: `خطأ في رفع الملف: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: (err as { message?: string }).message || 'خطأ غير معروف' });
    }
    next();
  });

  return router;
}
