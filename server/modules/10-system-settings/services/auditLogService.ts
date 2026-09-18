/**
 * Audit Log Service - خدمة تسجيل عمليات التدقيق
 */

import { getDb } from '../../../database/db';
import { auditLogs } from '../../../../drizzle/schema';
import { createLogger } from '../../../_core/logger';

const logger = createLogger('auditLogs');

export type CreateAuditLogParams = {
  entityType: string;
  entityId: number;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  userId?: number | null;
  userName?: string | null;
  notes?: string | null;
};

/**
 * Helper function to create an audit log entry
 * دالة مساعدة لإنشاء سجل تغيير
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  const db = await getDb();
  if (!db) {
    return;
  }

  try {
    await db.insert(auditLogs).values({
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      oldValue: params.oldValue || null,
      newValue: params.newValue || null,
      userId: params.userId || null,
      userName: params.userName || null,
      notes: params.notes || null,
    });
  } catch (error) {
    logger.error('Failed to create audit log', { error, params });
  }
}
