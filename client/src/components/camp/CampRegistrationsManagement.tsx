import { useAuth } from '@/_core/hooks/useAuth';
import { printReceipt } from '@/components/booking/PrintReceipt';
import { toast } from 'sonner';
import FilterPresets from '@/components/FilterPresets';
import EmptyState from '@/components/EmptyState';
import BulkActionsManager from '@/components/BulkActionsManager';
import Pagination from '@/components/table/Pagination';
import { Loader2, TentTree, Trash2 } from 'lucide-react';
import CampRegistrationCard from '@/components/camp/CampRegistrationCard';
import { useCampRegistrations } from '@/hooks/camp/useCampRegistrations';
import CampStatisticsCards from '@/components/camp/CampStatisticsCards';
import EntityFilters from '@/components/common/EntityFilters';
import CampRegistrationTable from '@/components/camp/CampRegistrationTable';
import CampStatusUpdateDialog from '@/components/camp/CampStatusUpdateDialog';
import type { CampRegistration } from '@/types/camp';

export default function CampRegistrationsManagement({
  onPendingCountChange,
  dateRange,
  onDateRangeChange,
}: {
  onPendingCountChange?: (count: number) => void;
  dateRange: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
}) {
  const { user } = useAuth();
  const campHook = useCampRegistrations({
    dateRange,
    onDateRangeChange,
    onPendingCountChange,
  });

  const handlePrint = async (reg: CampRegistration) => {
    try {
      if (!reg.id) {
        return;
      }
      const result = await campHook.generateReceiptNumberMutation.mutateAsync({ id: reg.id });
      const campName = reg.campName || `مخيم #${reg.campId}`;
      printReceipt(
        {
          fullName: reg.fullName ?? '',
          phone: reg.phone ?? '',
          age: reg.age ?? undefined,
          registrationDate: new Date(reg.createdAt || new Date()),
          type: 'camp',
          typeName: campName,
          receiptNumber: result.receiptNumber,
        },
        user?.name || 'مستخدم'
      );
    } catch {
      toast.error('فشل في توليد رقم السند');
    }
  };

  const handleDelete = (id: number) => {
    campHook.deleteRegMutation.mutate({ id });
  };

  if (campHook.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <CampStatisticsCards stats={campHook.stats || {}} />

      {/* Filter Presets */}
      <FilterPresets
        pageKey="campRegistrations"
        currentFilters={campHook.currentFilters}
        onApplyFilters={campHook.handleApplyPreset}
        quickPresets={campHook.quickPresets}
        isAdmin={user?.role === 'admin'}
      />

      {/* Filters */}
      <EntityFilters
        searchTerm={campHook.searchTerm}
        onSearchChange={campHook.setSearchTerm}
        searchPlaceholder="البحث بالاسم أو الهاتف..."
        categoryOptions={(campHook.allCamps || []).map((camp: { id?: number; name?: string }) => ({
          value: camp.id?.toString() || '',
          label: camp.name || '',
        }))}
        selectedCategory={campHook.selectedCamp}
        onCategoryChange={campHook.setSelectedCamp}
        categoryPlaceholder="جميع المخيمات"
        dateFilter={campHook.dateFilter}
        onDateFilterChange={(value: 'all' | 'today' | 'week' | 'month' | 'custom') =>
          campHook.setDateFilter(value)
        }
        statusFilter={campHook.statusFilter}
        onStatusFilterChange={campHook.setStatusFilter}
        sourceFilter={campHook.sourceFilter}
        onSourceFilterChange={campHook.setSourceFilter}
        activeFilterCount={campHook.campFilter.filters.activeFilterCount}
        onResetAll={campHook.resetFilters}
        columns={campHook.campRegColumns}
        visibleColumns={campHook.campTable.visibleColumns}
        columnOrder={campHook.campTable.columnOrder}
        onVisibilityChange={campHook.campTable.handleColumnVisibilityChange}
        onColumnOrderChange={campHook.campTable.handleColumnOrderChange}
        onResetColumns={campHook.campTable.handleResetAll}
        allTemplates={campHook.campTable.allTemplates}
        activeTemplateId={campHook.campTable.activeTemplateId}
        onApplyTemplate={campHook.campTable.handleApplyTemplate}
        onSaveTemplate={campHook.campTable.handleSaveTemplate}
        onDeleteTemplate={campHook.campTable.handleDeleteTemplate}
        columnWidths={campHook.campTable.columnWidths.columnWidths}
        frozenColumns={campHook.campTable.frozenColumns.frozenColumns}
        onToggleFrozen={campHook.campTable.frozenColumns.toggleFrozen}
        isAdmin={user?.role === 'admin'}
        sharedTemplates={campHook.campTable.sharedTemplates}
        onSaveSharedTemplate={campHook.campTable.handleSaveSharedTemplate}
        onDeleteSharedTemplate={campHook.campTable.handleDeleteSharedTemplate}
        pageKey="campRegistrations"
        currentFilters={{
          statusFilter: campHook.campFilter.filters.statusFilter,
          sourceFilter: campHook.campFilter.filters.sourceFilter,
          categoryFilter: campHook.campFilter.filters.categoryFilter,
          dateFilter: campHook.campFilter.filters.dateFilter,
          searchTerm: campHook.campFilter.filters.searchTerm,
        }}
        onApplyFilter={(filters) => {
          if (filters.statusFilter) {
            campHook.campFilter.filters.setStatusFilter(filters.statusFilter as string[]);
          } else {
            campHook.campFilter.filters.setStatusFilter([]);
          }
          if (filters.sourceFilter) {
            campHook.campFilter.filters.setSourceFilter(filters.sourceFilter as string[]);
          } else {
            campHook.campFilter.filters.setSourceFilter([]);
          }
          if (filters.categoryFilter) {
            campHook.campFilter.filters.setCategoryFilter(filters.categoryFilter as string[]);
          } else {
            campHook.campFilter.filters.setCategoryFilter([]);
          }
          if (filters.dateFilter) {
            campHook.campFilter.filters.setDateFilter(
              filters.dateFilter as 'all' | 'today' | 'week' | 'month' | 'custom'
            );
            onDateRangeChange?.(
              campHook.campPresetDateRange(
                filters.dateFilter as 'all' | 'today' | 'week' | 'month' | 'custom',
                dateRange
              )
            );
          } else {
            campHook.campFilter.filters.setDateFilter('all');
          }
          if (filters.searchTerm) {
            campHook.campFilter.filters.setSearchTerm(filters.searchTerm as string);
          } else {
            campHook.campFilter.filters.setSearchTerm('');
          }
        }}
        onExport={campHook.handleExportCampRegistrations}
        onPrint={campHook.handlePrintCampRegistrations}
      />

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {campHook.filteredRegistrations.length === 0 ? (
          <EmptyState
            icon={TentTree}
            title="لا توجد تسجيلات"
            description="لم يتم العثور على أي تسجيلات للمخيمات في الفترة المحددة. جرب تغيير الفلاتر."
          />
        ) : (
          campHook.filteredRegistrations.map((reg: CampRegistration) => (
            <CampRegistrationCard
              key={reg.id}
              registration={{
                id: reg.id ?? 0,
                fullName: reg.fullName ?? '',
                phone: reg.phone ?? '',
                email: reg.email ?? '',
                age: reg.age ?? 0,
                status: reg.status ?? 'pending',
                campName: reg.campName ?? '',
                createdAt:
                  typeof reg.createdAt === 'string'
                    ? new Date(reg.createdAt)
                    : (reg.createdAt ?? new Date()),
              }}
              onEdit={() => campHook.handleEditRegistration(reg)}
              onViewDetails={() => campHook.handleViewDetails(reg)}
              onPrint={() => handlePrint(reg)}
            />
          ))
        )}
      </div>

      {/* Bulk Update Button */}
      {campHook.selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              تم تحديد {campHook.selectedIds.length} من {campHook.filteredRegistrations.length}
            </span>
          </div>
          <BulkActionsManager
            selectedCount={campHook.selectedIds.length}
            onClear={() => campHook.setSelectedIds([])}
            actions={[
              {
                type: 'status-update',
                label: 'تحديث الحالة',
                statusOptions: [
                  { value: 'confirmed', label: 'مؤكد' },
                  { value: 'attended', label: 'حضر' },
                  { value: 'completed', label: 'مكتمل' },
                  { value: 'cancelled', label: 'ملغي' },
                ],
                onStatusConfirm: async (newStatus) => {
                  await campHook.bulkUpdateMutation.mutateAsync({
                    ids: campHook.selectedIds,
                    status: newStatus as 'confirmed' | 'attended' | 'completed' | 'cancelled',
                  });
                  campHook.setSelectedIds([]);
                  campHook.refetch();
                },
              },
              {
                type: 'delete',
                label: 'حذف',
                variant: 'destructive',
                icon: <Trash2 className="h-4 w-4" />,
                onConfirm: async () => {
                  await Promise.all(
                    campHook.selectedIds.map((id) => campHook.deleteRegMutation.mutateAsync({ id }))
                  );
                  campHook.setSelectedIds([]);
                  campHook.refetch();
                },
                confirmTitle: 'تأكيد الحذف',
                confirmDescription: `هل أنت متأكد من حذف ${campHook.selectedIds.length} تسجيل؟`,
              },
            ]}
          />
        </div>
      )}

      {/* Desktop Table View */}
      <CampRegistrationTable
        registrations={campHook.filteredRegistrations}
        isLoading={campHook.isLoading}
        selectedIds={campHook.selectedIds}
        onSelectAll={campHook.handleSelectAll}
        onSelectOne={campHook.handleSelectOne}
        onEdit={campHook.handleEditRegistration}
        onPrint={handlePrint}
        onDelete={handleDelete}
        _onUpdateStatus={(
          id: number,
          status:
            | 'pending'
            | 'contacted'
            | 'no_answer'
            | 'confirmed'
            | 'attended'
            | 'completed'
            | 'cancelled'
        ) => {
          campHook.updateStatusMutation.mutateAsync({ id, status, notes: '' });
        }}
        campTable={{
          columnOrder: campHook.campTable.columnOrder,
          visibleColumns: campHook.campTable.visibleColumns,
          columnWidths: campHook.campTable.columnWidths.columnWidths,
          frozenColumns: campHook.campTable.frozenColumns,
          getSortProps: campHook.campTable.getSortProps,
        }}
        campRegColumns={campHook.campRegColumns}
        formatPhoneDisplay={campHook.formatPhoneDisplay}
        formatRegistrationDate={campHook.formatRegistrationDate}
        formatStatusTime={campHook.formatStatusTime}
        _deleteRegMutation={campHook.deleteRegMutation}
        _updateStatusMutation={campHook.updateStatusMutation}
      />

      {/* Pagination */}
      <Pagination
        currentPage={campHook.campPage}
        totalPages={campHook.registrationsData?.totalPages || 1}
        onPageChange={(page) => {
          campHook.setCampPage(page);
          campHook.setSelectedIds([]);
        }}
        totalItems={campHook.registrationsData?.total || 0}
        itemsPerPage={campHook.campLimit}
        pageSize={campHook.campPageSize}
        onPageSizeChange={(size) => {
          campHook.setCampPageSize(size);
          campHook.setCampPage(1);
          campHook.setSelectedIds([]);
        }}
      />

      {/* Status Update Dialog */}
      <CampStatusUpdateDialog
        open={campHook.statusDialogOpen}
        onOpenChange={campHook.setStatusDialogOpen}
        registration={campHook.selectedRegistration}
        newStatus={campHook.newStatus}
        onStatusChange={campHook.setNewStatus}
        editedName={campHook.editedName}
        onNameChange={campHook.setEditedName}
        editedPhone={campHook.editedPhone}
        onPhoneChange={campHook.setEditedPhone}
        attendanceDate={campHook.attendanceDate}
        onAttendanceDateChange={campHook.setAttendanceDate}
        preferredDate={campHook.preferredDate}
        onPreferredDateChange={campHook.setPreferredDate}
        preferredTimeSlot={campHook.preferredTimeSlot}
        onPreferredTimeSlotChange={campHook.setPreferredTimeSlot}
        availableDates={campHook.availableDates}
        onUpdate={campHook.handleStatusUpdate}
        isUpdating={campHook.updateStatusMutation.isPending}
        formatPhoneDisplay={campHook.formatPhoneDisplay}
      />
    </div>
  );
}
