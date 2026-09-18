import { useState, useCallback } from 'react';
import { trpc } from '@/lib/api/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BellRing,
  Zap,
  Clock,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useWhatsAppSSE,
  AccountReviewUpdateEvent,
  AccountUpdateEvent,
  BusinessProfileUpdateEvent,
  BusinessAccountUpdateEvent,
} from '@/hooks/integrations/useWhatsAppSSE';
import { Link } from 'wouter';
import { useWhatsAppOperationsSSE } from '@/contexts/WhatsAppOperationsSSEContext';
import { WhatsAppOperationalCostSummary } from '@/components/WhatsAppOperationalCostSummary';
import { useWhatsAppOperationalCostSummary } from '@/hooks/useWhatsAppOperationalCostSummary';
import { toWhatsAppSeverityInput } from '@/lib/whatsappOperationsFilters';
import { getWhatsAppOperationDetails } from '@/lib/whatsappOperationsPayload';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';

export default function WhatsAppAccountHealthPage() {
  const operationsSse = useWhatsAppOperationsSSE();
  const { can } = useRolePermissions();
  const canViewSecurity = can('communications.security.view');
  const canManageSecurity = can('communications.security.manage');
  const canViewWebhookLogs = can('integrations.logs.view');
  void canViewWebhookLogs;

  const [activeTab, setActiveTab] = useState('alerts');
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const severityInput = toWhatsAppSeverityInput(severityFilter);

  // حالة التنبيهات المباشرة عبر SSE
  const [liveAlerts, setLiveAlerts] = useState<
    Array<{
      alertType: string;
      severity: string;
      details?: unknown;
      timestamp: string;
    }>
  >([]);
  const [hasNewCritical, setHasNewCritical] = useState(false);

  const {
    data: alerts,
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = trpc.whatsapp.accountHealth.getAlerts.useQuery(
    { ...severityInput, resolved: false, limit: 50 },
    { enabled: canViewSecurity, refetchInterval: 120000 }
  );

  const {
    data: securityEvents,
    isLoading: securityLoading,
    refetch: refetchSecurity,
  } = trpc.whatsapp.accountHealth.getSecurityEvents.useQuery(
    { ...severityInput, limit: 50 },
    { enabled: canViewSecurity, refetchInterval: 120000 }
  );

  const { data: alertStats, refetch: refetchAlertStats } =
    trpc.whatsapp.accountHealth.getAlertStats.useQuery(undefined, {
      enabled: canViewSecurity,
      refetchInterval: 120000,
    });

  const { data: customerServiceWindow, refetch: refetchCustomerServiceWindow } =
    trpc.whatsapp.accountHealth.getCustomerServiceWindow.useQuery(undefined, {
      enabled: canViewSecurity,
      refetchInterval: 120000,
    });

  const { summary: costSummary, isLoading: isCostSummaryLoading } =
    useWhatsAppOperationalCostSummary();

  // يبقى الاشتراك المحلي للمسار القديم فقط؛ المركز الموحد يوفر اشتراكاً واحداً.
  useWhatsAppSSE({
    enabled: !operationsSse && canViewSecurity,
    onAccountReviewUpdate: useCallback(
      (event: AccountReviewUpdateEvent) => {
        toast.info(`تحديث مراجعة الحساب: ${event.status}`);
        refetchAlerts();
        refetchAlertStats();
        refetchCustomerServiceWindow();
      },
      [refetchAlertStats, refetchAlerts, refetchCustomerServiceWindow]
    ),
    onAccountUpdate: useCallback(
      (event: AccountUpdateEvent) => {
        toast.info(`تحديث الحساب: ${event.eventType}`);
        refetchAlerts();
        refetchAlertStats();
        refetchCustomerServiceWindow();
      },
      [refetchAlertStats, refetchAlerts, refetchCustomerServiceWindow]
    ),
    onBusinessProfileUpdate: useCallback(
      (event: BusinessProfileUpdateEvent) => {
        toast.info(`تحديث الملف التجاري: ${event.eventType}`);
        refetchAlerts();
        refetchAlertStats();
        refetchCustomerServiceWindow();
      },
      [refetchAlertStats, refetchAlerts, refetchCustomerServiceWindow]
    ),
    onBusinessAccountUpdate: useCallback(
      (event: BusinessAccountUpdateEvent) => {
        toast.info(`تحديث حساب الأعمال: ${event.eventType}`);
        refetchAlerts();
        refetchAlertStats();
        refetchCustomerServiceWindow();
      },
      [refetchAlertStats, refetchAlerts, refetchCustomerServiceWindow]
    ),
  });

  const windowExpiredConversations = customerServiceWindow?.items || [];
  const highCostConversations = costSummary.highCostConversations;

  const resolveAlertMutation = trpc.whatsapp.accountHealth.resolveAlert.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث حالة التنبيه');
      refetchAlerts();
      refetchAlertStats();
    },
    onError: () => {
      toast.error('فشل تحديث حالة التنبيه');
    },
  });

  // توافق المسار القديم: التنبيهات تأتي من المركز داخل صفحة العمليات
  useWhatsAppSSE({
    enabled: !operationsSse && canViewSecurity,
    onAccountAlert: useCallback(
      (event: { alertType: string; severity: string; details?: unknown; timestamp: string }) => {
        setLiveAlerts((prev) => [
          {
            alertType: event.alertType,
            severity: event.severity,
            details: event.details,
            timestamp: event.timestamp,
          },
          ...prev.slice(0, 9),
        ]);

        if (event.severity === 'critical' || event.severity === 'high') {
          setHasNewCritical(true);
        }

        refetchAlerts();
        refetchSecurity();
        refetchAlertStats();
      },
      [refetchAlertStats, refetchAlerts, refetchSecurity]
    ),
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleResolveAlert = (alertId: number) => {
    resolveAlertMutation.mutate({ id: alertId });
  };

  const handleRefresh = () => {
    refetchAlerts();
    refetchSecurity();
    refetchCustomerServiceWindow();
    toast.success('تم تحديث البيانات');
  };

  return (
    <div className="container mx-auto py-6 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">صحة الحساب والأمان</h1>
          <p className="text-gray-600 mt-1">مراقبة تنبيهات الحساب وأحداث الأمان من Meta</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          {(operationsSse?.hasNewCritical ?? hasNewCritical) && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg animate-pulse">
              <BellRing className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">تنبيه حرج جديد!</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-600"
                onClick={() =>
                  operationsSse ? operationsSse.dismissCritical() : setHasNewCritical(false)
                }
              >
                ×
              </Button>
            </div>
          )}
          {(operationsSse?.liveAlerts ?? liveAlerts).length > 0 && (
            <Badge className="bg-green-500 text-white gap-1">
              <Zap className="h-3 w-3" />
              {(operationsSse?.liveAlerts ?? liveAlerts).length} مباشر
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div
        className="sgh-compact-stat-grid mb-5 grid grid-cols-2 sm:mb-6 lg:grid-cols-4"
        aria-label="ملخص صحة حساب واتساب"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تنبيهات حرجة</p>
                <p className="text-2xl font-bold text-red-600">{alertStats?.criticalOpen || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تنبيهات عالية</p>
                <p className="text-2xl font-bold text-orange-600">{alertStats?.highOpen || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">أحداث أمان</p>
                <p className="text-2xl font-bold text-blue-600">{alertStats?.securityTotal || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تم حلها</p>
                <p className="text-2xl font-bold text-green-600">
                  {alertStats?.resolvedTotal || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Alerts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نافذة 24 ساعة منتهية</p>
                <p className="text-2xl font-bold text-amber-600">
                  {customerServiceWindow?.count || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">محادثة خارج النافذة</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <WhatsAppOperationalCostSummary summary={costSummary} isLoading={isCostSummaryLoading} />
      </div>

      {/* Filters */}
      <div className="-mx-1 mb-4 overflow-x-auto pb-1">
        <div className="flex w-max min-w-max gap-2 px-1">
          <Button
            variant={severityFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeverityFilter(null)}
          >
            الكل
          </Button>
          <Button
            variant={severityFilter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeverityFilter('critical')}
            className="text-red-600"
          >
            حرجة ({alertStats?.criticalOpen || 0})
          </Button>
          <Button
            variant={severityFilter === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeverityFilter('high')}
            className="text-orange-600"
          >
            عالية ({alertStats?.highOpen || 0})
          </Button>
          <Button
            variant={severityFilter === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeverityFilter('medium')}
            className="text-yellow-600"
          >
            متوسطة ({alertStats?.mediumOpen || 0})
          </Button>
          <Button
            variant={severityFilter === 'low' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeverityFilter('low')}
            className="text-blue-600"
          >
            منخفضة ({alertStats?.lowOpen || 0})
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="alerts">التنبيهات المفتوحة</TabsTrigger>
          <TabsTrigger value="smart-alerts">تنبيهات ذكية</TabsTrigger>
          <TabsTrigger value="security">أحداث الأمان</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>التنبيهات</CardTitle>
              <CardDescription>تنبيهات تتطلب انتباهك أو إجراء منك</CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert: Record<string, unknown>) => (
                    <div key={alert.id as number} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(alert.severity as string)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{alert.alertType as string}</h4>
                              <Badge className={getSeverityColor(alert.severity as string)}>
                                {alert.severity as string}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {getWhatsAppOperationDetails(alert.details as string)}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(alert.createdAt as string | Date).toLocaleString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id as number)}
                            disabled={!canManageSecurity || resolveAlertMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            تحديد كمحلول
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>لا توجد تنبيهات حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart-alerts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  تنبيهات نافذة 24 ساعة
                </CardTitle>
                <CardDescription>محادثات خارج نافذة الـ 24 ساعة تحتاج إلى قالب</CardDescription>
              </CardHeader>
              <CardContent>
                {windowExpiredConversations.length > 0 ? (
                  <div className="space-y-3">
                    {windowExpiredConversations.map((conv: Record<string, unknown>) => (
                      <div
                        key={conv.id as number}
                        className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">
                              {(conv.customerName as string) || 'عميل جديد'}
                            </p>
                            <p className="text-xs text-gray-600" dir="ltr">
                              {conv.phoneNumber as string}
                            </p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800">
                            انتهت منذ{' '}
                            {Math.max(
                              0,
                              Math.floor(
                                (Date.now() -
                                  new Date(conv.expirationTimestamp as string | Date).getTime()) /
                                  (1000 * 60 * 60)
                              )
                            )}{' '}
                            ساعة
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(customerServiceWindow?.count || 0) > windowExpiredConversations.length && (
                      <p className="text-xs text-center text-gray-500">
                        +{(customerServiceWindow?.count || 0) - windowExpiredConversations.length}{' '}
                        محادثة أخرى
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>جميع المحادثات ضمن نافذة الـ 24 ساعة</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-500" />
                  تنبيهات التكاليف المرتفعة
                </CardTitle>
                <CardDescription>محادثات بتكاليف مرتفعة تحتاج إلى مراجعة</CardDescription>
              </CardHeader>
              <CardContent>
                {highCostConversations.length > 0 ? (
                  <div className="space-y-3">
                    {highCostConversations.slice(0, 5).map((conv) => (
                      <div
                        key={conv.id}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{conv.phoneNumber}</p>
                            <p className="text-xs text-gray-600">
                              {conv.pricingModel || 'غير محدد'}
                            </p>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            ${Number(conv.conversationCost || 0).toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {highCostConversations.length > 5 && (
                      <p className="text-xs text-center text-gray-500">
                        +{highCostConversations.length - 5} محادثة أخرى
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>لا توجد تكاليف مرتفعة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>أحداث الأمان</CardTitle>
              <CardDescription>أحداث أمان متعلقة بحساب WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              {securityLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : securityEvents && securityEvents.length > 0 ? (
                <div className="space-y-4">
                  {securityEvents.map((event: Record<string, unknown>) => (
                    <div key={event.id as number} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{event.eventType as string}</h4>
                            <Badge className={getSeverityColor(event.severity as string)}>
                              {event.severity as string}
                            </Badge>
                          </div>
                          {Boolean(event.phoneNumber) && (
                            <p className="text-sm text-gray-600 mt-1">
                              الرقم: {event.phoneNumber as string}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            {getWhatsAppOperationDetails(event.details as string)}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(event.createdAt as string | Date).toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>لا توجد أحداث أمان حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <Card className="border-dashed bg-muted/20 mt-6">
          <CardHeader>
            <CardTitle>سجل الأحداث الفني</CardTitle>
            <CardDescription>
              تُراجع أحداث Webhook الخام للحساب والأمان من تبويب التشخيص المركزي لتفادي تكرار
              السجلات.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/whatsapp/operations?tab=webhooks&category=account">
                فتح أحداث الحساب
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/whatsapp/operations?tab=webhooks&category=security">
                فتح أحداث الأمان
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
