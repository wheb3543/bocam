import { useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AppointmentStatsCards from '@/components/booking/AppointmentStatsCards';
import AppointmentCard from '@/components/booking/AppointmentCard';
import AuditLogSection from '@/components/AuditLogSection';
import EmptyState from '@/components/EmptyState';
import MultiSelect from '@/components/form/MultiSelect';
import { DateRangePicker } from '@/components/form/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Loader2, Download, Printer, CalendarOff, RotateCcw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { printReceipt } from '@/components/booking/PrintReceipt';
import { useAuth } from '@/_core/hooks/useAuth';
import { SOURCE_OPTIONS } from '@shared/sources';
import SourceBadge from '@/components/SourceBadge';
import Pagination from '@/components/table/Pagination';
import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { ResizableTable, ResizableHeaderCell } from '@/components/table/ResizableTable';
import InlineStatusEditor from '@/components/InlineStatusEditor';
import CommentCount from '@/components/notification/CommentCount';
import TaskCount from '@/components/TaskCount';
import WhatsAppStatusBadge from '@/components/whatsapp/WhatsAppStatusBadge';
import CommentsSection from '@/components/CommentsSection';
import TasksSection from '@/components/TasksSection';
import { getColumnWidth } from '@/components/table/ColumnVisibility';
import { useAppointments } from '@/hooks/booking/useAppointments';
import type { AppointmentWithDoctor } from '@shared/types';

export default function AppointmentsManagementPage() {
  const { formatPhoneDisplay } = usePhoneFormat();
  const { formatRegistrationDate } = useFormatDate();
  const { user } = useAuth();

  const appointmentsHook = useAppointments({ _userRole: user?.role });

  const handlePrintAppointment = useCallback(
    (appointment: AppointmentWithDoctor) => {
      const doctorName = appointment.doctorName || `طبيب #${appointment.doctorId}`;
      printReceipt(
        {
          fullName: appointment.fullName,
          phone: appointment.phone,
          age: appointment.age ?? undefined,
          registrationDate: new Date(appointment.createdAt),
          type: 'appointment' as const,
          typeName: doctorName,
        },
        user?.name || 'مستخدم'
      );
    },
    [user?.name]
  );

  const handleExportAppointments = useCallback(
    async (format: 'excel' | 'csv' | 'pdf') => {
      await appointmentsHook.appointmentExport.handleExport(
        format,
        appointmentsHook.getAppointmentExportOptions()
      );
    },
    [appointmentsHook]
  );

  const handlePrintAppointments = useCallback(() => {
    appointmentsHook.appointmentExport.handlePrint(appointmentsHook.getAppointmentExportOptions());
  }, [appointmentsHook]);

  if (appointmentsHook.appointmentsLoading) {
    return (
      <DashboardLayout pageTitle="مواعيد الأطباء" pageDescription="إدارة ومتابعة مواعيد الأطباء">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="مواعيد الأطباء" pageDescription="إدارة ومتابعة مواعيد الأطباء">
      <div className="space-y-4 sm:space-y-5 px-3 sm:px-4 md:px-6 py-3 sm:py-4" dir="rtl">
        <DateRangePicker
          dateRange={appointmentsHook.dateRange}
          onDateRangeChange={appointmentsHook.setDateRange}
        />

        <AppointmentStatsCards stats={appointmentsHook.appointmentStats} />

        {/* Filters Section */}
        <div className="space-y-3">
          {/* Quick actions row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintAppointments}
              className="gap-2 h-9"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">طباعة</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">تصدير</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportAppointments('excel')}>
                  تصدير Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAppointments('csv')}>
                  تصدير CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAppointments('pdf')}>
                  تصدير PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search + Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم أو الهاتف..."
                value={appointmentsHook.appointmentSearchTerm}
                onChange={(e) => appointmentsHook.setAppointmentSearchTerm(e.target.value)}
                className="pr-10 h-9"
              />
            </div>
            <MultiSelect
              options={appointmentsHook.doctors.map((doctor: { id: number; name: string }) => ({
                value: doctor.id.toString(),
                label: doctor.name,
              }))}
              selected={appointmentsHook.selectedDoctor}
              onChange={appointmentsHook.setSelectedDoctor}
              placeholder="كل الأطباء"
              className="h-9"
            />
            <Select
              value={appointmentsHook.dateFilter}
              onValueChange={appointmentsHook.setDateFilter}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="كل الفترات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفترات</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
              </SelectContent>
            </Select>
            <MultiSelect
              options={[
                { value: 'pending', label: 'قيد الانتظار' },
                { value: 'confirmed', label: 'مؤكد' },
                { value: 'cancelled', label: 'ملغي' },
                { value: 'completed', label: 'مكتمل' },
              ]}
              selected={appointmentsHook.appointmentStatusFilter}
              onChange={appointmentsHook.setAppointmentStatusFilter}
              placeholder="كل الحالات"
              className="h-9"
            />
            <MultiSelect
              options={SOURCE_OPTIONS}
              selected={appointmentsHook.appointmentSourceFilter}
              onChange={appointmentsHook.setAppointmentSourceFilter}
              placeholder="كل المصادر"
              className="h-9"
            />
          </div>

          {/* Active filter count */}
          {appointmentsHook.appointmentFilter.filters.activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={appointmentsHook.resetFilters}
                className="gap-1 text-muted-foreground hover:text-foreground h-8"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                إعادة تعيين الفلاتر ({appointmentsHook.appointmentFilter.filters.activeFilterCount})
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {appointmentsHook.filteredAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="لا توجد مواعيد"
              description="لم يتم العثور على أي مواعيد في الفترة المحددة."
            />
          ) : (
            appointmentsHook.filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={`appointment-${appointment.id}`}
                appointment={appointment}
                onViewDetails={appointmentsHook.handleViewDetails}
                onPrint={() => handlePrintAppointment(appointment as AppointmentWithDoctor)}
              />
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-lg border bg-card">
          <div className="table-responsive">
            <ResizableTable
              frozenColumns={appointmentsHook.appointmentTable.frozenColumns.frozenColumns}
              columnWidths={appointmentsHook.appointmentTable.columnWidths.columnWidths}
              visibleColumnOrder={appointmentsHook.appointmentTable.columnOrder.filter(
                (key) => appointmentsHook.appointmentTable.visibleColumns[key]
              )}
            >
              <TableHeader>
                <TableRow>
                  {appointmentsHook.appointmentTable.columnOrder
                    .filter((key) => appointmentsHook.appointmentTable.visibleColumns[key])
                    .map((colKey) => {
                      const col = appointmentsHook.appointmentColumns.find((c) => c.key === colKey);
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
                            onResize={() => {
                              // Intentional no-op for checkbox column
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                appointmentsHook.selectedAppointmentIds.length ===
                                  appointmentsHook.filteredAppointments.length &&
                                appointmentsHook.filteredAppointments.length > 0
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  appointmentsHook.setSelectedAppointmentIds(
                                    appointmentsHook.filteredAppointments.map((a) => a.id)
                                  );
                                } else {
                                  appointmentsHook.setSelectedAppointmentIds([]);
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
                          width={
                            appointmentsHook.appointmentTable.columnWidths.columnWidths[colKey] ||
                            widthConfig.width
                          }
                          minWidth={widthConfig.min}
                          maxWidth={widthConfig.max}
                          onResize={appointmentsHook.appointmentTable.columnWidths.handleResize}
                          sortDirection={
                            appointmentsHook.appointmentTable.sortState.columnKey === colKey
                              ? appointmentsHook.appointmentTable.sortState.direction
                              : undefined
                          }
                          onSort={
                            col.sortable !== false
                              ? () => appointmentsHook.appointmentTable.handleSort(colKey)
                              : undefined
                          }
                        >
                          {col.label}
                        </ResizableHeaderCell>
                      );
                    })}
                </TableRow>
              </TableHeader>
              <TableBody
                className={
                  !appointmentsHook.appointmentsLoading &&
                  appointmentsHook.filteredAppointments.length > 0
                    ? 'stagger-rows'
                    : ''
                }
              >
                {appointmentsHook.filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        appointmentsHook.appointmentTable.columnOrder.filter(
                          (key) => appointmentsHook.appointmentTable.visibleColumns[key]
                        ).length
                      }
                      className="text-center py-8"
                    >
                      <EmptyState
                        icon={CalendarOff}
                        title="لا توجد مواعيد"
                        description="لم يتم العثور على أي مواعيد في الفترة المحددة."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  appointmentsHook.filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      {appointmentsHook.appointmentTable.columnOrder
                        .filter((key) => appointmentsHook.appointmentTable.visibleColumns[key])
                        .map((colKey) => {
                          if (colKey === 'checkbox') {
                            return (
                              <TableCell key={colKey}>
                                <input
                                  type="checkbox"
                                  checked={appointmentsHook.selectedAppointmentIds.includes(
                                    appointment.id
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      appointmentsHook.setSelectedAppointmentIds([
                                        ...appointmentsHook.selectedAppointmentIds,
                                        appointment.id,
                                      ]);
                                    } else {
                                      appointmentsHook.setSelectedAppointmentIds(
                                        appointmentsHook.selectedAppointmentIds.filter(
                                          (id) => id !== appointment.id
                                        )
                                      );
                                    }
                                  }}
                                  className="rounded border-border"
                                />
                              </TableCell>
                            );
                          }
                          if (colKey === 'receiptNumber') {
                            return (
                              <TableCell key={colKey}>
                                <span className="text-sm font-mono">
                                  {appointment.receiptNumber || '-'}
                                </span>
                              </TableCell>
                            );
                          }
                          if (colKey === 'date') {
                            return (
                              <TableCell key={colKey}>
                                <span className="text-sm">
                                  {formatRegistrationDate(appointment.createdAt)}
                                </span>
                              </TableCell>
                            );
                          }
                          if (colKey === 'name') {
                            return (
                              <TableCell key={colKey}>
                                <span className="text-sm font-medium">
                                  {appointment.fullName || '-'}
                                </span>
                              </TableCell>
                            );
                          }
                          if (colKey === 'phone') {
                            return (
                              <TableCell key={colKey}>
                                <span className="text-sm">
                                  {formatPhoneDisplay(appointment.phone)}
                                </span>
                              </TableCell>
                            );
                          }
                          if (colKey === 'doctor') {
                            return (
                              <TableCell key={colKey}>
                                <span className="text-sm">{appointment.doctorName || '-'}</span>
                              </TableCell>
                            );
                          }
                          if (colKey === 'specialty') {
                            return (
                              <TableCell key={colKey}>
                                <span className="text-sm">
                                  {appointment.doctorSpecialty || '-'}
                                </span>
                              </TableCell>
                            );
                          }
                          if (colKey === 'status') {
                            return (
                              <TableCell key={colKey}>
                                <InlineStatusEditor
                                  currentStatus={appointment.status}
                                  statusOptions={[
                                    {
                                      value: 'pending',
                                      label: 'قيد الانتظار',
                                      color: 'bg-blue-500',
                                    },
                                    { value: 'confirmed', label: 'مؤكد', color: 'bg-emerald-500' },
                                    { value: 'completed', label: 'مكتمل', color: 'bg-green-600' },
                                    { value: 'cancelled', label: 'ملغي', color: 'bg-red-500' },
                                  ]}
                                  onSave={async (newStatus: string) => {
                                    await appointmentsHook.updateAppointmentStatusMutation.mutateAsync(
                                      {
                                        id: appointment.id,
                                        status: newStatus as
                                          'pending' | 'confirmed' | 'completed' | 'cancelled',
                                      }
                                    );
                                  }}
                                />
                              </TableCell>
                            );
                          }
                          if (colKey === 'source') {
                            return (
                              <TableCell key={colKey}>
                                {appointment.source && <SourceBadge source={appointment.source} />}
                              </TableCell>
                            );
                          }
                          if (colKey === 'comments') {
                            return (
                              <TableCell key={colKey}>
                                <CommentCount entityId={appointment.id} entityType="appointment" />
                              </TableCell>
                            );
                          }
                          if (colKey === 'tasks') {
                            return (
                              <TableCell key={colKey}>
                                <TaskCount entityId={appointment.id} entityType="appointment" />
                              </TableCell>
                            );
                          }
                          if (colKey === 'whatsapp') {
                            return (
                              <TableCell key={colKey}>
                                <WhatsAppStatusBadge
                                  entityId={appointment.id}
                                  entityType="appointment"
                                />
                              </TableCell>
                            );
                          }
                          if (colKey === 'actions') {
                            return (
                              <TableCell key={colKey}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => appointmentsHook.handleViewDetails(appointment)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  عرض التفاصيل
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>حذف الموعد</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع عن هذا
                                        الإجراء.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          appointmentsHook.handleDeleteAppointment(appointment.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        حذف
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell key={colKey}>
                              {((appointment as Record<string, string | number | Date | null>)[
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
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={appointmentsHook.appointmentPage}
          totalPages={appointmentsHook.appointmentsData?.totalPages || 1}
          onPageChange={(page) => {
            appointmentsHook.setAppointmentPage(page);
          }}
          pageSize={appointmentsHook.appointmentPageSize}
          onPageSizeChange={appointmentsHook.setAppointmentPageSize}
        />

        {/* Status Update Dialog */}
        <Dialog
          open={appointmentsHook.appointmentStatusDialogOpen}
          onOpenChange={appointmentsHook.setAppointmentStatusDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>تحديث حالة الموعد</DialogTitle>
              <DialogDescription>
                تحديث حالة الموعد لـ {appointmentsHook.selectedAppointment?.fullName}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="status">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="status">الحالة</TabsTrigger>
                <TabsTrigger value="comments">التعليقات</TabsTrigger>
                <TabsTrigger value="tasks">المهام</TabsTrigger>
                <TabsTrigger value="history">السجل</TabsTrigger>
              </TabsList>
              <TabsContent value="status" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>الحالة الجديدة</Label>
                  <Select
                    value={appointmentsHook.newAppointmentStatus}
                    onValueChange={appointmentsHook.setNewAppointmentStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات الموظفين</Label>
                  <Textarea
                    value={appointmentsHook.appointmentStatusNotes}
                    onChange={(e) => appointmentsHook.setAppointmentStatusNotes(e.target.value)}
                    placeholder="أضف ملاحظات هنا..."
                    rows={3}
                  />
                </div>
                <Button onClick={appointmentsHook.handleAppointmentStatusUpdate} className="w-full">
                  تحديث الحالة
                </Button>
              </TabsContent>
              <TabsContent value="comments">
                {appointmentsHook.selectedAppointment && (
                  <CommentsSection
                    entityId={appointmentsHook.selectedAppointment.id}
                    entityType="appointment"
                  />
                )}
              </TabsContent>
              <TabsContent value="tasks">
                {appointmentsHook.selectedAppointment && (
                  <TasksSection
                    entityId={appointmentsHook.selectedAppointment.id}
                    entityType="appointment"
                  />
                )}
              </TabsContent>
              <TabsContent value="history">
                {appointmentsHook.selectedAppointment && (
                  <AuditLogSection
                    entityId={appointmentsHook.selectedAppointment.id}
                    entityType="appointment"
                  />
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
