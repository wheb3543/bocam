import { protectedProcedure, router } from '../../_core/trpc';
import * as db from '../../database/db';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { z } from 'zod';
import { createLogger } from '../../_core/logger';

const logger = createLogger('whatsapp-templates');

export const templatesRouter = router({
  templates: router({
    list: protectedProcedure.query(async () => {
      return db.getAllWhatsAppTemplates();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getWhatsAppTemplateById(input.id);
    }),

    syncFromMeta: protectedProcedure.mutation(async () => {
      const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
      const hasToken = !!process.env.META_ACCESS_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      logger.info(`WABA_ID=${wabaId}, PHONE_ID=${phoneId}, HAS_TOKEN=${hasToken}`);

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

      const { syncTemplatesFromMeta } = await import('../../services/whatsappTemplates');
      const result = await syncTemplatesFromMeta();
      logger.info(`Result:`, JSON.stringify(result));
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

      const { syncAllTemplates } = await import('../../services/templateSyncService');
      const result = await syncAllTemplates(phoneId);
      logger.info(`Result:`, JSON.stringify(result));
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
        const { createTemplate } = await import('../../services/whatsappTemplates');
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
        const { updateTemplate } = await import('../../services/whatsappTemplates');
        return updateTemplate(input.id, input);
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const { deleteTemplate } = await import('../../services/whatsappTemplates');
      return deleteTemplate(input.id);
    }),
  }),

  sendTemplate: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        templateName: z.string().min(1),
        language: z.string().optional(),
        conversationId: z.number().optional(),
        templateContent: z.string().optional(),
        templateButtons: z.string().optional(),
        headerText: z.string().optional(),
        footerText: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { sendTemplateMessage } = await import('../../services/whatsappTemplates');
      const result = await sendTemplateMessage({
        phone: input.phone,
        templateName: input.templateName,
        language: input.language,
      });

      if (result.success && input.conversationId) {
        try {
          const { createWhatsAppMessage, updateWhatsAppConversation } =
            await import('../../database/db');
          const content = input.templateContent || `[قالب: ${input.templateName}]`;
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
          logger.error('Failed to save template message to conversation:', err);
        }
      }

      return result;
    }),

  getTemplates: protectedProcedure.query(async () => {
    const { whatsappTemplates } = await import('../../../drizzle/schema');
    const dbConn = await ensureDatabaseAvailable();
    const templates = await dbConn.select().from(whatsappTemplates).orderBy(whatsappTemplates.name);
    return { success: true, templates };
  }),

  getTemplateStatus: protectedProcedure
    .input(z.object({ templateName: z.string() }))
    .query(async ({ input }) => {
      const { getTemplateStatus } = await import('../../services/whatsappTemplates');
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
      const { sendMediaMessage } = await import('../../services/whatsappTemplates');
      return sendMediaMessage({
        phone: input.phone,
        mediaType: input.mediaType,
        mediaUrl: input.mediaUrl,
        caption: input.caption,
      });
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
        const dbConn = await ensureDatabaseAvailable();
        const { whatsappTemplateQuality } = await import('../../../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');

        const query = input?.templateId
          ? dbConn
              .select()
              .from(whatsappTemplateQuality)
              .where(eq(whatsappTemplateQuality.templateId, input.templateId))
          : dbConn.select().from(whatsappTemplateQuality);

        return query.orderBy(desc(whatsappTemplateQuality.createdAt)).limit(input?.limit || 100);
      }),
  }),

  getTemplatePerformance: protectedProcedure
    .input(
      z.object({ templateName: z.string().optional(), startDate: z.string(), endDate: z.string() })
    )
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappTemplates, whatsappNotifications } = await import('../../../drizzle/schema');
      const { sql, and, gte, lte, eq, like } = await import('drizzle-orm');

      const conditions = [];
      if (input.startDate) {
        conditions.push(gte(whatsappNotifications.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        conditions.push(lte(whatsappNotifications.createdAt, new Date(input.endDate)));
      }
      if (input.templateName) {
        conditions.push(eq(whatsappTemplates.name, input.templateName));
      }

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
        return templateQuery.where(and(...conditions));
      }

      return templateQuery;
    }),
});
