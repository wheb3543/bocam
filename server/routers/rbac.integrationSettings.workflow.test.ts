import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('توسيع صلاحيات إعدادات النظام والتكاملات', () => {
  it('يحمي راوترات التكاملات الحساسة بصلاحية settings.manage مشتركة', () => {
    const procedureSource = readFileSync(resolve(process.cwd(), 'server/routers/permissionProcedures.ts'), 'utf8');
    const generalSource = readFileSync(resolve(process.cwd(), 'server/routers/generalIntegrations.ts'), 'utf8');
    const connectionsSource = readFileSync(resolve(process.cwd(), 'server/routers/integrationConnections.ts'), 'utf8');
    const metaSource = readFileSync(resolve(process.cwd(), 'server/routers/metaIntegration.ts'), 'utf8');
    const operationsSource = readFileSync(resolve(process.cwd(), 'server/routers/metaOperations.ts'), 'utf8');
    expect(procedureSource).toContain('hasRolePermission');
    expect(procedureSource).toContain('FORBIDDEN');
    [generalSource, connectionsSource, metaSource, operationsSource].forEach((source) => {
      expect(source).toContain("permissionProcedure('settings.manage'");
      expect(source).toContain('integrationSettingsProcedure');
    });
  });

  it('لا تعتمد صفحة الإعدادات على الدور الثابت وتفحص صلاحية الإشعارات في الواجهة', () => {
    const settingsSource = readFileSync(resolve(process.cwd(), 'client/src/pages/admin/SettingsPage.tsx'), 'utf8');
    const cardSource = readFileSync(resolve(process.cwd(), 'client/src/components/notification/SystemNotificationSettingsCard.tsx'), 'utf8');
    expect(settingsSource).not.toContain("user?.role === 'admin'");
    expect(cardSource).toContain("permissions?.includes('notifications.manage')");
    expect(cardSource).toContain('enabled: canManageNotifications');
  });
});
