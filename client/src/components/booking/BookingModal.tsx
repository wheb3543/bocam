import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  AlertCircle,
  Building2,
  CalendarCheck2,
  Sparkles,
  Search,
  Users,
  UserPlus,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useBookingModal } from '@/hooks/booking/useBookingModal';
import { usePatientStorage } from '@/hooks/data/usePatientStorage';
import { useLocation } from 'wouter';

const RELATIONSHIP_LABELS: Record<string, string> = {
  self: 'أنا (الأساسي)',
  father: 'الأب',
  mother: 'الأم',
  son: 'الابن',
  daughter: 'الابنة',
  husband: 'الزوج',
  wife: 'الزوجة',
  brother: 'الأخ',
  sister: 'الأخت',
  grandfather: 'الجد',
  grandmother: 'الجدة',
  other: 'فرد عائلة',
};

// Arabic day names
const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return dateStr;
  }
  const dayName = ARABIC_DAYS[d.getDay()];
  const dayNum = d.getDate();
  const monthName = ARABIC_MONTHS[d.getMonth()];
  return `${dayName}، ${dayNum} ${monthName}`;
}

export function BookingModal() {
  const utils = trpc.useUtils();
  const {
    isOpen,
    doctorId: initialDoctorId,
    departmentId: initialDepartmentId,
    preferredDate: initialPreferredDate,
    prefill,
    closeBookingModal,
  } = useBookingModal();

  const { getSavedPatientInfo, savePatientInfo } = usePatientStorage();
  const [, setLocation] = useLocation();

  // Wizard Step: 1 = Department & Doctor, 2 = Date & Slot, 3 = Patient Info, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selections
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
    period: 'morning' | 'evening';
  } | null>(null);
  const [doctorSearch, setDoctorSearch] = useState<string>('');

  // Beneficiary / Family member selection
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<number | 'new' | null>(null);

  // Patient details form
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  // Booking Result
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id?: number;
    doctorName?: string;
    specialty?: string;
    date?: string;
    time?: string;
  } | null>(null);

  // Family members query (when patient is authenticated in portal)
  const { data: familyMembers } = trpc.patientPortal.getFamilyMembers.useQuery(undefined, {
    staleTime: 60 * 1000,
    enabled: isOpen,
    retry: false,
  });

  // Fetch departments & doctors
  const { data: departmentsData } = trpc.departments.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  const { data: doctorsData, isLoading: isLoadingDoctors } = trpc.doctors.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  // Calculate upcoming 14 days
  const upcomingDays = useMemo(() => {
    const days: { dateStr: string; label: string; dayName: string; isFriday: boolean }[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const dayOfWeek = d.getDay();
      days.push({
        dateStr,
        label:
          i === 0 ? 'اليوم' : i === 1 ? 'غداً' : `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]}`,
        dayName: ARABIC_DAYS[dayOfWeek],
        isFriday: dayOfWeek === 5,
      });
    }
    return days;
  }, []);

  // Sync initial parameters when opened
  useEffect(() => {
    if (isOpen) {
      const savedInfo = getSavedPatientInfo();
      setFullName(prefill?.fullName || savedInfo?.fullName || '');
      setPhone(prefill?.phone || savedInfo?.phone || '');
      setGender(prefill?.gender || (savedInfo?.gender as 'male' | 'female') || 'male');
      setAge(prefill?.age ? String(prefill.age) : '');
      setNotes(prefill?.notes || '');
      setPhoneError('');

      if (prefill?.patientId) {
        setSelectedBeneficiaryId(prefill.patientId);
      } else {
        setSelectedBeneficiaryId(null);
      }

      if (initialDepartmentId) {
        setSelectedDepartmentId(initialDepartmentId);
      }
      if (initialDoctorId) {
        setSelectedDoctorId(initialDoctorId);
        setStep(2); // Jump straight to date/slot selection if doctor is already provided
      } else {
        setStep(1);
      }

      // Default date
      const firstAvailableDate =
        initialPreferredDate ||
        upcomingDays.find((d) => !d.isFriday)?.dateStr ||
        upcomingDays[0]?.dateStr ||
        '';
      setSelectedDate(firstAvailableDate);
      setSelectedSlot(null);
      setConfirmedBooking(null);
    }
  }, [
    isOpen,
    initialDoctorId,
    initialDepartmentId,
    initialPreferredDate,
    prefill,
    getSavedPatientInfo,
    upcomingDays,
  ]);

  // Selected doctor object
  const selectedDoctor = useMemo(() => {
    if (!doctorsData || !selectedDoctorId) {
      return null;
    }
    return doctorsData.find((d) => d.id === selectedDoctorId) || null;
  }, [doctorsData, selectedDoctorId]);

  // Filtered doctors list
  const filteredDoctors = useMemo(() => {
    if (!doctorsData) {
      return [];
    }
    return doctorsData.filter((doc) => {
      if (selectedDepartmentId && doc.departmentId && doc.departmentId !== selectedDepartmentId) {
        return false;
      }
      if (doctorSearch.trim()) {
        const q = doctorSearch.trim().toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesSpec = doc.specialty?.toLowerCase().includes(q);
        if (!matchesName && !matchesSpec) {
          return false;
        }
      }
      return true;
    });
  }, [doctorsData, selectedDepartmentId, doctorSearch]);

  // Query real-time available slots for selected doctor & date
  const {
    data: slotData,
    isLoading: isLoadingSlots,
    refetch: refetchSlots,
  } = trpc.appointments.getAvailableSlots.useQuery(
    {
      doctorId: selectedDoctorId || 0,
      date: selectedDate,
    },
    {
      enabled: isOpen && !!selectedDoctorId && !!selectedDate && step >= 2,
    }
  );

  // Group slots into Morning and Evening
  const morningSlots = useMemo(() => {
    return slotData?.slots?.filter((s) => s.period === 'morning') || [];
  }, [slotData]);

  const eveningSlots = useMemo(() => {
    return slotData?.slots?.filter((s) => s.period === 'evening') || [];
  }, [slotData]);

  // Submit appointment mutation
  const submitAppointment = trpc.appointments.submit.useMutation();

  // Validate Yemeni phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.startsWith('967')) {
      val = val.slice(3);
    }
    setPhone(val);
    if (val && !/^7[0-9]{8}$/.test(val)) {
      setPhoneError('رقم الهاتف اليمني يجب أن يبدأ بـ 7 ويتكون من 9 أرقام (مثال: 771234567)');
    } else {
      setPhoneError('');
    }
  };

  // Submit handler
  const handleConfirmBooking = async () => {
    if (!selectedDoctorId) {
      toast.error('يرجى اختيار الطبيب أولاً');
      setStep(1);
      return;
    }
    if (!selectedDate || !selectedSlot) {
      toast.error('يرجى اختيار التاريخ والفترة الزمنية للموعد');
      setStep(2);
      return;
    }
    if (!fullName.trim()) {
      toast.error('يرجى إدخال اسم المريض الرباعي');
      return;
    }
    if (!phone.trim() || !/^7[0-9]{8}$/.test(phone.trim())) {
      setPhoneError('رقم الهاتف غير صالح. يجب أن يبدأ بـ 7 ويتكون من 9 أرقام');
      toast.error('يرجى إدخال رقم هاتف يمني صحيح');
      return;
    }

    try {
      const result = await submitAppointment.mutateAsync({
        campaignSlug: 'direct-booking',
        doctorId: selectedDoctorId,
        departmentId: selectedDoctor?.departmentId || undefined,
        fullName: fullName.trim(),
        phone: phone.trim(),
        preferredDate: selectedDate,
        preferredTime: selectedSlot.startTime,
        slotStartTime: selectedSlot.startTime,
        slotEndTime: selectedSlot.endTime,
        patientMessage: notes.trim() || undefined,
        gender,
        age: age ? parseInt(age, 10) : undefined,
        source: 'smart_booking_modal',
      });

      // Save info in local storage for quick return
      savePatientInfo({
        fullName: fullName.trim(),
        phone: phone.trim(),
        gender,
      });

      setConfirmedBooking({
        id: result?.insertId,
        doctorName: selectedDoctor?.name,
        specialty: selectedDoctor?.specialty,
        date: selectedDate,
        time: selectedSlot.startTime,
      });

      setStep(4);
      void utils.patientPortal.getFamilyMembers.invalidate();
      void utils.patientPortal.myAppointments.invalidate();
      toast.success('تم تسجيل وحجز موعدك بنجاح!');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'فشل إتمام الحجز. يرجى المحاولة لاحقاً';
      toast.error(errorMsg);
      // If slot was taken, refetch slots
      void refetchSlots();
    }
  };

  const resetAndClose = () => {
    closeBookingModal();
    setStep(1);
    setSelectedDoctorId(null);
    setSelectedSlot(null);
    setConfirmedBooking(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl border-border bg-card shadow-2xl">
        {/* Header with Steps */}
        <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-b border-border/60 p-5 sm:p-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <CalendarCheck2 className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  حجز موعد إلكتروني ذكي
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  حجز فوري منظم وبدون انتظار مسبق
                </DialogDescription>
              </div>
            </div>
            {step < 4 && (
              <Badge variant="outline" className="text-xs px-2.5 py-1 bg-background/80 font-medium">
                الخطوة {step} من 3
              </Badge>
            )}
          </div>

          {/* Stepper Indicator */}
          {step < 4 && (
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-medium">
              <div
                className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                  step >= 1 ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                }`}
              >
                <Building2 className="size-3.5 shrink-0" />
                <span className="truncate">1. القسم والطبيب</span>
              </div>
              <div
                className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                  step >= 2 ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                }`}
              >
                <Clock className="size-3.5 shrink-0" />
                <span className="truncate">2. الموعد والوقت</span>
              </div>
              <div
                className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                  step >= 3 ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                }`}
              >
                <User className="size-3.5 shrink-0" />
                <span className="truncate">3. بيانات المريض</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Select Department & Doctor */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Department Pills */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">
                  اختر القسم أو التخصص:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedDepartmentId(null)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                      selectedDepartmentId === null
                        ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    جميع الأقسام
                  </button>
                  {departmentsData?.map((dep) => (
                    <button
                      key={dep.id}
                      type="button"
                      onClick={() => setSelectedDepartmentId(dep.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                        selectedDepartmentId === dep.id
                          ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                          : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      {dep.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Doctor Input */}
              <div className="relative">
                <Search className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="ابحث باسم الطبيب أو التخصص الدقيق..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="pr-9 h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>

              {/* Doctors List */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-muted-foreground block">
                  الأطباء المتاحون ({filteredDoctors.length}):
                </label>

                {isLoadingDoctors ? (
                  <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <Stethoscope className="size-8 animate-pulse text-primary" />
                    <span>جاري تحميل قائمة الأطباء المعتمدين...</span>
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <div className="py-10 text-center border border-dashed rounded-xl border-border bg-muted/20">
                    <AlertCircle className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-medium text-foreground">لا يوجد أطباء مطابقون</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      جرب اختيار قسم آخر أو تعديل نص البحث
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {filteredDoctors.map((doc) => {
                      const isSelected = selectedDoctorId === doc.id;
                      const isVisiting = doc.isVisiting === 'yes';

                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setSelectedDoctorId(doc.id);
                          }}
                          className={`group relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                              : 'border-border/70 hover:border-primary/50 hover:bg-muted/30 bg-card'
                          }`}
                        >
                          <div className="size-12 rounded-xl bg-muted/80 overflow-hidden shrink-0 border border-border flex items-center justify-center text-muted-foreground">
                            {doc.image ? (
                              <img
                                src={doc.image}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Stethoscope className="size-6 text-primary/70" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-sm text-foreground truncate">
                                {doc.name}
                              </h4>
                              {isVisiting && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 shrink-0"
                                >
                                  زائر
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-primary/80 font-medium truncate mt-0.5">
                              {doc.specialty}
                            </p>
                            {doc.consultationFee && (
                              <p className="text-[11px] text-muted-foreground mt-1">
                                الكشفية:{' '}
                                <span className="font-semibold text-foreground">
                                  {doc.consultationFee}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Date & Slot Selection */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Selected Doctor Summary Card */}
              {selectedDoctor && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      <Stethoscope className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{selectedDoctor.name}</h4>
                      <p className="text-xs text-muted-foreground">{selectedDoctor.specialty}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="text-xs h-7 text-primary hover:text-primary"
                  >
                    تغيير الطبيب
                  </Button>
                </div>
              )}

              {/* Date Selection Bar */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                  <CalendarIcon className="size-3.5 text-primary" />
                  اختر يوم الموعد:
                </label>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {upcomingDays.map((d) => {
                    const isSelected = selectedDate === d.dateStr;
                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(d.dateStr);
                          setSelectedSlot(null);
                        }}
                        className={`flex flex-col items-center justify-center min-w-[76px] py-2 px-2.5 rounded-xl border transition-all shrink-0 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm font-bold scale-[1.02]'
                            : d.isFriday
                              ? 'bg-muted/20 text-muted-foreground/60 border-border/40 hover:border-border'
                              : 'bg-card hover:bg-muted/40 text-foreground border-border'
                        }`}
                      >
                        <span className="text-[11px] opacity-80">{d.dayName}</span>
                        <span className="text-xs font-bold mt-0.5">{d.label}</span>
                        {d.isFriday && (
                          <span className="text-[9px] text-amber-500 font-medium">عطلة</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots Section */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    الفترات الزمنية المتاحة ليوم {formatDisplayDate(selectedDate)}:
                  </label>
                  {slotData && (
                    <span className="text-[11px] text-muted-foreground">
                      مدة الكشف: {slotData.slotDurationMinutes} دقيقة
                    </span>
                  )}
                </div>

                {isLoadingSlots ? (
                  <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <Clock className="size-7 animate-spin text-primary" />
                    <span>جاري جلب الفترات الشاغرة وحساب السعة الاستيعابية...</span>
                  </div>
                ) : slotData && !slotData.isWorking ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-3">
                    <AlertCircle className="size-5 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-sm">الطبيب غير متاح في هذا التاريخ</h5>
                      <p className="text-xs mt-0.5">
                        {slotData.reason || 'يرجى اختيار يوم آخر متاح في جدول دوام الطبيب'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Morning Slots */}
                    {morningSlots.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 mb-2">
                          <Sun className="size-3.5 text-amber-500" />
                          <span>الفترة الصباحية</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {morningSlots.map((slot) => {
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
                                    period: 'morning',
                                  })
                                }
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                                    : slot.isAvailable
                                      ? 'bg-card hover:bg-primary/5 hover:border-primary/50 text-foreground border-border'
                                      : 'bg-muted/30 text-muted-foreground/50 border-border/40 cursor-not-allowed'
                                }`}
                              >
                                <span className="font-semibold">{slot.slotStartTime} ص</span>
                                <span className="text-[10px] mt-0.5 opacity-80">
                                  {slot.isAvailable ? 'متاح' : 'محجوز'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Evening Slots */}
                    {eveningSlots.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 mb-2">
                          <Moon className="size-3.5 text-indigo-400" />
                          <span>الفترة المسائية</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {eveningSlots.map((slot) => {
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
                                    period: 'evening',
                                  })
                                }
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                                    : slot.isAvailable
                                      ? 'bg-card hover:bg-primary/5 hover:border-primary/50 text-foreground border-border'
                                      : 'bg-muted/30 text-muted-foreground/50 border-border/40 cursor-not-allowed'
                                }`}
                              >
                                <span className="font-semibold">{slot.slotStartTime} م</span>
                                <span className="text-[10px] mt-0.5 opacity-80">
                                  {slot.isAvailable ? 'متاح' : 'محجوز'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {morningSlots.length === 0 && eveningSlots.length === 0 && (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        لا توجد فترات متاحة في هذا اليوم.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Patient Information Form */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Selected Slot Summary Banner */}
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CalendarCheck2 className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      {selectedDoctor?.name} - {selectedDoctor?.specialty}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      {formatDisplayDate(selectedDate)} | الوقت: {selectedSlot?.startTime}{' '}
                      {selectedSlot?.period === 'morning' ? 'صباحاً' : 'مساءً'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="text-xs h-7 text-primary hover:text-primary"
                >
                  تعديل الموعد
                </Button>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                {/* Family Member / Beneficiary Selector */}
                {familyMembers && familyMembers.length > 0 && (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Users className="size-3.5 text-primary" />
                        <span>من هو المستفيد من هذا الموعد؟</span>
                      </label>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        الملف العائلي
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {familyMembers.map((member) => {
                        const isSelected = selectedBeneficiaryId === member.id;
                        const relLabel =
                          RELATIONSHIP_LABELS[member.relationship] || member.relationship;
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => {
                              setSelectedBeneficiaryId(member.id);
                              setFullName(member.fullName);
                              if (member.gender) {
                                setGender(member.gender as 'male' | 'female');
                              }
                              if (member.age) {
                                setAge(String(member.age));
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs transition-all border flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                                : 'bg-card text-foreground border-border hover:bg-muted/50'
                            }`}
                          >
                            <span>{member.fullName}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                                isSelected
                                  ? 'bg-white/20 text-white border-white/30'
                                  : 'bg-muted text-muted-foreground border-border/50'
                              }`}
                            >
                              {relLabel}
                            </span>
                          </button>
                        );
                      })}

                      {/* New Family Member Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBeneficiaryId('new');
                          setFullName('');
                          setAge('');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs transition-all border flex items-center gap-1 cursor-pointer ${
                          selectedBeneficiaryId === 'new'
                            ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                            : 'bg-card text-foreground border-border hover:bg-muted/50'
                        }`}
                      >
                        <UserPlus className="size-3" />
                        <span>فرد عائلة جديد</span>
                      </button>
                    </div>

                    {selectedBeneficiaryId === 'new' && (
                      <p className="text-[11px] text-primary bg-primary/10 p-2 rounded-lg mt-1">
                        سيتم تسجيل بيانات فرد العائلة الجديد وربطه تلقائياً بحسابك العائلي الموحد
                        تحت نفس رقم الهاتف.
                      </p>
                    )}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    الاسم الرباعي للمريض <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="مثال: محمد عبدالله أحمد صالح"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pr-9 h-10 text-xs sm:text-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    رقم الهاتف اليمني (واتساب) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      dir="ltr"
                      placeholder="771234567"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="pr-9 h-10 text-xs sm:text-sm rounded-xl font-mono text-left"
                    />
                  </div>
                  {phoneError ? (
                    <p className="text-[11px] text-destructive mt-1">{phoneError}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      سيتم إرسال تذكرة الحجز وتفاصيل الموعد مباشرة عبر الواتساب
                    </p>
                  )}
                </div>

                {/* Gender & Age */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      الجنس
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`h-9 rounded-xl border text-xs font-medium transition-all ${
                          gender === 'male'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-foreground border-border hover:bg-muted/40'
                        }`}
                      >
                        ذكر
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`h-9 rounded-xl border text-xs font-medium transition-all ${
                          gender === 'female'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-foreground border-border hover:bg-muted/40'
                        }`}
                      >
                        أنثى
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      العمر (اختياري)
                    </label>
                    <Input
                      type="number"
                      placeholder="مثال: 32"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min={0}
                      max={120}
                      className="h-9 text-xs sm:text-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* Additional Notes / Symptoms */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    الشكوى أو الأعراض (اختياري)
                  </label>
                  <Textarea
                    placeholder="اكتب باختصار سبب الزيارة أو أية ملاحظات ترغب بإبلاغ الطبيب بها..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[70px] text-xs sm:text-sm rounded-xl resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && confirmedBooking && (
            <div className="py-4 text-center space-y-4">
              <div className="size-16 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="size-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">تم تأكيد طلب الحجز بنجاح!</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  تم تسجيل موعدك في النظام وتخصيص الفترة الزمنية بنجاح بدون تعارض
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 text-right space-y-2 text-xs">
                {confirmedBooking.id && (
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">رقم الحجز المرجعي:</span>
                    <span className="font-bold text-foreground">#{confirmedBooking.id}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">الطبيب:</span>
                  <span className="font-bold text-foreground">{confirmedBooking.doctorName}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">التخصص:</span>
                  <span className="font-bold text-foreground">{confirmedBooking.specialty}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="font-bold text-foreground">
                    {formatDisplayDate(confirmedBooking.date || '')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الوقت المحجوز:</span>
                  <span className="font-bold text-primary">{confirmedBooking.time}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary/90 flex items-center gap-2 text-right">
                <Sparkles className="size-4 shrink-0" />
                <span>
                  تم ربط الموعد بملفك الطبي الرقمي. يمكنك متابعة نتائج الفحوصات والمواعيد عبر بوابة
                  المريض.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-3">
          {step === 1 && (
            <>
              <Button variant="ghost" size="sm" onClick={resetAndClose} className="text-xs">
                إلغاء
              </Button>
              <Button
                size="sm"
                disabled={!selectedDoctorId}
                onClick={() => setStep(2)}
                className="gap-1.5 text-xs font-semibold px-5"
              >
                <span>متابعة لاختيار الوقت</span>
                <ChevronLeft className="size-3.5" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                className="gap-1.5 text-xs"
              >
                <ChevronRight className="size-3.5" />
                <span>السابق</span>
              </Button>
              <Button
                size="sm"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="gap-1.5 text-xs font-semibold px-5"
              >
                <span>متابعة لبيانات المريض</span>
                <ChevronLeft className="size-3.5" />
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                className="gap-1.5 text-xs"
                disabled={submitAppointment.isPending}
              >
                <ChevronRight className="size-3.5" />
                <span>السابق</span>
              </Button>
              <Button
                size="sm"
                disabled={submitAppointment.isPending}
                onClick={handleConfirmBooking}
                className="gap-1.5 text-xs font-semibold px-6 bg-primary hover:bg-primary/90"
              >
                {submitAppointment.isPending ? (
                  <span>جاري تأكيد الحجز...</span>
                ) : (
                  <>
                    <CalendarCheck2 className="size-4" />
                    <span>تأكيد الحجز النهائي</span>
                  </>
                )}
              </Button>
            </>
          )}

          {step === 4 && (
            <div className="flex items-center justify-between w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetAndClose();
                  setLocation('/patient/dashboard');
                }}
                className="text-xs"
              >
                الانتقال لبوابة المريض
              </Button>
              <Button size="sm" onClick={resetAndClose} className="text-xs font-semibold px-6">
                تم، إغلاق
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
