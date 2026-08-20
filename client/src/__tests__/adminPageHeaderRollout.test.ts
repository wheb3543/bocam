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
    'client/src/pages/admin/bookings/DoctorAppointments.tsx',
    'client/src/pages/admin/communications/MessagesPage.tsx',
    'client/src/pages/admin/content/PublishingPage.tsx',
    'client/src/pages/admin/media/MediaLibraryPage.tsx',
    'client/src/pages/admin/communications/MetaIntegrationSettingsPage.tsx',
    'client/src/pages/admin/campaigns/DigitalMarketingTasksPage.tsx',
    'client/src/pages/admin/reports/BIPage.tsx',
    'client/src/pages/admin/reports/CampStatsPage.tsx',
    'client/src/pages/admin/reports/PWAStatsPage.tsx',
    'client/src/pages/admin/teams/MediaTeamPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppAccountHealthPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppAnalytics.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppAppointments.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppAutoReply.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppBroadcast.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppCompliance.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppConnectionPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppCostsPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppDashboard.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppIntegration.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppLabResultsPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppOrdersPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppPhoneQualityPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppProductsPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppReferralsPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppTemplatesPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppUserSubscriptionsPage.tsx',
    'client/src/pages/admin/whatsapp/WhatsAppWebhookInspectorPage.tsx',
    'client/src/pages/admin/MessageSettingsPage.tsx',
  ])('يستخدم رأس SGH المركزي الواحد في %s', (pagePath) => {
    const pageSource = readSource(pagePath);
    expect(pageSource).toContain('<DashboardLayout');
    expect(pageSource).not.toContain('pageHeader="none"');
    expect(pageSource).not.toContain('AdminPageHeader');
    expect(pageSource).not.toContain('<h1');
  });
});
