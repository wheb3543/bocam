/**
 * Camp Registration Schemas - تعريفات المخططات لتسجيلات المخيمات
 * تعريفات Zod schemas للتحقق من البيانات
 */

import { z } from 'zod';

export const campRegistrationStatusEnum = z.enum([
  'pending',
  'contacted',
  'no_answer',
  'confirmed',
  'attended',
  'completed',
  'cancelled',
]);

export const timeSlotEnum = z.enum(['morning', 'evening']);

export const dateFilterEnum = z.enum(['all', 'today', 'week', 'month']);

export const submitCampRegistrationSchema = z.object({
  campId: z.number(),
  fullName: z.string().min(1),
  phone: z
    .string()
    .min(9)
    .regex(
      /^(\+?967)?7\d{8}$|^07\d{8}$|^7\d{8}$/,
      'رقم الهاتف يجب أن يبدأ بالرقم 7 ويتكون من 9 أرقام'
    ),
  email: z.string().email().optional(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female']).optional(),
  procedures: z.string().optional(),
  medicalCondition: z.string().optional(),
  patientMessage: z.string().max(500).optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  status: campRegistrationStatusEnum.optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  utmPlacement: z.string().optional(),
  referrer: z.string().optional(),
  fbclid: z.string().optional(),
  gclid: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTimeSlot: timeSlotEnum.optional(),
});

export const updateCampRegistrationStatusSchema = z.object({
  id: z.number(),
  status: campRegistrationStatusEnum,
  notes: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  attendanceDate: z.date().optional(),
  preferredDate: z.string().optional(),
  preferredTimeSlot: timeSlotEnum.optional(),
});

export const bulkUpdateCampRegistrationStatusSchema = z.object({
  ids: z.array(z.number()),
  status: campRegistrationStatusEnum,
  notes: z.string().optional(),
});

export const listPaginatedCampRegistrationsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100000).default(20),
  searchTerm: z.string().optional(),
  campIds: z.array(z.number()).optional(),
  sources: z.array(z.string()).optional(),
  statuses: z.array(z.string()).optional(),
  dateFilter: dateFilterEnum.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const generateReceiptNumberSchema = z.object({
  id: z.number(),
});

export const scheduleReportSchema = z.object({
  email: z.string().email(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  campId: z.number().optional(),
});

export const deleteCampRegistrationSchema = z.object({
  id: z.number(),
});
