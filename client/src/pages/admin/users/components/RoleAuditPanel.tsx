import { useMemo, useState } from 'react';
import { ClipboardList, Copy, History, ShieldCheck, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PermissionHint } from '@/components/PermissionHint';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { trpc } from '@/lib/api/trpc';

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

export default function RoleAuditPanel() {
  const { can, isLoading: permissionsLoading } = useRolePermissions();
  const canViewAudit = can('audit.view');
  const [page, setPage] = useState(1);
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
              يوثق إنشاء ونسخ الأدوار وتحديث صلاحياتها دون عرض محتوى الصلاحيات التفصيلي.
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
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
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
                <time
                  className="shrink-0 text-xs text-muted-foreground"
                  dateTime={new Date(log.createdAt).toISOString()}
                >
                  {new Intl.DateTimeFormat('ar', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(log.createdAt))}
                </time>
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
    </Card>
  );
}
