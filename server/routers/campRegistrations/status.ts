/**
 * Camp Registrations Status Router
 * Router لحالة التسجيل
 */

import { eq, inArray } from 'drizzle-orm';
import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { campRegistrations } from '../../../drizzle/schema';
import {
  updateCampRegistrationStatusSchema,
  bulkUpdateCampRegistrationStatusSchema,
} from '../campRegistrationSchemas';
import {
  sendStatusChangeCAPI,
  createCampAuditLog,
  invalidateCampRegistrationCache,
} from '../campRegistrationHelpers';
import { createLogger } from '../../_core/logger';
import { updateStatusTimestamps } from '../../_core/statusTimestamps';

const logger = createLogger('campRegistrations.status');

export const campStatusRouter = router({
  // Update camp registration status (protected)
  updateStatus: protectedProcedure
    .input(updateCampRegistrationStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDatabaseAvailable();

      const [old] = await db
        .select({ status: campRegistrations.status })
        .from(campRegistrations)
        .where(eq(campRegistrations.id, input.id))
        .limit(1);
      const oldStatus = old?.status || '';

      const now = new Date();
      const updateData: Record<string, unknown> = {
        status: input.status,
        statusNotes: input.notes,
        updatedAt: now,
        ...updateStatusTimestamps(input.status),
      };

      if (input.fullName) {
        updateData.fullName = input.fullName;
      }
      if (input.phone) {
        updateData.phone = input.phone;
      }
      if (input.attendanceDate) {
        updateData.attendanceDate = input.attendanceDate;
      }
      if (input.preferredDate !== undefined) {
        (updateData as Record<string, unknown>).preferredDate = input.preferredDate;
      }
      if (input.preferredTimeSlot !== undefined) {
        (updateData as Record<string, unknown>).preferredTimeSlot = input.preferredTimeSlot;
      }

      await db.update(campRegistrations).set(updateData).where(eq(campRegistrations.id, input.id));

      await createCampAuditLog(
        input.id,
        'status_change',
        oldStatus,
        input.status,
        ctx.user?.id,
        ctx.user?.name || undefined,
        input.notes
      );

      const [regRow] = await db
        .select({
          fullName: campRegistrations.fullName,
          phone: campRegistrations.phone,
          email: campRegistrations.email,
        })
        .from(campRegistrations)
        .where(eq(campRegistrations.id, input.id))
        .limit(1);

      if (regRow?.phone) {
        sendStatusChangeCAPI(
          input.status,
          regRow.fullName || '',
          regRow.phone,
          regRow.email || undefined,
          input.id
        );
      }

      const [reg] = await db
        .select()
        .from(campRegistrations)
        .where(eq(campRegistrations.id, input.id))
        .limit(1);

      if (reg?.phone) {
        const { camps } = await import('../../../drizzle/schema');
        const [camp] = await db.select().from(camps).where(eq(camps.id, reg.campId)).limit(1);
        const triggerMap: Record<string, string> = {
          confirmed: 'on_confirmed',
          attended: 'on_arrived',
          completed: 'on_completed',
          cancelled: 'on_cancelled',
        };
        const triggerEvent = triggerMap[input.status];
        if (triggerEvent) {
          const campMorningTime = (camp as { morningTime?: string })?.morningTime;
          const campEveningTime = (camp as { eveningTime?: string })?.eveningTime;

          const { dispatchWhatsAppMessage } =
            await import('../../services/whatsappMessageDispatcher');
          dispatchWhatsAppMessage({
            entityType: 'camp_registration',
            triggerEvent: triggerEvent as
              'on_confirmed' | 'on_arrived' | 'on_completed' | 'on_cancelled',
            phone: reg.phone,
            recipientName: reg.fullName || undefined,
            variables: {
              name: reg.fullName || 'المسجل',
              camp_name: camp?.name || 'المخيم',
              date: (reg as { preferredDate?: string }).preferredDate
                ? new Date(
                    (reg as { preferredDate?: string }).preferredDate || ''
                  ).toLocaleDateString('ar-YE')
                : camp?.startDate
                  ? new Date(camp.startDate).toLocaleDateString('ar-YE')
                  : 'غير محدد',
              time:
                (reg as { preferredTimeSlot?: string }).preferredTimeSlot === 'morning'
                  ? `صباحاً ${campMorningTime || ''}`
                  : (reg as { preferredTimeSlot?: string }).preferredTimeSlot === 'evening'
                    ? `مساءً ${campEveningTime || ''}`
                    : 'غير محدد',
              location: 'صنعاء - الستين الشمالي - قبل جولة الجمنه',
            },
            entityId: input.id,
            sentBy: ctx.user?.id,
          }).catch((err: Error) => logger.error('Camp status trigger error:', err));
        }
      }

      invalidateCampRegistrationCache();

      return { success: true };
    }),

  // Bulk update status for multiple registrations (protected)
  bulkUpdateStatus: protectedProcedure
    .input(bulkUpdateCampRegistrationStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await ensureDatabaseAvailable();

      const now = new Date();
      const updateData: Record<string, unknown> = {
        status: input.status,
        statusNotes: input.notes,
        updatedAt: now,
        ...updateStatusTimestamps(input.status),
      };

      for (const id of input.ids) {
        await db.update(campRegistrations).set(updateData).where(eq(campRegistrations.id, id));
      }

      for (const id of input.ids) {
        await createCampAuditLog(
          id,
          'bulk_status_change',
          '',
          input.status,
          ctx.user?.id,
          ctx.user?.name || undefined,
          input.notes
        );
      }

      const { camps } = await import('../../../drizzle/schema');
      const regs = await db
        .select()
        .from(campRegistrations)
        .where(inArray(campRegistrations.id, input.ids));

      const triggerMap: Record<string, string> = {
        confirmed: 'on_confirmed',
        attended: 'on_arrived',
        completed: 'on_completed',
        cancelled: 'on_cancelled',
      };
      const triggerEvent = triggerMap[input.status];

      for (const reg of regs) {
        if (reg.phone) {
          sendStatusChangeCAPI(
            input.status,
            reg.fullName || '',
            reg.phone,
            reg.email || undefined,
            reg.id
          );
        }
        if (reg.phone && triggerEvent) {
          const [camp] = await db.select().from(camps).where(eq(camps.id, reg.campId)).limit(1);
          const campMorningTime = (camp as { morningTime?: string })?.morningTime;
          const campEveningTime = (camp as { eveningTime?: string })?.eveningTime;

          const { dispatchWhatsAppMessage } =
            await import('../../services/whatsappMessageDispatcher');
          dispatchWhatsAppMessage({
            entityType: 'camp_registration',
            triggerEvent: triggerEvent as
              'on_confirmed' | 'on_arrived' | 'on_completed' | 'on_cancelled',
            phone: reg.phone,
            recipientName: reg.fullName || undefined,
            variables: {
              name: reg.fullName || 'المسجل',
              camp_name: camp?.name || 'المخيم',
              date: (reg as { preferredDate?: string }).preferredDate
                ? new Date(
                    (reg as { preferredDate?: string }).preferredDate || ''
                  ).toLocaleDateString('ar-YE')
                : camp?.startDate
                  ? new Date(camp.startDate).toLocaleDateString('ar-YE')
                  : 'غير محدد',
              time:
                (reg as { preferredTimeSlot?: string }).preferredTimeSlot === 'morning'
                  ? `صباحاً ${campMorningTime || ''}`
                  : (reg as { preferredTimeSlot?: string }).preferredTimeSlot === 'evening'
                    ? `مساءً ${campEveningTime || ''}`
                    : 'غير محدد',
              location: 'صنعاء - الستين الشمالي - قبل جولة الجمنه',
            },
            entityId: reg.id,
            sentBy: ctx.user?.id,
          }).catch((err: Error) => logger.error('Camp bulk status trigger error:', err));
        }
      }

      invalidateCampRegistrationCache();

      return { success: true, count: input.ids.length };
    }),
});
