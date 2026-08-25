import { and, eq } from 'drizzle-orm';
import { roleDefinitions, userRoleAssignments } from '../../drizzle/schema';
import {
  DEFAULT_ROLE_DEFINITIONS,
  ROLE_BASE_KEYS,
  ROLE_PERMISSIONS,
  type RoleBaseKey,
  type RolePermission,
} from '../../shared/rolePermissions';
import { createAuditLog } from '../routers/auditLogs';

const VALID_PERMISSIONS = new Set<string>(ROLE_PERMISSIONS);
const VALID_BASE_ROLES = new Set<string>(ROLE_BASE_KEYS);

/**
 * تحافظ هذه الخريطة على سلوك الأدوار القديمة التي مُنحت «إدارة كاملة» صراحةً.
 * لا تمنح صلاحيات جديدة للأدوار المقيدة، وإنما تترجم الامتياز الشامل الموجود
 * إلى الإجراء الدقيق الذي كان محمياً به سابقاً أثناء الانتقال التدريجي.
 */
const LEGACY_MANAGEMENT_PERMISSION_BY_GRANULAR: Partial<Record<RolePermission, RolePermission>> = {
  'users.create': 'users.manage',
  'users.update': 'users.manage',
  'users.deactivate': 'users.manage',
  'users.delete': 'users.manage',
  'users.assign_role': 'users.manage',
};

export function normalizeRolePermissions(value: unknown): RolePermission[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return Array.from(
    new Set(
      value.filter(
        (permission): permission is RolePermission =>
          typeof permission === 'string' && VALID_PERMISSIONS.has(permission)
      )
    )
  );
}

export function doesRolePermissionSetGrant(
  permissions: RolePermission[],
  requestedPermission: RolePermission
) {
  if (permissions.includes(requestedPermission)) {
    return true;
  }
  const legacyManagementPermission = LEGACY_MANAGEMENT_PERMISSION_BY_GRANULAR[requestedPermission];
  return legacyManagementPermission ? permissions.includes(legacyManagementPermission) : false;
}

export async function ensureSystemRoleDefinitions(db: any) {
  for (const [key, definition] of Object.entries(DEFAULT_ROLE_DEFINITIONS)) {
    const [existing] = await db
      .select({ id: roleDefinitions.id })
      .from(roleDefinitions)
      .where(eq(roleDefinitions.key, key))
      .limit(1);
    if (!existing) {
      await db.insert(roleDefinitions).values({
        key,
        name: definition.name,
        description: definition.description,
        baseRole: key as RoleBaseKey,
        permissions: JSON.stringify(definition.permissions),
        isSystem: true,
        isActive: true,
      });
    }
  }
}

export async function listRoleDefinitions(db: any, includeInactive = true) {
  await ensureSystemRoleDefinitions(db);
  const definitions = includeInactive
    ? await db.select().from(roleDefinitions)
    : await db.select().from(roleDefinitions).where(eq(roleDefinitions.isActive, true));
  return definitions
    .map((role: any) => ({
      ...role,
      permissions: normalizeRolePermissions(safeParse(role.permissions)),
    }))
    .sort(
      (a: any, b: any) =>
        Number(b.isSystem) - Number(a.isSystem) || a.name.localeCompare(b.name, 'ar')
    );
}

export async function saveRoleDefinition(
  db: any,
  input: {
    id?: number;
    key?: string;
    name: string;
    description?: string | null;
    baseRole: RoleBaseKey;
    permissions: RolePermission[];
    isActive: boolean;
  },
  actor: { id: number; name?: string | null }
) {
  if (!VALID_BASE_ROLES.has(input.baseRole)) {
    throw new Error('الدور الأساسي غير صالح');
  }
  const permissions = normalizeRolePermissions(input.permissions);
  if (input.baseRole === 'admin') {
    ['users.manage', 'roles.manage', 'settings.manage'].forEach((permission) => {
      if (!permissions.includes(permission as RolePermission)) {
        permissions.push(permission as RolePermission);
      }
    });
  }

  if (input.id) {
    const [existing] = await db
      .select()
      .from(roleDefinitions)
      .where(eq(roleDefinitions.id, input.id))
      .limit(1);
    if (!existing) {
      throw new Error('الدور غير موجود');
    }
    await db
      .update(roleDefinitions)
      .set({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        baseRole: input.baseRole,
        permissions: JSON.stringify(permissions),
        isActive: input.isActive,
      })
      .where(eq(roleDefinitions.id, input.id));
    void createAuditLog({
      entityType: 'role_definition',
      entityId: input.id,
      action: 'permissions_updated',
      oldValue: existing.permissions,
      newValue: JSON.stringify(permissions),
      userId: actor.id,
      userName: actor.name || null,
    });
    return input.id;
  }

  const key = (input.key || input.name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!key) {
    throw new Error('اسم فني صالح للدور مطلوب');
  }
  const [created] = await db
    .insert(roleDefinitions)
    .values({
      key,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      baseRole: input.baseRole,
      permissions: JSON.stringify(permissions),
      isSystem: false,
      isActive: input.isActive,
    })
    .$returningId();
  void createAuditLog({
    entityType: 'role_definition',
    entityId: Number(created.id),
    action: 'created',
    newValue: JSON.stringify(permissions),
    userId: actor.id,
    userName: actor.name || null,
  });
  return Number(created.id);
}

export async function assignRoleDefinition(
  db: any,
  input: { userId: number; roleDefinitionId: number | null; actorId: number }
) {
  if (input.roleDefinitionId === null) {
    await db.delete(userRoleAssignments).where(eq(userRoleAssignments.userId, input.userId));
    return null;
  }
  const [role] = await db
    .select()
    .from(roleDefinitions)
    .where(and(eq(roleDefinitions.id, input.roleDefinitionId), eq(roleDefinitions.isActive, true)))
    .limit(1);
  if (!role) {
    throw new Error('الدور المحدد غير متاح');
  }
  await db
    .insert(userRoleAssignments)
    .values({
      userId: input.userId,
      roleDefinitionId: input.roleDefinitionId,
      assignedBy: input.actorId,
    })
    .onDuplicateKeyUpdate({
      set: { roleDefinitionId: input.roleDefinitionId, assignedBy: input.actorId },
    });
  return role;
}

export async function hasRolePermission(
  db: any,
  userId: number,
  baseRole: string,
  permission: RolePermission
) {
  await ensureSystemRoleDefinitions(db);
  if (baseRole === 'admin') {
    return true;
  }
  const [assignment] = await db
    .select({ permissions: roleDefinitions.permissions })
    .from(userRoleAssignments)
    .innerJoin(roleDefinitions, eq(roleDefinitions.id, userRoleAssignments.roleDefinitionId))
    .where(and(eq(userRoleAssignments.userId, userId), eq(roleDefinitions.isActive, true)))
    .limit(1);
  if (assignment) {
    return doesRolePermissionSetGrant(
      normalizeRolePermissions(safeParse(assignment.permissions)),
      permission
    );
  }
  const [systemRole] = await db
    .select({ permissions: roleDefinitions.permissions })
    .from(roleDefinitions)
    .where(eq(roleDefinitions.key, baseRole))
    .limit(1);
  return systemRole
    ? doesRolePermissionSetGrant(
        normalizeRolePermissions(safeParse(systemRole.permissions)),
        permission
      )
    : false;
}

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}
