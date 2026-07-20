/**
 * TaskStatsCards - بطاقات إحصائيات المهام
 * يعرض إحصائيات المهام في بطاقات متعددة
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Circle, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnimatedCounter } from '@/components/animations';
import type { TaskStats } from '../types/task.types';

interface TaskStatsCardsProps {
  stats: TaskStats | undefined;
}

const TaskStatsCards = memo(function TaskStatsCards({ stats }: TaskStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">الإجمالي</p>
              <p className="text-lg sm:text-xl font-bold">
                <AnimatedCounter value={stats?.total || 0} duration={800} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-muted rounded-lg">
              <Circle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">قيد الانتظار</p>
              <p className="text-lg sm:text-xl font-bold">
                <AnimatedCounter value={stats?.todo || 0} duration={700} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">قيد التنفيذ</p>
              <p className="text-lg sm:text-xl font-bold">
                <AnimatedCounter value={stats?.inProgress || 0} duration={700} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">مراجعة</p>
              <p className="text-lg sm:text-xl font-bold">
                <AnimatedCounter value={stats?.review || 0} duration={700} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">مكتمل</p>
              <p className="text-lg sm:text-xl font-bold">
                <AnimatedCounter value={stats?.completed || 0} duration={700} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">متأخر</p>
              <p className="text-lg sm:text-xl font-bold">
                <AnimatedCounter value={stats?.overdue || 0} duration={700} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default TaskStatsCards;
