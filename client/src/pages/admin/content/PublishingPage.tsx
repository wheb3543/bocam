import DashboardLayout from "@/components/DashboardLayout";
import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { Send } from "lucide-react";

export default function PublishingPage() {
  return (
    <DashboardLayout pageTitle="النشر" pageDescription="إدارة نشر المحتوى">
      <UnderDevelopmentPage
        title="النشر"
        description="إدارة نشر المحتوى"
        icon={Send}
        currentPath="/admin/content/publishing"
        features={[
          "نشر المحتوى على المنصات الاجتماعية",
          "جدولة المنشورات",
          "إدارة الحملات التسويقية",
          "تتبع أداء المنشورات",
          "إدارة قوالب النشر",
          "تحليلات التفاعل",
        ]}
      />
    </DashboardLayout>
  );
}
