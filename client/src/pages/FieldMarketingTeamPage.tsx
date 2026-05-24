import DashboardLayout from "@/components/DashboardLayout";
import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { MapPin } from "lucide-react";

export default function FieldMarketingTeamPage() {
  return (
    <DashboardLayout pageTitle="فريق التسويق الميداني" pageDescription="إدارة فريق التسويق الميداني">
      <UnderDevelopmentPage
        title="فريق التسويق الميداني"
        description="إدارة فريق التسويق الميداني"
        icon={MapPin}
        currentPath="/dashboard/teams/field-marketing"
        features={[
          "إدارة مهام التسويق الميداني",
          "تتبع الزيارات الميدانية",
          "إدارة المواقع والمناطق",
          "تقارير الأداء الميداني",
          "جدولة الزيارات",
          "إدارة الموارد الميدانية",
        ]}
      />
    </DashboardLayout>
  );
}
