import { eq } from 'drizzle-orm';
import { users } from '../../drizzle/schema';
import type { RolePermission } from '../../shared/rolePermissions';
import { createNotification } from '../_core/notificationHelper';
import { hasRolePermission } from './rolePermissionService';

type AssignmentKind = 'appointment' | 'lead';

const assignmentConfig: Record<
  AssignmentKind,
  { source: 'bookings' | 'leads'; actionUrl: string; label: string }
> = {
  appointment: { source: 'bookings', actionUrl: '/admin/bookings/appointments', label: 'الموعد' },
  lead: { source: 'leads', actionUrl: '/admin/bookings/leads', label: 'العميل المحتمل' },
};

type DbClient = Awaited<
  ReturnType<typeof import('../_core/databaseGuard').ensureDatabaseAvailable>
>;

export async function listAssignableUsers(db: DbClient, requiredPermission: RolePermission) {
  const activeUsers = await db
    .select({ id: users.id, name: users.name, username: users.username, role: users.role })
    .from(users)
    .where(eq(users.isActive, 'yes'));

  const eligible = await Promise.all(
    activeUsers.map(async (user: { id: number; role: string }) =>
      (await hasRolePermission(db, user.id, user.role, requiredPermission)) ? user : null
    )
  );
  return eligible.filter((user): user is NonNullable<typeof user> => user !== null);
}

export async function assertAssignableUser(
  db: DbClient,
  userId: number | null,
  requiredPermission: RolePermission
) {
  if (userId === null) {
    return null;
  }
  const [user] = await db
    .select({ id: users.id, name: users.name, username: users.username, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user || !(await hasRolePermission(db, user.id, user.role, requiredPermission))) {
    throw new Error('المستخدم المحدد غير نشط أو لا يملك صلاحية متابعة هذا السجل');
  }
  return user;
}

export async function notifyWorkAssignment(
  db: DbClient,
  input: { kind: AssignmentKind; entityId: number; assignedUserId: number; actorUserId: number }
) {
  if (input.assignedUserId === input.actorUserId) {
    return null;
  }
  const config = assignmentConfig[input.kind];
  return createNotification(db, {
    userId: input.assignedUserId,
    source: config.source,
    type: input.kind === 'appointment' ? 'booking_status_changed' : 'lead_status_changed',
    title: `تم إسناد ${config.label} إليك`,
    message: `أُسندت إليك متابعة ${config.label}.`,
    data: JSON.stringify({ entityId: input.entityId, kind: input.kind, event: 'assignment' }),
    entityType: input.kind,
    entityId: input.entityId,
    actionUrl: config.actionUrl,
    actionLabel: `فتح ${config.label}`,
    priority: 'medium',
  });
}
