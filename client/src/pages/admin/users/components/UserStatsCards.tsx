/**
 * UserStatsCards - بطاقات إحصائيات المستخدمين
 * يعرض إحصائيات المستخدمين في بطاقات متعددة
 */

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Shield } from 'lucide-react';

interface UserStatsCardsProps {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
}

const UserStatsCards = memo(function UserStatsCards({
  totalUsers,
  activeUsers,
  adminUsers,
}: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            إجمالي المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
            جميع المستخدمين المسجلين
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            المستخدمون النشطون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
            مستخدمون نشطون حالياً
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            المسؤولون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{adminUsers}</div>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
            مستخدمون بصلاحيات كاملة
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

export default UserStatsCards;
