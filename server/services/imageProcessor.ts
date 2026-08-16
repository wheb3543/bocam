import sharp from 'sharp';
import { createLogger } from '../_core/logger';

const logger = createLogger('imageProcessor');

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  width?: number;
  height?: number;
};

export async function processImageToAvif(
  buffer: Buffer,
  originalMimeType: string
): Promise<ProcessedImage> {
  if (originalMimeType === 'image/svg+xml') {
    return { buffer, mimeType: originalMimeType, extension: 'svg' };
  }

  try {
    const source = sharp(buffer).rotate();
    const metadata = await source.metadata();
    const processedBuffer = await source.avif({ quality: 80, effort: 4 }).toBuffer();

    return {
      buffer: processedBuffer,
      mimeType: 'image/avif',
      extension: 'avif',
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    logger.warn('AVIF conversion failed; falling back to WebP:', error);
    try {
      const fallbackSource = sharp(buffer).rotate();
      const metadata = await fallbackSource.metadata();
      const webpBuffer = await fallbackSource.webp({ quality: 82 }).toBuffer();
      return {
        buffer: webpBuffer,
        mimeType: 'image/webp',
        extension: 'webp',
        width: metadata.width,
        height: metadata.height,
      };
    } catch (fallbackError) {
      logger.error('Image conversion fallback failed; using original:', fallbackError);
      const extension = originalMimeType.split('/')[1] || 'jpg';
      return { buffer, mimeType: originalMimeType, extension };
    }
  }
}
