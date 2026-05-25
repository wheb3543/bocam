/**
 * Admin Login Page - Local Authentication
 * صفحة تسجيل دخول الموظفين - المصادقة المحلية
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User, Lock, Shield, ArrowRight } from "lucide-react";
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
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`مرحباً ${data.user.name || data.user.username}! تم تسجيل الدخول بنجاح`);
      navigate("/dashboard");
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" dir="rtl">
      <main className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 md:py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-400">بوابة الموظفين</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              سجّل دخولك لإدارة النظام
            </p>
          </div>

          {/* Login Form */}
          <Card className="shadow-lg border-blue-100 dark:border-blue-900/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                تسجيل الدخول
              </CardTitle>
              <CardDescription>أدخل بيانات الدخول الخاصة بك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="identifier" className="text-sm font-medium">
                    اسم المستخدم أو البريد الإلكتروني
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="username أو email@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="mt-1.5 text-base h-11 sm:h-12"
                    dir="ltr"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 text-base h-11 sm:h-12 pr-10"
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
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="remember" className="text-sm">تذكرني في هذا المتصفح</Label>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending || !identifier || !password}
                  className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
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
                  <a href="/api/oauth/login" className="text-blue-600 hover:underline">
                    OAuth
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-blue-50 dark:border-gray-700">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">أمان عالي</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-blue-50 dark:border-gray-700">
              <User className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">وصول سريع</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
