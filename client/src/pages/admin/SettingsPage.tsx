import DashboardLayout from '@/components/layout/DashboardLayout';
import { SystemNotificationSettingsCard } from '@/components/notification/SystemNotificationSettingsCard';

export default function SettingsPage() {
  return (
    <DashboardLayout pageTitle="الإعدادات" pageDescription="إدارة إعدادات النظام">
      <div className="container max-w-5xl space-y-5 py-5">
        <div>
          <h1 className="text-xl font-bold">إعدادات النظام</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة السياسات التشغيلية المحصورة بالمسؤولين.
          </p>
        </div>
        <SystemNotificationSettingsCard />
      </div>
    </DashboardLayout>
  );
}
