import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { doesRolePermissionSetGrant, normalizeRolePermissions } from './rolePermissionService';
import {
  ROLE_PERMISSION_GROUPS,
  ROLE_PERMISSION_LABELS,
  ROLE_PERMISSIONS,
} from '../../shared/rolePermissions';

describe('إدارة الأدوار والصلاحيات', () => {
  it('تقبل الصلاحيات المعروفة فقط وتزيل التكرار', () => {
    const permissions = normalizeRolePermissions([
      'users.manage',
      'users.manage',
      'unknown.permission',
      'content.publish',
      'tasks.assign',
      'privacy.export',
      'catalog.publish',
      'operations.purge',
      'integrations.webhooks.manage',
    ]);
    expect(permissions).toEqual([
      'users.manage',
      'content.publish',
      'tasks.assign',
      'privacy.export',
      'catalog.publish',
      'operations.purge',
      'integrations.webhooks.manage',
    ]);
    expect(ROLE_PERMISSIONS).toContain('roles.manage');
    expect(ROLE_PERMISSIONS).toContain('users.create');
    expect(ROLE_PERMISSIONS).toContain('users.delete');
    expect(ROLE_PERMISSIONS).toContain('users.assign_role');
    expect(ROLE_PERMISSIONS).toContain('content.review');
    expect(ROLE_PERMISSIONS).toContain('communications.broadcast');
    expect(ROLE_PERMISSIONS).toContain('campaigns.delete');
    expect(ROLE_PERMISSIONS).toContain('operations.manage');
    expect(ROLE_PERMISSIONS).toContain('media.organize');
    expect(ROLE_PERMISSIONS).toContain('appointments.export');
    expect(ROLE_PERMISSIONS).toContain('leads.export');
    expect(ROLE_PERMISSIONS).toContain('campaigns.publish');
    expect(ROLE_PERMISSIONS).toContain('tasks.complete');
    expect(ROLE_PERMISSIONS).toContain('integrations.credentials.manage');
    expect(ROLE_PERMISSIONS).toContain('privacy.manage');
    expect(ROLE_PERMISSIONS).toContain('operations.restore');
    expect(ROLE_PERMISSIONS).toContain('audit.export');
    expect(ROLE_PERMISSIONS).toContain('content.schedule');
    expect(ROLE_PERMISSIONS).toContain('media.restore');
    expect(ROLE_PERMISSIONS).toContain('appointments.reschedule');
    expect(ROLE_PERMISSIONS).toContain('leads.merge');
    expect(ROLE_PERMISSIONS).toContain('communications.comment.moderate');
    expect(ROLE_PERMISSIONS).toContain('campaigns.links.manage');
    expect(ROLE_PERMISSIONS).toContain('tasks.attachments.manage');
    expect(ROLE_PERMISSIONS).toContain('registrations.assign');
    expect(ROLE_PERMISSIONS).toContain('patients.results.manage');
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
    expect(doesRolePermissionSetGrant(['communications.manage'], 'communications.broadcast')).toBe(true);
    expect(doesRolePermissionSetGrant(['communications.reply'], 'communications.broadcast')).toBe(false);
    expect(doesRolePermissionSetGrant(['tasks.manage'], 'tasks.complete')).toBe(true);
    expect(doesRolePermissionSetGrant(['tasks.view'], 'tasks.delete')).toBe(false);
    expect(doesRolePermissionSetGrant(['integrations.manage'], 'integrations.credentials.manage')).toBe(true);
    expect(doesRolePermissionSetGrant(['settings.manage'], 'integrations.credentials.manage')).toBe(false);
    expect(doesRolePermissionSetGrant(['integrations.view'], 'integrations.connect')).toBe(false);
    expect(doesRolePermissionSetGrant(['privacy.view'], 'privacy.manage')).toBe(false);
    expect(doesRolePermissionSetGrant(['campaigns.manage'], 'campaigns.links.manage')).toBe(false);
    expect(doesRolePermissionSetGrant(['operations.manage'], 'operations.purge')).toBe(false);
  });

  it('يعرض كل صلاحية موسعة في مجموعة قابلة للتحرير بتسمية مفهومة', () => {
    const groupedPermissions = ROLE_PERMISSION_GROUPS.flatMap((group) => group.permissions);
    expect(groupedPermissions).toContain('catalog.publish');
    expect(groupedPermissions).toContain('registrations.assign');
    expect(groupedPermissions).toContain('patients.records.manage');
    expect(ROLE_PERMISSION_LABELS['integrations.webhooks.manage']).toContain('Webhook');
    expect(ROLE_PERMISSION_LABELS['operations.purge']).toContain('الحذف النهائي');
    expect(ROLE_PERMISSION_LABELS['content.translations.manage']).toContain('ترجمات');
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
