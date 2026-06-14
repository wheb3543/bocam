/**
 * Admin Login Page - Local Authentication
 * صفحة تسجيل دخول الموظفين - المصادقة المحلية
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/api/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User, Lock, Shield, ArrowRight, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Check if already logged in
  const { data: user, isLoading: checkingAuth } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`مرحباً ${data.user.name || data.user.username}! تم تسجيل الدخول بنجاح`);
      navigate("/admin");
    },
    onError: (err) => {
      toast.error(err.message || "فشل تسجيل الدخول");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || identifier.length < 3) {
      toast.error("يرجى إدخال اسم المستخدم أو البريد الإلكتروني");
      return;
    }
    
    if (!password || password.length < 1) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }
    
    loginMutation.mutate({ identifier, password });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden" dir="rtl">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-particle"
            style={{
              width: Math.random() * 10 + 5 + 'px',
              height: Math.random() * 10 + 5 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: i % 2 === 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)',
              animation: `particle ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: Math.random() * 5 + 's',
            }}
          />
        ))}
      </div>

      {/* Animated Heart Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Green Ribbon - from right */}
        <div className="absolute bottom-0 right-0 w-full h-full">
          <div className="absolute bottom-0 right-0 w-32 h-96 bg-gradient-to-l from-green-600 to-green-400 opacity-30 animate-ribbon-green"
               style={{
                 animation: 'ribbonGreen 6s ease-in-out infinite',
                 clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                 borderRadius: '50%',
                 filter: 'blur(2px)',
                 boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)'
               }}>
          </div>
        </div>
        {/* Blue Ribbon - from right */}
        <div className="absolute bottom-0 right-0 w-full h-full">
          <div className="absolute bottom-0 right-0 w-32 h-96 bg-gradient-to-l from-blue-600 to-blue-400 opacity-30 animate-ribbon-blue"
               style={{
                 animation: 'ribbonBlue 6s ease-in-out infinite',
                 animationDelay: '0.5s',
                 clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                 borderRadius: '50%',
                 filter: 'blur(2px)',
                 boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
               }}>
          </div>
        </div>
        {/* Heart Icon at Center Top */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-heart-pulse">
          <div className="relative">
            <Heart className="h-8 w-8 text-green-600 opacity-30" />
            <div className="absolute inset-0 bg-green-600 opacity-20 blur-xl animate-glow" />
          </div>
        </div>
      </div>

      <main className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 relative z-10">
        <div className="w-full max-w-md">
          {/* Header with Hospital Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-4">
              <img 
                src="/sgh-logo-full.png" 
                alt="شعار المستشفى" 
                className="h-16 sm:h-20 mx-auto animate-logo-float"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 blur-xl animate-logo-glow" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent animate-text-shimmer">
              بوابة الموظفين
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              سجّل دخولك لإدارة النظام
            </p>
          </div>

          {/* Login Form with Glassmorphism */}
          <Card className="shadow-2xl border border-white/20 dark:border-gray-700/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl animate-card-appear">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                <User className="h-5 w-5 text-green-600" />
                تسجيل الدخول
              </CardTitle>
              <CardDescription>أدخل بيانات الدخول الخاصة بك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="identifier" className="text-sm font-medium relative">
                    اسم المستخدم أو البريد الإلكتروني
                    <Sparkles className="absolute -left-5 top-1/2 -translate-y-1/2 h-3 w-3 text-green-500 animate-sparkle" />
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="username أو email@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="mt-1.5 text-base h-11 sm:h-12 border-green-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300 hover:border-green-300"
                    dir="ltr"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium relative">
                    كلمة المرور
                    <Sparkles className="absolute -left-5 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-500 animate-sparkle" style={{ animationDelay: '0.5s' }} />
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 text-base h-11 sm:h-12 pr-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 hover:border-blue-300"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 accent-green-600"
                  />
                  <Label htmlFor="remember" className="text-sm">تذكرني في هذا المتصفح</Label>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending || !identifier || !password}
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-base font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105"
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>تسجيل الدخول</>
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  يمكنك أيضاً تسجيل الدخول عبر{" "}
                  <a href="/api/oauth/login" className="text-green-600 hover:text-green-700 hover:underline transition-colors">
                    OAuth
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border border-green-100 dark:border-gray-700 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400 mb-2 animate-icon-bounce" />
              <span className="text-xs sm:text-sm font-medium text-foreground">أمان عالي</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border border-blue-100 dark:border-gray-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
              <User className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 mb-2 animate-icon-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="text-xs sm:text-sm font-medium text-foreground">وصول سريع</span>
            </div>
          </div>

          {/* BOCAM Branding */}
          <div className="mt-12 sm:mt-16 text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_auto]">
              نظام BOCAM
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              صنع بواسطة آيديا للاستشارات والحلول التسويقية والتقنية
            </p>
            <p className="text-xs text-muted-foreground">
              جميع الحقوق محفوظة ٢٠٢٦
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
