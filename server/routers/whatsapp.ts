import { z } from 'zod';
import { router, publicProcedure, mergeRouters } from '../_core/trpc';
import { verifyWhatsAppHealth } from '../services/whatsappService';
import { normalizePhoneNumber } from '../database/db';
import { sendWhatsAppTextMessage } from '../services/whatsappCloudAPI';
import { whatsappAppRouter } from './whatsapp/appRouter';

const baseWhatsAppRouter = router({
  health: publicProcedure.query(async () => {
    return verifyWhatsAppHealth();
  }),

  testConnection: publicProcedure
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

  getCustomerServiceWindow: publicProcedure.query(async () => {
    const { getDb } = await import('../database/db');
    const dbConn = await getDb();
    if (!dbConn) {
      return { count: 0, items: [] };
    }
    const { whatsappConversations } = await import('../../drizzle/schema');
    const { and, desc, isNotNull, lt, sql } = await import('drizzle-orm');
    const now = new Date();
    const expiredCondition = and(
      isNotNull(whatsappConversations.expirationTimestamp),
      lt(whatsappConversations.expirationTimestamp, now)
    );
    const [countResult, items] = await Promise.all([
      dbConn
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(whatsappConversations)
        .where(expiredCondition),
      dbConn
        .select({
          id: whatsappConversations.id,
          customerName: whatsappConversations.customerName,
          phoneNumber: whatsappConversations.phoneNumber,
          expirationTimestamp: whatsappConversations.expirationTimestamp,
        })
        .from(whatsappConversations)
        .where(expiredCondition)
        .orderBy(desc(whatsappConversations.expirationTimestamp))
        .limit(5),
    ]);
    return { count: Number(countResult[0]?.count || 0), items };
  }),

  getFlowEvents: publicProcedure
    .input(
      z
        .object({
          flowId: z.string().optional(),
          limit: z.number().int().min(1).max(200).default(100),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { getDb } = await import('../database/db');
      const dbConn = await getDb();
      if (!dbConn) {
        return [];
      }
      const { whatsappFlowEvents } = await import('../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');
      const query = input?.flowId
        ? dbConn
            .select()
            .from(whatsappFlowEvents)
            .where(eq(whatsappFlowEvents.flowId, input.flowId))
        : dbConn.select().from(whatsappFlowEvents);
      return query.orderBy(desc(whatsappFlowEvents.createdAt)).limit(input?.limit || 100);
    }),
});

export const whatsappRouter = mergeRouters(baseWhatsAppRouter, whatsappAppRouter);
