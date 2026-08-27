import { useMemo, useState } from 'react';
import { ClipboardList, Copy, Eye, History, ShieldCheck, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PermissionHint } from '@/components/PermissionHint';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { trpc } from '@/lib/api/trpc';
import type { RouterOutputs } from '@/types/trpc';

type RoleAuditLog = RouterOutputs['users']['roles']['audit']['logs'][number];

const actionDetails: Record<string, { label: string; icon: typeof Copy; className: string }> = {
  role_cloned: {
    label: 'نسخ دور',
    icon: Copy,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  permissions_updated: {
    label: 'تعديل الصلاحيات',
    icon: ShieldCheck,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  created: {
    label: 'إنشاء دور',
    icon: ClipboardList,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

function permissionCount(value: string | null) {
  if (!value) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.length : null;
  } catch {
    return null;
  }
}

function parsePermissions(value: string | null) {
  if (!value) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function permissionChangeSummary(oldValue: string | null, newValue: string | null) {
  const previous = parsePermissions(oldValue);
  const current = parsePermissions(newValue);
  const previousSet = new Set(previous);
  const currentSet = new Set(current);
  return {
    previousCount: previous.length,
    currentCount: current.length,
    added: current.filter((permission) => !previousSet.has(permission)).length,
    removed: previous.filter((permission) => !currentSet.has(permission)).length,
  };
}

function formatAuditDate(value: Date) {
  return new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );
}

export default function RoleAuditPanel() {
  const { can, isLoading: permissionsLoading } = useRolePermissions();
  const canViewAudit = can('audit.view');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<RoleAuditLog | null>(null);
  const { data, isLoading, isError } = trpc.users.roles.audit.useQuery(
    { page, limit: 25 },
    { enabled: canViewAudit }
  );
  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / 25)), [data?.total]);

  if (permissionsLoading || isLoading) {
    return (
      <div className="flex justify-center py-12 text-sm text-muted-foreground">
        جارٍ تحميل سجل تدقيق الأدوار…
      </div>
    );
  }

  if (!canViewAudit) {
    return (
      <div className="p-8 text-center">
        <PermissionHint message="تحتاج إلى صلاحية عرض سجل التدقيق للوصول إلى سجل الأدوار." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        تعذر تحميل سجل تدقيق الأدوار. حاول مرة أخرى لاحقاً.
      </div>
    );
  }

  const selectedDetail = selectedLog
    ? actionDetails[selectedLog.action] || {
        label: selectedLog.action,
        icon: ClipboardList,
        className: 'bg-muted text-muted-foreground border-border',
      }
    : null;
  const selectedSummary = selectedLog
    ? permissionChangeSummary(selectedLog.oldValue, selectedLog.newValue)
    : null;
  const selectedCount = selectedLog ? permissionCount(selectedLog.newValue) : null;
  const SelectedIcon = selectedDetail?.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>سجل تدقيق الأدوار</CardTitle>
            <CardDescription>
              اختر أي سجل لعرض تفاصيل العملية وملخص تغييرات الصلاحيات بأمان.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!data?.logs.length ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            لا توجد عمليات مسجلة على الأدوار حتى الآن.
          </div>
        ) : (
          data.logs.map((log) => {
            const detail = actionDetails[log.action] || {
              label: log.action,
              icon: ClipboardList,
              className: 'bg-muted text-muted-foreground border-border',
            };
            const Icon = detail.icon;
            const count = permissionCount(log.newValue);
            return (
              <div
                key={log.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedLog(log)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedLog(log);
                  }
                }}
                className="flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-4 text-right transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={detail.className}>
                        {detail.label}
                      </Badge>
                      <span className="font-medium">{log.roleName || `دور #${log.entityId}`}</span>
                      {count !== null && log.action !== 'role_cloned' ? (
                        <span className="text-xs text-muted-foreground">{count} صلاحية</span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3.5 w-3.5" />
                        {log.userName || 'مستخدم النظام'}
                      </span>
                      {log.notes ? <span>{log.notes}</span> : null}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 text-xs text-muted-foreground sm:justify-end">
                  <time dateTime={new Date(log.createdAt).toISOString()}>
                    {formatAuditDate(log.createdAt)}
                  </time>
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    <Eye className="h-3.5 w-3.5" />
                    التفاصيل
                  </span>
                </div>
              </div>
            );
          })
        )}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">
              الصفحة {page} من {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                التالي
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        {selectedLog && selectedDetail && selectedSummary && SelectedIcon ? (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                تفاصيل سجل تدقيق الدور
              </DialogTitle>
              <DialogDescription>
                ملخص موثق للعملية دون عرض بيانات حساسة أو محتوى الصلاحيات الخام.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">العملية</p>
                <Badge variant="outline" className={`mt-1 ${selectedDetail.className}`}>
                  <SelectedIcon className="ml-1 h-3.5 w-3.5" />
                  {selectedDetail.label}
                </Badge>
              </div>
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">الدور المتأثر</p>
                <p className="mt-1 font-medium">
                  {selectedLog.roleName || `دور #${selectedLog.entityId}`}
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">نفذ العملية</p>
                <p className="mt-1 font-medium">{selectedLog.userName || 'مستخدم النظام'}</p>
              </div>
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">وقت التنفيذ</p>
                <p className="mt-1 font-medium">{formatAuditDate(selectedLog.createdAt)}</p>
              </div>
            </div>
            {selectedLog.action === 'permissions_updated' ? (
              <div className="rounded-xl border p-4">
                <p className="font-medium">ملخص تغيير الصلاحيات</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <span>
                    قبل: <strong>{selectedSummary.previousCount}</strong>
                  </span>
                  <span>
                    بعد: <strong>{selectedSummary.currentCount}</strong>
                  </span>
                  <span className="text-emerald-700">
                    أضيف: <strong>{selectedSummary.added}</strong>
                  </span>
                  <span className="text-destructive">
                    أزيل: <strong>{selectedSummary.removed}</strong>
                  </span>
                </div>
              </div>
            ) : selectedCount !== null ? (
              <div className="rounded-xl border p-4 text-sm">
                <p className="font-medium">ملخص الصلاحيات</p>
                <p className="mt-1 text-muted-foreground">
                  يحمل الدور بعد العملية {selectedCount} صلاحية.
                </p>
              </div>
            ) : null}
            {selectedLog.notes ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="font-medium">سياق العملية</p>
                <p className="mt-1 text-muted-foreground">{selectedLog.notes}</p>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </Card>
  );
}
