/**
 * WhatsApp Subscription Routes
 * مسارات الاشتراكات لواتساب
 */

import { protectedProcedure, router } from '../../../../_core/trpc';
import { TRPCError } from '@trpc/server';
import { ensureDatabaseAvailable } from '../../../../_core/databaseGuard';
import * as db from '../../../../database/db';
import { z } from 'zod';

export const subscriptionRouter = router({
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
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappUserOptIns } = await import('../../../../../drizzle/schema');
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

      return query.orderBy(desc(whatsappUserOptIns.createdAt)).limit(input?.limit || 100);
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
    .mutation(
      async ({
        input,
      }: {
        input: {
          phoneNumber: string;
          status: 'opted_in' | 'opted_out';
          optInType: 'general' | 'marketing';
          source: string;
        };
      }) => {
        const dbConn = await db.getDb();
        if (!dbConn) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }
        const { whatsappUserOptIns } = await import('../../../../../drizzle/schema');
        const { eq, and } = await import('drizzle-orm');

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
          await dbConn.insert(whatsappUserOptIns).values({
            phoneNumber: input.phoneNumber,
            optInType: input.optInType,
            status: input.status,
            source: input.source,
            details: JSON.stringify({ manualUpdate: true }),
          });
        }

        return { success: true };
      }
    ),

  getStats: protectedProcedure.query(async () => {
    const dbConn = await db.getDb();
    if (!dbConn) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
    }
    const { whatsappUserOptIns } = await import('../../../../../drizzle/schema');

    const allSubs = await dbConn.select().from(whatsappUserOptIns);

    return {
      general: {
        optedIn: allSubs.filter((s) => s.optInType === 'general' && s.status === 'opted_in').length,
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
});
