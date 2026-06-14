import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, LogOut, Pencil, Save, X, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { usePhoneFormat } from "@/hooks/form/usePhoneFormat";

export default function PatientProfilePage() {
  const { formatPhoneDisplay } = usePhoneFormat();
  const utils = trpc.useUtils();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    address: "",
    email: "",
  });

  const { data: patient, isLoading } = trpc.patientPortal.me.useQuery();

  const logoutMutation = trpc.patientPortal.logout.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الخروج");
      window.location.href = "/patient-portal/login";
    },
  });

  const updateProfileMutation = trpc.patientPortal.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success("تم تحديث بياناتك بنجاح");
      setIsEditing(false);
      await utils.patientPortal.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر تحديث البيانات");
    },
  });

  useEffect(() => {
    if (patient) {
      setForm({
        fullName: patient.fullName || "",
        age: patient.age ? String(patient.age) : "",
        address: patient.address || "",
        email: patient.email || "",
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

  if (!patient) return null;

  const handleSave = () => {
    const fullName = form.fullName.trim();
    if (fullName.length < 3) {
      toast.error("الاسم الكامل يجب أن يكون 3 أحرف على الأقل");
      return;
    }

    let parsedAge: number | undefined = undefined;
    if (form.age.trim()) {
      const ageNum = Number(form.age);
      if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 150) {
        toast.error("العمر يجب أن يكون رقماً صحيحاً بين 1 و 150");
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
      fullName: patient.fullName || "",
      age: patient.age ? String(patient.age) : "",
      address: patient.address || "",
      email: patient.email || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl shadow-sm border-green-100 dark:border-gray-700 bg-gradient-to-l from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              بيانات الحساب
            </CardTitle>
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5 ml-1" />
                تعديل
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                >
                  <X className="h-3.5 w-3.5 ml-1" />
                  إلغاء
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
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
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-muted-foreground">الاسم الكامل</p>
                <p className="text-sm font-medium mt-0.5">{patient.fullName}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                <p className="text-sm font-medium mt-0.5 flex items-center gap-1" dir="ltr">
                  <Phone className="h-3 w-3" />
                  {formatPhoneDisplay(patient.phone)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-muted-foreground">الجنس</p>
                <p className="text-sm font-medium mt-0.5">{patient.gender === "male" ? "ذكر" : "أنثى"}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-muted-foreground">العمر</p>
                <p className="text-sm font-medium mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {patient.age || "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 sm:col-span-2">
                <p className="text-xs text-muted-foreground">العنوان</p>
                <p className="text-sm font-medium mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {patient.address || "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 sm:col-span-2">
                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                <p className="text-sm font-medium mt-0.5 flex items-center gap-1" dir="ltr">
                  <Mail className="h-3 w-3" />
                  {patient.email || "—"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="fullName" className="text-sm">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-sm">العمر</Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="العمر"
                  min={1}
                  max={150}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address" className="text-sm">العنوان</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="المدينة - الحي"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full rounded-xl"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin ml-1" />
        ) : (
          <LogOut className="h-4 w-4 ml-1" />
        )}
        تسجيل الخروج
      </Button>
    </div>
  );
}
