/**
 * Patient Portal Login / Register Page
 * صفحة تسجيل دخول / تسجيل جديد لبوابة المريض
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { processPhoneInput, validateYemeniPhone } from '@/hooks/form/usePhoneFormat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Phone,
  KeyRound,
  UserPlus,
  ArrowRight,
  Heart,
  Shield,
  FileText,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/HeroSection';
import AnimatedCard from '@/components/AnimatedCard';

type Step = 'phone' | 'otp' | 'register';
type LoginMethod = 'otp' | 'password';

export default function PatientPortalLogin() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>('phone');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('otp');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Check if already logged in
  const { data: patient, isLoading: checkingAuth } = trpc.patientPortal.me.useQuery();

  useEffect(() => {
    if (patient) {
      navigate('/patient-portal/home');
    }
  }, [patient, navigate]);

  const sendOtpMutation = trpc.patientPortal.sendOtp.useMutation({
    onSuccess: () => {
      toast.success('تم إرسال رمز التحقق إلى هاتفك');
      setStep('otp');
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ في إرسال الرمز');
    },
  });

  const verifyOtpMutation = trpc.patientPortal.verifyOtp.useMutation({
    onSuccess: (data) => {
      if (data.needsRegistration) {
        toast.info('يرجى إكمال بيانات التسجيل');
        setStep('register');
      } else {
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/patient-portal/home');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'رمز التحقق غير صحيح');
    },
  });

  const registerMutation = trpc.patientPortal.register.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء حسابك بنجاح! مرحباً بك');
      navigate('/patient-portal/home');
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ في التسجيل');
    },
  });

  const loginWithPasswordMutation = trpc.patientPortal.loginWithPassword.useMutation({
    onSuccess: () => {
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/patient-portal/home');
    },
    onError: (err) => {
      toast.error(err.message || 'رقم الهاتف أو كلمة المرور غير صحيحة');
    },
  });

  const handleSendOtp = () => {
    const phoneValidation = validateYemeniPhone(phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.message || 'يرجى إدخال رقم هاتف صحيح');
      return;
    }
    sendOtpMutation.mutate({ phone });
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }
    verifyOtpMutation.mutate({ phone, code: otp });
  };

  const handleLoginWithPassword = () => {
    const phoneValidation = validateYemeniPhone(phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.message || 'يرجى إدخال رقم هاتف صحيح');
      return;
    }
    if (!password || password.length < 1) {
      toast.error('يرجى إدخال كلمة المرور');
      return;
    }
    loginWithPasswordMutation.mutate({ phone, password });
  };

  const handleRegister = () => {
    if (!fullName || fullName.length < 3) {
      toast.error('يرجى إدخال الاسم الكامل (3 أحرف على الأقل)');
      return;
    }
    if (!gender) {
      toast.error('يرجى اختيار الجنس');
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    registerMutation.mutate({
      phone,
      code: otp,
      fullName,
      address: address || undefined,
      age: age ? parseInt(age) : undefined,
      gender: gender as 'male' | 'female',
      email: email || undefined,
      password: registerPassword,
    });
  };

  if (checkingAuth) {
    return (
      <PageLayout
        title="بوابة المريض"
        description="سجّل دخولك لإدارة حجوزاتك ومواعيدك واستلام نتائجك"
        keywords="بوابة المريض, تسجيل دخول, تسجيل جديد"
      >
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="بوابة المريض"
      description="سجّل دخولك لإدارة حجوزاتك ومواعيدك واستلام نتائجك"
      keywords="بوابة المريض, تسجيل دخول, تسجيل جديد"
      showInstallPWA={false}
    >
      <HeroSection
        title="بوابة المريض"
        description="سجّل دخولك لإدارة حجوزاتك ومواعيدك واستلام نتائجك"
        badge={{ text: 'بوابة المريض', icon: Heart }}
      />

      <main className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 -mt-32">
        <div className="w-full max-w-md">
          {/* Step: Phone Number */}
          {step === 'phone' && (
            <AnimatedCard className="shadow-lg border-green-100 dark:border-green-900/30" delay={0}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  تسجيل الدخول
                </CardTitle>
                <CardDescription>أدخل رقم هاتفك للدخول</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    رقم الهاتف
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="مثال: 771234567"
                    value={phone}
                    onChange={(e) => setPhone(processPhoneInput(e.target.value))}
                    className="mt-1.5 text-base h-11 sm:h-12"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={15}
                  />
                </div>

                {/* Login Method Toggle */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={loginMethod === 'otp' ? 'default' : 'outline'}
                    className={
                      loginMethod === 'otp' ? 'flex-1 bg-green-600 hover:bg-green-700' : 'flex-1'
                    }
                    onClick={() => setLoginMethod('otp')}
                  >
                    <KeyRound className="h-4 w-4 ml-1" />
                    رمز التحقق
                  </Button>
                  <Button
                    size="sm"
                    variant={loginMethod === 'password' ? 'default' : 'outline'}
                    className={
                      loginMethod === 'password'
                        ? 'flex-1 bg-green-600 hover:bg-green-700'
                        : 'flex-1'
                    }
                    onClick={() => setLoginMethod('password')}
                  >
                    <UserPlus className="h-4 w-4 ml-1" />
                    كلمة المرور
                  </Button>
                </div>

                {loginMethod === 'otp' ? (
                  <Button
                    onClick={handleSendOtp}
                    disabled={sendOtpMutation.isPending || phone.length < 9}
                    className="w-full h-11 sm:h-12 bg-green-600 hover:bg-green-700 text-base font-semibold"
                  >
                    {sendOtpMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>إرسال رمز التحقق</>
                    )}
                  </Button>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium">
                        كلمة المرور
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1.5 text-base h-11 sm:h-12"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="remember" className="text-sm">
                        تذكرني في هذا المتصفح
                      </Label>
                    </div>
                    <Button
                      onClick={handleLoginWithPassword}
                      disabled={
                        loginWithPasswordMutation.isPending || phone.length < 9 || !password
                      }
                      className="w-full h-11 sm:h-12 bg-green-600 hover:bg-green-700 text-base font-semibold"
                    >
                      {loginWithPasswordMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>تسجيل الدخول</>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </AnimatedCard>
          )}

          {/* Step: OTP Verification */}
          {step === 'otp' && (
            <AnimatedCard className="shadow-lg border-green-100 dark:border-green-900/30" delay={0}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-green-600" />
                  رمز التحقق
                </CardTitle>
                <CardDescription>أدخل الرمز المرسل إلى {phone}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="text-sm font-medium">
                    رمز التحقق
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="أدخل الرمز المكون من 6 أرقام"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="mt-1.5 text-center text-xl tracking-[0.5em] h-12 sm:h-14 font-mono"
                    dir="ltr"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                    }}
                    className="flex-1 h-11"
                  >
                    <ArrowRight className="h-4 w-4 ml-1" />
                    تغيير الرقم
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={verifyOtpMutation.isPending || otp.length !== 6}
                    className="flex-1 h-11 bg-green-600 hover:bg-green-700 font-semibold"
                  >
                    {verifyOtpMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>تحقق</>
                    )}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSendOtp}
                  disabled={sendOtpMutation.isPending}
                  className="w-full text-sm text-muted-foreground"
                >
                  إعادة إرسال الرمز
                </Button>
              </CardContent>
            </AnimatedCard>
          )}

          {/* Step: Registration */}
          {step === 'register' && (
            <AnimatedCard className="shadow-lg border-green-100 dark:border-green-900/30" delay={0}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  تسجيل حساب جديد
                </CardTitle>
                <CardDescription>أكمل بياناتك لإنشاء حسابك في بوابة المريض</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="أدخل اسمك الكامل"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 h-10 sm:h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium">
                      العمر
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="العمر"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="mt-1 h-10 sm:h-11"
                      min={1}
                      max={150}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      الجنس <span className="text-red-500">*</span>
                    </Label>
                    <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                      <SelectTrigger className="mt-1 h-10 sm:h-11">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    العنوان
                  </Label>
                  <Input
                    id="address"
                    placeholder="المدينة - الحي"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    البريد الإلكتروني (اختياري)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-10 sm:h-11"
                    dir="ltr"
                  />
                </div>

                <div>
                  <Label htmlFor="registerPassword" className="text-sm font-medium">
                    كلمة المرور <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="mt-1 h-10 sm:h-11"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    سيتم استخدام هذه الكلمة للدخول المباشر بدون رمز التحقق
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setStep('otp')} className="flex-1 h-11">
                    <ArrowRight className="h-4 w-4 ml-1" />
                    رجوع
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={registerMutation.isPending || !fullName || !gender}
                    className="flex-1 h-11 bg-green-600 hover:bg-green-700 font-semibold"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>إنشاء الحساب</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </AnimatedCard>
          )}

          {/* Features */}
          <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4">
            <AnimatedCard
              className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-green-50 dark:border-gray-700"
              delay={0.1}
              hoverEffect={false}
            >
              <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">إدارة المواعيد</span>
            </AnimatedCard>
            <AnimatedCard
              className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-green-50 dark:border-gray-700"
              delay={0.2}
              hoverEffect={false}
            >
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">
                النتائج والتقارير
              </span>
            </AnimatedCard>
            <AnimatedCard
              className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-green-50 dark:border-gray-700"
              delay={0.3}
              hoverEffect={false}
            >
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">خصوصية وأمان</span>
            </AnimatedCard>
            <AnimatedCard
              className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-green-50 dark:border-gray-700"
              delay={0.4}
              hoverEffect={false}
            >
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">ملفك الطبي</span>
            </AnimatedCard>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
