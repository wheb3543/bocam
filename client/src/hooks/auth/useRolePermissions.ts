import { useCallback, useMemo } from 'react';
import type { RolePermission } from '@shared/rolePermissions';
import { trpc } from '@/lib/api/trpc';

/** الصلاحيات الفعالة محسوبة من الخادم وتستخدم لتحسين تجربة الواجهة فقط. */
export function useRolePermissions() {
  const query = trpc.auth?.permissions?.useQuery?.() ?? undefined;
  const permissions = useMemo(() => query?.data ?? [], [query?.data]);
  const can = useCallback(
    (permission: RolePermission) => permissions.includes(permission),
    [permissions]
  );

  return { ...(query ?? {}), permissions, can };
}
