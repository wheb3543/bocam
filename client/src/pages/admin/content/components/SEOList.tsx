/**
 * SEO Settings List Component
 * مكون قائمة إعدادات SEO
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentCard } from './ContentCard';
import { ContentFiltersComponent } from './ContentFilters';
import { SEODialog } from './dialogs/SEODialog';
import { Plus } from 'lucide-react';
import type { SEOSettings, SEOSettingsFormData } from '../types/content.types';
import type { ContentFilters } from '../types/content.types';

type SEOPageOption = { id: number; name: string; slug: string; titleAr: string; titleEn: string };

interface SEOListProps {
  seoSettings: SEOSettings[];
  isLoading: boolean;
  pages?: SEOPageOption[];
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedSEOSettings: SEOSettings | null;
  formData: SEOSettingsFormData;
  onFormDataChange: (data: SEOSettingsFormData) => void;
  onCreateDialogOpen: (open: boolean) => void;
  onEditDialogOpen: (open: boolean) => void;
  onEditSEOSettings: (e: React.FormEvent) => void;
  onCreateSEOSettings: (e: React.FormEvent) => void;
  openEditDialog: (seoSetting: SEOSettings) => void;
  handleDeleteSEOSettings: (id: number) => void;
  onVersionHistory?: (id: number) => void;
  createMutation: { isPending: boolean };
  updateMutation: { isPending: boolean };
}

/**
 * SEOList - مكون قائمة إعدادات SEO
 */
export function SEOList({
  seoSettings,
  isLoading,
  pages = [],
  filters,
  onFiltersChange,
  isCreateDialogOpen,
  isEditDialogOpen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedSEOSettings,
  formData,
  onFormDataChange,
  onCreateDialogOpen,
  onEditDialogOpen,
  onEditSEOSettings,
  onCreateSEOSettings,
  openEditDialog,
  handleDeleteSEOSettings,
  onVersionHistory,
  createMutation,
  updateMutation,
}: SEOListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة إعدادات SEO</h2>
        <Button onClick={() => onCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة إعدادات SEO
        </Button>
      </div>

      {/* Filters */}
      <ContentFiltersComponent filters={filters} onFiltersChange={onFiltersChange} type="seo" />

      {/* Content List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-32" />
          ))}
        </div>
      ) : seoSettings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">لا توجد إعدادات SEO</p>
          <p className="text-sm text-muted-foreground mt-2">ابدأ بإضافة إعدادات SEO جديدة</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seoSettings.map((seoSetting) => (
            <ContentCard
              key={seoSetting.id}
              title={seoSetting.pageKey || '-'}
              description={seoSetting.title || seoSetting.description || ''}
              metadata={{
                اللغة: seoSetting.language || '-',
                العنوان: seoSetting.title || '-',
              }}
              onEdit={() => openEditDialog(seoSetting)}
              onDelete={() => handleDeleteSEOSettings(seoSetting.id)}
              onVersionHistory={() => onVersionHistory?.(seoSetting.id)}
              isActive={seoSetting.isActive === 'yes'}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <SEODialog
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogOpen}
        mode="create"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onCreateSEOSettings}
        isPending={createMutation.isPending}
        pages={pages}
      />

      {/* Edit Dialog */}
      <SEODialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogOpen}
        mode="edit"
        formData={formData}
        onFormDataChange={onFormDataChange}
        onSubmit={onEditSEOSettings}
        isPending={updateMutation.isPending}
        pages={pages}
      />
    </div>
  );
}
