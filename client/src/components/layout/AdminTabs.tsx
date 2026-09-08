import { X } from 'lucide-react';
import { useLocation } from 'wouter';
import type { AdminTab } from '@/hooks/layout/useAdminTabs';
import { cn } from '@/lib/utils';

interface AdminTabsProps {
  tabs: AdminTab[];
  activeTabId: string | null;
  onClose: (tab: AdminTab) => void;
}

export default function AdminTabs({ tabs, activeTabId, onClose }: AdminTabsProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="border-b border-border/80 bg-card/80" dir="rtl">
      <div className="mx-auto flex max-w-[1800px] items-end gap-1 overflow-x-auto px-4 pt-2 lg:px-6">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              className={cn(
                'group flex min-w-[9rem] max-w-[15rem] shrink-0 items-center gap-2 rounded-t-lg border border-b-0 px-3 py-2 text-sm transition-colors',
                active
                  ? 'border-border bg-background font-semibold text-foreground'
                  : 'border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              <button
                type="button"
                onClick={() => setLocation(tab.href)}
                className="min-w-0 flex-1 truncate text-right"
                aria-current={active ? 'page' : undefined}
              >
                {tab.title}
              </button>
              {tab.id !== 'home' ? (
                <button
                  type="button"
                  onClick={() => onClose(tab)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-70 hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  aria-label={`إغلاق تبويب ${tab.title}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
