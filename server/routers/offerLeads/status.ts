/**
 * Offer Leads Status Router
 * Router لحالة التسجيل
 */

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { offerLeads } from '../../../drizzle/schema';
import { createAuditLog } from '../auditLogs';
import { sendStatusChangeEvent } from '../../api/facebookCAPI';
import { dispatchWhatsAppMessage } from '../../services/whatsappMessageDispatcher';
import { createLogger } from '../../_core/logger';
import { invalidateEntityCache } from '../../services/cacheInvalidator';
import { updateStatusTimestamps } from '../../_core/statusTimestamps';

const logger = createLogger('offerLeads.status');

export const offerStatusRouter = router({
  // Update offer lead status (protected)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          'pending',
          'contacted',
          'no_answer',
          'confirmed',
          'attended',
          'completed',
          'cancelled',
        ]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDatabaseAvailable();

      // Get old status for audit log
      const [old] = await db
        .select({ status: offerLeads.status })
        .from(offerLeads)
        .where(eq(offerLeads.id, input.id))
        .limit(1);
      const oldStatus = old?.status || '';

      // حفظ وقت كل حالة
      const timestampUpdate = updateStatusTimestamps(input.status);

      await db
        .update(offerLeads)
        .set({
          status: input.status,
          statusNotes: input.notes,
          updatedAt: new Date(),
          ...timestampUpdate,
        })
        .where(eq(offerLeads.id, input.id));

      // Create audit log
      await createAuditLog({
        entityType: 'offerLead',
        entityId: input.id,
        action: 'status_change',
        oldValue: oldStatus,
        newValue: input.status,
        userId: ctx.user?.id,
        userName: ctx.user?.name,
        notes: input.notes,
      });

      // ── Send CAPI funnel event for status change (fire-and-forget) ────────────
      {
        const [leadRow] = await db
          .select({
            fullName: offerLeads.fullName,
            phone: offerLeads.phone,
            email: offerLeads.email,
          })
          .from(offerLeads)
          .where(eq(offerLeads.id, input.id))
          .limit(1);
        if (leadRow?.phone) {
          sendStatusChangeEvent({
            status: input.status,
            fullName: leadRow.fullName || '',
            phone: leadRow.phone,
            email: leadRow.email || undefined,
            serviceType: 'offer',
            bookingId: input.id,
          }).catch((err) => logger.error('Offer status change error:', err));
        }
      }

      // ── WhatsApp Dispatcher: إرسال رسالة تلقائية بناءً على الحالة ──
      {
        const [lead] = await db
          .select()
          .from(offerLeads)
          .where(eq(offerLeads.id, input.id))
          .limit(1);
        if (lead?.phone) {
          const { offers } = await import('../../../drizzle/schema');
          const [offer] = await db
            .select()
            .from(offers)
            .where(eq(offers.id, lead.offerId))
            .limit(1);
          const triggerMap: Record<string, string> = {
            confirmed: 'on_confirmed',
            attended: 'on_arrived',
            completed: 'on_completed',
            cancelled: 'on_cancelled',
          };
          const triggerEvent = triggerMap[input.status];
          if (triggerEvent) {
            dispatchWhatsAppMessage({
              entityType: 'offer_lead',
              triggerEvent: triggerEvent as
                'on_confirmed' | 'on_arrived' | 'on_completed' | 'on_cancelled',
              phone: lead.phone,
              recipientName: lead.fullName || undefined,
              variables: {
                name: lead.fullName || 'العميل',
                service: offer?.title || 'العرض',
              },
              entityId: input.id,
              sentBy: ctx.user?.id,
            }).catch((err) => logger.error('Offer status trigger error:', err));
          }
        }
      }

      // Invalidate offer leads caches after status update
      invalidateEntityCache('offerLeads');

      return { success: true };
    }),

  // Bulk update status for multiple offer leads (protected)
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        status: z.enum([
          'pending',
          'contacted',
          'no_answer',
          'confirmed',
          'attended',
          'completed',
          'cancelled',
        ]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDatabaseAvailable();

      // حفظ وقت كل حالة
      const timestampUpdate = updateStatusTimestamps(input.status);

      // Update all selected offer leads
      for (const id of input.ids) {
        await db
          .update(offerLeads)
          .set({
            status: input.status,
            statusNotes: input.notes,
            updatedAt: new Date(),
            ...timestampUpdate,
          })
          .where(eq(offerLeads.id, id));
      }

      // Create audit logs for bulk update
      for (const id of input.ids) {
        await createAuditLog({
          entityType: 'offerLead',
          entityId: id,
          action: 'bulk_status_change',
          newValue: input.status,
          userId: ctx.user?.id,
          userName: ctx.user?.name,
          notes: input.notes,
        });
      }

      // Invalidate offer leads caches after bulk update
      invalidateEntityCache('offerLeads');

      return { success: true, count: input.ids.length };
    }),
});
