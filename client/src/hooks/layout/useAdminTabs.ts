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

const normalizePath = (path: string) => (path === '/admin/' ? '/admin' : path);

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

  const homeItem = validItems.get('/admin');
  if (homeItem) {
    return [toTab(homeItem), ...tabs.filter((tab) => tab.id !== homeItem.id)];
  }

  return tabs;
};

export const closeAdminTabState = (tabs: AdminTab[], tabId: string) => {
  if (tabId === 'home') {
    return { tabs, fallbackTab: null };
  }

  const index = tabs.findIndex((tab) => tab.id === tabId);
  if (index === -1) {
    return { tabs, fallbackTab: null };
  }

  const remainingTabs = tabs.filter((tab) => tab.id !== tabId);
  const fallbackTab = tabs[index - 1] ?? tabs[index + 1] ?? remainingTabs[0] ?? null;

  return { tabs: remainingTabs, fallbackTab };
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
    const currentTab = activeItem ? toTab(activeItem) : null;
    const nextTabs = currentTab
      ? restoredTabs.some((tab) => tab.id === currentTab.id)
        ? restoredTabs
        : [...restoredTabs, currentTab]
      : restoredTabs;

    setTabs(nextTabs.length > 0 ? nextTabs : [toTab(accessibleItems[0])]);
  }, [accessibleItems, activeItem, navigationReady]);

  useEffect(() => {
    if (tabs.length > 0) {
      writeStoredTabs(tabs);
    }
  }, [tabs]);

  const openTab = useCallback(
    (path: string) => {
      const item = findAdminTabForPath(path, accessibleItems);
      if (!item) {
        return null;
      }
      const tab = toTab(item);
      setTabs((currentTabs) =>
        currentTabs.some((currentTab) => currentTab.id === tab.id)
          ? currentTabs
          : [...currentTabs, tab]
      );
      return tab;
    },
    [accessibleItems]
  );

  const closeTab = useCallback(
    (tabId: string) => {
      const nextState = closeAdminTabState(tabs, tabId);
      setTabs(nextState.tabs.length > 0 ? nextState.tabs : [toTab(accessibleItems[0])]);
      return nextState.fallbackTab;
    },
    [accessibleItems, tabs]
  );

  return {
    tabs,
    activeTabId: activeItem?.id ?? null,
    openTab,
    closeTab,
    isReady: navigationReady,
  };
}
