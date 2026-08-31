import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SystemNotificationSettingsCard } from '@/components/notification/SystemNotificationSettingsCard';

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <DashboardLayout pageTitle="الإعدادات" pageDescription="إدارة إعدادات النظام">
      <div className="container max-w-5xl space-y-5 py-5">
        <div>
          <h1 className="text-xl font-bold">إعدادات النظام</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة السياسات التشغيلية المحصورة بالمسؤولين.
          </p>
        </div>

        {isAdmin ? (
          <SystemNotificationSettingsCard />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            لا توجد صلاحية كافية لعرض إعدادات النظام.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
