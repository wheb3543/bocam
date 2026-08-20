import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const dashboardLayoutSource = readSource('client/src/components/layout/DashboardLayout.tsx');
const topNavbarSource = readSource('client/src/components/layout/TopNavbar.tsx');

describe('تعميم رأس صفحة SGH الإداري', () => {
  it('يعرض الرأس الموحد تلقائياً لكل صفحة قياسية تحمل عنواناً ووصفاً', () => {
    expect(dashboardLayoutSource).toContain("import AdminPageHeader from './AdminPageHeader';");
    expect(dashboardLayoutSource).toContain("pageHeader?: 'standard' | 'none';");
    expect(dashboardLayoutSource).toContain("pageHeader === 'standard' && pageTitle");
    expect(dashboardLayoutSource).toContain(
      '<AdminPageHeader title={pageTitle} description={pageDescription} eyebrow="إدارة SGH" />'
    );
  });

  it('يمنع تكرار العنوان بين الرأس الموحد وشريط الإدارة العلوي', () => {
    expect(dashboardLayoutSource).toContain("showPageTitle={pageHeader === 'none'}");
    expect(topNavbarSource).toContain('showPageTitle?: boolean;');
    expect(topNavbarSource).toContain('{showPageTitle ? (');
  });

  it.each([
    'client/src/pages/admin/AdminDashboard.tsx',
    'client/src/pages/admin/communications/MessagesPage.tsx',
    'client/src/pages/admin/content/PublishingPage.tsx',
    'client/src/pages/admin/media/MediaLibraryPage.tsx',
    'client/src/pages/admin/communications/MetaIntegrationSettingsPage.tsx',
    'client/src/pages/admin/campaigns/DigitalMarketingTasksPage.tsx',
    'client/src/pages/admin/reports/BIPage.tsx',
    'client/src/pages/admin/reports/CampStatsPage.tsx',
    'client/src/pages/admin/reports/PWAStatsPage.tsx',
    'client/src/pages/admin/teams/MediaTeamPage.tsx',
  ])('يحافظ على الرأس المتخصص في %s', (pagePath) => {
    expect(readSource(pagePath)).toContain('pageHeader="none"');
  });
});
