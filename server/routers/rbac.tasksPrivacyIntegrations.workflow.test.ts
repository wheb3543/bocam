import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('إنفاذ صلاحيات المهام والخصوصية والتكاملات', () => {
  it('يحمي إجراءات المهام الرئيسية ومهام المتابعة بالصلاحيات الدقيقة مع فحص الإسناد والإكمال', () => {
    const tasksSource = readSource('server/routers/tasks.ts');
    const followUpSource = readSource('server/routers/followUpTasks.ts');

    [tasksSource, followUpSource].forEach((source) => {
      expect(source).toContain("permissionProcedure('tasks.view'");
      expect(source).toContain("permissionProcedure('tasks.create'");
      expect(source).toContain("permissionProcedure('tasks.update'");
      expect(source).toContain("permissionProcedure('tasks.delete'");
      expect(source).toContain("assertRolePermission(ctx.user, 'tasks.assign'");
      expect(source).toContain("assertRolePermission(ctx.user, 'tasks.complete'");
    });
  });

  it('يحمي عناصر CMS المصنفة للخصوصية ولا يغيّر مسار المحتوى العام', () => {
    const textContentSource = readSource('server/routers/content/textContent.ts');

    expect(textContentSource).toContain('function isPrivacyTextContent');
    expect(textContentSource).toContain("assertRolePermission(ctx.user, 'privacy.view'");
    expect(textContentSource).toContain("assertRolePermission(ctx.user, 'privacy.manage'");
    expect(textContentSource).toContain("assertRolePermission(ctx.user, 'privacy.export'");
  });

  it('يحصر حفظ الأسرار في صلاحية بيانات اعتماد التكاملات', () => {
    const generalSource = readSource('server/routers/generalIntegrations.ts');
    const metaSource = readSource('server/routers/metaIntegration.ts');

    [generalSource, metaSource].forEach((source) => {
      expect(source).toContain('integrationCredentialsProcedure');
      expect(source).toContain('integrations.credentials.manage');
    });
  });
});
