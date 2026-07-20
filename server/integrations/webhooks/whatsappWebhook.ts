/**
 * WhatsApp Webhook Handler — معالج Webhook لـ WhatsApp Cloud API (مُعاد هيكلته)
 *
 * ✅ التحقق من X-Hub-Signature-256 (وفق وثائق Meta الرسمية)
 * ✅ معالجة message_template_status_update تلقائياً
 * ✅ معالجة Opt-Out (STOP) تلقائياً
 * ✅ حفظ الرسائل الواردة في قاعدة البيانات
 * ✅ تحديث حالة القوالب تلقائياً عند تغيير Meta لها
 *
 * وفق وثائق Meta الرسمية:
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview/
 */

import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import {
  getDb,
  getWhatsAppConversationByPhone,
  createWhatsAppConversation,
  createWhatsAppMessage,
  updateWhatsAppConversation,
  createWhatsAppAccountAlert,
  logWebhookEvent,
} from '../../database/db';
import {
  whatsappMessages,
  whatsappNotifications,
  whatsappContacts,
  whatsappOrders,
  whatsappReferrals,
  whatsappReactions,
} from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { verifyWebhookSignature, verifyWebhookToken } from './utils/signatureVerifier';
import { handleMessageFactory } from './handlers/messageHandlerFactory';
import { handleTemplateStatusUpdate } from './handlers/templateStatusHandler';
import type {
  MetaWebhookMessagePayload,
  MetaWebhookStatusPayload,
  MetaWebhookValuePayload,
  MetaWebhookContactPayload,
  MessageHandlerContext,
} from './types';

const logger = createLogger('whatsappWebhook');

// Re-export signature verification functions
export { verifyWebhookSignature, verifyWebhookToken };

// ─── Webhook Verification (GET) ────────────────────────────────────────────────

/**
 * معالج GET للتحقق من Webhook Token
 */
export async function handleWebhookVerification(req: Request, res: Response): Promise<void> {
  verifyWebhookToken(req, res);
}

// ─── Main Webhook Handler (POST) ───────────────────────────────────────────────

/**
 * معالج POST الرئيسي لاستقبال Webhook
 */
