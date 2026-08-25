import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import jwt from 'jsonwebtoken';
import { and, eq, isNull } from 'drizzle-orm';
import { storagePut } from '../services/storage';
import { processImageToAvif } from '../services/imageProcessor';
import { createLogger } from '../_core/logger';
import { asMulterMiddleware } from '../_core/expressCompatibility';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { images, media, mediaFolders } from '../../drizzle/schema';
import { createFolderZipBuffer } from '../services/zipService';
import {
  createStorageName,
  decodeFileName,
  getMediaKind,
  type MediaKind,
} from '../services/mediaFiles';
import { prepareMediaUpload } from '../services/mediaUploadPreparation';
import { recordContentOperation } from '../services/contentOperationNotificationService';

type MulterFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

const logger = createLogger('upload');
const MAX_MEDIA_FILE_SIZE = 100 * 1024 * 1024;

type UploadOperationActor = { userId: number; username?: string };

function getUploadOperationActor(res: Response): UploadOperationActor | undefined {
  const actor = res.locals.uploadOperationActor as UploadOperationActor | undefined;
  return actor?.userId ? actor : undefined;
}

function recordMediaUploadOperation(
  res: Response,
  status: 'succeeded' | 'failed',
  attemptedItems: number,
  completedItems = 0
) {
  const actor = getUploadOperationActor(res);
  void ensureDatabaseAvailable()
    .then((db) =>
      recordContentOperation(db, {
        operation: 'media_upload',
        status,
        attemptedItems,
        completedItems,
        actorId: actor?.userId,
      })
    )
    .catch(() => undefined);
}

const allowedTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
]);

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
    const verified = jwt.verify(token, secret) as { userId?: unknown; username?: unknown };
    if (typeof verified !== 'string' && typeof verified.userId === 'number') {
      res.locals.uploadOperationActor = {
        userId: verified.userId,
        username: typeof verified.username === 'string' ? verified.username : undefined,
      } satisfies UploadOperationActor;
    }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_FILE_SIZE },
  fileFilter: (_req: unknown, file: MulterFile, callback: FileFilterCallback) => {
    if (allowedTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error(`نوع الوسائط غير مدعوم: ${file.mimetype}`));
  },
});

async function getFolder(folderId?: number) {
  const db = await ensureDatabaseAvailable();
  if (folderId) {
    const [folder] = await db
      .select()
      .from(mediaFolders)
      .where(eq(mediaFolders.id, folderId))
      .limit(1);
    if (folder) {
      return folder;
    }
  }

  const [general] = await db
    .select()
    .from(mediaFolders)
    .where(eq(mediaFolders.path, '/general'))
    .limit(1);
  if (general) {
    return general;
  }

  const [created] = await db
    .insert(mediaFolders)
    .values({ name: 'عام', path: '/general', parentId: null })
    .$returningId();
  const [folder] = await db
    .select()
    .from(mediaFolders)
    .where(eq(mediaFolders.id, Number(created.id)))
    .limit(1);
  if (!folder) {
    throw new Error('تعذّر إعداد المجلد العام للوسائط');
  }
  return folder;
}

async function indexUploadedMedia({
  key,
  url,
  fileName,
  type,
  mimeType,
  folderId,
  format,
  size,
  width,
  height,
}: {
  key: string;
  url: string;
  fileName: string;
  type: MediaKind;
  mimeType: string;
  folderId: number;
  format: string;
  size: number;
  width?: number;
  height?: number;
}) {
  const db = await ensureDatabaseAvailable();
  const [created] = await db
    .insert(media)
    .values({
      key,
      url,
      type,
      mimeType,
      fileName,
      altAr: type === 'image' ? fileName : undefined,
      folderId,
      format,
      size,
      width,
      height,
      status: 'published',
      isActive: 'yes',
      publishedAt: new Date(),
    })
    .$returningId();
  return Number(created.id);
}

