import UnderDevelopmentPage from '@/components/UnderDevelopmentPage';
import { MapPin } from 'lucide-react';

export default function FieldMarketingTeamPage() {
  return (
    <UnderDevelopmentPage
      title="فريق التسويق الميداني"
      description="إدارة فريق التسويق الميداني"
      icon={MapPin}
      currentPath="/admin/teams/field-marketing"
      features={[
        'إدارة مهام التسويق الميداني',
        'تتبع الزيارات الميدانية',
        'إدارة المواقع والمناطق',
        'تقارير الأداء الميداني',
        'جدولة الزيارات',
        'إدارة الموارد الميدانية',
      ]}
    />
  );
}
