import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router } from '../_core/trpc';
import {
  createPatientResult,
  getPatientByPhone,
  getPatientResults,
  sanitizePatient,
  updatePatientResultStatus,
} from '../database/db/patients';
import { assertRolePermission, permissionProcedure } from './permissionProcedures';

const patientResultsViewProcedure = permissionProcedure(
  'patients.results.view',
  'عرض نتائج المرضى'
);
const patientResultsCreateProcedure = permissionProcedure(
  'patients.results.create',
  'إضافة نتائج المرضى'
);
const patientResultsStatusProcedure = permissionProcedure(
  'patients.results.status.update',
  'تحديث حالة نتائج المرضى'
);

export const patientResultsRouter = router({
  listByPatientId: patientResultsViewProcedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ input }) => {
      return getPatientResults(input.patientId);
    }),

  listByPhone: patientResultsViewProcedure
    .input(z.object({ phone: z.string().min(9).max(20) }))
    .query(async ({ input }) => {
      const patient = await getPatientByPhone(input.phone);
      if (!patient) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'لا يوجد مريض بهذا الرقم' });
      }
      const results = await getPatientResults(patient.id);
      return { patient: sanitizePatient(patient), results };
    }),

  create: patientResultsCreateProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(20),
        resultType: z.enum(['lab', 'radiology', 'report']),
        title: z.string().min(2),
        description: z.string().optional(),
        fileUrl: z.string().url().optional(),
        doctorName: z.string().optional(),
        resultDate: z.coerce.date().optional(),
        status: z.enum(['pending', 'ready', 'delivered']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.status && input.status !== 'pending') {
        await assertRolePermission(
          ctx.user,
          'patients.results.status.update',
          'تحديث حالة نتائج المرضى'
        );
      }
      const patient = await getPatientByPhone(input.phone);
      if (!patient) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'لا يوجد مريض بهذا الرقم' });
      }

      await createPatientResult({
        patientId: patient.id,
        resultType: input.resultType,
        title: input.title,
        description: input.description,
        fileUrl: input.fileUrl,
        doctorName: input.doctorName,
        resultDate: input.resultDate,
        status: input.status,
      });

      return { success: true };
    }),

  updateStatus: patientResultsStatusProcedure
    .input(
      z.object({
        resultId: z.number(),
        status: z.enum(['pending', 'ready', 'delivered']),
      })
    )
    .mutation(async ({ input }) => {
      const updated = await updatePatientResultStatus(input.resultId, input.status);
      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'النتيجة غير موجودة' });
      }
      return updated;
    }),
});
