import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ResizableTable, ResizableHeaderCell, FrozenTableCell } from '@/components/table/ResizableTable';
import ActionButtons from '@/components/ActionButtons';
import InlineStatusEditor from '@/components/InlineStatusEditor';
import CommentCount from '@/components/notification/CommentCount';
import TaskCount from '@/components/TaskCount';
import WhatsAppStatusBadge from '@/components/whatsapp/WhatsAppStatusBadge';
import SourceBadge from '@/components/SourceBadge';
import { Tent, Mail, Settings, Printer, Trash2, Loader2, TentTree } from 'lucide-react';
import type { ColumnConfig } from '@/components/table/ColumnVisibility';
import type { CampRegistration, CampStatus } from '@/types/camp';

interface CampRegistrationTableProps {
  registrations: CampRegistration[];
  isLoading: boolean;
  selectedIds: number[];
  onSelectAll: () => void;
  onSelectOne: (id: number) => void;
  onEdit: (reg: CampRegistration) => void;
  onPrint: (reg: CampRegistration) => void;
  onDelete: (id: number) => void;
  _onUpdateStatus: (id: number, status: CampStatus) => void;
  campTable: {
    columnOrder: string[];
    visibleColumns: Record<string, boolean>;
    columnWidths: Record<string, number>;
    frozenColumns: { frozenColumns: string[] };
    getSortProps: (key: string) => { sortable: boolean; sortDirection: 'asc' | 'desc' | null; onSort: (columnKey: string) => void };
  };
  campRegColumns: ColumnConfig[];
  formatPhoneDisplay: (phone?: string) => string;
  formatRegistrationDate: (date?: string | Date | null) => string;
  formatStatusTime: (val: string | Date | unknown) => string;
  _deleteRegMutation: { isPending: boolean };
  _updateStatusMutation: { mutateAsync: (data: { id: number; status: CampStatus; notes?: string }) => Promise<{ success: boolean }> };
}


