import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Plus, RefreshCw } from 'lucide-react';
import { useCampaignManagement } from './hooks/useCampaignManagement';
import { CampaignOverviewCards } from './components/CampaignOverviewCards';
import { CampaignFilters } from './components/CampaignFilters';
import { CampaignTable } from './components/CampaignTable';
import { CampaignFormDialog } from './components/CampaignFormDialog';
import { CampaignViewDialog } from './components/CampaignViewDialog';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { PermissionHint } from '@/components/PermissionHint';

export default function CampaignsPage() {
  const { can, isLoading: arePermissionsLoading } = useRolePermissions();
  const canViewCampaigns = can('campaigns.view');
  const canCreateCampaigns = can('campaigns.create');
  const canUpdateCampaigns = can('campaigns.update');
  const canDeleteCampaigns = can('campaigns.delete');
  const campaignManagement = useCampaignManagement(canViewCampaigns);

  return (
    <DashboardLayout
      pageTitle="إدارة الحملات والمشاريع"
      pageDescription="إدارة شاملة للحملات التسويقية والمشاريع"
    >
      <div
        className="flex h-[calc(100dvh-4.25rem)] min-h-0 flex-col gap-3 overflow-hidden py-3 sm:py-4"
        dir="rtl"
      >
        {canViewCampaigns && (
          <div className="shrink-0">
            <CampaignOverviewCards
              overview={campaignManagement.overview}
              isLoading={campaignManagement.loadingOverview}
              campaigns={campaignManagement.campaigns || []}
            />
          </div>
        )}

        {/* Filters and Actions */}
        <Card className="flex min-h-0 flex-1 flex-col">
          <CardHeader className="shrink-0 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  قائمة الحملات
                </CardTitle>
                <CardDescription>إدارة جميع الحملات التسويقية والمشاريع</CardDescription>
              </div>
              {canViewCampaigns && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      campaignManagement.refetch();
                      campaignManagement.refetchOverview();
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {canCreateCampaigns ? (
                    <Button
                      onClick={() => {
                        campaignManagement.resetForm();
                        campaignManagement.setIsCreateDialogOpen(true);
                      }}
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      حملة جديدة
                    </Button>
                  ) : (
                    <PermissionHint
                      label="إنشاء مقيّد"
                      message="لا تملك صلاحية إنشاء حملات جديدة."
                    />
                  )}
                  {(!canUpdateCampaigns || !canDeleteCampaigns) && (
                    <PermissionHint
                      label="إجراءات مقيّدة"
                      message={
                        !canUpdateCampaigns && !canDeleteCampaigns
                          ? 'يمكنك عرض الحملات فقط؛ لا تملك صلاحية تعديلها أو حذفها.'
                          : !canUpdateCampaigns
                            ? 'لا تملك صلاحية تعديل الحملات.'
                            : 'لا تملك صلاحية حذف الحملات.'
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 pt-0">
            {/* Filters */}
            {canViewCampaigns && (
              <div className="shrink-0">
                <CampaignFilters
                  searchQuery={campaignManagement.searchQuery}
                  onSearchChange={campaignManagement.setSearchQuery}
                  onStatusFilterChange={campaignManagement.setStatusFilter}
                  onTypeFilterChange={campaignManagement.setTypeFilter}
                  statusFilter={campaignManagement.statusFilter}
                  typeFilter={campaignManagement.typeFilter}
                />
              </div>
            )}

            {/* Table */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {arePermissionsLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  جارٍ التحقق من الصلاحيات...
                </div>
              ) : !canViewCampaigns ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  لا تملك صلاحية عرض الحملات.
                </div>
              ) : (
                <CampaignTable
                  campaigns={campaignManagement.campaigns}
                  isLoading={campaignManagement.loadingCampaigns}
                  onView={campaignManagement.openViewDialog}
                  onEdit={canUpdateCampaigns ? campaignManagement.openEditDialog : undefined}
                  onDelete={
                    canDeleteCampaigns ? campaignManagement.handleDeleteCampaign : undefined
                  }
                  onCreate={
                    canCreateCampaigns
                      ? () => {
                          campaignManagement.resetForm();
                          campaignManagement.setIsCreateDialogOpen(true);
                        }
                      : undefined
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        {canCreateCampaigns && (
          <CampaignFormDialog
            open={campaignManagement.isCreateDialogOpen}
            onOpenChange={campaignManagement.setIsCreateDialogOpen}
            mode="create"
            formData={campaignManagement.formData}
            onFormDataChange={campaignManagement.setFormData}
            onSubmit={campaignManagement.handleCreateCampaign}
            isPending={campaignManagement.createMutation.isPending}
            onNameChange={(value) => {
              campaignManagement.setFormData({ ...campaignManagement.formData, name: value });
              campaignManagement.campaignAutoSlug(value);
            }}
          />
        )}

        {/* Edit Dialog */}
        {canUpdateCampaigns && (
          <CampaignFormDialog
            open={campaignManagement.isEditDialogOpen}
            onOpenChange={campaignManagement.setIsEditDialogOpen}
            mode="edit"
            formData={campaignManagement.formData}
            onFormDataChange={campaignManagement.setFormData}
            onSubmit={campaignManagement.handleEditCampaign}
            isPending={campaignManagement.updateMutation.isPending}
            selectedCampaign={campaignManagement.selectedCampaign}
          />
        )}

        {/* View Dialog */}
        {canViewCampaigns && (
          <CampaignViewDialog
            open={campaignManagement.isViewDialogOpen}
            onOpenChange={campaignManagement.setIsViewDialogOpen}
            campaign={campaignManagement.selectedCampaign}
            onEdit={canUpdateCampaigns ? campaignManagement.openEditDialog : undefined}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
