import type { AdminNavigationSection } from '@/config/adminNavigation';
import { cn } from '@/lib/utils';

interface AdminMainNavigationProps {
  sections: AdminNavigationSection[];
  activeSectionId: string | null;
  onSectionChange: (sectionId: string | null) => void;
  isSectionActive: (section: AdminNavigationSection) => boolean;
}

export default function AdminMainNavigation({
  sections,
  activeSectionId,
  onSectionChange,
  isSectionActive,
}: AdminMainNavigationProps) {
  return (
    <nav className="flex min-w-0 items-center gap-1 overflow-x-auto" aria-label="أقسام الإدارة">
      {sections.map((section) => {
        const Icon = section.items[0]?.icon;
        const active = isSectionActive(section);
        const expanded = activeSectionId === section.id;
        return (
          <button
            key={section.id}
            type="button"
            aria-expanded={expanded}
            onClick={() => onSectionChange(expanded ? null : section.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              expanded || active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            <span>{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
