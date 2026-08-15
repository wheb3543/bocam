import { useState, useMemo, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/api/trpc';
import { skipToken } from '@tanstack/react-query';
import { useFilterUtils } from '@/hooks/table/useFilterUtils';
import { useTableFeatures } from '@/hooks/table/useTableFeatures';
import { useExportUtils } from '@/hooks/export/useExportUtils';
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';
import { toast } from 'sonner';
import { SOURCE_LABELS } from '@shared/sources';
import type { ColumnConfig } from '@/components/table/ColumnVisibility';
import type { PageSizeValue } from '@/components/table/Pagination';
import type { CampRegistration, CampStatus, CampStatusUpdateData, TimeSlot } from '@/types/camp';

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  contacted: 'تم التواصل',
  no_answer: 'لم يرد',
  confirmed: 'مؤكد',
  attended: 'حضر',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  contacted: 'bg-orange-500',
  no_answer: 'bg-gray-500',
  confirmed: 'bg-green-500',
  attended: 'bg-blue-500',
  completed: 'bg-teal-500',
  cancelled: 'bg-red-500',
};

function formatStatusTime(val: string | Date | unknown): string {
  if (!val) {
    return '-';
  }
  try {
    const d = new Date(val as string | number | Date);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'م' : 'ص';
    const h12 = h % 12 || 12;
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${h12}:${m} ${ampm}, ${dd}-${mm}-${yyyy}`;
  } catch {
    return '-';
  }
}

function campPresetDateRange(
  preset: 'all' | 'today' | 'week' | 'month' | 'custom',
  fallbackRange: { from: Date; to: Date }
): { from: Date; to: Date } {
  const now = new Date();
  if (preset === 'today') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
    };
  }
  if (preset === 'week') {
    return {
      from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
    };
  }
  if (preset === 'month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }
  if (preset === 'all') {
    return { from: new Date(2000, 0, 1), to: new Date(2099, 11, 31, 23, 59, 59, 999) };
  }
  return fallbackRange;
}

export function useCampRegistrations({
  dateRange,
  onDateRangeChange,
  onPendingCountChange,
}: {
  dateRange: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
  onPendingCountChange?: (count: number) => void;
}) {
  const { formatPhoneDisplay } = usePhoneFormat();
  const { formatDate, formatRegistrationDate } = useFormatDate();
  const utils = trpc.useUtils();
  const generateReceiptNumberMutation = trpc.campRegistrations.generateReceiptNumber.useMutation();
  const deleteRegMutation = trpc.campRegistrations.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف التسجيل بنجاح');
      utils.campRegistrations.listPaginated.invalidate();
      utils.campRegistrations.stats.invalidate();
    },
    onError: () => toast.error('فشل في حذف التسجيل'),
  });

  const [selectedRegistration, setSelectedRegistration] = useState<CampRegistration | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<TimeSlot>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Query لجلب المواعيد المتاحة للمخيم المحدد
  const { data: availableDates } = trpc.camps.getAvailableDates.useQuery(
    selectedRegistration?.campSlug ? { slug: selectedRegistration.campSlug } : skipToken,
    { enabled: !!selectedRegistration?.campSlug && statusDialogOpen }
  );

  // Pagination state
  const [campPage, setCampPage] = useState(1);
  const [campPageSize, setCampPageSize] = useState<PageSizeValue>('100');

  // === Unified filter state via useFilterUtils ===
  const campFilter = useFilterUtils<CampRegistration>();

  // Aliases for backward compatibility
  const searchTerm = campFilter.filters.searchTerm;
  const setSearchTerm = campFilter.filters.setSearchTerm;
  const selectedCamp = campFilter.filters.categoryFilter;
  const setSelectedCamp = campFilter.filters.setCategoryFilter;
  const statusFilter = campFilter.filters.statusFilter;
  const setStatusFilter = campFilter.filters.setStatusFilter;
  const sourceFilter = campFilter.filters.sourceFilter;
  const setSourceFilter = campFilter.filters.setSourceFilter;
  const dateFilter = campFilter.filters.dateFilter;
  const setDateFilter = campFilter.filters.setDateFilter;
  const campRegistrationsSearchTerm = campFilter.filters.searchTerm;
  const setCampRegistrationsSearchTerm = campFilter.filters.setSearchTerm;

  // Column visibility state for CampRegistrations
  const campRegColumns: ColumnConfig[] = [
    { key: 'checkbox', label: 'تحديد', defaultVisible: true, sortable: false },
    { key: 'receiptNumber', label: 'رقم السند', defaultVisible: true, sortType: 'string' },
    { key: 'name', label: 'الاسم الكامل', defaultVisible: true, sortType: 'string' },
    { key: 'phone', label: 'رقم الهاتف', defaultVisible: true, sortType: 'string' },
    { key: 'email', label: 'البريد الإلكتروني', defaultVisible: true, sortType: 'string' },
    { key: 'age', label: 'العمر', defaultVisible: true, sortType: 'number' },
    { key: 'gender', label: 'الجنس', defaultVisible: false, sortType: 'string' },
    { key: 'camp', label: 'المخيم', defaultVisible: true, sortType: 'string' },
    { key: 'procedures', label: 'الإجراءات المختارة', defaultVisible: false, sortable: false },
    { key: 'medicalCondition', label: 'الحالة الصحية', defaultVisible: false, sortable: false },
    { key: 'patientMessage', label: 'رسالة المريض', defaultVisible: false, sortable: false },
    { key: 'notes', label: 'ملاحظات المسجل', defaultVisible: false, sortable: false },
    { key: 'status', label: 'الحالة', defaultVisible: true, sortType: 'string' },
    { key: 'statusNotes', label: 'ملاحظات الحالة', defaultVisible: false, sortable: false },
    { key: 'contactedAt', label: 'وقت التواصل', defaultVisible: false, sortType: 'date' },
    { key: 'confirmedAt', label: 'وقت التأكيد', defaultVisible: false, sortType: 'date' },
    { key: 'attendedAt', label: 'وقت الحضور', defaultVisible: false, sortType: 'date' },
    { key: 'completedAt', label: 'وقت الاكتمال', defaultVisible: false, sortType: 'date' },
    { key: 'cancelledAt', label: 'وقت الإلغاء', defaultVisible: false, sortType: 'date' },
    { key: 'attendanceDate', label: 'تاريخ الحضور', defaultVisible: false, sortType: 'date' },
    { key: 'preferredDate', label: 'موعد الحضور', defaultVisible: true, sortType: 'string' },
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
    { key: 'date', label: 'تاريخ التسجيل', defaultVisible: true, sortType: 'date' },
    { key: 'comments', label: 'التعليقات', defaultVisible: true, sortable: false },
    { key: 'tasks', label: 'المهام', defaultVisible: true, sortable: false },
    { key: 'whatsapp', label: 'WhatsApp', defaultVisible: true, sortable: false },
    { key: 'actions', label: 'الإجراءات', defaultVisible: true, sortable: false },
  ];

  // === استخدام useTableFeatures الموحد لإدارة جميع ميزات الجدول ===
  const campTable = useTableFeatures({
    tableKey: 'campRegistrations',
    columns: campRegColumns,
  });

  // Debounced search - now managed by useFilterUtils
  const debouncedSearch = campFilter.filters.debouncedSearch;

  // Quick presets for FilterPresets component
  const quickPresets = [
    {
      id: 'today-new',
      name: 'تسجيلات اليوم - جديدة',
      filters: { dateFilter: 'today', status: ['pending'] },
    },
    {
      id: 'week-confirmed',
      name: 'تسجيلات الأسبوع - مؤكدة',
      filters: { dateFilter: 'week', status: ['confirmed'] },
    },
    {
      id: 'month-attended',
      name: 'تسجيلات الشهر - حضروا',
      filters: { dateFilter: 'month', status: ['attended'] },
    },
    {
      id: 'all-cancelled',
      name: 'جميع التسجيلات - ملغاة',
      filters: { dateFilter: 'all', status: ['cancelled'] },
    },
  ];

  const handleApplyPreset = useCallback(
    (filters: Record<string, unknown>) => {
      if (filters.dateFilter) {
        setDateFilter(filters.dateFilter as 'all' | 'today' | 'week' | 'month' | 'custom');
        onDateRangeChange?.(
          campPresetDateRange(
            filters.dateFilter as 'all' | 'today' | 'week' | 'month' | 'custom',
            dateRange
          )
        );
      }
      if (filters.status) {
        setStatusFilter(filters.status as string[]);
      }
      if (filters.source) {
        setSourceFilter(filters.source as string[]);
      }
      if (filters.searchTerm !== undefined) {
        setSearchTerm(filters.searchTerm as string);
      }
      if (filters.camp) {
        setSelectedCamp(filters.camp as string[]);
      }
    },
    [
      dateRange,
      onDateRangeChange,
      setDateFilter,
      setStatusFilter,
      setSourceFilter,
      setSearchTerm,
      setSelectedCamp,
    ]
  );

  const currentFilters = useMemo(
    () => ({
      dateFilter,
      status: statusFilter,
      source: sourceFilter,
      searchTerm,
      camp: selectedCamp,
    }),
    [dateFilter, statusFilter, sourceFilter, searchTerm, selectedCamp]
  );

  // Reset page when filters change
  useEffect(() => {
    setCampPage(1);
  }, [
    debouncedSearch,
    dateRange.from,
    dateRange.to,
    statusFilter,
    sourceFilter,
    selectedCamp,
    dateFilter,
  ]);

  const campLimit = campPageSize === 'all' ? 100000 : parseInt(campPageSize);
  const listPaginatedInput = useMemo(
    () => ({
      page: campPageSize === 'all' ? 1 : campPage,
      limit: campLimit,
      searchTerm: debouncedSearch,
      dateFrom: dateRange.from.toISOString(),
      dateTo: dateRange.to.toISOString(),
      ...(dateFilter !== 'all' ? { dateFilter: dateFilter as 'today' | 'week' | 'month' } : {}),
      campIds: selectedCamp && selectedCamp.length > 0 ? selectedCamp.map(Number) : undefined,
      sources: sourceFilter && sourceFilter.length > 0 ? sourceFilter : undefined,
      statuses: statusFilter && statusFilter.length > 0 ? statusFilter : undefined,
    }),
    [
      campPage,
      campPageSize,
      campLimit,
      debouncedSearch,
      dateRange.from,
      dateRange.to,
      dateFilter,
      selectedCamp,
      sourceFilter,
      statusFilter,
    ]
  );

  const {
    data: registrationsData,
    isLoading,
    refetch,
  } = trpc.campRegistrations.listPaginated.useQuery(listPaginatedInput);
  const registrations = useMemo(() => registrationsData?.data || [], [registrationsData?.data]);
  const { data: stats } = trpc.campRegistrations.stats.useQuery();

  // Count pending registrations (status = 'pending')
  const pendingCount = useMemo(() => {
    return registrations?.filter((r) => r.status === 'pending').length || 0;
  }, [registrations]);

  // Notify parent of pending count changes
  useEffect(() => {
    if (onPendingCountChange) {
      onPendingCountChange(pendingCount);
    }
  }, [pendingCount, onPendingCountChange]);

  const bulkUpdateMutation = trpc.campRegistrations.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success(`تم تحديث حالة ${selectedIds.length} تسجيل بنجاح`);
      refetch();
      setSelectedIds([]);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الحالات');
    },
  });

  const updateStatusMutation = trpc.campRegistrations.updateStatus.useMutation({
    onMutate: async (variables) => {
      await utils.campRegistrations.listPaginated.cancel();
      const previousData = utils.campRegistrations.listPaginated.getData(listPaginatedInput);

      utils.campRegistrations.listPaginated.setData(listPaginatedInput, (old) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          data: old.data.map((reg) =>
            reg.id === variables.id ? { ...reg, status: variables.status } : reg
          ),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success('تم تحديث حالة التسجيل بنجاح');
      setStatusDialogOpen(false);
      setSelectedRegistration(null);
      setNewStatus('');
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        utils.campRegistrations.listPaginated.setData(listPaginatedInput, context.previousData);
      }
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
    onSettled: () => {
      utils.campRegistrations.listPaginated.invalidate();
    },
  });

  // Get all camps for filter from database
  const { data: allCamps } = trpc.camps.getAll.useQuery();

  // Apply sorting to camp registrations (filtering is now done server-side)
  const filteredRegistrations = useMemo(() => {
    if (!registrations) {
      return [];
    }

    const filtered = [...registrations];

    // Apply sorting using useTableFeatures
    const sorted = campTable.sortData(filtered, (item: CampRegistration, key: string) => {
      switch (key) {
        case 'date':
          return item.createdAt;
        case 'name':
          return item.fullName;
        case 'phone':
          return item.phone;
        case 'email':
          return item.email;
        case 'age':
          return item.age;
        case 'gender':
          return item.gender;
        case 'camp':
          return item.campName;
        case 'source':
          return item.source;
        case 'receiptNumber':
          return item.receiptNumber;
        case 'status':
          return item.status;
        case 'attendanceDate':
          return item.attendanceDate;
        case 'utmSource':
          return item.utmSource;
        case 'utmMedium':
          return item.utmMedium;
        case 'utmCampaign':
          return item.utmCampaign;
        case 'utmTerm':
          return item.utmTerm;
        case 'utmContent':
          return item.utmContent;
        case 'utmPlacement':
          return item.utmPlacement;
        case 'referrer':
          return item.referrer;
        case 'fbclid':
          return item.fbclid;
        case 'gclid':
          return item.gclid;
        case 'preferredDate':
          return item.preferredDate;
        case 'patientMessage':
          return item.patientMessage;
        default:
          return item[key];
      }
    });

    // Default sort: newest first if no sort is active
    if (!campTable.sortState.direction) {
      sorted.sort((a: CampRegistration, b: CampRegistration) => {
        const aDate = new Date(a.createdAt || '').getTime();
        const bDate = new Date(b.createdAt || '').getTime();
        return bDate - aDate;
      });
    }

    return sorted;
  }, [registrations, campTable]);

  // useExportUtils hook لتسجيلات المخيمات
  const campExport = useExportUtils({
    tableName: 'تسجيلات المخيمات',
    filenamePrefix: 'تسجيلات_المخيمات',
    exportColumns: [
      { key: 'receiptNumber', label: 'رقم السند' },
      { key: 'name', label: 'الاسم الكامل' },
      { key: 'phone', label: 'رقم الهاتف' },
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'age', label: 'العمر' },
      { key: 'camp', label: 'المخيم' },
      { key: 'source', label: 'المصدر' },
      { key: 'status', label: 'الحالة' },
      { key: 'date', label: 'تاريخ التسجيل' },
    ],
    printColumns: [
      { key: 'checkbox', label: 'تحديد' },
      { key: 'receiptNumber', label: 'رقم السند' },
      { key: 'name', label: 'الاسم الكامل' },
      { key: 'phone', label: 'رقم الهاتف' },
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'age', label: 'العمر' },
      { key: 'camp', label: 'المخيم' },
      { key: 'source', label: 'المصدر' },
      { key: 'status', label: 'الحالة' },
      { key: 'date', label: 'تاريخ التسجيل' },
      { key: 'comments', label: 'التعليقات' },
      { key: 'tasks', label: 'المهام' },
      { key: 'actions', label: 'الإجراءات' },
    ],
    mapToExportRow: (reg: CampRegistration) => ({
      receiptNumber: reg.receiptNumber || '-',
      name: reg.fullName,
      phone: reg.phone,
      email: reg.email || '-',
      age: reg.age || '-',
      camp: reg.campName || '-',
      source: reg.source
        ? SOURCE_LABELS[reg.source as keyof typeof SOURCE_LABELS] || reg.source
        : '-',
      status: statusLabels[reg.status as keyof typeof statusLabels] || reg.status,
      date: formatDate(reg.createdAt),
    }),
    mapToPrintRow: (reg: CampRegistration) => ({
      checkbox: '-',
      receiptNumber: reg.receiptNumber || '-',
      name: reg.fullName,
      phone: reg.phone,
      email: reg.email || '-',
      age: reg.age || '-',
      camp: reg.campName || '-',
      source: reg.source
        ? SOURCE_LABELS[reg.source as keyof typeof SOURCE_LABELS] || reg.source
        : '-',
      status: statusLabels[reg.status as keyof typeof statusLabels] || reg.status,
      date: formatDate(reg.createdAt),
      comments: (reg.commentCount ?? 0) > 0 ? `${reg.commentCount} تعليق` : '-',
      tasks: (reg.taskCount ?? 0) > 0 ? `${reg.taskCount} مهمة` : '-',
      actions: '-',
    }),
  });

  const getCampExportOptions = useCallback(() => {
    const activeFilters = campExport.buildActiveFilters([
      { label: 'البحث', value: debouncedSearch || undefined },
      {
        label: 'الحالة',
        value:
          statusFilter.length > 0
            ? statusFilter.map((s) => statusLabels[s as keyof typeof statusLabels]).join(', ')
            : undefined,
      },
      {
        label: 'المصدر',
        value:
          sourceFilter.length > 0
            ? sourceFilter.map((s) => SOURCE_LABELS[s] || s).join(', ')
            : undefined,
      },
      { label: 'المخيم', value: selectedCamp.length > 0 ? selectedCamp.join(', ') : undefined },
    ]);
    return {
      data: filteredRegistrations,
      activeFilters,
      dateRangeStr: campExport.formatDateRange(dateRange.from, dateRange.to),
      visibleColumns: campTable.visibleColumns,
    };
  }, [
    filteredRegistrations,
    debouncedSearch,
    statusFilter,
    sourceFilter,
    selectedCamp,
    dateRange,
    campTable.visibleColumns,
    campExport,
  ]);

  const handleExportCampRegistrations = useCallback(
    async (format: 'excel' | 'csv' | 'pdf') => {
      await campExport.handleExport(format, getCampExportOptions());
    },
    [campExport, getCampExportOptions]
  );

  const handlePrintCampRegistrations = useCallback(() => {
    campExport.handlePrint(getCampExportOptions());
  }, [campExport, getCampExportOptions]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredRegistrations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        filteredRegistrations
          .map((reg: CampRegistration) => reg.id)
          .filter((id): id is number => id !== undefined)
      );
    }
  }, [selectedIds.length, filteredRegistrations]);

  const handleSelectOne = useCallback(
    (id: number) => {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    },
    [selectedIds]
  );

  const handleStatusUpdate = useCallback(() => {
    if (!selectedRegistration || !newStatus || !selectedRegistration.id) {
      return;
    }

    const updateData: CampStatusUpdateData = {
      id: selectedRegistration.id,
      status: newStatus as CampStatus,
    };

    // إضافة البيانات المعدلة إذا كانت الحالة مؤكد أو حضر
    if (newStatus === 'confirmed' || newStatus === 'attended') {
      if (editedName) {
        updateData.fullName = editedName;
      }
      if (editedPhone) {
        updateData.phone = editedPhone;
      }
      if (attendanceDate) {
        updateData.attendanceDate = new Date(attendanceDate);
      }
    }

    // إضافة موعد الحضور المفضل إذا تم تحديده
    if (preferredDate) {
      updateData.preferredDate = preferredDate;
    }
    if (preferredTimeSlot === 'morning' || preferredTimeSlot === 'evening') {
      updateData.preferredTimeSlot = preferredTimeSlot;
    }

    updateStatusMutation.mutate(updateData);
  }, [
    selectedRegistration,
    newStatus,
    editedName,
    editedPhone,
    attendanceDate,
    preferredDate,
    preferredTimeSlot,
    updateStatusMutation,
  ]);

  const handleEditRegistration = useCallback((reg: CampRegistration) => {
    setSelectedRegistration(reg);
    setNewStatus(reg.status ?? '');
    setEditedName(reg.fullName ?? '');
    setEditedPhone(reg.phone ?? '');
    setAttendanceDate(
      reg.attendanceDate ? new Date(reg.attendanceDate).toISOString().slice(0, 16) : ''
    );
    setPreferredDate(reg.preferredDate ?? '');
    setPreferredTimeSlot(reg.preferredTimeSlot ?? '');
    setStatusDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((reg: CampRegistration) => {
    setSelectedRegistration(reg);
    setDetailsDialogOpen(true);
  }, []);

  const resetFilters = useCallback(() => {
    campFilter.filters.resetAll();
    setCampPage(1);
    setSelectedIds([]);
  }, [campFilter]);

  return {
    // State
    selectedRegistration,
    setSelectedRegistration,
    statusDialogOpen,
    setStatusDialogOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,
    newStatus,
    setNewStatus,
    editedName,
    setEditedName,
    editedPhone,
    setEditedPhone,
    attendanceDate,
    setAttendanceDate,
    preferredDate,
    setPreferredDate,
    preferredTimeSlot,
    setPreferredTimeSlot,
    selectedIds,
    setSelectedIds,
    campPage,
    setCampPage,
    campPageSize,
    setCampPageSize,

    // Data
    registrations,
    filteredRegistrations,
    stats,
    allCamps,
    availableDates,
    isLoading,
    pendingCount,
    campLimit,
    registrationsData,

    // Filter state
    searchTerm,
    setSearchTerm,
    selectedCamp,
    setSelectedCamp,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    dateFilter,
    setDateFilter,
    campRegistrationsSearchTerm,
    setCampRegistrationsSearchTerm,
    campFilter,
    currentFilters,
    quickPresets,

    // Table features
    campTable,
    campRegColumns,

    // Mutations
    generateReceiptNumberMutation,
    deleteRegMutation,
    bulkUpdateMutation,
    updateStatusMutation,

    // Handlers
    handleApplyPreset,
    handleExportCampRegistrations,
    handlePrintCampRegistrations,
    handleSelectAll,
    handleSelectOne,
    handleStatusUpdate,
    handleEditRegistration,
    handleViewDetails,
    resetFilters,
    refetch,

    // Utilities
    formatPhoneDisplay,
    formatDate,
    formatRegistrationDate,
    formatStatusTime,
    statusLabels,
    statusColors,
    campPresetDateRange,
  };
}
