import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_LOGO, APP_TITLE } from '@/const';

const integrationSettingsSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/communications/MetaIntegrationSettingsPage.tsx'),
  'utf8'
);

describe('P0 brand and page-shell completion', () => {
  it('uses tenant-backed branding values', () => {
    expect(APP_TITLE).toBeTruthy();
    expect(APP_LOGO).toBeTruthy();
  });

  it('applies the shared SGH page header and a clear unconfigured connection state', () => {
    expect(integrationSettingsSource).toContain(
      "import AdminPageHeader from '@/components/layout/AdminPageHeader';"
    );
    expect(integrationSettingsSource).toContain('eyebrow="إدارة الاتصالات"');
    expect(integrationSettingsSource).toContain("href=\"#platform-connections\"");
    expect(integrationSettingsSource).toContain('لم يبدأ الربط بعد');
    expect(integrationSettingsSource).toContain('id="platform-connections"');
  });
});
