import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import {
  createPatientResult,
  getPatientByPhone,
  getPatientResults,
  sanitizePatient,
  updatePatientResultStatus,
} from "../db/patients";

export const patientResultsRouter = router({
  listByPatientId: adminProcedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ input }) => {
      return getPatientResults(input.patientId);
    }),

  listByPhone: adminProcedure
    .input(z.object({ phone: z.string().min(9).max(20) }))
    .query(async ({ input }) => {
      const patient = await getPatientByPhone(input.phone);
      if (!patient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد مريض بهذا الرقم" });
      }
      const results = await getPatientResults(patient.id);
      return { patient: sanitizePatient(patient), results };
    }),

  create: adminProcedure
    .input(z.object({
      phone: z.string().min(9).max(20),
      resultType: z.enum(["lab", "radiology", "report"]),
      title: z.string().min(2),
      description: z.string().optional(),
      fileUrl: z.string().url().optional(),
      doctorName: z.string().optional(),
      resultDate: z.coerce.date().optional(),
      status: z.enum(["pending", "ready", "delivered"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const patient = await getPatientByPhone(input.phone);
      if (!patient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد مريض بهذا الرقم" });
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

  updateStatus: adminProcedure
    .input(z.object({
      resultId: z.number(),
      status: z.enum(["pending", "ready", "delivered"]),
    }))
    .mutation(async ({ input }) => {
      const updated = await updatePatientResultStatus(input.resultId, input.status);
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "النتيجة غير موجودة" });
      }
      return updated;
    }),
});
