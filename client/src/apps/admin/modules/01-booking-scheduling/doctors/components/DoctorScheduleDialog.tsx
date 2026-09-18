/**
 * DoctorScheduleDialog - حوار ضبط أوقات دوام وسعة الطبيب (نوبتين صباحية ومسائية، وإجازات نطاق التواريخ)
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Loader2,
  Copy,
  Trash2,
  Plus,
  Sun,
  Moon,
  AlertTriangle,
  User,
  Phone as PhoneIcon,
  CalendarRange,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Doctor } from '../types/doctor.types';

interface DayScheduleForm {
  dayOfWeek: number;
  dayName: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  isMorningActive: boolean;
  morningStartTime: string;
  morningEndTime: string;
  isEveningActive: boolean;
  eveningStartTime: string;
  eveningEndTime: string;
  slotDurationMinutes: number;
  maxCapacityPerSlot: number;
}

const WEEK_DAYS = [
  { dayOfWeek: 0, dayName: 'الأحد' },
  { dayOfWeek: 1, dayName: 'الإثنين' },
  { dayOfWeek: 2, dayName: 'الثلاثاء' },
  { dayOfWeek: 3, dayName: 'الأربعاء' },
  { dayOfWeek: 4, dayName: 'الخميس' },
  { dayOfWeek: 5, dayName: 'الجمعة' },
  { dayOfWeek: 6, dayName: 'السبت' },
];

const DEFAULT_SCHEDULES: DayScheduleForm[] = WEEK_DAYS.map((d) => ({
  dayOfWeek: d.dayOfWeek,
  dayName: d.dayName,
  isActive: d.dayOfWeek !== 5, // الجمعة عطلة افتراضية
  startTime: '09:00',
  endTime: '21:00',
  isMorningActive: d.dayOfWeek !== 5,
  morningStartTime: '09:00',
  morningEndTime: '13:00',
  isEveningActive: d.dayOfWeek !== 5,
  eveningStartTime: '16:00',
  eveningEndTime: '21:00',
  slotDurationMinutes: 30,
  maxCapacityPerSlot: 1,
}));

interface DoctorScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
}

export function DoctorScheduleDialog({ open, onOpenChange, doctor }: DoctorScheduleDialogProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'exceptions'>('weekly');
  const [schedules, setSchedules] = useState<DayScheduleForm[]>(DEFAULT_SCHEDULES);

  // Exception form states
  const [isDateRange, setIsDateRange] = useState(false);
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionStartDate, setExceptionStartDate] = useState('');
  const [exceptionEndDate, setExceptionEndDate] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');
  const [exceptionIsOff, setExceptionIsOff] = useState(true);
  const [exceptionStartTime, setExceptionStartTime] = useState('09:00');
  const [exceptionEndTime, setExceptionEndTime] = useState('13:00');

  // Conflict state
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictsList, setConflictsList] = useState<
    Array<{
      id: number;
      fullName: string;
      phone: string;
      date: string;
      time: string;
      status: string;
    }>
  >([]);
  const [pendingExceptionPayload, setPendingExceptionPayload] = useState<{
    doctorId: number;
    exceptionDate?: string;
    startDate?: string;
    endDate?: string;
    isOff: boolean;
    customStartTime?: string;
    customEndTime?: string;
    reason?: string;
  } | null>(null);

  const utils = trpc.useUtils();

  const { data: scheduleData, isLoading } = trpc.appointments.getDoctorSchedule.useQuery(
    { doctorId: doctor?.id ?? 0 },
    { enabled: open && !!doctor?.id }
  );

  useEffect(() => {
    if (scheduleData?.schedules && scheduleData.schedules.length > 0) {
      const scheduleMap = new Map<number, (typeof scheduleData.schedules)[0]>();
      scheduleData.schedules.forEach((s) => scheduleMap.set(s.dayOfWeek, s));

      const updated = WEEK_DAYS.map((d) => {
        const found = scheduleMap.get(d.dayOfWeek);
        if (found) {
          const hasDualSet = found.isMorningActive !== undefined && found.isMorningActive !== null;
          const morningActive = hasDualSet
            ? Boolean(found.isMorningActive)
            : (found.isActive ?? true);
          const eveningActive = hasDualSet ? Boolean(found.isEveningActive) : false;

          return {
            dayOfWeek: d.dayOfWeek,
            dayName: d.dayName,
            isActive: found.isActive ?? true,
            startTime: found.startTime || '09:00',
            endTime: found.endTime || '21:00',
            isMorningActive: morningActive,
            morningStartTime: found.morningStartTime || found.startTime || '09:00',
            morningEndTime: found.morningEndTime || '13:00',
            isEveningActive: eveningActive,
            eveningStartTime: found.eveningStartTime || '16:00',
            eveningEndTime: found.eveningEndTime || found.endTime || '21:00',
            slotDurationMinutes: found.slotDurationMinutes || 30,
            maxCapacityPerSlot: found.maxCapacityPerSlot || 1,
          };
        }
        return {
          dayOfWeek: d.dayOfWeek,
          dayName: d.dayName,
          isActive: false,
          startTime: '09:00',
          endTime: '21:00',
          isMorningActive: false,
          morningStartTime: '09:00',
          morningEndTime: '13:00',
          isEveningActive: false,
          eveningStartTime: '16:00',
          eveningEndTime: '21:00',
          slotDurationMinutes: 30,
          maxCapacityPerSlot: 1,
        };
      });
      setSchedules(updated);
    } else if (open) {
      setSchedules(DEFAULT_SCHEDULES);
    }
  }, [scheduleData, open]);

  const updateMutation = trpc.appointments.updateDoctorSchedule.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث جدول دوام وسعة الطبيب بنجاح');
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ أثناء حفظ الجدول');
    },
  });

  const addExceptionMutation = trpc.appointments.addDoctorScheduleException.useMutation({
    onSuccess: () => {
      toast.success('تمت إضافة الاستثناء / الإجازة بنجاح');
      setExceptionDate('');
      setExceptionStartDate('');
      setExceptionEndDate('');
      setExceptionReason('');
      utils.appointments.getDoctorSchedule.invalidate({ doctorId: doctor?.id ?? 0 });
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ أثناء إضافة الاستثناء');
    },
  });

  const deleteExceptionMutation = trpc.appointments.deleteDoctorScheduleException.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الاستثناء بنجاح');
      utils.appointments.getDoctorSchedule.invalidate({ doctorId: doctor?.id ?? 0 });
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ أثناء حذف الاستثناء');
    },
  });

  const handleDayToggle = (dayOfWeek: number, checked: boolean) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.dayOfWeek !== dayOfWeek) {
          return s;
        }
        return {
          ...s,
          isActive: checked,
          // If enabled and neither shift was active, enable morning shift by default
          isMorningActive: checked ? s.isMorningActive || !s.isEveningActive : s.isMorningActive,
        };
      })
    );
  };

  const handleFieldChange = (
    dayOfWeek: number,
    field: keyof DayScheduleForm,
    value: string | number | boolean
  ) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const applyToAllWeekdays = (sourceDayOfWeek: number) => {
    const source = schedules.find((s) => s.dayOfWeek === sourceDayOfWeek);
    if (!source) {
      return;
    }

    setSchedules((prev) =>
      prev.map((s) => {
        if (s.dayOfWeek === 5) {
          return s; // تخطي الجمعة
        }
        return {
          ...s,
          startTime: source.startTime,
          endTime: source.endTime,
          isMorningActive: source.isMorningActive,
          morningStartTime: source.morningStartTime,
          morningEndTime: source.morningEndTime,
          isEveningActive: source.isEveningActive,
          eveningStartTime: source.eveningStartTime,
          eveningEndTime: source.eveningEndTime,
          slotDurationMinutes: source.slotDurationMinutes,
          maxCapacityPerSlot: source.maxCapacityPerSlot,
          isActive: true,
        };
      })
    );
    toast.info('تم تطبيق التوقيت والفترتين والسعة على جميع أيام العمل (السبت إلى الخميس)');
  };

  const handleSave = () => {
    if (!doctor?.id) {
      return;
    }

    const activeList = schedules
      .filter((s) => s.isActive && (s.isMorningActive || s.isEveningActive))
      .map((s) => {
        let sTime = s.startTime;
        let eTime = s.endTime;
        if (s.isMorningActive && s.isEveningActive) {
          sTime = s.morningStartTime || '09:00';
          eTime = s.eveningEndTime || '21:00';
        } else if (s.isMorningActive) {
          sTime = s.morningStartTime || '09:00';
          eTime = s.morningEndTime || '13:00';
        } else if (s.isEveningActive) {
          sTime = s.eveningStartTime || '16:00';
          eTime = s.eveningEndTime || '21:00';
        }

        return {
          dayOfWeek: s.dayOfWeek,
          startTime: sTime,
          endTime: eTime,
          isMorningActive: s.isMorningActive,
          morningStartTime: s.morningStartTime,
          morningEndTime: s.morningEndTime,
          isEveningActive: s.isEveningActive,
          eveningStartTime: s.eveningStartTime,
          eveningEndTime: s.eveningEndTime,
          slotDurationMinutes: Number(s.slotDurationMinutes) || 30,
          maxCapacityPerSlot: Number(s.maxCapacityPerSlot) || 1,
          isActive: true,
        };
      });

    updateMutation.mutate({
      doctorId: doctor.id,
      schedules: activeList,
    });
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor?.id) {
      return;
    }

    if (isDateRange) {
      if (!exceptionStartDate || !exceptionEndDate) {
        toast.error('يرجى تحديد تاريخ البداية والنهاية للإجازة');
        return;
      }
      if (exceptionStartDate > exceptionEndDate) {
        toast.error('تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية');
        return;
      }
    } else {
      if (!exceptionDate) {
        toast.error('يرجى تحديد تاريخ اليوم للاستثناء');
        return;
      }
    }

    const payload = {
      doctorId: doctor.id,
      exceptionDate: !isDateRange ? exceptionDate : undefined,
      startDate: isDateRange ? exceptionStartDate : exceptionDate,
      endDate: isDateRange ? exceptionEndDate : undefined,
      isOff: isDateRange ? true : exceptionIsOff,
      customStartTime: isDateRange || exceptionIsOff ? undefined : exceptionStartTime,
      customEndTime: isDateRange || exceptionIsOff ? undefined : exceptionEndTime,
      reason: exceptionReason || undefined,
    };

    // If it's a day-off or date range, check for pre-booked appointments
    const checkStart = isDateRange ? exceptionStartDate : exceptionDate;
    const checkEnd = isDateRange ? exceptionEndDate : undefined;

    if (payload.isOff) {
      try {
        setIsCheckingConflicts(true);
        const conflictResult = await utils.appointments.checkScheduleConflict.fetch({
          doctorId: doctor.id,
          startDate: checkStart,
          endDate: checkEnd,
        });

        if (conflictResult && conflictResult.hasConflicts && conflictResult.conflicts.length > 0) {
          setConflictsList(conflictResult.conflicts);
          setPendingExceptionPayload(payload);
          setShowConflictDialog(true);
          return;
        }
      } catch (err) {
        console.error('Failed to check schedule conflicts:', err);
      } finally {
        setIsCheckingConflicts(false);
      }
    }

    // No conflict, proceed directly
    addExceptionMutation.mutate(payload);
  };

  const confirmPendingException = () => {
    if (pendingExceptionPayload) {
      addExceptionMutation.mutate(pendingExceptionPayload);
      setShowConflictDialog(false);
      setPendingExceptionPayload(null);
      setConflictsList([]);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Calendar className="h-5 w-5" />
              </div>
              <span>جدول دوام وسعة الطبيب: {doctor?.name}</span>
            </DialogTitle>
            <DialogDescription>
              حدد فترات العمل اليومية (صباحية ومسائية)، وحماية ساعات الراحة، وسعة المواعيد لمنع
              الحجز المفرط.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">جاري تحميل جدول دوام الطبيب...</p>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'weekly' | 'exceptions')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="weekly">جدول الدوام الأسبوعي (نوبتان)</TabsTrigger>
                <TabsTrigger value="exceptions" className="flex items-center gap-1.5">
                  <span>الإجازات والاستثناءات</span>
                  {scheduleData?.exceptions && scheduleData.exceptions.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {scheduleData.exceptions.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="weekly" className="space-y-4 pt-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/40 border text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      يدعم النظام نوبتين (صباحية ومسائية) لكل يوم لحماية أوقات الاستراحة بين الفترات
                      تلقائياً.
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 gap-1"
                    onClick={() => applyToAllWeekdays(0)}
                  >
                    <Copy className="h-3 w-3" />
                    تطبيق أوقات الأحد على باقي الأسبوع
                  </Button>
                </div>

                <div className="space-y-3">
                  {schedules.map((day) => (
                    <div
                      key={day.dayOfWeek}
                      className={`p-3.5 rounded-xl border transition-all ${
                        day.isActive
                          ? 'bg-card border-border shadow-xs'
                          : 'bg-muted/20 border-border/50 opacity-65'
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Day header: switch, day name, slot & capacity settings */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-border/40">
                          <div className="flex items-center gap-2.5">
                            <Switch
                              id={`switch-${day.dayOfWeek}`}
                              checked={day.isActive}
                              onCheckedChange={(checked) => handleDayToggle(day.dayOfWeek, checked)}
                            />
                            <Label
                              htmlFor={`switch-${day.dayOfWeek}`}
                              className="font-bold text-sm cursor-pointer flex items-center gap-2"
                            >
                              <span>{day.dayName}</span>
                              {day.dayOfWeek === 5 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 px-1.5 text-muted-foreground"
                                >
                                  عطلة
                                </Badge>
                              )}
                            </Label>
                          </div>

                          {day.isActive && (
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">مدة الجلسة:</span>
                                <Input
                                  type="number"
                                  min={10}
                                  max={180}
                                  step={5}
                                  value={day.slotDurationMinutes}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      day.dayOfWeek,
                                      'slotDurationMinutes',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="h-8 text-xs w-16 text-center font-mono"
                                />
                                <span className="text-[11px] text-muted-foreground">دقيقة</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">السعة:</span>
                                <Input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={day.maxCapacityPerSlot}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      day.dayOfWeek,
                                      'maxCapacityPerSlot',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="h-8 text-xs w-14 text-center font-mono"
                                />
                                <span className="text-[11px] text-muted-foreground">مريض</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Dual Shifts Configuration */}
                        {day.isActive ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Morning Shift */}
                            <div
                              className={`p-3 rounded-xl border text-xs transition-colors ${
                                day.isMorningActive
                                  ? 'bg-amber-500/5 border-amber-500/30 shadow-xs'
                                  : 'bg-muted/10 border-border/40 opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/30">
                                <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                                  <Sun className="h-4 w-4 text-amber-500" />
                                  <span>الفترة الصباحية</span>
                                </div>
                                <Switch
                                  checked={day.isMorningActive}
                                  onCheckedChange={(checked) =>
                                    handleFieldChange(day.dayOfWeek, 'isMorningActive', checked)
                                  }
                                />
                              </div>

                              {day.isMorningActive ? (
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div className="space-y-1">
                                    <span className="text-[11px] text-muted-foreground font-medium block">
                                      من:
                                    </span>
                                    <Input
                                      type="time"
                                      dir="ltr"
                                      value={day.morningStartTime}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          day.dayOfWeek,
                                          'morningStartTime',
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs font-mono text-center w-full px-2"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[11px] text-muted-foreground font-medium block">
                                      إلى:
                                    </span>
                                    <Input
                                      type="time"
                                      dir="ltr"
                                      value={day.morningEndTime}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          day.dayOfWeek,
                                          'morningEndTime',
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs font-mono text-center w-full px-2"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[11px] text-muted-foreground italic py-1">
                                  معطلة في هذا اليوم
                                </p>
                              )}
                            </div>

                            {/* Evening Shift */}
                            <div
                              className={`p-3 rounded-xl border text-xs transition-colors ${
                                day.isEveningActive
                                  ? 'bg-indigo-500/5 border-indigo-500/30 shadow-xs'
                                  : 'bg-muted/10 border-border/40 opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/30">
                                <div className="flex items-center gap-1.5 font-semibold text-indigo-800 dark:text-indigo-300">
                                  <Moon className="h-4 w-4 text-indigo-500" />
                                  <span>الفترة المسائية</span>
                                </div>
                                <Switch
                                  checked={day.isEveningActive}
                                  onCheckedChange={(checked) =>
                                    handleFieldChange(day.dayOfWeek, 'isEveningActive', checked)
                                  }
                                />
                              </div>

                              {day.isEveningActive ? (
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div className="space-y-1">
                                    <span className="text-[11px] text-muted-foreground font-medium block">
                                      من:
                                    </span>
                                    <Input
                                      type="time"
                                      dir="ltr"
                                      value={day.eveningStartTime}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          day.dayOfWeek,
                                          'eveningStartTime',
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs font-mono text-center w-full px-2"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[11px] text-muted-foreground font-medium block">
                                      إلى:
                                    </span>
                                    <Input
                                      type="time"
                                      dir="ltr"
                                      value={day.eveningEndTime}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          day.dayOfWeek,
                                          'eveningEndTime',
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs font-mono text-center w-full px-2"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[11px] text-muted-foreground italic py-1">
                                  معطلة في هذا اليوم
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic py-1">
                            مغلق / إجازة رسمية للطبيب في هذا اليوم
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="exceptions" className="space-y-4 pt-1">
                {/* Add Exception Box */}
                <form
                  onSubmit={handleAddException}
                  className="p-4 rounded-xl border bg-muted/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Plus className="h-4 w-4 text-emerald-600" />
                      <span>إضافة استثناء أو إجازة لطبيب</span>
                    </div>

                    {/* Mode Toggle: Single Day vs Date Range */}
                    <div className="flex items-center gap-1.5 p-0.5 rounded-lg border bg-background text-xs">
                      <Button
                        type="button"
                        size="sm"
                        variant={!isDateRange ? 'secondary' : 'ghost'}
                        className="h-6 text-[11px] px-2"
                        onClick={() => setIsDateRange(false)}
                      >
                        <Calendar className="h-3 w-3 ml-1" />
                        يوم واحد
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={isDateRange ? 'secondary' : 'ghost'}
                        className="h-6 text-[11px] px-2"
                        onClick={() => setIsDateRange(true)}
                      >
                        <CalendarRange className="h-3 w-3 ml-1" />
                        نطاق إجازة (عدة أيام)
                      </Button>
                    </div>
                  </div>

                  {!isDateRange ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">تاريخ اليوم *</Label>
                        <Input
                          type="date"
                          value={exceptionDate}
                          onChange={(e) => setExceptionDate(e.target.value)}
                          className="h-9 text-xs"
                          required={!isDateRange}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">سبب الإجازة / الاستثناء</Label>
                        <Input
                          type="text"
                          placeholder="مثال: إجازة خاصة، مؤتمر طبي، ظرف طارئ"
                          value={exceptionReason}
                          onChange={(e) => setExceptionReason(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">من تاريخ *</Label>
                        <Input
                          type="date"
                          value={exceptionStartDate}
                          onChange={(e) => setExceptionStartDate(e.target.value)}
                          className="h-9 text-xs"
                          required={isDateRange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">إلى تاريخ *</Label>
                        <Input
                          type="date"
                          value={exceptionEndDate}
                          onChange={(e) => setExceptionEndDate(e.target.value)}
                          className="h-9 text-xs"
                          required={isDateRange}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">سبب الإجازة / الاستثناء</Label>
                        <Input
                          type="text"
                          placeholder="مثال: إجازة سنوية، عطلة العيد، سفر خارجي"
                          value={exceptionReason}
                          onChange={(e) => setExceptionReason(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    {!isDateRange ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is-off-switch"
                          checked={exceptionIsOff}
                          onCheckedChange={setExceptionIsOff}
                        />
                        <Label htmlFor="is-off-switch" className="text-xs cursor-pointer">
                          {exceptionIsOff
                            ? 'عطلة كاملة (إيقاف الحجوزات في هذا اليوم)'
                            : 'ساعات عمل مخصصة لهذا اليوم'}
                        </Label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge
                          variant="outline"
                          className="text-[11px] bg-red-500/10 text-red-700 dark:text-red-300 border-red-300"
                        >
                          إجازة كاملة
                        </Badge>
                        <span>سيتم إيقاف المواعيد لجميع أيام النطاق المحددة</span>
                      </div>
                    )}

                    {!isDateRange && !exceptionIsOff && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          dir="ltr"
                          value={exceptionStartTime}
                          onChange={(e) => setExceptionStartTime(e.target.value)}
                          className="h-8 text-xs font-mono text-center w-28"
                        />
                        <span className="text-xs text-muted-foreground">-</span>
                        <Input
                          type="time"
                          dir="ltr"
                          value={exceptionEndTime}
                          onChange={(e) => setExceptionEndTime(e.target.value)}
                          className="h-8 text-xs font-mono text-center w-28"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                      disabled={
                        addExceptionMutation.isPending ||
                        isCheckingConflicts ||
                        (!isDateRange ? !exceptionDate : !exceptionStartDate || !exceptionEndDate)
                      }
                    >
                      {addExceptionMutation.isPending || isCheckingConflicts ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 ml-1 animate-spin" />
                          {isCheckingConflicts ? 'فحص التعارض...' : 'جاري الإضافة...'}
                        </>
                      ) : (
                        'إضافة الاستثناء'
                      )}
                    </Button>
                  </div>
                </form>

                {/* Existing Exceptions List */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground block">
                    الاستثناءات والإجازات المسجلة ({scheduleData?.exceptions?.length || 0})
                  </Label>
                  {scheduleData?.exceptions && scheduleData.exceptions.length > 0 ? (
                    <div className="divide-y rounded-xl border bg-card">
                      {scheduleData.exceptions.map((ex) => (
                        <div
                          key={ex.id}
                          className="p-3 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                                ex.isOff
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              <Calendar className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-2">
                                <span>{ex.exceptionDate}</span>
                                <Badge
                                  variant={ex.isOff ? 'destructive' : 'outline'}
                                  className="text-[10px] py-0 px-1.5"
                                >
                                  {ex.isOff
                                    ? 'إجازة كاملة'
                                    : `${ex.customStartTime} - ${ex.customEndTime}`}
                                </Badge>
                              </div>
                              {ex.reason && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {ex.reason}
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-600"
                            onClick={() =>
                              doctor?.id &&
                              deleteExceptionMutation.mutate({
                                doctorId: doctor.id,
                                exceptionId: ex.id,
                              })
                            }
                            disabled={deleteExceptionMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border rounded-xl bg-muted/20 text-xs text-muted-foreground">
                      لا توجد إجازات أو استثناءات مسجلة لهذا الطبيب.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
            {activeTab === 'weekly' && (
              <Button onClick={handleSave} disabled={updateMutation.isPending || isLoading}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ جدول الدوام والسعة'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Warning Dialog */}
      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent dir="rtl" className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>تنبيه: تعارض مع مواعيد مسجلة للمرضى</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right text-xs space-y-2">
              <span>
                توجد <strong className="text-foreground">{conflictsList.length}</strong> مواعيد
                مؤكدة محجوزة مسبقاً خلال فترة الإجازة المحددة.
              </span>
              <span className="block text-muted-foreground">
                في حال تأكيد الإجازة، سيتم تسجيلها ولكن سيتعين على فريق الاستقبال التواصل مع هؤلاء
                المرضى لتعديل أو إعادة جدولة مواعيدهم:
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="max-h-48 overflow-y-auto space-y-1.5 border rounded-lg p-2 bg-muted/20 text-xs">
            {conflictsList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded bg-card border text-[11px]"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{item.fullName}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" />
                    <span dir="ltr">{item.phone}</span>
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant="outline" className="text-[10px]">
                    {item.date}
                  </Badge>
                  <div className="text-muted-foreground text-[10px] mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
            <AlertDialogCancel onClick={() => setShowConflictDialog(false)}>
              إلغاء والتراجع
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPendingException}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تأكيد تسجيل الإجازة رغم التعارض
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
