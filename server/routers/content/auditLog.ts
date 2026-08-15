/**
 * Audit Log Router
 * Router لسجل التغييرات
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { auditLogService } from '../../services/content/auditLogService';
import { createLogger } from '../../_core/logger';

const logger = createLogger('auditLogRouter');

export const auditLogRouter = router({
  /**
   * الحصول على سجل التغييرات
   */
  list: protectedProcedure
    .input(
      z.object({
        entityType: z
          .enum(['text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton'])
          .optional(),
        entityId: z.number().optional(),
        action: z.enum(['create', 'update', 'delete']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await ensureDatabaseAvailable();
        const logs = await auditLogService.getAuditLog(db, input);
        logger.info('Fetched audit log successfully', { count: logs.length });
        return logs;
      } catch (error) {
        logger.error('Error fetching audit log:', error);
        throw new Error('فشل في جلب سجل التغييرات', { cause: error });
      }
    }),

  /**
   * الحصول على عدد السجلات
   */
  count: protectedProcedure
    .input(
      z.object({
        entityType: z
          .enum(['text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton'])
          .optional(),
        entityId: z.number().optional(),
        action: z.enum(['create', 'update', 'delete']).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await ensureDatabaseAvailable();
        const count = await auditLogService.getAuditLogCount(db, input);
        logger.info('Fetched audit log count successfully', { count });
        return count;
      } catch (error) {
        logger.error('Error fetching audit log count:', error);
        throw new Error('فشل في جلب عدد السجلات', { cause: error });
      }
    }),

  /**
   * تصدير السجل
   */
  export: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['text', 'image', 'color', 'seo']).optional(),
        entityId: z.number().optional(),
        action: z.enum(['create', 'update', 'delete']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await ensureDatabaseAvailable();
        const logs = await auditLogService.exportAuditLog(db, input);
        logger.info('Exported audit log successfully', { count: logs.length });
        return logs;
      } catch (error) {
        logger.error('Error exporting audit log:', error);
        throw new Error('فشل في تصدير سجل التغييرات', { cause: error });
      }
    }),
});
