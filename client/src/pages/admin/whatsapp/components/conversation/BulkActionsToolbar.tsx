/**
 * BulkActionsToolbar - شريط الإجراءات الجماعية
 * يظهر عند تفعيل وضع التحديد المتعدد
 */

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Archive } from 'lucide-react';

interface BulkActionsToolbarProps {
  isSelectionMode: boolean;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkMarkImportant: () => void;
  onBulkArchive: () => void;
}

const BulkActionsToolbar = memo(function BulkActionsToolbar({
  isSelectionMode,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBulkMarkImportant,
  onBulkArchive,
}: BulkActionsToolbarProps) {
  if (!isSelectionMode || selectedCount === 0) {
    return null;
  }

  return (
    <div className="px-2 pt-2 pb-1 flex gap-2 items-center bg-white/10">
      <span className="text-[var(--text-sm)] text-white font-medium">
        تم تحديد {selectedCount}
      </span>
      <Button
        size="sm"
        variant="secondary"
        className="h-6 px-2 text-[var(--text-xs)] bg-white/20 hover:bg-white/30 text-white border-0"
        onClick={onSelectAll}
      >
        تحديد الكل
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="h-6 px-2 text-[var(--text-xs)] bg-white/20 hover:bg-white/30 text-white border-0"
        onClick={onClearSelection}
      >
        إلغاء التحديد
      </Button>
      <div className="flex-1" />
      <Button
        size="sm"
        variant="secondary"
        className="h-6 px-2 text-[var(--text-xs)] bg-amber-500/80 hover:bg-amber-500 text-white border-0"
        onClick={onBulkMarkImportant}
      >
        <Star className="h-3 w-3 ml-1" />
        مهمة
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="h-6 px-2 text-[var(--text-xs)] bg-gray-500/80 hover:bg-gray-500 text-white border-0"
        onClick={onBulkArchive}
      >
        <Archive className="h-3 w-3 ml-1" />
        أرشفة
      </Button>
    </div>
  );
});

export default BulkActionsToolbar;