export default function CampRegistrationTable({
  registrations,
  isLoading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onPrint,
  onDelete,
  _onUpdateStatus,
  campTable,
  campRegColumns,
  formatPhoneDisplay,
  formatRegistrationDate,
  formatStatusTime,
  _deleteRegMutation,
  _updateStatusMutation,
}: CampRegistrationTableProps) {
  return (
    <div className="hidden md:block rounded-lg border bg-card">
      <ResizableTable
        frozenColumns={campTable.frozenColumns.frozenColumns}
        columnWidths={campTable.columnWidths}
        visibleColumnOrder={campTable.columnOrder.filter((key) => campTable.visibleColumns[key])}
      >
        <TableHeader>
          <TableRow>
            {campTable.columnOrder
              .filter((key) => campTable.visibleColumns[key])
              .map((colKey) => {
                const col = campRegColumns.find((c) => c.key === colKey);
                if (!col) {return null;}
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
                          selectedIds.length === registrations.length &&
                          registrations.length > 0
                        }
                        onCheckedChange={onSelectAll}
                      />
                    </ResizableHeaderCell>
                  );
                }
                const widthConfig = col.minWidth ? { min: col.minWidth, max: col.maxWidth } : { min: 80, max: 500 };
                return (
                  <ResizableHeaderCell
                    key={colKey}
                    columnKey={colKey}
                    width={campTable.columnWidths[colKey] || 100}
                    minWidth={widthConfig.min}
                    maxWidth={widthConfig.max}
                    onResize={() => undefined}
                    {...campTable.getSortProps(colKey)}
                  >
                    {col.label}
                  </ResizableHeaderCell>
                );
              })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={
                  campTable.columnOrder.filter((k) => campTable.visibleColumns[k]).length || 1
                }
                className="p-0"
              >
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              </TableCell>
            </TableRow>
          ) : registrations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  campTable.columnOrder.filter((k) => campTable.visibleColumns[k]).length || 1
                }
                className="py-12"
              >
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <TentTree className="w-12 h-12 mb-4" />
                  <p>لا توجد تسجيلات</p>
                  <p className="text-sm">لم يتم العثور على أي تسجيلات للمخيمات في الفترة المحددة</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            registrations.map((reg) => (
              <TableRow
                key={reg.id}
                className={reg.status === 'pending' ? 'bg-red-50 hover:bg-red-100' : ''}
              >
                {campTable.columnOrder
                  .filter((key) => campTable.visibleColumns[key])
                  .map((colKey) => {
                    switch (colKey) {
                      case 'checkbox':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <Checkbox
                              checked={reg.id ? selectedIds.includes(reg.id) : false}
                              onCheckedChange={() => reg.id && onSelectOne(reg.id)}
                            />
                          </FrozenTableCell>
                        );
                      case 'receiptNumber':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-sm text-muted-foreground font-mono"
                          >
                            {reg.receiptNumber || '-'}
                          </FrozenTableCell>
                        );
                      case 'name':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="font-medium"
                          >
                            {reg.fullName}
                          </FrozenTableCell>
                        );
                      case 'phone':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{formatPhoneDisplay(reg.phone)}</span>
                              <ActionButtons
                                phoneNumber={formatPhoneDisplay(reg.phone)}
                                showWhatsApp={true}
                                whatsAppMessage={`مرحباً ${reg.fullName}، شكراً لتسجيلك في مخيمنا الطبي. نتطلع لرؤيتك.`}
                                size="sm"
                                variant="ghost"
                              />
                            </div>
                          </FrozenTableCell>
                        );
                      case 'email':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            {reg.email ? (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a
                                  href={`mailto:${reg.email}`}
                                  className="hover:text-primary text-sm"
                                >
                                  {reg.email}
                                </a>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </FrozenTableCell>
                        );
                      case 'age':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            {reg.age ? (
                              <span className="text-sm">{reg.age} سنة</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </FrozenTableCell>
                        );
                      case 'gender':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            {reg.gender === 'male'
                              ? 'ذكر'
                              : reg.gender === 'female'
                                ? 'أنثى'
                                : '-'}
                          </FrozenTableCell>
                        );
                      case 'camp':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <div className="flex items-center gap-2">
                              <Tent className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{reg.campName || 'غير محدد'}</span>
                            </div>
                          </FrozenTableCell>
                        );
                      case 'source':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            {reg.source ? (
                              <SourceBadge
                                source={reg.source}
                                utmSource={reg.utmSource}
                                utmMedium={reg.utmMedium as string | null | undefined}
                                utmCampaign={reg.utmCampaign as string | null | undefined}
                                referrer={reg.referrer as string | null | undefined}
                                fbclid={reg.fbclid as string | null | undefined}
                                gclid={reg.gclid as string | null | undefined}
                                size="sm"
                              />
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                غير محدد
                              </Badge>
                            )}
                          </FrozenTableCell>
                        );
                      case 'status':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <InlineStatusEditor
                              currentStatus={reg.status ?? 'pending'}
                              statusOptions={[
                                {
                                  value: 'pending',
                                  label: 'قيد الانتظار',
                                  color: 'bg-yellow-500',
                                },
                                {
                                  value: 'contacted',
                                  label: 'تم التواصل',
                                  color: 'bg-orange-500',
                                },
                                { value: 'no_answer', label: 'لم يرد', color: 'bg-gray-500' },
                                { value: 'confirmed', label: 'مؤكد', color: 'bg-green-500' },
                                { value: 'attended', label: 'حضر', color: 'bg-blue-500' },
                                { value: 'completed', label: 'مكتمل', color: 'bg-teal-500' },
                                { value: 'cancelled', label: 'ملغي', color: 'bg-red-500' },
                              ]}
                              onSave={async (_newStatus) => {
                                if (!reg.id) {
                                  return;
                                }
                                // Status update handled externally
                              }}
                            />
                          </FrozenTableCell>
                        );
                      case 'statusNotes':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            wrap
                            title={reg.statusNotes as string | undefined}
                          >
                            {reg.statusNotes as string | undefined || '-'}
                          </FrozenTableCell>
                        );
                      case 'procedures':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm">
                            {reg.procedures || '-'}
                          </FrozenTableCell>
                        );
                      case 'medicalCondition':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm">
                            {reg.medicalCondition || '-'}
                          </FrozenTableCell>
                        );
                      case 'patientMessage':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-sm max-w-[200px] truncate"
                            title={reg.patientMessage || undefined}
                          >
                            {reg.patientMessage || '-'}
                          </FrozenTableCell>
                        );
                      case 'contactedAt':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-xs text-muted-foreground"
                          >
                            {formatStatusTime(reg.contactedAt)}
                          </FrozenTableCell>
                        );
                      case 'confirmedAt':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-xs text-muted-foreground"
                          >
                            {formatStatusTime(reg.confirmedAt)}
                          </FrozenTableCell>
                        );
                      case 'attendedAt':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-xs text-muted-foreground"
                          >
                            {formatStatusTime(reg.attendedAt)}
                          </FrozenTableCell>
                        );
                      case 'completedAt':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-xs text-muted-foreground"
                          >
                            {formatStatusTime(reg.completedAt)}
                          </FrozenTableCell>
                        );
                      case 'cancelledAt':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-xs text-muted-foreground"
                          >
                            {formatStatusTime(reg.cancelledAt)}
                          </FrozenTableCell>
                        );
                      case 'attendanceDate':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm">
                            {formatRegistrationDate(reg.attendanceDate)}
                          </FrozenTableCell>
                        );
                      case 'preferredDate':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm">
                            {reg.preferredDate ? (
                              <div className="flex flex-col gap-0.5">
                                <span>{reg.preferredDate}</span>
                                {reg.preferredTimeSlot && (
                                  <Badge variant="outline" className="text-xs w-fit">
                                    {reg.preferredTimeSlot === 'morning'
                                      ? '🌅 صباحي'
                                      : '🌆 مسائي'}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </FrozenTableCell>
                        );
                      case 'date':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-sm text-muted-foreground"
                          >
                            {formatRegistrationDate(reg.createdAt)}
                          </FrozenTableCell>
                        );
                      case 'utmSource':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-xs">
                            {reg.utmSource || '-'}
                          </FrozenTableCell>
                        );
                      case 'utmMedium':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-xs">
                            {reg.utmMedium || '-'}
                          </FrozenTableCell>
                        );
                      case 'utmCampaign':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-xs">
                            {reg.utmCampaign || '-'}
                          </FrozenTableCell>
                        );
                      case 'utmTerm':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-xs">
                            {reg.utmTerm || '-'}
                          </FrozenTableCell>
                        );
                      case 'utmContent':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-xs">
                            {reg.utmContent || '-'}
                          </FrozenTableCell>
                        );
                      case 'utmPlacement':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-xs">
                            {reg.utmPlacement || '-'}
                          </FrozenTableCell>
                        );
                      case 'referrer':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey} className="text-xs">
                            {reg.referrer || '-'}
                          </FrozenTableCell>
                        );
                      case 'fbclid':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-xs font-mono"
                          >
                            {reg.fbclid || '-'}
                          </FrozenTableCell>
                        );
                      case 'gclid':
                        return (
                          <FrozenTableCell
                            key={colKey}
                            columnKey={colKey}
                            className="text-xs font-mono"
                          >
                            {reg.gclid || '-'}
                          </FrozenTableCell>
                        );
                      case 'comments':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <CommentCount entityType="campRegistration" entityId={reg.id ?? 0} />
                          </FrozenTableCell>
                        );
                      case 'tasks':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <TaskCount entityType="campRegistration" entityId={reg.id ?? 0} />
                          </FrozenTableCell>
                        );
                      case 'whatsapp':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <WhatsAppStatusBadge
                              entityType="camp_registration"
                              entityId={reg.id ?? 0}
                            />
                          </FrozenTableCell>
                        );
                      case 'actions':
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(reg)}
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>تحديث الحالة</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => onPrint(reg)}
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>طباعة السند</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => reg.id && onDelete(reg.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>حذف</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </FrozenTableCell>
                        );
                      default:
                        return (
                          <FrozenTableCell key={colKey} columnKey={colKey}>
                            -
                          </FrozenTableCell>
                        );
                    }
                  })}
              </TableRow>
            ))
          )}
        </TableBody>
      </ResizableTable>
    </div>
  );
}
