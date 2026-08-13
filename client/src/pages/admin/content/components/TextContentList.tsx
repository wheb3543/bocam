/**
 * Text Content List Component
 * مكون قائمة المحتوى النصي
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentCard } from './ContentCard';
import { ContentFiltersComponent } from './ContentFilters';
import { TextContentDialog } from './dialogs/TextContentDialog';
import { Plus } from 'lucide-react';
import type { TextContent, TextContentFormData } from '../types/content.types';
import type { ContentFilters } from '../types/content.types';

interface TextContentListProps {
  textContents: TextContent[];
  isLoading: boolean;
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
  pages?: Array<{ id: number; name: string; titleAr: string; titleEn: string }>;
  sections?: Array<{
    id: number;
    pageId: number;
    name: string;
    titleAr: string | null;
    titleEn: string | null;
  }>;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedTextContent: TextContent | null;
  formData: TextContentFormData;
  onFormDataChange: (data: TextContentFormData) => void;
  onCreateDialogOpen: (open: boolean) => void;
  onEditDialogOpen: (open: boolean) => void;
  onEditTextContent: (e: React.FormEvent) => void;
  onCreateTextContent: (e: React.FormEvent) => void;
  openEditDialog: (content: TextContent) => void;
  handleDeleteTextContent: (id: number) => void;
  onVersionHistory?: (id: number) => void;
  createMutation: { isPending: boolean };
  updateMutation: { isPending: boolean };
}

/**
 * TextContentList - مكون قائمة المحتوى النصي
 */
export function TextContentList({
  textContents,
  isLoading,
  filters,
  onFiltersChange,
  pages = [],
  sections = [],
  isCreateDialogOpen,
  isEditDialogOpen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedTextContent,
  formData,
  onFormDataChange,
  onCreateDialogOpen,
  onEditDialogOpen,
  onEditTextContent,
  onCreateTextContent,
  openEditDialog,
  handleDeleteTextContent,
  onVersionHistory,
  createMutation,
  updateMutation,
}: TextContentListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة النصوص والعناوين</h2>
        <Button onClick={() => onCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة محتوى نصي
        </Button>
      </div>

      {/* Filters */}
      <ContentFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        type="text"
        pages={pages}
      />

      {/* Content List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-32" />
          ))}
        </div>
      ) : textContents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">لا يوجد محتوى نصي</p>
          <p className="text-sm text-muted-foreground mt-2">ابدأ بإضافة محتوى نصي جديد</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {textContents.map((textContent) => (
            <ContentCard
              key={textContent.id}
              title={textContent.key}
              description={textContent.content.substring(0, 100)}
              metadata={{
                اللغة: textContent.language,
                القسم: textContent.section || '-',
                النوع: textContent.type || '-',
              }}
              onEdit={() => openEditDialog(textContent)}
              onDelete={() => handleDeleteTextContent(textContent.id)}
              onVersionHistory={() => onVersionHistory?.(textContent.id)}
              isActive={textContent.isActive === 'yes'}
              status={textContent.status || 'draft'}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <TextContentDialog
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogOpen}
        mode="create"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onCreateTextContent}
        isPending={createMutation.isPending}
        pages={pages}
        sections={sections}
      />

      {/* Edit Dialog */}
      <TextContentDialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogOpen}
        mode="edit"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onEditTextContent}
        isPending={updateMutation.isPending}
        pages={pages}
        sections={sections}
      />
    </div>
  );
}
