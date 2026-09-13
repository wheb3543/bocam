/**
 * WhatsApp Analytics Dashboard
 * لوحة تحكم تحليلات WhatsApp
 */

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/api/trpc';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FeatureGate from '@/components/FeatureGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  MessageCircle,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Megaphone,
} from 'lucide-react';
import {
  useWhatsAppSSE,
  ConversationCostUpdateEvent,
  TemplateEvent,
} from '@/hooks/integrations/useWhatsAppSSE';
import { toast } from 'sonner';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { PermissionHint } from '@/components/PermissionHint';

export default function WhatsAppAnalytics() {
  return (
    <DashboardLayout
      pageTitle="تحليلات واتساب"
      pageDescription="مراقبة الإحصائيات والتكاليف والأداء"
    >
      <WhatsAppAnalyticsContent />
    </DashboardLayout>
  );
}

export function WhatsAppAnalyticsContent() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const { can, isLoading: arePermissionsLoading } = useRolePermissions();
  const canViewAnalytics = can('reports.view');
  const canExportAnalytics = can('reports.export');
  const canViewCommunication = can('communications.view');
  const canViewAutoReply = can('communications.automation.view');

  // Queries
  const analyticsQueryOptions = { enabled: !arePermissionsLoading && canViewAnalytics };
  const broadcastStatsQuery = trpc.whatsapp.getBroadcastStats.useQuery(
    undefined,
    analyticsQueryOptions
  );
  const autoReplyRulesQuery = trpc.whatsapp.autoReply.getAutoReplyRules.useQuery(undefined, {
    enabled: !arePermissionsLoading && canViewAnalytics && canViewCommunication && canViewAutoReply,
  });
  const messageStatsQuery = trpc.whatsapp.getMessageStats.useQuery(
    undefined,
    analyticsQueryOptions
  );
  const analyticsRange = {
    startDate:
      dateRange === '7d'
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : dateRange === '30d'
          ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  };
  const conversationCostsQuery = trpc.whatsapp.getConversationCosts.useQuery(
    analyticsRange,
    analyticsQueryOptions
  );
  const templatePerformanceQuery = trpc.whatsapp.getTemplatePerformance.useQuery(
    analyticsRange,
    analyticsQueryOptions
  );

  // SSE: تحديث فوري عند وصول أحداث التكلفة والقوالب الجديدة
  useWhatsAppSSE({
    enabled: !arePermissionsLoading && canViewAnalytics,
    onConversationCostUpdate: useCallback(
      (event: ConversationCostUpdateEvent) => {
        toast.info(`تحديث تكلفة المحادثة: ${event.phoneNumber}`);
        conversationCostsQuery.refetch();
      },
      [conversationCostsQuery]
    ),
    onTemplateEvent: useCallback(
      (event: TemplateEvent) => {
        toast.info(`حدث قالب: ${event.eventType}`);
        templatePerformanceQuery.refetch();
      },
      [templatePerformanceQuery]
    ),
  });

  // Use real data from API, fallback to empty arrays if loading/error
  const messageStats = messageStatsQuery.data?.dailyStats || [];
  const messageTypes = messageStatsQuery.data?.typeStats || [];
  const conversationCosts = conversationCostsQuery.data || [];
  const templatePerformance = templatePerformanceQuery.data || [];
  const periodLabel = { '7d': '7 أيام', '30d': '30 يوماً', '90d': '90 يوماً' }[dateRange];
  const totalSent = messageStats.reduce(
    (sum: number, item: Record<string, unknown>) => sum + Number(item.sent || 0),
    0
  );
  const totalDelivered = messageStats.reduce(
    (sum: number, item: Record<string, unknown>) => sum + Number(item.delivered || 0),
    0
  );
  const totalFailed = messageStats.reduce(
    (sum: number, item: Record<string, unknown>) => sum + Number(item.failed || 0),
    0
  );
  const totalCost = conversationCosts.reduce(
    (sum: number, item: Record<string, unknown>) =>
      sum + Number(item.conversationCost ?? item.totalCost ?? 0),
    0
  );

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const handleExport = () => {
    if (!canExportAnalytics) {
      toast.error('لا تملك صلاحية تصدير التقارير');
      return;
    }
    const data = {
      broadcastStats: broadcastStatsQuery.data?.stats,
      autoReplyRules: autoReplyRulesQuery.data?.rules,
      messageStats: messageStatsQuery.data,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    broadcastStatsQuery.refetch();
    if (canViewCommunication) {
      autoReplyRulesQuery.refetch();
    }
    messageStatsQuery.refetch();
  };

  if (arePermissionsLoading) {
    return (
      <FeatureGate feature="whatsapp">
        <div className="p-6 text-center text-sm text-muted-foreground">
          جارٍ التحقق من الصلاحيات…
        </div>
      </FeatureGate>
    );
  }

  if (!canViewAnalytics) {
    return (
      <FeatureGate feature="whatsapp">
        <Card className="m-6">
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">تحليلات WhatsApp غير متاحة لهذا الدور</p>
            <PermissionHint
              label="عرض التحليلات مقيّد"
              message="تحتاج إلى صلاحية عرض التقارير للاطلاع على تحليلات WhatsApp."
            />
          </CardContent>
        </Card>
      </FeatureGate>
    );
  }

  return (
    <FeatureGate feature="whatsapp">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">تحليلات WhatsApp</h1>
            <p className="text-muted-foreground text-sm">مراقبة الإحصائيات والأداء</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={dateRange}
              onValueChange={(value: '7d' | '30d' | '90d') => setDateRange(value)}
            >
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">آخر 7 أيام</SelectItem>
                <SelectItem value="30d">آخر 30 يوم</SelectItem>
                <SelectItem value="90d">آخر 90 يوم</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={messageStatsQuery.isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${messageStatsQuery.isLoading ? 'animate-spin' : ''}`}
              />
            </Button>
            {canExportAnalytics ? (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            ) : (
              <PermissionHint
                label="التصدير مقيّد"
                message="تحتاج إلى صلاحية تصدير التقارير لتنزيل تحليلات WhatsApp."
              />
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className="sgh-compact-stat-grid grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="ملخص تحليلات واتساب"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                إجمالي البث
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {broadcastStatsQuery.data?.stats?.totalBroadcasts || 0}
              </div>
              <p className="text-xs text-muted-foreground">حملات بث</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                الرسائل المرسلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {broadcastStatsQuery.data?.stats?.totalMessagesSent || 0}
              </div>
              <p className="text-xs text-muted-foreground">رسالة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                معدل النجاح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {broadcastStatsQuery.data?.stats?.totalMessagesSent
                  ? Math.round(
                      ((broadcastStatsQuery.data.stats.totalMessagesSent -
                        broadcastStatsQuery.data.stats.totalMessagesFailed) /
                        broadcastStatsQuery.data.stats.totalMessagesSent) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">نسبة النجاح</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                قواعد الرد التلقائي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {autoReplyRulesQuery.data?.rules?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">قاعدة نشطة</p>
            </CardContent>
          </Card>
        </div>

        {/* مؤشرات الرسائل الموثقة للفترة المختارة */}
        <div
          className="sgh-compact-stat-grid grid grid-cols-2 sm:grid-cols-3"
          aria-label="مؤشرات رسائل واتساب للفترة"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                الرسائل المرسلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSent}</div>
              <p className="text-xs text-muted-foreground">خلال آخر {periodLabel}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                الرسائل المسلّمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDelivered}</div>
              <p className="text-xs text-muted-foreground">من بيانات حالة الرسائل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                الرسائل الفاشلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFailed}</div>
              <p className="text-xs text-muted-foreground">رسالة</p>
            </CardContent>
          </Card>
        </div>

        {/* مؤشرات التكلفة والقوالب الموثقة */}
        <div
          className="sgh-compact-stat-grid grid grid-cols-2 sm:grid-cols-3"
          aria-label="مؤشرات تكلفة وقوالب واتساب"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                إجمالي التكلفة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">تكلفة المحادثات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
                سجلات التكلفة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversationCosts.length}</div>
              <p className="text-xs text-muted-foreground">محادثة مسجّلة للفترة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-purple-500" />
                القوالب ذات الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templatePerformance.length}</div>
              <p className="text-xs text-muted-foreground">قالب له سجل أداء</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                الرسائل المرسلة (آخر {periodLabel})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {messageStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={messageStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="مرسلة" />
                    <Line type="monotone" dataKey="delivered" stroke="#10b981" name="مسلمة" />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" name="فشلت" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 text-center text-sm text-muted-foreground">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                  لا توجد رسائل موثقة ضمن الفترة المختارة
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                أنواع الرسائل
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {messageTypes.some((item: Record<string, unknown>) => Number(item.value || 0) > 0) ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={messageTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {messageTypes.map((_entry: Record<string, unknown>, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 text-center text-sm text-muted-foreground">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                  لا توجد أنواع رسائل موثقة ضمن الفترة
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Cost Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                اتجاه التكاليف
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {conversationCosts.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={conversationCosts.map((c: Record<string, unknown>) => ({
                      date: new Date(c.createdAt as string).toLocaleDateString('ar-SA'),
                      cost: (c.conversationCost as number) || (c.totalCost as number) || 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cost" stroke="#10b981" name="التكلفة ($)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 text-center text-sm text-muted-foreground">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                  لا توجد تكلفة موثقة ضمن الفترة المختارة
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              أداء القوالب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">اسم القالب</th>
                    <th className="text-right p-2">مرسلة</th>
                    <th className="text-right p-2">مسلمة</th>
                    <th className="text-right p-2">مقروءة</th>
                    <th className="text-right p-2">فشلت</th>
                    <th className="text-right p-2">معدل النجاح</th>
                  </tr>
                </thead>
                <tbody>
                  {templatePerformance.length > 0 ? (
                    templatePerformance.map((t: Record<string, unknown>) => (
                      <tr key={t.templateId as string} className="border-b">
                        <td className="p-2">{t.templateName as string}</td>
                        <td className="p-2">{(t.sentCount as number) || 0}</td>
                        <td className="p-2">{(t.deliveredCount as number) || 0}</td>
                        <td className="p-2">{(t.readCount as number) || 0}</td>
                        <td className="p-2">{(t.failedCount as number) || 0}</td>
                        <td className="p-2">
                          {(t.sentCount as number) > 0
                            ? (
                                ((t.deliveredCount as number) / (t.sentCount as number)) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        لا توجد بيانات أداء القوالب
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
}
