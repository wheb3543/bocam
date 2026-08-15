
import { useState, useMemo, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/api/trpc';
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { unifiedStatusLabels as statusLabels } from '@/hooks/data/useStatusLabels';
import AppointmentCard from '@/components/booking/AppointmentCard';
import AppointmentStatsCards from '@/components/booking/AppointmentStatsCards';
import AppointmentFilters from '@/components/booking/AppointmentFilters';
import AppointmentTableDesktop from '@/components/booking/AppointmentTableDesktop';
import { type ColumnConfig } from '@/components/table/ColumnVisibility';
import { useTableFeatures } from '@/hooks/table/useTableFeatures';
import TableSkeleton from '@/components/table/TableSkeleton';
import EmptyState from '@/components/EmptyState';
import Pagination, { type PageSizeValue } from '@/components/table/Pagination';
import { useExportUtils } from '@/hooks/export/useExportUtils';
import { printReceipt } from '@/components/booking/PrintReceipt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarOff, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { SOURCE_LABELS } from '@shared/sources';
import BulkActionsManager from '@/components/BulkActionsManager';
import type { Appointment, AppointmentWithDoctor } from '@shared/types';
import type { UseFilterUtilsReturn } from '@/hooks/table/useFilterUtils';

interface Doctor {
  id?: number;
  name?: string;
  [key: string]: unknown;
}


interface FilterOptions {
  statusFilter?: string[];
  sourceFilter?: string[];
  categoryFilter?: string[];
  dateFilter?: { from?: Date; to?: Date } | 'all';
  searchTerm?: string;
}

type AppointmentStatus = 'pending' | 'contacted' | 'no_answer' | 'confirmed' | 'attended' | 'completed' | 'cancelled';

type DateFilterPreset = 'today' | 'week' | 'month' | 'all';

interface AppointmentsTabProps {
  appointmentFilter: UseFilterUtilsReturn<AppointmentWithDoctor>;
  dateRange: { from: Date; to: Date };
  onOpenAppointmentDialog: (appointment: AppointmentWithDoctor) => void;
}

export default function AppointmentsTab({
  appointmentFilter,
  dateRange,
  onOpenAppointmentDialog,
}: AppointmentsTabProps) {
  const { formatDate } = useFormatDate();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Pagination state
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentPageSize, setAppointmentPageSize] = useState<PageSizeValue>('100');
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<number[]>([]);

  // Filter aliases
  const appointmentSearchTerm = appointmentFilter.filters.searchTerm;
  const setAppointmentSearchTerm = appointmentFilter.filters.setSearchTerm;
  const selectedDoctor = appointmentFilter.filters.categoryFilter;
  const setSelectedDoctor = appointmentFilter.filters.setCategoryFilter;
  const appointmentStatusFilter = appointmentFilter.filters.statusFilter;
  const setAppointmentStatusFilter = appointmentFilter.filters.setStatusFilter;
  const appointmentSourceFilter = appointmentFilter.filters.sourceFilter;
  const setAppointmentSourceFilter = appointmentFilter.filters.setSourceFilter;
  const dateFilter = appointmentFilter.filters.dateFilter;
  const setDateFilter = appointmentFilter.filters.setDateFilter;
  const debouncedAppointmentSearch = appointmentFilter.filters.debouncedSearch;

  // Convert dateFilter to string for AppointmentFilters component
  const dateFilterString = useMemo(() => {
    if (!dateFilter) {return 'all';}
    if (typeof dateFilter === 'string') {return dateFilter;}
    return 'custom';
  }, [dateFilter]);

  const handleDateFilterChange = useCallback((value: string) => {
    if (value === 'custom') {
      // Keep existing custom date range or set default
      if (dateFilter && typeof dateFilter !== 'string') {
        setDateFilter(dateFilter);
      } else {
        setDateFilter({ from: new Date(), to: new Date() } as unknown as DateFilterPreset);
      }
    } else {
      setDateFilter(value as DateFilterPreset);
    }
  }, [dateFilter, setDateFilter]);

  // Column visibility state
  const appointmentColumns: ColumnConfig[] = [
    { key: 'checkbox', label: 'تحديد', defaultVisible: true, sortable: false },
    { key: 'receiptNumber', label: 'رقم السند', defaultVisible: true, sortType: 'string' },
    { key: 'date', label: 'تاريخ الحجز', defaultVisible: true, sortType: 'date' },
    { key: 'name', label: 'اسم المريض', defaultVisible: true, sortType: 'string' },
    { key: 'phone', label: 'رقم الهاتف', defaultVisible: true, sortType: 'string' },
    { key: 'email', label: 'البريد الإلكتروني', defaultVisible: false, sortType: 'string' },
    { key: 'age', label: 'العمر', defaultVisible: false, sortType: 'number' },
    { key: 'doctor', label: 'الطبيب', defaultVisible: true, sortType: 'string' },
    { key: 'specialty', label: 'التخصص', defaultVisible: true, sortType: 'string' },
    { key: 'procedure', label: 'الإجراء الطبي', defaultVisible: false, sortType: 'string' },
    { key: 'preferredDate', label: 'التاريخ المفضل', defaultVisible: false, sortType: 'date' },
    { key: 'preferredTime', label: 'الوقت المفضل', defaultVisible: false, sortType: 'string' },
    { key: 'appointmentDate', label: 'موعد المقابلة', defaultVisible: false, sortType: 'date' },
    { key: 'notes', label: 'ملاحظات المريض', defaultVisible: false, sortable: false },
    { key: 'additionalNotes', label: 'ملاحظات إضافية', defaultVisible: false, sortable: false },
    { key: 'staffNotes', label: 'ملاحظات الموظفين', defaultVisible: false, sortable: false },
    { key: 'status', label: 'الحالة', defaultVisible: true, sortType: 'string' },
    { key: 'contactedAt', label: 'وقت التواصل', defaultVisible: false, sortType: 'date' },
    { key: 'confirmedAt', label: 'وقت التأكيد', defaultVisible: false, sortType: 'date' },
    { key: 'attendedAt', label: 'وقت الحضور', defaultVisible: false, sortType: 'date' },
    { key: 'completedAt', label: 'وقت الاكتمال', defaultVisible: false, sortType: 'date' },
    { key: 'cancelledAt', label: 'وقت الإلغاء', defaultVisible: false, sortType: 'date' },
    { key: 'source', label: 'المصدر', defaultVisible: true, sortType: 'string' },
    { key: 'utmSource', label: 'UTM Source', defaultVisible: false, sortType: 'string' },
    { key: 'utmMedium', label: 'UTM Medium', defaultVisible: false, sortType: 'string' },
    { key: 'utmCampaign', label: 'UTM Campaign', defaultVisible: false, sortType: 'string' },
    { key: 'utmTerm', label: 'UTM Term', defaultVisible: false, sortType: 'string' },
    { key: 'utmContent', label: 'UTM Content', defaultVisible: false, sortType: 'string' },
    { key: 'utmPlacement', label: 'UTM Placement', defaultVisible: false, sortType: 'string' },
    { key: 'referrer', label: 'المحيل', defaultVisible: false, sortType: 'string' },
    { key: 'fbclid', label: 'Facebook Click ID', defaultVisible: false, sortType: 'string' },
    { key: 'gclid', label: 'Google Click ID', defaultVisible: false, sortType: 'string' },
    { key: 'comments', label: 'التعليقات', defaultVisible: true, sortable: false },
    { key: 'tasks', label: 'المهام', defaultVisible: true, sortable: false },
    { key: 'actions', label: 'الإجراءات', defaultVisible: true, sortable: false },
  ];

  const appointmentTable = useTableFeatures({
    tableKey: 'appointments',
    columns: appointmentColumns,
  });

  // Reset page when filters change
  useEffect(() => {
    setAppointmentPage(1);
  }, [
    debouncedAppointmentSearch,
    dateRange.from,
    dateRange.to,
    appointmentStatusFilter,
    appointmentSourceFilter,
    selectedDoctor,
    dateFilter,
  ]);

  const appointmentLimit = appointmentPageSize === 'all' ? 100000 : parseInt(appointmentPageSize);
  const { data: appointmentsData, isLoading: appointmentsLoading } =
    trpc.appointments.listPaginated.useQuery({
      page: appointmentPageSize === 'all' ? 1 : appointmentPage,
      limit: appointmentLimit,
      searchTerm: debouncedAppointmentSearch,
      dateFrom: dateRange.from.toISOString(),
      dateTo: dateRange.to.toISOString(),
      dateFilter: dateFilter !== 'all' ? (dateFilter as DateFilterPreset) : 'all',
      doctorIds:
        selectedDoctor && selectedDoctor.length > 0 ? selectedDoctor.map(Number) : undefined,
      sources:
        appointmentSourceFilter && appointmentSourceFilter.length > 0
          ? appointmentSourceFilter
          : undefined,
      statuses:
        appointmentStatusFilter && appointmentStatusFilter.length > 0
          ? appointmentStatusFilter
          : undefined,
    });
  const appointments = useMemo(() => (appointmentsData?.data || []) as unknown as AppointmentWithDoctor[], [appointmentsData?.data]);
  const { data: doctors = [] } = trpc.doctors.list.useQuery();

  const updateAppointmentStatusMutation = trpc.appointments.updateStatus.useMutation({
    onMutate: async (variables) => {
      await utils.appointments.listPaginated.cancel();
      const previousData = utils.appointments.listPaginated.getData();
      utils.appointments.listPaginated.setData(
        {
          page: appointmentPageSize === 'all' ? 1 : appointmentPage,
          limit: appointmentLimit,
          searchTerm: debouncedAppointmentSearch,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString(),
        },
        (old) => {
          if (!old) {return old;}
          return {
            ...old,
            data: old.data.map((apt) =>
              apt.id === variables.id ? { ...apt, status: variables.status as AppointmentStatus } : apt
            ),
          };
        }
      );
      return { previousData };
    },
    onSuccess: () => {
      toast.success('تم تحديث حالة الموعد بنجاح');
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        utils.appointments.listPaginated.setData(
          {
            page: appointmentPageSize === 'all' ? 1 : appointmentPage,
            limit: appointmentLimit,
            searchTerm: debouncedAppointmentSearch,
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString(),
          },
          context.previousData
        );
      }
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
    onSettled: () => {
      utils.appointments.listPaginated.invalidate();
    },
  });

  const bulkUpdateAppointmentsMutation = trpc.appointments.bulkUpdateStatus.useMutation({
    onSuccess: (data) => {
      toast.success(`تم تحديث ${data.count} موعد بنجاح`);
      utils.appointments.listPaginated.invalidate();
      setSelectedAppointmentIds([]);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
  });

  const deleteAppointmentMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الموعد بنجاح');
      utils.appointments.listPaginated.invalidate();
    },
    onError: () => toast.error('فشل في حذف الموعد'),
  });

  const filteredAppointments = useMemo(() => {
    if (!appointments) {return [];}
    const filtered = [...appointments];
    const sorted = appointmentTable.sortData(filtered, (item, key: string) => {
      switch (key) {
        case 'date':
          return item.createdAt;
        case 'name':
          return item.fullName || '';
        case 'phone':
          return item.phone;
        case 'email':
          return item.email;
        case 'age':
          return item.age;
        case 'doctor':
          return item.doctorId ? `Doctor #${item.doctorId}` : '-';
        case 'specialty':
          return '-';
        case 'procedure':
          return item.procedure;
        case 'preferredDate':
          return item.preferredDate;
        case 'preferredTime':
          return item.preferredTime;
        case 'appointmentDate':
          return item.appointmentDate;
        case 'status':
          return item.status;
        case 'receiptNumber':
          return item.receiptNumber;
        default:
          return item[key as keyof AppointmentWithDoctor];
      }
    });
    if (!appointmentTable.sortState.direction) {
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return sorted;
  }, [appointments, appointmentTable]);

  const appointmentStats = useMemo(() => {
    if (!appointments)
      {return {
        total: 0,
        pending: 0,
        contacted: 0,
        no_answer: 0,
        confirmed: 0,
        attended: 0,
        completed: 0,
        cancelled: 0,
      };}
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      contacted: appointments.filter((a) => a.status === 'contacted').length,
      no_answer: appointments.filter((a) => a.status === 'no_answer').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      attended: appointments.filter((a) => a.status === 'attended').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    };
  }, [appointments]);

  // Export utils
  const appointmentExport = useExportUtils({
    tableName: 'مواعيد الأطباء',
    filenamePrefix: 'مواعيد_الأطباء',
    exportColumns: [
      { key: 'date', label: 'التاريخ' },
      { key: 'name', label: 'اسم المريض' },
      { key: 'phone', label: 'الهاتف' },
      { key: 'doctor', label: 'الطبيب' },
      { key: 'specialty', label: 'التخصص' },
      { key: 'source', label: 'المصدر' },
      { key: 'receiptNumber', label: 'رقم السند' },
      { key: 'status', label: 'الحالة' },
    ],
    printColumns: [
      { key: 'date', label: 'التاريخ' },
      { key: 'name', label: 'اسم المريض' },
      { key: 'phone', label: 'الهاتف' },
      { key: 'doctor', label: 'الطبيب' },
      { key: 'specialty', label: 'التخصص' },
      { key: 'source', label: 'المصدر' },
      { key: 'receiptNumber', label: 'رقم السند' },
      { key: 'status', label: 'الحالة' },
      { key: 'comments', label: 'التعليقات' },
      { key: 'tasks', label: 'المهام' },
      { key: 'actions', label: 'الإجراءات' },
    ],
    mapToExportRow: (appointment: Appointment) => ({
      date: formatDate(appointment.appointmentDate),
      name: appointment.fullName,
      phone: appointment.phone,
      doctor: appointment.doctorId ? `Doctor #${appointment.doctorId}` : '-',
      specialty: '-',
      source: SOURCE_LABELS[appointment.source || ''] || appointment.source || '-',
      receiptNumber: appointment.receiptNumber || '-',
      status: statusLabels[appointment.status as keyof typeof statusLabels] || appointment.status,
    }),
    mapToPrintRow: (appointment: Appointment) => ({
      date: formatDate(appointment.appointmentDate),
      name: appointment.fullName,
      phone: appointment.phone,
      doctor: appointment.doctorId ? `Doctor #${appointment.doctorId}` : '-',
      specialty: '-',
      source: SOURCE_LABELS[appointment.source || ''] || appointment.source || '-',
      receiptNumber: appointment.receiptNumber || '-',
      status: statusLabels[appointment.status as keyof typeof statusLabels] || appointment.status,
      comments: '-',
      tasks: '-',
      actions: '-',
    }),
  });

  const getAppointmentExportOptions = useCallback(() => {
    const activeFilters = appointmentExport.buildActiveFilters([
      { label: 'البحث', value: debouncedAppointmentSearch || undefined },
      {
        label: 'الحالة',
        value:
          appointmentStatusFilter.length > 0
            ? appointmentStatusFilter
                .map((s: string) => statusLabels[s as keyof typeof statusLabels])
                .join(', ')
            : undefined,
      },
      {
        label: 'المصدر',
        value:
          appointmentSourceFilter.length > 0
            ? appointmentSourceFilter.map((s: string) => SOURCE_LABELS[s] || s).join(', ')
            : undefined,
      },
      {
        label: 'الطبيب',
        value:
          selectedDoctor.length > 0
            ? selectedDoctor
                .map((id: string) => {
                  const doctor = doctors.find((d: Doctor) => d.id?.toString() === id);
                  return doctor ? doctor.name : id;
                })
                .join(', ')
            : undefined,
      },
    ]);
    return {
      data: filteredAppointments,
      activeFilters,
      dateRangeStr: appointmentExport.formatDateRange(dateRange.from, dateRange.to),
      visibleColumns: appointmentTable.visibleColumns,
    };
  }, [
    filteredAppointments,
    debouncedAppointmentSearch,
    appointmentStatusFilter,
    appointmentSourceFilter,
    selectedDoctor,
    doctors,
    dateRange,
    appointmentTable.visibleColumns,
    appointmentExport,
  ]);

  const handleExportAppointments = useCallback(
    async (format: 'excel' | 'csv' | 'pdf') => {
      await appointmentExport.handleExport(format, getAppointmentExportOptions());
    },
    [appointmentExport, getAppointmentExportOptions]
  );

  const handlePrintAppointments = useCallback(() => {
    appointmentExport.handlePrint(getAppointmentExportOptions());
  }, [appointmentExport, getAppointmentExportOptions]);

  const handleUpdateStatus = useCallback(
    async (id: number, status: string) => {
      await updateAppointmentStatusMutation.mutateAsync({
        id,
        status: status as AppointmentStatus,
        staffNotes: '',
      });
    },
    [updateAppointmentStatusMutation]
  );

  return (
    <div className="space-y-4">
      <AppointmentStatsCards stats={appointmentStats} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>مواعيد الأطباء</CardTitle>
              <CardDescription>إدارة ومتابعة مواعيد الأطباء</CardDescription>
            </div>
            <div className="flex gap-2">
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <AppointmentFilters
            searchTerm={appointmentSearchTerm}
            onSearchChange={setAppointmentSearchTerm}
            doctors={doctors}
            selectedDoctor={selectedDoctor}
            onDoctorChange={setSelectedDoctor}
            dateFilter={dateFilterString}
            onDateFilterChange={handleDateFilterChange}
            statusFilter={appointmentStatusFilter}
            onStatusFilterChange={setAppointmentStatusFilter}
            sourceFilter={appointmentSourceFilter}
            onSourceFilterChange={setAppointmentSourceFilter}
            activeFilterCount={appointmentFilter.filters.activeFilterCount}
            onResetAll={() => {
              appointmentFilter.filters.resetAll();
              setAppointmentPage(1);
              setSelectedAppointmentIds([]);
            }}
            columns={appointmentColumns}
            visibleColumns={appointmentTable.visibleColumns}
            columnOrder={appointmentTable.columnOrder}
            onVisibilityChange={appointmentTable.handleColumnVisibilityChange}
            onColumnOrderChange={appointmentTable.handleColumnOrderChange}
            onResetColumns={appointmentTable.handleResetAll}
            allTemplates={appointmentTable.allTemplates}
            activeTemplateId={appointmentTable.activeTemplateId}
            onApplyTemplate={appointmentTable.handleApplyTemplate}
            onSaveTemplate={appointmentTable.handleSaveTemplate}
            onDeleteTemplate={appointmentTable.handleDeleteTemplate}
            columnWidths={appointmentTable.columnWidths.columnWidths}
            frozenColumns={appointmentTable.frozenColumns.frozenColumns}
            onToggleFrozen={appointmentTable.frozenColumns.toggleFrozen}
            isAdmin={user?.role === 'admin'}
            sharedTemplates={appointmentTable.sharedTemplates}
            onSaveSharedTemplate={appointmentTable.handleSaveSharedTemplate}
            onDeleteSharedTemplate={appointmentTable.handleDeleteSharedTemplate}
            currentFilters={{
              statusFilter: appointmentFilter.filters.statusFilter,
              sourceFilter: appointmentFilter.filters.sourceFilter,
              categoryFilter: appointmentFilter.filters.categoryFilter,
              dateFilter: appointmentFilter.filters.dateFilter,
              searchTerm: appointmentFilter.filters.searchTerm,
            }}
            onApplyFilter={(filters: FilterOptions) => {
              if (filters.statusFilter)
                {appointmentFilter.filters.setStatusFilter(filters.statusFilter);}
              else {appointmentFilter.filters.setStatusFilter([]);}
              if (filters.sourceFilter)
                {appointmentFilter.filters.setSourceFilter(filters.sourceFilter);}
              else {appointmentFilter.filters.setSourceFilter([]);}
              if (filters.categoryFilter)
                {appointmentFilter.filters.setCategoryFilter(filters.categoryFilter);}
              else {appointmentFilter.filters.setCategoryFilter([]);}
              if (filters.dateFilter) {appointmentFilter.filters.setDateFilter(filters.dateFilter as DateFilterPreset);}
              else {appointmentFilter.filters.setDateFilter('all');}
              if (filters.searchTerm) {appointmentFilter.filters.setSearchTerm(filters.searchTerm);}
              else {appointmentFilter.filters.setSearchTerm('');}
            }}
            onExport={handleExportAppointments}
            onPrint={handlePrintAppointments}
          />

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {appointmentsLoading ? (
              <TableSkeleton rows={3} columns={4} />
            ) : filteredAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarOff}
                title="لا توجد مواعيد"
                description="لم يتم العثور على أي مواعيد في الفترة المحددة. جرب تغيير الفلاتر أو إضافة موعد جديد."
              />
            ) : (
              filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={`appointment-${appointment.id}`}
                  appointment={appointment}
                  onViewDetails={onOpenAppointmentDialog}
                  onPrint={() => {
                    const doctorName = `طبيب #${appointment.doctorId}`;
                    printReceipt(
                      {
                        fullName: appointment.fullName,
                        phone: appointment.phone,
                        age: appointment.age ?? undefined,
                        registrationDate: new Date(appointment.createdAt),
                        type: 'appointment',
                        typeName: doctorName,
                      },
                      user?.name || 'مستخدم'
                    );
                  }}
                />
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <AppointmentTableDesktop
            appointments={filteredAppointments}
            isLoading={appointmentsLoading}
            columns={appointmentColumns}
            visibleColumns={appointmentTable.visibleColumns}
            columnOrder={appointmentTable.columnOrder}
            frozenColumns={appointmentTable.frozenColumns.frozenColumns}
            columnWidths={appointmentTable.columnWidths}
            getSortProps={appointmentTable.getSortProps}
            selectedIds={selectedAppointmentIds}
            onSelectionChange={setSelectedAppointmentIds}
            onOpenDialog={onOpenAppointmentDialog}
            onUpdateStatus={handleUpdateStatus}
            userName={user?.name || 'مستخدم'}
          />

          {/* Pagination */}
          <Pagination
            currentPage={appointmentPage}
            totalPages={appointmentsData?.totalPages || 1}
            onPageChange={(page) => {
              setAppointmentPage(page);
              setSelectedAppointmentIds([]);
            }}
            totalItems={appointmentsData?.total || 0}
            itemsPerPage={appointmentLimit}
            pageSize={appointmentPageSize}
            onPageSizeChange={(size) => {
              setAppointmentPageSize(size);
              setAppointmentPage(1);
              setSelectedAppointmentIds([]);
            }}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions Manager */}
      <BulkActionsManager
        selectedCount={selectedAppointmentIds.length}
        onClear={() => setSelectedAppointmentIds([])}
        showBar={true}
        position="bottom"
        size="normal"
        actions={[
          {
            type: 'status-update',
            label: 'تحديث الحالة',
            variant: 'default',
            icon: <CheckSquare className="h-4 w-4" />,
            statusOptions: [
              { value: 'pending', label: 'قيد الانتظار' },
              { value: 'contacted', label: 'تم التواصل' },
              { value: 'no_answer', label: 'لم يرد' },
              { value: 'confirmed', label: 'مؤكد' },
              { value: 'attended', label: 'حضر' },
              { value: 'completed', label: 'مكتمل' },
              { value: 'cancelled', label: 'ملغي' },
            ],
            onStatusConfirm: (newStatus: string) => {
              bulkUpdateAppointmentsMutation.mutate({
                ids: selectedAppointmentIds,
                status: newStatus as
                  | 'pending'
                  | 'contacted'
                  | 'no_answer'
                  | 'confirmed'
                  | 'attended'
                  | 'completed'
                  | 'cancelled',
              });
            },
            isLoading: bulkUpdateAppointmentsMutation.isPending,
          },
          {
            type: 'delete',
            label: 'حذف الكل',
            variant: 'destructive',
            confirmTitle: 'تأكيد الحذف الجماعي',
            confirmDescription: `هل أنت متأكد من حذف ${selectedAppointmentIds.length} موعد؟ هذا الإجراء لا يمكن التراجع عنه.`,
            onConfirm: async () => {
              // Delete each appointment one by one
              for (const id of selectedAppointmentIds) {
                await deleteAppointmentMutation.mutateAsync({ id });
              }
              setSelectedAppointmentIds([]);
              toast.success(`تم حذف ${selectedAppointmentIds.length} موعد بنجاح`);
            },
            isLoading: deleteAppointmentMutation.isPending,
          },
          {
            type: 'export',
            label: 'تصدير',
            variant: 'outline',
            exportFormats: [
              { value: 'csv', label: 'CSV' },
              { value: 'excel', label: 'Excel' },
            ],
            onExport: () => {
              const _selectedAppointments = appointments.filter((apt) =>
                selectedAppointmentIds.includes(apt.id)
              );
              // Export logic here
              toast.success('تم تصدير البيانات بنجاح');
            },
          },
        ]}
      />
    </div>
  );
}