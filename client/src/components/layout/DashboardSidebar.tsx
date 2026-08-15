import { useLocation } from 'wouter';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationSound } from '@/hooks/integrations/useNotificationSound';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useRef, useCallback } from 'react';
import { APP_LOGO, COMPANY_ARABIC_NAME } from '@/const';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { useSidebarNavigation } from '@/hooks/layout/useSidebarNavigation';
import SidebarBadge from '@/components/layout/SidebarBadge';
import SortableEditItem from '@/components/layout/SortableEditItem';
import type { NavItem } from '@/config/sidebarNavigation';
import {
  Menu,
  X,
  Search,
  GripVertical,
  Check,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ChevronDown,
  Settings as SettingsIcon,
} from 'lucide-react';

interface DashboardSidebarProps {
  currentPath: string;
}

export default function DashboardSidebar({ currentPath }: DashboardSidebarProps) {
  const [, setLocation] = useLocation();
  const allToolsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sidebarNav = useSidebarNavigation(currentPath);

  const { soundEnabled, toggleSound } = useNotificationSound();
  const { theme, toggleTheme } = useTheme();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sidebarNav.editMode) {
          sidebarNav.setEditMode(false);
        } else if (sidebarNav.allToolsOpen) {
          sidebarNav.setAllToolsOpen(false);
        } else {
          sidebarNav.setMobileOpen(false);
        }
      }
    };
    if (sidebarNav.mobileOpen || sidebarNav.allToolsOpen || sidebarNav.editMode) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sidebarNav.mobileOpen, sidebarNav.allToolsOpen, sidebarNav.editMode, sidebarNav]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarNav.mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarNav.mobileOpen]);

  // Focus search input when all tools panel opens
  useEffect(() => {
    if (sidebarNav.allToolsOpen && searchInputRef.current && !sidebarNav.editMode) {
      setTimeout(() => searchInputRef.current?.focus(), 200);
    } else if (!sidebarNav.allToolsOpen) {
      sidebarNav.setSearchQuery('');
      sidebarNav.setEditMode(false);
    }
  }, [sidebarNav.allToolsOpen, sidebarNav.editMode, sidebarNav]);

  const isItemActive = useCallback(
    (href: string) => {
      if (href === '/admin') {
        return currentPath === '/admin';
      }
      return currentPath === href || currentPath.startsWith(href + '/');
    },
    [currentPath]
  );

  const handleNavClick = useCallback(
    (href: string) => {
      setLocation(href);
      sidebarNav.setMobileOpen(false);
      sidebarNav.setAllToolsOpen(false);
      sidebarNav.setEditMode(false);
    },
    [setLocation, sidebarNav]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      sidebarNav.setEditingItemIds((prev: string[]) => {
        const activeId = active.id as string;
        const overId = over.id as string;

        const oldIndex = prev.indexOf(activeId);
        const newIndex = prev.indexOf(overId);

        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }
        if (activeId === 'home' || (newIndex === 0 && prev[0] === 'home')) {
          if (activeId === 'home') {
            return prev;
          }
          if (newIndex === 0) {
            const withoutActive = prev.filter((id: string) => id !== activeId);
            withoutActive.splice(1, 0, activeId);
            return withoutActive;
          }
        }
        return arrayMove(prev, oldIndex, newIndex);
      });
    },
    [sidebarNav]
  );

  // ============================================
  // الشريط الضيق الرئيسي (Desktop) - بأسلوب Meta
  // ============================================
  const renderDesktopSlimSidebar = () => (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-[60px] bg-white dark:bg-card dark:bg-gray-900 border-l border-border dark:border-gray-700 z-30">
      {/* Logo */}
      <div className="flex items-center justify-center py-2 border-b border-gray-100 dark:border-gray-700">
        <img src={APP_LOGO} alt={COMPANY_ARABIC_NAME} className="h-8 w-8 object-contain" />
      </div>

      {/* Primary Nav Items */}
      <ScrollArea className="flex-1 py-0.5">
        <nav className="flex flex-col items-center gap-0 px-1">
          {sidebarNav.primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      'relative w-full flex flex-col items-center gap-0 py-1.5 px-0.5 rounded-md transition-all duration-150 group',
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-muted-foreground dark:hover:bg-gray-800 dark:hover:text-gray-300'
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.5]')} />
                      <SidebarBadge count={sidebarNav.getBadgeCount(item.id)} />
                      {!sidebarNav.getBadgeCount(item.id) && item.hasDot && (
                        <span className="absolute -top-0.5 -left-0.5 h-1.5 w-1.5 bg-red-500 rounded-full dot-pulse" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-[8px] leading-tight text-center max-w-full truncate mt-0.5',
                        isActive ? 'font-bold' : 'font-medium'
                      )}
                    >
                      {item.title}
                    </span>
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 bg-blue-600 rounded-l-full" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="font-medium text-xs">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-0 px-1 py-1 border-t border-gray-100 dark:border-gray-700">
        {/* All Tools Button */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => sidebarNav.setAllToolsOpen(!sidebarNav.allToolsOpen)}
              className={cn(
                'w-full flex flex-col items-center gap-0 py-1.5 px-0.5 rounded-md transition-all duration-150',
                sidebarNav.allToolsOpen
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-muted-foreground dark:hover:bg-gray-800 dark:hover:text-gray-300'
              )}
            >
              <Menu className="h-[18px] w-[18px]" />
              <span className="text-[8px] font-medium mt-0.5">كل الأدوات</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            كل الأدوات
          </TooltipContent>
        </Tooltip>

        {/* Notification Sound Toggle */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={toggleSound}
              className={cn(
                'w-full flex flex-col items-center gap-0 py-1.5 px-0.5 rounded-md transition-all duration-150',
                soundEnabled
                  ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground dark:text-muted-foreground dark:hover:bg-gray-800 dark:hover:text-muted-foreground'
              )}
            >
              {soundEnabled ? (
                <Volume2 className="h-[18px] w-[18px]" />
              ) : (
                <VolumeX className="h-[18px] w-[18px]" />
              )}
              <span className="text-[8px] font-medium mt-0.5">
                {soundEnabled ? 'التنبيه' : 'صامت'}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            {soundEnabled ? 'إيقاف صوت التنبيه' : 'تفعيل صوت التنبيه'}
          </TooltipContent>
        </Tooltip>

        {/* Dark Mode Toggle */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={toggleTheme}
              className={cn(
                'w-full flex flex-col items-center gap-0 py-1.5 px-0.5 rounded-md transition-all duration-150',
                theme === 'dark'
                  ? 'text-amber-400 hover:bg-amber-50/10'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-gray-800'
              )}
            >
              {theme === 'dark' ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
              <span className="text-[8px] font-medium mt-0.5">
                {theme === 'dark' ? 'مضيء' : 'مظلم'}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            {theme === 'dark' ? 'التبديل إلى الوضع المضيء' : 'التبديل إلى الوضع المظلم'}
          </TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleNavClick('/admin/settings')}
              className={cn(
                'w-full flex flex-col items-center gap-0 py-1.5 px-0.5 rounded-md transition-all duration-150',
                isItemActive('/admin/settings')
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-muted-foreground dark:hover:bg-gray-800 dark:hover:text-gray-300'
              )}
            >
              <SettingsIcon className="h-[18px] w-[18px]" />
              <span className="text-[8px] font-medium mt-0.5">الإعدادات</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            الإعدادات
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );

  // ============================================
  // لوحة "كل الأدوات" الموسعة (Desktop)
  // ============================================
  const renderAllToolsPanel = () => (
    <>
      {/* Backdrop */}
      {sidebarNav.allToolsOpen && (
        <div
          className="hidden lg:block fixed inset-0 z-40 bg-black/20"
          onClick={() => {
            sidebarNav.setAllToolsOpen(false);
            sidebarNav.setEditMode(false);
          }}
        />
      )}

      {/* Panel */}
      <div
        ref={allToolsRef}
        className={cn(
          'hidden lg:flex fixed top-0 right-[60px] z-50 h-screen w-[320px] bg-white dark:bg-card dark:bg-gray-900 border-l border-border dark:border-gray-700 shadow-xl flex-col transition-transform duration-300 ease-out',
          sidebarNav.allToolsOpen
            ? 'translate-x-0'
            : 'translate-x-full opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-foreground dark:text-gray-100">كل الأدوات</h2>
          <button
            onClick={() => {
              sidebarNav.setAllToolsOpen(false);
              sidebarNav.setEditMode(false);
            }}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted dark:hover:bg-gray-800 text-muted-foreground dark:text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search (hidden in edit mode) */}
        {!sidebarNav.editMode && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث في كل الأدوات..."
                value={sidebarNav.searchQuery}
                onChange={(e) => sidebarNav.setSearchQuery(e.target.value)}
                className="w-full h-9 pr-9 pl-3 rounded-full bg-muted dark:bg-gray-800 border-0 text-sm text-foreground dark:text-gray-300 placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white dark:bg-card dark:focus:bg-gray-700 transition-all"
              />
            </div>
          </div>
        )}

        {/* Edit Mode Header */}
        {sidebarNav.editMode && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground dark:text-gray-300">
                تعديل الشريط الجانبي
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={sidebarNav.cancelEditMode}
                  className="text-xs px-3 py-1.5 rounded-md text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-gray-800 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={sidebarNav.saveVisibleItems}
                  className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  حفظ
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              اختر العناصر واسحبها لإعادة ترتيبها في الشريط الجانبي
            </p>
          </div>
        )}

        {/* Tools List / Edit List */}
        <ScrollArea className="flex-1">
          {sidebarNav.editMode ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="py-2 px-3">
                {sidebarNav.editingItemIds.length > 0 && (
                  <>
                    <div className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1 flex items-center gap-1">
                      <GripVertical className="h-3 w-3" />
                      معروض في الشريط — اسحب لإعادة الترتيب
                    </div>
                    <SortableContext
                      items={sidebarNav.editingItemIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {sidebarNav.editingItemIds
                        .map((id) => sidebarNav.primaryNavItems.find((item) => item.id === id))
                        .filter((item): item is NavItem => item !== undefined)
                        .map((item) => (
                          <SortableEditItem
                            key={item.id}
                            item={item}
                            isChecked={true}
                            isHome={item.id === 'home'}
                            onToggle={sidebarNav.toggleItemVisibility}
                          />
                        ))}
                    </SortableContext>
                  </>
                )}

                <div className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1 mt-3">
                  متاح للإضافة
                </div>
                {sidebarNav.primaryNavItems
                  .filter((item) => !sidebarNav.editingItemIds.includes(item.id))
                  .map((item) => (
                    <SortableEditItem
                      key={item.id}
                      item={item}
                      isChecked={false}
                      isHome={item.id === 'home'}
                      onToggle={sidebarNav.toggleItemVisibility}
                    />
                  ))}
              </div>
            </DndContext>
          ) : (
            <div className="py-2">
              {sidebarNav.searchedToolsGroups.map((group) => (
                <div key={group.label} className="mb-4">
                  <button
                    onClick={() => sidebarNav.toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-foreground dark:text-gray-300 hover:bg-muted dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <group.icon className="h-4 w-4" />
                      {group.label}
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        sidebarNav.expandedGroups[group.label] ? 'rotate-180' : ''
                      )}
                    />
                  </button>
                  {sidebarNav.expandedGroups[group.label] && (
                    <div className="mt-1 space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item.href);
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.href)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                              isActive
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-muted-foreground hover:bg-muted dark:hover:bg-gray-800'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Edit Mode Toggle */}
        {!sidebarNav.editMode && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={sidebarNav.startEditMode}
              className="w-full text-xs px-3 py-2 rounded-md text-muted-foreground hover:bg-muted dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <GripVertical className="h-3 w-3" />
              تخصيص الشريط الجانبي
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {renderDesktopSlimSidebar()}
      {renderAllToolsPanel()}
    </>
  );
}
