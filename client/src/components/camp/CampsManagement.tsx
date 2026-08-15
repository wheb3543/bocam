import { useState, useMemo } from 'react';
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useConfirmDialog } from '@/hooks/ui/useConfirmDialog';
import { toast } from 'sonner';
import { trpc } from '@/lib/api/trpc';
import { useTableFeatures } from '@/hooks/table/useTableFeatures';
import EmptyState from '@/components/EmptyState';
import { Tent } from 'lucide-react';
import CampsStats from './CampsStats';
import CampsToolbar from './CampsToolbar';
import CampFormDialog from './CampFormDialog';
import CampsTable from './CampsTable';
import { campColumns } from './columns';
import type { Camp, CampFormData } from './types';

export default function CampsManagement() {
  const { formatDate } = useFormatDate();
  const deleteConfirm = useConfirmDialog<Camp>();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CampFormData>({
    name: '',
    slug: '',
    description: '',
    location: '',
    imageUrl: '',
    isActive: true,
    startDate: '',
    endDate: '',
    freeOffers: '',
    discountedOffers: '',
    availableProcedures: '',
    galleryImages: '',
    morningTime: '',
    eveningTime: '',
    dailyCapacity: '',
  });

  // === useTableFeatures hook ===
  const campTable = useTableFeatures({
    tableKey: 'camps',
    columns: campColumns,
    defaultFrozenColumns: ['name'],
  });

  const { data: camps, isLoading, refetch } = trpc.camps.getAllAdmin.useQuery();

  const createMutation = trpc.camps.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء المخيم بنجاح');
      refetch();
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const msg = (error as { message?: string })?.message || 'حدث خطأ أثناء إنشاء المخيم';
      toast.error(msg);
    },
  });

  const updateMutation = trpc.camps.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث المخيم بنجاح');
      refetch();
      setEditingCamp(null);
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const msg = (error as { message?: string })?.message || 'حدث خطأ أثناء تحديث المخيم';
      toast.error(msg);
    },
  });

  const deleteMutation = trpc.camps.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف المخيم بنجاح');
      refetch();
      deleteConfirm.closeConfirm();
    },
    onError: (error: unknown) => {
      const msg = (error as { message?: string })?.message || 'حدث خطأ أثناء حذف المخيم';
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      location: '',
      imageUrl: '',
      isActive: true,
      startDate: '',
      endDate: '',
      freeOffers: '',
      discountedOffers: '',
      availableProcedures: '',
      galleryImages: '',
      morningTime: '',
      eveningTime: '',
      dailyCapacity: '',
    });
    setEditingCamp(null);
  };

  // Duplicate camp
  const handleDuplicate = (camp: Camp) => {
    setEditingCamp(null);
    setFormData({
      name: (camp.name ?? '') + ' (نسخة)',
      slug: (camp.slug ?? '') + '-copy',
      description: camp.description ?? '',
      imageUrl: camp.imageUrl ?? '',
      isActive: false,
      startDate: camp.startDate ? new Date(camp.startDate).toISOString().split('T')[0] : '',
      endDate: camp.endDate ? new Date(camp.endDate).toISOString().split('T')[0] : '',
      freeOffers: camp.freeOffers ?? '',
      discountedOffers: camp.discountedOffers ?? '',
      availableProcedures: camp.availableProcedures ?? '',
      galleryImages: camp.galleryImages ?? '',
      morningTime: camp.morningTime ?? '',
      eveningTime: camp.eveningTime ?? '',
      dailyCapacity: camp.dailyCapacity ? String(camp.dailyCapacity) : '',
      location: camp.location ?? '',
    });
    setShowAddDialog(true);
  };

  const handleSubmit = () => {
    if (editingCamp) {
      updateMutation.mutate({
        id: editingCamp.id,
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        dailyCapacity: formData.dailyCapacity ? parseInt(formData.dailyCapacity) : undefined,
      });
    } else {
      createMutation.mutate({
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        dailyCapacity: formData.dailyCapacity ? parseInt(formData.dailyCapacity) : undefined,
      });
    }
  };

  const handleEdit = (camp: Camp) => {
    setEditingCamp(camp);
    setFormData({
      name: camp.name,
      slug: camp.slug,
      description: camp.description ?? '',
      imageUrl: camp.imageUrl ?? '',
      isActive: camp.isActive,
      startDate: camp.startDate ? new Date(camp.startDate).toISOString().split('T')[0] : '',
      endDate: camp.endDate ? new Date(camp.endDate).toISOString().split('T')[0] : '',
      freeOffers: camp.freeOffers ?? '',
      discountedOffers: camp.discountedOffers ?? '',
      availableProcedures: camp.availableProcedures ?? '',
      galleryImages: camp.galleryImages ?? '',
      morningTime: camp.morningTime ?? '',
      eveningTime: camp.eveningTime ?? '',
      dailyCapacity: camp.dailyCapacity ? String(camp.dailyCapacity) : '',
      location: camp.location ?? '',
    });
    setShowAddDialog(true);
  };

  const filteredCamps = useMemo(() => {
    if (!camps) {
      return [];
    }
    let filtered = [...camps] as Camp[];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c: Camp) => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term)
      );
    }

    return campTable.sortData(filtered, (item: Camp, key: string) => {
      switch (key) {
        case 'name':
          return item.name;
        case 'slug':
          return item.slug;
        case 'isActive':
          return item.isActive ? 'active' : 'inactive';
        case 'startDate':
          return item.startDate;
        case 'endDate':
          return item.endDate;
        default:
          return item[key as keyof Camp];
      }
    });
  }, [camps, searchTerm, campTable]);

  // Calculate stats
  const totalCamps = camps?.length || 0;
  const activeCamps = camps?.filter((c: Camp) => c.isActive === true).length || 0;
  const inactiveCamps = camps?.filter((c: Camp) => c.isActive === false).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-card rounded-xl border border-gray-100 p-4">
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
      <CampsStats totalCamps={totalCamps} activeCamps={activeCamps} inactiveCamps={inactiveCamps} />

      {/* Toolbar */}
      <CampsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => {
          resetForm();
          setShowAddDialog(true);
        }}
        columnVisibilityProps={campTable.columnVisibilityProps}
      />

      {/* Table */}
      {filteredCamps.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 overflow-hidden">
          <EmptyState
            icon={Tent}
            title={searchTerm ? 'لا توجد نتائج مطابقة' : 'لا توجد مخيمات بعد'}
            description={
              searchTerm ? 'جرّب تغيير كلمات البحث' : 'ابدأ بإضافة أول مخيم طبي إلى النظام'
            }
            action={
              !searchTerm
                ? {
                    label: 'إضافة مخيم جديد',
                    onClick: () => {
                      resetForm();
                      setShowAddDialog(true);
                    },
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <CampsTable
          camps={filteredCamps}
          tableFeatures={{ campTable }}
          formatDate={formatDate}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={(camp) => deleteConfirm.openConfirm(camp)}
        />
      )}

      {/* Add/Edit Dialog */}
      <CampFormDialog
        isOpen={showAddDialog}
        onOpenChange={setShowAddDialog}
        editingCamp={editingCamp}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onOpenChange={() => deleteConfirm.closeConfirm()}
        itemName={deleteConfirm.item?.name}
        itemType="المخيم"
        onConfirm={() => {
          if (deleteConfirm.item) {
            deleteMutation.mutate({ id: deleteConfirm.item.id });
          }
        }}
        isLoading={deleteMutation.isPending}
        confirmText="حذف المخيم"
      />
    </div>
  );
}
