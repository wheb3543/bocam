import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useConfirmDialog } from '@/hooks/ui/useConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { ColumnVisibility } from '@/components/table/ColumnVisibility';
import { useTableFeatures } from '@/hooks/table/useTableFeatures';
import { useDoctorManagement } from './doctors/hooks/useDoctorManagement';
import { DoctorStatsCards } from './doctors/components/DoctorStatsCards';
import { DoctorFormDialog } from './doctors/components/DoctorFormDialog';
import { DoctorTable } from './doctors/components/DoctorTable';
import { doctorColumns } from './doctors/components/DoctorTable';
import type { Doctor } from './doctors/types/doctor.types';

export default function DoctorsManagement() {
  const deleteConfirm = useConfirmDialog<Doctor>();
  const doctorManagement = useDoctorManagement();

  // === useTableFeatures hook ===
  const doctorTable = useTableFeatures({
    tableKey: 'doctors',
    columns: doctorColumns,
    defaultFrozenColumns: ['name'],
  });

  if (doctorManagement.isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
              </div>
              <div className="h-7 w-12 bg-muted rounded animate-pulse mb-1" />
              <div className="h-2.5 w-20 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Table Skeleton */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="h-9 w-36 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-full bg-muted rounded animate-pulse mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 w-full bg-muted/50 rounded animate-pulse mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <DoctorStatsCards stats={doctorManagement.doctorStats} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1 w-full">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم، التخصص، أو اللغات..."
              value={doctorManagement.searchTerm}
              onChange={(e) => doctorManagement.setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <ColumnVisibility {...doctorTable.columnVisibilityProps} />
        </div>
        <Button onClick={() => doctorManagement.handleOpenDialog()} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 ml-2" />
          إضافة طبيب جديد
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-100 overflow-hidden">
        <DoctorTable
          doctors={doctorManagement.doctors}
          searchTerm={doctorManagement.searchTerm}
          doctorTable={doctorTable}
          onToggleAvailability={doctorManagement.handleToggleAvailability}
          onEdit={doctorManagement.handleOpenDialog}
          onDuplicate={doctorManagement.handleDuplicate}
          onDelete={(doctor) => deleteConfirm.openConfirm(doctor)}
          onAdd={() => doctorManagement.handleOpenDialog()}
        />
      </div>

      {/* Add/Edit Dialog */}
      <DoctorFormDialog
        open={doctorManagement.dialogOpen}
        onOpenChange={doctorManagement.setDialogOpen}
        mode={doctorManagement.editingDoctor ? 'edit' : 'create'}
        formData={doctorManagement.formData}
        onFormDataChange={doctorManagement.setFormData}
        onSubmit={doctorManagement.handleSubmit}
        isPending={
          doctorManagement.createMutation.isPending || doctorManagement.updateMutation.isPending
        }
        onNameChange={doctorManagement.autoGenerateSlug}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onOpenChange={() => deleteConfirm.closeConfirm()}
        itemName={deleteConfirm.item?.name || undefined}
        itemType="الطبيب"
        onConfirm={() => {
          if (deleteConfirm.item && deleteConfirm.item.id) {
            doctorManagement.deleteMutation.mutate({ id: deleteConfirm.item.id });
          }
        }}
        isLoading={doctorManagement.deleteMutation.isPending}
        confirmText="حذف الطبيب"
      />
    </div>
  );
}
