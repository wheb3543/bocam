/**
 * Audit Log Router
 * Router لسجل التغييرات
 */

import { z } from 'zod';
import { adminProcedure, protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { auditLogService } from '../../services/content/auditLogService';
import { createLogger } from '../../_core/logger';
import { contentAuditLog } from '../../../drizzle/schema';
import { desc, like } from 'drizzle-orm';

const logger = createLogger('auditLogRouter');

function parseRecord(value: string | null): Record<string, unknown> {
  if (!value) {
    return {};
  }
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export const auditLogRouter = router({
  /**
   * أحدث عناصر المحتوى التي أوقفتها بوابة الجودة وقت تنفيذ النشر المجدول.
   * تبقى كمسودات ويعرض هذا الاستعلام سبب المنع للمسؤول دون تحليل سجل التدقيق في المتصفح.
   */
  getDeferredPublicationBlocks: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const records = await db
        .select()
        .from(contentAuditLog)
        .where(like(contentAuditLog.reason, 'تم منع النشر المؤجل بواسطة مهمة CMS%'))
        .orderBy(desc(contentAuditLog.createdAt))
        .limit(input.limit);

      return records
        .filter(
          (record) =>
            record.entityId !== null &&
            ['text', 'image', 'seo', 'page', 'section', 'sectionButton'].includes(
              record.entityType ?? ''
            )
        )
        .map((record) => {
          const previous = parseRecord(record.oldValue);
          const current = parseRecord(record.newValue);
          const issues = Array.isArray(current.issues)
            ? current.issues
                .filter(
                  (issue): issue is Record<string, unknown> =>
                    Boolean(issue) && typeof issue === 'object' && !Array.isArray(issue)
                )
                .map((issue) => ({
                  code: typeof issue.code === 'string' ? issue.code : 'QUALITY_BLOCK',
                  message: typeof issue.message === 'string' ? issue.message : 'تعذر نشر المحتوى.',
                  field: typeof issue.field === 'string' ? issue.field : null,
                  severity: issue.severity === 'warning' ? 'warning' : 'error',
                }))
            : [];

          return {
            id: record.id,
            entityType: record.entityType as
              'text' | 'image' | 'seo' | 'page' | 'section' | 'sectionButton',
            entityId: record.entityId as number,
            scheduledAt: typeof previous.publishedAt === 'string' ? previous.publishedAt : null,
            blockedAt: record.createdAt,
            issues,
            reason: record.reason,
          };
        });
    }),

  /**
   * الحصول على سجل التغييرات
   */
  list: protectedProcedure
    .input(
      z.object({
        entityType: z
          .enum(['text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton', 'operation'])
          .optional(),
        entityId: z.number().optional(),
        action: z
          .enum(['create', 'update', 'delete', 'operation_succeeded', 'operation_failed'])
          .optional(),
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
          .enum(['text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton', 'operation'])
          .optional(),
        entityId: z.number().optional(),
        action: z
          .enum(['create', 'update', 'delete', 'operation_succeeded', 'operation_failed'])
          .optional(),
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
        entityType: z
          .enum(['text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton', 'operation'])
          .optional(),
        entityId: z.number().optional(),
        action: z
          .enum(['create', 'update', 'delete', 'operation_succeeded', 'operation_failed'])
          .optional(),
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
