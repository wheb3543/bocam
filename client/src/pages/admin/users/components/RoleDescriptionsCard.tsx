/**
 * RoleDescriptionsCard - بطاقة وصف الأدوار
 * يعرض وصف الأدوار والصلاحيات
 */

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { roleColors, roleLabels } from '../types/user.types';

const RoleDescriptionsCard = memo(function RoleDescriptionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>وصف الأدوار والصلاحيات</CardTitle>
        <CardDescription>تفاصيل الصلاحيات لكل دور في النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <Badge className={roleColors.admin + ' mb-2 border'}>{roleLabels.admin}</Badge>
            <p className="text-sm text-muted-foreground">
              صلاحيات كاملة لإدارة النظام، المستخدمين، والإعدادات
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className={roleColors.manager + ' mb-2 border'}>{roleLabels.manager}</Badge>
            <p className="text-sm text-muted-foreground">
              إدارة المحتوى والحجوزات والتقارير
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className={roleColors.staff + ' mb-2 border'}>{roleLabels.staff}</Badge>
            <p className="text-sm text-muted-foreground">معالجة الحجوزات وتحديث البيانات</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className={roleColors.viewer + ' mb-2 border'}>{roleLabels.viewer}</Badge>
            <p className="text-sm text-muted-foreground">
              عرض البيانات والتقارير فقط دون تعديل
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className={roleColors.user + ' mb-2 border'}>{roleLabels.user}</Badge>
            <p className="text-sm text-muted-foreground">صلاحيات محدودة للوصول الأساسي</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default RoleDescriptionsCard;
