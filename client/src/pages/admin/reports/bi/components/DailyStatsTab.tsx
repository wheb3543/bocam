/**
 * DailyStatsTab - تبويب الإحصائيات اليومية
 * يعرض الإحصائيات اليومية للزيارات والتحويلات
 */

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { COLORS } from '../types/bi.types';

interface DailyStatsTabProps {
  dailyChartData: Array<{ date: string; sessions: number; conversions: number; conversionRate: number }>;
  isLoading: boolean;
}

const DailyStatsTab = memo(function DailyStatsTab({ dailyChartData, isLoading }: DailyStatsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          الإحصائيات اليومية
        </CardTitle>
        <CardDescription>
          تتبع الزيارات والتحويلات يومياً خلال الفترة المحددة
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : dailyChartData && dailyChartData.length > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke={COLORS.primary}
                  name="الزيارات"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke={COLORS.success}
                  name="التحويلات"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right p-3 font-medium">التاريخ</th>
                    <th className="text-right p-3 font-medium">الزيارات</th>
                    <th className="text-right p-3 font-medium">التحويلات</th>
                    <th className="text-right p-3 font-medium">معدل التحويل</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyChartData.map((stat, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium">{stat.date}</td>
                      <td className="p-3">{stat.sessions.toLocaleString()}</td>
                      <td className="p-3 text-green-600 font-medium">
                        {stat.conversions.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge
                          className={
                            stat.conversionRate >= 10
                              ? 'bg-green-100 text-green-700'
                              : stat.conversionRate >= 5
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }
                        >
                          {stat.conversionRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">لا توجد بيانات يومية بعد</p>
            <p className="text-xs text-muted-foreground">
              ستظهر البيانات عند وجود زيارات وتحويلات
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default DailyStatsTab;
