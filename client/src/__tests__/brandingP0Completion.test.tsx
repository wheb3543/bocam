import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_LOGO, APP_TITLE } from '@/const';

const integrationSettingsSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/communications/MetaIntegrationSettingsPage.tsx'),
  'utf8'
);
const dashboardLayoutSource = readFileSync(
  resolve(process.cwd(), 'client/src/components/layout/DashboardLayout.tsx'),
  'utf8'
);

describe('P0 brand and page-shell completion', () => {
  it('uses SGH branding fallbacks instead of a generic app identity', () => {
    expect(APP_TITLE).toContain('المستشفى السعودي الألماني');
    expect(APP_LOGO).toBe('/assets/logo-color.png');
  });

  it('uses the single shared SGH page header and a clear unconfigured connection state', () => {
    expect(dashboardLayoutSource).toContain("import AdminPageHeader from './AdminPageHeader';");
    expect(integrationSettingsSource).toContain('pageTitle="إعدادات الربط العامة"');
    expect(integrationSettingsSource).not.toContain('AdminPageHeader');
    expect(integrationSettingsSource).toContain("href=\"#platform-connections\"");
    expect(integrationSettingsSource).toContain('لم يبدأ الربط بعد');
    expect(integrationSettingsSource).toContain('id="platform-connections"');
  });
});
