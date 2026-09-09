import { beforeEach, describe, expect, it } from 'vitest';
import {
  ADMIN_TABS_STORAGE_KEY,
  appendAdminTab,
  closeAdminTabState,
  findAdminTabForPath,
  sanitizeStoredAdminTabs,
} from './useAdminTabs';
import { allNavItems } from '@/config/sidebarNavigation';

describe('admin tab state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens a tab for a direct link using the canonical navigation item', () => {
    const tab = findAdminTabForPath('/admin/reports/reports');

    expect(tab).toMatchObject({
      id: 'reports',
      title: 'التقارير',
      href: '/admin/reports/reports',
    });
  });

  it('restores valid tabs, removes legacy paths, deduplicates, and keeps home first', () => {
    const restored = sanitizeStoredAdminTabs([
      { href: '/admin/reports/reports' },
      { href: '/admin/reports/reports' },
      { href: '/admin/removed-page' },
      { href: '/admin' },
    ]);

    expect(restored.map((tab) => tab.id)).toEqual(['home', 'reports']);
  });

  it('rejects paths that are not present in the canonical registry', () => {
    expect(findAdminTabForPath('/admin/legacy-page')).toBeNull();
    expect(findAdminTabForPath('/admin/')).toMatchObject({ id: 'home', href: '/admin' });
  });

  it('does not persist malformed stored tab data as valid navigation', () => {
    localStorage.setItem(
      ADMIN_TABS_STORAGE_KEY,
      JSON.stringify([{ href: null }, null, { id: 'reports' }, { href: '/admin/settings' }])
    );

    const parsed = JSON.parse(localStorage.getItem(ADMIN_TABS_STORAGE_KEY) ?? '[]');
    const restored = sanitizeStoredAdminTabs(parsed, allNavItems);

    expect(restored.map((tab) => tab.id)).toEqual(['home', 'settings']);
  });

  it('closes a tab and selects the nearest valid fallback without closing home', () => {
    const tabs = [
      { id: 'home', title: 'الرئيسية', href: '/admin' },
      { id: 'reports', title: 'التقارير', href: '/admin/reports/reports' },
      { id: 'settings', title: 'الإعدادات', href: '/admin/settings' },
    ];

    expect(closeAdminTabState(tabs, 'reports')).toMatchObject({
      tabs: [tabs[0], tabs[2]],
      fallbackTab: tabs[0],
    });
    expect(closeAdminTabState(tabs, 'home')).toEqual({ tabs, fallbackTab: null });
  });

  it('keeps the same tab collection when the current tab is already open', () => {
    const tabs = [{ id: 'home', title: 'الرئيسية', href: '/admin' }];

    expect(appendAdminTab(tabs, tabs[0])).toBe(tabs);
  });

  it('adds a new tab once without changing the existing tab order', () => {
    const tabs = [{ id: 'home', title: 'الرئيسية', href: '/admin' }];
    const reportsTab = {
      id: 'reports',
      title: 'التقارير',
      href: '/admin/reports/reports',
    };

    const nextTabs = appendAdminTab(tabs, reportsTab);

    expect(nextTabs).toEqual([tabs[0], reportsTab]);
    expect(appendAdminTab(nextTabs, reportsTab)).toBe(nextTabs);
  });
});
