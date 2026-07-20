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

export default function CampaignsPage() {
  const campaignManagement = useCampaignManagement();

  return (
    <DashboardLayout
      pageTitle="إدارة الحملات والمشاريع"
      pageDescription="إدارة شاملة للحملات التسويقية والمشاريع"
    >
      <div className="space-y-4 md:space-y-6" dir="rtl">
        {/* Overview Cards */}
        <CampaignOverviewCards
          overview={campaignManagement.overview}
          isLoading={campaignManagement.loadingOverview}
          campaigns={campaignManagement.campaigns || []}
        />

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  قائمة الحملات
                </CardTitle>
                <CardDescription>إدارة جميع الحملات التسويقية والمشاريع</CardDescription>
              </div>
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
                <Button
                  onClick={() => {
                    campaignManagement.resetForm();
                    campaignManagement.setIsCreateDialogOpen(true);
                  }}
                >
                  <Plus className="ml-2 h-4 w-4" />
                  حملة جديدة
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <CampaignFilters
              searchQuery={campaignManagement.searchQuery}
              onSearchChange={campaignManagement.setSearchQuery}
              onStatusFilterChange={campaignManagement.setStatusFilter}
              onTypeFilterChange={campaignManagement.setTypeFilter}
              statusFilter={campaignManagement.statusFilter}
              typeFilter={campaignManagement.typeFilter}
            />

            {/* Table */}
            <CampaignTable
              campaigns={campaignManagement.campaigns}
              isLoading={campaignManagement.loadingCampaigns}
              onView={campaignManagement.openViewDialog}
              onEdit={campaignManagement.openEditDialog}
              onDelete={campaignManagement.handleDeleteCampaign}
              onCreate={() => {
                campaignManagement.resetForm();
                campaignManagement.setIsCreateDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>

        {/* Create Dialog */}
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

        {/* Edit Dialog */}
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

        {/* View Dialog */}
        <CampaignViewDialog
          open={campaignManagement.isViewDialogOpen}
          onOpenChange={campaignManagement.setIsViewDialogOpen}
          campaign={campaignManagement.selectedCampaign}
          onEdit={campaignManagement.openEditDialog}
        />
      </div>
    </DashboardLayout>
  );
}
