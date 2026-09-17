import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  User,
  Users,
  LogOut,
  Pencil,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { emitToastHash } from '@/lib/toastHashRouter';
import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';
import {
  RELATIONSHIP_LABELS,
  getRelationshipBadgeStyle,
  getAvailableRelationships,
  type ValidRelationship,
} from '@/components/patient/FamilyMembersFilter';

export default function PatientProfilePage() {
  const [, navigate] = useLocation();
  const { formatPhoneDisplay } = usePhoneFormat();
  const utils = trpc.useUtils();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    address: '',
    email: '',
  });

  // Edit Family Member state
  const [editingMember, setEditingMember] = useState<{
    id: number;
    fullName: string;
    gender: 'male' | 'female';
    age: string;
    relationship: ValidRelationship;
  } | null>(null);

  // Add Family Member state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState<{
    fullName: string;
    gender: 'male' | 'female';
    age: string;
    relationship: ValidRelationship;
  }>({
    fullName: '',
    gender: 'male',
    age: '',
    relationship: 'son',
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const { data: patient, isLoading } = trpc.patientPortal.me.useQuery();
  const { data: familyMembers, isLoading: familyLoading } =
    trpc.patientPortal.getFamilyMembers.useQuery();

  const logoutMutation = trpc.patientPortal.logout.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم تسجيل الخروج',
        description: 'تم تسجيل الخروج بنجاح من البوابة.',
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
        description: 'تم حفظ بياناتك الشخصية الأخيرة.',
        redirect: '/patient-portal/profile',
      });
      setIsEditing(false);
      await utils.patientPortal.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'تعذر تحديث البيانات');
    },
  });

  const addFamilyMemberMutation = trpc.patientPortal.addFamilyMember.useMutation({
    onSuccess: async () => {
      toast.success('تمت إضافة فرد العائلة بنجاح');
      setIsAddingMember(false);
      setNewMemberForm({
        fullName: '',
        gender: 'male',
        age: '',
        relationship: 'son',
      });
      await utils.patientPortal.getFamilyMembers.invalidate();
      await utils.patientPortal.myAppointments.invalidate();
      await utils.patientPortal.myResults.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'تعذر إضافة فرد العائلة');
    },
  });

  const updateFamilyMemberMutation = trpc.patientPortal.updateFamilyMember.useMutation({
    onSuccess: async () => {
      toast.success('تم تحديث بيانات فرد العائلة بنجاح');
      setEditingMember(null);
      await utils.patientPortal.getFamilyMembers.invalidate();
      await utils.patientPortal.myAppointments.invalidate();
      await utils.patientPortal.myResults.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'تعذر تحديث بيانات فرد العائلة');
    },
  });

  const changePasswordMutation = trpc.patientPortal.changePassword.useMutation({
    onSuccess: async (res) => {
      toast.success(res.message || 'تم تحديث كلمة المرور بنجاح');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      await utils.patientPortal.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || 'فشل تحديث كلمة المرور');
    },
  });

  useEffect(() => {
    if (patient) {
      setForm({
        fullName: patient.fullName || '',
        age: patient.age ? String(patient.age) : '',
        address: patient.address || '',
        email: patient.email || '',
      });
    }
  }, [patient]);

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const dependentMembers = (familyMembers || []).filter((m) => m.id !== patient.id && !m.isPrimary);

  const handleSave = () => {
    const fullName = form.fullName.trim();
    if (fullName.length < 3) {
      toast.error('الاسم الكامل يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    let parsedAge: number | undefined = undefined;
    if (form.age.trim()) {
      const ageNum = Number(form.age);
      if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 150) {
        toast.error('العمر يجب أن يكون رقماً صحيحاً بين 1 و 150');
        return;
      }
      parsedAge = ageNum;
    }

    updateProfileMutation.mutate({
      fullName,
      age: parsedAge,
      address: form.address.trim() || undefined,
      email: form.email.trim() || undefined,
    });
  };

  const handleCancel = () => {
    setForm({
      fullName: patient.fullName || '',
      age: patient.age ? String(patient.age) : '',
      address: patient.address || '',
      email: patient.email || '',
    });
    setIsEditing(false);
  };

  // Open Edit Member Modal
  const handleOpenEditMember = (member: {
    id: number;
    fullName: string;
    gender: string | null;
    age: number | null;
    relationship: string;
  }) => {
    const memberGender = (member.gender as 'male' | 'female') || 'male';
    const available = getAvailableRelationships(patient.gender as 'male' | 'female', memberGender);
    let rel = (member.relationship as ValidRelationship) || 'other';
    if (!available.some((opt) => opt.value === rel)) {
      rel = available[0]?.value || 'other';
    }

    setEditingMember({
      id: member.id,
      fullName: member.fullName,
      gender: memberGender,
      age: member.age ? String(member.age) : '',
      relationship: rel,
    });
  };

  // Gender toggle in Edit Member Modal
  const handleEditGenderChange = (newGender: 'male' | 'female') => {
    if (!editingMember) {
      return;
    }
    const available = getAvailableRelationships(patient.gender as 'male' | 'female', newGender);
    let newRel = editingMember.relationship;
    if (!available.some((opt) => opt.value === newRel)) {
      if (newGender === 'female') {
        if (newRel === 'son') {
          newRel = 'daughter';
        } else if (newRel === 'father') {
          newRel = 'mother';
        } else if (newRel === 'brother') {
          newRel = 'sister';
        } else if (newRel === 'grandfather') {
          newRel = 'grandmother';
        } else if (newRel === 'husband') {
          newRel = patient.gender === 'male' ? 'wife' : 'daughter';
        } else {
          newRel = available[0]?.value || 'daughter';
        }
      } else {
        if (newRel === 'daughter') {
          newRel = 'son';
        } else if (newRel === 'mother') {
          newRel = 'father';
        } else if (newRel === 'sister') {
          newRel = 'brother';
        } else if (newRel === 'grandmother') {
          newRel = 'grandfather';
        } else if (newRel === 'wife') {
          newRel = patient.gender === 'female' ? 'husband' : 'son';
        } else {
          newRel = available[0]?.value || 'son';
        }
      }
    }
    setEditingMember({
      ...editingMember,
      gender: newGender,
      relationship: newRel,
    });
  };

  // Save Edit Member
  const handleSaveEditMember = () => {
    if (!editingMember) {
      return;
    }
    const fullName = editingMember.fullName.trim();
    if (fullName.length < 3) {
      toast.error('الاسم الكامل يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    let parsedAge: number | undefined = undefined;
    if (editingMember.age.trim()) {
      const a = Number(editingMember.age);
      if (!Number.isInteger(a) || a < 1 || a > 150) {
        toast.error('العمر يجب أن يكون رقماً صحيحاً بين 1 و 150');
        return;
      }
      parsedAge = a;
    }

    updateFamilyMemberMutation.mutate({
      relatedPatientId: editingMember.id,
      fullName,
      gender: editingMember.gender,
      age: parsedAge,
      relationship: editingMember.relationship,
    });
  };

  // Open Add Member Modal
  const handleOpenAddMember = () => {
    const defaultGender: 'male' | 'female' = 'male';
    const available = getAvailableRelationships(patient.gender as 'male' | 'female', defaultGender);
    setNewMemberForm({
      fullName: '',
      gender: defaultGender,
      age: '',
      relationship: available[0]?.value || 'son',
    });
    setIsAddingMember(true);
  };

  // Gender toggle in Add Member Modal
  const handleAddGenderChange = (newGender: 'male' | 'female') => {
    const available = getAvailableRelationships(patient.gender as 'male' | 'female', newGender);
    let newRel = newMemberForm.relationship;
    if (!available.some((opt) => opt.value === newRel)) {
      if (newGender === 'female') {
        if (newRel === 'son') {
          newRel = 'daughter';
        } else if (newRel === 'father') {
          newRel = 'mother';
        } else if (newRel === 'brother') {
          newRel = 'sister';
        } else if (newRel === 'grandfather') {
          newRel = 'grandmother';
        } else if (newRel === 'husband') {
          newRel = patient.gender === 'male' ? 'wife' : 'daughter';
        } else {
          newRel = available[0]?.value || 'daughter';
        }
      } else {
        if (newRel === 'daughter') {
          newRel = 'son';
        } else if (newRel === 'mother') {
          newRel = 'father';
        } else if (newRel === 'sister') {
          newRel = 'brother';
        } else if (newRel === 'grandmother') {
          newRel = 'grandfather';
        } else if (newRel === 'wife') {
          newRel = patient.gender === 'female' ? 'husband' : 'son';
        } else {
          newRel = available[0]?.value || 'son';
        }
      }
    }
    setNewMemberForm({
      ...newMemberForm,
      gender: newGender,
      relationship: newRel,
    });
  };

  // Save Add Member
  const handleSaveAddMember = () => {
    const fullName = newMemberForm.fullName.trim();
    if (fullName.length < 3) {
      toast.error('الاسم الكامل يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    let parsedAge: number | undefined = undefined;
    if (newMemberForm.age.trim()) {
      const a = Number(newMemberForm.age);
      if (!Number.isInteger(a) || a < 1 || a > 150) {
        toast.error('العمر يجب أن يكون رقماً صحيحاً بين 1 و 150');
        return;
      }
      parsedAge = a;
    }

    addFamilyMemberMutation.mutate({
      fullName,
      gender: newMemberForm.gender,
      age: parsedAge,
      relationship: newMemberForm.relationship,
    });
  };

  const handlePasswordSubmit = () => {
    if (patient.hasPassword && !passwordForm.currentPassword) {
      toast.error('يرجى إدخال كلمة المرور الحالية');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('كلمة المرور الجديدة يجب أن تتكون من 6 أحرف أو أرقام على الأقل');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: patient.hasPassword ? passwordForm.currentPassword : undefined,
      newPassword: passwordForm.newPassword,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* بطاقة الملف الشخصي الرئيسي */}
      <Card className="overflow-hidden rounded-[30px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 shadow-[0_18px_40px_rgba(16,185,129,0.10)] dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                  الملف الشخصي
                </p>
                <CardTitle className="mt-1 text-xl font-black text-foreground">
                  {patient.fullName}
                </CardTitle>
              </div>
            </div>
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="rounded-xl border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-background dark:text-emerald-300"
              >
                <Pencil className="ml-1 h-3.5 w-3.5" />
                تعديل
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                  className="rounded-xl"
                >
                  <X className="ml-1 h-3.5 w-3.5" />
                  إلغاء
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="ml-1 h-3.5 w-3.5" />
                      حفظ
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[24px] border border-emerald-100 bg-white/80 p-3 shadow-sm dark:border-emerald-900/30 dark:bg-background/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                  الحالة
                </p>
                <p className="mt-1 text-base font-bold text-foreground">حساب نشط وموثق</p>
              </div>
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40">
                <p className="text-xs text-muted-foreground">رقم الهاتف الأساسي</p>
                <p
                  className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground"
                  dir="ltr"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  {formatPhoneDisplay(patient.phone)}
                </p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40">
                <p className="text-xs text-muted-foreground">الجنس</p>
                <p className="mt-2 text-sm font-bold text-foreground">
                  {patient.gender === 'male' ? 'ذكر' : patient.gender === 'female' ? 'أنثى' : '—'}
                </p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40">
                <p className="text-xs text-muted-foreground">العمر</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  {patient.age ? `${patient.age} سنة` : '—'}
                </p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40">
                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                <p
                  className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground"
                  dir="ltr"
                >
                  <Mail className="h-3.5 w-3.5 text-emerald-600" />
                  {patient.email || '—'}
                </p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40 sm:col-span-2">
                <p className="text-xs text-muted-foreground">العنوان</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  {patient.address || '—'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  الاسم الكامل
                </Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                  className="h-11 rounded-xl border-emerald-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-sm font-medium">
                  العمر
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="العمر"
                  min={1}
                  max={150}
                  className="h-11 rounded-xl border-emerald-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="h-11 rounded-xl border-emerald-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  العنوان
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="المدينة - الحي"
                  className="h-11 rounded-xl border-emerald-200 focus-visible:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* قسم أفراد العائلة التابعين */}
      <Card className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-sm dark:border-emerald-900/30 dark:bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  أفراد العائلة التابعين
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  إدارة بيانات وصلة القرابة لأفراد أسرتك التابعين لهذا الحساب
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {dependentMembers.length > 0 && (
                <Badge
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                >
                  {dependentMembers.length} أفراد
                </Badge>
              )}
              <Button
                size="sm"
                onClick={handleOpenAddMember}
                className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة فرد للعائلة</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          {familyLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          ) : dependentMembers.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {dependentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-2xl border border-border/80 bg-slate-50/70 p-3.5 transition hover:bg-slate-50 dark:bg-muted/30 dark:hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground truncate">
                        {member.fullName}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${getRelationshipBadgeStyle(
                          member.relationship
                        )}`}
                      >
                        {RELATIONSHIP_LABELS[member.relationship] || member.relationship}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {member.gender && <span>{member.gender === 'male' ? 'ذكر' : 'أنثى'}</span>}
                      {member.age && <span>العمر: {member.age} سنة</span>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEditMember(member)}
                    className="h-8 rounded-xl px-2.5 text-xs text-emerald-700 hover:bg-emerald-100/60 dark:text-emerald-300"
                  >
                    <Pencil className="ml-1 h-3 w-3" />
                    تعديل
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center">
              <Users className="mx-auto h-9 w-9 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-bold text-foreground">لا يوجد أفراد عائلة مسجلين حالياً</p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto mb-4">
                يمكنك إضافة أفراد أسرتك التابعين لتسهيل حجز المواعيد واستعراض النتائج والتقارير
                الطبية الخاصة بهم من مكان واحد.
              </p>
              <Button
                size="sm"
                onClick={handleOpenAddMember}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة فرد للعائلة</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* قسم الأمان وكلمة المرور */}
      <Card className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-sm dark:border-emerald-900/30 dark:bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                الأمان وكلمة المرور
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {patient.hasPassword
                  ? 'تغيير كلمة المرور الخاصة بتسجيل الدخول السريع'
                  : 'تعيين كلمة مرور لحسابك لتسجيل الدخول السريع دون انتظار رمز التحقق'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordSubmit();
            }}
            className="space-y-3"
          >
            {patient.hasPassword && (
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-medium">
                  كلمة المرور الحالية
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="أدخل كلمة المرور الحالية"
                    className="h-10 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPasswords ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-medium">
                  {patient.hasPassword ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
                </Label>
                <Input
                  id="newPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="6 أحرف أو أرقام كحد أدنى"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium">
                  تأكيد كلمة المرور
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="أعد كتابة كلمة المرور"
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="h-10 rounded-xl bg-emerald-600 px-5 text-xs font-semibold hover:bg-emerald-700 text-white"
              >
                {changePasswordMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin ml-1" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5 ml-1" />
                )}
                {patient.hasPassword ? 'تحديث كلمة المرور' : 'تعيين كلمة المرور'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* تسجيل الخروج */}
      <Card className="rounded-[24px] border border-border/80 bg-card/80 shadow-sm">
        <CardContent className="p-4">
          <Button
            variant="outline"
            className="w-full justify-center rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="ml-1 h-4 w-4" />
                تسجيل الخروج
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Modal / Dialog لتعديل بيانات فرد العائلة بالكامل */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="max-w-md rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right text-base font-bold">
              تعديل بيانات فرد العائلة
            </DialogTitle>
            <DialogDescription className="text-right text-xs text-muted-foreground">
              تعديل الاسم والجنس والعمر وصلة القرابة بالنسبة لصاحب الحساب ({patient.fullName})
            </DialogDescription>
          </DialogHeader>

          {editingMember && (
            <div className="space-y-3.5 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="editMemberName" className="text-xs font-medium">
                  الاسم الكامل <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="editMemberName"
                  value={editingMember.fullName}
                  onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                  placeholder="اسم فرد العائلة"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">الجنس</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditGenderChange('male')}
                      className={`flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition ${
                        editingMember.gender === 'male'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      ذكر
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditGenderChange('female')}
                      className={`flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition ${
                        editingMember.gender === 'female'
                          ? 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      أنثى
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editMemberAge" className="text-xs font-medium">
                    العمر (اختياري)
                  </Label>
                  <Input
                    id="editMemberAge"
                    type="number"
                    min={1}
                    max={150}
                    value={editingMember.age}
                    onChange={(e) => setEditingMember({ ...editingMember, age: e.target.value })}
                    placeholder="العمر بالسنوات"
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">صلة القرابة</Label>
                <Select
                  value={editingMember.relationship}
                  onValueChange={(val) =>
                    setEditingMember({ ...editingMember, relationship: val as ValidRelationship })
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="اختر صلة القرابة" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {getAvailableRelationships(
                      patient.gender as 'male' | 'female',
                      editingMember.gender
                    ).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start pt-2">
            <Button
              onClick={handleSaveEditMember}
              disabled={updateFamilyMemberMutation.isPending}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              {updateFamilyMemberMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin ml-1" />
              ) : (
                <Save className="h-3.5 w-3.5 ml-1" />
              )}
              حفظ التعديلات
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditingMember(null)}
              className="rounded-xl text-xs"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal / Dialog لإضافة فرد جديد للعائلة */}
      <Dialog open={isAddingMember} onOpenChange={(open) => !open && setIsAddingMember(false)}>
        <DialogContent className="max-w-md rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right text-base font-bold">
              إضافة فرد جديد للعائلة
            </DialogTitle>
            <DialogDescription className="text-right text-xs text-muted-foreground">
              أضف فرداً من أسرتك لربطه بحسابك وتسهيل حجز المواعيد واستعراض النتائج الطبية له.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="addMemberName" className="text-xs font-medium">
                الاسم الكامل <span className="text-red-500">*</span>
              </Label>
              <Input
                id="addMemberName"
                value={newMemberForm.fullName}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                placeholder="اسم فرد العائلة الكامل"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">الجنس</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddGenderChange('male')}
                    className={`flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition ${
                      newMemberForm.gender === 'male'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    ذكر
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddGenderChange('female')}
                    className={`flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition ${
                      newMemberForm.gender === 'female'
                        ? 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    أنثى
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addMemberAge" className="text-xs font-medium">
                  العمر (اختياري)
                </Label>
                <Input
                  id="addMemberAge"
                  type="number"
                  min={1}
                  max={150}
                  value={newMemberForm.age}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, age: e.target.value })}
                  placeholder="العمر بالسنوات"
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">صلة القرابة</Label>
              <Select
                value={newMemberForm.relationship}
                onValueChange={(val) =>
                  setNewMemberForm({ ...newMemberForm, relationship: val as ValidRelationship })
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="اختر صلة القرابة" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {getAvailableRelationships(
                    patient.gender as 'male' | 'female',
                    newMemberForm.gender
                  ).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-start pt-2">
            <Button
              onClick={handleSaveAddMember}
              disabled={addFamilyMemberMutation.isPending}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              {addFamilyMemberMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin ml-1" />
              ) : (
                <Plus className="h-3.5 w-3.5 ml-1" />
              )}
              إضافة الفرد
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddingMember(false)}
              className="rounded-xl text-xs"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
