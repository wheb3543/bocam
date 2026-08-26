import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { appointments } from '../../drizzle/schema';
import { publicProcedure, router } from '../_core/trpc';
import { assertRolePermission, permissionProcedure } from './permissionProcedures';
import { submitAppointment } from './appointments/routes/submitRoute';
import { listRoutes } from './appointments/routes/listRoutes';
import { updateRoutes } from './appointments/routes/updateRoutes';
import { sendArrivalWelcome } from './appointments/routes/arrivalRoute';
import { generateReceiptNumber } from './appointments/routes/receiptRoute';
import { invalidateAppointmentCaches } from './appointments/utils/appointmentHelpers';
import { createAuditLog } from './auditLogs';
import {
  assertAssignableUser,
  listAssignableUsers,
  notifyWorkAssignment,
} from '../services/workAssignmentService';

const appointmentsViewProcedure = permissionProcedure('appointments.view', 'عرض المواعيد');
const appointmentsUpdateProcedure = permissionProcedure('appointments.update', 'تعديل المواعيد');
const appointmentsCancelProcedure = permissionProcedure('appointments.cancel', 'إلغاء المواعيد');
const appointmentsDeleteProcedure = permissionProcedure('appointments.delete', 'حذف المواعيد');
const appointmentsAssignProcedure = permissionProcedure('appointments.assign', 'إسناد المواعيد');

async function assertCancellationPermission(user: { id: number; role: string }, status?: string) {
  if (status === 'cancelled') {
    await assertRolePermission(user, 'appointments.cancel', 'إلغاء المواعيد');
  }
}

export const appointmentsRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        phone: z
          .string()
          .min(9)
          .regex(
            /^(\+?967)?7\d{8}$|^07\d{8}$|^7\d{8}$/,
            'رقم الهاتف يجب أن يبدأ بالرقم 7 ويتكون من 9 أرقام'
          ),
        email: z.string().optional(),
        doctorId: z.number(),
        age: z.number().optional(),
        gender: z.enum(['male', 'female']).optional(),
        procedure: z.string().optional(),
        preferredDate: z.string().optional(),
        preferredTime: z.string().optional(),
        additionalNotes: z.string().optional(),
        patientMessage: z.string().max(500).optional(),
        campaignSlug: z.string(),
        source: z.string().optional(),
        status: z
          .enum([
            'pending',
            'contacted',
            'no_answer',
            'confirmed',
            'attended',
            'completed',
            'cancelled',
          ])
          .optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        utmTerm: z.string().optional(),
        utmContent: z.string().optional(),
        utmPlacement: z.string().optional(),
        referrer: z.string().optional(),
        fbclid: z.string().optional(),
        gclid: z.string().optional(),
      })
    )
    .mutation(submitAppointment),

  list: appointmentsViewProcedure.query(listRoutes.list),

  listPaginated: appointmentsViewProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100000).default(20),
        searchTerm: z.string().optional(),
        doctorIds: z.array(z.number()).optional(),
        sources: z.array(z.string()).optional(),
        statuses: z.array(z.string()).optional(),
        dateFilter: z.enum(['all', 'today', 'week', 'month']).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(listRoutes.listPaginated),

  updateStatus: appointmentsUpdateProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.string(),
        staffNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertCancellationPermission(ctx.user, input.status);
      return updateRoutes.updateStatus({ input, ctx });
    }),

  updateAppointment: appointmentsUpdateProcedure
    .input(
      z.object({
        id: z.number(),
        appointmentDate: z.string().optional(),
        status: z.string().optional(),
        staffNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertCancellationPermission(ctx.user, input.status);
      return updateRoutes.updateAppointment({ input });
    }),

  sendArrivalWelcome: appointmentsUpdateProcedure
    .input(
      z.object({
        appointmentId: z.number(),
      })
    )
    .mutation(sendArrivalWelcome),

  bulkUpdateStatus: appointmentsUpdateProcedure
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
        staffNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertCancellationPermission(ctx.user, input.status);
      return updateRoutes.bulkUpdateStatus({ input, ctx });
    }),

  generateReceiptNumber: appointmentsUpdateProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(generateReceiptNumber),

  assignableUsers: appointmentsAssignProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    return listAssignableUsers(db, 'appointments.update');
  }),

  assign: appointmentsAssignProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        assignedToUserId: z.number().int().positive().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [appointment] = await db
        .select({ assignedToUserId: appointments.assignedToUserId })
        .from(appointments)
        .where(eq(appointments.id, input.id))
        .limit(1);
      if (!appointment) {
        throw new Error('الموعد غير موجود');
      }
      await assertAssignableUser(db, input.assignedToUserId, 'appointments.update');
      await db
        .update(appointments)
        .set({ assignedToUserId: input.assignedToUserId })
        .where(eq(appointments.id, input.id));
      await createAuditLog({
        entityType: 'appointment',
        entityId: input.id,
        action: 'assignment_change',
        oldValue: appointment.assignedToUserId ? String(appointment.assignedToUserId) : null,
        newValue: input.assignedToUserId ? String(input.assignedToUserId) : null,
        userId: ctx.user.id,
        userName: ctx.user.name,
      });
      if (input.assignedToUserId && input.assignedToUserId !== appointment.assignedToUserId) {
        void notifyWorkAssignment(db, {
          kind: 'appointment',
          entityId: input.id,
          assignedUserId: input.assignedToUserId,
          actorUserId: ctx.user.id,
        }).catch(() => undefined);
      }
      invalidateAppointmentCaches();
      return { success: true };
    }),

  cancel: appointmentsCancelProcedure
    .input(z.object({ id: z.number(), staffNotes: z.string().optional() }))
    .mutation(async ({ input, ctx }) =>
      updateRoutes.updateStatus({ input: { ...input, status: 'cancelled' }, ctx })
    ),

  delete: appointmentsDeleteProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      await db.delete(appointments).where(eq(appointments.id, input.id));
      // Invalidate appointment caches after deletion
      invalidateAppointmentCaches();
      return { success: true };
    }),
});
