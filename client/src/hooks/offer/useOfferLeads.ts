import { useState, useMemo, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/api/trpc';
import { useFilterUtils } from '@/hooks/table/useFilterUtils';
import { useTableFeatures } from '@/hooks/table/useTableFeatures';
import { useExportUtils } from '@/hooks/export/useExportUtils';
import { toast } from 'sonner';
import type { ColumnConfig } from '@/components/table/ColumnVisibility';
import type { PageSizeValue } from '@/components/table/Pagination';

interface OfferLead {
  id: number;
  offerId: number;
  offerTitle: string | null;
  campaignId: number | null;
  fullName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status:
    'pending' | 'contacted' | 'no_answer' | 'confirmed' | 'attended' | 'completed' | 'cancelled';
  statusNotes: string | null;
  contactedAt: Date | null;
  confirmedAt: Date | null;
  attendedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  utmPlacement: string | null;
  referrer: string | null;
  fbclid: string | null;
  gclid: string | null;
  receiptNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

interface UseOfferLeadsProps {
  dateRange: { from: Date; to: Date };
  onPendingCountChange?: (count: number) => void;
}

const offerLeadColumns: ColumnConfig[] = [
  { key: 'checkbox', label: 'تحديد', defaultVisible: true, sortable: false },
  { key: 'receiptNumber', label: 'رقم السند', defaultVisible: true, sortType: 'string' },
  { key: 'name', label: 'الاسم الكامل', defaultVisible: true, sortType: 'string' },
  { key: 'phone', label: 'رقم الهاتف', defaultVisible: true, sortType: 'string' },
  { key: 'email', label: 'البريد الإلكتروني', defaultVisible: true, sortType: 'string' },
  { key: 'offer', label: 'العرض', defaultVisible: true, sortType: 'string' },
  { key: 'notes', label: 'ملاحظات العميل', defaultVisible: false, sortable: false },
  { key: 'status', label: 'الحالة', defaultVisible: true, sortType: 'string' },
  { key: 'statusNotes', label: 'ملاحظات الحالة', defaultVisible: false, sortable: false },
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
  { key: 'campaignId', label: 'الحملة', defaultVisible: false, sortType: 'number' },
  { key: 'contactedAt', label: 'وقت التواصل', defaultVisible: false, sortType: 'date' },
  { key: 'confirmedAt', label: 'وقت التأكيد', defaultVisible: false, sortType: 'date' },
  { key: 'attendedAt', label: 'وقت الحضور', defaultVisible: false, sortType: 'date' },
  { key: 'completedAt', label: 'وقت الاكتمال', defaultVisible: false, sortType: 'date' },
  { key: 'cancelledAt', label: 'وقت الإلغاء', defaultVisible: false, sortType: 'date' },
  { key: 'date', label: 'تاريخ التسجيل', defaultVisible: true, sortType: 'date' },
  { key: 'comments', label: 'التعليقات', defaultVisible: true, sortable: false },
  { key: 'tasks', label: 'المهام', defaultVisible: true, sortable: false },
  { key: 'whatsapp', label: 'WhatsApp', defaultVisible: true, sortable: false },
  { key: 'actions', label: 'الإجراءات', defaultVisible: true, sortable: false },
];

export function useOfferLeads({ dateRange, onPendingCountChange }: UseOfferLeadsProps) {
  const utils = trpc.useUtils();

  // State
  const [selectedLead, setSelectedLead] = useState<OfferLead | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [offerPage, setOfferPage] = useState(1);
  const [offerPageSize, setOfferPageSize] = useState<PageSizeValue>('100');

  // Filter utils
  const offerFilter = useFilterUtils<OfferLead>();
  const searchTerm = offerFilter.filters.searchTerm;
  const setSearchTerm = offerFilter.filters.setSearchTerm;
  const selectedOffer = offerFilter.filters.categoryFilter;
  const setSelectedOffer = offerFilter.filters.setCategoryFilter;
  const statusFilter = offerFilter.filters.statusFilter;
  const setStatusFilter = offerFilter.filters.setStatusFilter;
  const sourceFilter = offerFilter.filters.sourceFilter;
  const setSourceFilter = offerFilter.filters.setSourceFilter;
  const dateFilter = offerFilter.filters.dateFilter;
  const setDateFilter = offerFilter.filters.setDateFilter;
  const debouncedSearch = offerFilter.filters.debouncedSearch;

  // Table features
  const offerTable = useTableFeatures({
    tableKey: 'offerLeads',
    columns: offerLeadColumns,
  });

  // Mutations
  const generateReceiptNumberMutation = trpc.offerLeads.generateReceiptNumber.useMutation();
  const deleteLeadMutation = trpc.offerLeads.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الحجز بنجاح');
      utils.offerLeads.listPaginated.invalidate();
      utils.offerLeads.stats.invalidate();
    },
    onError: () => toast.error('فشل في حذف الحجز'),
  });

  const updateStatusMutation = trpc.offerLeads.updateStatus.useMutation({
    onMutate: async (variables) => {
      await utils.offerLeads.listPaginated.cancel();
      const previousData = utils.offerLeads.listPaginated.getData();

      utils.offerLeads.listPaginated.setData(
        {
          page: 1,
          limit: 10000,
          searchTerm: debouncedSearch,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString(),
        },
        (old) => {
          if (!old) {
            return old;
          }
          return {
            ...old,
            data: old.data.map((lead) =>
              lead.id === variables.id
                ? { ...lead, status: variables.status as OfferLead['status'] }
                : lead
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success('تم تحديث حالة الحجز بنجاح');
      setStatusDialogOpen(false);
      setSelectedLead(null);
      setNewStatus('');
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        utils.offerLeads.listPaginated.setData(
          {
            page: 1,
            limit: 10000,
            searchTerm: debouncedSearch,
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString(),
          },
          context.previousData
        );
      }
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
    onSettled: () => {
      utils.offerLeads.listPaginated.invalidate();
    },
  });

  const bulkUpdateMutation = trpc.offerLeads.bulkUpdateStatus.useMutation({
    onSuccess: (data) => {
      toast.success(`تم تحديث ${data.count} حجز بنجاح`);
      refetch();
      setSelectedIds([]);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
  });

  // Query
  const offerLimit = offerPageSize === 'all' ? 100000 : parseInt(offerPageSize);
  const {
    data: offerLeadsData,
    isLoading,
    refetch,
  } = trpc.offerLeads.listPaginated.useQuery({
    page: offerPageSize === 'all' ? 1 : offerPage,
    limit: offerLimit,
    searchTerm: debouncedSearch,
    dateFrom: dateRange.from.toISOString(),
    dateTo: dateRange.to.toISOString(),
    dateFilter: dateFilter !== 'all' ? (dateFilter as 'today' | 'week' | 'month') : undefined,
    offerIds: selectedOffer && selectedOffer.length > 0 ? selectedOffer.map(Number) : undefined,
    sources: sourceFilter && sourceFilter.length > 0 ? sourceFilter : undefined,
    statuses: statusFilter && statusFilter.length > 0 ? statusFilter : undefined,
  });

  const { data: stats } = trpc.offerLeads.stats.useQuery();

  const offerLeads = useMemo(() => offerLeadsData?.data || [], [offerLeadsData?.data]);

  // Pending count
  const pendingCount = useMemo(() => {
    return offerLeads?.filter((l) => l.status === 'pending').length || 0;
  }, [offerLeads]);

  useEffect(() => {
    if (onPendingCountChange) {
      onPendingCountChange(pendingCount);
    }
  }, [pendingCount, onPendingCountChange]);

  // Reset page when filters change
  useEffect(() => {
    setOfferPage(1);
  }, [
    debouncedSearch,
    dateRange.from,
    dateRange.to,
    statusFilter,
    sourceFilter,
    selectedOffer,
    dateFilter,
  ]);

  // Unique offers
  const uniqueOffers = useMemo(() => {
    if (!offerLeads) {
      return [];
    }
    const offers = offerLeads
      .filter((lead) => lead.offerTitle)
      .map((lead) => ({ id: lead.offerId, title: lead.offerTitle }));
    const unique = Array.from(new Map(offers.map((o) => [o.id, o])).values());
    return unique;
  }, [offerLeads]);

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    if (!offerLeads) {
      return [];
    }

    const filtered = [...offerLeads];

    const sorted = offerTable.sortData(filtered, (item, key: string) => {
      switch (key) {
        case 'date':
          return item.createdAt;
        case 'name':
          return item.fullName;
        case 'phone':
          return item.phone;
        case 'email':
          return item.email;
        case 'offer':
          return item.offerTitle;
        case 'source':
          return item.source;
        case 'receiptNumber':
          return item.receiptNumber;
        case 'status':
          return item.status;
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
        case 'campaignId':
          return item.campaignId;
        default:
          return (item as Record<string, unknown>)[key];
      }
    });

    if (!offerTable.sortState.direction) {
      sorted.sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return bDate - aDate;
      });
    }

    return sorted;
  }, [offerLeads, offerTable]);

  // Export utils
  const offerExport = useExportUtils({
    tableName: 'حجوزات العروض',
    filenamePrefix: 'حجوزات_العروض',
    exportColumns: [
      { key: 'receiptNumber', label: 'رقم السند' },
      { key: 'name', label: 'الاسم الكامل' },
      { key: 'phone', label: 'رقم الهاتف' },
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'offer', label: 'العرض' },
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
      { key: 'offer', label: 'العرض' },
      { key: 'source', label: 'المصدر' },
      { key: 'status', label: 'الحالة' },
      { key: 'date', label: 'تاريخ التسجيل' },
      { key: 'comments', label: 'التعليقات' },
      { key: 'tasks', label: 'المهام' },
      { key: 'actions', label: 'الإجراءات' },
    ],
    mapToExportRow: (lead: OfferLead) => ({
      receiptNumber: lead.receiptNumber || '-',
      name: lead.fullName,
      phone: lead.phone,
      email: lead.email || '-',
      offer: lead.offerTitle || '-',
      source: lead.source || '-',
      status: lead.status,
      date: lead.createdAt,
    }),
    mapToPrintRow: (lead: OfferLead) => ({
      checkbox: '-',
      receiptNumber: lead.receiptNumber || '-',
      name: lead.fullName,
      phone: lead.phone,
      email: lead.email || '-',
      offer: lead.offerTitle || '-',
      source: lead.source || '-',
      status: lead.status,
      date: lead.createdAt,
      comments: '-',
      tasks: '-',
      actions: '-',
    }),
  });

  // Handlers
  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        filteredLeads.map((lead) => lead.id).filter((id): id is number => id !== undefined)
      );
    }
  }, [selectedIds, filteredLeads]);

  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  const handleEditLead = useCallback((lead: OfferLead) => {
    setSelectedLead(lead);
    setStatusDialogOpen(true);
    setNewStatus(lead.status);
  }, []);

  const handleDeleteLead = useCallback(
    async (id: number) => {
      await deleteLeadMutation.mutateAsync({ id });
    },
    [deleteLeadMutation]
  );

  const handleViewDetails = useCallback((lead: OfferLead) => {
    setSelectedLead(lead);
    setStatusDialogOpen(true);
    setNewStatus(lead.status);
  }, []);

  return {
    // State
    selectedLead,
    statusDialogOpen,
    newStatus,
    selectedIds,
    offerPage,
    offerPageSize,
    searchTerm,
    selectedOffer,
    statusFilter,
    sourceFilter,
    dateFilter,

    // Data
    offerLeads: filteredLeads,
    offerLeadsData,
    stats,
    uniqueOffers,
    pendingCount,
    isLoading,

    // Table
    offerTable,
    offerLeadColumns,

    // Export
    offerExport,

    // Mutations
    generateReceiptNumberMutation,
    deleteLeadMutation,
    updateStatusMutation,
    bulkUpdateMutation,

    // Setters
    setSelectedLead,
    setStatusDialogOpen,
    setNewStatus,
    setSelectedIds,
    setOfferPage,
    setOfferPageSize,
    setSearchTerm,
    setSelectedOffer,
    setStatusFilter,
    setSourceFilter,
    setDateFilter,

    // Handlers
    handleSelectAll,
    handleSelectOne,
    handleEditLead,
    handleDeleteLead,
    handleViewDetails,
    refetch,
  };
}
