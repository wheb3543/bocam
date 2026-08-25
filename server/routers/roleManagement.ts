import { z } from 'zod';
import { ROLE_BASE_KEYS, ROLE_PERMISSIONS } from '../../shared/rolePermissions';
import { protectedProcedure, router } from '../_core/trpc';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import {
  hasRolePermission,
  listRoleDefinitions,
  saveRoleDefinition,
} from '../services/rolePermissionService';

const rolesManagementProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const db = await ensureDatabaseAvailable();
  if (!(await hasRolePermission(db, ctx.user.id, ctx.user.role, 'roles.manage'))) {
    throw new Error('لا تملك صلاحية إدارة الأدوار والصلاحيات');
  }
  return next();
});

const roleInput = z.object({
  id: z.number().int().positive().optional(),
  key: z.string().trim().min(2).max(80).optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  baseRole: z.enum(ROLE_BASE_KEYS),
  permissions: z.array(z.enum(ROLE_PERMISSIONS)).max(ROLE_PERMISSIONS.length),
  isActive: z.boolean().default(true),
});

export const roleManagementRouter = router({
  list: rolesManagementProcedure.query(async () =>
    listRoleDefinitions(await ensureDatabaseAvailable())
  ),
  listAssignable: protectedProcedure.query(async ({ ctx }) => {
    const db = await ensureDatabaseAvailable();
    if (
      !(await hasRolePermission(db, ctx.user.id, ctx.user.role, 'users.manage')) &&
      !(await hasRolePermission(db, ctx.user.id, ctx.user.role, 'roles.manage'))
    ) {
      throw new Error('لا تملك صلاحية إسناد الأدوار');
    }
    return listRoleDefinitions(db, false);
  }),
  save: rolesManagementProcedure.input(roleInput).mutation(async ({ input, ctx }) => {
    const id = await saveRoleDefinition(await ensureDatabaseAvailable(), input, {
      id: ctx.user.id,
      name: ctx.user.name,
    });
    return { id };
  }),
});
