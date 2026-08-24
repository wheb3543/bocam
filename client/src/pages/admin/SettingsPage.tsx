import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { SystemNotificationSettingsCard } from '@/components/notification/SystemNotificationSettingsCard';

export default function SettingsPage() {
  const { user, loading } = useAuth();

  return (
    <DashboardLayout pageTitle="الإعدادات" pageDescription="إدارة إعدادات النظام">
      <div className="container max-w-5xl space-y-5 py-5">
        <div>
          <h1 className="text-xl font-bold">إعدادات النظام</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة السياسات التشغيلية المحصورة بالمسؤولين.
          </p>
        </div>
        {!loading && user?.role === 'admin' ? (
          <SystemNotificationSettingsCard />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-50 p-2.5 text-red-700">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>وصول مقيّد</CardTitle>
                  <CardDescription>
                    إعدادات الإشعارات النظامية متاحة لمسؤولي النظام فقط.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              يمكنك إدارة تنبيهاتك الشخصية من صفحة الملف الشخصي.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
