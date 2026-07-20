import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { appointments } from '../../drizzle/schema';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { submitAppointment } from './appointments/routes/submitRoute';
import { listRoutes } from './appointments/routes/listRoutes';
import { updateRoutes } from './appointments/routes/updateRoutes';
import { sendArrivalWelcome } from './appointments/routes/arrivalRoute';
import { generateReceiptNumber } from './appointments/routes/receiptRoute';
import { invalidateAppointmentCaches } from './appointments/utils/appointmentHelpers';

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

  list: protectedProcedure.query(listRoutes.list),

  listPaginated: protectedProcedure
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

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.string(),
        staffNotes: z.string().optional(),
      })
    )
    .mutation(updateRoutes.updateStatus),

  updateAppointment: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        appointmentDate: z.string().optional(),
        status: z.string().optional(),
        staffNotes: z.string().optional(),
      })
    )
    .mutation(updateRoutes.updateAppointment),

  sendArrivalWelcome: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
      })
    )
    .mutation(sendArrivalWelcome),

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
        staffNotes: z.string().optional(),
      })
    )
    .mutation(updateRoutes.bulkUpdateStatus),

  generateReceiptNumber: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(generateReceiptNumber),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();
    await db.delete(appointments).where(eq(appointments.id, input.id));
    // Invalidate appointment caches after deletion
    invalidateAppointmentCaches();
    return { success: true };
  }),
});
