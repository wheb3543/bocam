/**
 * Compatibility exports for the V2 sidebar.
 * The canonical navigation registry lives in config/sidebarNavigation.ts.
 */

import {
  allNavItems,
  allToolsGroups as canonicalToolGroups,
  DEFAULT_VISIBLE_IDS,
  type NavGroup,
  type NavItem,
} from '@/config/sidebarNavigation';

export type { NavGroup, NavItem };
export { allNavItems };

const compatibilityGroupLabels: Record<string, string> = {
  'إدارة الحجوزات': 'تشغيل المرضى والحجوزات',
  'إدارة المحتوى': 'المحتوى والنشر',
  'التقارير والتحليلات': 'القياس والتقارير',
  'الإدارة العامة': 'الإدارة والنظام',
};

export const allToolsGroups: NavGroup[] = canonicalToolGroups.map((group) => ({
  ...group,
  label: compatibilityGroupLabels[group.label] ?? group.label,
  items:
    group.label === 'التواصل'
      ? [...group.items].sort((first, second) => {
          if (first.id === 'messages') {
            return -1;
          }
          if (second.id === 'messages') {
            return 1;
          }
          return 0;
        })
      : group.items,
}));

const findNavItem = (id: string): NavItem => {
  const item = allNavItems.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Missing canonical navigation item: ${id}`);
  }
  return item;
};

export const bottomNavItems: NavItem[] = [
  { ...findNavItem('home'), title: 'الرئيسية' },
  { ...findNavItem('leads'), title: 'العملاء' },
  { ...findNavItem('appointments'), title: 'المواعيد' },
  { ...findNavItem('reports'), title: 'التقارير' },
];

export const defaultVisibleItemIds: string[] = Array.from(
  new Set([...DEFAULT_VISIBLE_IDS, 'publishing', 'media-library'])
);
