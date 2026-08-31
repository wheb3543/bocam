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
  'content.create': 'content.manage',
  'content.update': 'content.manage',
  'content.review': 'content.manage',
  'appointments.view': 'appointments.manage',
  'appointments.update': 'appointments.manage',
  'appointments.cancel': 'appointments.manage',
  'leads.view': 'leads.manage',
  'leads.update': 'leads.manage',
  'communications.view': 'communications.manage',
  'communications.reply': 'communications.manage',
  'communications.assign': 'communications.manage',
  'communications.broadcast': 'communications.manage',
  'communications.templates.manage': 'communications.manage',
  'communications.archive': 'communications.manage',
  'communications.delete': 'communications.manage',
  'tasks.view': 'tasks.manage',
  'tasks.create': 'tasks.manage',
  'tasks.update': 'tasks.manage',
  'tasks.assign': 'tasks.manage',
  'tasks.complete': 'tasks.manage',
  'tasks.delete': 'tasks.manage',
  'integrations.view': 'integrations.manage',
  'integrations.connect': 'integrations.manage',
  'integrations.disconnect': 'integrations.manage',
  'integrations.credentials.manage': 'integrations.manage',
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

type DbClient = Awaited<
  ReturnType<typeof import('../_core/databaseGuard').ensureDatabaseAvailable>
>;

export async function ensureSystemRoleDefinitions(db: DbClient) {
  if (!db || typeof db.select !== 'function') {
    return;
  }

  for (const [key, definition] of Object.entries(DEFAULT_ROLE_DEFINITIONS)) {
    const selectQuery =
      typeof db.select === 'function' ? db.select({ id: roleDefinitions.id }) : null;
    const fromQuery =
      selectQuery && typeof selectQuery.from === 'function'
        ? selectQuery.from(roleDefinitions)
        : null;
    const whereQuery =
      fromQuery && typeof fromQuery.where === 'function'
        ? fromQuery.where(eq(roleDefinitions.key, key))
        : null;

    if (!whereQuery) {
      return;
    }

    const rows =
      typeof whereQuery.limit === 'function' ? await whereQuery.limit(1) : await whereQuery;
    const existing = Array.isArray(rows) ? rows[0] : (rows?.[0] ?? null);

    if (!existing) {
      if (typeof db.insert !== 'function') {
        return;
      }

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

type RoleDefinitionRow = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  baseRole: RoleBaseKey;
  permissions: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function listRoleDefinitions(db: DbClient, includeInactive = true) {
  await ensureSystemRoleDefinitions(db);
  const definitions = includeInactive
    ? await db.select().from(roleDefinitions)
    : await db.select().from(roleDefinitions).where(eq(roleDefinitions.isActive, true));
  return definitions
    .map(
      (role) =>
        ({
          ...role,
          permissions: normalizeRolePermissions(safeParse(role.permissions)),
        }) as RoleDefinitionRow & { permissions: RolePermission[] }
    )
    .sort(
      (
        a: RoleDefinitionRow & { permissions: RolePermission[] },
        b: RoleDefinitionRow & { permissions: RolePermission[] }
      ) => Number(b.isSystem) - Number(a.isSystem) || a.name.localeCompare(b.name, 'ar')
    );
}

export async function saveRoleDefinition(
  db: DbClient,
  input: {
    id?: number;
    key?: string;
    name: string;
    description?: string | null;
    baseRole: RoleBaseKey;
    permissions: RolePermission[];
    isActive: boolean;
    sourceRoleId?: number;
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

  let sourceRole: { id: number; name: string } | undefined;
  if (input.sourceRoleId) {
    const [source] = await db
      .select({ id: roleDefinitions.id, name: roleDefinitions.name })
      .from(roleDefinitions)
      .where(eq(roleDefinitions.id, input.sourceRoleId))
      .limit(1);
    if (!source) {
      throw new Error('الدور المصدر للنسخ غير موجود');
    }
    sourceRole = source;
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
    action: sourceRole ? 'role_cloned' : 'created',
    newValue: JSON.stringify(permissions),
    userId: actor.id,
    userName: actor.name || null,
    notes: sourceRole ? `نسخة من الدور: ${sourceRole.name} (#${sourceRole.id})` : null,
  });
  return Number(created.id);
}

export async function assignRoleDefinition(
  db: DbClient,
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
  db: DbClient,
  userId: number,
  baseRole: string,
  permission: RolePermission
) {
  await ensureSystemRoleDefinitions(db);
  if (baseRole === 'admin') {
    return true;
  }

  const assignmentSelect =
    typeof db.select === 'function'
      ? db.select({ permissions: roleDefinitions.permissions })
      : null;
  const assignmentFrom =
    assignmentSelect && typeof assignmentSelect.from === 'function'
      ? assignmentSelect.from(userRoleAssignments)
      : null;
  const assignmentJoined =
    assignmentFrom && typeof assignmentFrom.innerJoin === 'function'
      ? assignmentFrom.innerJoin(
          roleDefinitions,
          eq(roleDefinitions.id, userRoleAssignments.roleDefinitionId)
        )
      : null;
  const assignmentWhere =
    assignmentJoined && typeof assignmentJoined.where === 'function'
      ? assignmentJoined.where(
          and(eq(userRoleAssignments.userId, userId), eq(roleDefinitions.isActive, true))
        )
      : null;
  const [assignment] =
    assignmentWhere && typeof assignmentWhere.limit === 'function'
      ? await assignmentWhere.limit(1)
      : [];

  if (assignment) {
    return doesRolePermissionSetGrant(
      normalizeRolePermissions(safeParse(assignment.permissions)),
      permission
    );
  }

  const systemSelect =
    typeof db.select === 'function'
      ? db.select({ permissions: roleDefinitions.permissions })
      : null;
  const systemFrom =
    systemSelect && typeof systemSelect.from === 'function'
      ? systemSelect.from(roleDefinitions)
      : null;
  const systemWhere =
    systemFrom && typeof systemFrom.where === 'function'
      ? systemFrom.where(eq(roleDefinitions.key, baseRole))
      : null;
  const [systemRole] =
    systemWhere && typeof systemWhere.limit === 'function' ? await systemWhere.limit(1) : [];

  if (systemRole) {
    return doesRolePermissionSetGrant(
      normalizeRolePermissions(safeParse(systemRole.permissions)),
      permission
    );
  }

  const fallbackPermissions = DEFAULT_ROLE_DEFINITIONS[baseRole as RoleBaseKey]?.permissions ?? [];
  return doesRolePermissionSetGrant(normalizeRolePermissions(fallbackPermissions), permission);
}

function safeParse(value: string | null | undefined) {
  if (!value) {
    return [];
  }
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}
