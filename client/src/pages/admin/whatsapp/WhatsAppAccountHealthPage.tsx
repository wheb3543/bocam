
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
  Bell,
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

interface LiveAlert {
  alertType: string;
  severity: string;
  details?: unknown;
  timestamp: string;
}

interface Conversation {
  id: number;
  phoneNumber: string;
  customerName: string | null;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  isImportant: number;
  isArchived: number;
  leadId: number | null;
  appointmentId: number | null;
  offerLeadId: number | null;
  campRegistrationId: number | null;
  assignedToUserId: number | null;
  notes: string | null;
  conversationIdMeta: string | null;
  originType: string | null;
  expirationTimestamp: Date | null;
  pricingModel: string | null;
  billable: boolean;
  pricingCategory: string | null;
  totalCost: number;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

interface ConversationCost {
  id: number;
  phoneNumber: string;
  conversationCost: number;
  pricingModel?: string | null;
  [key: string]: unknown;
}

interface Alert {
  id: number;
  alertType: string;
  severity: string;
  details: string | null;
  resolved: boolean;
  createdAt: string | Date;
  [key: string]: unknown;
}

interface SecurityEvent {
  id: number;
  eventType: string;
  details: string | null;
  severity: string;
  phoneNumber?: string | null;
  createdAt: string | Date;
  [key: string]: unknown;
}

interface WebhookEvent {
  id: number;
  eventType: string;
  subType?: string | null;
  phoneNumber?: string | null;
  createdAt: string | Date;
  [key: string]: unknown;
}

type Severity = 'critical' | 'high' | 'medium' | 'low' | null;

export default function WhatsAppAccountHealthPage() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);

  // حالة التنبيهات المباشرة عبر SSE
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [hasNewCritical, setHasNewCritical] = useState(false);

  const {
    data: alerts,
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = trpc.whatsapp.accountHealth.getAlerts.useQuery(
    { resolved: false, limit: 50, severity: severityFilter as 'low' | 'medium' | 'high' | 'critical' | undefined },
    { refetchInterval: 120000 }
  );

  const {
    data: securityEvents,
    isLoading: securityLoading,
    refetch: refetchSecurity,
  } = trpc.whatsapp.accountHealth.getSecurityEvents.useQuery(
    { limit: 50, severity: severityFilter as 'low' | 'medium' | 'high' | 'critical' | undefined },
    { refetchInterval: 120000 }
  );

  const {
    data: accountWebhookEvents,
    isLoading: webhookLoading,
    refetch: refetchWebhook,
  } = trpc.whatsapp.webhookEvents.getEventsByCategory.useQuery(
    { category: 'account', limit: 50 },
    { refetchInterval: 120000 }
  );

  const {
    data: securityWebhookEvents,
    isLoading: securityWebhookLoading,
    refetch: refetchSecurityWebhook,
  } = trpc.whatsapp.webhookEvents.getEventsByCategory.useQuery(
    { category: 'security', limit: 50 },
    { refetchInterval: 120000 }
  );

  // استعلامات جديدة للتنبيهات الذكية
  const { data: conversations } = trpc.whatsapp.conversations.list.useQuery();

  const { data: conversationCosts } = trpc.whatsapp.getConversationCosts.useQuery(
    {},
    { refetchInterval: 120000 }
  );

  // SSE: تحديث فوري عند وصول أحداث الحساب الجديدة
  useWhatsAppSSE({
    onAccountReviewUpdate: useCallback(
      (event: AccountReviewUpdateEvent) => {
        toast.info(`تحديث مراجعة الحساب: ${event.status}`);
        refetchAlerts();
        refetchWebhook();
      },
      [refetchAlerts, refetchWebhook]
    ),
    onAccountUpdate: useCallback(
      (event: AccountUpdateEvent) => {
        toast.info(`تحديث الحساب: ${event.eventType}`);
        refetchAlerts();
        refetchWebhook();
      },
      [refetchAlerts, refetchWebhook]
    ),
    onBusinessProfileUpdate: useCallback(
      (event: BusinessProfileUpdateEvent) => {
        toast.info(`تحديث الملف التجاري: ${event.eventType}`);
        refetchAlerts();
        refetchWebhook();
      },
      [refetchAlerts, refetchWebhook]
    ),
    onBusinessAccountUpdate: useCallback(
      (event: BusinessAccountUpdateEvent) => {
        toast.info(`تحديث حساب الأعمال: ${event.eventType}`);
        refetchAlerts();
        refetchWebhook();
      },
      [refetchAlerts, refetchWebhook]
    ),
  });

  // حساب التنبيهات الذكية
  const windowExpiredConversations = Array.isArray(conversations)
    ? conversations.filter((c: Conversation) => {
        if (!c.lastMessageAt) {return false;}
        const hoursSinceLastMessage =
          (Date.now() - new Date(c.lastMessageAt).getTime()) / (1000 * 60 * 60);
        return hoursSinceLastMessage > 24;
      })
    : [];

  const highCostConversations = Array.isArray(conversationCosts)
    ? conversationCosts.filter((c) => (c.totalCost || 0) > 1.0)
    : [];

  const totalHighCost = highCostConversations.reduce(
    (sum: number, c) => sum + (c.totalCost || 0),
    0
  );

  const resolveAlertMutation = trpc.whatsapp.accountHealth.resolveAlert.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث حالة التنبيه');
      refetchAlerts();
    },
    onError: () => {
      toast.error('فشل تحديث حالة التنبيه');
    },
  });

  // ── SSE: تنبيهات فورية من الـ webhook ──────────────────────────────────────
  useWhatsAppSSE({
    onAccountAlert: useCallback(
      (event: { alertType: string; severity: string; details?: unknown; timestamp: string }) => {
        // إضافة التنبيه للقائمة المحلية فوراً
        setLiveAlerts((prev) => [
          {
            alertType: event.alertType,
            severity: event.severity,
            details: event.details,
            timestamp: event.timestamp,
          },
          ...prev.slice(0, 9), // نحتفظ بآخر 10 تنبيهات
        ]);

        // تنبيه بصري للتنبيهات الحرجة
        if (event.severity === 'critical' || event.severity === 'high') {
          setHasNewCritical(true);
        }

        // تحديث البيانات من الـ DB
        refetchAlerts();
        refetchSecurity();
      },
      [refetchAlerts, refetchSecurity]
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
    resolveAlertMutation.mutate({ id: alertId, resolvedBy: 1 }); // TODO: Get actual user ID
  };

  const handleRefresh = () => {
    refetchAlerts();
    refetchSecurity();
    refetchWebhook();
    refetchSecurityWebhook();
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
          {hasNewCritical && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg animate-pulse">
              <BellRing className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">تنبيه حرج جديد!</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-600"
                onClick={() => setHasNewCritical(false)}
              >
                ×
              </Button>
            </div>
          )}
          {liveAlerts.length > 0 && (
            <Badge className="bg-green-500 text-white gap-1">
              <Zap className="h-3 w-3" />
              {liveAlerts.length} مباشر
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تنبيهات حرجة</p>
                <p className="text-2xl font-bold text-red-600">
                  {Array.isArray(alerts)
                    ? alerts.filter((a: Alert) => a.severity === 'critical' && !a.resolved).length
                    : 0}
                </p>
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
                <p className="text-2xl font-bold text-orange-600">
                  {Array.isArray(alerts)
                    ? alerts.filter((a: Alert) => a.severity === 'high' && !a.resolved).length
                    : 0}
                </p>
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
                <p className="text-2xl font-bold text-blue-600">{securityEvents?.length || 0}</p>
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
                  {Array.isArray(alerts) ? alerts.filter((a: Alert) => a.resolved).length : 0}
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
                  {windowExpiredConversations.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">محادثة خارج النافذة</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تكاليف مرتفعة</p>
                <p className="text-2xl font-bold text-red-600">${typeof totalHighCost === 'number' ? totalHighCost.toFixed(2) : '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {highCostConversations.length} محادثة مكلفة
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
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
          className="bg-red-100 hover:bg-red-200 text-red-700"
        >
          حرجة
        </Button>
        <Button
          variant={severityFilter === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSeverityFilter('high')}
          className="bg-orange-100 hover:bg-orange-200 text-orange-700"
        >
          عالية
        </Button>
        <Button
          variant={severityFilter === 'medium' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSeverityFilter('medium')}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
        >
          متوسطة
        </Button>
        <Button
          variant={severityFilter === 'low' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSeverityFilter('low')}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700"
        >
          منخفضة
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="alerts">تنبيهات الحساب</TabsTrigger>
          <TabsTrigger value="smart-alerts">تنبيهات ذكية</TabsTrigger>
          <TabsTrigger value="security">أحداث الأمان</TabsTrigger>
          <TabsTrigger value="webhook-events">أحداث Webhook</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>تنبيهات الحساب</CardTitle>
              <CardDescription>تنبيهات مهمة من Meta حول حالة الحساب</CardDescription>
            </CardHeader>
            <CardContent>
              {/* تنبيهات مباشرة عبر SSE */}
              {liveAlerts.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">
                      تنبيهات مباشرة ({liveAlerts.length})
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs text-amber-600 mr-auto"
                      onClick={() => setLiveAlerts([])}
                    >
                      مسح
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {liveAlerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-sm p-2 rounded ${
                          alert.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : alert.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : alert.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {getSeverityIcon(alert.severity)}
                        <span className="font-medium">{alert.alertType}</span>
                        <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs opacity-70 mr-auto">
                          {new Date(alert.timestamp).toLocaleTimeString('ar-SA')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {alertsLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert: Alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${alert.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{alert.alertType}</h4>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {alert.resolved && (
                                <Badge variant="outline" className="text-green-600">
                                  محلول
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.details
                                ? JSON.parse(alert.details).message || alert.details
                                : ''}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(alert.createdAt).toLocaleString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                            disabled={resolveAlertMutation.isPending}
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
            {/* 24-Hour Window Alerts */}
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
                    {windowExpiredConversations.slice(0, 5).map((conv: Conversation) => (
                      <div
                        key={conv.id}
                        className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg"
                      >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">
                            {conv.customerName ?? 'عميل جديد'}
                          </p>
                          <p className="text-xs text-gray-600" dir="ltr">
                            {conv.phoneNumber ?? ''}
                          </p>
                        </div>
                          <Badge className="bg-amber-100 text-amber-800">
                            {conv.lastMessageAt ? Math.floor(
                              (Date.now() - new Date(conv.lastMessageAt).getTime()) /
                                (1000 * 60 * 60)
                            ) : 0}{' '}
                            ساعة
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {windowExpiredConversations.length > 5 && (
                      <p className="text-xs text-center text-gray-500">
                        +{windowExpiredConversations.length - 5} محادثة أخرى
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

            {/* High Cost Alerts */}
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
                          <p className="font-semibold text-sm">{conv.phoneNumber ?? ''}</p>
                          <p className="text-xs text-gray-600">
                            {conv.pricingModel ?? 'غير محدد'}
                          </p>
                        </div>
                          <Badge className="bg-red-100 text-red-800">
                            ${(conv.totalCost || 0).toFixed(2)}
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
                  {securityEvents.map((event: SecurityEvent) => (
                    <div key={event.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{event.eventType}</h4>
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity}
                            </Badge>
                          </div>
                          {event.phoneNumber && (
                            <p className="text-sm text-gray-600 mt-1">الرقم: {event.phoneNumber}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            {event.details
                              ? JSON.parse(event.details).message || event.details
                              : ''}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(event.createdAt).toLocaleString('ar-SA')}
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

        <TabsContent value="webhook-events">
          <Card>
            <CardHeader>
              <CardTitle>أحداث Webhook الخام</CardTitle>
              <CardDescription>أحداث الحساب والأمان الواردة مباشرة من Meta</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account">
                <TabsList className="mb-4">
                  <TabsTrigger value="account">أحداث الحساب</TabsTrigger>
                  <TabsTrigger value="security">أحداث الأمان</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  {webhookLoading ? (
                    <div className="text-center py-8">جاري التحميل...</div>
                  ) : accountWebhookEvents && accountWebhookEvents.length > 0 ? (
                    <div className="space-y-3">
                      {accountWebhookEvents.map((event: WebhookEvent) => (
                        <div key={event.id} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{event.eventType}</h4>
                              {event.subType && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {event.subType}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(event.createdAt as string | Date).toLocaleString('ar-SA')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>لا توجد أحداث حساب حالياً</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="security">
                  {securityWebhookLoading ? (
                    <div className="text-center py-8">جاري التحميل...</div>
                  ) : securityWebhookEvents && securityWebhookEvents.length > 0 ? (
                    <div className="space-y-3">
                      {securityWebhookEvents.map((event: WebhookEvent) => (
                        <div key={event.id} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{event.eventType}</h4>
                              {event.subType && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {event.subType}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(event.createdAt as string | Date).toLocaleString('ar-SA')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>لا توجد أحداث أمان حالياً</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
