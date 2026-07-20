/**
 * WhatsApp Quality Routes
 * مسارات الجودة لواتساب
 */

import { protectedProcedure, router } from '../../../../_core/trpc';
import { TRPCError } from '@trpc/server';
import { ensureDatabaseAvailable } from '../../../../_core/databaseGuard';
import * as db from '../../../../database/db';
import { z } from 'zod';

export const qualityRouter = router({
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
        const dbConn = await ensureDatabaseAvailable();
        const { whatsappPhoneQuality } = await import('../../../../../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');

        const query = input?.phoneNumber
          ? dbConn
              .select()
              .from(whatsappPhoneQuality)
              .where(eq(whatsappPhoneQuality.phoneNumber, input.phoneNumber))
          : dbConn.select().from(whatsappPhoneQuality);

        return query.orderBy(desc(whatsappPhoneQuality.createdAt)).limit(input?.limit || 100);
      }),

    getCurrent: protectedProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
      }
      const { whatsappPhoneQuality } = await import('../../../../../drizzle/schema');
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
        const dbConn = await ensureDatabaseAvailable();
        const { whatsappConversationQuality } = await import('../../../../../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');

        const query = input?.phoneNumber
          ? dbConn
              .select()
              .from(whatsappConversationQuality)
              .where(eq(whatsappConversationQuality.phoneNumber, input.phoneNumber))
          : dbConn.select().from(whatsappConversationQuality);

        return query
          .orderBy(desc(whatsappConversationQuality.createdAt))
          .limit(input?.limit || 100);
      }),
  }),
});
