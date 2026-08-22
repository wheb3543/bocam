/**
 * Image List Component
 * مكون قائمة الصور
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentCard } from './ContentCard';
import { ContentFiltersComponent } from './ContentFilters';
import { ImageUploadDialog } from './dialogs/ImageUploadDialog';
import { Plus } from 'lucide-react';
import type { Image, ImageFormData } from '../types/content.types';
import type { ContentFilters } from '../types/content.types';

interface ImageListProps {
  images: Image[];
  isLoading: boolean;
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedImage: Image | null;
  formData: ImageFormData;
  onFormDataChange: (data: ImageFormData) => void;
  onCreateDialogOpen: (open: boolean) => void;
  onEditDialogOpen: (open: boolean) => void;
  onEditImage: (e: React.FormEvent) => void;
  onCreateImage: (e: React.FormEvent) => void;
  openEditDialog: (image: Image) => void;
  handleDeleteImage: (id: number) => void;
  onVersionHistory?: (id: number) => void;
  createMutation: { isPending: boolean };
  updateMutation: { isPending: boolean };
  qualityIssues: string[];
  isAdmin: boolean;
  clearQualityIssues: () => void;
  approvalEntityId?: number | null;
}

/**
 * ImageList - مكون قائمة الصور
 */
export function ImageList({
  images,
  isLoading,
  filters,
  onFiltersChange,
  isCreateDialogOpen,
  isEditDialogOpen,
  selectedImage,
  formData,
  onFormDataChange,
  onCreateDialogOpen,
  onEditDialogOpen,
  onEditImage,
  onCreateImage,
  openEditDialog,
  handleDeleteImage,
  onVersionHistory,
  createMutation,
  updateMutation,
  qualityIssues,
  isAdmin,
  clearQualityIssues,
  approvalEntityId,
}: ImageListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الصور والوسائط</h2>
        <Button onClick={() => onCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة صورة
        </Button>
      </div>

      {/* Filters */}
      <ContentFiltersComponent filters={filters} onFiltersChange={onFiltersChange} type="images" />

      {/* Content List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-32" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">لا توجد صور</p>
          <p className="text-sm text-muted-foreground mt-2">ابدأ بإضافة صور جديدة</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <ContentCard
              key={image.id}
              title={image.key}
              description={image.url}
              metadata={{
                القسم: image.section || '-',
                الصيغة: image.format || '-',
                الحجم: image.size ? `${(image.size / 1024).toFixed(1)} KB` : '-',
              }}
              onEdit={() => openEditDialog(image)}
              onDelete={() => handleDeleteImage(image.id)}
              onVersionHistory={() => onVersionHistory?.(image.id)}
              isActive={image.isActive === 'yes'}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <ImageUploadDialog
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
        onSubmit={onCreateImage}
        isPending={createMutation.isPending}
        qualityIssues={qualityIssues}
        isAdmin={isAdmin}
      />

      {/* Edit Dialog */}
      <ImageUploadDialog
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
        onSubmit={onEditImage}
        isPending={updateMutation.isPending}
        qualityIssues={qualityIssues}
        isAdmin={isAdmin}
        approvalEntityId={approvalEntityId ?? selectedImage?.id}
      />
    </div>
  );
}
