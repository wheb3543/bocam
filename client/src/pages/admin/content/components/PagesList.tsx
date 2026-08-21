/**
 * Pages List Component
 * مكون قائمة الصفحات
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageCard } from './PageCard';
import { PagePreview } from './PagePreview';
import { ContentFiltersComponent } from './ContentFilters';
import Pagination from '@/components/table/Pagination';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { Page } from '../hooks/usePages';
import type { ContentFilters } from '../types/content.types';
import type { ContentPagination } from '../utils/listResponse';

interface PagesListProps {
  pages: Page[];
  isLoading: boolean;
  pagination: ContentPagination | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  filters?: ContentFilters;
  onFiltersChange?: (filters: ContentFilters) => void;
  openEditDialog: (page: Page) => void;
  handleDeletePage: (id: number) => void;
  handleDuplicatePage?: (id: number) => void;
  handlePageSettings?: (page: Page) => void;
  onCreateDialogOpen: (open: boolean) => void;
  pageSections?: Array<{
    id: number;
    pageId: number;
    name: string;
    titleAr: string | null;
    titleEn: string | null;
    subtitleAr: string | null;
    subtitleEn: string | null;
    type: string;
    sortOrder: number;
    isActive: 'yes' | 'no';
    createdAt: Date;
    updatedAt: Date;
  }>;
}

/**
 * PagesList - مكون قائمة الصفحات
 */
export function PagesList({
  pages,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  filters,
  onFiltersChange,
  handlePageSettings,
  openEditDialog,
  handleDeletePage,
  handleDuplicatePage,
  onCreateDialogOpen,
  pageSections = [],
}: PagesListProps) {
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (page: Page) => {
    setPreviewPage(page);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الصفحات</h2>
        <Button onClick={() => onCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة صفحة
        </Button>
      </div>

      {/* Filters */}
      {filters && onFiltersChange && (
        <ContentFiltersComponent
          filters={filters}
          onFiltersChange={onFiltersChange}
          type="pages"
          pages={pages.map((p) => ({
            id: p.id,
            name: p.name,
            titleAr: p.titleAr,
            titleEn: p.titleEn,
          }))}
        />
      )}

      {/* Content List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48 animate-pulse" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">لا توجد صفحات حالياً</p>
          <Button onClick={() => onCreateDialogOpen(true)} className="mt-4" variant="outline">
            إضافة صفحة جديدة
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              onEdit={() => openEditDialog(page)}
              onDelete={() => handleDeletePage(page.id)}
              onPreview={() => handlePreview(page)}
              onDuplicate={handleDuplicatePage ? () => handleDuplicatePage(page.id) : undefined}
              onSettings={handlePageSettings ? () => handlePageSettings(page) : undefined}
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

      {/* Preview Dialog */}
      <PagePreview
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        page={previewPage}
        sections={pageSections}
      />

      {/* Dialogs */}
      {/* سيتم إضافة Dialogs لاحقاً */}
    </div>
  );
}
