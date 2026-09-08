import { ChevronLeft } from 'lucide-react';
import type { AdminNavigationSubsection } from '@/config/adminNavigation';
import type { NavItem } from '@/config/sidebarNavigation';
import { cn } from '@/lib/utils';

interface AdminPageMenuProps {
  subsection: AdminNavigationSubsection;
  onNavigate: (item: NavItem) => void;
  isItemActive: (href: string) => boolean;
}

export default function AdminPageMenu({
  subsection,
  onNavigate,
  isItemActive,
}: AdminPageMenuProps) {
  return (
    <div className="absolute right-full top-0 z-50 mr-2 w-72 rounded-xl border border-border bg-card p-2 shadow-xl">
      <div className="border-b border-border/70 px-3 py-2 text-right">
        <p className="text-sm font-bold text-foreground">{subsection.label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">الصفحات المرتبطة بالقسم</p>
      </div>
      <div className="mt-1 space-y-0.5">
        {subsection.items.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right text-sm transition-colors',
                active
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.title}</span>
              {active ? <ChevronLeft className="h-4 w-4 shrink-0" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
