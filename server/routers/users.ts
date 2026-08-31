import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { roleDefinitions, userRoleAssignments, users } from '../../drizzle/schema';
import { router } from '../_core/trpc';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { assignRoleDefinition, hasRolePermission } from '../services/rolePermissionService';
import { roleManagementRouter } from './roleManagement';
import { permissionProcedure } from './permissionProcedures';

const userInputSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل').optional(),
  name: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  role: z.enum(['user', 'admin', 'manager', 'staff', 'viewer', 'team_leader']).default('user'),
  roleDefinitionId: z.number().int().positive().nullable().optional(),
  isActive: z.enum(['yes', 'no']).default('yes'),
});

const usersViewProcedure = permissionProcedure('users.view', 'عرض المستخدمين');
const usersCreateProcedure = permissionProcedure('users.create', 'إضافة مستخدمين');
const usersUpdateProcedure = permissionProcedure('users.update', 'تعديل المستخدمين');
const usersDeactivateProcedure = permissionProcedure('users.deactivate', 'تغيير حالة المستخدمين');
const usersDeleteProcedure = permissionProcedure('users.delete', 'حذف المستخدمين');

export const usersRouter = router({
  roles: roleManagementRouter,
  // Get active users list (for task assignment)
  getActiveUsers: usersViewProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const activeUsers = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
      })
      .from(users)
      .where(eq(users.isActive, 'yes'));

    return activeUsers;
  }),

  // Get all users with the role permission
  getAll: usersViewProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        loginMethod: users.loginMethod,
        roleDefinitionId: userRoleAssignments.roleDefinitionId,
        roleDefinitionName: roleDefinitions.name,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .leftJoin(userRoleAssignments, eq(userRoleAssignments.userId, users.id))
      .leftJoin(roleDefinitions, eq(roleDefinitions.id, userRoleAssignments.roleDefinitionId));

    return allUsers;
  }),

  // Get user by ID with the role permission
  getById: usersViewProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const user = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        loginMethod: users.loginMethod,
        roleDefinitionId: userRoleAssignments.roleDefinitionId,
        roleDefinitionName: roleDefinitions.name,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .leftJoin(userRoleAssignments, eq(userRoleAssignments.userId, users.id))
      .leftJoin(roleDefinitions, eq(roleDefinitions.id, userRoleAssignments.roleDefinitionId))
      .where(eq(users.id, input.id))
      .limit(1);

    if (user.length === 0) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'المستخدم غير موجود' });
    }

    return user[0];
  }),

  // Create new user with the role permission
  create: usersCreateProcedure.input(userInputSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();

    if (
      (input.role !== 'user' || input.roleDefinitionId !== undefined) &&
      !(await hasRolePermission(db, ctx.user.id, ctx.user.role, 'users.assign_role'))
    ) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'لا تملك صلاحية تعيين أدوار المستخدمين' });
    }

    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, input.username))
      .limit(1);
    if (existingUser.length > 0) {
      throw new TRPCError({ code: 'CONFLICT', message: 'اسم المستخدم موجود بالفعل' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password || '123456', 10);

    const [created] = await db
      .insert(users)
      .values({
        username: input.username,
        password: hashedPassword,
        name: input.name,
        email: input.email,
        role: input.role,
        isActive: input.isActive,
        loginMethod: 'manual',
      })
      .$returningId();

    if (input.roleDefinitionId !== undefined) {
      const assignedRole = await assignRoleDefinition(db, {
        userId: Number(created.id),
        roleDefinitionId: input.roleDefinitionId,
        actorId: ctx.user.id,
      });
      if (assignedRole) {
        await db
          .update(users)
          .set({ role: assignedRole.baseRole })
          .where(eq(users.id, Number(created.id)));
      }
    }

    return { success: true };
  }),

  // Update user with the role permission
  update: usersUpdateProcedure
    .input(
      z.object({
        id: z.number(),
        ...userInputSchema.partial().shape,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      const { id, password, roleDefinitionId, ...data } = input;

      if (
        (data.role !== undefined || roleDefinitionId !== undefined) &&
        !(await hasRolePermission(db, ctx.user.id, ctx.user.role, 'users.assign_role'))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'لا تملك صلاحية تعيين أدوار المستخدمين',
        });
      }

      // Prevent user from changing their own role or status
      if (id === ctx.user.id && (data.role || data.isActive || roleDefinitionId !== undefined)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'لا يمكنك تغيير دورك أو حالتك الخاصة',
        });
      }

      const updateData: Record<string, unknown> = { ...data };

      // Hash password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      if (roleDefinitionId !== undefined) {
        const assignedRole = await assignRoleDefinition(db, {
          userId: id,
          roleDefinitionId,
          actorId: ctx.user.id,
        });
        if (assignedRole) {
          updateData.role = assignedRole.baseRole;
        }
      }

      await db.update(users).set(updateData).where(eq(users.id, id));

      return { success: true };
    }),

  // Delete user with the role permission
  delete: usersDeleteProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      // Prevent user from deleting themselves
      if (input.id === ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'لا يمكنك حذف حسابك الخاص',
        });
      }

      await db.delete(users).where(eq(users.id, input.id));

      return { success: true };
    }),

  // Toggle user active status with the role permission
  toggleActive: usersDeactivateProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();

      // Prevent user from deactivating themselves
      if (input.id === ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'لا يمكنك تعطيل حسابك الخاص',
        });
      }

      const user = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      if (user.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'المستخدم غير موجود' });
      }

      const newStatus = user[0].isActive === 'yes' ? 'no' : 'yes';

      await db.update(users).set({ isActive: newStatus }).where(eq(users.id, input.id));

      return { success: true, newStatus };
    }),
});
