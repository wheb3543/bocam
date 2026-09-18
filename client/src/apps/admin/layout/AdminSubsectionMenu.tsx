import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdminNavigationSection, AdminNavigationSubsection } from '@/config/adminNavigation';
import type { NavItem } from '@/config/sidebarNavigation';
import { cn } from '@/lib/utils';
import AdminPageMenu from './AdminPageMenu';

interface AdminSubsectionMenuProps {
  section: AdminNavigationSection;
  activeSubsectionId: string | null;
  onSubsectionChange: (subsectionId: string | null) => void;
  onNavigate: (item: NavItem) => void;
  isItemActive: (href: string) => boolean;
}

export default function AdminSubsectionMenu({
  section,
  activeSubsectionId,
  onSubsectionChange,
  onNavigate,
  isItemActive,
}: AdminSubsectionMenuProps) {
  const activeSubsection = section.subsections.find(
    (subsection) => subsection.id === activeSubsectionId
  );

  return (
    <div className="absolute right-0 top-full z-40 mt-2 flex min-w-[19rem] gap-2 rounded-xl border border-border bg-card p-2 shadow-xl">
      <div className="w-72 space-y-1">
        {section.items.map((item) => {
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
            </button>
          );
        })}
        {section.subsections.map((subsection: AdminNavigationSubsection) => {
          const active = subsection.id === activeSubsectionId;
          return (
            <button
              key={subsection.id}
              type="button"
              onClick={() => onSubsectionChange(active ? null : subsection.id)}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-right text-sm transition-colors',
                active
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <span className="min-w-0 flex-1 truncate">{subsection.label}</span>
              {active ? (
                <ChevronLeft className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      {activeSubsection ? (
        <AdminPageMenu
          subsection={activeSubsection}
          onNavigate={onNavigate}
          isItemActive={isItemActive}
        />
      ) : null}
    </div>
  );
}
