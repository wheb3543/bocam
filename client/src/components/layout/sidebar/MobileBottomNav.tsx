/**
 * Mobile Bottom Navigation Component
 * مكون الشريط السفلي للهاتف
 */

import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import type { NavItem } from '../sidebarData';
import SidebarBadge from './SidebarBadge';

interface MobileBottomNavProps {
  bottomNavItems: NavItem[];
  isItemActive: (href: string) => boolean;
  getBadgeCount: (itemId: string) => number;
  handleNavClick: (href: string) => void;
  onMoreClick: () => void;
}

export default function MobileBottomNav({
  bottomNavItems,
  isItemActive,
  getBadgeCount,
  handleNavClick,
  onMoreClick,
}: MobileBottomNavProps) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-border dark:border-gray-700 z-40 safe-area-inset-bottom"
      dir="rtl"
    >
      <div className="h-full flex items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          const badgeCount = getBadgeCount(item.id);

          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-muted-foreground dark:text-gray-400'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-6 w-6', isActive && 'stroke-[2.5]')} />
                <SidebarBadge count={badgeCount} />
                {!badgeCount && item.hasDot && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] truncate max-w-[60px]',
                  isActive ? 'font-semibold' : 'font-medium'
                )}
              >
                {item.title}
              </span>
            </button>
          );
        })}

        {/* زر المزيد */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-muted-foreground dark:text-gray-400 min-w-[60px]"
        >
          <MoreHorizontal className="h-6 w-6" />
          <span className="text-[10px] font-medium">المزيد</span>
        </button>
      </div>
    </nav>
  );
}
