import { protectedProcedure, router, requireWhatsAppFeature } from '../../_core/trpc';
import { TRPCError } from '@trpc/server';
import * as db from '../../database/db';
import { z } from 'zod';
import { sendWhatsAppTypingIndicator } from '../../services/whatsappCloudAPI';
import { createLogger } from '../../_core/logger';
import { messageRoutes } from './routes/messageRoutes';
import { broadcastRoutes } from './routes/broadcastRoutes';
import { quickRepliesRoutes } from './routes/quickRepliesRoutes';

const logger = createLogger('whatsapp-messages');

export const messagesRouter = router({
  messages: router({
    listByConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(messageRoutes.listByConversation),

    send: protectedProcedure
      // @ts-expect-error - tRPC middleware type compatibility issue
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
      .mutation(messageRoutes.send),

    uploadMedia: protectedProcedure
      .input(
        z.object({
          fileBuffer: z.string(), // base64 encoded buffer
          mimeType: z.string(),
        })
      )
      .mutation(messageRoutes.uploadMedia),

    delete: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(messageRoutes.delete),

    exportConversation: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
        })
      )
      .mutation(messageRoutes.exportConversation),

    searchInConversation: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          searchTerm: z.string().min(1, 'مصطلح البحث مطلوب'),
        })
      )
      .query(messageRoutes.searchInConversation),

    forward: protectedProcedure
      .input(
        z.object({
          messageId: z.number(),
          targetConversationId: z.number(),
        })
      )
      .mutation(messageRoutes.forward),
  }),

  sendSimpleText: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        message: z.string().min(1).max(4096),
        priority: z.enum(['high', 'normal', 'low']).optional(),
      })
    )
    .mutation(broadcastRoutes.sendSimpleText),

  sendWelcomeMsg: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        fullName: z.string().min(1),
        campaignName: z.string().min(1),
      })
    )
    .mutation(broadcastRoutes.sendWelcomeMsg),

  sendTypingIndicator: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        typing: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const conv = await db.getWhatsAppConversationById(input.conversationId);
      if (!conv) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المحادثة غير موجودة' });
      }

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

      if (result.success) {
        try {
          const { publish } = await import('../../_core/pubsub');
          publish('global:whatsapp', 'typing', {
            conversationId: input.conversationId,
            phoneNumber: conv.phoneNumber,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          logger.error(error instanceof Error ? error.message : String(error));
          logger.error('Error publishing typing SSE:', error);
        }
      }

      return result;
    }),

  sendBroadcast: protectedProcedure
    // @ts-expect-error - tRPC middleware type compatibility issue
    .use(requireWhatsAppFeature())
    .input(
      z.object({
        message: z.string().min(1).max(4096),
        recipients: z.array(z.string().min(9).max(15)),
        priority: z.enum(['high', 'normal', 'low']).optional(),
        delay: z.number().optional(),
      })
    )
    .mutation(broadcastRoutes.sendBroadcast),

  getBroadcastStatus: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(broadcastRoutes.getBroadcastStatus),

  getBroadcastStats: protectedProcedure.query(broadcastRoutes.getBroadcastStats),

  scheduleBroadcast: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(4096),
        recipients: z.array(z.string().min(9).max(15)),
        scheduledAt: z.date(),
        priority: z.enum(['high', 'normal', 'low']).optional(),
      })
    )
    .mutation(broadcastRoutes.scheduleBroadcast),

  quickReplies: router({
    list: protectedProcedure.query(quickRepliesRoutes.list),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          content: z.string().min(1),
          category: z.string().optional(),
        })
      )
      .mutation(quickRepliesRoutes.create),

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
      .mutation(quickRepliesRoutes.update),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(quickRepliesRoutes.delete),
  }),
});
