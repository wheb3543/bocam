import { useFormatDate } from '@/hooks/export/useFormatDate';
import {
  unifiedStatusOptions,
  formatStatusTime,
} from '@/hooks/data/useStatusLabels';
import {
  ResizableTable,
  ResizableHeaderCell,
  FrozenTableCell,
} from '@/components/table/ResizableTable';
import { getColumnWidth, type ColumnConfig } from '@/components/table/ColumnVisibility';
import type { UseTableFeaturesReturn } from '@/hooks/table/useTableFeatures';
import TableSkeleton from '@/components/table/TableSkeleton';
import EmptyState from '@/components/EmptyState';
import InlineStatusEditor from '@/components/InlineStatusEditor';
import CommentCount from '@/components/notification/CommentCount';
import TaskCount from '@/components/TaskCount';
import { printReceipt } from '@/components/booking/PrintReceipt';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Phone, Settings, Printer, CalendarOff } from 'lucide-react';
import SourceBadge from '@/components/SourceBadge';
import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';
import type { AppointmentWithDoctor } from '@shared/types';

interface AppointmentTableDesktopProps {
  appointments: AppointmentWithDoctor[];
  isLoading: boolean;
  columns: ColumnConfig[];
  visibleColumns: Record<string, boolean>;
  columnOrder: string[];
  frozenColumns: string[];
  columnWidths: {
    columnWidths: Record<string, number>;
    getWidth: (key: string) => number;
    handleResize: (key: string, width: number) => void;
  };
  getSortProps: UseTableFeaturesReturn['getSortProps'];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onOpenDialog: (appointment: AppointmentWithDoctor) => void;
  onUpdateStatus: (id: number, status: string) => Promise<void>;
  userName: string;
}

