/**
 * Offer Leads Admin Router
 * Router للعمليات الإدارية
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { offerLeads } from '../../../drizzle/schema';
import { invalidateEntityCache } from '../../services/cacheInvalidator';

export const offerAdminRouter = router({
  // Delete offer lead (protected)
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.delete(offerLeads).where(eq(offerLeads.id, input.id));

    // Invalidate offer leads caches after deletion
    invalidateEntityCache('offerLeads');

    return { success: true };
  }),

  // Generate and save receipt number
  generateReceiptNumber: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      // Check if receipt number already exists
      const [lead] = await db.select().from(offerLeads).where(eq(offerLeads.id, input.id)).limit(1);
      if (!lead) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'الحجز غير موجود' });
      }

      // If already has receipt number, return it
      if (lead.receiptNumber) {
        return { receiptNumber: lead.receiptNumber };
      }

      // Generate new receipt number
      const year = new Date().getFullYear();

      // Get the count of offer leads with receipt numbers this year
      const { sql } = await import('drizzle-orm');
      const [result] = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM offerLeads 
        WHERE receiptNumber LIKE CONCAT('SGH-', ${year}, '-%')
      `);

      const count = (result as { count?: number }).count || 0;
      const sequenceNumber = count + 1;
      const paddedNumber = String(sequenceNumber).padStart(3, '0');
      const receiptNumber = `SGH-${year}-${paddedNumber}`;

      // Save receipt number
      await db.update(offerLeads).set({ receiptNumber }).where(eq(offerLeads.id, input.id));

      return { receiptNumber };
    }),
});