export async function handleWebhookPost(req: Request, res: Response): Promise<void> {
  try {
    // التحقق من التوقيع
    if (!verifyWebhookSignature(req)) {
      logger.warn('❌ Invalid webhook signature');
      res.status(403).json({ error: 'Invalid signature' });
      return;
    }

    const body = req.body as {
      entry?: Array<{ changes: Array<{ value: MetaWebhookValuePayload }> }>;
    };

    if (!body.entry || body.entry.length === 0) {
      logger.warn('No entry in webhook payload');
      res.status(200).json({ status: 'ok' });
      return;
    }

    const changes = body.entry[0].changes;
    if (!changes || changes.length === 0) {
      logger.warn('No changes in webhook payload');
      res.status(200).json({ status: 'ok' });
      return;
    }

    const value = changes[0].value;

    // تسجيل حدث Webhook
    await logWebhookEvent({
      eventType: 'webhook_received',
      rawPayload: JSON.stringify(body),
    });

    // معالجة الرسائل
    if (value.messages && value.messages.length > 0) {
      for (const message of value.messages) {
        await handleIncomingMessage(message, value.metadata, value.contacts);
      }
    }

    // معالجة تحديثات الحالة
    if (value.statuses && value.statuses.length > 0) {
      for (const status of value.statuses) {
        await handleMessageStatus(status);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── Message Handlers ──────────────────────────────────────────────────────────

/**
 * معالجة الرسائل الواردة وحفظها في قاعدة البيانات
 */
async function handleIncomingMessage(
  message: MetaWebhookMessagePayload,
  metadata: MetaWebhookValuePayload['metadata'],
  contacts?: MetaWebhookContactPayload[]
) {
  try {
    const { from, id: messageId, timestamp, type } = message;
    const contactsList = contacts || [];

    // التحقق من وجود البيانات الأساسية
    if (!from || !messageId || !type) {
      logger.error('❌ Missing required message fields');
      return;
    }

    logger.info(`📩 Incoming ${type} message from ${from} (msgId: ${messageId})`);

    // استخراج اسم العميل من contacts
    let customerName: string | undefined = undefined;
    if (
      contactsList &&
      Array.isArray(contactsList) &&
      contactsList.length > 0 &&
      contactsList[0].profile?.name
    ) {
      customerName = contactsList[0].profile.name;
    }

    // الحصول على أو إنشاء المحادثة
    const phoneNumber = from;
    let conversation = await getWhatsAppConversationByPhone(phoneNumber);

    if (!conversation) {
      let messagePreview = 'رسالة جديدة';
      if (type === 'text' && message.text?.body) {
        messagePreview = message.text.body.substring(0, 100);
      } else if (type === 'image' && message.image?.caption) {
        messagePreview = message.image.caption.substring(0, 100);
      } else if (type === 'document' && message.document?.filename) {
        messagePreview = message.document.filename;
      } else if (type === 'video' && message.video?.caption) {
        messagePreview = message.video.caption.substring(0, 100);
      } else if (type === 'audio') {
        messagePreview = '🎤 رسالة صوتية';
      } else if (type === 'location') {
        messagePreview = '📍 موقع';
      }

      const createResult = await createWhatsAppConversation({
        phoneNumber,
        customerName,
        lastMessage: messagePreview,
        lastMessageAt: new Date(),
        unreadCount: 1,
      });

      const insertId = Array.isArray(createResult)
        ? (createResult[0] as { insertId?: number | bigint } | undefined)?.insertId
        : undefined;

      if (insertId) {
        conversation = {
          id: Number(insertId),
          phoneNumber,
          customerName: customerName || null,
          lastMessage: messagePreview,
          lastMessageAt: new Date(),
          unreadCount: 1,
          isImportant: 0,
          isArchived: 0,
          leadId: null,
          appointmentId: null,
          offerLeadId: null,
          campRegistrationId: null,
          assignedToUserId: null,
          notes: null,
          conversationIdMeta: null,
          originType: null,
          expirationTimestamp: null,
          pricingModel: null,
          billable: false,
          pricingCategory: null,
          totalCost: 0,
          messageCount: 0,
          labOrderId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      } else {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 200);
        });
        conversation = await getWhatsAppConversationByPhone(phoneNumber);
      }
    }

    if (!conversation || !conversation.id) {
      logger.error('Failed to create or retrieve conversation');
      return;
    }

    // إنشاء سياق المعالجة
    const context: MessageHandlerContext = {
      phoneNumber,
      customerName,
      conversationId: conversation.id as number,
      messageId: 0, // سيتم تحديثه بعد الحفظ
      metadata,
    };

    // استخدام Factory لمعالجة الرسالة
    const result = await handleMessageFactory(message, context);

    if (!result) {
      // الرسالة تم تجاهلها (مثل Opt-Out)
      return;
    }

    // حفظ الرسالة في قاعدة البيانات
    const db = await getDb();
    if (!db) {
      logger.error('Database not available');
      return;
    }

    const newMessageResult = await createWhatsAppMessage({
      conversationId: conversation.id as number,
      direction: 'inbound',
      content: result.content,
      messageType: result.messageType as
        | 'text'
        | 'image'
        | 'document'
        | 'video'
        | 'audio'
        | 'location'
        | 'button_reply'
        | 'list_reply'
        | 'contacts'
        | 'sticker'
        | 'reaction'
        | 'order'
        | 'referral'
        | 'product_enquiry'
        | 'unsupported'
        | 'unknown',
      status: 'received',
      whatsappMessageId: messageId || null,
      sentAt: new Date(parseInt(timestamp || '0') * 1000),
      metadata: result.metaPayload ? JSON.stringify(result.metaPayload) : null,
      mediaId: result.mediaId,
    });

    const newMessageId = Array.isArray(newMessageResult)
      ? (newMessageResult[0] as { insertId?: number | bigint } | undefined)?.insertId
      : undefined;
    const normalizedNewMessageId = newMessageId !== undefined ? Number(newMessageId) : null;

    // حفظ البيانات الإضافية في الجداول المخصصة
    if (type === 'contacts' && message.contacts && normalizedNewMessageId !== null) {
      await handleContacts(
        message.contacts,
        conversation.id as number,
        normalizedNewMessageId,
        phoneNumber
      );
    }
    if (type === 'order' && message.order && normalizedNewMessageId !== null) {
      await handleOrders(
        message.order,
        conversation.id as number,
        normalizedNewMessageId,
        phoneNumber
      );
    }
    if (message.referral && normalizedNewMessageId !== null) {
      await handleReferrals(
        message.referral,
        conversation.id as number,
        normalizedNewMessageId,
        phoneNumber
      );
    }
    if (type === 'reaction' && message.reaction && normalizedNewMessageId !== null) {
      await handleReactions(
        message.reaction,
        conversation.id as number,
        normalizedNewMessageId,
        phoneNumber
      );
    }

    // تحديث المحادثة
    const updatedUnreadCount = ((conversation.unreadCount as number) || 0) + 1;
    await updateWhatsAppConversation(conversation.id as number, {
      lastMessage: result.content.substring(0, 100),
      lastMessageAt: new Date(),
      unreadCount: updatedUnreadCount,
    });

    // 🔔 Publish SSE events
    const { publish, channelForConversation, channelForUser } = await import('../../_core/pubsub');
    publish(channelForConversation(conversation.id as number), 'new_message', {
      id: newMessageId,
      conversationId: conversation.id as number,
      direction: 'inbound',
      content: result.content,
      messageType: result.messageType,
      status: 'received',
      whatsappMessageId: messageId || null,
      sentAt: new Date().toISOString(),
    });

    const ownerId = parseInt(process.env.OWNER_ID || '1', 10);
    publish(channelForUser(ownerId), 'new_inbound_message', {
      conversationId: conversation.id as number,
      phoneNumber,
      customerName: conversation.customerName,
      content: result.content.substring(0, 100),
      unreadCount: updatedUnreadCount,
      timestamp: new Date().toISOString(),
    });

    logger.info(`✅ Saved message to conversation ${conversation.id}`);
  } catch (error) {
    logger.error('Error handling incoming message:', error);
  }
}

/**
 * معالجة تحديثات حالة الرسائل (sent, delivered, read, failed)
 */
async function handleMessageStatus(status: MetaWebhookStatusPayload) {
  try {
    const { id: messageId, status: messageStatus, timestamp, recipient_id, errors } = status;

    logger.info(`📊 Message ${messageId} → ${messageStatus} (to: ${recipient_id})`);

    const db = await getDb();
    if (!db) {
      logger.error('Database not available for status update');
      return;
    }

    // تحديث حالة الرسالة
    await db
      .update(whatsappMessages)
      .set({
        status: messageStatus as 'received' | 'failed' | 'read' | 'sent' | 'delivered',
        deliveredAt:
          messageStatus === 'delivered' ? new Date(parseInt(timestamp) * 1000) : undefined,
        readAt: messageStatus === 'read' ? new Date(parseInt(timestamp) * 1000) : undefined,
      })
      .where(eq(whatsappMessages.whatsappMessageId, messageId));

    // تحديث حالة الإشعار
    await db
      .update(whatsappNotifications)
      .set({
        status: messageStatus as 'failed' | 'pending' | 'read' | 'sent' | 'delivered',
        errorMessage:
          messageStatus === 'failed' && errors && errors.length > 0
            ? `${errors[0].title}: ${errors[0].message}`
            : null,
        deliveredAt:
          messageStatus === 'delivered' ? new Date(parseInt(timestamp) * 1000) : undefined,
        readAt: messageStatus === 'read' ? new Date(parseInt(timestamp) * 1000) : undefined,
      })
      .where(eq(whatsappNotifications.metaMessageId, messageId));

    logger.info(`✅ Updated message status: ${messageId} → ${messageStatus}`);
  } catch {
    logger.error('Error handling message status');
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

async function handleContacts(
  contacts: MetaWebhookContactPayload[],
  conversationId: number,
  messageId: number,
  phoneNumber: string
) {
  try {
    const db = await getDb();
    if (!db) {
      return;
    }

    for (const contact of contacts) {
      await db.insert(whatsappContacts).values({
        messageId,
        conversationId,
        phoneNumber,
        addresses: contact.addresses ? JSON.stringify(contact.addresses) : null,
        birthday: contact.birthday || null,
        emails: contact.emails ? JSON.stringify(contact.emails) : null,
        name: contact.name ? JSON.stringify(contact.name) : null,
        org: contact.org ? JSON.stringify(contact.org) : null,
        phones: contact.phones ? JSON.stringify(contact.phones) : null,
        urls: contact.urls ? JSON.stringify(contact.urls) : null,
      });
    }
    logger.info(`✅ Saved ${contacts.length} contacts for ${phoneNumber}`);
  } catch (error) {
    logger.error('Error saving contacts:', error);
  }
}

async function handleOrders(
  order: { catalog_id?: string; product_items?: unknown[]; text?: string },
  conversationId: number,
  messageId: number,
  phoneNumber: string
) {
  try {
    const db = await getDb();
    if (!db) {
      return;
    }

    await db.insert(whatsappOrders).values({
      messageId,
      conversationId,
      phoneNumber,
      catalogId: order.catalog_id || null,
      productItems: order.product_items ? JSON.stringify(order.product_items) : null,
      orderText: order.text || null,
    });
    logger.info(`✅ Saved order for ${phoneNumber}`);
  } catch (error) {
    logger.error('Error saving order:', error);
  }
}

async function handleReferrals(
  referral: Record<string, unknown>,
  conversationId: number,
  messageId: number,
  phoneNumber: string
) {
  try {
    const db = await getDb();
    if (!db) {
      return;
    }

    await db.insert(whatsappReferrals).values({
      messageId,
      conversationId,
      phoneNumber,
      sourceUrl: (referral.source_url as string) || null,
      sourceId: (referral.source_id as string) || null,
      sourceType: (referral.source_type as string) || null,
      headline: (referral.headline as string) || null,
      body: (referral.body as string) || null,
      mediaType: (referral.media_type as string) || null,
      imageUrl: (referral.image_url as string) || null,
      videoUrl: (referral.video_url as string) || null,
      thumbnailUrl: (referral.thumbnail_url as string) || null,
    });
    logger.info(`✅ Saved referral for ${phoneNumber}`);
  } catch (error) {
    logger.error('Error saving referral:', error);
  }
}

async function handleReactions(
  reaction: Record<string, unknown>,
  conversationId: number,
  messageId: number,
  phoneNumber: string
) {
  try {
    const db = await getDb();
    if (!db) {
      return;
    }

    await db.insert(whatsappReactions).values({
      messageId,
      conversationId,
      phoneNumber,
      emoji: (reaction.emoji as string) || '',
      reactedToMessageId: (reaction.message_id as string) || null,
    });
    logger.info(`✅ Saved reaction for ${phoneNumber}`);
  } catch (error) {
    logger.error('Error saving reaction:', error);
  }
}

// ─── Template Status Handler ───────────────────────────────────────────────────

/**
 * معالجة تحديثات حالة القوالب
 */
export async function handleTemplateStatus(update: {
  message_template_id: string;
  message_template_name: string;
  event: string;
  reason?: string;
}) {
  await handleTemplateStatusUpdate(update);
}

// ─── Account Alert Handler ──────────────────────────────────────────────────────

/**
 * معالجة تنبيهات الحساب
 */
export async function handleAccountAlert(alert: { type: string; details: unknown }) {
  const { type: alertType, details } = alert;
  logger.warn(`⚠️  Account Alert: ${alertType}`, details);

  try {
    await createWhatsAppAccountAlert({
      alertType,
      details: JSON.stringify(details),
      severity:
        alertType === 'ACCOUNT_BANNED'
          ? 'critical'
          : alertType === 'PHONE_NUMBER_QUALITY_UPDATED'
            ? 'medium'
            : 'low',
      resolved: false,
    });
  } catch {
    logger.error('Error saving account alert');
  }

  // 🔔 Publish SSE event
  try {
    const { publish } = await import('../../_core/pubsub');
    publish('global:whatsapp', 'account_alert', {
      alertType,
      severity:
        alertType === 'ACCOUNT_BANNED'
          ? 'critical'
          : alertType === 'PHONE_NUMBER_QUALITY_UPDATED'
            ? 'medium'
            : 'low',
      details,
      timestamp: new Date().toISOString(),
    });
  } catch {
    logger.error('Error publishing account alert SSE');
  }
}
