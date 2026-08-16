import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storagePut } from '../services/storage';
import { processImageToAvif } from '../services/imageProcessor';
import { createLogger } from '../_core/logger';
import { asMulterMiddleware } from '../_core/expressCompatibility';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { images } from '../../drizzle/schema';

type MulterFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

const logger = createLogger('upload');

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  const token = cookies.admin_session;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req: unknown, file: MulterFile, callback: FileFilterCallback) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'image/svg+xml',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error(`نوع الملف غير مدعوم: ${file.mimetype}`));
  },
});

function createStorageName(originalName: string, extension: string) {
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  return `${baseName}-${Date.now()}-${randomSuffix}.${extension}`;
}

async function indexUploadedImage({
  key,
  url,
  originalName,
  folder,
  format,
  size,
  width,
  height,
}: {
  key: string;
  url: string;
  originalName: string;
  folder: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}) {
  const db = await ensureDatabaseAvailable();
  const [created] = await db
    .insert(images)
    .values({
      key: `upload:${key}`,
      url,
      altAr: originalName,
      section: folder,
      width,
      height,
      format,
      size,
      status: 'published',
      isActive: 'yes',
      publishedAt: new Date(),
    })
    .$returningId();

  return Number(created.id);
}

async function uploadAndIndexImage(file: MulterFile, folder: string) {
  const processed = await processImageToAvif(file.buffer, file.mimetype);
  const storageKey = `${folder}/${createStorageName(file.originalname, processed.extension)}`;
  const { key, url } = await storagePut(storageKey, processed.buffer, processed.mimeType);
  const id = await indexUploadedImage({
    key,
    url,
    originalName: file.originalname,
    folder,
    format: processed.extension,
    size: processed.buffer.length,
    width: processed.width,
    height: processed.height,
  });

  return {
    id,
    key,
    url,
    format: processed.extension,
    size: processed.buffer.length,
    width: processed.width,
    height: processed.height,
  };
}

export function createUploadRouter(): Router {
  const router = Router();

  router.post(
    '/api/upload',
    requireAuth,
    asMulterMiddleware(upload.single('file')),
    async (req: Request, res: Response) => {
      try {
        const file = req.file as MulterFile | undefined;
        if (!file) {
          return res.status(400).json({ error: 'لم يتم إرسال ملف' });
        }
        const folder = (req.body?.folder as string) || 'uploads';
        return res.status(201).json(await uploadAndIndexImage(file, folder));
      } catch (error) {
        logger.error('Single upload error:', error);
        return res.status(500).json({ error: 'حدث خطأ أثناء رفع الملف' });
      }
    }
  );

  router.post(
    '/api/upload/batch',
    requireAuth,
    asMulterMiddleware(upload.array('files', 20)),
    async (req: Request, res: Response) => {
      try {
        const files = (req.files || []) as MulterFile[];
        if (files.length === 0) {
          return res.status(400).json({ error: 'لم يتم إرسال ملفات' });
        }
        const folder = (req.body?.folder as string) || 'uploads';
        const uploaded = await Promise.all(files.map((file) => uploadAndIndexImage(file, folder)));
        return res.status(201).json({ files: uploaded });
      } catch (error) {
        logger.error('Batch upload error:', error);
        return res.status(500).json({ error: 'حدث خطأ أثناء رفع الملفات' });
      }
    }
  );

  router.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم الملف يتجاوز الحد المسموح (10MB)' });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    next();
  });

  return router;
}
