import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { publicProcedure, router } from "../_core/trpc";
import {
  getPatientByPhone,
  getPatientById,
  createPatient,
  createOtp,
  verifyOtp,
  verifyPatientPassword,
  updatePatientLastLogin,
  updatePatientProfile,
  getPatientAppointments,
  getPatientOfferLeads,
  getPatientCampRegistrations,
  getPatientResults,
  sanitizePatient,
} from "../database/db/patients";
import { meta } from "../api/MetaApiService";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const PATIENT_JWT_SECRET: string = process.env.JWT_SECRET;
const PATIENT_COOKIE_NAME = "patient_session";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Helper to create patient JWT
function createPatientToken(patientId: number, phone: string): string {
  return jwt.sign({ patientId, phone, type: "patient" }, PATIENT_JWT_SECRET, { expiresIn: "30d" });
}

// Helper to verify patient JWT
function verifyPatientToken(token: string): { patientId: number; phone: string } | null {
  try {
    const decoded = jwt.verify(token, PATIENT_JWT_SECRET) as any;
    if (decoded.type !== "patient") return null;
    return { patientId: decoded.patientId, phone: decoded.phone };
  } catch {
    return null;
  }
}

// Patient authenticated procedure
const patientProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const token = ctx.req.cookies?.[PATIENT_COOKIE_NAME];
  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "يرجى تسجيل الدخول أولاً" });
  }
  
  const decoded = verifyPatientToken(token);
  if (!decoded) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "جلسة منتهية، يرجى تسجيل الدخول مرة أخرى" });
  }
  
  const patient = await getPatientById(decoded.patientId);
  if (!patient || !patient.isActive) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "الحساب غير موجود أو معطل" });
  }
  
  return next({
    ctx: { ...ctx, patient },
  });
});

