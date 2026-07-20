/**
 * Camp Registrations Admin Router
 * Router للعمليات الإدارية
 */

import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { campRegistrations } from '../../../drizzle/schema';
import {
  generateReceiptNumberSchema,
  scheduleReportSchema,
  deleteCampRegistrationSchema,
} from '../campRegistrationSchemas';
import { invalidateCampRegistrationCache } from '../campRegistrationHelpers';

export const campAdminRouter = router({
  // Delete camp registration (protected)
  delete: protectedProcedure.input(deleteCampRegistrationSchema).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.delete(campRegistrations).where(eq(campRegistrations.id, input.id));

    invalidateCampRegistrationCache();

    return { success: true };
  }),

  // Generate and save receipt number
  generateReceiptNumber: protectedProcedure
    .input(generateReceiptNumberSchema)
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const [registration] = await db
        .select()
        .from(campRegistrations)
        .where(eq(campRegistrations.id, input.id))
        .limit(1);

      if (!registration) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'التسجيل غير موجود' });
      }

      if (registration.receiptNumber) {
        return { receiptNumber: registration.receiptNumber };
      }

      const year = new Date().getFullYear();

      const { sql } = await import('drizzle-orm');
      const [result] = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM campRegistrations 
        WHERE receiptNumber LIKE CONCAT('SGH-', ${year}, '-%')
      `);

      const count = (result as { count?: number }).count || 0;
      const sequenceNumber = count + 1;
      const paddedNumber = String(sequenceNumber).padStart(3, '0');
      const receiptNumber = `SGH-${year}-${paddedNumber}`;

      await db
        .update(campRegistrations)
        .set({ receiptNumber })
        .where(eq(campRegistrations.id, input.id));

      return { receiptNumber };
    }),

  // Schedule camp stats report (not implemented)
  scheduleReport: protectedProcedure.input(scheduleReportSchema).mutation(async () => {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'جدولة التقارير غير مفعّلة بعد. سيتم دعمها لاحقاً عند ربط البريد والجدولة.',
    });
  }),
});
