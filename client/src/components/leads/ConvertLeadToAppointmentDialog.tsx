import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CalendarPlus,
  Loader2,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import type { UnifiedLead } from '@shared/types';
import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';

interface ConvertLeadToAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: UnifiedLead | null;
  onSuccess?: (appointmentId: number) => void;
}

export default function ConvertLeadToAppointmentDialog({
  open,
  onOpenChange,
  lead,
  onSuccess,
}: ConvertLeadToAppointmentDialogProps) {
  const utils = trpc.useUtils();
  const { formatPhoneDisplay } = usePhoneFormat();

  // Selections
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);
  const [procedure, setProcedure] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);

  // Queries
  const { data: departments } = trpc.departments.list.useQuery(undefined, {
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const { data: doctors } = trpc.doctors.list.useQuery(undefined, {
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // Setup default date when opening (tomorrow or today)
  useEffect(() => {
    if (open) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const y = tomorrow.getFullYear();
      const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const d = String(tomorrow.getDate()).padStart(2, '0');
      setAppointmentDate(`${y}-${m}-${d}`);
      setSelectedDoctorId(null);
      setSelectedSlot(null);
      setProcedure('');
      setNotes('');
      setSendWhatsApp(true);
    }
  }, [open, lead]);

  // Filter doctors by department
  const filteredDoctors = useMemo(() => {
    if (!doctors) {
      return [];
    }
    if (!selectedDepartmentId) {
      return doctors;
    }
    return doctors.filter((doc) => doc.departmentId === selectedDepartmentId);
  }, [doctors, selectedDepartmentId]);

  // Slot Query
  const {
    data: slotData,
    isLoading: isLoadingSlots,
    refetch: refetchSlots,
  } = trpc.appointments.getAvailableSlots.useQuery(
    {
      doctorId: selectedDoctorId || 0,
      date: appointmentDate,
    },
    {
      enabled: open && !!selectedDoctorId && !!appointmentDate,
    }
  );

  // Mutation
  const convertMutation = trpc.leads.convertToAppointment.useMutation({
    onSuccess: async (res) => {
      toast.success(res.message || 'تم تحويل العميل المحتمل إلى موعد مؤكد بنجاح!');
      await Promise.all([
        utils.leads.list.invalidate(),
        utils.leads.stats.invalidate(),
        utils.leads.getById.invalidate({ id: lead?.id || 0 }),
        utils.appointments.listPaginated.invalidate(),
      ]);
      onOpenChange(false);
      if (res.appointmentId) {
        onSuccess?.(res.appointmentId);
      }
    },
    onError: (err) => {
      toast.error(err.message || 'فشل تحويل العميل إلى موعد');
      void refetchSlots();
    },
  });

  const handleSubmit = async () => {
    if (!lead) {
      return;
    }
    if (!selectedDoctorId) {
      toast.error('يرجى اختيار الطبيب المعالج');
      return;
    }
    if (!appointmentDate) {
      toast.error('يرجى تحديد تاريخ الموعد');
      return;
    }
    if (!selectedSlot) {
      toast.error('يرجى اختيار الفترة الزمنية المناسبة للموعد');
      return;
    }

    await convertMutation.mutateAsync({
      leadId: lead.id,
      doctorId: selectedDoctorId,
      departmentId: selectedDepartmentId || undefined,
      appointmentDate,
      slotStartTime: selectedSlot.startTime,
      slotEndTime: selectedSlot.endTime,
      procedure: procedure.trim() || undefined,
      notes: notes.trim() || undefined,
      sendWhatsAppConfirmation: sendWhatsApp,
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CalendarPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">تحويل إلى موعد مؤكد</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                حجز موعد رسمي مع الطبيب وتحديث حالة العميل وتوثيق السجل
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {lead && (
          <div className="space-y-4 py-2">
            {/* Lead Brief Summary */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  <span>{lead.fullName}</span>
                </div>
                <div className="text-muted-foreground font-mono" dir="ltr">
                  {formatPhoneDisplay(lead.phone)}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">
                عميل محتمل #{lead.id}
              </Badge>
            </div>

            {/* Department Filter */}
            {departments && departments.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  تصفية حسب القسم الطبي:
                </Label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedDepartmentId(null)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                      selectedDepartmentId === null
                        ? 'bg-primary text-primary-foreground border-primary font-bold'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    الكل
                  </button>
                  {departments.map((dep) => (
                    <button
                      key={dep.id}
                      type="button"
                      onClick={() => setSelectedDepartmentId(dep.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                        selectedDepartmentId === dep.id
                          ? 'bg-primary text-primary-foreground border-primary font-bold'
                          : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      {dep.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Stethoscope className="size-3.5 text-primary" />
                <span>
                  اختر الطبيب المعالج: <span className="text-destructive">*</span>
                </span>
              </Label>
              <select
                value={selectedDoctorId || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setSelectedDoctorId(val);
                  setSelectedSlot(null);
                }}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">-- اختر الطبيب من القائمة --</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialty} {doc.isVisiting === 'yes' ? '(طبيب زائر)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" />
                <span>
                  تاريخ الموعد: <span className="text-destructive">*</span>
                </span>
              </Label>
              <Input
                type="date"
                min={todayStr}
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="h-10 text-xs sm:text-sm rounded-xl"
              />
            </div>

            {/* Available Time Slots */}
            {selectedDoctorId && appointmentDate && (
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock className="size-3.5 text-primary" />
                    <span>
                      الفترات الزمنية المتاحة: <span className="text-destructive">*</span>
                    </span>
                  </div>
                  {isLoadingSlots && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin text-primary" />
                      جاري فحص الجدول...
                    </span>
                  )}
                </Label>

                {slotData && !slotData.isWorking ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>
                      {slotData.reason || 'الطبيب غير متاح في هذا اليوم، يرجى اختيار تاريخ آخر'}
                    </span>
                  </div>
                ) : slotData?.slots && slotData.slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1.5 border rounded-xl bg-muted/20">
                    {slotData.slots.map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.slotStartTime;
                      return (
                        <button
                          key={slot.slotStartTime}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() =>
                            setSelectedSlot({
                              startTime: slot.slotStartTime,
                              endTime: slot.slotEndTime,
                            })
                          }
                          className={`p-1.5 rounded-lg border text-xs text-center transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                              : slot.isAvailable
                                ? 'bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-border text-foreground'
                                : 'bg-muted/40 text-muted-foreground/40 border-border/40 cursor-not-allowed'
                          }`}
                        >
                          <div className="font-semibold">
                            {slot.slotStartTime} {slot.period === 'morning' ? 'ص' : 'م'}
                          </div>
                          <div className="text-[10px] opacity-80">
                            {slot.isAvailable ? 'متاح' : 'محجوز'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  !isLoadingSlots && (
                    <p className="text-xs text-muted-foreground">لا توجد فترات محددة لهذا اليوم</p>
                  )
                )}
              </div>
            )}

            {/* Procedure / Treatment */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                الإجراء الطبي أو سبب الزيارة (اختياري):
              </Label>
              <Input
                type="text"
                placeholder="مثال: استشارة قلبية، فحص عام، كشفية باطنية..."
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                className="h-9 text-xs sm:text-sm rounded-xl"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                ملاحظات التحويل والعيادة (اختياري):
              </Label>
              <Textarea
                placeholder="أية تعليمات أو تفاصيل إضافية للموعد..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[60px] text-xs sm:text-sm rounded-xl resize-none"
              />
            </div>

            {/* WhatsApp confirmation check */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="send-whatsapp-confirm"
                checked={sendWhatsApp}
                onCheckedChange={(checked) => setSendWhatsApp(!!checked)}
              />
              <label
                htmlFor="send-whatsapp-confirm"
                className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="size-3.5 text-emerald-600" />
                <span>إرسال رسالة تأكيد الموعد للمريض عبر الواتساب فور إتمام التحويل</span>
              </label>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
            disabled={convertMutation.isPending}
          >
            إلغاء
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={convertMutation.isPending || !selectedDoctorId || !selectedSlot}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold px-5"
          >
            {convertMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>جاري التحويل وتثبيت الموعد...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>تأكيد تحويل العميل لموعد</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
