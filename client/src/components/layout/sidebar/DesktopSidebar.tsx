/**
 * Desktop Sidebar Component
 * مكون الشريط الجانبي للسطح
 */

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings as SettingsIcon, Menu, Pencil, HelpCircle } from 'lucide-react';
import InstallPWAButton from '@/components/InstallPWAButton';
import type { NavItem } from '../sidebarData';
import SidebarBadge from './SidebarBadge';

interface DesktopSidebarProps {
  shouldShowText: boolean;
  primaryNavItems: NavItem[];
  isItemActive: (href: string) => boolean;
  getBadgeCount: (itemId: string) => number;
  handleNavClick: (href: string) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  onAllToolsClick: () => void;
  onEditClick: () => void;
  allToolsOpen: boolean;
}

export default function DesktopSidebar({
  shouldShowText,
  primaryNavItems,
  isItemActive,
  getBadgeCount,
  handleNavClick,
  handleMouseEnter,
  handleMouseLeave,
  onAllToolsClick,
  onEditClick,
  allToolsOpen,
}: DesktopSidebarProps) {
  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-gray-900 border-l border-border dark:border-gray-700 z-30 transition-all duration-300 ease-in-out',
        shouldShowText ? 'w-64' : 'w-[72px]'
      )}
      dir="rtl"
    >
      {/* Logo + Hospital Name */}
      <div className="flex items-center gap-3 py-3 px-3 border-b border-gray-100 dark:border-gray-700">
        <img
          src="/icon-72x72.png"
          alt="المستشفى السعودي الألماني"
          className="h-10 w-10 object-contain flex-shrink-0"
        />
        {shouldShowText && (
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-foreground dark:text-gray-100 truncate">
              المستشفى السعودي الألماني
            </h2>
            <p className="text-xs text-muted-foreground dark:text-gray-400 truncate">صنعاء</p>
          </div>
        )}
      </div>

      {/* Primary Nav Items */}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);
            const badgeCount = getBadgeCount(item.id);

            return (
              <Tooltip key={item.href} delayDuration={shouldShowText ? 999999 : 300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      'relative w-full flex items-center gap-3 py-3 rounded-lg transition-all duration-200',
                      shouldShowText ? 'px-3' : 'px-0 justify-center',
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon
                        className={cn(
                          'transition-all duration-200',
                          shouldShowText ? 'h-5 w-5' : 'h-6 w-6',
                          isActive && 'stroke-[2.5]'
                        )}
                      />
                      <SidebarBadge count={badgeCount} />
                      {!badgeCount && item.hasDot && (
                        <span className="absolute -top-0.5 -left-0.5 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    {shouldShowText && (
                      <span
                        className={cn(
                          'text-sm truncate flex-1 text-right transition-opacity duration-200',
                          isActive ? 'font-semibold' : 'font-medium'
                        )}
                      >
                        {item.title}
                      </span>
                    )}
                    {shouldShowText && badgeCount > 0 && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full flex-shrink-0">
                        {badgeCount}
                      </span>
                    )}
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full" />
                    )}
                  </button>
                </TooltipTrigger>
                {!shouldShowText && (
                  <TooltipContent side="left" className="font-medium">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {/* كل الأدوات و تعديل - أسفل العناصر مباشرة */}
          <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2">
            {/* كل الأدوات */}
            <Tooltip delayDuration={shouldShowText ? 999999 : 300}>
              <TooltipTrigger asChild>
                <button
                  onClick={onAllToolsClick}
                  className={cn(
                    'w-full flex items-center gap-3 py-3 rounded-lg transition-all duration-200 mb-1',
                    shouldShowText ? 'px-3' : 'px-0 justify-center',
                    allToolsOpen
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <Menu
                    className={cn(
                      'flex-shrink-0 transition-all duration-200',
                      shouldShowText ? 'h-5 w-5' : 'h-6 w-6'
                    )}
                  />
                  {shouldShowText && (
                    <span className="text-sm font-medium truncate flex-1 text-right">
                      كل الأدوات
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {!shouldShowText && <TooltipContent side="left">كل الأدوات</TooltipContent>}
            </Tooltip>

            {/* تعديل */}
            <Tooltip delayDuration={shouldShowText ? 999999 : 300}>
              <TooltipTrigger asChild>
                <button
                  onClick={onEditClick}
                  className={cn(
                    'w-full flex items-center gap-3 py-3 rounded-lg transition-all duration-200',
                    shouldShowText ? 'px-3' : 'px-0 justify-center',
                    'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <Pencil
                    className={cn(
                      'flex-shrink-0 transition-all duration-200',
                      shouldShowText ? 'h-5 w-5' : 'h-6 w-6'
                    )}
                  />
                  {shouldShowText && (
                    <span className="text-sm font-medium truncate flex-1 text-right">تعديل</span>
                  )}
                </button>
              </TooltipTrigger>
              {!shouldShowText && <TooltipContent side="left">تعديل الشريط</TooltipContent>}
            </Tooltip>
          </div>
        </nav>
      </ScrollArea>

      {/* Bottom Actions - الإعدادات والمساعدة */}
      <div className="flex flex-col gap-1 px-2 py-2 border-t border-gray-100 dark:border-gray-700">
        {/* الإعدادات */}
        <Tooltip delayDuration={shouldShowText ? 999999 : 300}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleNavClick('/admin/settings')}
              className={cn(
                'w-full flex items-center gap-3 py-3 rounded-lg transition-all duration-200',
                shouldShowText ? 'px-3' : 'px-0 justify-center',
                isItemActive('/admin/settings')
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <SettingsIcon
                className={cn(
                  'flex-shrink-0 transition-all duration-200',
                  shouldShowText ? 'h-5 w-5' : 'h-6 w-6'
                )}
              />
              {shouldShowText && (
                <span className="text-sm font-medium truncate flex-1 text-right">الإعدادات</span>
              )}
            </button>
          </TooltipTrigger>
          {!shouldShowText && <TooltipContent side="left">الإعدادات</TooltipContent>}
        </Tooltip>

        {/* زر تثبيت التطبيق */}
        {shouldShowText && <InstallPWAButton appType="admin" variant="sidebar" />}

        {/* المساعدة */}
        <Tooltip delayDuration={shouldShowText ? 999999 : 300}>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                /* TODO: فتح المساعدة */
              }}
              className={cn(
                'w-full flex items-center gap-3 py-3 rounded-lg transition-all duration-200',
                shouldShowText ? 'px-3' : 'px-0 justify-center',
                'text-foreground hover:bg-muted/50 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <HelpCircle
                className={cn(
                  'flex-shrink-0 transition-all duration-200',
                  shouldShowText ? 'h-5 w-5' : 'h-6 w-6'
                )}
              />
              {shouldShowText && (
                <span className="text-sm font-medium truncate flex-1 text-right">المساعدة</span>
              )}
            </button>
          </TooltipTrigger>
          {!shouldShowText && <TooltipContent side="left">المساعدة</TooltipContent>}
        </Tooltip>
      </div>
    </aside>
  );
}
