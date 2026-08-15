import { protectedProcedure, adminProcedure, router } from '../../_core/trpc';
import { TRPCError } from '@trpc/server';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import * as db from '../../database/db';
import { z } from 'zod';
import { createLogger } from '../../_core/logger';

const logger = createLogger('whatsapp-conversations');

// Logging helper for sensitive operations
function logOperation(operation: string, userId: number, details: unknown) {
  logger.info(`${operation} | User: ${userId} | Details:`, JSON.stringify(details));
}

export const conversationsRouter = router({
  conversations: router({
    list: protectedProcedure.query(async () => {
      return db.getAllWhatsAppConversations();
    }),

    getCustomerInfo: protectedProcedure
      .input(z.object({ phone: z.string().min(1, 'رقم الهاتف مطلوب') }))
      .query(async ({ input }) => {
        return db.getCustomerInfoByPhone(input.phone);
      }),

    getCustomerRecords: protectedProcedure
      .input(z.object({ phone: z.string().min(1, 'رقم الهاتف مطلوب') }))
      .query(async ({ input }) => {
        return db.getAllCustomerRecordsByPhone(input.phone);
      }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getWhatsAppConversationById(input.id);
    }),

    search: protectedProcedure
      .input(z.object({ searchTerm: z.string().min(1, 'مصطلح البحث مطلوب') }))
      .query(async ({ input }) => {
        return db.searchWhatsAppConversations(input.searchTerm);
      }),

    unreadCount: protectedProcedure.query(async () => {
      return db.getUnreadWhatsAppConversationsCount();
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
        return db.createWhatsAppConversation({
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
        if (important !== undefined) {
          updateData.isImportant = important ? 1 : 0;
        }
        if (archived !== undefined) {
          updateData.isArchived = archived ? 1 : 0;
        }
        return db.updateWhatsAppConversation(id, updateData);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        logOperation('markAsRead', ctx.user.id, { conversationId: input.id });

        return db.updateWhatsAppConversation(input.id, {
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

        return db.updateWhatsAppConversation(input.id, {
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

        return db.updateWhatsAppConversation(input.id, {
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

        return db.updateWhatsAppConversation(input.id, {
          customerName: input.customerName,
        });
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      logOperation('deleteConversation', ctx.user.id, { conversationId: input.id });

      const dbConn = await ensureDatabaseAvailable();

      const { whatsappConversations, whatsappMessages } = await import('../../../drizzle/schema');
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
        if (!dbConn) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        const { whatsappConversations } = await import('../../../drizzle/schema');
        const { inArray } = await import('drizzle-orm');

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
        if (!dbConn) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        const { whatsappConversations } = await import('../../../drizzle/schema');
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
        if (!dbConn) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        const { whatsappMessages } = await import('../../../drizzle/schema');
        const { eq } = await import('drizzle-orm');

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
        if (!dbConn) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        const { whatsappMessages, whatsappConversations } = await import('../../../drizzle/schema');
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
});
