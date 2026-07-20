/**
 * BIPage - صفحة ذكاء الأعمال
 * تم إعادة هيكللتها لتقليل التعقيد وتحسين قابلية الصيانة
 */

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import type { DateRange } from './bi/types/bi.types';
import { getDateRange, formatDailyChartData } from './bi/utils/biHelpers';
import MetricCard from './bi/components/MetricCard';
import ConversionFunnelChart from './bi/components/ConversionFunnelChart';
import AbandonedFormsTable from './bi/components/AbandonedFormsTable';
import SourcesTab from './bi/components/SourcesTab';
import CampaignsTab from './bi/components/CampaignsTab';
import DailyStatsTab from './bi/components/DailyStatsTab';
import { useBI } from './bi/hooks/useBI';
import { COLORS } from './bi/types/bi.types';

// Main BI Page
export default function BIPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { start, end } = useMemo(() => getDateRange(dateRange), [dateRange]);

  // Calculate previous period for comparison
  const { start: prevStart, end: prevEnd } = useMemo(() => {
    const currentEnd = new Date(end);
    const currentStart = new Date(start);
    const duration = currentEnd.getTime() - currentStart.getTime();

    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    return {
      start: previousStart.toISOString(),
      end: previousEnd.toISOString(),
    };
  }, [start, end]);

  const {
    funnelData,
    sourceData,
    campaignData,
    dailyStats,
    trends,
    funnelLoading,
    sourceLoading,
    campaignLoading,
    dailyStatsLoading,
    handleRefresh,
  } = useBI({
    autoRefresh,
    start,
    end,
    prevStart,
    prevEnd,
  });

  const dailyChartData = useMemo(() => {
    if (!dailyStats) {
      return [];
    }
    return formatDailyChartData(dailyStats);
  }, [dailyStats]);

  const handleExport = () => {
    const data = {
      dateRange: { start, end },
      funnel: funnelData,
      sources: sourceData,
      campaigns: campaignData,
      trends,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bi-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تصدير البيانات بنجاح');
  };

  const handleExportCSV = () => {
    if (!sourceData || !campaignData) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    // Sources CSV
    const sourcesCSV = [
      ['المصدر', 'الزيارات', 'التحويلات', 'معدل التحويل'],
      ...sourceData.map((s) => [s.source, s.total, s.conversions, s.rate + '%']),
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Campaigns CSV
    const campaignsCSV = [
      ['الحملة', 'المصدر', 'الزيارات', 'التحويلات', 'معدل التحويل'],
      ...campaignData.map((c) => [
        c.campaign,
        c.source,
        c.sessions,
        c.conversions,
        c.conversionRate + '%',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const combinedCSV = `=== المصادر ===\n${sourcesCSV}\n\n=== الحملات ===\n${campaignsCSV}`;

    const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bi-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تصدير البيانات CSV بنجاح');
  };

  const totalSessions = funnelData?.totalSessions ?? 0;
  const converted = funnelData?.converted ?? 0;
  const abandoned = funnelData?.abandoned ?? 0;
  const conversionRate = totalSessions > 0 ? Math.round((converted / totalSessions) * 100) : 0;
  const abandonedRate = totalSessions > 0 ? Math.round((abandoned / totalSessions) * 100) : 0;

  return (
    <DashboardLayout
      pageTitle="ذكاء الأعمال (BI)"
      pageDescription="تحليلات شاملة لمصادر الزيارات والتحويلات والفرص الضائعة"
    >
      <div className="p-6 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              ذكاء الأعمال (Business Intelligence)
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              تحليل مصادر الزيارات، قمع التحويل، وقائمة الفرص الضائعة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'إيقاف التحديث' : 'تحديث تلقائي'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">آخر 7 أيام</SelectItem>
                <SelectItem value="30d">آخر 30 يوم</SelectItem>
                <SelectItem value="90d">آخر 90 يوم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="إجمالي الزوار"
            value={totalSessions.toLocaleString()}
            subtitle="جلسات مسجّلة"
            icon={<Users className="h-5 w-5" />}
            color="primary"
            trend={trends?.totalSessions}
          />
          <MetricCard
            title="حجوزات مكتملة"
            value={converted.toLocaleString()}
            subtitle={`معدل التحويل: ${conversionRate}%`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="success"
            trend={trends?.converted}
          />
          <MetricCard
            title="فرص ضائعة"
            value={abandoned.toLocaleString()}
            subtitle={`${abandonedRate}% من الزوار`}
            icon={<AlertCircle className="h-5 w-5" />}
            color="danger"
            trend={trends?.abandoned}
          />
          <MetricCard
            title="معدل التحويل"
            value={`${conversionRate}%`}
            subtitle="من الزيارة إلى الحجز"
            icon={<Target className="h-5 w-5" />}
            color="purple"
            trend={trends?.conversionRate}
          />
        </div>

        {/* Smart Alerts */}
        {trends && (
          <div className="space-y-2">
            {trends.conversionRate < -10 && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <span className="font-medium">تنبيه:</span> معدل التحويل انخفض بنسبة{' '}
                      {Math.abs(trends.conversionRate).toFixed(1)}% مقارنة بالفترة السابقة
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {trends.abandoned > 20 && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      <span className="font-medium">تنبيه:</span> الفرص الضائعة زادت بنسبة{' '}
                      {trends.abandoned.toFixed(1)}% مقارنة بالفترة السابقة
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {trends.converted > 10 && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <span className="font-medium">ممتاز:</span> الحجوزات المكتملة زادت بنسبة{' '}
                      {trends.converted.toFixed(1)}% مقارنة بالفترة السابقة
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="funnel" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="funnel">قمع التحويل</TabsTrigger>
            <TabsTrigger value="sources">المصادر</TabsTrigger>
            <TabsTrigger value="campaigns">الحملات</TabsTrigger>
            <TabsTrigger value="daily">الإحصائيات اليومية</TabsTrigger>
            <TabsTrigger value="abandoned">الفرص الضائعة</TabsTrigger>
          </TabsList>

          {/* Conversion Funnel Tab */}
          <TabsContent value="funnel">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  {funnelLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : funnelData ? (
                    <ConversionFunnelChart data={funnelData} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  {[
                    {
                      label: 'معدل فتح النماذج',
                      value:
                        totalSessions > 0
                          ? Math.round(((funnelData?.formOpens ?? 0) / totalSessions) * 100)
                          : 0,
                      color: COLORS.primary,
                    },
                    {
                      label: 'معدل البدء في الملء',
                      value:
                        totalSessions > 0
                          ? Math.round(((funnelData?.formStarts ?? 0) / totalSessions) * 100)
                          : 0,
                      color: COLORS.info,
                    },
                    { label: 'معدل الإكمال', value: conversionRate, color: COLORS.success },
                    { label: 'معدل الهجر', value: abandonedRate, color: COLORS.danger },
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{metric.label}</span>
                        <span className="font-bold">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">نماذج مفتوحة</span>
                      <span className="font-medium">
                        {(funnelData?.formOpens ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">نماذج بدأت</span>
                      <span className="font-medium">
                        {(funnelData?.formStarts ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">نماذج مهجورة</span>
                      <span className="font-medium text-red-500">{abandoned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">حجوزات مكتملة</span>
                      <span className="font-medium text-green-600">
                        {converted.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources">
            <SourcesTab sourceData={sourceData} isLoading={sourceLoading} />
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <CampaignsTab campaignData={campaignData} isLoading={campaignLoading} />
          </TabsContent>

          {/* Daily Stats Tab */}
          <TabsContent value="daily">
            <DailyStatsTab dailyChartData={dailyChartData} isLoading={dailyStatsLoading} />
          </TabsContent>

          {/* Abandoned Forms Tab */}
          <TabsContent value="abandoned">
            <Card>
              <CardContent className="pt-6">
                <AbandonedFormsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p className="font-medium">كيف يعمل نظام التتبع؟</p>
                <p>
                  يتم تسجيل الزيارات والأحداث تلقائياً بناءً على موافقة المستخدم على ملفات تعريف
                  الارتباط (Cookie Consent). البيانات تشمل مصدر الزيارة (UTM، Facebook Click ID،
                  Google Click ID) ومسار التنقل داخل الموقع.
                </p>
                <p>
                  النماذج المهجورة تُسجَّل عند إدخال رقم الهاتف ثم مغادرة الصفحة دون إكمال الحجز.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
