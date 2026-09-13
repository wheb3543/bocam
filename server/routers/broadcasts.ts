/**
 * Broadcast Router
 * مسارات tRPC لإدارة البث والجهات
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  PreviewRecipientsSchema,
  SendBroadcastSchema,
  ListBroadcastsSchema,
  GetBroadcastRecipientsSchema,
  ExportContactsSchema,
  ListContactsSchema,
  GoogleSyncSchema,
  GetSyncLogsSchema,
  GetExportLogsSchema,
} from '../_core/broadcastValidation';
import { buildRecipientList } from '../services/broadcastRecipientService';
import {
  exportToVCF,
  exportToCSV,
  generateFileName,
  getFileMimeType,
  buildExportList,
  logExport,
  getExportLogs,
} from '../services/contactExportService';
import {
  createBroadcast,
  addBroadcastRecipients,
  executeBroadcast,
  getBroadcastStats,
  getBroadcastRecipients,
} from '../services/broadcastExecutionService';
import { storagePut } from '../services/storage';
import type { BroadcastFilterCriteria } from '../_core/broadcastValidation';

type LegacyContactFilter = {
  recipientSources?: ('appointments' | 'camp_registrations' | 'offer_leads' | 'leads')[];
  statuses?: string[];
};

function toBroadcastFilterCriteria(filter?: LegacyContactFilter): BroadcastFilterCriteria {
  const statuses = filter?.statuses;
  return {
    recipientSources: filter?.recipientSources ?? [
      'appointments',
      'camp_registrations',
      'offer_leads',
      'leads',
    ],
    appointmentFilter: { allDoctors: true, statuses },
    campFilter: { allCamps: true, statuses },
    offerFilter: { allOffers: true, statuses },
    leadFilter: { allLeads: true, statuses },
  };
}

export const broadcastRouter = router({
  /**
   * معاينة المستقبلين قبل الإرسال
   */
  previewRecipients: protectedProcedure.input(PreviewRecipientsSchema).query(async ({ input }) => {
    try {
      const result = await buildRecipientList(input.filterCriteria);
      return {
        success: true,
        data: {
          totalRecipients: result.totalCount,
          deduplicatedRecipients: result.deduplicatedCount,
          duplicateCount: result.duplicateCount,
          sampleRecipients: result.recipients.slice(0, 10),
          errors: result.errors,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),

  /**
   * إرسال البث
   */
  sendBroadcast: protectedProcedure.input(SendBroadcastSchema).mutation(async ({ input, ctx }) => {
    try {
      const recipientResult = await buildRecipientList(input.filterCriteria as any);

      if (recipientResult.recipients.length === 0) {
        return {
          success: false,
          error: 'لا توجد جهات اتصال مطابقة للمعايير المحددة',
        };
      }

      const broadcastId = await createBroadcast({
        id: 0,
        name: input.name,
        templateId: input.templateId,
        templateVariables: input.templateVariables,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
        filterCriteria: input.filterCriteria,
        createdBy: ctx.user.id,
      });

      await addBroadcastRecipients(broadcastId, recipientResult.recipients);

      if (!input.scheduledFor) {
        const executionResult = await executeBroadcast(broadcastId);
        return {
          success: true,
          data: {
            broadcastId,
            totalRecipients: executionResult.totalRecipients,
            sentCount: executionResult.sentCount,
            failedCount: executionResult.failedCount,
            errors: executionResult.errors,
          },
        };
      } else {
        return {
          success: true,
          data: {
            broadcastId,
            message: 'تم جدولة البث بنجاح',
            scheduledFor: input.scheduledFor,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),

  /**
   * قائمة البثات
   */
  listBroadcasts: protectedProcedure.input(ListBroadcastsSchema).query(async ({ input }) => {
    try {
      return {
        success: true,
        data: {
          broadcasts: [],
          total: 0,
          page: input.page,
          limit: input.limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),

  /**
   * تفاصيل البث
   */
  getBroadcast: protectedProcedure
    .input(z.object({ id: z.number().min(1) }))
    .query(async ({ input }) => {
      try {
        const stats = await getBroadcastStats(input.id);
        return {
          success: true,
          data: stats,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * نتائج المستقبلين
   */
  getBroadcastRecipients: protectedProcedure
    .input(GetBroadcastRecipientsSchema)
    .query(async ({ input }) => {
      try {
        const result = await getBroadcastRecipients(
          input.broadcastId,
          input.page,
          input.limit,
          input.status
        );
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * تصدير الجهات
   */
  exportContacts: protectedProcedure
    .input(ExportContactsSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const filterCriteria = toBroadcastFilterCriteria(input.filterCriteria);
        const recipients = await buildExportList(filterCriteria);

        if (recipients.length === 0) {
          return {
            success: false,
            error: 'لا توجد جهات اتصال لتصديرها',
          };
        }

        let fileContent: string;
        if (input.exportType === 'vcf') {
          fileContent = await exportToVCF(recipients);
        } else {
          fileContent = await exportToCSV(recipients);
        }

        const fileName = generateFileName(input.exportType);
        const mimeType = getFileMimeType(input.exportType);
        let url: string;
        let key = `exports/${ctx.user.id}/${fileName}`;

        try {
          const uploadResult = await storagePut(key, fileContent, mimeType);
          url = uploadResult.url;
          key = uploadResult.key;
        } catch {
          // Fallback to data URI when cloud storage proxy is not configured
          const base64Content = Buffer.from(fileContent, 'utf-8').toString('base64');
          url = `data:${mimeType};base64,${base64Content}`;
        }

        await logExport(
          input.exportType,
          filterCriteria,
          recipients.length,
          recipients.length,
          0,
          url,
          key,
          ctx.user.id,
          'completed'
        );

        return {
          success: true,
          data: {
            url,
            fileName,
            totalContacts: recipients.length,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * قائمة الجهات
   */
  listContacts: protectedProcedure.input(ListContactsSchema).query(async ({ input }) => {
    try {
      const recipients = await buildExportList(
        toBroadcastFilterCriteria({
          recipientSources: input.recipientSources,
          statuses: input.statuses,
        })
      );

      let filtered = recipients;
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filtered = recipients.filter(
          (r) =>
            r.fullName?.toLowerCase().includes(searchLower) ||
            r.phoneNumber.includes(searchLower) ||
            r.email?.toLowerCase().includes(searchLower)
        );
      }

      const offset = (input.page - 1) * input.limit;
      const paginated = filtered.slice(offset, offset + input.limit);

      return {
        success: true,
        data: {
          contacts: paginated,
          total: filtered.length,
          page: input.page,
          limit: input.limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),

  /**
   * مزامنة Google Contacts
   */
  syncGoogleContacts: protectedProcedure.input(GoogleSyncSchema).mutation(async ({ input }) => {
    try {
      return {
        success: true,
        data: {
          message: 'تم بدء المزامنة',
          syncType: input.syncType,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),

  /**
   * سجل المزامنة
   */
  getSyncLogs: protectedProcedure.input(GetSyncLogsSchema).query(async ({ input }) => {
    try {
      return {
        success: true,
        data: {
          logs: [],
          total: 0,
          page: input.page,
          limit: input.limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),

  /**
   * سجل التصديرات
   */
  getExportLogs: protectedProcedure.input(GetExportLogsSchema).query(async ({ input }) => {
    try {
      const result = await getExportLogs(input.page, input.limit, input.exportType, input.status);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),
});
