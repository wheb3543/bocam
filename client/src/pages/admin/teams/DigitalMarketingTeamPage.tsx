import DashboardLayout from '@/components/layout/DashboardLayout';
import UnderDevelopmentPage from '@/components/UnderDevelopmentPage';
import { Users } from 'lucide-react';

export default function DigitalMarketingTeamPage() {
  return (
    <DashboardLayout pageTitle="فريق التسويق الرقمي" pageDescription="إدارة فريق التسويق الرقمي">
      <UnderDevelopmentPage
        title="فريق التسويق الرقمي"
        description="إدارة فريق التسويق الرقمي"
        icon={Users}
        currentPath="/admin/teams/digital-marketing"
        features={[
          'إدارة مهام التسويق الرقمي',
          'تتبع الحملات الإعلانية',
          'إدارة حسابات التواصل الاجتماعي',
          'تحليلات الأداء',
          'جدولة المحتوى',
          'إدارة الميزانيات',
        ]}
      />
    </DashboardLayout>
  );
}
