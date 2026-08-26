import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { doesRolePermissionSetGrant, normalizeRolePermissions } from './rolePermissionService';
import { ROLE_PERMISSIONS } from '../../shared/rolePermissions';

describe('إدارة الأدوار والصلاحيات', () => {
  it('تقبل الصلاحيات المعروفة فقط وتزيل التكرار', () => {
    const permissions = normalizeRolePermissions([
      'users.manage',
      'users.manage',
      'unknown.permission',
      'content.publish',
    ]);
    expect(permissions).toEqual(['users.manage', 'content.publish']);
    expect(ROLE_PERMISSIONS).toContain('roles.manage');
    expect(ROLE_PERMISSIONS).toContain('users.create');
    expect(ROLE_PERMISSIONS).toContain('users.delete');
    expect(ROLE_PERMISSIONS).toContain('users.assign_role');
    expect(ROLE_PERMISSIONS).toContain('content.review');
    expect(ROLE_PERMISSIONS).toContain('communications.broadcast');
    expect(ROLE_PERMISSIONS).toContain('campaigns.delete');
    expect(ROLE_PERMISSIONS).toContain('operations.manage');
  });

  it('يحافظ على الامتياز العام الموجود صراحةً أثناء الانتقال إلى إجراءات المستخدمين الدقيقة', () => {
    expect(doesRolePermissionSetGrant(['users.manage'], 'users.create')).toBe(true);
    expect(doesRolePermissionSetGrant(['users.manage'], 'users.assign_role')).toBe(true);
    expect(doesRolePermissionSetGrant(['users.view'], 'users.update')).toBe(false);
    expect(doesRolePermissionSetGrant(['reports.view'], 'reports.export')).toBe(false);
    expect(doesRolePermissionSetGrant(['content.manage'], 'content.create')).toBe(true);
    expect(doesRolePermissionSetGrant(['content.manage'], 'content.review')).toBe(true);
    expect(doesRolePermissionSetGrant(['content.view'], 'content.update')).toBe(false);
    expect(doesRolePermissionSetGrant(['content.manage'], 'content.restore')).toBe(false);
    expect(doesRolePermissionSetGrant(['appointments.manage'], 'appointments.cancel')).toBe(true);
    expect(doesRolePermissionSetGrant(['appointments.manage'], 'appointments.delete')).toBe(false);
    expect(doesRolePermissionSetGrant(['leads.manage'], 'leads.update')).toBe(true);
  });

  it('يربط تعريف الدور وتعيينه بإجراءات خادمية محمية ولا يعتمد على الواجهة فقط', () => {
    const schemaSource = readFileSync(resolve(process.cwd(), 'drizzle/schema.ts'), 'utf8');
    const usersRouterSource = readFileSync(resolve(process.cwd(), 'server/routers/users.ts'), 'utf8');
    const roleRouterSource = readFileSync(resolve(process.cwd(), 'server/routers/roleManagement.ts'), 'utf8');
    expect(schemaSource).toContain("'roleDefinitions'");
    expect(schemaSource).toContain("'userRoleAssignments'");
    expect(usersRouterSource).toContain('assignRoleDefinition');
    expect(usersRouterSource).toContain('roles: roleManagementRouter');
    expect(roleRouterSource).toContain('hasRolePermission');
    expect(usersRouterSource).toContain("permissionProcedure('users.create'");
  });
});
