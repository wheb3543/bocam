import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('التحقق المرحلي لتخطيط الإدارة', () => {
  it('uses the RTL top navigation and no longer mounts the legacy sidebar', () => {
    const shell = readSource('client/src/components/layout/DashboardShell.tsx');
    const topNavigation = readSource('client/src/components/layout/AdminTopNavigation.tsx');

    expect(shell).toContain("import AdminTopNavigation from './AdminTopNavigation';");
    expect(shell).not.toContain("import DashboardSidebar from './DashboardSidebar';");
    expect(topNavigation).toContain('dir="rtl"');
    expect(topNavigation).toContain('sticky top-0');
  });

  it('keeps the navigation usable on narrow screens and exposes keyboard dismissal', () => {
    const mainNavigation = readSource('client/src/components/layout/AdminMainNavigation.tsx');
    const tabs = readSource('client/src/components/layout/AdminTabs.tsx');
    const topNavigation = readSource('client/src/components/layout/AdminTopNavigation.tsx');

    expect(mainNavigation).toContain('overflow-x-auto');
    expect(tabs).toContain('overflow-x-auto');
    expect(topNavigation).toContain("event.key === 'Escape'");
  });

  it('renders direct pages and nested page menus from the central hierarchy', () => {
    const sectionMenu = readSource('client/src/components/layout/AdminSubsectionMenu.tsx');
    const pageMenu = readSource('client/src/components/layout/AdminPageMenu.tsx');
    const navigation = readSource('client/src/config/adminNavigation.ts');

    expect(sectionMenu).toContain('section.items.map');
    expect(sectionMenu).toContain('section.subsections.map');
    expect(pageMenu).toContain('subsection.items.map');
    expect(navigation).toContain('TASK_DEPARTMENTS');
  });
});
