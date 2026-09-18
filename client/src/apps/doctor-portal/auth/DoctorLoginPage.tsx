/**
 * DoctorLoginPage - شاشة تسجيل دخول الأطباء والاستشاريين
 * بوابة مخصصة للكوادر الطبية للوصول إلى العيادة وكشوفات المواعيد
 */
import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Label } from '@core/components/ui/label';
import { Stethoscope, Lock, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { APP_TITLE, COMPANY_ARABIC_NAME } from '@/const';

export default function DoctorLoginPage() {
  const [, navigate] = useLocation();
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId.trim() || !password.trim()) {
      toast.error('يرجى إدخال المعرف الطبي وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      // تمهيد للمصادقة الطبية لاحقاً
      toast.info('بوابة الطبيب قيد الإعداد - سيتم تفعيل الدخول الموحد قريباً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-md shadow-lg border-emerald-100 dark:border-slate-800">
        <CardHeader className="text-center space-y-2 pb-6 border-b">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Stethoscope className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            بوابة الطبيب والعيادة
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            {COMPANY_ARABIC_NAME || APP_TITLE} - تسجيل دخول الكادر الطبي
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor-id">الرقم التعريفي للطبيب أو البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="doctor-id"
                  placeholder="مثال: dr.ahmed@hospital.com أو المعرف الطبي"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor-password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="doctor-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 mt-2"
              disabled={loading}
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول للعيادة'}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-4 text-xs text-slate-400 border-t">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>اتصال آمن ومشفر بالمعايير الطبية المعتمدة</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
