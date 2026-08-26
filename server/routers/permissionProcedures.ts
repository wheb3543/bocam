import { TRPCError } from '@trpc/server';
import type { RolePermission } from '../../shared/rolePermissions';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { protectedProcedure } from '../_core/trpc';
import { hasRolePermission } from '../services/rolePermissionService';

/** ينشئ إجراء tRPC محمياً بصلاحية قابلة للإدارة من تبويب الأدوار. */
export async function assertRolePermission(
  user: { id: number; role: string },
  permission: RolePermission,
  label = 'تنفيذ هذا الإجراء'
) {
  const db = await ensureDatabaseAvailable();
  if (!(await hasRolePermission(db, user.id, user.role, permission))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: `لا تملك صلاحية ${label}` });
  }
}

export function permissionProcedure(permission: RolePermission, label = 'تنفيذ هذا الإجراء') {
  return protectedProcedure.use(async ({ ctx, next }) => {
    await assertRolePermission(ctx.user, permission, label);
    return next({ ctx });
  });
}
