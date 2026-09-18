import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { canAccessSocialInbox } from '@shared/socialInboxAccess';
import { useLicense } from '@/hooks/integrations/useLicense';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { allNavItems, type NavItem } from '@/config/sidebarNavigation';

export interface AdminTab {
  id: string;
  title: string;
  href: string;
}

interface StoredAdminTab {
  id?: unknown;
  href?: unknown;
}

export const ADMIN_TABS_STORAGE_KEY = 'bocam-admin-tabs';

export const normalizePath = (path: string) => {
  if (path === '/admin/' || path === '/admin') {
    return '/system';
  }
  if (path.endsWith('/') && path.length > 1) {
    return path.slice(0, -1);
  }
  return path;
};

const toTab = (item: NavItem): AdminTab => ({
  id: item.id,
  title: item.title,
  href: normalizePath(item.href),
});

export const findAdminTabForPath = (path: string, items: NavItem[] = allNavItems) => {
  const normalizedPath = normalizePath(path);
  return items.find((item) => normalizePath(item.href) === normalizedPath) ?? null;
};

export const sanitizeStoredAdminTabs = (
  storedTabs: unknown,
  items: NavItem[] = allNavItems
): AdminTab[] => {
  if (!Array.isArray(storedTabs)) {
    return [];
  }

  const validItems = new Map(items.map((item) => [normalizePath(item.href), item]));
  const seen = new Set<string>();
  const tabs: AdminTab[] = [];

  for (const storedTab of storedTabs as StoredAdminTab[]) {
    if (typeof storedTab?.href !== 'string') {
      continue;
    }
    const item = validItems.get(normalizePath(storedTab.href));
    if (!item || seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    tabs.push(toTab(item));
  }

  return tabs;
};

export const closeAdminTabState = (tabs: AdminTab[], tabId: string) => {
  const index = tabs.findIndex((tab) => tab.id === tabId);
  if (index === -1) {
    return { tabs, fallbackTab: null };
  }

  const remainingTabs = tabs.filter((tab) => tab.id !== tabId);
  const fallbackTab = tabs[index - 1] ?? tabs[index + 1] ?? remainingTabs[0] ?? null;

  return { tabs: remainingTabs, fallbackTab };
};

export const reorderAdminTabsState = (
  tabs: AdminTab[],
  sourceId: string,
  targetId: string
): AdminTab[] => {
  if (sourceId === targetId) {
    return tabs;
  }
  const sourceIndex = tabs.findIndex((tab) => tab.id === sourceId);
  const targetIndex = tabs.findIndex((tab) => tab.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) {
    return tabs;
  }
  const nextTabs = [...tabs];
  const [moved] = nextTabs.splice(sourceIndex, 1);
  nextTabs.splice(targetIndex, 0, moved);
  return nextTabs;
};

const readStoredTabs = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_TABS_STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const writeStoredTabs = (tabs: AdminTab[]) => {
  try {
    localStorage.setItem(ADMIN_TABS_STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
};

export const appendAdminTab = (tabs: AdminTab[], tab: AdminTab | null) => {
  if (!tab || tabs.some((currentTab) => currentTab.id === tab.id)) {
    return tabs;
  }
  return [...tabs, tab];
};

const areAdminTabsEqual = (first: AdminTab[], second: AdminTab[]) =>
  first.length === second.length &&
  first.every(
    (tab, index) =>
      tab.id === second[index]?.id &&
      tab.title === second[index]?.title &&
      tab.href === second[index]?.href
  );

export function useAdminTabs(currentPath: string) {
  const { user } = useAuth();
  const { hasFeature, isLoading: areFeaturesLoading } = useLicense();
  const { can, isLoading: arePermissionsLoading } = useRolePermissions();
  const [tabs, setTabs] = useState<AdminTab[]>([]);

  const accessibleItems = useMemo(() => {
    if (areFeaturesLoading || arePermissionsLoading) {
      return [];
    }

    return allNavItems.filter((item) => {
      if (item.feature && !hasFeature(item.feature)) {
        return false;
      }
      if (item.requiredPermission && !can(item.requiredPermission)) {
        return false;
      }
      if (item.allowedRoles?.length) {
        if (item.id === 'messages') {
          return canAccessSocialInbox(user?.role);
        }
        return Boolean(user?.role && item.allowedRoles.includes(user.role));
      }
      return true;
    });
  }, [areFeaturesLoading, arePermissionsLoading, can, hasFeature, user?.role]);

  const navigationReady = accessibleItems.length > 0;
  const activeItem = useMemo(
    () => findAdminTabForPath(currentPath, accessibleItems),
    [accessibleItems, currentPath]
  );

  useEffect(() => {
    if (!navigationReady) {
      return;
    }

    const restoredTabs = sanitizeStoredAdminTabs(readStoredTabs(), accessibleItems);
    setTabs((currentTabs) => {
      const baseTabs =
        currentTabs.length > 0
          ? sanitizeStoredAdminTabs(currentTabs, accessibleItems)
          : restoredTabs;
      return areAdminTabsEqual(currentTabs, baseTabs) ? currentTabs : baseTabs;
    });
  }, [accessibleItems, navigationReady]);

  useEffect(() => {
    if (!navigationReady || !activeItem) {
      return;
    }

    const currentTab = toTab(activeItem);
    setTabs((currentTabs) => appendAdminTab(currentTabs, currentTab));
  }, [activeItem, navigationReady]);

  useEffect(() => {
    writeStoredTabs(tabs);
  }, [tabs]);

  const openTab = useCallback(
    (path: string) => {
      const item = findAdminTabForPath(path, accessibleItems);
      if (!item) {
        return null;
      }
      const tab = toTab(item);
      setTabs((currentTabs) => appendAdminTab(currentTabs, tab));
      return tab;
    },
    [accessibleItems]
  );

  const closeTab = useCallback(
    (tabId: string) => {
      const nextState = closeAdminTabState(tabs, tabId);
      setTabs(nextState.tabs);
      return nextState.fallbackTab;
    },
    [tabs]
  );

  const reorderTabs = useCallback((sourceId: string, targetId: string) => {
    setTabs((currentTabs) => reorderAdminTabsState(currentTabs, sourceId, targetId));
  }, []);

  return {
    tabs,
    activeTabId: activeItem?.id ?? null,
    openTab,
    closeTab,
    reorderTabs,
    isReady: navigationReady,
  };
}
