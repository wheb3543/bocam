import { MetaWebhookMessagePayload, MessageHandlerContext, MessageHandlerResult } from '../types';
import { createLogger } from '../../../_core/logger';
import { handleTextMessage } from './textMessageHandler';
import { handleMediaMessage } from './mediaMessageHandler';
import { handleInteractiveMessage } from './interactiveMessageHandler';
import { handleLocationMessage } from './locationMessageHandler';

const logger = createLogger('messageHandlerFactory');

/**
 * Factory pattern لتوجيه الرسائل إلى المعالج المناسب
 * بناءً على نوع الرسالة
 *
 * @param message - payload الرسالة
 * @param context - سياق المعالجة
 * @returns نتيجة المعالجة أو null إذا كان يجب تجاهل الرسالة
 */
export async function handleMessageFactory(
  message: MetaWebhookMessagePayload,
  context: MessageHandlerContext
): Promise<MessageHandlerResult | null> {
  const { type } = message;

  logger.info(`📩 Processing ${type} message from ${context.phoneNumber}`);

  try {
    switch (type) {
      case 'text':
        return await handleTextMessage(message, context);

      case 'image':
      case 'document':
      case 'video':
      case 'audio':
        return await handleMediaMessage(message, context);

      case 'button':
      case 'interactive':
        return await handleInteractiveMessage(message, context);

      case 'location':
        return await handleLocationMessage(message, context);

      case 'contacts':
        return {
          content: '👥 جهات اتصال',
          messageType: 'contacts',
          metaPayload: {
            contacts: message.contacts?.map((contact) => ({
              addresses: contact.addresses,
              birthday: contact.birthday,
              emails: contact.emails,
              name: contact.name,
              org: contact.org,
              phones: contact.phones,
              urls: contact.urls,
            })),
          },
        };

      case 'sticker':
        return {
          content: '🎨 ملصق',
          messageType: 'sticker',
          metaPayload: {
            mediaId: (message.sticker as { id?: string })?.id,
            animated: (message.sticker as { animated?: boolean })?.animated || false,
            mimeType: (message.sticker as { mime_type?: string })?.mime_type,
            sha256: (message.sticker as { sha256?: string })?.sha256,
          },
        };

      case 'reaction':
        return {
          content: `رد فعل: ${(message.reaction as { emoji?: string })?.emoji}`,
          messageType: 'reaction',
          metaPayload: {
            emoji: (message.reaction as { emoji?: string })?.emoji,
            messageId:
              (message.reaction as { messsage_id?: string; message_id?: string })?.messsage_id ||
              (message.reaction as { message_id?: string })?.message_id,
          },
        };

      case 'order':
        return {
          content: `🛒 طلب: ${(message.order as { text?: string })?.text || 'بدون نص'}`,
          messageType: 'order',
          metaPayload: {
            catalogId: (message.order as { catalog_id?: string })?.catalog_id,
            productItems: (message.order as { product_items?: unknown[] })?.product_items,
            text: (message.order as { text?: string })?.text,
          },
        };

      case 'referral':
        return {
          content: `📢 إحالة من إعلان: ${(message.referral as { headline?: string })?.headline || (message.referral as { body?: string })?.body || ''}`,
          messageType: 'referral',
          metaPayload: {
            sourceUrl: (message.referral as { source_url?: string })?.source_url,
            sourceId: (message.referral as { source_id?: string })?.source_id,
            sourceType: (message.referral as { source_type?: string })?.source_type,
            headline: (message.referral as { headline?: string })?.headline,
            body: (message.referral as { body?: string })?.body,
            mediaType: (message.referral as { media_type?: string })?.media_type,
            imageUrl: (message.referral as { image_url?: string })?.image_url,
            videoUrl: (message.referral as { video_url?: string })?.video_url,
            thumbnailUrl: (message.referral as { thumbnail_url?: string })?.thumbnail_url,
          },
        };

      case 'unsupported':
        return {
          content: '🗑️ رسالة محذوفة أو غير مدعومة',
          messageType: 'unsupported',
          metaPayload: {
            errors: message.errors,
          },
        };

      default:
        logger.warn(`Unknown message type: ${type}`);
        return {
          content: 'رسالة غير مدعومة',
          messageType: 'unknown',
          metaPayload: null,
        };
    }
  } catch (error) {
    logger.error(`Error handling ${type} message:`, error);
    return {
      content: 'خطأ في معالجة الرسالة',
      messageType: 'error',
      metaPayload: null,
    };
  }
}
