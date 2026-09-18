/**
 * Patient Dashboard - لوحة تحكم المريض
 *
 * يعرض حجوزات المريض ومواعيده ونتائجه وتقاريره
 */
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import type { OfferLead } from '@shared/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Calendar,
  FileText,
  Heart,
  User,
  Users,
  LogOut,
  ClipboardList,
  Stethoscope,
  Gift,
  Tent,
  Phone,
  Clock,
  Settings,
  Home,
  FlaskConical,
  ScanLine,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { emitToastHash } from '@/lib/toastHashRouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';
import PrivacyPolicyUpdateAlert from '@/components/patient/PrivacyPolicyUpdateAlert';
import { useBookingModal } from '@/hooks/booking/useBookingModal';

const RELATIONSHIP_LABELS: Record<string, { label: string; color: string }> = {
  self: { label: 'أنا (الأساسي)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  father: { label: 'الأب', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  mother: { label: 'الأم', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  son: { label: 'الابن', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  daughter: { label: 'الابنة', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  husband: { label: 'الزوج', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  wife: { label: 'الزوجة', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  brother: { label: 'الأخ', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  sister: { label: 'الأخت', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  grandfather: { label: 'الجد', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  grandmother: { label: 'الجدة', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  other: { label: 'فرد عائلة', color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

const RELATIONSHIP_OPTIONS = [
  { value: 'son', label: 'الابن' },
  { value: 'daughter', label: 'الابنة' },
  { value: 'wife', label: 'الزوجة' },
  { value: 'husband', label: 'الزوج' },
  { value: 'father', label: 'الأب' },
  { value: 'mother', label: 'الأم' },
  { value: 'brother', label: 'الأخ' },
  { value: 'sister', label: 'الأخت' },
  { value: 'grandfather', label: 'الجد' },
  { value: 'grandmother', label: 'الجدة' },
  { value: 'other', label: 'فرد عائلة آخر' },
];

export default function PatientDashboard() {
  const { formatPhoneDisplay } = usePhoneFormat();
  const { formatDate } = useFormatDate();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    age: '',
    address: '',
    email: '',
  });

  // Family members state
  const [selectedMemberId, setSelectedMemberId] = useState<'all' | number>('all');
  const [editingRelationshipMember, setEditingRelationshipMember] = useState<{
    relatedPatientId: number;
    fullName: string;
    currentRelationship: string;
  } | null>(null);
  const [newRelationship, setNewRelationship] = useState<string>('other');

  // Check auth
  const { data: patient, isLoading: authLoading } = trpc.patientPortal.me.useQuery();
  const { openBookingModal } = useBookingModal();

  // Fetch data
  const { data: familyMembers } = trpc.patientPortal.getFamilyMembers.useQuery(undefined, {
    enabled: !!patient,
  });

  const { data: appointments, isLoading: appointmentsLoading } =
    trpc.patientPortal.myAppointments.useQuery(undefined, { enabled: !!patient });
  const { data: offerBookings, isLoading: _offersLoading } =
    trpc.patientPortal.myOfferBookings.useQuery(undefined, { enabled: !!patient });
  const { data: campRegistrations, isLoading: _campsLoading } =
    trpc.patientPortal.myCampRegistrations.useQuery(undefined, { enabled: !!patient });
  const { data: results, isLoading: resultsLoading } = trpc.patientPortal.myResults.useQuery(
    undefined,
    { enabled: !!patient }
  );

  // Filter appointments and results by selected family member
  const filteredAppointments = useMemo(() => {
    if (!appointments) {
      return [];
    }
    if (selectedMemberId === 'all') {
      return appointments;
    }
    return appointments.filter((apt) => apt.patientId === selectedMemberId);
  }, [appointments, selectedMemberId]);

  const filteredResults = useMemo(() => {
    if (!results) {
      return [];
    }
    if (selectedMemberId === 'all') {
      return results;
    }
    return results.filter((res) => res.patientId === selectedMemberId);
  }, [results, selectedMemberId]);

  const updateRelationshipMutation = trpc.patientPortal.updateFamilyRelationship.useMutation({
    onSuccess: async () => {
      toast.success('تم تحديث صلة القرابة بنجاح');
      setEditingRelationshipMember(null);
      await utils.patientPortal.getFamilyMembers.invalidate();
      await utils.patientPortal.myAppointments.invalidate();
      await utils.patientPortal.myResults.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'فشل تحديث صلة القرابة');
    },
  });

  const handleNewBooking = () => {
    const selectedMember =
      selectedMemberId !== 'all' ? familyMembers?.find((m) => m.id === selectedMemberId) : null;

    openBookingModal({
      prefill: selectedMember
        ? {
            fullName: selectedMember.fullName || undefined,
            phone: patient?.phone || undefined,
            gender: (selectedMember.gender as 'male' | 'female') || undefined,
            age: selectedMember.age || undefined,
            patientId: selectedMember.id,
          }
        : patient
          ? {
              fullName: patient.fullName || undefined,
              phone: patient.phone || undefined,
              gender: (patient.gender as 'male' | 'female') || undefined,
              age: patient.age || undefined,
              patientId: patient.id,
            }
          : undefined,
    });
  };

  const logoutMutation = trpc.patientPortal.logout.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم تسجيل الخروج',
        description: 'تم تسجيل الخروج بنجاح من بوابة المريض.',
        redirect: '/patient-portal/login',
      });
      navigate('/patient-portal/login');
    },
  });

  const updateProfileMutation = trpc.patientPortal.updateProfile.useMutation({
    onSuccess: async () => {
      emitToastHash({
        kind: 'success',
        message: 'تم تحديث بياناتك بنجاح',
        description: 'تم حفظ تغييرات ملفك الشخصي.',
        redirect: '/patient-portal/home',
      });
      setIsEditingProfile(false);
      await utils.patientPortal.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'تعذر تحديث البيانات');
    },
  });

  useEffect(() => {
    if (!authLoading && !patient) {
      navigate('/patient-portal/login');
    }
  }, [patient, authLoading, navigate]);

  useEffect(() => {
    if (!patient) {
      return;
    }
    setProfileForm({
      fullName: patient.fullName || '',
      age: patient.age ? String(patient.age) : '',
      address: patient.address || '',
      email: patient.email || '',
    });
  }, [patient]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const handleProfileSave = () => {
    const fullName = profileForm.fullName.trim();
    if (fullName.length < 3) {
      toast.error('الاسم الكامل يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    let parsedAge: number | undefined = undefined;
    if (profileForm.age.trim()) {
      const ageNum = Number(profileForm.age);
      if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 150) {
        toast.error('العمر يجب أن يكون رقماً صحيحاً بين 1 و 150');
        return;
      }
      parsedAge = ageNum;
    }

    const email = profileForm.email.trim();
    updateProfileMutation.mutate({
      fullName,
      age: parsedAge,
      address: profileForm.address.trim() || undefined,
      email: email || undefined,
    });
  };

  const handleProfileCancel = () => {
    setProfileForm({
      fullName: patient.fullName || '',
      age: patient.age ? String(patient.age) : '',
      address: patient.address || '',
      email: patient.email || '',
    });
    setIsEditingProfile(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      new: { label: 'جديد', variant: 'default' },
      confirmed: { label: 'مؤكد', variant: 'default' },
      completed: { label: 'مكتمل', variant: 'secondary' },
      cancelled: { label: 'ملغي', variant: 'destructive' },
      pending: { label: 'قيد الانتظار', variant: 'outline' },
      ready: { label: 'جاهز', variant: 'default' },
      delivered: { label: 'تم التسليم', variant: 'secondary' },
      contacted: { label: 'تم التواصل', variant: 'secondary' },
      registered: { label: 'مسجل', variant: 'default' },
      attended: { label: 'حضر', variant: 'default' },
    };
    const info = map[status] || { label: status, variant: 'outline' as const };
    return (
      <Badge variant={info.variant} className="text-[10px] sm:text-xs">
        {info.label}
      </Badge>
    );
  };

  // formatDate is provided by useFormatDate hook above

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-green-50/50 via-white to-green-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
      dir="rtl"
    >
      <Navbar />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
        {/* Patient Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                  مرحباً، {patient.fullName}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" />
                  <span dir="ltr">{formatPhoneDisplay(patient.phone)}</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs sm:text-sm"
            >
              <LogOut className="h-4 w-4 ml-1" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>

        {/* Family Members Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  الملف العائلي الموحد
                  {familyMembers && familyMembers.length > 1 && (
                    <Badge
                      variant="secondary"
                      className="text-[11px] px-2 py-0 bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      {familyMembers.length} أفراد
                    </Badge>
                  )}
                </h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  استعراض وإدارة مواعيد وتقارير أفراد العائلة المسجلين بنفس رقم الهاتف
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                openBookingModal({
                  prefill: {
                    phone: patient.phone || undefined,
                  },
                });
              }}
              className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 self-start sm:self-auto cursor-pointer"
            >
              <Users className="h-3.5 w-3.5 ml-1" />
              حجز لفرد عائلة جديد
            </Button>
          </div>

          {/* Family Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-thin">
            {/* All filter */}
            <button
              type="button"
              onClick={() => setSelectedMemberId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                selectedMemberId === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-900/50 text-muted-foreground border-transparent hover:border-gray-200'
              }`}
            >
              <span>الجميع (الكل)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedMemberId === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {(appointments?.length || 0) + (results?.length || 0)}
              </span>
            </button>

            {/* Members */}
            {familyMembers?.map((member) => {
              const isSelected = selectedMemberId === member.id;
              const relInfo = RELATIONSHIP_LABELS[member.relationship] || {
                label: member.relationship,
                color: 'bg-gray-100 text-gray-700 border-gray-200',
              };
              const memberApptsCount =
                appointments?.filter((a) => a.patientId === member.id).length || 0;
              const memberResultsCount =
                results?.filter((r) => r.patientId === member.id).length || 0;

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-1 pl-1.5 pr-2.5 py-1 rounded-xl text-xs transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900/50 text-foreground border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedMemberId(member.id)}
                    className="flex items-center gap-1.5 cursor-pointer text-right"
                  >
                    <span className="font-semibold">{member.fullName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                        isSelected ? 'bg-white/20 text-white border-white/30' : relInfo.color
                      }`}
                    >
                      {relInfo.label}
                    </span>
                    {(memberApptsCount > 0 || memberResultsCount > 0) && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? 'bg-black/20 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'
                        }`}
                      >
                        {memberApptsCount + memberResultsCount}
                      </span>
                    )}
                  </button>

                  {!member.isPrimary && (
                    <button
                      type="button"
                      title="تعديل صلة القرابة"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRelationshipMember({
                          relatedPatientId: member.id,
                          fullName: member.fullName,
                          currentRelationship: member.relationship,
                        });
                        setNewRelationship(member.relationship || 'other');
                      }}
                      className={`p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-white/80 hover:text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <PrivacyPolicyUpdateAlert />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Card className="border-green-100 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4 text-center">
              <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {selectedMemberId === 'all'
                  ? appointments?.length || 0
                  : filteredAppointments.length}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {selectedMemberId === 'all' ? 'مواعيد (الكل)' : 'مواعيد'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-100 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4 text-center">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {offerBookings?.length || 0}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">حجوزات عروض</p>
            </CardContent>
          </Card>
          <Card className="border-green-100 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4 text-center">
              <Tent className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {campRegistrations?.length || 0}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">مخيمات</p>
            </CardContent>
          </Card>
          <Card className="border-green-100 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4 text-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {selectedMemberId === 'all' ? results?.length || 0 : filteredResults.length}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {selectedMemberId === 'all' ? 'نتائج وتقارير' : 'نتائج الفرد'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-green-50 dark:bg-gray-800 rounded-xl">
            <TabsTrigger
              value="overview"
              className="text-[10px] sm:text-xs md:text-sm py-2 sm:py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg"
            >
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />
              <span className="hidden sm:inline">نظرة عامة</span>
              <span className="sm:hidden">عام</span>
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="text-[10px] sm:text-xs md:text-sm py-2 sm:py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg"
            >
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />
              <span className="hidden sm:inline">المواعيد</span>
              <span className="sm:hidden">مواعيد</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-[10px] sm:text-xs md:text-sm py-2 sm:py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg"
            >
              <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />
              <span className="hidden sm:inline">النتائج</span>
              <span className="sm:hidden">نتائج</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="text-[10px] sm:text-xs md:text-sm py-2 sm:py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg"
            >
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />
              <span className="hidden sm:inline">حسابي</span>
              <span className="sm:hidden">حسابي</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Recent Appointments */}
            <Card className="border-green-100 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-green-600" />
                  آخر المواعيد
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                  </div>
                ) : !filteredAppointments?.length ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">
                      {selectedMemberId === 'all'
                        ? 'لا توجد مواعيد حالياً'
                        : 'لا توجد مواعيد لهذا الفرد حالياً'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewBooking}
                      className="mt-3 text-green-600 border-green-200 cursor-pointer"
                    >
                      احجز موعدك الآن
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAppointments.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs sm:text-sm font-semibold truncate">
                              {'موعد طبي'}
                            </p>
                            {apt.beneficiaryName && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                                  RELATIONSHIP_LABELS[apt.relationship]?.color ||
                                  'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {apt.beneficiaryName}
                                {apt.relationship && apt.relationship !== 'self'
                                  ? ` (${RELATIONSHIP_LABELS[apt.relationship]?.label || apt.relationship})`
                                  : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {formatDate(
                              (apt.appointmentDate as Date | string | null) ||
                                (apt['createdAt'] as Date | string)
                            )}
                          </p>
                        </div>
                        {statusBadge(apt.status as string)}
                      </div>
                    ))}
                    {filteredAppointments.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-green-600 cursor-pointer"
                        onClick={() => setActiveTab('appointments')}
                      >
                        عرض الكل ({filteredAppointments.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card className="border-green-100 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  آخر النتائج والتقارير
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                  </div>
                ) : !filteredResults?.length ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">
                      {selectedMemberId === 'all'
                        ? 'لا توجد نتائج حالياً'
                        : 'لا توجد نتائج لهذا الفرد حالياً'}
                    </p>
                    <p className="text-xs mt-1">ستظهر هنا نتائج التحاليل والأشعة والتقارير</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredResults.slice(0, 3).map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {res.resultType === 'lab' && (
                            <FlaskConical className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                          {res.resultType === 'radiology' && (
                            <ScanLine className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          )}
                          {res.resultType === 'report' && (
                            <ClipboardList className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs sm:text-sm font-medium truncate">{res.title}</p>
                              {res.beneficiaryName && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                                    RELATIONSHIP_LABELS[res.relationship]?.color ||
                                    'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  {res.beneficiaryName}
                                  {res.relationship && res.relationship !== 'self'
                                    ? ` (${RELATIONSHIP_LABELS[res.relationship]?.label || res.relationship})`
                                    : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {formatDate(
                                (res.resultDate as Date | string | null) ||
                                  (res['createdAt'] as Date | string)
                              )}
                            </p>
                          </div>
                        </div>
                        {statusBadge(res.status as string)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coming Soon Features */}
            <Card className="border-dashed border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="p-4 sm:p-6 text-center">
                <Heart className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-sm sm:text-base font-semibold text-green-800 dark:text-green-400">
                  ميزات قادمة قريباً
                </h3>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-500 mt-1">
                  ربط الملف الطبي بنظام المستشفى - الوصفات الطبية - التقارير الطبية المفصلة
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm sm:text-base font-semibold">جميع المواعيد والحجوزات</h2>
              <Button
                size="sm"
                onClick={handleNewBooking}
                className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-9 cursor-pointer"
              >
                حجز جديد
              </Button>
            </div>

            {/* Doctor Appointments */}
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : (
              <>
                {filteredAppointments && filteredAppointments.length > 0 && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" /> مواعيد الأطباء
                    </h3>
                    <div className="space-y-2">
                      {filteredAppointments.map((apt) => (
                        <Card key={apt.id} className="border-green-50 dark:border-gray-700">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold">{'موعد طبي'}</p>
                                  {apt.beneficiaryName && (
                                    <Badge
                                      variant="outline"
                                      className={`text-[11px] py-0.5 px-2 font-medium ${
                                        RELATIONSHIP_LABELS[apt.relationship]?.color ||
                                        'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {apt.beneficiaryName}
                                      {apt.relationship && apt.relationship !== 'self'
                                        ? ` (${RELATIONSHIP_LABELS[apt.relationship]?.label || apt.relationship})`
                                        : ' (الأساسي)'}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] sm:text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(
                                      (apt.appointmentDate as Date | string | null) ||
                                        (apt['createdAt'] as Date | string)
                                    )}
                                  </span>
                                </div>
                              </div>
                              {statusBadge(apt.status as string)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offer Bookings */}
                {offerBookings && offerBookings.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Gift className="h-3.5 w-3.5" /> حجوزات العروض
                    </h3>
                    <div className="space-y-2">
                      {offerBookings.map((booking: OfferLead) => (
                        <Card key={booking.id} className="border-blue-50 dark:border-gray-700">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">
                                  {booking.fullName || 'حجز عرض'}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                  {formatDate(booking.createdAt as Date | string)}
                                </p>
                              </div>
                              {statusBadge(booking.status as string)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Camp Registrations */}
                {campRegistrations && campRegistrations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Tent className="h-3.5 w-3.5" /> تسجيلات المخيمات
                    </h3>
                    <div className="space-y-2">
                      {campRegistrations.map((reg) => (
                        <Card key={reg.id} className="border-purple-50 dark:border-gray-700">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">
                                  {reg.fullName || 'تسجيل مخيم'}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                  {formatDate(reg.createdAt as Date | string)}
                                </p>
                              </div>
                              {statusBadge(reg.status as string)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {!filteredAppointments?.length &&
                  !offerBookings?.length &&
                  !campRegistrations?.length && (
                    <div className="text-center py-10 text-muted-foreground">
                      <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">لا توجد حجوزات أو مواعيد</p>
                      <p className="text-xs mt-1">يمكنك حجز موعد من صفحة الأطباء أو العروض</p>
                    </div>
                  )}
              </>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="mt-4">
            {resultsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : !filteredResults?.length ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {selectedMemberId === 'all'
                    ? 'لا توجد نتائج أو تقارير'
                    : 'لا توجد نتائج أو تقارير لهذا الفرد'}
                </p>
                <p className="text-xs mt-1">ستظهر هنا نتائج التحاليل والأشعة والتقارير الطبية</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Lab Results */}
                {filteredResults.filter((r) => r.resultType === 'lab').length > 0 && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <FlaskConical className="h-3.5 w-3.5 text-blue-500" /> نتائج التحاليل
                    </h3>
                    <div className="space-y-2">
                      {filteredResults
                        .filter((r) => r.resultType === 'lab')
                        .map((res) => (
                          <Card key={res.id} className="border-blue-50 dark:border-gray-700">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-sm font-medium">{res.title}</p>
                                    {res.beneficiaryName && (
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] py-0 px-1.5 font-medium ${
                                          RELATIONSHIP_LABELS[res.relationship]?.color ||
                                          'bg-gray-100 text-gray-700'
                                        }`}
                                      >
                                        {res.beneficiaryName}
                                        {res.relationship && res.relationship !== 'self'
                                          ? ` (${RELATIONSHIP_LABELS[res.relationship]?.label || res.relationship})`
                                          : ' (الأساسي)'}
                                      </Badge>
                                    )}
                                  </div>
                                  {(res['doctorName'] as string | null) && (
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                      د. {res['doctorName'] as string}
                                    </p>
                                  )}
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                                    {formatDate(
                                      (res.resultDate as Date | string | null) ||
                                        (res['createdAt'] as Date | string)
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {statusBadge(res.status as string)}
                                  {(res['fileUrl'] as string | null) && (
                                    <a
                                      href={res['fileUrl'] as string}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}

                {/* Radiology */}
                {filteredResults.filter((r) => r.resultType === 'radiology').length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <ScanLine className="h-3.5 w-3.5 text-purple-500" /> نتائج الأشعة
                    </h3>
                    <div className="space-y-2">
                      {filteredResults
                        .filter((r) => r.resultType === 'radiology')
                        .map((res) => (
                          <Card key={res.id} className="border-purple-50 dark:border-gray-700">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-sm font-medium">{res.title}</p>
                                    {res.beneficiaryName && (
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] py-0 px-1.5 font-medium ${
                                          RELATIONSHIP_LABELS[res.relationship]?.color ||
                                          'bg-gray-100 text-gray-700'
                                        }`}
                                      >
                                        {res.beneficiaryName}
                                        {res.relationship && res.relationship !== 'self'
                                          ? ` (${RELATIONSHIP_LABELS[res.relationship]?.label || res.relationship})`
                                          : ' (الأساسي)'}
                                      </Badge>
                                    )}
                                  </div>
                                  {(res['doctorName'] as string | null) && (
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                      د. {res['doctorName'] as string}
                                    </p>
                                  )}
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                                    {formatDate(
                                      (res.resultDate as Date | string | null) ||
                                        (res['createdAt'] as Date | string)
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {statusBadge(res.status as string)}
                                  {(res['fileUrl'] as string | null) && (
                                    <a
                                      href={res['fileUrl'] as string}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <FileText className="h-3.5 w-3.5 text-purple-500" />
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}

                {/* Reports */}
                {filteredResults.filter((r) => r.resultType === 'report').length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <ClipboardList className="h-3.5 w-3.5 text-amber-500" /> التقارير الطبية
                    </h3>
                    <div className="space-y-2">
                      {filteredResults
                        .filter((r) => r.resultType === 'report')
                        .map((res) => (
                          <Card key={res.id} className="border-amber-50 dark:border-gray-700">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-sm font-medium">{res.title}</p>
                                    {res.beneficiaryName && (
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] py-0 px-1.5 font-medium ${
                                          RELATIONSHIP_LABELS[res.relationship]?.color ||
                                          'bg-gray-100 text-gray-700'
                                        }`}
                                      >
                                        {res.beneficiaryName}
                                        {res.relationship && res.relationship !== 'self'
                                          ? ` (${RELATIONSHIP_LABELS[res.relationship]?.label || res.relationship})`
                                          : ' (الأساسي)'}
                                      </Badge>
                                    )}
                                  </div>
                                  {(res['doctorName'] as string | null) && (
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                      د. {res['doctorName'] as string}
                                    </p>
                                  )}
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                                    {formatDate(
                                      (res.resultDate as Date | string | null) ||
                                        (res['createdAt'] as Date | string)
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {statusBadge(res.status as string)}
                                  {(res['fileUrl'] as string | null) && (
                                    <a
                                      href={res['fileUrl'] as string}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <FileText className="h-3.5 w-3.5 text-amber-500" />
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4">
            <Card className="border-green-100 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    بيانات الحساب
                  </CardTitle>
                  {!isEditingProfile ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Pencil className="h-3.5 w-3.5 ml-1" />
                      تعديل
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        onClick={handleProfileCancel}
                        disabled={updateProfileMutation.isPending}
                      >
                        <X className="h-3.5 w-3.5 ml-1" />
                        إلغاء
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs bg-green-600 hover:bg-green-700"
                        onClick={handleProfileSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5 ml-1" />
                            حفظ
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isEditingProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">الاسم الكامل</p>
                      <p className="text-sm font-medium mt-0.5">{patient.fullName}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">رقم الهاتف</p>
                      <p className="text-sm font-medium mt-0.5" dir="ltr">
                        {formatPhoneDisplay(patient.phone)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">الجنس</p>
                      <p className="text-sm font-medium mt-0.5">
                        {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">العمر</p>
                      <p className="text-sm font-medium mt-0.5">{patient.age || '—'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">العنوان</p>
                      <p className="text-sm font-medium mt-0.5">{patient.address || '—'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        البريد الإلكتروني
                      </p>
                      <p className="text-sm font-medium mt-0.5" dir="ltr">
                        {patient.email || '—'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">الاسم الكامل</Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        placeholder="الاسم الكامل"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="age">العمر</Label>
                      <Input
                        id="age"
                        type="number"
                        min={1}
                        max={150}
                        value={profileForm.age}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, age: e.target.value }))
                        }
                        placeholder="العمر"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, address: e.target.value }))
                        }
                        placeholder="المدينة - الحي"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        dir="ltr"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="example@email.com"
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">رقم الهاتف</p>
                      <p className="text-sm font-medium mt-0.5" dir="ltr">
                        {formatPhoneDisplay(patient.phone)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">الجنس</p>
                      <p className="text-sm font-medium mt-0.5">
                        {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">تاريخ التسجيل</p>
                  <p className="text-sm">{formatDate(patient.createdAt)}</p>
                </div>

                {/* Coming Soon */}
                <div className="mt-4 p-4 rounded-lg border-dashed border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 text-center">
                  <Heart className="h-6 w-6 text-green-400 mx-auto mb-1" />
                  <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">
                    ربط الملف الطبي
                  </p>
                  <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-500 mt-1">
                    قريباً سيتم ربط حسابك بملفك الطبي في نظام المستشفى
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Family Relationship Dialog */}
        <Dialog
          open={!!editingRelationshipMember}
          onOpenChange={(open) => !open && setEditingRelationshipMember(null)}
        >
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                تحديد صلة القرابة
              </DialogTitle>
              <DialogDescription>
                تحديد صلة القرابة لـ{' '}
                <span className="font-semibold text-foreground">
                  {editingRelationshipMember?.fullName}
                </span>{' '}
                بحساب صاحب الرقم.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>صلة القرابة</Label>
                <Select value={newRelationship} onValueChange={setNewRelationship}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="اختر صلة القرابة" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingRelationshipMember(null)}
                className="cursor-pointer"
              >
                إلغاء
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                disabled={updateRelationshipMutation.isPending}
                onClick={() => {
                  if (!editingRelationshipMember) {
                    return;
                  }
                  updateRelationshipMutation.mutate({
                    relatedPatientId: editingRelationshipMember.relatedPatientId,
                    relationship: newRelationship as
                      | 'self'
                      | 'father'
                      | 'mother'
                      | 'son'
                      | 'daughter'
                      | 'husband'
                      | 'wife'
                      | 'brother'
                      | 'sister'
                      | 'grandfather'
                      | 'grandmother'
                      | 'other',
                  });
                }}
              >
                {updateRelationshipMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'حفظ التعديل'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
