import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { SOURCE_LABELS } from '@shared/sources';
import { useOfferLeads } from '@/hooks/offer/useOfferLeads';
import OfferStatsCards from '@/components/offer/OfferStatsCards';
import OfferLeadCard from '@/components/offer/OfferLeadCard';
import BulkActionsManager from '@/components/BulkActionsManager';
import Pagination from '@/components/table/Pagination';
import {
  ResizableTable,
  ResizableHeaderCell,
  FrozenTableCell,
} from '@/components/table/ResizableTable';
import InlineStatusEditor from '@/components/InlineStatusEditor';
import CommentCount from '@/components/notification/CommentCount';
import WhatsAppStatusBadge from '@/components/whatsapp/WhatsAppStatusBadge';
import TaskCount from '@/components/TaskCount';
import SourceBadge from '@/components/SourceBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import MultiSelect from '@/components/form/MultiSelect';
import { Input } from '@/components/ui/input';
import { TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, Phone, Mail, Loader2, Tag, Download, Printer, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CommentsSection from '@/components/CommentsSection';
import TasksSection from '@/components/TasksSection';
import AuditLogSection from '@/components/AuditLogSection';

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  contacted: 'تم التواصل',
  no_answer: 'لم يرد',
  confirmed: 'مؤكد',
  attended: 'حضر',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export default function OfferLeadsManagement({
  onPendingCountChange,
  dateRange,
}: {
  onPendingCountChange?: (count: number) => void;
  dateRange: { from: Date; to: Date };
}) {
  const { formatPhoneDisplay } = usePhoneFormat();
  const { formatRegistrationDate } = useFormatDate();

  const offerHook = useOfferLeads({ dateRange, onPendingCountChange });

  const handleDelete = async (id: number) => {
    await offerHook.handleDeleteLead(id);
  };

  const handleStatusUpdate = () => {
    if (!offerHook.selectedLead || !offerHook.newStatus) {
      return;
    }

    offerHook.updateStatusMutation.mutate({
      id: offerHook.selectedLead.id,
      status: offerHook.newStatus as
        | 'pending'
        | 'contacted'
        | 'no_answer'
        | 'confirmed'
        | 'attended'
        | 'completed'
        | 'cancelled',
    });
  };

  const getOfferExportOptions = () => {
    const activeFilters = offerHook.offerExport.buildActiveFilters([
      { label: 'البحث', value: offerHook.searchTerm || undefined },
      {
        label: 'الحالة',
        value:
          offerHook.statusFilter.length > 0
            ? offerHook.statusFilter.map((s) => statusLabels[s]).join(', ')
            : undefined,
      },
      {
        label: 'المصدر',
        value:
          offerHook.sourceFilter.length > 0
            ? offerHook.sourceFilter.map((s) => SOURCE_LABELS[s] || s).join(', ')
            : undefined,
      },
      {
        label: 'العرض',
        value: offerHook.selectedOffer.length > 0 ? offerHook.selectedOffer.join(', ') : undefined,
      },
    ]);
    return {
      data: offerHook.offerLeads,
      activeFilters,
      dateRangeStr: offerHook.offerExport.formatDateRange(dateRange.from, dateRange.to),
      visibleColumns: offerHook.offerTable.visibleColumns,
    };
  };

  const handleExportOfferLeads = async (format: 'excel' | 'csv' | 'pdf') => {
    await offerHook.offerExport.handleExport(format, getOfferExportOptions());
  };

  const handlePrintOfferLeads = () => {
    offerHook.offerExport.handlePrint(getOfferExportOptions());
  };

  if (offerHook.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <OfferStatsCards
        stats={
          offerHook.stats
            ? {
                total: offerHook.stats.total || 0,
                new: offerHook.stats.pending || 0,
                contacted: offerHook.stats.contacted || 0,
                booked: offerHook.stats.confirmed || 0,
              }
            : null
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الهاتف..."
              value={offerHook.searchTerm}
              onChange={(e) => offerHook.setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        <MultiSelect
          placeholder="الحالة"
          options={[
            { value: 'pending', label: 'قيد الانتظار' },
            { value: 'contacted', label: 'تم التواصل' },
            { value: 'no_answer', label: 'لم يرد' },
            { value: 'confirmed', label: 'مؤكد' },
            { value: 'attended', label: 'حضر' },
            { value: 'completed', label: 'مكتمل' },
            { value: 'cancelled', label: 'ملغي' },
          ]}
          selected={offerHook.statusFilter}
          onChange={offerHook.setStatusFilter}
        />

        <MultiSelect
          placeholder="العرض"
          options={offerHook.uniqueOffers.map((o) => ({
            value: o.id.toString(),
            label: o.title || '',
          }))}
          selected={offerHook.selectedOffer}
          onChange={offerHook.setSelectedOffer}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              تصدير
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExportOfferLeads('excel')}>
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportOfferLeads('csv')}>CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportOfferLeads('pdf')}>PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" onClick={handlePrintOfferLeads}>
          <Printer className="mr-2 h-4 w-4" />
          طباعة
        </Button>
      </div>

      {/* Bulk Actions */}
      {offerHook.selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              تم تحديد {offerHook.selectedIds.length} من {offerHook.offerLeads.length}
            </span>
          </div>
          <BulkActionsManager
            selectedCount={offerHook.selectedIds.length}
            onClear={() => offerHook.setSelectedIds([])}
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
                onStatusConfirm: async (newStatus: string) => {
                  await offerHook.bulkUpdateMutation.mutateAsync({
                    ids: offerHook.selectedIds,
                    status: newStatus as
                      | 'pending'
                      | 'contacted'
                      | 'no_answer'
                      | 'confirmed'
                      | 'attended'
                      | 'completed'
                      | 'cancelled',
                  });
                  offerHook.setSelectedIds([]);
                  offerHook.refetch();
                },
              },
              {
                type: 'delete',
                label: 'حذف',
                variant: 'destructive',
                icon: <Trash2 className="h-4 w-4" />,
                onConfirm: async () => {
                  await Promise.all(
                    offerHook.selectedIds.map((id) =>
                      offerHook.deleteLeadMutation.mutateAsync({ id })
                    )
                  );
                  offerHook.setSelectedIds([]);
                  offerHook.refetch();
                },
                confirmTitle: 'تأكيد الحذف',
                confirmDescription: `هل أنت متأكد من حذف ${offerHook.selectedIds.length} حجز؟`,
              },
            ]}
          />
        </div>
      )}

      {/* Table */}
      <div className="hidden md:block rounded-lg border bg-card">
        <ResizableTable
          frozenColumns={offerHook.offerTable.frozenColumns.frozenColumns}
          columnWidths={offerHook.offerTable.columnWidths.columnWidths}
          visibleColumnOrder={offerHook.offerTable.columnOrder.filter(
            (key) => offerHook.offerTable.visibleColumns[key]
          )}
        >
          <TableHeader>
            <TableRow>
              {offerHook.offerTable.columnOrder
                .filter((colKey) => offerHook.offerTable.visibleColumns[colKey])
                .map((colKey) => {
                  const col = offerHook.offerLeadColumns.find((c) => c.key === colKey);
                  if (!col) {
                    return null;
                  }
                  if (colKey === 'checkbox') {
                    return (
                      <ResizableHeaderCell
                        key={colKey}
                        columnKey={colKey}
                        width={40}
                        minWidth={40}
                        maxWidth={40}
                        onResize={() => undefined}
                      >
                        <Checkbox
                          checked={
                            offerHook.selectedIds.length === offerHook.offerLeads.length &&
                            offerHook.offerLeads.length > 0
                          }
                          onCheckedChange={offerHook.handleSelectAll}
                        />
                      </ResizableHeaderCell>
                    );
                  }
                  const widthConfig = col.minWidth
                    ? { min: col.minWidth, max: col.maxWidth }
                    : { min: 80, max: 500 };
                  return (
                    <ResizableHeaderCell
                      key={colKey}
                      columnKey={colKey}
                      width={offerHook.offerTable.columnWidths.columnWidths[colKey] || 100}
                      minWidth={widthConfig.min}
                      maxWidth={widthConfig.max}
                      onResize={() => undefined}
                      {...offerHook.offerTable.getSortProps(colKey)}
                    >
                      {col.label}
                    </ResizableHeaderCell>
                  );
                })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {offerHook.offerLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={offerHook.offerLeadColumns.length} className="text-center py-8">
                  <EmptyState
                    icon={Users}
                    title="لا توجد حجوزات"
                    description="لم يتم العثور على حجوزات تطابق البحث"
                  />
                </TableCell>
              </TableRow>
            ) : (
              offerHook.offerLeads.map((lead) => (
                <TableRow key={lead.id}>
                  {offerHook.offerTable.columnOrder
                    .filter((colKey) => offerHook.offerTable.visibleColumns[colKey])
                    .map((colKey) => {
                      const col = offerHook.offerLeadColumns.find((c) => c.key === colKey);
                      if (!col) {
                        return null;
                      }
                      if (colKey === 'checkbox') {
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <Checkbox
                              checked={offerHook.selectedIds.includes(lead.id)}
                              onCheckedChange={() => offerHook.handleSelectOne(lead.id)}
                            />
                          </FrozenTableCell>
                        );
                      }
                      if (colKey === 'receiptNumber') {
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <span className="font-mono text-sm">{lead.receiptNumber || '-'}</span>
                          </FrozenTableCell>
                        );
                      }
                      if (colKey === 'name') {
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <div className="font-medium">{lead.fullName}</div>
                          </FrozenTableCell>
                        );
                      }
                      if (colKey === 'phone') {
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span dir="ltr">{formatPhoneDisplay(lead.phone)}</span>
                            </div>
                          </FrozenTableCell>
                        );
                      }
                      if (colKey === 'email') {
                        return (
                          <TableCell key={colKey}>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{lead.email || '-'}</span>
                            </div>
                          </TableCell>
                        );
                      }
                      if (colKey === 'offer') {
                        return (
                          <TableCell key={colKey}>
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{lead.offerTitle || '-'}</span>
                            </div>
                          </TableCell>
                        );
                      }
                      if (colKey === 'status') {
                        return (
                          <TableCell key={colKey}>
                            <InlineStatusEditor
                              currentStatus={lead.status}
                              statusOptions={[
                                { value: 'pending', label: 'قيد الانتظار', color: 'bg-blue-500' },
                                { value: 'contacted', label: 'تم التواصل', color: 'bg-yellow-500' },
                                { value: 'no_answer', label: 'لم يرد', color: 'bg-gray-500' },
                                { value: 'confirmed', label: 'مؤكد', color: 'bg-emerald-500' },
                                { value: 'attended', label: 'حضر', color: 'bg-teal-500' },
                                { value: 'completed', label: 'مكتمل', color: 'bg-green-600' },
                                { value: 'cancelled', label: 'ملغي', color: 'bg-red-500' },
                              ]}
                              onSave={async (newStatus: string) => {
                                await offerHook.updateStatusMutation.mutateAsync({
                                  id: lead.id,
                                  status: newStatus as
                                    | 'pending'
                                    | 'contacted'
                                    | 'no_answer'
                                    | 'confirmed'
                                    | 'attended'
                                    | 'completed'
                                    | 'cancelled',
                                });
                              }}
                            />
                          </TableCell>
                        );
                      }
                      if (colKey === 'source') {
                        return (
                          <TableCell key={colKey}>
                            {lead.source && <SourceBadge source={lead.source} />}
                          </TableCell>
                        );
                      }
                      if (colKey === 'date') {
                        return (
                          <TableCell key={colKey}>
                            <span className="text-sm">
                              {formatRegistrationDate(lead.createdAt)}
                            </span>
                          </TableCell>
                        );
                      }
                      if (colKey === 'comments') {
                        return (
                          <TableCell key={colKey}>
                            <CommentCount entityId={lead.id} entityType="offerLead" />
                          </TableCell>
                        );
                      }
                      if (colKey === 'tasks') {
                        return (
                          <TableCell key={colKey}>
                            <TaskCount entityId={lead.id} entityType="offerLead" />
                          </TableCell>
                        );
                      }
                      if (colKey === 'whatsapp') {
                        return (
                          <TableCell key={colKey}>
                            <WhatsAppStatusBadge entityId={lead.id} entityType="offer_lead" />
                          </TableCell>
                        );
                      }
                      if (colKey === 'actions') {
                        return (
                          <TableCell key={colKey}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(lead.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={colKey}>
                          {((lead as Record<string, string | number | Date | null>)[
                            colKey
                          ] as string) || '-'}
                        </TableCell>
                      );
                    })}
                </TableRow>
              ))
            )}
          </TableBody>
        </ResizableTable>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {offerHook.offerLeads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="لا توجد حجوزات"
            description="لم يتم العثور على حجوزات تطابق البحث"
          />
        ) : (
          offerHook.offerLeads.map((lead) => (
            <OfferLeadCard
              key={lead.id}
              lead={{
                ...lead,
                source: lead.source ?? undefined,
              }}
              onEdit={() => offerHook.handleEditLead(lead)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={offerHook.offerPage}
        totalPages={offerHook.offerLeadsData?.totalPages || 1}
        onPageChange={(page) => {
          offerHook.setOfferPage(page);
          offerHook.setSelectedIds([]);
        }}
        pageSize={offerHook.offerPageSize}
        onPageSizeChange={offerHook.setOfferPageSize}
      />

      {/* Status Update Dialog */}
      <Dialog open={offerHook.statusDialogOpen} onOpenChange={offerHook.setStatusDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تحديث حالة الحجز</DialogTitle>
            <DialogDescription>
              {offerHook.selectedLead?.fullName} - {offerHook.selectedLead?.offerTitle}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="status">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">الحالة</TabsTrigger>
              <TabsTrigger value="comments">التعليقات</TabsTrigger>
              <TabsTrigger value="tasks">المهام</TabsTrigger>
              <TabsTrigger value="history">السجل</TabsTrigger>
            </TabsList>
            <TabsContent value="status" className="space-y-4">
              <div className="space-y-2">
                <Label>الحالة الجديدة</Label>
                <Select value={offerHook.newStatus} onValueChange={offerHook.setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="contacted">تم التواصل</SelectItem>
                    <SelectItem value="no_answer">لم يرد</SelectItem>
                    <SelectItem value="confirmed">مؤكد</SelectItem>
                    <SelectItem value="attended">حضر</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStatusUpdate} className="w-full">
                تحديث الحالة
              </Button>
            </TabsContent>
            <TabsContent value="comments">
              {offerHook.selectedLead && (
                <CommentsSection entityId={offerHook.selectedLead.id} entityType="offerLead" />
              )}
            </TabsContent>
            <TabsContent value="tasks">
              {offerHook.selectedLead && (
                <TasksSection entityId={offerHook.selectedLead.id} entityType="offerLead" />
              )}
            </TabsContent>
            <TabsContent value="history">
              {offerHook.selectedLead && (
                <AuditLogSection entityId={offerHook.selectedLead.id} entityType="offerLead" />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
