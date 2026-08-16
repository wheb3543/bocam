import sharp from 'sharp';
import { createLogger } from '../_core/logger';

const logger = createLogger('imageProcessor');

export async function processImageToAvif(
  buffer: Buffer,
  originalMimeType: string
): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
  // SVG لا تحتاج إلى تحويل إلى AVIF عبر sharp
  if (originalMimeType === 'image/svg+xml') {
    return { buffer, mimeType: originalMimeType, extension: 'svg' };
  }

  try {
    // معالجة الضغط والتحويل إلى AVIF بجودة عالية وحجم مُحسّن
    const processedBuffer = await sharp(buffer)
      .rotate() // تصحيح اتجاه الصورة بناءً على EXIF
      .avif({ quality: 80, effort: 4 })
      .toBuffer();

    logger.info('Image successfully converted to AVIF');
    return {
      buffer: processedBuffer,
      mimeType: 'image/avif',
      extension: 'avif',
    };
  } catch (error) {
    logger.warn('Failed to convert image to AVIF, falling back to original format/webp:', error);
    try {
      // محاولة بديلة للضغط بـ WebP في حال فشل AVIF لأي سبب
      const webpBuffer = await sharp(buffer).rotate().webp({ quality: 82 }).toBuffer();
      return {
        buffer: webpBuffer,
        mimeType: 'image/webp',
        extension: 'webp',
      };
    } catch (fallbackError) {
      logger.error('Fallback image compression failed, using original buffer:', fallbackError);
      const ext = originalMimeType.split('/')[1] || 'jpg';
      return { buffer, mimeType: originalMimeType, extension: ext };
    }
  }
}
