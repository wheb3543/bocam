/**
 * Audit Log Hook
 * Hook لإدارة سجل التغييرات
 */

import { trpc } from '@/lib/api/trpc';

export function useAuditLog() {
  const getAuditLog = trpc.content.auditLog.list.useQuery;
  const getAuditLogCount = trpc.content.auditLog.count.useQuery;
  const exportAuditLog = trpc.content.auditLog.export.useQuery;

  return {
    getAuditLog,
    getAuditLogCount,
    exportAuditLog,
  };
}
