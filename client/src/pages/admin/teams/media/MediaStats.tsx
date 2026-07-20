/**
 * Media Stats Component
 * مكون إحصائيات الإعلام
 */

import { Card, CardContent } from '@/components/ui/card';

interface MediaStatsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    review: number;
    completed: number;
    overdue: number;
  };
}

export default function MediaStats({ stats }: MediaStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-4 md:mb-6">
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
            {stats.total}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">إجمالي المهام</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-muted-foreground">
            {stats.pending}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">قيد الانتظار</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
            {stats.inProgress}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">قيد التنفيذ</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
            {stats.review}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">مراجعة</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">مكتمل</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
            {stats.overdue}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">متأخر</div>
        </CardContent>
      </Card>
    </div>
  );
}
