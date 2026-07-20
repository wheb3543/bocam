import { cn } from '@/lib/utils';
import { GripVertical, Check } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { NavItem } from '@/config/sidebarNavigation';

interface SortableEditItemProps {
  item: NavItem;
  isChecked: boolean;
  isHome: boolean;
  onToggle: (id: string) => void;
}

export default function SortableEditItem({
  item,
  isChecked,
  isHome,
  onToggle,
}: SortableEditItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 select-none',
        isChecked ? 'bg-blue-50 text-blue-700' : 'text-muted-foreground hover:bg-muted/50',
        isHome && 'opacity-60',
        isDragging && 'shadow-lg ring-2 ring-blue-300 bg-white dark:bg-card'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          'flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-muted-foreground touch-none',
          isHome && 'invisible'
        )}
        tabIndex={-1}
        aria-label="اسحب لإعادة الترتيب"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Checkbox */}
      <button
        onClick={() => !isHome && onToggle(item.id)}
        className={cn(
          'h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          isChecked ? 'bg-blue-600 border-blue-600' : 'border-border',
          isHome ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        {isChecked && <Check className="h-3 w-3 text-white" />}
      </button>

      {/* Icon & Label */}
      <button
        onClick={() => !isHome && onToggle(item.id)}
        className={cn(
          'flex items-center gap-2 flex-1 min-w-0',
          isHome ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 flex-shrink-0',
            isChecked ? 'text-blue-600' : 'text-muted-foreground'
          )}
        />
        <span className="truncate">{item.title}</span>
      </button>

      {isHome && <span className="text-[10px] text-muted-foreground flex-shrink-0">(ثابت)</span>}
    </div>
  );
}
