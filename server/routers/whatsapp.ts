import {
  protectedProcedure,
  publicProcedure,
  router,
  adminProcedure,
  requireWhatsAppFeature,
} from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import * as db from '../database/db';
import { meta } from '../api/MetaApiService';
import { z } from 'zod';
import {
  sendWhatsAppTextMessage,
  getWhatsAppAPIStatus,
  formatPhoneNumber,
  sendWhatsAppTypingIndicator,
} from '../services/whatsappCloudAPI';
import {
  sendTextMessage,
  sendWelcomeMessage,
  sendBookingConfirmation,
  verifyWhatsAppHealth,
} from '../services/whatsappService';
import { normalizePhoneNumber } from '../database/db';
// whatsappBot removed — using sendWhatsAppTextMessage (Cloud API) directly

// Logging helper for sensitive operations
function logOperation(operation: string, userId: number, details: unknown) {
  console.log(
    `[WhatsApp Audit] ${operation} | User: ${userId} | Details:`,
    JSON.stringify(details)
  );
}

// Simple in-memory rate limiter for manual messages
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 messages per minute per user

function checkRateLimit(userId: number): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const key = `user:${userId}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}

export const whatsappRouter = router({
  // WhatsApp Cloud API Status
  connection: router({
    status: protectedProcedure.query(async () => {
      return getWhatsAppAPIStatus();
    }),

    setupHealth: protectedProcedure.query(async () => {
      return verifyWhatsAppHealth();
    }),

    registerPhoneNumber: adminProcedure
      .input(
        z.object({
          pin: z.string().regex(/^\d{6}$/, 'PIN يجب أن يكون 6 أرقام'),
          phoneNumberId: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const phoneNumberId = input.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (!phoneNumberId) {
          return { success: false, error: 'WHATSAPP_PHONE_NUMBER_ID غير مُعيَّن' };
        }

        logOperation('registerPhoneNumber', ctx.user.id, {
          phoneNumberId,
        });

        const result = await meta.registerWhatsAppPhoneNumber(phoneNumberId, input.pin);
        return result.success
          ? {
              success: true,
              message: 'تم تسجيل رقم الهاتف بنجاح في WhatsApp Cloud API',
              data: result.data,
            }
          : { success: false, error: result.error };
      }),

    subscribeAppToWaba: adminProcedure
      .input(
        z.object({
          wabaId: z.string().optional(),
          overrideCallbackUri: z.string().url().optional(),
          verifyToken: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const wabaId = input.wabaId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
        if (!wabaId) {
          return { success: false, error: 'WHATSAPP_BUSINESS_ACCOUNT_ID غير مُعيَّن' };
        }

        const verifyToken =
          input.verifyToken ||
          process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
          process.env.WEBHOOK_VERIFY_TOKEN;

        if (input.overrideCallbackUri && !verifyToken) {
          return {
            success: false,
            error: 'عند استخدام override_callback_uri يجب توفير verify_token',
          };
        }

        logOperation('subscribeAppToWaba', ctx.user.id, {
          wabaId,
          hasOverrideCallbackUri: !!input.overrideCallbackUri,
        });

        const result = await meta.subscribeAppToWaba(wabaId, {
          overrideCallbackUri: input.overrideCallbackUri,
          verifyToken,
        });

        return result.success
          ? { success: true, message: 'تم اشتراك التطبيق في WABA بنجاح', data: result.data }
          : { success: false, error: result.error };
      }),
  }),

  // Conversations
  conversations: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllWhatsAppConversations();
    }),

    getCustomerInfo: protectedProcedure
      .input(z.object({ phone: z.string().min(1, 'رقم الهاتف مطلوب') }))
      .query(async ({ input }) => {
        return await db.getCustomerInfoByPhone(input.phone);
      }),

    getCustomerRecords: protectedProcedure
      .input(z.object({ phone: z.string().min(1, 'رقم الهاتف مطلوب') }))
      .query(async ({ input }) => {
        return await db.getAllCustomerRecordsByPhone(input.phone);
      }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getWhatsAppConversationById(input.id);
    }),

    search: protectedProcedure
      .input(z.object({ searchTerm: z.string().min(1, 'مصطلح البحث مطلوب') }))
      .query(async ({ input }) => {
        return await db.searchWhatsAppConversations(input.searchTerm);
      }),

    unreadCount: protectedProcedure.query(async () => {
      return await db.getUnreadWhatsAppConversationsCount();
    }),

    create: protectedProcedure
      .input(
        z.object({
          customerName: z.string().min(1, 'اسم العميل مطلوب'),
          customerPhone: z
            .string()
            .min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل')
            .max(15, 'رقم الهاتف طويل جداً'),
          leadId: z.number().optional(),
          appointmentId: z.number().optional(),
          offerLeadId: z.number().optional(),
          campRegistrationId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createWhatsAppConversation({
          phoneNumber: input.customerPhone,
          customerName: input.customerName,
          lastMessageAt: new Date(),
          unreadCount: 0,
          isImportant: 0,
          isArchived: 0,
          leadId: input.leadId,
          appointmentId: input.appointmentId,
          offerLeadId: input.offerLeadId,
          campRegistrationId: input.campRegistrationId,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          customerName: z.string().optional(),
          unreadCount: z.number().optional(),
          important: z.boolean().optional(),
          archived: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        logOperation('updateConversation', ctx.user.id, {
          conversationId: input.id,
          hasCustomerName: !!input.customerName,
          hasUnreadCount: input.unreadCount !== undefined,
          hasImportant: input.important !== undefined,
          hasArchived: input.archived !== undefined,
        });

        const { id, important, archived, ...rest } = input;
        const updateData: Record<string, unknown> = { ...rest };
        // تحويل important/archived إلى أسماء الحقول الصحيحة في DB
        if (important !== undefined) updateData.isImportant = important ? 1 : 0;
        if (archived !== undefined) updateData.isArchived = archived ? 1 : 0;
        return await db.updateWhatsAppConversation(id, updateData);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        logOperation('markAsRead', ctx.user.id, { conversationId: input.id });

        return await db.updateWhatsAppConversation(input.id, {
          unreadCount: 0,
        });
      }),

    assignToUser: protectedProcedure
      .input(z.object({ id: z.number(), userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        logOperation('assignToUser', ctx.user.id, {
          conversationId: input.id,
          assignedToUserId: input.userId,
        });

        return await db.updateWhatsAppConversation(input.id, {
          assignedToUserId: input.userId,
        });
      }),

    updateNotes: protectedProcedure
      .input(z.object({ id: z.number(), notes: z.string() }))
      .mutation(async ({ input, ctx }) => {
        logOperation('updateNotes', ctx.user.id, {
          conversationId: input.id,
          hasNotes: !!input.notes,
        });

        return await db.updateWhatsAppConversation(input.id, {
          notes: input.notes,
        });
      }),

    updateName: protectedProcedure
      .input(z.object({ id: z.number(), customerName: z.string() }))
      .mutation(async ({ input, ctx }) => {
        logOperation('updateName', ctx.user.id, {
          conversationId: input.id,
          customerName: input.customerName,
        });

        return await db.updateWhatsAppConversation(input.id, {
          customerName: input.customerName,
        });
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      logOperation('deleteConversation', ctx.user.id, { conversationId: input.id });

      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });

      const { whatsappConversations, whatsappMessages } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Delete all messages in the conversation first
      await dbConn.delete(whatsappMessages).where(eq(whatsappMessages.conversationId, input.id));

      // Delete the conversation
      await dbConn.delete(whatsappConversations).where(eq(whatsappConversations.id, input.id));

      return { success: true };
    }),

    bulkArchive: adminProcedure
      .input(z.object({ ids: z.array(z.number()).min(1, 'يجب تحديد محادثة واحدة على الأقل') }))
      .mutation(async ({ input, ctx }) => {
        logOperation('bulkArchive', ctx.user.id, { conversationIds: input.ids });

        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });

        const { whatsappConversations } = await import('../../drizzle/schema');
        const { eq, inArray } = await import('drizzle-orm');

        await dbConn
          .update(whatsappConversations)
          .set({ isArchived: 1, updatedAt: new Date() })
          .where(inArray(whatsappConversations.id, input.ids));

        return { success: true, count: input.ids.length };
      }),

    bulkMarkImportant: adminProcedure
      .input(
        z.object({
          ids: z.array(z.number()).min(1, 'يجب تحديد محادثة واحدة على الأقل'),
          important: z.number().min(0).max(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        logOperation('bulkMarkImportant', ctx.user.id, {
          conversationIds: input.ids,
          important: input.important,
        });

        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });

        const { whatsappConversations } = await import('../../drizzle/schema');
        const { inArray } = await import('drizzle-orm');

        await dbConn
          .update(whatsappConversations)
          .set({ isImportant: input.important, updatedAt: new Date() })
          .where(inArray(whatsappConversations.id, input.ids));

        return { success: true, count: input.ids.length };
      }),

    getStats: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });

        const { whatsappMessages } = await import('../../drizzle/schema');
        const { eq, count, sql } = await import('drizzle-orm');

        const messages = await dbConn
          .select()
          .from(whatsappMessages)
          .where(eq(whatsappMessages.conversationId, input.conversationId));

        const totalMessages = messages.length;
        const inboundMessages = messages.filter((m) => m.direction === 'inbound').length;
        const outboundMessages = messages.filter((m) => m.direction === 'outbound').length;
        const templateMessages = messages.filter((m) => m.messageType === 'template').length;

        const firstMessage = messages[0];
        const lastMessage = messages[messages.length - 1];

        // Calculate average response time (simplified)
        let avgResponseTime = 0;
        let responseCount = 0;
        for (let i = 1; i < messages.length; i++) {
          if (messages[i].direction === 'outbound' && messages[i - 1].direction === 'inbound') {
            const prevTime = new Date(messages[i - 1].createdAt).getTime();
            const currTime = new Date(messages[i].createdAt).getTime();
            avgResponseTime += currTime - prevTime;
            responseCount++;
          }
        }
        avgResponseTime = responseCount > 0 ? avgResponseTime / responseCount : 0;

        return {
          totalMessages,
          inboundMessages,
          outboundMessages,
          templateMessages,
          firstMessageAt: firstMessage?.createdAt,
          lastMessageAt: lastMessage?.createdAt,
          avgResponseTimeMs: avgResponseTime,
          avgResponseTimeMinutes: Math.round(avgResponseTime / (1000 * 60)),
        };
      }),

    exportConversation: protectedProcedure
      .input(z.object({ conversationId: z.number(), format: z.enum(['json', 'csv']).optional() }))
      .query(async ({ input, ctx }) => {
        logOperation('exportConversation', ctx.user.id, {
          conversationId: input.conversationId,
          format: input.format || 'json',
        });

        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });

        const { whatsappMessages, whatsappConversations } = await import('../../drizzle/schema');
        const { eq } = await import('drizzle-orm');

        const conversation = await dbConn
          .select()
          .from(whatsappConversations)
          .where(eq(whatsappConversations.id, input.conversationId))
          .limit(1);

        if (!conversation || conversation.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة غير موجودة' });
        }

        const messages = await dbConn
          .select()
          .from(whatsappMessages)
          .where(eq(whatsappMessages.conversationId, input.conversationId))
          .orderBy(whatsappMessages.createdAt);

        const format = input.format || 'json';

        if (format === 'csv') {
          // Convert to CSV format
          const csvHeaders = 'ID,Direction,Content,MessageType,Status,CreatedAt,SentBy\n';
          const csvRows = messages
            .map(
              (m) =>
                `${m.id},${m.direction},"${m.content.replace(/"/g, '""')}",${m.messageType},${m.status},${m.createdAt},${m.sentBy || ''}`
            )
            .join('\n');
          const csvContent = csvHeaders + csvRows;

          return {
            conversation: conversation[0],
            messages,
            exportData: csvContent,
            format: 'csv',
            filename: `conversation_${input.conversationId}_${Date.now()}.csv`,
          };
        }

        return {
          conversation: conversation[0],
          messages,
          exportData: JSON.stringify({ conversation: conversation[0], messages }, null, 2),
          format: 'json',
          filename: `conversation_${input.conversationId}_${Date.now()}.json`,
        };
      }),
  }),

  // Messages
  messages: router({
    listByConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getWhatsAppMessagesByConversation(input.conversationId);
      }),

    send: protectedProcedure
      // @ts-ignore - tRPC middleware type compatibility issue
      .use(requireWhatsAppFeature())
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
          replyToMessageId: z.number().optional(),
          mediaUrl: z.string().optional(),
          mediaId: z.string().optional(),
          messageType: z
            .enum([
              'text',
              'image',
              'document',
              'audio',
              'video',
              'location',
              'template',
              'interactive',
              'contacts',
              'unknown',
            ])
            .optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        logOperation('sendMessage', ctx.user.id, {
          conversationId: input.conversationId,
          messageType: input.messageType || 'text',
          hasMediaUrl: !!input.mediaUrl,
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

          const conv = await db.getWhatsAppConversationById(input.conversationId);
          if (!conv) throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة غير موجودة' });

          // Server-side 24-hour window validation
          const latestInboundMessage = await db.getLatestInboundWhatsAppMessage(
            input.conversationId
          );
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
            console.warn(
              latestInboundMessage
                ? `[WhatsApp] 24-hour window exceeded for conversation ${input.conversationId}. Last inbound message was ${hoursSinceLastInboundMessage.toFixed(1)} hours ago.`
                : `[WhatsApp] 24-hour window exceeded for conversation ${input.conversationId}. No inbound user message found for this conversation.`
            );
            // Note: We still allow sending but log a warning. For strict enforcement, uncomment below:
            // throw new Error("Cannot send free-form text message: 24-hour messaging window exceeded. Use a template message instead.");
          }

          let result;
          const messageType = input.messageType || 'text';

          // Send message based on type
          if (input.mediaId && messageType !== 'text') {
            // Send media message using mediaId
            const {
              sendWhatsAppImageMessage,
              sendWhatsAppVideoMessage,
              sendWhatsAppAudioMessage,
              sendWhatsAppDocumentMessage,
            } = await import('../services/whatsappCloudAPI');

            if (messageType === 'image') {
              result = await sendWhatsAppImageMessage(
                conv.phoneNumber,
                input.mediaId,
                input.message
              );
            } else if (messageType === 'video') {
              result = await sendWhatsAppVideoMessage(
                conv.phoneNumber,
                input.mediaId,
                input.message
              );
            } else if (messageType === 'audio') {
              result = await sendWhatsAppAudioMessage(conv.phoneNumber, input.mediaId);
            } else if (messageType === 'document') {
              result = await sendWhatsAppDocumentMessage(
                conv.phoneNumber,
                input.mediaId,
                input.message
              );
            } else {
              // Fallback to text message
              result = await sendWhatsAppTextMessage(conv.phoneNumber, input.message);
            }
          } else {
            // Send text message
            result = await sendWhatsAppTextMessage(conv.phoneNumber, input.message);
          }

          if (result.success) {
            await db.createWhatsAppMessage({
              conversationId: input.conversationId,
              direction: 'outbound',
              content: input.message,
              messageType: messageType,
              status: 'sent',
              sentBy: ctx.user.id,
              whatsappMessageId: result.messageId,
              replyToMessageId: input.replyToMessageId,
              mediaUrl: input.mediaUrl,
              sentAt: new Date(),
            });

            await db.updateWhatsAppConversation(input.conversationId, {
              lastMessage: input.message,
              lastMessageAt: new Date(),
            });
          }

          return { ...result, rateLimit };
        } catch (error: unknown) {
          console.error('[WhatsApp] Failed to send message:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'فشل إرسال الرسالة',
          });
        }
      }),

    uploadMedia: protectedProcedure
      .input(
        z.object({
          fileBuffer: z.string(), // base64 encoded buffer
          mimeType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        logOperation('uploadMedia', ctx.user.id, { mimeType: input.mimeType });

        try {
          const { uploadWhatsAppMedia } = await import('../services/whatsappCloudAPI');

          const buffer = Buffer.from(input.fileBuffer, 'base64');
          const result = await uploadWhatsAppMedia(buffer, input.mimeType);

          return result;
        } catch (error: unknown) {
          console.error('[WhatsApp] Failed to upload media:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'فشل رفع الملف',
          });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        logOperation('deleteMessage', ctx.user.id, { messageId: input.messageId });

        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });

        const { whatsappMessages } = await import('../../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await dbConn.delete(whatsappMessages).where(eq(whatsappMessages.id, input.messageId));

        return { success: true };
      }),

    exportConversation: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        logOperation('exportConversation', ctx.user.id, { conversationId: input.conversationId });

        try {
          const dbConn = await db.getDb();
          if (!dbConn)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'قاعدة البيانات غير متاحة',
            });

          const { whatsappMessages, whatsappConversations } = await import('../../drizzle/schema');
          const { eq } = await import('drizzle-orm');

          // Get conversation details
          const conversations = await dbConn
            .select()
            .from(whatsappConversations)
            .where(eq(whatsappConversations.id, input.conversationId));

          if (!conversations || conversations.length === 0) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة غير موجودة' });
          }

          const conversation = conversations[0];

          // Get all messages for the conversation
          const messages = await dbConn
            .select()
            .from(whatsappMessages)
            .where(eq(whatsappMessages.conversationId, input.conversationId))
            .orderBy(whatsappMessages.createdAt);

          // Format data for export
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
          console.error('[WhatsApp] Failed to export conversation:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'فشل تصدير المحادثة',
          });
        }
      }),

    searchInConversation: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          searchTerm: z.string().min(1, 'مصطلح البحث مطلوب'),
        })
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });

        const { whatsappMessages } = await import('../../drizzle/schema');
        const { eq, or, like, and } = await import('drizzle-orm');

        const messages = await dbConn
          .select()
          .from(whatsappMessages)
          .where(
            and(
              eq(whatsappMessages.conversationId, input.conversationId),
              or(
                like(whatsappMessages.content, `%${input.searchTerm}%`),
                like(whatsappMessages.messageType, `%${input.searchTerm}%`)
              )
            )
          )
          .orderBy(whatsappMessages.createdAt);

        return messages;
      }),

    forward: protectedProcedure
      .input(
        z.object({
          messageId: z.number(),
          targetConversationId: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        logOperation('forwardMessage', ctx.user.id, {
          messageId: input.messageId,
          targetConversationId: input.targetConversationId,
        });

        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });

        const { whatsappMessages, whatsappConversations } = await import('../../drizzle/schema');
        const { eq } = await import('drizzle-orm');

        // Get original message
        const originalMessages = await dbConn
          .select()
          .from(whatsappMessages)
          .where(eq(whatsappMessages.id, input.messageId))
          .limit(1);

        if (!originalMessages.length)
          throw new TRPCError({ code: 'NOT_FOUND', message: 'الرسالة الأصلية غير موجودة' });
        const original = originalMessages[0];

        // Get target conversation
        const targetConvs = await dbConn
          .select()
          .from(whatsappConversations)
          .where(eq(whatsappConversations.id, input.targetConversationId))
          .limit(1);

        if (!targetConvs.length)
          throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة الهدف غير موجودة' });
        const targetConv = targetConvs[0];

        // Send the message to target conversation
        const result = await sendWhatsAppTextMessage(targetConv.phoneNumber, original.content);

        if (result.success) {
          await db.createWhatsAppMessage({
            conversationId: input.targetConversationId,
            direction: 'outbound',
            content: original.content,
            messageType: original.messageType,
            status: 'sent',
            sentBy: ctx.user.id,
            whatsappMessageId: result.messageId,
            sentAt: new Date(),
          });

          await db.updateWhatsAppConversation(input.targetConversationId, {
            lastMessage: original.content,
            lastMessageAt: new Date(),
          });
        }

        return result;
      }),
  }),

  // Templates
  templates: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllWhatsAppTemplates();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getWhatsAppTemplateById(input.id);
    }),

    syncFromMeta: protectedProcedure.mutation(async () => {
      const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
      const hasToken = !!process.env.META_ACCESS_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      console.log(`[syncFromMeta] WABA_ID=${wabaId}, PHONE_ID=${phoneId}, HAS_TOKEN=${hasToken}`);

      if (!wabaId) {
        return {
          success: false,
          error: 'WHATSAPP_BUSINESS_ACCOUNT_ID غير مُعيَّن في متغيرات البيئة',
          synced: 0,
          updated: 0,
        };
      }
      if (!hasToken) {
        return {
          success: false,
          error: 'META_ACCESS_TOKEN غير مُعيَّن في متغيرات البيئة',
          synced: 0,
          updated: 0,
        };
      }

      const { syncTemplatesFromMeta } = await import('../services/whatsappTemplates');
      const result = await syncTemplatesFromMeta();
      console.log(`[syncFromMeta] Result:`, JSON.stringify(result));
      return result;
    }),

    syncStatus: protectedProcedure.mutation(async () => {
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const hasToken = !!process.env.META_ACCESS_TOKEN;

      if (!phoneId) {
        return {
          success: false,
          error: 'WHATSAPP_PHONE_NUMBER_ID غير مُعيَّن في متغيرات البيئة',
        };
      }
      if (!hasToken) {
        return {
          success: false,
          error: 'META_ACCESS_TOKEN غير مُعيَّن في متغيرات البيئة',
        };
      }

      const { syncAllTemplates } = await import('../services/templateSyncService');
      const result = await syncAllTemplates(phoneId);
      console.log(`[syncStatus] Result:`, JSON.stringify(result));
      return result;
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          content: z.string().min(1),
          category: z.string(),
          language: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createTemplate } = await import('../services/whatsappTemplates');
        return createTemplate(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          content: z.string().optional(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateTemplate } = await import('../services/whatsappTemplates');
        return updateTemplate(input.id, input);
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const { deleteTemplate } = await import('../services/whatsappTemplates');
      return deleteTemplate(input.id);
    }),
  }),

  // Phase 2 Procedures
  sendSimpleText: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        message: z.string().min(1).max(4096),
        priority: z.enum(['high', 'normal', 'low']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return sendTextMessage(input.phone, input.message, {
        priority: input.priority,
      });
    }),

  sendWelcomeMsg: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        fullName: z.string().min(1),
        campaignName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return sendWelcomeMessage({
        phone: input.phone,
        fullName: input.fullName,
        campaignName: input.campaignName,
      });
    }),

  health: publicProcedure.query(async () => {
    return verifyWhatsAppHealth();
  }),

  testConnection: protectedProcedure
    .input(z.object({ phone: z.string().min(9).max(15) }))
    .mutation(async ({ input }) => {
      try {
        const normalizedPhone = normalizePhoneNumber(input.phone);
        const testMessage = `اختبار الاتصال بـ WhatsApp ✅\nالوقت: ${new Date().toLocaleString('ar-YE')}`;

        const result = await sendWhatsAppTextMessage(normalizedPhone, testMessage);

        return {
          success: result.success,
          message: result.success ? 'تم إرسال رسالة الاختبار بنجاح' : undefined,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  normalizePhone: publicProcedure.input(z.object({ phone: z.string() })).query(({ input }) => {
    const normalized = normalizePhoneNumber(input.phone);
    return {
      original: input.phone,
      normalized,
      isValid: normalized.length >= 9 && normalized.length <= 15,
    };
  }),
  sendTypingIndicator: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        typing: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const conv = await db.getWhatsAppConversationById(input.conversationId);
      if (!conv) throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة غير موجودة' });

      if (!input.typing) {
        return { success: true };
      }

      const latestInboundMessage = await db.getLatestInboundWhatsAppMessage(input.conversationId);

      if (!latestInboundMessage?.whatsappMessageId) {
        return {
          success: false,
          error: 'لا يمكن إرسال مؤشر الكتابة قبل وجود رسالة واردة بمعرف واتساب صالح',
        };
      }

      const result = await sendWhatsAppTypingIndicator(
        conv.phoneNumber,
        latestInboundMessage.whatsappMessageId,
        true
      );

      // 🔔 Publish SSE event to global channel for typing indicator
      if (result.success) {
        try {
          const { publish } = await import('../_core/pubsub');
          publish('global:whatsapp', 'typing', {
            conversationId: input.conversationId,
            phoneNumber: conv.phoneNumber,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error(error instanceof Error ? error.message : String(error)); console.error('[WhatsApp] Error publishing typing SSE:', error);
        }
      }

      return result;
    }),

  // Phase 3 Procedures
  sendTemplate: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        templateName: z.string().min(1),
        language: z.string().optional(),
        conversationId: z.number().optional(), // لحفظ الرسالة في المحادثة
        templateContent: z.string().optional(), // محتوى القالب للحفظ
        templateButtons: z.string().optional(), // أزرار القالب (JSON string)
        headerText: z.string().optional(), // نص الـ header
        footerText: z.string().optional(), // نص الـ footer
      })
    )
    .mutation(async ({ input }) => {
      const { sendTemplateMessage } = await import('../services/whatsappTemplates');
      const result = await sendTemplateMessage({
        phone: input.phone,
        templateName: input.templateName,
        language: input.language,
      });

      // حفظ الرسالة في المحادثة إذا نجح الإرسال
      if (result.success && input.conversationId) {
        try {
          const { createWhatsAppMessage, updateWhatsAppConversation } = await import(
            '../database/db'
          );
          const content = input.templateContent || `[قالب: ${input.templateName}]`;
          // حفظ بيانات القالب الكاملة في metadata
          const metadata = JSON.stringify({
            templateName: input.templateName,
            buttons: input.templateButtons ? JSON.parse(input.templateButtons) : [],
            headerText: input.headerText || null,
            footerText: input.footerText || null,
          });
          await createWhatsAppMessage({
            conversationId: input.conversationId,
            direction: 'outbound',
            content,
            messageType: 'template',
            status: 'sent',
            whatsappMessageId: result.messageId || null,
            sentAt: new Date(),
            metadata,
          });
          await updateWhatsAppConversation(input.conversationId, {
            lastMessage: content.substring(0, 200),
            lastMessageAt: new Date(),
          });
        } catch (err) {
          console.error('[WhatsApp] Failed to save template message to conversation:', err);
        }
      }

      return result;
    }),

  getTemplates: protectedProcedure.query(async () => {
    // جلب القوالب من قاعدة البيانات المحلية (بعد المزامنة مع Meta)
    const { whatsappTemplates } = await import('../../drizzle/schema');
    const dbConn = await import('../database/db').then((m) => m.getDb());
    if (!dbConn) return { success: true, templates: [] };
    const templates = await dbConn.select().from(whatsappTemplates).orderBy(whatsappTemplates.name);
    return { success: true, templates };
  }),

  getTemplateStatus: protectedProcedure
    .input(z.object({ templateName: z.string() }))
    .query(async ({ input }) => {
      const { getTemplateStatus } = await import('../services/whatsappTemplates');
      return getTemplateStatus(input.templateName);
    }),

  sendMedia: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        mediaType: z.enum(['image', 'video', 'document', 'audio']),
        mediaUrl: z.string().url(),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { sendMediaMessage } = await import('../services/whatsappTemplates');
      return sendMediaMessage({
        phone: input.phone,
        mediaType: input.mediaType,
        mediaUrl: input.mediaUrl,
        caption: input.caption,
      });
    }),

  sendBroadcast: protectedProcedure
    // @ts-ignore - tRPC middleware type compatibility issue
    .use(requireWhatsAppFeature())
    .input(
      z.object({
        message: z.string().min(1).max(4096),
        recipients: z.array(z.string().min(9).max(15)),
        priority: z.enum(['high', 'normal', 'low']).optional(),
        delay: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { sendBroadcast } = await import('../services/whatsappBroadcast');
      return sendBroadcast({
        message: input.message,
        recipients: input.recipients,
        priority: input.priority,
        delay: input.delay,
      });
    }),

  getBroadcastStatus: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const { getBroadcastStatus } = await import('../services/whatsappBroadcast');
      return getBroadcastStatus(parseInt(input.jobId));
    }),

  getBroadcastStats: protectedProcedure.query(async () => {
    const { getBroadcastStats } = await import('../services/whatsappBroadcast');
    return getBroadcastStats();
  }),

  getMessageStats: protectedProcedure.query(async () => {
    try {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });

      const { whatsappMessages } = await import('../../drizzle/schema');
      const { gte, lte, and, sql } = await import('drizzle-orm');

      // Get messages from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const messages = await dbConn
        .select()
        .from(whatsappMessages)
        .where(gte(whatsappMessages.createdAt, sevenDaysAgo));

      // Group by day (last 7 days)
      const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      const dailyStats = days.map((day, index) => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - (6 - index));
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayMessages = messages.filter((m: Record<string, unknown>) => {
          const msgDate = new Date(m.sentAt as Date);
          return msgDate >= targetDate && msgDate < nextDate;
        });

        return {
          name: day,
          sent: dayMessages.filter((m: Record<string, unknown>) => m.direction === 'outbound').length,
          delivered: dayMessages.filter((m: Record<string, unknown>) => m.status === 'delivered').length,
          failed: dayMessages.filter((m: Record<string, unknown>) => m.status === 'failed').length,
        };
      });

      // Group by message type
      const typeStats = [
        { name: 'نصية', value: messages.filter((m: Record<string, unknown>) => m.messageType === 'text').length },
        { name: 'قوالب', value: messages.filter((m: Record<string, unknown>) => m.messageType === 'template').length },
        {
          name: 'وسائط',
          value: messages.filter((m: Record<string, unknown>) =>
            ['image', 'video', 'document', 'audio'].includes(m.messageType as string)
          ).length,
        },
        {
          name: 'تفاعلية',
          value: messages.filter((m: Record<string, unknown>) => m.messageType === 'interactive').length,
        },
      ];

      // Calculate percentages for pie chart
      const totalMessages = messages.length || 1;
      const typeStatsWithPercentage = typeStats.map((stat) => ({
        ...stat,
        value: Math.round((stat.value / totalMessages) * 100),
      }));

      return {
        success: true,
        dailyStats,
        typeStats: typeStatsWithPercentage,
      };
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error)); console.error('[WhatsApp] Failed to get message stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        dailyStats: [],
        typeStats: [],
      };
    }
  }),

  scheduleBroadcast: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(4096),
        recipients: z.array(z.string().min(9).max(15)),
        scheduledAt: z.date(),
        priority: z.enum(['high', 'normal', 'low']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { scheduleBroadcast } = await import('../services/whatsappBroadcast');
      return scheduleBroadcast({
        message: input.message,
        recipients: input.recipients,
        scheduledAt: input.scheduledAt,
        priority: input.priority,
      });
    }),

  addAutoReplyRule: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        triggerType: z.enum(['keyword', 'outside_hours', 'first_message', 'faq']),
        triggerValue: z.string().optional(),
        replyMessage: z.string().min(1),
        priority: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { addAutoReplyRule } = await import('../services/whatsappAutoReply');
      return addAutoReplyRule({
        name: input.name,
        triggerType: input.triggerType,
        triggerValue: input.triggerValue,
        replyMessage: input.replyMessage,
        priority: input.priority,
        createdBy: ctx.user.id,
      });
    }),

  deleteAutoReplyRule: protectedProcedure
    .input(z.object({ ruleId: z.number() }))
    .mutation(async ({ input }) => {
      const { deleteAutoReplyRule } = await import('../services/whatsappAutoReply');
      return deleteAutoReplyRule(input.ruleId);
    }),

  getAutoReplyRules: protectedProcedure.query(async () => {
    const { getAutoReplyRules } = await import('../services/whatsappAutoReply');
    return getAutoReplyRules();
  }),

  toggleAutoReplyRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.number(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { toggleAutoReplyRule } = await import('../services/whatsappAutoReply');
      return toggleAutoReplyRule(input.ruleId, input.enabled);
    }),

  // Phase 4 Procedures
  sendAppointmentConfirmation: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        phone: z.string().min(9).max(15),
        patientName: z.string(),
        doctorName: z.string(),
        appointmentTime: z.date(),
        department: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { dispatchWhatsAppMessage } = await import('../services/whatsappMessageDispatcher');
      // استخدام dispatchWhatsAppMessage مع triggerEvent on_create
      return dispatchWhatsAppMessage({
        phone: input.phone,
        entityType: 'appointment',
        entityId: input.appointmentId,
        triggerEvent: 'on_create',
        recipientName: input.patientName,
        variables: {
          name: input.patientName,
          doctor: input.doctorName,
          date: input.appointmentTime.toLocaleDateString('ar-SA'),
          time: input.appointmentTime.toLocaleTimeString('ar-SA'),
          service: input.department,
        },
      });
    }),

  sendAppointmentReminder: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        phone: z.string().min(9).max(15),
        patientName: z.string(),
        doctorName: z.string(),
        appointmentTime: z.date(),
        hoursUntil: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { sendAppointmentReminder } = await import('../services/whatsappAppointments');
      return sendAppointmentReminder(input);
    }),

  sendAppointmentFollowup: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        phone: z.string().min(9).max(15),
        patientName: z.string(),
        doctorName: z.string(),
        department: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { sendAppointmentFollowup } = await import('../services/whatsappAppointments');
      return sendAppointmentFollowup(input);
    }),

  checkAndSendReminders: protectedProcedure.mutation(async () => {
    const { checkAndSendReminders } = await import('../services/whatsappAppointments');
    return checkAndSendReminders();
  }),

  getAuditLogs: protectedProcedure
    .input(
      z.object({
        phone: z.string().optional(),
        type: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { getAuditLogs } = await import('../services/whatsappAuditLog');
      return getAuditLogs(input);
    }),

  getAuditStats: protectedProcedure.query(async () => {
    const { getAuditStats } = await import('../services/whatsappAuditLog');
    return getAuditStats();
  }),

  exportAuditLogs: protectedProcedure
    .input(
      z.object({
        phone: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { exportAuditLogs } = await import('../services/whatsappAuditLog');
      return exportAuditLogs(input);
    }),

  blockPhone: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        reason: z.enum(['opt_out', 'spam', 'manual', 'invalid']),
      })
    )
    .mutation(async ({ input }) => {
      const { blockPhone } = await import('../services/whatsappSecurity');
      return blockPhone(input);
    }),

  unblockPhone: protectedProcedure
    .input(z.object({ phone: z.string().min(9).max(15) }))
    .mutation(async ({ input }) => {
      const { unblockPhone } = await import('../services/whatsappSecurity');
      return unblockPhone(input.phone);
    }),

  getBlockedPhones: protectedProcedure.query(async () => {
    const { getBlockedPhones } = await import('../services/whatsappSecurity');
    return getBlockedPhones();
  }),

  handleOptOutRequest: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { handleOptOutRequest } = await import('../services/whatsappSecurity');
      return handleOptOutRequest(input);
    }),

  getOptOutRequests: protectedProcedure.query(async () => {
    const { getBlockedPhones } = await import('../services/whatsappSecurity');
    return getBlockedPhones();
  }),

  validateMetaCompliance: protectedProcedure
    .input(z.object({ message: z.string() }))
    .query(async ({ input }) => {
      const { validateMetaCompliance } = await import('../services/whatsappSecurity');
      return validateMetaCompliance(input.message);
    }),

  getSecurityStats: protectedProcedure.query(async () => {
    const { getSecurityStats } = await import('../services/whatsappSecurity');
    return getSecurityStats();
  }),

  // Phase 5 Procedures
  initializeScheduler: protectedProcedure.mutation(async () => {
    const { initializeScheduler } = await import('../services/whatsappScheduler');
    return initializeScheduler();
  }),

  getScheduledTasks: protectedProcedure.query(async () => {
    const { getScheduledTasks } = await import('../services/whatsappScheduler');
    return getScheduledTasks();
  }),

  stopTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      const { stopTask } = await import('../services/whatsappScheduler');
      return stopTask(input.taskId);
    }),

  resumeTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      const { resumeTask } = await import('../services/whatsappScheduler');
      return resumeTask(input.taskId);
    }),

  shutdownScheduler: protectedProcedure.mutation(async () => {
    const { shutdownScheduler } = await import('../services/whatsappScheduler');
    return shutdownScheduler();
  }),

  // جلب سجلات إشعارات WhatsApp من قاعدة البيانات
  getNotificationLogs: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['appointment', 'camp_registration', 'offer_lead']).optional(),
        status: z.enum(['pending', 'sent', 'delivered', 'read', 'failed']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { getNotificationLogs } = await import('../services/whatsappAppointments');
      return getNotificationLogs(input);
    }),

  getNotificationStats: protectedProcedure.query(async () => {
    const { getNotificationStats } = await import('../services/whatsappAppointments');
    return getNotificationStats();
  }),

  // إعادة إرسال إشعار WhatsApp لكيان محدد
  resendNotification: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['appointment', 'camp_registration', 'offer_lead']),
        entityId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { dispatchWhatsAppMessage } = await import('../services/whatsappMessageDispatcher');
      const dbConn = await db.getDb();
      if (!dbConn) return { success: false, error: 'لا يمكن الاتصال بقاعدة البيانات' };

      if (input.entityType === 'appointment') {
        const { appointments, doctors } = await import('../../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const rows = await dbConn
          .select()
          .from(appointments)
          .where(eq(appointments.id, input.entityId))
          .limit(1);
        if (!rows.length) return { success: false, error: 'الموعد غير موجود' };
        const appt = rows[0];
        // بناء تاريخ+وقت مدمج (4 متغيرات: name, date, doctor, service)
        const apptDate =
          appt.appointmentDate instanceof Date
            ? appt.appointmentDate
            : new Date(appt.appointmentDate || appt.createdAt);
        const apptDateStr = apptDate.toLocaleDateString('ar-YE');
        const apptTimeStr = apptDate.toLocaleTimeString('ar-YE', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const apptDateTime = `${apptDateStr} - الساعة ${apptTimeStr}`;
        let doctorName = 'طبيب مختص';
        if ((appt as { doctorId?: number }).doctorId) {
          const doctorRows = await dbConn
            .select()
            .from(doctors)
            .where(eq(doctors.id, (appt as { doctorId?: number }).doctorId!))
            .limit(1);
          doctorName = doctorRows[0]?.name || doctorName;
        }
        return dispatchWhatsAppMessage({
          phone: appt.phone,
          entityType: 'appointment',
          entityId: appt.id,
          triggerEvent: 'on_create',
          recipientName: appt.fullName,
          variables: {
            name: appt.fullName,
            date: apptDateTime,
            doctor: doctorName,
            service: appt.procedure || 'عيادة عامة',
          },
        });
      }

      if (input.entityType === 'camp_registration') {
        const { campRegistrations, camps } = await import('../../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const rows = await dbConn
          .select()
          .from(campRegistrations)
          .where(eq(campRegistrations.id, input.entityId))
          .limit(1);
        if (!rows.length) return { success: false, error: 'التسجيل غير موجود' };
        const reg = rows[0];
        let campData: Record<string, unknown> | null = null;
        if (reg.campId) {
          const campRows = await dbConn
            .select()
            .from(camps)
            .where(eq(camps.id, reg.campId))
            .limit(1);
          campData = campRows[0] || null;
        }
        // بناء 5 متغيرات لقالب camp_reg_verification (150005)
        const regDateStr = (reg as { preferredDate?: string }).preferredDate
          ? new Date((reg as { preferredDate?: string }).preferredDate!).toLocaleDateString('ar-YE')
          : campData?.startDate
            ? new Date((campData as { startDate?: string }).startDate!).toLocaleDateString('ar-YE')
            : 'غير محدد';
        const regTimeStr =
          (reg as { preferredTimeSlot?: string }).preferredTimeSlot === 'morning'
            ? `صباحاً ${campData?.morningTime || ''}`.trim()
            : (reg as { preferredTimeSlot?: string }).preferredTimeSlot === 'evening'
              ? `مساءً ${campData?.eveningTime || ''}`.trim()
              : 'غير محدد';
        return dispatchWhatsAppMessage({
          phone: reg.phone,
          entityType: 'camp_registration',
          entityId: reg.id,
          triggerEvent: 'on_create',
          recipientName: reg.fullName,
          variables: {
            name: reg.fullName,
            camp_name: (campData as { name?: string })?.name || 'المخيم',
            date: regDateStr,
            time: regTimeStr,
            location: 'صنعاء - الستين الشمالي - قبل جولة الجمنه',
          },
        });
      }

      if (input.entityType === 'offer_lead') {
        const { offerLeads, offers } = await import('../../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const rows = await dbConn
          .select()
          .from(offerLeads)
          .where(eq(offerLeads.id, input.entityId))
          .limit(1);
        if (!rows.length) return { success: false, error: 'حجز العرض غير موجود' };
        const lead = rows[0];
        let offerName = '';
        if (lead.offerId) {
          const offerRows = await dbConn
            .select()
            .from(offers)
            .where(eq(offers.id, lead.offerId))
            .limit(1);
          offerName = offerRows[0]?.title || '';
        }
        return dispatchWhatsAppMessage({
          phone: lead.phone,
          entityType: 'offer_lead',
          entityId: lead.id,
          triggerEvent: 'on_create',
          recipientName: lead.fullName,
          variables: {
            name: lead.fullName,
            offer_name: offerName,
          },
        });
      }

      return { success: false, error: 'نوع غير معروف' };
    }),

  // جلب حالة إشعار WhatsApp لكيان محدد
  getEntityWhatsAppStatus: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['appointment', 'camp_registration', 'offer_lead']),
        entityId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { getEntityNotifications } = await import('../services/whatsappAppointments');
      const result = await getEntityNotifications({
        entityType: input.entityType,
        entityId: input.entityId,
      });
      const notifications = result.notifications || [];
      const latest = notifications[notifications.length - 1] || null;
      return {
        hasSent: notifications.length > 0,
        status: latest?.status || null,
        sentAt: latest?.sentAt || null,
        messageId: latest?.messageId || null,
        count: notifications.length,
      };
    }),

  // ── تشغيل مهام التذكير يدوياً (للاختبار أو التشغيل الفوري) ─────────────────
  runReminderJobs: protectedProcedure.mutation(async () => {
    const { runAppointmentReminderJobs } = await import('../tasks/cron/appointmentReminders');
    const result = await runAppointmentReminderJobs();
    return result;
  }),

  // Quick Replies
  quickReplies: router({
    list: protectedProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      const { quickReplies } = await import('../../drizzle/schema');
      return await dbConn.select().from(quickReplies).orderBy(quickReplies.name);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          content: z.string().min(1),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { quickReplies } = await import('../../drizzle/schema');
        const insertId = await dbConn
          .insert(quickReplies)
          .values({
            name: input.name,
            content: input.content,
            category: input.category,
            createdBy: ctx.user.id,
          })
          .$returningId();
        return { id: insertId, ...input };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          content: z.string().optional(),
          category: z.string().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { quickReplies } = await import('../../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const { id, ...updateData } = input;
        await dbConn.update(quickReplies).set(updateData).where(eq(quickReplies.id, id));
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { quickReplies } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      await dbConn.delete(quickReplies).where(eq(quickReplies.id, input.id));
      return { success: true };
    }),
  }),

  // Saved Searches
  savedSearches: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      const { savedSearches } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      return await dbConn.select().from(savedSearches).where(eq(savedSearches.userId, ctx.user.id));
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          searchQuery: z.string().optional(),
          filterType: z.string().optional(),
          dateRange: z.string().optional(),
          messageType: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { savedSearches } = await import('../../drizzle/schema');
        const insertId = await dbConn
          .insert(savedSearches)
          .values({
            userId: ctx.user.id,
            name: input.name,
            searchQuery: input.searchQuery,
            filterType: input.filterType,
            dateRange: input.dateRange,
            messageType: input.messageType,
          })
          .$returningId();
        return { id: insertId, ...input };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { savedSearches } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      await dbConn.delete(savedSearches).where(eq(savedSearches.id, input.id));
      return { success: true };
    }),
  }),

  // ─── Webhook Events & Account Health ─────────────────────────────────────────

  accountHealth: router({
    // Account Alerts
    getAlerts: protectedProcedure
      .input(
        z
          .object({
            severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
            resolved: z.boolean().optional(),
            limit: z.number().default(50),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappAccountAlerts } = await import('../../drizzle/schema');
        const { eq, and, desc } = await import('drizzle-orm');

        const conditions = [];
        if (input?.severity) {
          conditions.push(eq(whatsappAccountAlerts.severity, input.severity));
        }
        if (input?.resolved !== undefined) {
          conditions.push(eq(whatsappAccountAlerts.resolved, input.resolved));
        }

        const query =
          conditions.length > 0
            ? dbConn
                .select()
                .from(whatsappAccountAlerts)
                .where(and(...conditions))
            : dbConn.select().from(whatsappAccountAlerts);

        return await query.orderBy(desc(whatsappAccountAlerts.createdAt)).limit(input?.limit || 50);
      }),

    resolveAlert: protectedProcedure
      .input(z.object({ id: z.number(), resolvedBy: z.number() }))
      .mutation(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappAccountAlerts } = await import('../../drizzle/schema');
        const { eq } = await import('drizzle-orm');

        await dbConn
          .update(whatsappAccountAlerts)
          .set({
            resolved: true,
            resolvedAt: new Date(),
            resolvedBy: input.resolvedBy,
          })
          .where(eq(whatsappAccountAlerts.id, input.id));

        return { success: true };
      }),

    // Security Events
    getSecurityEvents: protectedProcedure
      .input(
        z
          .object({
            severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
            limit: z.number().default(50),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappSecurityEvents } = await import('../../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');

        const query = input?.severity
          ? dbConn
              .select()
              .from(whatsappSecurityEvents)
              .where(eq(whatsappSecurityEvents.severity, input.severity))
          : dbConn.select().from(whatsappSecurityEvents);

        return await query
          .orderBy(desc(whatsappSecurityEvents.createdAt))
          .limit(input?.limit || 50);
      }),
  }),

  phoneQuality: router({
    getHistory: protectedProcedure
      .input(
        z
          .object({
            phoneNumber: z.string().optional(),
            limit: z.number().default(100),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappPhoneQuality } = await import('../../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');

        const query = input?.phoneNumber
          ? dbConn
              .select()
              .from(whatsappPhoneQuality)
              .where(eq(whatsappPhoneQuality.phoneNumber, input.phoneNumber))
          : dbConn.select().from(whatsappPhoneQuality);

        return await query.orderBy(desc(whatsappPhoneQuality.createdAt)).limit(input?.limit || 100);
      }),

    getCurrent: protectedProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappPhoneQuality } = await import('../../drizzle/schema');
      const { desc } = await import('drizzle-orm');

      const results = await dbConn
        .select()
        .from(whatsappPhoneQuality)
        .orderBy(desc(whatsappPhoneQuality.createdAt))
        .limit(1);

      return results[0] || null;
    }),
  }),

  conversationQuality: router({
    getHistory: protectedProcedure
      .input(
        z
          .object({
            phoneNumber: z.string().optional(),
            limit: z.number().default(100),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappConversationQuality } = await import('../../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');

        const query = input?.phoneNumber
          ? dbConn
              .select()
              .from(whatsappConversationQuality)
              .where(eq(whatsappConversationQuality.phoneNumber, input.phoneNumber))
          : dbConn.select().from(whatsappConversationQuality);

        return await query
          .orderBy(desc(whatsappConversationQuality.createdAt))
          .limit(input?.limit || 100);
      }),
  }),

  userSubscriptions: router({
    getAll: protectedProcedure
      .input(
        z
          .object({
            status: z.enum(['opted_in', 'opted_out']).optional(),
            optInType: z.enum(['general', 'marketing']).optional(),
            limit: z.number().default(100),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappUserOptIns } = await import('../../drizzle/schema');
        const { eq, and, desc } = await import('drizzle-orm');

        const conditions = [];
        if (input?.status) {
          conditions.push(eq(whatsappUserOptIns.status, input.status));
        }
        if (input?.optInType) {
          conditions.push(eq(whatsappUserOptIns.optInType, input.optInType));
        }

        const query =
          conditions.length > 0
            ? dbConn
                .select()
                .from(whatsappUserOptIns)
                .where(and(...conditions))
            : dbConn.select().from(whatsappUserOptIns);

        return await query.orderBy(desc(whatsappUserOptIns.createdAt)).limit(input?.limit || 100);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          phoneNumber: z.string(),
          status: z.enum(['opted_in', 'opted_out']),
          optInType: z.enum(['general', 'marketing']),
          source: z.string().default('manual'),
        })
      )
      .mutation(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappUserOptIns } = await import('../../drizzle/schema');
        const { eq, and } = await import('drizzle-orm');

        // Check if record exists
        const existing = await dbConn
          .select()
          .from(whatsappUserOptIns)
          .where(
            and(
              eq(whatsappUserOptIns.phoneNumber, input.phoneNumber),
              eq(whatsappUserOptIns.optInType, input.optInType)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await dbConn
            .update(whatsappUserOptIns)
            .set({
              status: input.status,
              source: input.source,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(whatsappUserOptIns.phoneNumber, input.phoneNumber),
                eq(whatsappUserOptIns.optInType, input.optInType)
              )
            );
        } else {
          // Create new
          await dbConn.insert(whatsappUserOptIns).values({
            phoneNumber: input.phoneNumber,
            optInType: input.optInType,
            status: input.status,
            source: input.source,
            details: JSON.stringify({ manualUpdate: true }),
          });
        }

        return { success: true };
      }),

    getStats: protectedProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappUserOptIns } = await import('../../drizzle/schema');
      const { eq, sql } = await import('drizzle-orm');

      const allSubs = await dbConn.select().from(whatsappUserOptIns);

      return {
        general: {
          optedIn: allSubs.filter((s) => s.optInType === 'general' && s.status === 'opted_in')
            .length,
          optedOut: allSubs.filter((s) => s.optInType === 'general' && s.status === 'opted_out')
            .length,
        },
        marketing: {
          optedIn: allSubs.filter((s) => s.optInType === 'marketing' && s.status === 'opted_in')
            .length,
          optedOut: allSubs.filter((s) => s.optInType === 'marketing' && s.status === 'opted_out')
            .length,
        },
      };
    }),
  }),

  templateQuality: router({
    getHistory: protectedProcedure
      .input(
        z
          .object({
            templateId: z.string().optional(),
            limit: z.number().default(100),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappTemplateQuality } = await import('../../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');

        const query = input?.templateId
          ? dbConn
              .select()
              .from(whatsappTemplateQuality)
              .where(eq(whatsappTemplateQuality.templateId, input.templateId))
          : dbConn.select().from(whatsappTemplateQuality);

        return await query
          .orderBy(desc(whatsappTemplateQuality.createdAt))
          .limit(input?.limit || 100);
      }),
  }),

  // ─── Webhook Events Inspector ──────────────────────────────────────────────────

  webhookEvents: router({
    getAll: protectedProcedure
      .input(
        z
          .object({
            eventType: z.string().optional(),
            processed: z.boolean().optional(),
            handlerExists: z.boolean().optional(),
            limit: z.number().default(100),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappWebhookEvents } = await import('../../drizzle/schema');
        const { eq, and, desc } = await import('drizzle-orm');

        const conditions = [];
        if (input?.eventType) {
          conditions.push(eq(whatsappWebhookEvents.eventType, input.eventType));
        }
        if (input?.processed !== undefined) {
          conditions.push(eq(whatsappWebhookEvents.processed, input.processed));
        }
        if (input?.handlerExists !== undefined) {
          conditions.push(eq(whatsappWebhookEvents.handlerExists, input.handlerExists));
        }

        const query =
          conditions.length > 0
            ? dbConn
                .select()
                .from(whatsappWebhookEvents)
                .where(and(...conditions))
            : dbConn.select().from(whatsappWebhookEvents);

        return await query
          .orderBy(desc(whatsappWebhookEvents.createdAt))
          .limit(input?.limit || 100);
      }),

    getUnhandledCount: protectedProcedure.query(async () => {
      return await db.getUnhandledWebhookEventsCount();
    }),

    getEventTypes: protectedProcedure.query(async () => {
      return await db.getUniqueEventTypes();
    }),

    markAsProcessed: protectedProcedure
      .input(z.object({ id: z.number(), handlerExists: z.boolean().default(true) }))
      .mutation(async ({ input }) => {
        await db.markWebhookEventAsProcessed(input.id, input.handlerExists);
        return { success: true };
      }),

    // إحصائيات الأحداث حسب النوع
    getStatsByType: protectedProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappWebhookEvents } = await import('../../drizzle/schema');
      const { sql } = await import('drizzle-orm');

      const stats = await dbConn
        .select({
          eventType: whatsappWebhookEvents.eventType,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(whatsappWebhookEvents)
        .groupBy(whatsappWebhookEvents.eventType);

      return stats;
    }),

    // الأحداث حسب الفئة (messages, templates, account, etc.)
    getEventsByCategory: protectedProcedure
      .input(
        z.object({
          category: z.enum([
            'messages',
            'templates',
            'template_status',
            'account',
            'security',
            'quality',
            'subscriptions',
          ]),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappWebhookEvents } = await import('../../drizzle/schema');
        const { like, desc } = await import('drizzle-orm');

        const categoryPatterns = {
          messages: 'message%',
          templates: 'message_template%',
          template_status: 'template_status%',
          account: 'account%',
          security: 'security',
          quality: 'quality%',
          subscriptions: 'opt%',
        };

        return await dbConn
          .select()
          .from(whatsappWebhookEvents)
          .where(like(whatsappWebhookEvents.eventType, categoryPatterns[input.category]))
          .orderBy(desc(whatsappWebhookEvents.createdAt))
          .limit(input.limit);
      }),

    // أحداث القوالب المفصلة
    getTemplateEvents: protectedProcedure
      .input(
        z.object({
          templateId: z.string().optional(),
          limit: z.number().default(100),
        })
      )
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        const { whatsappWebhookEvents } = await import('../../drizzle/schema');
        const { like, desc, eq } = await import('drizzle-orm');

        let query = dbConn
          .select()
          .from(whatsappWebhookEvents)
          .where(like(whatsappWebhookEvents.eventType, 'message_template%'));

        if (input.templateId) {
          // تصفية حسب templateId من الـ rawPayload
          const events = await query
            .orderBy(desc(whatsappWebhookEvents.createdAt))
            .limit(input.limit);
          return events.filter((e) => {
            try {
              const payload = JSON.parse(e.rawPayload);
              return payload.message_template_id === input.templateId;
            } catch {
              return false;
            }
          });
        }

        return await query.orderBy(desc(whatsappWebhookEvents.createdAt)).limit(input.limit);
      }),
  }),

  // ─── New WhatsApp Data Endpoints ───────────────────────────────────────────────

  getConversationCosts: protectedProcedure
    .input(z.object({ startDate: z.string().optional(), endDate: z.string().optional() }))
    .query(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappConversations } = await import('../../drizzle/schema');
      const { desc, and, gte, lte } = await import('drizzle-orm');

      const conditions = [];
      if (input.startDate)
        conditions.push(gte(whatsappConversations.createdAt, new Date(input.startDate)));
      if (input.endDate)
        conditions.push(lte(whatsappConversations.createdAt, new Date(input.endDate)));

      const query =
        conditions.length > 0
          ? dbConn
              .select()
              .from(whatsappConversations)
              .where(and(...conditions))
          : dbConn.select().from(whatsappConversations);

      return await query.orderBy(desc(whatsappConversations.createdAt)).limit(100);
    }),

  getContacts: protectedProcedure
    .input(z.object({ phoneNumber: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappContacts } = await import('../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.phoneNumber
        ? dbConn
            .select()
            .from(whatsappContacts)
            .where(eq(whatsappContacts.phoneNumber, input.phoneNumber))
        : dbConn.select().from(whatsappContacts);

      return await query.orderBy(desc(whatsappContacts.createdAt)).limit(input.limit);
    }),

  getOrders: protectedProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappOrders } = await import('../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.status
        ? dbConn
            .select()
            .from(whatsappOrders)
            // @ts-ignore - Type mismatch between input.status and whatsappOrders.status
            .where(eq(whatsappOrders.status, input.status as string))
        : dbConn.select().from(whatsappOrders);

      return await query.orderBy(desc(whatsappOrders.createdAt)).limit(input.limit);
    }),

  getReferrals: protectedProcedure
    .input(z.object({ sourceType: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappReferrals } = await import('../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.sourceType
        ? dbConn
            .select()
            .from(whatsappReferrals)
            .where(eq(whatsappReferrals.sourceType, input.sourceType))
        : dbConn.select().from(whatsappReferrals);

      return await query.orderBy(desc(whatsappReferrals.createdAt)).limit(input.limit);
    }),

  getReactions: protectedProcedure
    .input(z.object({ emoji: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappReactions } = await import('../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.emoji
        ? dbConn.select().from(whatsappReactions).where(eq(whatsappReactions.emoji, input.emoji))
        : dbConn.select().from(whatsappReactions);

      return await query.orderBy(desc(whatsappReactions.createdAt)).limit(input.limit);
    }),

  getTransactions: protectedProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappTransactions } = await import('../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.status
        ? dbConn
            .select()
            .from(whatsappTransactions)
            .where(eq(whatsappTransactions.status, input.status as string))
        : dbConn.select().from(whatsappTransactions);

      return await query.orderBy(desc(whatsappTransactions.createdAt)).limit(input.limit);
    }),

  getTemplatePerformance: protectedProcedure
    .input(
      z.object({ templateName: z.string().optional(), startDate: z.string(), endDate: z.string() })
    )
    .query(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      const { whatsappTemplates, whatsappNotifications } = await import('../../drizzle/schema');
      const { sql, and, gte, lte, eq, like } = await import('drizzle-orm');

      // Get template usage statistics
      const conditions = [];
      if (input.startDate)
        conditions.push(gte(whatsappNotifications.createdAt, new Date(input.startDate)));
      if (input.endDate)
        conditions.push(lte(whatsappNotifications.createdAt, new Date(input.endDate)));
      if (input.templateName) conditions.push(eq(whatsappTemplates.name, input.templateName));

      const templateQuery = dbConn
        .select({
          templateId: whatsappTemplates.id,
          templateName: whatsappTemplates.name,
          sentCount: sql<number>`count(*)`.as('sentCount'),
          deliveredCount:
            sql<number>`sum(case when ${whatsappNotifications.status} = 'delivered' then 1 else 0 end)`.as(
              'deliveredCount'
            ),
          readCount:
            sql<number>`sum(case when ${whatsappNotifications.status} = 'read' then 1 else 0 end)`.as(
              'readCount'
            ),
          failedCount:
            sql<number>`sum(case when ${whatsappNotifications.status} = 'failed' then 1 else 0 end)`.as(
              'failedCount'
            ),
        })
        .from(whatsappTemplates)
        .leftJoin(
          whatsappNotifications,
          like(whatsappTemplates.name, whatsappNotifications.templateName)
        );

      if (conditions.length > 0) {
        return await templateQuery.where(and(...conditions));
      }

      return await templateQuery;
    }),
});
