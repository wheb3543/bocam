import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  User,
  LogOut,
  Pencil,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { emitToastHash } from '@/lib/toastHashRouter';
import { usePhoneFormat } from '@/hooks/form/usePhoneFormat';

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

  const { data: patient, isLoading } = trpc.patientPortal.me.useQuery();

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

  return (
    <div className="space-y-5 pb-8">
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
                <p className="mt-1 text-base font-bold text-foreground">حساب نشط</p>
              </div>
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40">
                <p className="text-xs text-muted-foreground">رقم الهاتف</p>
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
                  {patient.age || '—'}
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
    </div>
  );
}
