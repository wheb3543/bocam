import { describe, expect, it } from 'vitest';
import { readSourceFile as readSource } from './helpers/sourceReader';

describe('التحقق المرحلي لتخطيط الإدارة', () => {
  it('uses the persistent sidebar shell and keeps content routes separate', () => {
    const shell = readSource('client/src/apps/admin/layout/DashboardShell.tsx');
    const app = readSource('client/src/App.tsx');
    const contentRoutes = readSource('client/src/apps/admin/layout/AdminContentRoutes.tsx');
    const workspace = readSource('client/src/apps/admin/layout/AdminWorkspace.tsx');

    expect(shell).toContain("import DashboardSidebarV2 from './DashboardSidebarV2';");
    expect(shell).toContain("import AdminTabs from './AdminTabs';");
    expect(shell).toContain("import AdminWorkspace from './AdminWorkspace';");
    expect(shell).toContain('data-testid="admin-shell"');
    expect(shell).toContain('data-testid="admin-content"');
    expect(app).toContain('<Route path="/admin/*?">');
    expect(app).toContain('<DashboardShell />');
    expect(workspace).toContain('data-testid="admin-workspace"');
    expect(workspace).toContain('key={tab.id}');
    expect(contentRoutes).toContain('export function renderAdminPage');
  });

  it('keeps the tab strip responsive without horizontal scroll and routes tab changes through wouter', () => {
    const tabs = readSource('client/src/apps/admin/layout/AdminTabs.tsx');
    const shell = readSource('client/src/apps/admin/layout/DashboardShell.tsx');
    const sidebar = readSource('client/src/apps/admin/layout/DashboardSidebarV2.tsx');
    const tabContent = readSource('client/src/apps/admin/layout/AdminTabContent.tsx');

    expect(tabs).toContain('overflow-hidden');
    expect(tabs).toContain('setLocation(tab.href)');
    expect(shell).toContain('setLocation(fallbackTab.href)');
    expect(tabContent).toContain('hidden={!active}');
    expect(tabContent).toContain('aria-hidden={!active}');
    expect(sidebar).toContain("import { useLocation } from 'wouter';");
    expect(sidebar).toContain('setLocation(href)');
    expect(sidebar).not.toContain('window.location.href = href');
  });

  it('renders direct pages and nested page menus from the central hierarchy', () => {
    const sectionMenu = readSource('client/src/apps/admin/layout/AdminSubsectionMenu.tsx');
    const pageMenu = readSource('client/src/apps/admin/layout/AdminPageMenu.tsx');
    const navigation = readSource('client/src/apps/admin/layout/config/adminNavigation.ts');

    expect(sectionMenu).toContain('section.items.map');
    expect(sectionMenu).toContain('section.subsections.map');
    expect(pageMenu).toContain('subsection.items.map');
    expect(navigation).toContain('TASK_DEPARTMENTS');
  });

  it('avoids native browser navigation when moving within admin routes', () => {
    const dashboard = readSource('client/src/apps/admin/modules/10-system-settings/pages/AdminDashboardPage.tsx');
    const tracking = readSource('client/src/apps/admin/modules/04-marketing-publishing/tracking/TrackingSettingsPage.tsx');
    const notificationSound = readSource('client/src/core/hooks/useNotificationSound.ts');

    expect(dashboard).not.toContain('<a href="/admin/communications/messages"');
    expect(dashboard).not.toContain('<a href="/admin/content/publishing"');
    expect(tracking).not.toContain('<a href="/admin/reports/bi"');
    expect(notificationSound).not.toContain("window.location.href = '/admin/whatsapp'");
    expect(notificationSound).toContain('setLocation');
  });
});
