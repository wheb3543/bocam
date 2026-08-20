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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_18px_-14px_rgba(15,23,42,0.45)]"
      dir="rtl"
    >
      <div className="flex h-[4.5rem] items-center justify-around gap-1 px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          const badgeCount = getBadgeCount(item.id);

          return (
            <button
              type="button"
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={
                badgeCount > 0
                  ? `${item.title}، ${badgeCount > 9 ? 'أكثر من 9' : badgeCount} إشعارات غير مقروءة`
                  : item.title
              }
              className={cn(
                'flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/70'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-6 w-6', isActive && 'stroke-[2.5]')} />
                <SidebarBadge count={badgeCount} />
                {!badgeCount && item.hasDot && (
                  <span
                    className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 motion-safe:animate-pulse"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span
                className={cn(
                  'max-w-full truncate text-xs leading-none',
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
          type="button"
          onClick={onMoreClick}
          aria-label="المزيد من الأدوات"
          className="flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs leading-none text-muted-foreground transition-colors duration-200 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <MoreHorizontal className="h-6 w-6" />
          <span className="font-medium">المزيد</span>
        </button>
      </div>
    </nav>
  );
}