export const patientPortalRouter = router({
  // إرسال رمز التحقق
  sendOtp: publicProcedure
    .input(z.object({
      phone: z.string().min(9, "رقم الهاتف غير صحيح").max(15),
    }))
    .mutation(async ({ input }) => {
      const code = await createOtp(input.phone);
      
      // إرسال OTP عبر WhatsApp API
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      if (phoneNumberId) {
        try {
          const result = await meta.sendWhatsAppText(
            phoneNumberId,
            input.phone,
            `رمز التحقق الخاص بك هو: ${code}\n\nهذا الرمز صالح لمدة 5 دقائق. لا تشاركه مع أحد.`
          );
          console.log(`[PatientPortal] OTP sent via WhatsApp to ${input.phone}:`, result);
        } catch (error) {
          console.error(`[PatientPortal] Failed to send OTP via WhatsApp:`, error);
          // في حالة فشل WhatsApp، نعيد الرمز في بيئة التطوير
          console.log(`[PatientPortal] OTP for ${input.phone} (fallback): ${code}`);
        }
      } else {
        // في حالة عدم وجود WhatsApp Phone Number ID، نستخدم console.log
        console.log(`[PatientPortal] OTP for ${input.phone}: ${code}`);
      }
      
      return { 
        success: true, 
        message: "تم إرسال رمز التحقق",
      };
    }),

  // التحقق من الرمز وتسجيل الدخول
  verifyOtp: publicProcedure
    .input(z.object({
      phone: z.string().min(9).max(15),
      code: z.string().length(6, "رمز التحقق يجب أن يكون 6 أرقام"),
    }))
    .mutation(async ({ ctx, input }) => {
      const patient = await getPatientByPhone(input.phone);
      const consumeOtp = !!patient;

      const isValid = await verifyOtp(input.phone, input.code, { consume: consumeOtp });
      if (!isValid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
      }
      
      if (!patient) {
        // المريض غير مسجل - يُبقي الرمز صالحاً لخطوة التسجيل
        return { success: true, needsRegistration: true, phone: input.phone };
      }
      
      // المريض مسجل - تسجيل دخول
      await updatePatientLastLogin(patient.id);
      const token = createPatientToken(patient.id, patient.phone);
      
      ctx.res.cookie(PATIENT_COOKIE_NAME, token, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      });
      
      return { success: true, needsRegistration: false, patient: sanitizePatient(patient) };
    }),

  // تسجيل مريض جديد
  register: publicProcedure
    .input(z.object({
      phone: z.string().min(9).max(15),
      code: z.string().length(6),
      fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
      address: z.string().optional(),
      age: z.number().min(1).max(150).optional(),
      gender: z.enum(["male", "female"]),
      email: z.string().email().optional(),
      password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify OTP first
      const isValid = await verifyOtp(input.phone, input.code);
      if (!isValid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
      }
      
      // Check if already registered
      const existing = await getPatientByPhone(input.phone);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "هذا الرقم مسجل مسبقاً" });
      }
      
      // Create patient
      const patient = await createPatient({
        fullName: input.fullName,
        phone: input.phone,
        address: input.address,
        age: input.age,
        gender: input.gender,
        email: input.email,
        password: input.password,
      });
      
      if (!patient) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل إنشاء الحساب" });
      }
      
      // Auto login
      await updatePatientLastLogin(patient.id);
      const token = createPatientToken(patient.id, patient.phone);
      
      ctx.res.cookie(PATIENT_COOKIE_NAME, token, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      
      return { success: true, patient: sanitizePatient(patient) };
    }),

  // تسجيل دخول بكلمة المرور
  loginWithPassword: publicProcedure
    .input(z.object({
      phone: z.string().min(9).max(15),
      password: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await verifyPatientPassword(input.phone, input.password);
      
      if (!result.hasPassword) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "هذا الحساب ليس لديه كلمة مرور. يرجى استخدام رمز التحقق (OTP) للدخول أو تعيين كلمة مرور من صفحة الملف الشخصي." 
        });
      }
      
      if (!result.success) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "رقم الهاتف أو كلمة المرور غير صحيحة" });
      }
      
      const patient = await getPatientByPhone(input.phone);
      if (!patient || !patient.isActive) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "الحساب غير موجود أو معطل" });
      }
      
      await updatePatientLastLogin(patient.id);
      const token = createPatientToken(patient.id, patient.phone);
      
      ctx.res.cookie(PATIENT_COOKIE_NAME, token, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      
      return { success: true, patient: sanitizePatient(patient) };
    }),

  // الحصول على بيانات المريض الحالي
  me: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies?.[PATIENT_COOKIE_NAME];
    if (!token) return null;
    
    const decoded = verifyPatientToken(token);
    if (!decoded) return null;
    
    const patient = await getPatientById(decoded.patientId);
    if (!patient?.isActive) return null;
    return sanitizePatient(patient);
  }),

  // تسجيل الخروج
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(PATIENT_COOKIE_NAME, { path: "/" });
    return { success: true };
  }),

  // تحديث الملف الشخصي
  updateProfile: patientProcedure
    .input(z.object({
      fullName: z.string().min(3).optional(),
      address: z.string().optional(),
      age: z.number().min(1).max(150).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updated = await updatePatientProfile((ctx as any).patient.id, input);
      return sanitizePatient(updated);
    }),

  // الحصول على حجوزات المريض (مواعيد الأطباء)
  myAppointments: patientProcedure.query(async ({ ctx }) => {
    return getPatientAppointments((ctx as any).patient.phone);
  }),

  // الحصول على حجوزات العروض
  myOfferBookings: patientProcedure.query(async ({ ctx }) => {
    return getPatientOfferLeads((ctx as any).patient.phone);
  }),

  // الحصول على تسجيلات المخيمات
  myCampRegistrations: patientProcedure.query(async ({ ctx }) => {
    return getPatientCampRegistrations((ctx as any).patient.phone);
  }),

  // الحصول على النتائج والتقارير
  myResults: patientProcedure.query(async ({ ctx }) => {
    return getPatientResults((ctx as any).patient.id);
  }),
});
