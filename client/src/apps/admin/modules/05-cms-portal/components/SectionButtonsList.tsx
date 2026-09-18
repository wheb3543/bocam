/**
 * قائمة أزرار الأقسام ضمن دورة CMS الموحدة.
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionButtonCard } from './SectionButtonCard';
import { ContentFiltersComponent } from './ContentFilters';
import { SectionButtonDialog } from './dialogs/SectionButtonDialog';
import { Plus, Trash2 } from 'lucide-react';
import type { SectionButton, SectionButtonFormData } from '../hooks/useSectionButtons';
import type { ContentFilters } from '../types/content.types';

interface SectionButtonsListProps {
  sectionButtons: SectionButton[];
  isLoading: boolean;
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedButton: SectionButton | null;
  formData: SectionButtonFormData;
  sections: Array<{ id: number; name: string }>;
  qualityIssues: string[];
  isAdmin: boolean;
  showDeleted: boolean;
  onShowDeletedChange: (showDeleted: boolean) => void;
  onFormDataChange: (data: SectionButtonFormData) => void;
  onCreateDialogOpen: (open: boolean) => void;
  onEditDialogOpen: (open: boolean) => void;
  onCreateButton: (event: React.FormEvent) => void;
  onEditButton: (event: React.FormEvent) => void;
  onEditButtonOpen: (button: SectionButton) => void;
  onDeleteButton: (id: number) => void;
  onArchiveButton: (id: number) => void;
  onDuplicateButton: (id: number) => void;
  onRestoreButton: (id: number) => void;
  onVersionHistory: (id: number) => void;
  clearQualityIssues: () => void;
  createPending: boolean;
  updatePending: boolean;
}

export function SectionButtonsList({
  sectionButtons,
  isLoading,
  filters,
  onFiltersChange,
  isCreateDialogOpen,
  isEditDialogOpen,
  selectedButton,
  formData,
  sections,
  qualityIssues,
  isAdmin,
  showDeleted,
  onShowDeletedChange,
  onFormDataChange,
  onCreateDialogOpen,
  onEditDialogOpen,
  onCreateButton,
  onEditButton,
  onEditButtonOpen,
  onDeleteButton,
  onArchiveButton,
  onDuplicateButton,
  onRestoreButton,
  onVersionHistory,
  clearQualityIssues,
  createPending,
  updatePending,
}: SectionButtonsListProps) {
  const closeCreate = (open: boolean) => {
    if (!open) {
      clearQualityIssues();
    }
    onCreateDialogOpen(open);
  };
  const closeEdit = (open: boolean) => {
    if (!open) {
      clearQualityIssues();
    }
    onEditDialogOpen(open);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">إدارة أزرار الأقسام</h2>
          <p className="text-sm text-muted-foreground">
            أنشئ الأزرار كمسودات ثم انشرها بعد مراجعة الرابط.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onShowDeletedChange(!showDeleted)}
            variant={showDeleted ? 'secondary' : 'outline'}
          >
            <Trash2 className="ml-2 h-4 w-4" />
            {showDeleted ? 'عرض النشطة' : 'المحذوفات'}
          </Button>
          <Button onClick={() => onCreateDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة زر
          </Button>
        </div>
      </div>

      <ContentFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        type="sectionButtons"
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Card key={index} className="h-48 animate-pulse" />
          ))}
        </div>
      ) : sectionButtons.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {showDeleted ? 'لا توجد أزرار محذوفة' : 'لا توجد أزرار حالياً'}
          </p>
          {!showDeleted && (
            <Button onClick={() => onCreateDialogOpen(true)} className="mt-4" variant="outline">
              إضافة زر جديد
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sectionButtons.map((button) => (
            <SectionButtonCard
              key={button.id}
              button={button}
              onEdit={() => onEditButtonOpen(button)}
              onDelete={() => onDeleteButton(button.id)}
              onArchive={() => onArchiveButton(button.id)}
              onDuplicate={() => onDuplicateButton(button.id)}
              onRestore={() => onRestoreButton(button.id)}
              onVersionHistory={() => onVersionHistory(button.id)}
            />
          ))}
        </div>
      )}

      <SectionButtonDialog
        open={isCreateDialogOpen}
        onOpenChange={closeCreate}
        mode="create"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onCreateButton}
        isPending={createPending}
        sections={sections}
        qualityIssues={qualityIssues}
        isAdmin={isAdmin}
      />
      <SectionButtonDialog
        open={isEditDialogOpen}
        onOpenChange={closeEdit}
        mode="edit"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onEditButton}
        isPending={updatePending}
        sections={sections}
        qualityIssues={qualityIssues}
        isAdmin={isAdmin}
        approvalEntityId={selectedButton?.id}
      />
    </div>
  );
}
