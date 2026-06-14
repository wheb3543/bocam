import DashboardLayout from "@/components/layout/DashboardLayout";
import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <DashboardLayout pageTitle="الرسائل" pageDescription="إدارة رسائل المنصة">
      <UnderDevelopmentPage
        title="الرسائل"
        description="إدارة رسائل المنصة"
        icon={MessageSquare}
        currentPath="/admin/communications/messages"
        features={[
          "إرسال رسائل جماعية",
          "قوالب الرسائل المخصصة",
          "تتبع حالة الرسائل",
          "إدارة قوائم المستلمين",
          "جدولة الرسائل",
          "إحصائيات الرسائل",
        ]}
      />
    </DashboardLayout>
  );
}
