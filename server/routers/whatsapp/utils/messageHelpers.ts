/**
 * Message Helpers
 * دوال مساعدة للرسائل
 */

import { createLogger } from '../../../_core/logger';

const logger = createLogger('whatsapp-messages');

// Logging helper for sensitive operations
export function logOperation(operation: string, userId: number, details: unknown) {
  logger.info(`${operation} | User: ${userId} | Details:`, JSON.stringify(details));
}

// Validate 24-hour window for WhatsApp messaging
export async function validate24HourWindow(
  conversationId: number,
  getLatestInboundMessage: (
    id: number
  ) => Promise<{ sentAt?: string | Date; createdAt?: string | Date } | null>
): Promise<void> {
  const latestInboundMessage = await getLatestInboundMessage(conversationId);
  const lastInboundMessageTime = latestInboundMessage?.sentAt
    ? new Date(latestInboundMessage.sentAt)
    : latestInboundMessage?.createdAt
      ? new Date(latestInboundMessage.createdAt)
      : null;
  const now = new Date();
  const hoursSinceLastInboundMessage = lastInboundMessageTime
    ? (now.getTime() - lastInboundMessageTime.getTime()) / (1000 * 60 * 60)
    : Infinity;

  if (hoursSinceLastInboundMessage > 24) {
    logger.warn(
      latestInboundMessage
        ? `24-hour window exceeded for conversation ${conversationId}. Last inbound message was ${hoursSinceLastInboundMessage.toFixed(1)} hours ago.`
        : `24-hour window exceeded for conversation ${conversationId}. No inbound user message found for this conversation.`
    );
  }
}

// Send message based on type
export async function sendMessageByType(
  phoneNumber: string,
  messageType: string,
  mediaId: string | undefined,
  message: string
): Promise<{ success: boolean; messageId?: string }> {
  const {
    sendWhatsAppTextMessage,
    sendWhatsAppImageMessage,
    sendWhatsAppVideoMessage,
    sendWhatsAppAudioMessage,
    sendWhatsAppDocumentMessage,
  } = await import('../../../services/whatsappCloudAPI');

  if (mediaId && messageType !== 'text') {
    if (messageType === 'image') {
      return sendWhatsAppImageMessage(phoneNumber, mediaId, message);
    } else if (messageType === 'video') {
      return sendWhatsAppVideoMessage(phoneNumber, mediaId, message);
    } else if (messageType === 'audio') {
      return sendWhatsAppAudioMessage(phoneNumber, mediaId);
    } else if (messageType === 'document') {
      return sendWhatsAppDocumentMessage(phoneNumber, mediaId, message);
    }
  }

  return sendWhatsAppTextMessage(phoneNumber, message);
}
