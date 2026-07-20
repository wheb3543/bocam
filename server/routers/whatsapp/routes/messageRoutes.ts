/**
 * Message Routes
 * مسارات الرسائل الأساسية
 */

import { TRPCError } from '@trpc/server';
import * as db from '../../../database/db';
import { logOperation, validate24HourWindow, sendMessageByType } from '../utils/messageHelpers';
import { checkRateLimit } from '../utils/rateLimiter';

interface Context {
  user: {
    id: number;
  };
}

export const messageRoutes = {
  listByConversation: async ({ input }: { input: { conversationId: number } }) => {
    return db.getWhatsAppMessagesByConversation(input.conversationId);
  },

  send: async ({ input, ctx }: { input: Record<string, unknown>; ctx: Context }) => {
    const conversationId = input.conversationId as number;
    const message = input.message as string;
    const messageType = (input.messageType as string) || 'text';
    const replyToMessageId = input.replyToMessageId as number | undefined;
    const mediaUrl = input.mediaUrl as string | undefined;
    const mediaId = input.mediaId as string | undefined;

    logOperation('sendMessage', ctx.user.id, {
      conversationId,
      messageType,
      hasMediaUrl: !!mediaUrl,
    });

    try {
      // Rate limiting check
      const rateLimit = checkRateLimit(ctx.user.id);
      if (!rateLimit.allowed) {
        const resetInSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `تم تجاوز حد الإرسال. يرجى الانتظار ${resetInSeconds} ثانية قبل إرسال رسائل أخرى`,
        });
      }

      const conv = await db.getWhatsAppConversationById(conversationId);
      if (!conv) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة غير موجودة' });
      }

      // Server-side 24-hour window validation
      await validate24HourWindow(conversationId, async (id: number) => {
        const msg = await db.getLatestInboundWhatsAppMessage(id);
        if (!msg) {
          return null;
        }
        return {
          sentAt: msg.sentAt || undefined,
          createdAt: msg.createdAt || undefined,
        };
      });

      const result = await sendMessageByType(conv.phoneNumber, messageType, mediaId, message);

      if (result.success) {
        await db.createWhatsAppMessage({
          conversationId,
          direction: 'outbound',
          content: message,
          messageType: messageType as
            | 'text'
            | 'image'
            | 'document'
            | 'audio'
            | 'video'
            | 'location'
            | 'template'
            | 'interactive'
            | 'contacts'
            | 'unknown'
            | 'button_reply'
            | 'list_reply'
            | 'sticker'
            | 'reaction'
            | 'unsupported'
            | undefined,
          status: 'sent',
          sentBy: ctx.user.id,
          whatsappMessageId: result.messageId,
          replyToMessageId,
          mediaUrl,
          sentAt: new Date(),
        });

        await db.updateWhatsAppConversation(conversationId, {
          lastMessage: message,
          lastMessageAt: new Date(),
        });
      }

      return { ...result, rateLimit };
    } catch (error: unknown) {
      const { createLogger } = await import('../../../_core/logger');
      const logger = createLogger('whatsapp-messages');
      logger.error('Failed to send message:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'فشل إرسال الرسالة',
      });
    }
  },

  uploadMedia: async ({ input, ctx }: { input: Record<string, unknown>; ctx: Context }) => {
    const fileBuffer = input.fileBuffer as string;
    const mimeType = input.mimeType as string;

    logOperation('uploadMedia', ctx.user.id, { mimeType });

    try {
      const { uploadWhatsAppMedia } = await import('../../../services/whatsappCloudAPI');

      const buffer = Buffer.from(fileBuffer, 'base64');
      const result = await uploadWhatsAppMedia(buffer, mimeType);

      return result;
    } catch (error: unknown) {
      const { createLogger } = await import('../../../_core/logger');
      const logger = createLogger('whatsapp-messages');
      logger.error('Failed to upload media:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'فشل رفع الملف',
      });
    }
  },

  delete: async ({ input, ctx }: { input: Record<string, unknown>; ctx: Context }) => {
    const messageId = input.messageId as number;
    logOperation('deleteMessage', ctx.user.id, { messageId });

    const dbConn = await db.getDb();
    if (!dbConn) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'قاعدة البيانات غير متاحة',
      });
    }

    const { whatsappMessages } = await import('../../../../drizzle/schema');
    const { eq } = await import('drizzle-orm');
    await dbConn.delete(whatsappMessages).where(eq(whatsappMessages.id, messageId));

    return { success: true };
  },

  exportConversation: async ({ input, ctx }: { input: Record<string, unknown>; ctx: Context }) => {
    const conversationId = input.conversationId as number;
    logOperation('exportConversation', ctx.user.id, { conversationId });

    try {
      const dbConn = await db.getDb();
      if (!dbConn) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'قاعدة البيانات غير متاحة',
        });
      }

      const { whatsappMessages, whatsappConversations } =
        await import('../../../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      const conversations = await dbConn
        .select()
        .from(whatsappConversations)
        .where(eq(whatsappConversations.id, conversationId as number));

      if (!conversations || conversations.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة غير موجودة' });
      }

      const conversation = conversations[0];

      const messages = await dbConn
        .select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.conversationId, conversationId as number))
        .orderBy(whatsappMessages.createdAt);

      const exportData = {
        conversation: {
          id: conversation.id,
          customerName: conversation.customerName,
          phoneNumber: conversation.phoneNumber,
          createdAt: conversation.createdAt,
          lastMessageAt: conversation.lastMessageAt,
        },
        messages: messages.map((msg) => ({
          id: msg.id,
          direction: msg.direction,
          content: msg.content,
          messageType: msg.messageType,
          status: msg.status,
          sentAt: msg.sentAt,
          createdAt: msg.createdAt,
        })),
      };

      return { success: true, data: exportData };
    } catch (error: unknown) {
      const { createLogger } = await import('../../../_core/logger');
      const logger = createLogger('whatsapp-messages');
      logger.error('Failed to export conversation:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'فشل تصدير المحادثة',
      });
    }
  },

  searchInConversation: async ({ input }: { input: Record<string, unknown> }) => {
    const conversationId = input.conversationId as number;
    const searchTerm = input.searchTerm as string;

    const dbConn = await db.getDb();
    if (!dbConn) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'قاعدة البيانات غير متاحة',
      });
    }

    const { whatsappMessages } = await import('../../../../drizzle/schema');
    const { eq, or, like, and } = await import('drizzle-orm');

    const messages = await dbConn
      .select()
      .from(whatsappMessages)
      .where(
        and(
          eq(whatsappMessages.conversationId, conversationId as number),
          or(
            like(whatsappMessages.content, `%${searchTerm}%`),
            like(whatsappMessages.messageType, `%${searchTerm}%`)
          )
        )
      )
      .orderBy(whatsappMessages.createdAt);

    return messages;
  },

  forward: async ({ input, ctx }: { input: Record<string, unknown>; ctx: Context }) => {
    const messageId = input.messageId as number;
    const targetConversationId = input.targetConversationId as number;

    logOperation('forwardMessage', ctx.user.id, {
      messageId,
      targetConversationId,
    });

    const dbConn = await db.getDb();
    if (!dbConn) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'قاعدة البيانات غير متاحة',
      });
    }

    const { whatsappMessages, whatsappConversations } = await import('../../../../drizzle/schema');
    const { eq } = await import('drizzle-orm');

    const originalMessages = await dbConn
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.id, messageId))
      .limit(1);

    if (!originalMessages.length) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'الرسالة الأصلية غير موجودة' });
    }
    const original = originalMessages[0];

    const targetConvs = await dbConn
      .select()
      .from(whatsappConversations)
      .where(eq(whatsappConversations.id, targetConversationId))
      .limit(1);

    if (!targetConvs.length) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة الهدف غير موجودة' });
    }
    const targetConv = targetConvs[0];

    const { sendWhatsAppTextMessage } = await import('../../../services/whatsappCloudAPI');
    const result = await sendWhatsAppTextMessage(targetConv.phoneNumber, original.content);

    if (result.success) {
      await db.createWhatsAppMessage({
        conversationId: targetConversationId,
        direction: 'outbound',
        content: original.content,
        messageType: original.messageType,
        status: 'sent',
        sentBy: ctx.user.id,
        whatsappMessageId: result.messageId,
        sentAt: new Date(),
      });

      await db.updateWhatsAppConversation(targetConversationId, {
        lastMessage: original.content,
        lastMessageAt: new Date(),
      });
    }

    return result;
  },
};
