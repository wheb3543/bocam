/**
 * DoctorScheduleDialog - حوار ضبط أوقات دوام الطبيب والسعة الاستيعابية
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { Calendar, Clock, Loader2, Copy, Trash2, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Doctor } from '../types/doctor.types';

interface DayScheduleForm {
  dayOfWeek: number;
  dayName: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
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
  endTime: '14:00',
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

  // New exception form state
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');
  const [exceptionIsOff, setExceptionIsOff] = useState(true);
  const [exceptionStartTime, setExceptionStartTime] = useState('09:00');
  const [exceptionEndTime, setExceptionEndTime] = useState('13:00');

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
          return {
            dayOfWeek: d.dayOfWeek,
            dayName: d.dayName,
            isActive: found.isActive ?? true,
            startTime: found.startTime,
            endTime: found.endTime,
            slotDurationMinutes: found.slotDurationMinutes || 30,
            maxCapacityPerSlot: found.maxCapacityPerSlot || 1,
          };
        }
        return {
          dayOfWeek: d.dayOfWeek,
          dayName: d.dayName,
          isActive: false,
          startTime: '09:00',
          endTime: '14:00',
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

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor?.id || !exceptionDate) {
      toast.error('يرجى تحديد تاريخ الاستثناء');
      return;
    }
    addExceptionMutation.mutate({
      doctorId: doctor.id,
      exceptionDate,
      isOff: exceptionIsOff,
      customStartTime: exceptionIsOff ? undefined : exceptionStartTime,
      customEndTime: exceptionIsOff ? undefined : exceptionEndTime,
      reason: exceptionReason || undefined,
    });
  };

  const handleDayToggle = (dayOfWeek: number, checked: boolean) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, isActive: checked } : s))
    );
  };

  const handleFieldChange = (
    dayOfWeek: number,
    field: keyof DayScheduleForm,
    value: string | number
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
          slotDurationMinutes: source.slotDurationMinutes,
          maxCapacityPerSlot: source.maxCapacityPerSlot,
          isActive: true,
        };
      })
    );
    toast.info('تم تطبيق التوقيت والسعة على جميع أيام العمل (السبت إلى الخميس)');
  };

  const handleSave = () => {
    if (!doctor?.id) {
      return;
    }

    const activeList = schedules
      .filter((s) => s.isActive)
      .map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDurationMinutes: Number(s.slotDurationMinutes) || 30,
        maxCapacityPerSlot: Number(s.maxCapacityPerSlot) || 1,
        isActive: true,
      }));

    updateMutation.mutate({
      doctorId: doctor.id,
      schedules: activeList,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Calendar className="h-5 w-5" />
            </div>
            <span>جدول دوام وسعة الطبيب: {doctor?.name}</span>
          </DialogTitle>
          <DialogDescription>
            حدد فترات العمل اليومية، مدة الجلسة/الكشف، والحد الأقصى لعدد المرضى في كل فترة زمنية
            لمنع الحجز الزائد.
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
              <TabsTrigger value="weekly">جدول الدوام الأسبوعي</TabsTrigger>
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
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>
                    المدة الافتراضية للفترة: 30 دقيقة | السعة الافتراضية: مريض واحد لكل موعد
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Day name & toggle */}
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <Switch
                          id={`switch-${day.dayOfWeek}`}
                          checked={day.isActive}
                          onCheckedChange={(checked) => handleDayToggle(day.dayOfWeek, checked)}
                        />
                        <Label
                          htmlFor={`switch-${day.dayOfWeek}`}
                          className="font-medium text-sm cursor-pointer flex items-center gap-2"
                        >
                          <span>{day.dayName}</span>
                          {day.dayOfWeek === 5 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1 text-muted-foreground"
                            >
                              عطلة
                            </Badge>
                          )}
                        </Label>
                      </div>

                      {/* Work times & slots configuration */}
                      {day.isActive ? (
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 flex-1">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">من</Label>
                            <Input
                              type="time"
                              value={day.startTime}
                              onChange={(e) =>
                                handleFieldChange(day.dayOfWeek, 'startTime', e.target.value)
                              }
                              className="h-8 text-xs w-full sm:w-24"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">إلى</Label>
                            <Input
                              type="time"
                              value={day.endTime}
                              onChange={(e) =>
                                handleFieldChange(day.dayOfWeek, 'endTime', e.target.value)
                              }
                              className="h-8 text-xs w-full sm:w-24"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">
                              مدة الفترة (دقيقة)
                            </Label>
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
                              className="h-8 text-xs w-full sm:w-24"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">
                              السعة/الفترة
                            </Label>
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
                              className="h-8 text-xs w-full sm:w-20"
                            />
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
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Plus className="h-4 w-4 text-emerald-600" />
                  <span>إضافة استثناء أو إجازة لطبيب</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">تاريخ اليوم *</Label>
                    <Input
                      type="date"
                      value={exceptionDate}
                      onChange={(e) => setExceptionDate(e.target.value)}
                      className="h-9 text-xs"
                      required
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

                <div className="flex items-center justify-between pt-1">
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

                  {!exceptionIsOff && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={exceptionStartTime}
                        onChange={(e) => setExceptionStartTime(e.target.value)}
                        className="h-8 text-xs w-24"
                      />
                      <span className="text-xs text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={exceptionEndTime}
                        onChange={(e) => setExceptionEndTime(e.target.value)}
                        className="h-8 text-xs w-24"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                    disabled={addExceptionMutation.isPending || !exceptionDate}
                  >
                    {addExceptionMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
                            <div className="font-semibold text-foreground">
                              {ex.exceptionDate}
                              <Badge
                                variant={ex.isOff ? 'destructive' : 'outline'}
                                className="mr-2 text-[10px] py-0 px-1.5"
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
  );
}
