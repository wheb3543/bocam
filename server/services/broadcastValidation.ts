/**
 * Broadcast & Contact Management Validation Schemas
 * Zod schemas للتحقق من بيانات البث والجهات
 */

import { z } from 'zod';

/**
 * معايير تصفية المستقبلين
 */
export const AppointmentFilterSchema = z
  .object({
    allDoctors: z.boolean().default(true),
    doctorIds: z.array(z.number()).optional(),
    statuses: z.array(z.string()).optional(),
  })
  .optional();

export const CampFilterSchema = z
  .object({
    allCamps: z.boolean().default(true),
    campIds: z.array(z.number()).optional(),
    statuses: z.array(z.string()).optional(),
  })
  .optional();

export const OfferFilterSchema = z
  .object({
    allOffers: z.boolean().default(true),
    offerIds: z.array(z.number()).optional(),
    statuses: z.array(z.string()).optional(),
  })
  .optional();

/**
 * معايير التصفية الشاملة
 */
export const BroadcastFilterCriteriaSchema = z.object({
  recipientSources: z.array(z.enum(['appointments', 'camp_registrations', 'offer_leads', 'leads'])),
  appointmentFilter: AppointmentFilterSchema,
  campFilter: CampFilterSchema,
  offerFilter: OfferFilterSchema,
  leadFilter: z
    .object({
      allLeads: z.boolean().default(true),
      campaignIds: z.array(z.number()).optional(),
      statuses: z.array(z.string()).optional(),
    })
    .optional(),
  excludePhoneNumbers: z.array(z.string()).optional(),
  includePhoneNumbers: z.array(z.string()).optional(),
});

export type BroadcastFilterCriteria = z.infer<typeof BroadcastFilterCriteriaSchema>;

/**
 * معاينة المستقبلين
 */
export const PreviewRecipientsSchema = z.object({
  filterCriteria: BroadcastFilterCriteriaSchema,
});

export type PreviewRecipients = z.infer<typeof PreviewRecipientsSchema>;

/**
 * متغيرات القالب
 */
export const TemplateVariablesSchema = z.record(z.string(), z.string());

/**
 * إرسال البث
 */
export const SendBroadcastSchema = z.object({
  name: z.string().min(1, 'اسم البث مطلوب').max(255),
  description: z.string().optional(),

  // معلومات القالب
  templateId: z.number().min(1, 'معرف القالب مطلوب'),
  templateVariables: TemplateVariablesSchema.optional(),

  // الوسائط
  mediaUrl: z.string().url('رابط الوسائط غير صحيح').optional(),
  mediaType: z.enum(['image', 'video', 'document', 'audio']).optional(),

  // معايير التصفية
  filterCriteria: BroadcastFilterCriteriaSchema,

  // الجدولة
  scheduledFor: z.date().optional(),

  // معلومات إضافية
  notes: z.string().optional(),
});

export type SendBroadcast = z.infer<typeof SendBroadcastSchema>;

/**
 * تحديث البث
 */
export const UpdateBroadcastSchema = z.object({
  id: z.number().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateBroadcast = z.infer<typeof UpdateBroadcastSchema>;

/**
 * الحصول على تفاصيل البث
 */
export const GetBroadcastSchema = z.object({
  id: z.number().min(1),
});

/**
 * قائمة البثات
 */
export const ListBroadcastsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['draft', 'scheduled', 'sending', 'completed', 'failed']).optional(),
  search: z.string().optional(),
});

/**
 * نتائج المستقبلين
 */
export const GetBroadcastRecipientsSchema = z.object({
  broadcastId: z.number().min(1),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'sent', 'delivered', 'read', 'failed']).optional(),
});

/**
 * تصدير الجهات
 */
export const ExportContactsSchema = z.object({
  exportType: z.enum(['vcf', 'csv']),
  filterCriteria: z
    .object({
      recipientSources: z
        .array(z.enum(['appointments', 'camp_registrations', 'offer_leads', 'leads']))
        .optional(),
      statuses: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ExportContacts = z.infer<typeof ExportContactsSchema>;

/**
 * قائمة الجهات
 */
export const ListContactsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  recipientSources: z
    .array(z.enum(['appointments', 'camp_registrations', 'offer_leads', 'leads']))
    .optional(),
  statuses: z.array(z.string()).optional(),
});

/**
 * مزامنة Google
 */
export const GoogleSyncSchema = z.object({
  syncType: z.enum(['export_to_google', 'import_from_google']),
  googleAccessToken: z.string().min(1, 'رمز الوصول مطلوب'),
  filterCriteria: z
    .object({
      recipientSources: z
        .array(z.enum(['appointments', 'camp_registrations', 'offer_leads', 'leads']))
        .optional(),
    })
    .optional(),
});

export type GoogleSync = z.infer<typeof GoogleSyncSchema>;

/**
 * سجل المزامنة
 */
export const GetSyncLogsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  syncType: z.enum(['export_to_google', 'import_from_google', 'sync_bidirectional']).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

/**
 * سجل التصديرات
 */
export const GetExportLogsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  exportType: z.enum(['vcf', 'csv', 'google_sync']).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});
