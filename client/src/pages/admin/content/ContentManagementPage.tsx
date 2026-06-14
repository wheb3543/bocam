import DashboardLayout from "@/components/DashboardLayout";
import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { FileText } from "lucide-react";

export default function ContentManagementPage() {
  return (
    <DashboardLayout pageTitle="المحتوى" pageDescription="إدارة محتوى المنصة">
      <UnderDevelopmentPage
        title="المحتوى"
        description="إدارة محتوى المنصة"
        icon={FileText}
        currentPath="/admin/content/content"
        features={[
          "إدارة العروض والخصومات",
          "إدارة المخيمات والفعاليات",
          "إدارة ملفات الأطباء",
          "إدارة الصور والوسائط",
          "جدولة النشر",
          "مراجعة المواد قبل النشر",
        ]}
      />
    </DashboardLayout>
  );
}
