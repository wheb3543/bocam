import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeRolePermissions } from './rolePermissionService';
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
    expect(ROLE_PERMISSIONS).toContain('content.review');
    expect(ROLE_PERMISSIONS).toContain('communications.broadcast');
    expect(ROLE_PERMISSIONS).toContain('campaigns.delete');
    expect(ROLE_PERMISSIONS).toContain('operations.manage');
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
    expect(usersRouterSource).toContain('usersManagementProcedure');
  });
});
