/**
 * Color Scheme List Component
 * مكون قائمة نظام الألوان
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentCard } from './ContentCard';
import { ContentFiltersComponent } from './ContentFilters';
import { ColorSchemeDialog } from './dialogs/ColorSchemeDialog';
import { Plus } from 'lucide-react';
import type { ColorScheme, ColorSchemeFormData } from '../types/content.types';
import type { ContentFilters } from '../types/content.types';

interface ColorSchemeListProps {
  colorSchemes: ColorScheme[];
  isLoading: boolean;
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedColorScheme: ColorScheme | null;
  formData: ColorSchemeFormData;
  onFormDataChange: (data: ColorSchemeFormData) => void;
  onCreateDialogOpen: (open: boolean) => void;
  onEditDialogOpen: (open: boolean) => void;
  onEditColorScheme: (e: React.FormEvent) => void;
  onCreateColorScheme: (e: React.FormEvent) => void;
  openEditDialog: (colorScheme: ColorScheme) => void;
  handleDeleteColorScheme: (id: number) => void;
  onVersionHistory?: (id: number) => void;
  createMutation: { isPending: boolean };
  updateMutation: { isPending: boolean };
}

/**
 * ColorSchemeList - مكون قائمة نظام الألوان
 */
export function ColorSchemeList({
  colorSchemes,
  isLoading,
  filters,
  onFiltersChange,
  isCreateDialogOpen,
  isEditDialogOpen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedColorScheme,
  formData,
  onFormDataChange,
  onCreateDialogOpen,
  onEditDialogOpen,
  onEditColorScheme,
  onCreateColorScheme,
  openEditDialog,
  handleDeleteColorScheme,
  onVersionHistory,
  createMutation,
  updateMutation,
}: ColorSchemeListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة نظام الألوان</h2>
        <Button onClick={() => onCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة لون
        </Button>
      </div>

      {/* Filters */}
      <ContentFiltersComponent filters={filters} onFiltersChange={onFiltersChange} type="colors" />

      {/* Content List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-32" />
          ))}
        </div>
      ) : colorSchemes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">لا توجد ألوان</p>
          <p className="text-sm text-muted-foreground mt-2">ابدأ بإضافة ألوان جديدة</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {colorSchemes.map((colorScheme) => (
            <ContentCard
              key={colorScheme.id}
              title={colorScheme.key}
              description={colorScheme.value}
              metadata={{
                النوع: colorScheme.type || '-',
                الدرجة: colorScheme.shade || '-',
              }}
              onEdit={() => openEditDialog(colorScheme)}
              onDelete={() => handleDeleteColorScheme(colorScheme.id)}
              onVersionHistory={() => onVersionHistory?.(colorScheme.id)}
              isActive={colorScheme.isActive === 'yes'}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <ColorSchemeDialog
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogOpen}
        mode="create"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onCreateColorScheme}
        isPending={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <ColorSchemeDialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogOpen}
        mode="edit"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onEditColorScheme}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
