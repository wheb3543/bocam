/**
 * Desktop Sidebar Component - Option (A) Modern Hybrid Double-tier Sidebar
 * مكون الشريط الجانبي الهجين المزدوج للسطح
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings as SettingsIcon,
  Menu,
  Pencil,
  HelpCircle,
  Bell,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  X,
  Home,
  Calendar,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';
import InstallPWAButton from '@/components/InstallPWAButton';
import { canonicalToolsGroups, type NavGroup, type NavItem } from '../sidebarData';
import SidebarBadge from './SidebarBadge';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { APP_LOGO, COMPANY_ARABIC_NAME } from '@/const';

interface DesktopSidebarProps {
  shouldShowText: boolean;
  primaryNavItems?: NavItem[];
  toolsGroups?: NavGroup[];
  isItemActive: (href: string) => boolean;
  getBadgeCount: (itemId: string) => number;
  handleNavClick: (href: string) => void;
  onToggleExpand?: () => void;
  handleMouseEnter?: () => void;
  handleMouseLeave?: () => void;
  onAllToolsClick: () => void;
  onEditClick: () => void;
  allToolsOpen: boolean;
}

const STORAGE_OPEN_GROUPS_KEY = 'bocam_sidebar_open_groups';

// Quick access pinned favorites
const quickAccessConfig = [
  { id: 'home', title: 'الرئيسية', href: '/system/dashboard', icon: Home },
  { id: 'appointments', title: 'المواعيد', href: '/admin/bookings/appointments', icon: Calendar },
  {
    id: 'messages',
    title: 'المحادثات',
    href: '/admin/communications/messages',
    icon: MessageSquare,
  },
  { id: 'tasks', title: 'المهام', href: '/admin/bookings/tasks', icon: CheckSquare },
];

export default function DesktopSidebar({
  shouldShowText,
  toolsGroups = canonicalToolsGroups,
  isItemActive,
  getBadgeCount,
  handleNavClick,
  onToggleExpand,
  onAllToolsClick,
  onEditClick,
  allToolsOpen,
}: DesktopSidebarProps) {
  const { can, isLoading: arePermissionsLoading } = useRolePermissions();
  const canViewNotifications = can('notifications.view');
  const { data: unreadCount } = useUnreadCount(canViewNotifications);

  // Live filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion open/close state with localStorage persistence
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_OPEN_GROUPS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    // Default open groups
    return {
      'إدارة الحجوزات': true,
      التواصل: true,
    };
  });

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem(STORAGE_OPEN_GROUPS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Auto-expand the group that contains the current active route
  useEffect(() => {
    const activeGroup = toolsGroups.find((group) =>
      group.items.some((item) => isItemActive(item.href))
    );
    if (activeGroup && !openGroups[activeGroup.label]) {
      setOpenGroups((prev) => {
        const next = { ...prev, [activeGroup.label]: true };
        try {
          localStorage.setItem(STORAGE_OPEN_GROUPS_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [toolsGroups, isItemActive, openGroups]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }
    const results: { item: NavItem; groupLabel: string }[] = [];
    for (const group of toolsGroups) {
      for (const item of group.items) {
        if (item.title.toLowerCase().includes(query)) {
          results.push({ item, groupLabel: group.label });
        }
      }
    }
    return results;
  }, [searchQuery, toolsGroups]);

  // Permitted Quick Access items
  const permittedQuickItems = useMemo(() => {
    const allowedHrefs = new Set(
      toolsGroups
        .flatMap((g) => g.items.map((i) => i.href))
        .concat(['/system/dashboard', '/system'])
    );
    return quickAccessConfig.filter((item) => allowedHrefs.has(item.href));
  }, [toolsGroups]);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-gray-900 border-l border-border dark:border-gray-700 z-30 transition-all duration-300 ease-in-out select-none',
        shouldShowText ? 'w-64' : 'w-[72px]'
      )}
      dir="rtl"
    >
      {/* Brand Header: Logo + Hospital Name + Toggle Button */}
      <div
        className={cn(
          'flex items-center py-3 border-b border-gray-100 dark:border-gray-700 transition-all duration-200 shrink-0',
          shouldShowText ? 'justify-between px-3' : 'flex-col gap-2 px-2'
        )}
      >
        <button
          type="button"
          onClick={() => handleNavClick('/system')}
          className="flex items-center gap-2.5 min-w-0 text-right focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
          title="شاشة النظام الرئيسية"
        >
          <img
            src={APP_LOGO}
            alt={COMPANY_ARABIC_NAME}
            className="h-8 w-8 object-contain flex-shrink-0"
          />
          {shouldShowText && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                {COMPANY_ARABIC_NAME}
              </h2>
              <p className="text-xs text-muted-foreground dark:text-gray-400 truncate">
                نظام بوكام
              </p>
            </div>
          )}
        </button>

        {onToggleExpand && (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggleExpand}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/40 cursor-pointer"
                aria-label={shouldShowText ? 'طي القائمة الجانبية' : 'توسيع القائمة الجانبية'}
              >
                {shouldShowText ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {shouldShowText ? 'طي القائمة الجانبية' : 'توسيع القائمة الجانبية'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Quick Access / Pinned Favorites */}
      {shouldShowText ? (
        <div className="px-3 pt-2.5 pb-1 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-muted-foreground/80 dark:text-gray-400">
              الوصول السريع
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {permittedQuickItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              const badge = getBadgeCount(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'relative flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-150 text-right cursor-pointer border',
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/60 font-semibold shadow-xs'
                      : 'bg-gray-50/70 dark:bg-gray-800/40 text-foreground dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:bg-muted/80 dark:hover:bg-gray-800'
                  )}
                  title={item.title}
                >
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5 shrink-0',
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 stroke-[2.5]'
                        : 'text-muted-foreground'
                    )}
                  />
                  <span className="truncate flex-1">{item.title}</span>
                  {badge > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-2 px-2 border-b border-gray-100 dark:border-gray-800 flex flex-col items-center gap-1 shrink-0">
          {permittedQuickItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);
            const badge = getBadgeCount(item.id);
            return (
              <Tooltip key={item.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      'relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                        : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                    aria-label={item.title}
                  >
                    <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                    <SidebarBadge count={badge} />
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">{item.title}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}

      {/* Live Search & Filter Bar (Expanded mode only) */}
      {shouldShowText && (
        <div className="px-3 pt-2 pb-1 shrink-0">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث سريع في الصفحات..."
              className="w-full h-8 pr-8 pl-7 text-xs bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-muted-foreground/60 transition-all text-right"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                title="مسح البحث"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Groups Container */}
      <ScrollArea className="flex-1 min-h-0 py-1.5 custom-scrollbar">
        {shouldShowText ? (
          /* ======================================================== */
          /* Expanded Mode: Accordions or Search Results              */
          /* ======================================================== */
          <nav className="flex flex-col gap-1 px-2">
            {searchQuery.trim() ? (
              /* Search results */
              <div className="space-y-1 py-1">
                <div className="px-2 pb-1 text-[11px] font-semibold text-muted-foreground">
                  نتائج البحث ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    لا توجد صفحات مطابقة لـ &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchResults.map(({ item, groupLabel }) => {
                    const ItemIcon = item.icon;
                    const isActive = isItemActive(item.href);
                    const badge = getBadgeCount(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleNavClick(item.href);
                          setSearchQuery('');
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all text-right cursor-pointer',
                          isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                            : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {badge > 0 && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full">
                              {badge}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            {groupLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              /* 8 Accordion Groups */
              toolsGroups.map((group) => {
                const GroupIcon = group.icon;
                const isOpen = Boolean(openGroups[group.label]);
                const hasActiveChild = group.items.some((item) => isItemActive(item.href));
                const totalGroupBadge = group.items.reduce(
                  (acc, item) => acc + getBadgeCount(item.id),
                  0
                );

                return (
                  <div key={group.label} className="mb-0.5">
                    {/* Group Header Button */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.label)}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all duration-150 text-right cursor-pointer group',
                        hasActiveChild
                          ? 'bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-muted/50 dark:hover:bg-gray-800'
                      )}
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GroupIcon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            hasActiveChild
                              ? 'text-blue-600 dark:text-blue-400 stroke-[2.5]'
                              : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        <span className="text-xs font-bold truncate">{group.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {totalGroupBadge > 0 && (
                          <span className="h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {totalGroupBadge > 9 ? '9+' : totalGroupBadge}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/60 px-1 py-0.5 rounded">
                          {group.items.length}
                        </span>
                        <ChevronDown
                          className={cn(
                            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
                            isOpen && 'rotate-180 text-foreground'
                          )}
                        />
                      </div>
                    </button>

                    {/* Sub-items Container */}
                    {isOpen && (
                      <div className="mt-0.5 mr-3 pr-2.5 border-r border-gray-200/60 dark:border-gray-800 space-y-0.5 transition-all duration-200">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = isItemActive(item.href);
                          const badge = getBadgeCount(item.id);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleNavClick(item.href)}
                              className={cn(
                                'relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 text-right cursor-pointer',
                                isActive
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                                  : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <ItemIcon
                                  className={cn(
                                    'h-3.5 w-3.5 shrink-0',
                                    isActive
                                      ? 'text-blue-600 dark:text-blue-400 stroke-[2.5]'
                                      : 'text-muted-foreground'
                                  )}
                                />
                                <span className="truncate">{item.title}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {badge > 0 && (
                                  <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full">
                                    {badge}
                                  </span>
                                )}
                                {!badge && item.hasDot && (
                                  <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                                )}
                              </div>
                              {/* Active indicator bar */}
                              {isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-l-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* كل الأدوات و تعديل - أسفل المجموعات */}
            <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2">
              {/* كل الأدوات */}
              <button
                type="button"
                onClick={onAllToolsClick}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 mb-1 cursor-pointer',
                  allToolsOpen
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <Menu className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium truncate flex-1 text-right">كل الأدوات</span>
              </button>

              {/* تعديل */}
              <button
                type="button"
                onClick={onEditClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
              >
                <Pencil className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium truncate flex-1 text-right">تعديل الشريط</span>
              </button>
            </div>
          </nav>
        ) : (
          /* ======================================================== */
          /* Collapsed Mode (72px): Group Icons with Hover Flyout    */
          /* ======================================================== */
          <nav className="flex flex-col items-center gap-1.5 px-2 py-1">
            {toolsGroups.map((group) => {
              const GroupIcon = group.icon;
              const hasActiveChild = group.items.some((item) => isItemActive(item.href));
              const totalGroupBadge = group.items.reduce(
                (acc, item) => acc + getBadgeCount(item.id),
                0
              );

              return (
                <HoverCard key={group.label} openDelay={100} closeDelay={150}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        if (group.items[0]) {
                          handleNavClick(group.items[0].href);
                        }
                      }}
                      className={cn(
                        'relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer',
                        hasActiveChild
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold shadow-xs'
                          : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                      )}
                      aria-label={group.label}
                    >
                      <GroupIcon
                        className={cn(
                          'h-5 w-5 transition-transform duration-150 hover:scale-110',
                          hasActiveChild && 'stroke-[2.5]'
                        )}
                      />
                      {totalGroupBadge > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                          {totalGroupBadge > 9 ? '9+' : totalGroupBadge}
                        </span>
                      )}
                      {hasActiveChild && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full" />
                      )}
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="left"
                    align="start"
                    sideOffset={10}
                    className="w-64 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl z-50 animate-in fade-in-0 zoom-in-95"
                    dir="rtl"
                  >
                    {/* Flyout Header */}
                    <div className="flex items-center justify-between px-2.5 py-2 border-b border-gray-100 dark:border-gray-800 mb-1.5 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <GroupIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                          {group.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-gray-200/60 dark:bg-gray-700/60 px-1.5 py-0.5 rounded shrink-0">
                        {group.items.length} عناصر
                      </span>
                    </div>
                    {/* Flyout Sub-items */}
                    <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = isItemActive(item.href);
                        const badge = getBadgeCount(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavClick(item.href)}
                            className={cn(
                              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-right cursor-pointer',
                              isActive
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                                : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ItemIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="truncate">{item.title}</span>
                            </div>
                            {badge > 0 && (
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full">
                                {badge}
                              </span>
                            )}
                            {!badge && item.hasDot && (
                              <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}

            {/* كل الأدوات و تعديل في الوضع المطوي */}
            <div className="border-t border-gray-100 dark:border-gray-700 my-1 pt-1.5 w-full flex flex-col items-center gap-1">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onAllToolsClick}
                    className={cn(
                      'w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer',
                      allToolsOpen
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                    aria-label="كل الأدوات"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">كل الأدوات</TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                    aria-label="تعديل الشريط"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">تعديل الشريط</TooltipContent>
              </Tooltip>
            </div>
          </nav>
        )}
      </ScrollArea>

      {/* Bottom Actions: Notifications, Settings, PWA, Help */}
      <div className="flex flex-col gap-1 px-2 py-2 border-t border-gray-100 dark:border-gray-700 shrink-0">
        {/* Notifications */}
        {!arePermissionsLoading && canViewNotifications ? (
          <Tooltip delayDuration={shouldShowText ? 999999 : 300}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  handleNavClick('/admin/notifications');
                }}
                className={cn(
                  'w-full flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                  shouldShowText ? 'px-3' : 'px-0 justify-center',
                  isItemActive('/admin/notifications')
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
                aria-label="الإشعارات"
              >
                <div className="relative flex-shrink-0">
                  <Bell
                    className={cn(
                      'flex-shrink-0 transition-all duration-200',
                      shouldShowText ? 'h-4 w-4' : 'h-5 w-5'
                    )}
                  />
                  {(unreadCount ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                      {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {shouldShowText && (
                  <span className="text-xs font-medium truncate flex-1 text-right">الإشعارات</span>
                )}
              </button>
            </TooltipTrigger>
            {!shouldShowText && <TooltipContent side="left">الإشعارات</TooltipContent>}
          </Tooltip>
        ) : null}

        {/* Settings */}
        <Tooltip delayDuration={shouldShowText ? 999999 : 300}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => handleNavClick('/admin/settings')}
              className={cn(
                'w-full flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                shouldShowText ? 'px-3' : 'px-0 justify-center',
                isItemActive('/admin/settings')
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
              aria-label="الإعدادات"
            >
              <SettingsIcon
                className={cn(
                  'flex-shrink-0 transition-all duration-200',
                  shouldShowText ? 'h-4 w-4' : 'h-5 w-5'
                )}
              />
              {shouldShowText && (
                <span className="text-xs font-medium truncate flex-1 text-right">الإعدادات</span>
              )}
            </button>
          </TooltipTrigger>
          {!shouldShowText && <TooltipContent side="left">الإعدادات</TooltipContent>}
        </Tooltip>

        {/* Install PWA Button */}
        {shouldShowText && <InstallPWAButton appType="admin" variant="sidebar" />}

        {/* Help */}
        <Tooltip delayDuration={shouldShowText ? 999999 : 300}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => handleNavClick('/admin/support')}
              className={cn(
                'w-full flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                shouldShowText ? 'px-3' : 'px-0 justify-center',
                isItemActive('/admin/support')
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
              aria-label="المساعدة والدعم"
            >
              <HelpCircle
                className={cn(
                  'flex-shrink-0 transition-all duration-200',
                  shouldShowText ? 'h-4 w-4' : 'h-5 w-5'
                )}
              />
              {shouldShowText && (
                <span className="text-xs font-medium truncate flex-1 text-right">
                  المساعدة والدعم
                </span>
              )}
            </button>
          </TooltipTrigger>
          {!shouldShowText && <TooltipContent side="left">المساعدة والدعم</TooltipContent>}
        </Tooltip>
      </div>
    </aside>
  );
}
