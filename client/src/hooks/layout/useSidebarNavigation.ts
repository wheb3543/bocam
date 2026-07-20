import { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeLocalStorage } from '@/utils/errorHandling';
import { trpc } from '@/lib/api/trpc';
import { useLicense } from '@/hooks/integrations/useLicense';
import type { NavItem } from '@/config/sidebarNavigation';
import {
  allNavItems,
  allToolsGroups,
  DEFAULT_VISIBLE_IDS,
  STORAGE_KEY,
} from '@/config/sidebarNavigation';

export function useSidebarNavigation(currentPath: string) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allToolsOpen, setAllToolsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleItemIds, setVisibleItemIds] = useState<string[]>(getVisibleItemIds);
  const [editingItemIds, setEditingItemIds] = useState<string[]>([]);

  // License features check
  const { hasFeature } = useLicense();

  // Fetch sidebar badge counts (auto-refresh every 60 seconds)
  const { data: badgeCounts } = trpc.sidebarBadges.useQuery(undefined, {
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    retry: 1,
  });

  // Map nav item IDs to their badge counts
  const getBadgeCount = useCallback(
    (itemId: string): number => {
      if (!badgeCounts) {
        return 0;
      }
      const mapping: Record<string, number> = {
        leads: badgeCounts.leads,
        tasks: badgeCounts.tasks,
        whatsapp: badgeCounts.whatsapp,
        management: badgeCounts.management,
      };
      return mapping[itemId] || 0;
    },
    [badgeCounts]
  );

  // العناصر الرئيسية المعروضة في الشريط الضيق (مع التحقق من الميزات)
  const primaryNavItems = useMemo(() => {
    return visibleItemIds
      .map((id) => allNavItems.find((item) => item.id === id))
      .filter((item): item is NavItem => item !== undefined)
      .filter((item) => !item.feature || hasFeature(item.feature));
  }, [visibleItemIds, hasFeature]);

  // تصفية مجموعات الأدوات بناءً على الميزات
  const filteredToolsGroups = useMemo(() => {
    return allToolsGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.feature || hasFeature(item.feature)),
      }))
      .filter((group) => group.items.length > 0);
  }, [hasFeature]);

  // تصفية مجموعات الأدوات بناءً على البحث
  const searchedToolsGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredToolsGroups;
    }

    const query = searchQuery.toLowerCase();
    return filteredToolsGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) || item.id.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredToolsGroups, searchQuery]);

  // Auto-expand groups that contain the active page
  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    filteredToolsGroups.forEach((group) => {
      const hasActive = group.items.some((item) => {
        if (item.href === '/admin') {
          return currentPath === '/admin';
        }
        return currentPath === item.href || currentPath.startsWith(item.href + '/');
      });
      if (hasActive || group.defaultOpen) {
        newExpanded[group.label] = true;
      }
    });
    setExpandedGroups((prev) => ({ ...prev, ...newExpanded }));
  }, [currentPath, filteredToolsGroups]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
    setAllToolsOpen(false);
  }, [currentPath]);

  // Toggle group expansion
  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  // Toggle item visibility in edit mode
  const toggleItemVisibility = useCallback((itemId: string) => {
    setEditingItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  // Save visible items
  const saveVisibleItems = useCallback(() => {
    const newVisibleIds = [...DEFAULT_VISIBLE_IDS, ...editingItemIds];
    const uniqueIds = Array.from(new Set(newVisibleIds));
    saveVisibleItemIds(uniqueIds);
    setVisibleItemIds(uniqueIds);
    setEditMode(false);
    setEditingItemIds([]);
  }, [editingItemIds]);

  // Cancel edit mode
  const cancelEditMode = useCallback(() => {
    setEditMode(false);
    setEditingItemIds(visibleItemIds.filter((id) => !DEFAULT_VISIBLE_IDS.includes(id)));
  }, [visibleItemIds]);

  // Enter edit mode
  const startEditMode = useCallback(() => {
    setEditMode(true);
    setEditingItemIds(visibleItemIds.filter((id) => !DEFAULT_VISIBLE_IDS.includes(id)));
  }, [visibleItemIds]);

  return {
    // State
    mobileOpen,
    allToolsOpen,
    editMode,
    expandedGroups,
    searchQuery,
    visibleItemIds,
    editingItemIds,

    // Data
    primaryNavItems,
    filteredToolsGroups,
    searchedToolsGroups,
    badgeCounts,

    // Actions
    setMobileOpen,
    setAllToolsOpen,
    setEditMode,
    setSearchQuery,
    setEditingItemIds,
    toggleGroup,
    toggleItemVisibility,
    saveVisibleItems,
    cancelEditMode,
    startEditMode,
    getBadgeCount,
  };
}

function getVisibleItemIds(): string[] {
  const stored = SafeLocalStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = SafeLocalStorage.getJSON<string[]>(STORAGE_KEY);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  }
  return DEFAULT_VISIBLE_IDS;
}

function saveVisibleItemIds(ids: string[]) {
  SafeLocalStorage.setJSON(STORAGE_KEY, ids);
}
