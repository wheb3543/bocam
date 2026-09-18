import { useState, useMemo, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc';
import { useExportUtils } from '@/hooks/export/useExportUtils';
import { useFilterUtils } from '@/hooks/table/useFilterUtils';
import { useTableFeatures } from '@/hooks/table/useTableFeatures';
import type { AppointmentWithDoctor } from '@shared/types';
import { SOURCE_LABELS } from '@shared/sources';
import { appointmentStatusLabels as statusLabels } from '@/hooks/data/useStatusLabels';
import type { ColumnConfig } from '@/components/table/ColumnVisibility';
import type { PageSizeValue } from '@/components/table/Pagination';

interface Doctor {
  id: number;
  name: string;
  slug: string;
  specialty: string;
  image: string | null;
  bio: string | null;
  experience: string | null;
  languages: string | null;
  consultationFee: string | null;
  isVisiting: 'yes' | 'no';
  available: 'yes' | 'no';
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

interface UseAppointmentsProps {
  _userRole?: string;
}

export function useAppointments({ _userRole }: UseAppointmentsProps = {}) {
  const utils = trpc.useUtils();

  // State
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDoctor | null>(
    null
  );
  const [appointmentStatusDialogOpen, setAppointmentStatusDialogOpen] = useState(false);
  const [newAppointmentStatus, setNewAppointmentStatus] = useState('');
  const [appointmentStatusNotes, setAppointmentStatusNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<number[]>([]);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentPageSize, setAppointmentPageSize] = useState<PageSizeValue>('100');

  // Filter state
  const appointmentFilter = useFilterUtils<AppointmentWithDoctor>();
  const dateRange = appointmentFilter.filters.dateRange;
  const setDateRange = appointmentFilter.filters.setDateRange;
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
    { key: 'whatsapp', label: 'WhatsApp', defaultVisible: true, sortable: false },
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
      dateFrom: dateRange.from ? dateRange.from.toISOString() : undefined,
      dateTo: dateRange.to ? dateRange.to.toISOString() : undefined,
      dateFilter: dateFilter !== 'all' ? (dateFilter as 'today' | 'week' | 'month') : undefined,
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
  const appointments = useMemo(() => appointmentsData?.data || [], [appointmentsData?.data]);
  const { data: doctors = [] } = trpc.doctors.list.useQuery();

  // Mutations
  const deleteAppointmentMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      utils.appointments.listPaginated.invalidate();
    },
  });

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
          if (!old) {
            return old;
          }
          return {
            ...old,
            data: old.data.map((apt) =>
              apt.id === variables.id
                ? { ...apt, status: variables.status as AppointmentWithDoctor['status'] }
                : apt
            ),
          };
        }
      );
      return { previousData };
    },
    onSuccess: () => {
      setAppointmentStatusDialogOpen(false);
      setSelectedAppointment(null);
      setNewAppointmentStatus('');
      setAppointmentStatusNotes('');
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        utils.appointments.listPaginated.setData(
          {
            page: appointmentPageSize === 'all' ? 1 : appointmentPage,
            limit: appointmentLimit,
            searchTerm: debouncedAppointmentSearch,
            dateFrom: dateRange.from ? dateRange.from.toISOString() : undefined,
            dateTo: dateRange.to ? dateRange.to.toISOString() : undefined,
          },
          context.previousData
        );
      }
    },
    onSettled: () => {
      utils.appointments.listPaginated.invalidate();
    },
  });

  const bulkUpdateAppointmentsMutation = trpc.appointments.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      utils.appointments.listPaginated.invalidate();
      setSelectedAppointmentIds([]);
    },
  });

  // Computed values
  const filteredAppointments = useMemo(() => {
    if (!appointments) {
      return [];
    }
    const filtered = [...appointments];
    const sorted = appointmentTable.sortData(filtered, (item, key) => {
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
          return item.doctorName;
        case 'specialty':
          return item.doctorSpecialty;
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
        case 'source':
          return item.source;
        case 'receiptNumber':
          return item.receiptNumber;
        default:
          return (item as Record<string, unknown>)[key];
      }
    });
    if (!appointmentTable.sortState.direction) {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [appointments, appointmentTable]);

  const appointmentStats = useMemo(() => {
    if (!appointments) {
      return { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
    }
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    };
  }, [appointments]);

  // Export
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
    ],
    mapToExportRow: (appointment: AppointmentWithDoctor) => ({
      date: appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toLocaleDateString('ar-SA')
        : '-',
      name: appointment.fullName,
      phone: appointment.phone,
      doctor: appointment.doctorName || '-',
      specialty: appointment.doctorSpecialty || '-',
      source: SOURCE_LABELS[appointment.source || ''] || appointment.source || '-',
      receiptNumber: appointment.receiptNumber || '-',
      status: statusLabels[appointment.status] || appointment.status,
    }),
    mapToPrintRow: (appointment: AppointmentWithDoctor) => ({
      date: appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toLocaleDateString('ar-SA')
        : '-',
      name: appointment.fullName,
      phone: appointment.phone,
      doctor: appointment.doctorName || '-',
      specialty: appointment.doctorSpecialty || '-',
      source: SOURCE_LABELS[appointment.source || ''] || appointment.source || '-',
      receiptNumber: appointment.receiptNumber || '-',
      status: statusLabels[appointment.status] || appointment.status,
    }),
  });

  const getAppointmentExportOptions = useCallback(() => {
    const activeFilters = appointmentExport.buildActiveFilters([
      { label: 'البحث', value: debouncedAppointmentSearch || undefined },
      {
        label: 'الحالة',
        value:
          appointmentStatusFilter.length > 0
            ? appointmentStatusFilter.map((s) => statusLabels[s] || s).join(', ')
            : undefined,
      },
      {
        label: 'المصدر',
        value:
          appointmentSourceFilter.length > 0
            ? appointmentSourceFilter.map((s) => SOURCE_LABELS[s] || s).join(', ')
            : undefined,
      },
      {
        label: 'الطبيب',
        value:
          selectedDoctor.length > 0
            ? selectedDoctor
                .map((id) => {
                  const doctor = doctors.find((d: Doctor) => d.id.toString() === id);
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

  // Handlers
  const handleAppointmentStatusUpdate = useCallback(() => {
    if (!selectedAppointment || !newAppointmentStatus) {
      return;
    }
    updateAppointmentStatusMutation.mutate({
      id: selectedAppointment.id,
      status: newAppointmentStatus,
      staffNotes: appointmentStatusNotes,
    });
  }, [
    selectedAppointment,
    newAppointmentStatus,
    appointmentStatusNotes,
    updateAppointmentStatusMutation,
  ]);

  const handleDeleteAppointment = useCallback(
    async (id: number) => {
      await deleteAppointmentMutation.mutateAsync({ id });
    },
    [deleteAppointmentMutation]
  );

  const handleViewDetails = useCallback((appointment: AppointmentWithDoctor) => {
    setSelectedAppointment(appointment);
    setNewAppointmentStatus(appointment.status || 'pending');
    setAppointmentDate(
      appointment.appointmentDate
        ? appointment.appointmentDate instanceof Date
          ? appointment.appointmentDate.toISOString()
          : appointment.appointmentDate
        : ''
    );
    setAppointmentStatusDialogOpen(true);
  }, []);

  const resetFilters = useCallback(() => {
    appointmentFilter.filters.resetAll();
    setAppointmentPage(1);
    setSelectedAppointmentIds([]);
  }, [appointmentFilter]);

  return {
    // State
    selectedAppointment,
    appointmentStatusDialogOpen,
    newAppointmentStatus,
    appointmentStatusNotes,
    appointmentDate,
    selectedAppointmentIds,
    appointmentPage,
    appointmentPageSize,
    appointmentsLoading,

    // Filter state
    dateRange,
    setDateRange,
    appointmentSearchTerm,
    setAppointmentSearchTerm,
    selectedDoctor,
    setSelectedDoctor,
    appointmentStatusFilter,
    setAppointmentStatusFilter,
    appointmentSourceFilter,
    setAppointmentSourceFilter,
    dateFilter,
    setDateFilter,
    appointmentFilter,

    // Data
    appointments,
    appointmentsData,
    filteredAppointments,
    doctors,
    appointmentStats,
    appointmentColumns,
    appointmentTable,
    appointmentExport,

    // Mutations
    deleteAppointmentMutation,
    updateAppointmentStatusMutation,
    bulkUpdateAppointmentsMutation,

    // Actions
    setSelectedAppointment,
    setAppointmentStatusDialogOpen,
    setNewAppointmentStatus,
    setAppointmentStatusNotes,
    setAppointmentDate,
    setSelectedAppointmentIds,
    setAppointmentPage,
    setAppointmentPageSize,
    handleAppointmentStatusUpdate,
    handleDeleteAppointment,
    handleViewDetails,
    resetFilters,
    getAppointmentExportOptions,
  };
}
