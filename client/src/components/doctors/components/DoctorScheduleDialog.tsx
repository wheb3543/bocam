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
import { Calendar, Clock, Loader2, Copy } from 'lucide-react';
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
  const [schedules, setSchedules] = useState<DayScheduleForm[]>(DEFAULT_SCHEDULES);

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
          <div className="space-y-4 py-2">
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
                          <Label className="text-[11px] text-muted-foreground">السعة/الفترة</Label>
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
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
