/**
 * Section Buttons List Component
 * مكون قائمة أزرار الأقسام
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionButtonCard } from './SectionButtonCard';
import { ContentFiltersComponent } from './ContentFilters';
import { Plus } from 'lucide-react';
import type { SectionButton } from '../hooks/useSectionButtons';
import type { ContentFilters } from '../types/content.types';

interface SectionButtonsListProps {
  sectionButtons: SectionButton[];
  isLoading: boolean;
  filters?: ContentFilters;
  onFiltersChange?: (filters: ContentFilters) => void;
  openEditDialog: (button: SectionButton) => void;
  handleDeleteButton: (id: number) => void;
  onCreateDialogOpen: (open: boolean) => void;
}

/**
 * SectionButtonsList - مكون قائمة أزرار الأقسام
 */
export function SectionButtonsList({
  sectionButtons,
  isLoading,
  filters,
  onFiltersChange,
  openEditDialog,
  handleDeleteButton,
  onCreateDialogOpen,
}: SectionButtonsListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة أزرار الأقسام</h2>
        <Button onClick={() => onCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة زر
        </Button>
      </div>

      {/* Filters */}
      {filters && onFiltersChange && (
        <ContentFiltersComponent
          filters={filters}
          onFiltersChange={onFiltersChange}
          type="sectionButtons"
        />
      )}

      {/* Content List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48 animate-pulse" />
          ))}
        </div>
      ) : sectionButtons.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">لا توجد أزرار حالياً</p>
          <Button onClick={() => onCreateDialogOpen(true)} className="mt-4" variant="outline">
            إضافة زر جديد
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sectionButtons.map((button) => (
            <SectionButtonCard
              key={button.id}
              button={button}
              onEdit={() => openEditDialog(button)}
              onDelete={() => handleDeleteButton(button.id)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      {/* سيتم إضافة Dialogs لاحقاً */}
    </div>
  );
}
