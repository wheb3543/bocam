import DashboardLayout from '@/components/layout/DashboardLayout';
import UnderDevelopmentPage from '@/components/UnderDevelopmentPage';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <DashboardLayout pageTitle="التحليلات" pageDescription="تحليلات مفصلة عن أداء المنصة">
      <UnderDevelopmentPage
        title="التحليلات"
        description="تحليلات مفصلة عن أداء المنصة"
        icon={BarChart3}
        currentPath="/admin/reports/analytics"
        features={[
          'تحليلات الحجوزات والمواعيد',
          'تحليلات العملاء الجدد',
          'تحليلات معدلات التحويل',
          'تحليلات الإيرادات والأرباح',
          'رسوم بيانية تفاعلية',
          'تصدير التقارير بصيغة PDF و Excel',
        ]}
      />
    </DashboardLayout>
  );
}
