/**
 * MetricCard - بطاقة المقياس
 * يعرض مقياساً واحداً مع الاتجاه والأيقونة
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { MetricCardProps } from '../types/bi.types';
import { COLORS } from '../types/bi.types';

const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend !== undefined && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}
              >
                {trend > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : trend < 0 ? (
                  <ArrowDownRight className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {Math.abs(trend)}% مقارنة بالفترة السابقة
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${COLORS[color]}15` }}>
            <div style={{ color: COLORS[color] }}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default MetricCard;