export default function AppointmentTableDesktop({
  appointments,
  isLoading,
  columns,
  visibleColumns,
  columnOrder,
  frozenColumns,
  columnWidths,
  getSortProps,
  selectedIds,
  onSelectionChange,
  onOpenDialog,
  onUpdateStatus,
  userName,
}: AppointmentTableDesktopProps) {
  const { formatPhoneDisplay } = usePhoneFormat();
  const { formatDate } = useFormatDate();
  const visibleColumnKeys = columnOrder.filter((key) => visibleColumns[key]);

  return (
    <div className="table-responsive">
      <ResizableTable
        frozenColumns={frozenColumns}
        columnWidths={columnWidths.columnWidths}
        visibleColumnOrder={visibleColumnKeys}
      >
        <TableHeader>
          <TableRow>
            {visibleColumnKeys.map((colKey) => {
              const col = columns.find((c) => c.key === colKey);
              if (!col) {return null;}
              if (colKey === 'checkbox') {
                return (
                  <ResizableHeaderCell
                    key={colKey}
                    columnKey={colKey}
                    width={40}
                    minWidth={40}
                    maxWidth={40}
                    onResize={() => {}}
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === appointments.length && appointments.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSelectionChange(appointments.map((a) => a.id));
                        } else {
                          onSelectionChange([]);
                        }
                      }}
                      className="rounded border-border"
                    />
                  </ResizableHeaderCell>
                );
              }
              const widthConfig = getColumnWidth(colKey, col);
              return (
                <ResizableHeaderCell
                  key={colKey}
                  columnKey={colKey}
                  width={columnWidths.getWidth(colKey)}
                  minWidth={widthConfig.min}
                  maxWidth={widthConfig.max}
                  onResize={columnWidths.handleResize}
                  {...getSortProps(colKey)}
                >
                  {col.label}
                </ResizableHeaderCell>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody className={!isLoading && appointments.length > 0 ? 'stagger-rows' : ''}>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={visibleColumnKeys.length || 1} className="p-0">
                <TableSkeleton rows={5} columns={visibleColumnKeys.length || 11} />
              </TableCell>
            </TableRow>
          ) : appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumnKeys.length || 1} className="py-12">
                <EmptyState
                  icon={CalendarOff}
                  title="لا توجد مواعيد"
                  description="لم يتم العثور على أي مواعيد في الفترة المحددة. جرب تغيير الفلاتر أو إضافة موعد جديد."
                />
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appointment) => (
              <TableRow
                key={`appointment-${appointment.id}`}
                className={appointment.status === 'pending' ? 'bg-red-50 hover:bg-red-100' : ''}
              >
                {visibleColumnKeys.map((colKey) => {
                  switch (colKey) {
                    case 'checkbox':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(appointment.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onSelectionChange([...selectedIds, appointment.id]);
                              } else {
                                onSelectionChange(
                                  selectedIds.filter((id) => id !== appointment.id)
                                );
                              }
                            }}
                            className="rounded border-border"
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
                          {appointment.receiptNumber || '-'}
                        </FrozenTableCell>
                      );
                    case 'date':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {formatDate(appointment.createdAt)}
                        </FrozenTableCell>
                      );
                    case 'name':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <span className="font-medium">
                            {appointment.fullName}
                          </span>
                        </FrozenTableCell>
                      );
                    case 'phone':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {formatPhoneDisplay(appointment.phone)}
                            </span>
                            <a
                              href={`tel:${formatPhoneDisplay(appointment.phone)}`}
                              className="text-primary hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </FrozenTableCell>
                      );
                    case 'email':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {appointment.email || '-'}
                        </FrozenTableCell>
                      );
                    case 'age':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {appointment.age || '-'}
                        </FrozenTableCell>
                      );
                    case 'doctor':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {appointment.doctorName || '-'}
                        </FrozenTableCell>
                      );
                    case 'specialty':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {appointment.doctorSpecialty || '-'}
                        </FrozenTableCell>
                      );
                    case 'procedure':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {appointment.procedure || '-'}
                        </FrozenTableCell>
                      );
                    case 'preferredDate':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {formatDate(appointment.preferredDate || '')}
                        </FrozenTableCell>
                      );
                    case 'preferredTime':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {appointment.preferredTime || '-'}
                        </FrozenTableCell>
                      );
                    case 'appointmentDate':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {formatDate(appointment.appointmentDate || '')}
                        </FrozenTableCell>
                      );
                    case 'notes':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          wrap
                          title={appointment.patientMessage || ''}
                        >
                          {appointment.patientMessage || '-'}
                        </FrozenTableCell>
                      );
                    case 'additionalNotes':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          wrap
                          title={appointment.additionalNotes || undefined}
                        >
                          {appointment.additionalNotes || '-'}
                        </FrozenTableCell>
                      );
                    case 'staffNotes':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          wrap
                          title={appointment.staffNotes || undefined}
                        >
                          {appointment.staffNotes || '-'}
                        </FrozenTableCell>
                      );
                    case 'source':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          {appointment.source ? (
                            <SourceBadge
                              source={appointment.source}
                              utmSource={appointment.utmSource}
                              utmMedium={appointment.utmMedium}
                              utmCampaign={appointment.utmCampaign}
                              referrer={appointment.referrer}
                              fbclid={appointment.fbclid}
                              gclid={appointment.gclid}
                              size="sm"
                            />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </FrozenTableCell>
                      );
                    case 'status':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <InlineStatusEditor
                            currentStatus={appointment.status}
                            statusOptions={unifiedStatusOptions}
                            onSave={async (newStatus) => {
                              await onUpdateStatus(appointment.id, newStatus);
                            }}
                          />
                        </FrozenTableCell>
                      );
                    case 'contactedAt':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          className="text-xs text-muted-foreground"
                        >
                          {formatStatusTime(appointment.contactedAt)}
                        </FrozenTableCell>
                      );
                    case 'confirmedAt':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          className="text-xs text-muted-foreground"
                        >
                          {formatStatusTime(appointment.confirmedAt)}
                        </FrozenTableCell>
                      );
                    case 'attendedAt':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          className="text-xs text-muted-foreground"
                        >
                          {formatStatusTime(appointment.attendedAt)}
                        </FrozenTableCell>
                      );
                    case 'completedAt':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          className="text-xs text-muted-foreground"
                        >
                          {formatStatusTime(appointment.completedAt)}
                        </FrozenTableCell>
                      );
                    case 'cancelledAt':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          className="text-xs text-muted-foreground"
                        >
                          {formatStatusTime(appointment.cancelledAt)}
                        </FrozenTableCell>
                      );
                    case 'utmSource':
                    case 'utmMedium':
                    case 'utmCampaign':
                    case 'utmTerm':
                    case 'utmContent':
                    case 'utmPlacement':
                    case 'referrer':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey} className="text-xs">
                          {String((appointment as unknown as Record<string, unknown>)[colKey] || '-')}
                        </FrozenTableCell>
                      );
                    case 'fbclid':
                    case 'gclid':
                      return (
                        <FrozenTableCell
                          key={colKey}
                          columnKey={colKey}
                          className="text-xs font-mono"
                        >
                          {String((appointment as unknown as Record<string, unknown>)[colKey] || '-')}
                        </FrozenTableCell>
                      );
                    case 'comments':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <CommentCount entityType="appointment" entityId={appointment.id} />
                        </FrozenTableCell>
                      );
                    case 'tasks':
                      return (
                        <FrozenTableCell key={colKey} columnKey={colKey}>
                          <TaskCount entityType="appointment" entityId={appointment.id} />
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
                                  onClick={() => onOpenDialog(appointment)}
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
                                  onClick={() => {
                                    const doctorName =
                                      appointment.doctorName || `طبيب #${appointment.doctorId}`;
                                    printReceipt(
                                      {
                                        fullName: appointment.fullName,
                                        phone: appointment.phone,
                                        age: appointment.age ?? undefined,
                                        registrationDate: new Date(
                                          appointment.createdAt || appointment.appointmentDate || new Date()
                                        ),
                                        type: 'appointment',
                                        typeName: doctorName,
                                      },
                                      userName
                                    );
                                  }}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>طباعة السند</p>
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
