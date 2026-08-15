/**
 * Update Appointments Routes
 * مسارات تحديث المواعيد
 */

import { eq } from 'drizzle-orm';
import { ensureDatabaseAvailable } from '../../../_core/databaseGuard';
import { getDb } from '../../../database/db';
import { appointments } from '../../../../drizzle/schema';
import { updateAppointmentStatus, bulkUpdateAppointmentStatus } from '../../../database/db';
import { createAuditLog } from '../../auditLogs';
import { sendStatusChangeEvent } from '../../../api/facebookCAPI';
import { createLogger } from '../../../_core/logger';
import { dispatchWhatsAppMessage } from '../../../services/whatsappMessageDispatcher';
import { getDoctorById } from '../../../database/db';
import {
  invalidateAppointmentCaches,
  sendStatusWhatsAppMessage,
} from '../utils/appointmentHelpers';

const logger = createLogger('appointments');

export const updateRoutes = {
  updateStatus: async ({
    ctx,
    input,
  }: {
    ctx: Record<string, unknown>;
    input: Record<string, unknown>;
  }) => {
    const id = input.id as number;
    const status = input.status as string;
    const staffNotes = input.staffNotes as string | undefined;

    // Get old status for audit log
    const dbForAudit = await getDb();
    let oldStatus = '';
    if (dbForAudit) {
      const [old] = await dbForAudit
        .select({ status: appointments.status })
        .from(appointments)
        .where(eq(appointments.id, id))
        .limit(1);
      oldStatus = old?.status || '';
    }

    await updateAppointmentStatus(id, status, staffNotes);

    // Create audit log
    await createAuditLog({
      entityType: 'appointment',
      entityId: id,
      action: 'status_change',
      oldValue: oldStatus,
      newValue: status,
      userId: (ctx.user as { id?: number })?.id,
      userName: (ctx.user as { name?: string })?.name,
      notes: staffNotes,
    });

    // Invalidate appointment caches after status update
    invalidateAppointmentCaches();

    // ── Send CAPI funnel event for status change (fire-and-forget) ────────────
    // يُرسَل الحدث المناسب لكل مرحلة في مسار المبيعات
    // لا تُرسَل بيانات طبية حساسة وفق سياسة Meta لمزودي الرعاية الصحية
    {
      const dbForCapi = await getDb();
      if (dbForCapi) {
        const [apptRow] = await dbForCapi
          .select({
            fullName: appointments.fullName,
            phone: appointments.phone,
            email: appointments.email,
          })
          .from(appointments)
          .where(eq(appointments.id, id))
          .limit(1);
        if (apptRow?.phone) {
          sendStatusChangeEvent({
            status: status,
            fullName: apptRow.fullName || '',
            phone: apptRow.phone,
            email: apptRow.email || undefined,
            serviceType: 'appointment',
            bookingId: id,
          }).catch((err: unknown) => logger.error('Status change error:', err));
        }
      }
    }

    // ── WhatsApp Dispatcher: إرسال رسالة تلقائية بناءً على الحالة الجديدة ──
    {
      const db = await getDb();
      if (db) {
        await sendStatusWhatsAppMessage(
          db,
          getDoctorById,
          dispatchWhatsAppMessage,
          id,
          status,
          (ctx.user as { id?: number })?.id
        );
      }
    }

    return { success: true };
  },

  updateAppointment: async ({ input }: { input: Record<string, unknown> }) => {
    const id = input.id as number;
    const appointmentDate = input.appointmentDate as string | undefined;
    const status = input.status as string | undefined;
    const staffNotes = input.staffNotes as string | undefined;

    const db = await ensureDatabaseAvailable();

    const updateData: Record<string, unknown> = {};
    if (appointmentDate) {
      updateData.appointmentDate = new Date(appointmentDate);
    }
    if (status) {
      updateData.status = status;
    }
    if (staffNotes !== undefined) {
      updateData.staffNotes = staffNotes;
    }

    await db.update(appointments).set(updateData).where(eq(appointments.id, id));

    // Invalidate appointment caches after update
    invalidateAppointmentCaches();

    return { success: true };
  },

  bulkUpdateStatus: async ({
    ctx,
    input,
  }: {
    ctx: Record<string, unknown>;
    input: Record<string, unknown>;
  }) => {
    const ids = input.ids as number[];
    const status = input.status as string;
    const staffNotes = input.staffNotes as string | undefined;

    const result = await bulkUpdateAppointmentStatus(ids, status, staffNotes);

    // Create audit logs for bulk update
    for (const id of ids) {
      await createAuditLog({
        entityType: 'appointment',
        entityId: id,
        action: 'bulk_status_change',
        newValue: status,
        userId: (ctx.user as { id?: number })?.id,
        userName: (ctx.user as { name?: string })?.name,
        notes: staffNotes,
      });
    }

    // Invalidate appointment caches after bulk update
    invalidateAppointmentCaches();

    return result;
  },
};
