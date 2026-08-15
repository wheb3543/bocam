import { MetaWebhookMessagePayload, MessageHandlerContext, MessageHandlerResult } from '../types';
import { createLogger } from '../../../_core/logger';

const logger = createLogger('mediaMessageHandler');

/**
 * معالجة الرسائل الوسائطية (صور، فيديو، مستندات، صوت)
 *
 * @param message - payload الرسالة
 * @param context - سياق المعالجة
 * @returns نتيجة المعالجة
 */
export async function handleMediaMessage(
  message: MetaWebhookMessagePayload,
  context: MessageHandlerContext
): Promise<MessageHandlerResult> {
  const { type, image, document, video, audio } = message;
  const { phoneNumber } = context;

  let content: string;
  let messageType: string;
  let metaPayload: Record<string, unknown> | null = null;
  let mediaId: string | null = null;

  if (type === 'image' && image) {
    metaPayload = {
      mediaId: image.id,
      mimeType: image.mime_type,
      sha256: image.sha256,
    };
    mediaId = image.id;
    logger.info(`📷 Received image from ${phoneNumber}`);
    content = image.caption || '📷 صورة';
    messageType = 'image';
  } else if (type === 'document' && document) {
    metaPayload = {
      mediaId: document.id,
      filename: document.filename,
      mimeType: document.mime_type,
      sha256: document.sha256,
    };
    mediaId = document.id;
    logger.info(`📄 Received document from ${phoneNumber}`);
    content = `📄 ${document.filename || 'ملف'}${document.caption ? `: ${document.caption}` : ''}`;
    messageType = 'document';
  } else if (type === 'video' && video) {
    metaPayload = {
      mediaId: video.id,
      mimeType: video.mime_type,
      sha256: video.sha256,
    };
    mediaId = video.id;
    logger.info(`🎥 Received video from ${phoneNumber}`);
    content = video.caption || '🎥 فيديو';
    messageType = 'video';
  } else if (type === 'audio' && audio) {
    metaPayload = {
      mediaId: audio.id,
      mimeType: audio.mime_type,
      sha256: audio.sha256,
      voice: audio.voice || false,
    };
    mediaId = audio.id;
    logger.info(`🎤 Received audio from ${phoneNumber}`);
    content = audio.voice ? '🎤 رسالة صوتية' : '🎵 ملف صوتي';
    messageType = 'audio';
  } else {
    logger.warn(`Unknown media type: ${type}`);
    content = 'وسائط غير مدعومة';
    messageType = 'unknown';
  }

  return {
    content,
    messageType,
    metaPayload,
    mediaId,
  };
}
