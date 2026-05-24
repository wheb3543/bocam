import DashboardLayout from "@/components/DashboardLayout";
import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout pageTitle="الإعدادات" pageDescription="إدارة إعدادات النظام">
      <UnderDevelopmentPage
        title="الإعدادات"
        description="إدارة إعدادات النظام"
        icon={Settings}
        currentPath="/dashboard/settings"
        features={[
          "إدارة الملف الشخصي",
          "إعدادات النظام العامة",
          "إدارة التكاملات",
          "إعدادات الإشعارات",
          "إدارة الصلاحيات",
          "إعدادات الأمان",
        ]}
      />
    </DashboardLayout>
  );
}
