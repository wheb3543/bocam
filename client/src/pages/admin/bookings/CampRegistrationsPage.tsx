import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CampRegistrationsManagement from '@/components/camp/CampRegistrationsManagement';
import { DateRangePicker } from '@/components/form/DateRangePicker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { trpc } from '@/lib/api/trpc';
import { Users, CheckCircle2, Clock, XCircle, PieChart as PieChartIcon } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

function inDateRange(createdAt: unknown, from: Date, to: Date): boolean {
  if (!createdAt) {
    return false;
  }
  const t = new Date(createdAt as string | Date).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

export default function CampRegistrationsPage() {
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { from, to };
  });

  const { data: registrations } = trpc.campRegistrations.list.useQuery();

  const rangeRegistrations = useMemo(() => {
    if (!registrations) {
      return [];
    }
    return registrations.filter((r) => inDateRange(r.createdAt, dateRange.from, dateRange.to));
  }, [registrations, dateRange.from, dateRange.to]);

  // Calculate statistics (aligned with backend stats.confirmed = confirmed + attended + completed)
  const stats = useMemo(() => {
    const list = rangeRegistrations;
    return {
      total: list.length,
      pending: list.filter((r) => r.status === 'pending').length,
      confirmed: list.filter(
        (r) => r.status === 'confirmed' || r.status === 'attended' || r.status === 'completed'
      ).length,
      attended: list.filter((r) => r.status === 'attended' || r.status === 'completed').length,
      cancelled: list.filter((r) => r.status === 'cancelled').length,
    };
  }, [rangeRegistrations]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    if (!rangeRegistrations.length) {
      return [];
    }

    const statusCounts = {
      pending: rangeRegistrations.filter((r) => r.status === 'pending').length,
      contacted: rangeRegistrations.filter((r) => r.status === 'contacted').length,
      no_answer: rangeRegistrations.filter((r) => r.status === 'no_answer').length,
      confirmed: rangeRegistrations.filter((r) => r.status === 'confirmed').length,
      attended: rangeRegistrations.filter((r) => r.status === 'attended').length,
      completed: rangeRegistrations.filter((r) => r.status === 'completed').length,
      cancelled: rangeRegistrations.filter((r) => r.status === 'cancelled').length,
    };

    return [
      { name: 'قيد الانتظار', value: statusCounts.pending, color: '#F59E0B' },
      { name: 'تم التواصل', value: statusCounts.contacted, color: '#8B5CF6' },
      { name: 'لا رد', value: statusCounts.no_answer, color: '#6B7280' },
      { name: 'مؤكد', value: statusCounts.confirmed, color: '#10B981' },
      { name: 'حضر', value: statusCounts.attended, color: '#3B82F6' },
      { name: 'مكتمل', value: statusCounts.completed, color: '#EC4899' },
      { name: 'ملغي', value: statusCounts.cancelled, color: '#EF4444' },
    ].filter((item) => item.value > 0);
  }, [rangeRegistrations]);

  // Daily registrations within selected range (cap display buckets)
  const dailyRegistrations = useMemo(() => {
    if (!rangeRegistrations.length) {
      return [];
    }

    const dateMap = new Map<string, number>();
    rangeRegistrations.forEach((r) => {
      if (r.createdAt) {
        const date = new Date(r.createdAt).toLocaleDateString('ar-SA', {
          month: 'short',
          day: 'numeric',
        });
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [rangeRegistrations]);

  return (
    <DashboardLayout
      pageTitle="تسجيلات المخيمات"
      pageDescription="إدارة ومتابعة تسجيلات المخيمات الطبية"
    >
      <div
        className="flex h-[calc(100dvh-4.25rem)] min-h-0 flex-col gap-3 overflow-hidden"
        dir="rtl"
      >
        <div className="shrink-0">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        {/* Stats Cards — scoped to النطاق الزمني */}
        <div className="grid shrink-0 grid-cols-2 gap-2 md:grid-cols-4">
          <Card className="rounded-lg">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="w-4 h-4" />
                إجمالي التسجيلات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <div className="text-lg font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="w-4 h-4" />
                قيد الانتظار
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="w-4 h-4" />
                مؤكد وفقاً للمسار
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <div className="text-lg font-bold text-green-600">{stats.confirmed}</div>
              <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
                مؤكد + حضر + مكتمل
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <XCircle className="w-4 h-4" />
                ملغي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <div className="text-lg font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Charts */}
        <div className="grid shrink-0 grid-cols-1 gap-2 md:grid-cols-2">
          {statusData.length > 0 && (
            <Card className="rounded-lg">
              <CardHeader className="p-2 pb-0">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <PieChartIcon className="w-5 h-5" />
                  توزيع الحالات
                </CardTitle>
                <CardDescription className="text-[11px]">حسب النطاق الزمني المحدد</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {dailyRegistrations.length > 0 && (
            <Card className="rounded-lg">
              <CardHeader className="p-2 pb-0">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-5 h-5" />
                  التسجيلات اليومية
                </CardTitle>
                <CardDescription className="text-[11px]">
                  ضمن النطاق الزمني (حتى 30 نقطة)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={dailyRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280' }} />
                    <YAxis tick={{ fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#3B82F6"
                      name="عدد التسجيلات"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="min-h-0 flex-1">
          <CampRegistrationsManagement
            // eslint-disable-next-line @typescript-eslint/no-empty-function -- Intentional no-op
            onPendingCountChange={() => {}}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
