/**
 * Camps Toolbar Component
 * مكون شريط أدوات المخيمات
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { ColumnVisibility } from '@/components/table/ColumnVisibility';
import { type ColumnConfig } from '@/components/table/ColumnVisibility';

interface CampsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  columnVisibilityProps: {
    columns: ColumnConfig[];
    visibleColumns: Record<string, boolean>;
    columnOrder: string[];
    onVisibilityChange: (columnKey: string, visible: boolean) => void;
    onColumnOrderChange: (newOrder: string[]) => void;
    onReset: () => void;
  };
}

export default function CampsToolbar({
  searchTerm,
  onSearchChange,
  onAddClick,
  columnVisibilityProps,
}: CampsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1 w-full">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث بالاسم أو الرابط..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
        <ColumnVisibility {...columnVisibilityProps} />
      </div>
      <Button onClick={onAddClick} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 ml-2" />
        إضافة مخيم جديد
      </Button>
    </div>
  );
}
