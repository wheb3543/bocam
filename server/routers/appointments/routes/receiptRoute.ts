/**
 * Receipt Number Route
 * مسار رقم الإيصال
 */

import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { ensureDatabaseAvailable } from '../../../_core/databaseGuard';
import { appointments } from '../../../../drizzle/schema';

export async function generateReceiptNumber({ input }: { input: Record<string, unknown> }) {
  const id = input.id as number;

  const db = await ensureDatabaseAvailable();

  // Check if receipt number already exists
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);
  if (!appointment) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'الحجز غير موجود' });
  }

  // If already has receipt number, return it
  if (appointment.receiptNumber) {
    return { receiptNumber: appointment.receiptNumber };
  }

  // Generate new receipt number
  const year = new Date().getFullYear();

  // Get the count of appointments with receipt numbers this year
  const { sql } = await import('drizzle-orm');
  const [result] = await db.execute(sql`
    SELECT COUNT(*) as count 
    FROM appointments 
    WHERE receiptNumber LIKE CONCAT('SGH-', ${year}, '-%')
  `);

  const count = (result as { count?: number }).count || 0;
  const sequenceNumber = count + 1;
  const paddedNumber = String(sequenceNumber).padStart(3, '0');
  const receiptNumber = `SGH-${year}-${paddedNumber}`;

  // Save receipt number
  await db.update(appointments).set({ receiptNumber }).where(eq(appointments.id, id));
  return { receiptNumber };
}
