/**
 * Audit Log Dialog Component
 * مكون حوار سجل التغييرات
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Clock, User, Edit, Trash, Plus } from 'lucide-react';
import { useAuditLog } from '../../hooks/useAuditLog';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type EntityType = 'text' | 'image' | 'color' | 'seo' | 'operation';
type AuditAction = 'create' | 'update' | 'delete' | 'operation_succeeded' | 'operation_failed';

interface AuditLogEntry {
  id: number;
  entityType: EntityType;
  entityId: number;
  action: AuditAction;
  userId: number;
  userName: string | null;
  timestamp: Date;
  createdAt: Date;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  reason?: string;
}

interface AuditLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEntityType?: EntityType;
}

/**
 * AuditLogDialog - مكون حوار سجل التغييرات
 */
export function AuditLogDialog({ open, onOpenChange, initialEntityType }: AuditLogDialogProps) {
  const { getAuditLog, exportAuditLog } = useAuditLog();
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    if (open && initialEntityType) {
      setEntityTypeFilter(initialEntityType);
    }
  }, [initialEntityType, open]);

  const { data: auditLogs, isLoading } = getAuditLog({
    entityType: entityTypeFilter === 'all' ? undefined : (entityTypeFilter as EntityType),
    action: actionFilter === 'all' ? undefined : (actionFilter as AuditAction),
  });

  const { data: exportData, isLoading: isExporting } = exportAuditLog({
    entityType: entityTypeFilter === 'all' ? undefined : (entityTypeFilter as EntityType),
    action: actionFilter === 'all' ? undefined : (actionFilter as AuditAction),
  });
  const normalizedAuditLogs = (auditLogs as unknown as AuditLogEntry[]) ?? [];

  const handleExport = () => {
    if (!exportData) {
      return;
    }

    // إنشاء ملف CSV وتحميله
    const csv = typeof exportData === 'string' ? exportData : JSON.stringify(exportData, null, 2);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('تم تصدير السجل بنجاح');
  };

  const getEntityTypeLabel = (type: string) => {
    const labels = {
      text: 'نص',
      image: 'صورة',
      color: 'لون',
      seo: 'إعدادات SEO',
      operation: 'عملية نظامية',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getActionLabel = (action: string) => {
    const labels = {
      create: 'إنشاء',
      update: 'تحديث',
      delete: 'حذف',
      operation_succeeded: 'اكتملت العملية',
      operation_failed: 'فشلت العملية',
    };
    return labels[action as keyof typeof labels] || action;
  };

  const getActionIcon = (action: string) => {
    if (action === 'create') {
      return <Plus className="h-4 w-4 text-green-500" />;
    }
    if (action === 'update') {
      return <Edit className="h-4 w-4 text-blue-500" />;
    }
    if (action === 'delete') {
      return <Trash className="h-4 w-4 text-red-500" />;
    }
    if (action === 'operation_succeeded') {
      return <Plus className="h-4 w-4 text-green-500" />;
    }
    if (action === 'operation_failed') {
      return <Trash className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            سجل التغييرات
          </DialogTitle>
          <DialogDescription>عرض جميع التغييرات على المحتوى</DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="نوع المحتوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="text">نص</SelectItem>
              <SelectItem value="image">صورة</SelectItem>
              <SelectItem value="color">لون</SelectItem>
              <SelectItem value="seo">إعدادات SEO</SelectItem>
              <SelectItem value="operation">عمليات النظام</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="الإجراء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="create">إنشاء</SelectItem>
              <SelectItem value="update">تحديث</SelectItem>
              <SelectItem value="delete">حذف</SelectItem>
              <SelectItem value="operation_succeeded">اكتملت العملية</SelectItem>
              <SelectItem value="operation_failed">فشلت العملية</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            تصدير
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : !auditLogs || auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">لا توجد تغييرات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {normalizedAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionIcon(log.action)}
                        <span className="font-semibold">{getActionLabel(log.action)}</span>
                        <span className="text-muted-foreground">-</span>
                        <span>{getEntityTypeLabel(log.entityType)}</span>
                        <span className="text-xs text-muted-foreground">#{log.entityId}</span>
                      </div>
                      {log.reason && (
                        <p className="text-sm text-muted-foreground mb-2">السبب: {log.reason}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.createdAt).toLocaleString('ar-SA')}
                        </div>
                        {log.userId && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            المستخدم: {log.userId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
