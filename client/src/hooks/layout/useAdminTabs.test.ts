import { beforeEach, describe, expect, it } from 'vitest';
import {
  ADMIN_TABS_STORAGE_KEY,
  appendAdminTab,
  closeAdminTabState,
  findAdminTabForPath,
  reorderAdminTabsState,
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

  it('restores valid tabs, removes legacy paths, and deduplicates without forced home pinning', () => {
    const restored = sanitizeStoredAdminTabs([
      { href: '/admin/reports/reports' },
      { href: '/admin/reports/reports' },
      { href: '/admin/removed-page' },
      { href: '/system/dashboard' },
    ]);

    expect(restored.map((tab) => tab.id)).toEqual(['reports', 'home']);
  });

  it('rejects paths that are not present in the canonical registry and ensures /system and /admin have no tabs', () => {
    expect(findAdminTabForPath('/admin/legacy-page')).toBeNull();
    expect(findAdminTabForPath('/admin/')).toBeNull();
    expect(findAdminTabForPath('/admin')).toBeNull();
    expect(findAdminTabForPath('/system')).toBeNull();
    expect(findAdminTabForPath('/system/dashboard')).toMatchObject({
      id: 'home',
      href: '/system/dashboard',
    });
  });

  it('does not persist malformed stored tab data as valid navigation', () => {
    localStorage.setItem(
      ADMIN_TABS_STORAGE_KEY,
      JSON.stringify([{ href: null }, null, { id: 'reports' }, { href: '/admin/settings' }])
    );

    const parsed = JSON.parse(localStorage.getItem(ADMIN_TABS_STORAGE_KEY) ?? '[]');
    const restored = sanitizeStoredAdminTabs(parsed, allNavItems);

    expect(restored.map((tab) => tab.id)).toEqual(['settings']);
  });

  it('closes a tab including home and selects the nearest valid fallback', () => {
    const tabs = [
      { id: 'home', title: 'الرئيسية', href: '/system/dashboard' },
      { id: 'reports', title: 'التقارير', href: '/admin/reports/reports' },
      { id: 'settings', title: 'الإعدادات', href: '/admin/settings' },
    ];

    expect(closeAdminTabState(tabs, 'reports')).toMatchObject({
      tabs: [tabs[0], tabs[2]],
      fallbackTab: tabs[0],
    });
    expect(closeAdminTabState(tabs, 'home')).toMatchObject({
      tabs: [tabs[1], tabs[2]],
      fallbackTab: tabs[1],
    });
  });

  it('keeps the same tab collection when the current tab is already open', () => {
    const tabs = [{ id: 'home', title: 'الرئيسية', href: '/system/dashboard' }];

    expect(appendAdminTab(tabs, tabs[0])).toBe(tabs);
  });

  it('adds a new tab once without changing the existing tab order', () => {
    const tabs = [{ id: 'home', title: 'الرئيسية', href: '/system/dashboard' }];
    const reportsTab = {
      id: 'reports',
      title: 'التقارير',
      href: '/admin/reports/reports',
    };

    const nextTabs = appendAdminTab(tabs, reportsTab);

    expect(nextTabs).toEqual([tabs[0], reportsTab]);
    expect(appendAdminTab(nextTabs, reportsTab)).toBe(nextTabs);
  });

  it('reorders tabs smoothly via reorderAdminTabsState', () => {
    const tabs = [
      { id: 'home', title: 'لوحة التحكم', href: '/system/dashboard' },
      { id: 'reports', title: 'التقارير', href: '/admin/reports/reports' },
      { id: 'settings', title: 'الإعدادات', href: '/admin/settings' },
    ];

    const reordered = reorderAdminTabsState(tabs, 'settings', 'home');
    expect(reordered.map((t) => t.id)).toEqual(['settings', 'home', 'reports']);

    const sameOrder = reorderAdminTabsState(tabs, 'home', 'home');
    expect(sameOrder).toBe(tabs);
  });
});
