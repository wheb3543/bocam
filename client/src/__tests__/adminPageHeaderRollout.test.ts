import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const dashboardLayoutSource = readSource('client/src/components/layout/DashboardLayout.tsx');
const topNavbarSource = readSource('client/src/components/layout/TopNavbar.tsx');
const messagesPageSource = readSource('client/src/pages/admin/communications/MessagesPage.tsx');
const commentContextsSource = readSource(
  'client/src/pages/admin/communications/MetaCommentContextsPanel.tsx'
);

describe('مساحات العمل الإدارية دون بطاقة عنوان مكررة', () => {
  it('لا يرسم رأس عنوان مركزياً فوق محتوى الصفحة', () => {
    expect(dashboardLayoutSource).toContain("pageHeader?: 'standard' | 'none';");
    expect(dashboardLayoutSource).not.toContain("import AdminPageHeader from './AdminPageHeader';");
    expect(dashboardLayoutSource).not.toContain("pageHeader === 'standard' && pageTitle");
    expect(dashboardLayoutSource).toContain('{children}');
  });

  it('يعرض اسم الصفحة في الشريط الإداري العلوي عند توفره', () => {
    expect(dashboardLayoutSource).toContain('showPageTitle={Boolean(pageTitle)}');
    expect(topNavbarSource).toContain('showPageTitle?: boolean;');
    expect(topNavbarSource).toContain('{showPageTitle ? (');
  });

  it('يستبدل رأس صندوق البريد المكرر بتبويبات موحدة وإجراءات مضمنة', () => {
    expect(messagesPageSource).not.toContain("import AdminPageHeader from '@/components/layout/AdminPageHeader';");
    expect(messagesPageSource).not.toContain('aria-label="حالة وإجراءات صندوق البريد"');
    expect(messagesPageSource).toContain('function AccountStatusDots');
    expect(messagesPageSource).toContain('bg-emerald-500');
    expect(messagesPageSource).toContain('bg-amber-500');
    expect(messagesPageSource).toContain('تحديث الصندوق');
    expect(messagesPageSource).toContain('id="inbox-tabs"');
    expect(messagesPageSource).toContain('DropdownMenuCheckboxItem');
    expect(messagesPageSource).toContain('sgh-inbox-show-stats');
    expect(messagesPageSource).toContain('h-[calc(100dvh-4.25rem)]');
    expect(messagesPageSource).toContain('grid h-full min-h-0');
    expect(commentContextsSource).toContain('grid h-full min-h-0');
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
