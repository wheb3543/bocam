/**
 * Text Content List Component
 * مكون قائمة المحتوى النصي
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentCard } from './ContentCard';
import { ContentFiltersComponent } from './ContentFilters';
import Pagination from '@/components/table/Pagination';
import { TextContentDialog } from './dialogs/TextContentDialog';
import { Plus } from 'lucide-react';
import type { TextContent, TextContentFormData } from '../types/content.types';
import type { ContentFilters } from '../types/content.types';
import type { ContentPagination } from '../utils/listResponse';

interface TextContentListProps {
  textContents: TextContent[];
  isLoading: boolean;
  pagination: ContentPagination | null;
  currentPage: number;
  onPageChange: (page: number) => void;
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
  qualityIssues: string[];
  isAdmin: boolean;
  clearQualityIssues: () => void;
}

/**
 * TextContentList - مكون قائمة المحتوى النصي
 */
export function TextContentList({
  textContents,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
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
  qualityIssues,
  isAdmin,
  clearQualityIssues,
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

      {pagination && pagination.total > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(pagination.totalPages, 1)}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={onPageChange}
          showPageSizeSelector={false}
        />
      )}

      {/* Create Dialog */}
      <TextContentDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            clearQualityIssues();
          }
          onCreateDialogOpen(open);
        }}
        mode="create"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onCreateTextContent}
        isPending={createMutation.isPending}
        qualityIssues={qualityIssues}
        isAdmin={isAdmin}
        pages={pages}
        sections={sections}
      />

      {/* Edit Dialog */}
      <TextContentDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            clearQualityIssues();
          }
          onEditDialogOpen(open);
        }}
        mode="edit"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onEditTextContent}
        isPending={updateMutation.isPending}
        qualityIssues={qualityIssues}
        isAdmin={isAdmin}
        pages={pages}
        sections={sections}
      />
    </div>
  );
}
