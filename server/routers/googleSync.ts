/**
 * Google Sync Router
 * مسارات مزامنة Google Contacts
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { GoogleContactsSyncService } from '../services/googleContactsSyncService';

export const googleSyncRouter = router({
  /**
   * بدء مزامنة الجهات مع Google
   */
  syncContacts: protectedProcedure
    .input(
      z.object({
        accessToken: z.string().min(1),
        filterCriteria: z
          .object({
            recipientSources: z
              .enum(['appointments', 'camp_registrations', 'offer_leads', 'leads'])
              .array()
              .optional(),
            statuses: z.string().array().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await GoogleContactsSyncService.syncContacts(
          input.accessToken,
          input.filterCriteria,
          ctx.user.id
        );

        return {
          success: result.success,
          data: {
            syncedCount: result.syncedCount,
            failedCount: result.failedCount,
            duplicateCount: result.duplicateCount,
            syncLogId: result.syncLogId,
          },
          message: result.success
            ? `تمت مزامنة ${result.syncedCount} جهة اتصال بنجاح`
            : result.failedCount > 0
              ? `اكتملت المزامنة جزئياً: نجح ${result.syncedCount} وفشل ${result.failedCount} جهة اتصال`
              : `فشلت المزامنة: ${result.error ?? 'تعذر الاتصال بخدمة Google'}`,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * جلب سجلات المزامنة
   */
  getSyncLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const logs = await GoogleContactsSyncService.getSyncLogs(input.limit);
        return {
          success: true,
          data: logs.map((log: any) => ({
            id: log.id,
            syncType: log.syncType,
            totalContacts: log.totalContacts,
            syncedContacts: log.syncedContacts,
            failedContacts: log.failedContacts,
            status: log.status,
            createdAt: log.createdAt,
            completedAt: log.completedAt,
            errorInfo: log.errorInfo,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
          data: [],
        };
      }
    }),

  /**
   * جلب حالة المزامنة
   */
  getSyncStatus: protectedProcedure
    .input(z.object({ syncLogId: z.number().min(1) }))
    .query(async ({ input }) => {
      try {
        const status = await GoogleContactsSyncService.getSyncStatus(input.syncLogId);
        return {
          success: status !== null,
          data: status,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * حذف سجل مزامنة
   */
  deleteSyncLog: protectedProcedure
    .input(z.object({ syncLogId: z.number().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const result = await GoogleContactsSyncService.deleteSyncLog(input.syncLogId);
        return {
          success: result,
          message: result ? 'تم حذف السجل بنجاح' : 'فشل حذف السجل',
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),
});
