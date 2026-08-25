import { TRPCError } from '@trpc/server';
import type { RolePermission } from '../../shared/rolePermissions';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { protectedProcedure } from '../_core/trpc';
import { hasRolePermission } from '../services/rolePermissionService';

/** ينشئ إجراء tRPC محمياً بصلاحية قابلة للإدارة من تبويب الأدوار. */
export function permissionProcedure(permission: RolePermission, label = 'تنفيذ هذا الإجراء') {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const db = await ensureDatabaseAvailable();
    if (!(await hasRolePermission(db, ctx.user.id, ctx.user.role, permission))) {
      throw new TRPCError({ code: 'FORBIDDEN', message: `لا تملك صلاحية ${label}` });
    }
    return next({ ctx });
  });
}
