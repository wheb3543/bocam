import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { NavItem, NavGroup } from '@/components/layout/sidebarData';
import { cn } from '@/lib/utils';

interface EditSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  allToolsGroups: NavGroup[];
  visibleItemIds: string[];
  onSave: (newVisibleIds: string[]) => void;
}

const MAX_VISIBLE_ITEMS = 10;

export default function EditSidebarModal({
  isOpen,
  onClose,
  allToolsGroups,
  visibleItemIds,
  onSave,
}: EditSidebarModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(visibleItemIds);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(visibleItemIds);
    }
  }, [isOpen, visibleItemIds]);

  // Get all items from all groups
  const allItems = allToolsGroups.flatMap((group) => group.items);

  // Get selected items in order
  const selectedItems = selectedIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean) as NavItem[];

  // Toggle selection
  const toggleItem = (itemId: string) => {
    if (itemId === 'home') {
      return;
    } // Cannot remove home

    if (selectedIds.includes(itemId)) {
      setSelectedIds(selectedIds.filter((id) => id !== itemId));
    } else {
      if (selectedIds.length < MAX_VISIBLE_ITEMS) {
        setSelectedIds([...selectedIds, itemId]);
      }
    }
  };

  // Remove item from selected
  const removeItem = (itemId: string) => {
    if (itemId === 'home') {
      return;
    }
    setSelectedIds(selectedIds.filter((id) => id !== itemId));
  };

  // Move item up/down
  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const index = selectedIds.indexOf(itemId);
    if (index === -1) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedIds.length) {
      return;
    }

    const newIds = [...selectedIds];
    [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
    setSelectedIds(newIds);
  };

  const handleSave = () => {
    onSave(selectedIds);
    onClose();
  };

  const handleCancel = () => {
    setSelectedIds(visibleItemIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="flex h-[min(760px,calc(100dvh-1.5rem))] w-[calc(100vw-1.5rem)] max-w-[960px] flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] bg-white dark:bg-gray-900"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-gradient-to-l from-blue-50 to-white px-4 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 sm:items-center sm:px-6">
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="إغلاق نافذة تعديل الشريط الجانبي"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">
              تعديل الشريط الجانبي
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              اختر العناصر واسحبها لإعادة ترتيبها في الشريط الجانبي
            </p>
          </div>
          <div className="w-9" />
        </div>

        {/* Two Column Layout */}
        <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-gray-200 overflow-y-auto dark:divide-gray-700 lg:grid-cols-2 lg:divide-x lg:divide-x-reverse lg:divide-y-0 lg:overflow-hidden">
          {/* Right Column - "التفاعل مع الجمهور" (Selected Items) */}
          <section className="flex min-h-[300px] flex-col lg:min-h-0">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/30">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 sm:text-base">
                التفاعل مع الجمهور
              </h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                {selectedItems.length} عناصر
              </span>
            </div>
            <ScrollArea className="min-h-0 flex-1 px-4 py-3">
              <div className="space-y-2">
                {selectedItems.map((item, index) => {
                  const Icon = item.icon;
                  const isHome = item.id === 'home';
                  return (
                    <div
                      key={item.id}
                      className="group flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800"
                    >
                      {/* Drag Handle */}
                      {!isHome && (
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveItem(item.id, 'up')}
                            disabled={index === 0}
                            className="rounded p-0.5 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-gray-700"
                            aria-label={`نقل ${item.title} للأعلى`}
                          >
                            <ChevronUp className="h-3 w-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => moveItem(item.id, 'down')}
                            disabled={index === selectedItems.length - 1}
                            className="rounded p-0.5 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-gray-700"
                            aria-label={`نقل ${item.title} للأسفل`}
                          >
                            <ChevronDown className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      )}

                      {/* Checkbox */}
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => toggleItem(item.id)}
                        disabled={isHome}
                        className="flex-shrink-0"
                      />

                      {/* Item Info */}
                      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">
                          {item.title}
                        </span>
                      </div>

                      {/* Remove Button */}
                      {!isHome && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-1.5 opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700 sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label={`إزالة ${item.title} من الشريط الجانبي`}
                        >
                          <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </section>

          {/* Left Column - "تم تحديد X من الأدوات" (All Available Items) */}
          <section className="flex min-h-[300px] flex-col lg:min-h-0">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/30">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 sm:text-base">
                الأدوات المتاحة
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                اختر حتى {MAX_VISIBLE_ITEMS}
              </span>
            </div>
            <ScrollArea className="min-h-0 flex-1 px-4 py-3">
              <div className="space-y-4">
                {allToolsGroups.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <div key={group.label} className="space-y-2">
                      {/* Group Header */}
                      <div className="flex items-center gap-2 px-1">
                        <GroupIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {group.label}
                        </h4>
                      </div>

                      {/* Group Items */}
                      <div className="space-y-1">
                        {group.items
                          .filter((item: NavItem) => !selectedIds.includes(item.id))
                          .map((item: NavItem) => {
                            const Icon = item.icon;
                            const isHome = item.id === 'home';
                            const canSelect = selectedIds.length < MAX_VISIBLE_ITEMS;

                            return (
                              <button
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                disabled={isHome || !canSelect}
                                className={cn(
                                  'flex w-full items-center gap-3 rounded-lg p-2.5 text-right transition-all',
                                  canSelect
                                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    : 'opacity-50 cursor-not-allowed'
                                )}
                              >
                                <Checkbox
                                  checked={false}
                                  disabled={isHome || !canSelect}
                                  className="flex-shrink-0"
                                />
                                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-900 dark:text-gray-100 truncate block flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                  {item.title}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </section>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full sm:min-w-[120px] sm:w-auto"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:min-w-[120px] sm:w-auto"
          >
            حفظ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
