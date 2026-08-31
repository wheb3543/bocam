import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('فصل صلاحيات التكاملات الخادمية', () => {
  it('يفصل العرض والربط والفصل وبيانات الاعتماد بدلاً من حراسة إعدادات عامة واحدة', () => {
    const procedureSource = readFileSync(resolve(process.cwd(), 'server/routers/permissionProcedures.ts'), 'utf8');
    const generalSource = readFileSync(resolve(process.cwd(), 'server/routers/generalIntegrations.ts'), 'utf8');
    const connectionsSource = readFileSync(resolve(process.cwd(), 'server/routers/integrationConnections.ts'), 'utf8');
    const metaSource = readFileSync(resolve(process.cwd(), 'server/routers/metaIntegration.ts'), 'utf8');
    const operationsSource = readFileSync(resolve(process.cwd(), 'server/routers/metaOperations.ts'), 'utf8');
    const metaSyncSource = readFileSync(resolve(process.cwd(), 'server/routers/metaSync.ts'), 'utf8');
    const whatsappConnectionSource = readFileSync(
      resolve(process.cwd(), 'server/routers/whatsapp/settings/routes/connectionRoutes.ts'),
      'utf8'
    );
    const webhookSource = readFileSync(
      resolve(process.cwd(), 'server/routers/whatsapp/settings/routes/webhookRoutes.ts'),
      'utf8'
    );
    expect(procedureSource).toContain('hasRolePermission');
    expect(procedureSource).toContain('FORBIDDEN');
    expect(generalSource).toContain("permissionProcedure('integrations.view'");
    expect(generalSource).toContain("permissionProcedure(\n  'integrations.credentials.manage'");
    expect(metaSource).toContain("permissionProcedure('integrations.view'");
    expect(metaSource).toContain("permissionProcedure(\n  'integrations.credentials.manage'");
    expect(connectionsSource).toContain("permissionProcedure('integrations.view'");
    expect(connectionsSource).toContain("permissionProcedure('integrations.connect'");
    expect(connectionsSource).toContain("'integrations.disconnect'");
    expect(operationsSource).toContain("permissionProcedure('integrations.view'");
    expect(operationsSource).toContain("'integrations.connect'");
    expect(metaSyncSource).toContain("permissionProcedure('integrations.sync.manage'");
    expect(metaSyncSource).toContain("'communications.templates.manage'");
    expect(metaSyncSource).not.toContain('accessTokenPrefix');
    expect(whatsappConnectionSource).toMatch(/permissionProcedure\s*\(\s*'integrations\.view'/);
    expect(whatsappConnectionSource).toMatch(/permissionProcedure\s*\(\s*'integrations\.connect'/);
    expect(whatsappConnectionSource).toContain("'integrations.webhooks.manage'");
    expect(webhookSource).toContain("permissionProcedure('integrations.logs.view'");
    expect(webhookSource).toContain("'integrations.webhooks.manage'");
    expect(webhookSource).toContain('function toWebhookEventSummary');
    expect(webhookSource).toContain('return events.map(toWebhookEventSummary)');
    [generalSource, connectionsSource, metaSource, operationsSource].forEach((source) => {
      expect(source).not.toContain('integrationSettingsProcedure');
    });
  });

  it('لا تعتمد صفحة الإعدادات على الدور الثابت وتفحص صلاحية الإشعارات في الواجهة', () => {
    const settingsSource = readFileSync(resolve(process.cwd(), 'client/src/pages/admin/SettingsPage.tsx'), 'utf8');
    const cardSource = readFileSync(resolve(process.cwd(), 'client/src/components/notification/SystemNotificationSettingsCard.tsx'), 'utf8');
    expect(settingsSource).not.toContain("user?.role === 'admin'");
    expect(cardSource).toContain("can('notifications.settings.manage')");
    expect(cardSource).toContain('enabled: canManageNotifications');
  });
});
