import { z } from 'zod';
import { ROLE_BASE_KEYS, ROLE_PERMISSIONS } from '../../shared/rolePermissions';
import { protectedProcedure, router } from '../_core/trpc';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { auditLogs, roleDefinitions } from '../../drizzle/schema';
import { desc, eq, sql } from 'drizzle-orm';
import {
  hasRolePermission,
  listRoleDefinitions,
  saveRoleDefinition,
} from '../services/rolePermissionService';
import { assertRolePermission, permissionProcedure } from './permissionProcedures';

const rolesViewProcedure = permissionProcedure('roles.view', 'عرض الأدوار والصلاحيات');

const roleAuditProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const db = await ensureDatabaseAvailable();
  if (!(await hasRolePermission(db, ctx.user.id, ctx.user.role, 'audit.view'))) {
    throw new Error('لا تملك صلاحية عرض سجل التدقيق');
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
  sourceRoleId: z.number().int().positive().optional(),
});

export const roleManagementRouter = router({
  list: rolesViewProcedure.query(async () => listRoleDefinitions(await ensureDatabaseAvailable())),
  listAssignable: protectedProcedure.query(async ({ ctx }) => {
    await assertRolePermission(ctx.user, 'users.assign_role', 'إسناد الأدوار للمستخدمين');
    const db = await ensureDatabaseAvailable();
    return listRoleDefinitions(db, false);
  }),
  save: protectedProcedure.input(roleInput).mutation(async ({ input, ctx }) => {
    await assertRolePermission(
      ctx.user,
      input.id ? 'roles.update' : 'roles.create',
      input.id ? 'تعديل الأدوار والصلاحيات' : 'إنشاء أدوار جديدة'
    );
    const id = await saveRoleDefinition(await ensureDatabaseAvailable(), input, {
      id: ctx.user.id,
      name: ctx.user.name,
    });
    return { id };
  }),
  audit: roleAuditProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(25),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const offset = (input.page - 1) * input.limit;
      const whereClause = eq(auditLogs.entityType, 'role_definition');
      const [logs, countResult] = await Promise.all([
        db
          .select({
            id: auditLogs.id,
            entityId: auditLogs.entityId,
            action: auditLogs.action,
            oldValue: auditLogs.oldValue,
            newValue: auditLogs.newValue,
            userId: auditLogs.userId,
            userName: auditLogs.userName,
            notes: auditLogs.notes,
            createdAt: auditLogs.createdAt,
            roleName: roleDefinitions.name,
          })
          .from(auditLogs)
          .leftJoin(roleDefinitions, eq(auditLogs.entityId, roleDefinitions.id))
          .where(whereClause)
          .orderBy(desc(auditLogs.createdAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(auditLogs)
          .where(whereClause),
      ]);
      return { logs, total: Number(countResult[0]?.count || 0) };
    }),
});
