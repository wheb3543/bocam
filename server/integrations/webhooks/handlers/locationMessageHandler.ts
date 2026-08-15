import { MetaWebhookMessagePayload, MessageHandlerContext, MessageHandlerResult } from '../types';
import { createLogger } from '../../../_core/logger';

const logger = createLogger('locationMessageHandler');

/**
 * معالجة رسائل الموقع الجغرافي
 *
 * @param message - payload الرسالة
 * @param context - سياق المعالجة
 * @returns نتيجة المعالجة
 */
export async function handleLocationMessage(
  message: MetaWebhookMessagePayload,
  context: MessageHandlerContext
): Promise<MessageHandlerResult> {
  const { location } = message;
  const { phoneNumber } = context;

  if (!location) {
    logger.warn('Location message has no location data');
    return {
      content: 'موقع غير مدعوم',
      messageType: 'unknown',
      metaPayload: null,
    };
  }

  const { latitude, longitude, name, address } = location;
  const content = `📍 الموقع: ${latitude}, ${longitude}${name ? ` (${name})` : ''}${address ? ` - ${address}` : ''}`;

  const metaPayload = {
    latitude,
    longitude,
    name,
    address,
  };

  logger.info(`📍 Received location from ${phoneNumber}: ${latitude}, ${longitude}`);

  return {
    content,
    messageType: 'location',
    metaPayload,
  };
}
