import UnderDevelopmentPage from '@/components/UnderDevelopmentPage';
import { Headphones } from 'lucide-react';

export default function CustomerServiceTeamPage() {
  return (
    <UnderDevelopmentPage
      title="فريق خدمة العملاء"
      description="إدارة فريق خدمة العملاء"
      icon={Headphones}
      currentPath="/admin/teams/customer-service"
      features={[
        'إدارة طلبات العملاء',
        'تتبع التذاكر والدعم',
        'إدارة قاعدة المعرفة',
        'تحليلات رضا العملاء',
        'إدارة الردود التلقائية',
        'تقارير الأداء',
      ]}
    />
  );
}
