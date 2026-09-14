import { useState } from 'react';
import { X, GripVertical } from 'lucide-react';
import { useLocation } from 'wouter';
import type { AdminTab } from '@/hooks/layout/useAdminTabs';
import { cn } from '@/lib/utils';

interface AdminTabsProps {
  tabs: AdminTab[];
  activeTabId: string | null;
  onClose: (tab: AdminTab) => void;
  onReorder?: (sourceId: string, targetId: string) => void;
}

export default function AdminTabs({ tabs, activeTabId, onClose, onReorder }: AdminTabsProps) {
  const [, setLocation] = useLocation();
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, tabId: string) => {
    e.dataTransfer.setData('text/plain', tabId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTabId(tabId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTabId !== tabId) {
      setDragOverTabId(tabId);
    }
  };

  const handleDragLeave = (tabId: string) => {
    if (dragOverTabId === tabId) {
      setDragOverTabId(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetTabId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedTabId;
    if (sourceId && sourceId !== targetTabId && onReorder) {
      onReorder(sourceId, targetTabId);
    }
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  return (
    <div className="border-b border-border/80 bg-card/90 dark:bg-gray-900/90 shadow-xs" dir="rtl">
      {/* Chrome-style Tab Container: strictly fills width, no horizontal scroll, tabs shrink and overlap smoothly */}
      <div className="flex w-full items-end gap-1 px-3 pt-2 select-none overflow-hidden min-h-[40px]">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          const isDragging = draggedTabId === tab.id;
          const isDragOver = dragOverTabId === tab.id;

          return (
            <div
              key={tab.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragLeave={() => handleDragLeave(tab.id)}
              onDrop={(e) => handleDrop(e, tab.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group relative flex flex-1 min-w-0 max-w-[14rem] items-center gap-1.5 rounded-t-lg border border-b-0 px-2.5 py-2 text-xs md:text-sm font-medium transition-all duration-150 cursor-grab active:cursor-grabbing',
                active
                  ? 'border-border/90 border-t-2 border-t-primary bg-background dark:bg-gray-950 font-bold text-foreground shadow-xs z-10'
                  : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                isDragging && 'opacity-40 scale-95',
                isDragOver && 'ring-2 ring-primary/70 border-primary bg-primary/10'
              )}
              title={tab.title}
            >
              <button
                type="button"
                onClick={() => setLocation(tab.href)}
                className="min-w-0 flex-1 truncate text-right focus:outline-hidden"
                aria-current={active ? 'page' : undefined}
              >
                {tab.title}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab);
                }}
                className={cn(
                  'flex h-4 w-4 md:h-5 md:w-5 shrink-0 items-center justify-center rounded-md transition-colors',
                  active
                    ? 'text-foreground/70 hover:bg-muted hover:text-foreground'
                    : 'text-muted-foreground opacity-60 hover:bg-muted/90 hover:opacity-100 group-hover:opacity-100'
                )}
                aria-label={`إغلاق تبويب ${tab.title}`}
              >
                <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </button>
            </div>
          );
        })}
        {tabs.length === 0 && (
          <span className="text-xs font-bold text-muted-foreground/60 px-2 py-1.5 select-none truncate mb-1">
            لا توجد نوافذ عمل مفتوحة • اختر صفحة من القائمة الجانبية أو شاشة النظام
          </span>
        )}
      </div>
    </div>
  );
}
