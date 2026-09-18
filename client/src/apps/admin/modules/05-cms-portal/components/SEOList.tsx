/**
 * SEO Settings List Component
 * مكون قائمة إعدادات SEO
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentCard } from './ContentCard';
import { ContentFiltersComponent } from './ContentFilters';
import { SEODialog } from './dialogs/SEODialog';
import { Download, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PermissionHint } from '@/components/PermissionHint';
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
  handleRestoreSEOSettings: (id: number) => void;
  statusFilter: 'all' | SEOSettings['status'];
  onStatusFilterChange: (status: 'all' | SEOSettings['status']) => void;
  showDeleted: boolean;
  onShowDeletedChange: (showDeleted: boolean) => void;
  overview?: {
    total: number;
    drafts: number;
    published: number;
    archived: number;
    deleted: number;
    pendingApprovals: number;
  };
  reportRows?: Array<{
    id: number;
    qualityScore: number;
    qualityIssueCodes: string[];
    pendingApproval: boolean;
  }>;
  onPendingApprovalClick?: () => void;
  onExportCsv?: () => void;
  onVersionHistory?: (id: number) => void;
  qualityIssues?: string[];
  clearQualityIssues?: () => void;
  isAdmin?: boolean;
  canViewSEO?: boolean;
  canManageSEO?: boolean;
  canDeleteSEO?: boolean;
  canRestoreSEO?: boolean;
  onApprovalSubmitted?: () => void;
  createMutation: { isPending: boolean };
  updateMutation: { isPending: boolean };
  restoreMutation?: { isPending: boolean };
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
  selectedSEOSettings,
  formData,
  onFormDataChange,
  onCreateDialogOpen,
  onEditDialogOpen,
  onEditSEOSettings,
  onCreateSEOSettings,
  openEditDialog,
  handleDeleteSEOSettings,
  handleRestoreSEOSettings,
  statusFilter,
  onStatusFilterChange,
  showDeleted,
  onShowDeletedChange,
  overview,
  reportRows = [],
  onPendingApprovalClick,
  onExportCsv,
  onVersionHistory,
  qualityIssues = [],
  clearQualityIssues,
  isAdmin = false,
  canViewSEO = true,
  canManageSEO = false,
  canDeleteSEO = false,
  canRestoreSEO = false,
  onApprovalSubmitted,
  createMutation,
  updateMutation,
}: SEOListProps) {
  const seoInsightsById = new Map(reportRows.map((row) => [row.id, row]));
  const handleCreateDialogOpenChange = (open: boolean) => {
    if (!open) {
      clearQualityIssues?.();
    }
    onCreateDialogOpen(open);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      clearQualityIssues?.();
    }
    onEditDialogOpen(open);
  };

  if (!canViewSEO) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-bold">إعدادات SEO</h2>
        <div className="mt-4 flex justify-center">
          <PermissionHint message="تحتاج إلى صلاحية عرض المحتوى للاطلاع على إعدادات SEO." />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold">إدارة إعدادات SEO</h2>
        <div className="flex flex-wrap gap-2">
          {canManageSEO ? (
            <Button variant="outline" onClick={onExportCsv} disabled={!reportRows.length}>
              <Download className="ml-2 h-4 w-4" />
              تصدير CSV
            </Button>
          ) : null}
          {canManageSEO ? (
            <Button onClick={() => onCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة إعدادات SEO
            </Button>
          ) : (
            <PermissionHint message="تحتاج إلى صلاحية إدارة SEO لإنشاء الإعدادات أو تعديلها أو تصديرها." />
          )}
        </div>
      </div>

      {/* Filters */}
      <ContentFiltersComponent filters={filters} onFiltersChange={onFiltersChange} type="seo" />
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
        <div className="grid min-w-48 gap-1.5">
          <Label htmlFor="seo-status-filter">حالة النشر</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusFilterChange(value as 'all' | SEOSettings['status'])}
          >
            <SelectTrigger id="seo-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="published">منشور</SelectItem>
              <SelectItem value="archived">مؤرشف</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <Switch
            id="seo-show-deleted"
            checked={showDeleted}
            onCheckedChange={onShowDeletedChange}
          />
          <Label htmlFor="seo-show-deleted" className="cursor-pointer">
            عرض المحذوفات فقط
          </Label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="إحصاءات حالات SEO">
        {[
          { label: 'الكل', value: overview?.total ?? 0, status: 'all' as const },
          { label: 'مسودة', value: overview?.drafts ?? 0, status: 'draft' as const },
          { label: 'منشور', value: overview?.published ?? 0, status: 'published' as const },
          { label: 'مؤرشف', value: overview?.archived ?? 0, status: 'archived' as const },
        ].map((counter) => (
          <Button
            key={counter.status}
            type="button"
            variant={statusFilter === counter.status && !showDeleted ? 'secondary' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => {
              onShowDeletedChange(false);
              onStatusFilterChange(counter.status);
            }}
          >
            {counter.label}
            <Badge variant="secondary" className="min-w-5 justify-center px-1.5">
              {counter.value}
            </Badge>
          </Button>
        ))}
        <Button
          type="button"
          variant={showDeleted ? 'secondary' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => onShowDeletedChange(true)}
        >
          المحذوفات
          <Badge variant="secondary" className="min-w-5 justify-center px-1.5">
            {overview?.deleted ?? 0}
          </Badge>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onPendingApprovalClick}
        >
          ينتظر الموافقة
          <Badge variant="secondary" className="min-w-5 justify-center px-1.5">
            {overview?.pendingApprovals ?? 0}
          </Badge>
        </Button>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-32" />
          ))}
        </div>
      ) : seoSettings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {showDeleted ? 'لا توجد إعدادات SEO محذوفة.' : 'لا توجد إعدادات SEO'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {showDeleted
              ? 'ستظهر هنا العناصر المحذوفة القابلة للاستعادة.'
              : 'ابدأ بإضافة إعدادات SEO جديدة'}
          </p>
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
                ...(seoSetting.deletedAt ? { الحالة: 'في سلة المحذوفات' } : {}),
              }}
              onEdit={
                seoSetting.deletedAt || !canManageSEO ? undefined : () => openEditDialog(seoSetting)
              }
              onDelete={
                seoSetting.deletedAt || !canManageSEO || !canDeleteSEO
                  ? undefined
                  : () => handleDeleteSEOSettings(seoSetting.id)
              }
              onRestore={
                seoSetting.deletedAt && canManageSEO && canRestoreSEO
                  ? () => handleRestoreSEOSettings(seoSetting.id)
                  : undefined
              }
              onVersionHistory={canManageSEO ? () => onVersionHistory?.(seoSetting.id) : undefined}
              isActive={!seoSetting.deletedAt && seoSetting.isActive === 'yes'}
              status={seoSetting.status}
              qualityScore={seoInsightsById.get(seoSetting.id)?.qualityScore}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {canManageSEO ? (
        <SEODialog
          open={isCreateDialogOpen}
          onOpenChange={handleCreateDialogOpenChange}
          mode="create"
          formData={formData}
          onFormDataChange={onFormDataChange}
          onSubmit={onCreateSEOSettings}
          isPending={createMutation.isPending}
          pages={pages}
          qualityIssues={qualityIssues}
          isAdmin={isAdmin}
        />
      ) : null}

      {/* Edit Dialog */}
      {canManageSEO ? (
        <SEODialog
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogOpenChange}
          mode="edit"
          formData={formData}
          onFormDataChange={onFormDataChange}
          onSubmit={onEditSEOSettings}
          isPending={updateMutation.isPending}
          pages={pages}
          qualityIssues={qualityIssues}
          isAdmin={isAdmin}
          approvalEntityId={selectedSEOSettings?.id}
          onApprovalSubmitted={onApprovalSubmitted}
        />
      ) : null}
    </div>
  );
}