async function indexLegacyImage({
  key,
  url,
  fileName,
  folderName,
  format,
  size,
  width,
  height,
}: {
  key: string;
  url: string;
  fileName: string;
  folderName: string;
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
      altAr: fileName,
      section: folderName,
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

export async function uploadAndIndexMedia(file: MulterFile, folderId?: number) {
  const originalName = decodeFileName(file.originalname);
  const type = getMediaKind(file.mimetype);
  const folder = await getFolder(folderId);
  const { buffer, mimeType, extension, width, height } = await prepareMediaUpload(
    file,
    processImageToAvif
  );

  const storageKey = `media/folder-${folder.id}/${createStorageName(type, extension)}`;
  const { key, url } = await storagePut(storageKey, buffer, mimeType);
  const mediaId = await indexUploadedMedia({
    key,
    url,
    fileName: originalName,
    type,
    mimeType,
    folderId: folder.id,
    format: extension,
    size: buffer.length,
    width,
    height,
  });

  const imageId =
    type === 'image'
      ? await indexLegacyImage({
          key,
          url,
          fileName: originalName,
          folderName: folder.name,
          format: extension,
          size: buffer.length,
          width,
          height,
        })
      : undefined;

  return {
    mediaId,
    imageId,
    key,
    url,
    type,
    mimeType,
    fileName: originalName,
    format: extension,
    size: buffer.length,
    width,
    height,
    folderId: folder.id,
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
        const folderId = Number(req.body?.folderId) || undefined;
        const uploaded = await uploadAndIndexMedia(file, folderId);
        recordMediaUploadOperation(res, 'succeeded', 1, 1);
        return res.status(201).json(uploaded);
      } catch (error) {
        logger.error('Single media upload error:', error);
        recordMediaUploadOperation(res, 'failed', 1);
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
        if (!files.length) {
          return res.status(400).json({ error: 'لم يتم إرسال ملفات' });
        }
        const folderId = Number(req.body?.folderId) || undefined;
        const uploaded = await Promise.all(
          files.map((file) => uploadAndIndexMedia(file, folderId))
        );
        recordMediaUploadOperation(res, 'succeeded', files.length, uploaded.length);
        return res.status(201).json({ files: uploaded });
      } catch (error) {
        logger.error('Batch media upload error:', error);
        recordMediaUploadOperation(res, 'failed', ((req.files || []) as MulterFile[]).length);
        return res.status(500).json({ error: 'حدث خطأ أثناء رفع الملفات' });
      }
    }
  );

  router.get(
    '/api/media/folders/:folderId/download',
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const folderId = Number(req.params.folderId);
        if (!Number.isInteger(folderId) || folderId < 1) {
          return res.status(400).json({ error: 'معرف المجلد غير صالح' });
        }

        const db = await ensureDatabaseAvailable();
        const [folder] = await db
          .select()
          .from(mediaFolders)
          .where(eq(mediaFolders.id, folderId))
          .limit(1);
        if (!folder) {
          return res.status(404).json({ error: 'المجلد غير موجود' });
        }

        const files = await db
          .select({ fileName: media.fileName, key: media.key, url: media.url })
          .from(media)
          .where(and(eq(media.folderId, folderId), isNull(media.deletedAt)));
        if (!files.length) {
          return res.status(404).json({ error: 'المجلد فارغ' });
        }

        const zip = await createFolderZipBuffer(
          files.map((file) => ({
            name: file.fileName || file.key.split('/').pop() || 'media-file',
            url: file.url,
          }))
        );
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${encodeURIComponent(folder.name)}.zip"`
        );
        return res.status(200).send(zip);
      } catch (error) {
        logger.error('Folder ZIP download error:', error);
        return res.status(500).json({ error: 'تعذّر تجهيز ملف ZIP للمجلد' });
      }
    }
  );

  router.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم الملف يتجاوز الحد المسموح (100MB)' });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    next();
  });

  return router;
}
