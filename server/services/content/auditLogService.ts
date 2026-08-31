/**
 * Audit Log Service
 * خدمة سجل التغييرات
 */

import { contentAuditLog } from '../../../drizzle/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { createLogger } from '../../_core/logger';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';

type DbClient = Awaited<ReturnType<typeof ensureDatabaseAvailable>>;

const logger = createLogger('auditLogService');

interface AuditLogFilters {
  entityType?:
    'text' | 'image' | 'color' | 'seo' | 'page' | 'section' | 'sectionButton' | 'operation';
  entityId?: number;
  action?: 'create' | 'update' | 'delete' | 'operation_succeeded' | 'operation_failed';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * AuditLogService - خدمة سجل التغييرات
 */
export class AuditLogService {
  /**
   * تسجيل تغيير في المحتوى
   */

  async logChange(
    db: DbClient,
    params: {
      entityType:
        'text' | 'image' | 'color' | 'seo' | 'page' | 'section' | 'sectionButton' | 'operation';
      entityId: number;
      action: 'create' | 'update' | 'delete' | 'operation_succeeded' | 'operation_failed';
      userId?: number;
      oldValue?: string;
      newValue?: string;
      reason?: string;
    }
  ) {
    try {
      await db.insert(contentAuditLog).values({
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        oldValue: params.oldValue ?? null,
        newValue: params.newValue ?? null,
        userId: params.userId,
        reason: params.reason,
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error('Error logging change:', error);
      // لا نرمي خطأ هنا لأن السجل ليس أساسياً للوظائف
    }
  }

  /**
   * الحصول على سجل التغييرات مع الفلاتر
   */
  async getAuditLog(db: DbClient, filters?: AuditLogFilters) {
    try {
      const conditions = [];

      if (filters?.entityType) {
        conditions.push(eq(contentAuditLog.entityType, filters.entityType));
      }

      if (filters?.entityId) {
        conditions.push(eq(contentAuditLog.entityId, filters.entityId));
      }

      if (filters?.action) {
        conditions.push(eq(contentAuditLog.action, filters.action));
      }

      if (filters?.startDate) {
        conditions.push(gte(contentAuditLog.createdAt, filters.startDate));
      }

      if (filters?.endDate) {
        conditions.push(lte(contentAuditLog.createdAt, filters.endDate));
      }

      const logs = await db
        .select()
        .from(contentAuditLog)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(contentAuditLog.createdAt))
        .limit(filters?.limit || 50)
        .offset(filters?.offset || 0);

      return logs;
    } catch (error) {
      logger.error('Error fetching audit log:', error);
      throw new Error('فشل في جلب سجل التغييرات', { cause: error });
    }
  }

  /**
   * الحصول على عدد السجلات
   */
  async getAuditLogCount(db: DbClient, filters?: AuditLogFilters) {
    try {
      const conditions = [];

      if (filters?.entityType) {
        conditions.push(eq(contentAuditLog.entityType, filters.entityType));
      }

      if (filters?.entityId) {
        conditions.push(eq(contentAuditLog.entityId, filters.entityId));
      }

      if (filters?.action) {
        conditions.push(eq(contentAuditLog.action, filters.action));
      }

      const result = await db
        .select({ count: contentAuditLog.id })
        .from(contentAuditLog)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return result.length;
    } catch (error) {
      logger.error('Error fetching audit log count:', error);
      throw new Error('فشل في جلب عدد السجلات', { cause: error });
    }
  }

  /**
   * تصدير السجل
   */
  async exportAuditLog(db: DbClient, filters?: AuditLogFilters) {
    try {
      const logs = await this.getAuditLog(db, filters);

      return logs.map((log: Record<string, unknown>) => ({
        id: log.id,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        oldValue: typeof log.oldValue === 'string' ? JSON.parse(log.oldValue) : null,
        newValue: typeof log.newValue === 'string' ? JSON.parse(log.newValue) : null,
        userId: log.userId,
        reason: log.reason,
        createdAt: log.createdAt,
      }));
    } catch (error) {
      logger.error('Error exporting audit log:', error);
      throw new Error('فشل في تصدير سجل التغييرات', { cause: error });
    }
  }
}

export const auditLogService = new AuditLogService();
