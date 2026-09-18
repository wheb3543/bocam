import { useState, useCallback } from 'react';
import { trpc } from '@/lib/api/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Smartphone,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Zap,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useWhatsAppSSE,
  PhoneQualityUpdateEvent,
  ConversationCostUpdateEvent,
  AccountUpdateEvent,
} from '@/hooks/integrations/useWhatsAppSSE';
import { Link } from 'wouter';
import { useWhatsAppOperationsSSE } from '@/contexts/WhatsAppOperationsSSEContext';
import { WhatsAppOperationalCostSummary } from '@/components/WhatsAppOperationalCostSummary';
import { useWhatsAppOperationalCostSummary } from '@/hooks/useWhatsAppOperationalCostSummary';
import { getWhatsAppOperationDetails } from '@/lib/whatsappOperationsPayload';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';

export default function WhatsAppPhoneQualityPage() {
  const operationsSse = useWhatsAppOperationsSSE();
  const { can } = useRolePermissions();
  const canViewWebhookLogs = can('integrations.logs.view');
  void canViewWebhookLogs;
  const [phoneFilter, _setPhoneFilter] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // حالة الجودة المباشرة عبر SSE
  const [liveQuality, setLiveQuality] = useState<{
    currentRating: string;
    previousRating?: string;
    phoneNumber: string;
    timestamp: string;
  } | null>(null);

  const {
    data: currentQuality,
    isLoading: currentLoading,
    refetch: refetchCurrent,
  } = trpc.whatsapp.phoneQuality.getCurrent.useQuery(undefined, {
    refetchInterval: 300000,
  });

  const {
    data: qualityHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = trpc.whatsapp.phoneQuality.getHistory.useQuery(
    { phoneNumber: phoneFilter || undefined, limit: 100 },
    { refetchInterval: 300000 }
  );

  const {
    data: conversationQualityQuery,
    isLoading: conversationLoading,
    refetch: refetchConversation,
  } = trpc.whatsapp.conversationQuality.getHistory.useQuery(
    { phoneNumber: phoneFilter || undefined, limit: 100 },
    { refetchInterval: 300000 }
  );
  const { summary: costSummary, isLoading: isCostSummaryLoading } =
    useWhatsAppOperationalCostSummary();

  const handleRefresh = () => {
    refetchCurrent();
    refetchHistory();
    refetchConversation();
    toast.success('تم تحديث البيانات');
  };

  // SSE: تحديث فوري عند وصول أحداث الجودة والتكلفة
  useWhatsAppSSE({
    enabled: !operationsSse,
    onPhoneQualityUpdate: useCallback(
      (event: PhoneQualityUpdateEvent) => {
        setLiveQuality({
          currentRating: event.currentRating,
          previousRating: event.previousRating,
          phoneNumber: event.phoneNumber,
          timestamp: event.timestamp,
        });
        toast.info(`تحديث جودة الرقم: ${event.currentRating}`);
        refetchCurrent();
        refetchHistory();
      },
      [refetchCurrent, refetchHistory]
    ),
    onConversationCostUpdate: useCallback((event: ConversationCostUpdateEvent) => {
      toast.info(`تحديث تكلفة المحادثة: ${event.phoneNumber}`);
    }, []),
    onAccountUpdate: useCallback(
      (event: AccountUpdateEvent) => {
        toast.info(`تحديث الحساب: ${event.eventType}`);
        refetchCurrent();
      },
      [refetchCurrent]
    ),
  });

  const getRatingColor = (rating?: string) => {
    switch (rating?.toUpperCase()) {
      case 'GREEN':
        return 'bg-green-500 text-white';
      case 'YELLOW':
        return 'bg-yellow-500 text-black';
      case 'RED':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRatingText = (rating?: string) => {
    switch (rating?.toUpperCase()) {
      case 'GREEN':
        return 'جيد (Green)';
      case 'YELLOW':
        return 'متوسط (Yellow)';
      case 'RED':
        return 'منخفض (Red)';
      default:
        return 'غير محدد';
    }
  };

  const getRatingIcon = (rating?: string) => {
    switch (rating?.toUpperCase()) {
      case 'GREEN':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'YELLOW':
        return <Minus className="h-5 w-5 text-yellow-500" />;
      case 'RED':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const messagingLimit = (() => {
    if (!currentQuality?.details) {
      return 'غير متاح';
    }
    try {
      const parsed = JSON.parse(currentQuality.details);
      return parsed.messagingLimit || parsed.limit || 'غير متاح';
    } catch {
      return 'غير متاح';
    }
  })();

  return (
    <div className="container mx-auto py-6 px-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">جودة رقم الهاتف</h1>
          <p className="text-gray-600 mt-1">مراقبة جودة ومعدلات تقييم أرقام WhatsApp الخاصة بك</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          {(operationsSse?.liveQuality ?? liveQuality) && (
            <Badge className="bg-green-500 text-white gap-1">
              <Zap className="h-3 w-3" />
              مباشر
            </Badge>
          )}
        </div>
      </div>

      {/* Live Quality Banner if received via SSE */}
      {(operationsSse?.liveQuality ?? liveQuality) && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-green-600 animate-pulse" />
                <div>
                  <p className="font-semibold text-green-900">
                    تحديث جودة مباشر:{' '}
                    {getRatingText(
                      operationsSse?.liveQuality?.currentRating ?? liveQuality?.currentRating
                    )}
                  </p>
                  <p className="text-xs text-green-700">
                    الرقم: {operationsSse?.liveQuality?.phoneNumber ?? liveQuality?.phoneNumber} •{' '}
                    {new Date(
                      operationsSse?.liveQuality?.timestamp ?? liveQuality?.timestamp ?? ''
                    ).toLocaleTimeString('ar-SA')}
                  </p>
                </div>
              </div>
              <Badge
                className={getRatingColor(
                  operationsSse?.liveQuality?.currentRating ?? liveQuality?.currentRating
                )}
              >
                {operationsSse?.liveQuality?.currentRating ?? liveQuality?.currentRating}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div
        className="sgh-compact-stat-grid mb-5 grid grid-cols-2 sm:mb-6 lg:grid-cols-4"
        aria-label="ملخص جودة رقم واتساب"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الجودة الحالية</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">
                    {getRatingText(currentQuality?.qualityRating)}
                  </p>
                  {getRatingIcon(currentQuality?.qualityRating)}
                </div>
              </div>
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">حد الرسائل</p>
                <p className="text-2xl font-bold">{messagingLimit}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">درجة الجودة</p>
                <p className="text-2xl font-bold">{currentQuality?.qualityScore || 'غير متاح'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">آخر تحديث</p>
                <p className="text-sm font-semibold mt-1">
                  {currentQuality?.createdAt
                    ? new Date(currentQuality.createdAt).toLocaleDateString('ar-SA')
                    : 'غير متاح'}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <WhatsAppOperationalCostSummary summary={costSummary} isLoading={isCostSummaryLoading} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="history">تاريخ الجودة</TabsTrigger>
          <TabsTrigger value="conversation-quality">جودة المحادثات</TabsTrigger>
          <TabsTrigger value="cost-quality">التكاليف والجودة</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الجودة الحالية</CardTitle>
              <CardDescription>معلومات مفصلة حول حالة رقم WhatsApp الخاص بك</CardDescription>
            </CardHeader>
            <CardContent>
              {currentLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : currentQuality ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      <p className="text-lg font-semibold mt-1" dir="ltr">
                        {currentQuality.phoneNumber}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">تقييم الجودة</p>
                      <Badge className={`mt-1 ${getRatingColor(currentQuality.qualityRating)}`}>
                        {getRatingText(currentQuality.qualityRating)}
                      </Badge>
                    </div>
                  </div>
                  {currentQuality.details && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">التفاصيل الفنية</p>
                      <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                        {getWhatsAppOperationDetails(currentQuality.details)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>لا توجد بيانات جودة حالية</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>تاريخ تقييم الجودة</CardTitle>
              <CardDescription>سجل التغييرات في جودة رقم الهاتف بمرور الوقت</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {historyLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : qualityHistory && qualityHistory.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b whitespace-nowrap">
                        <th className="text-right py-3 px-4">التاريخ</th>
                        <th className="text-right py-3 px-4">رقم الهاتف</th>
                        <th className="text-right py-3 px-4">التقييم</th>
                        <th className="text-right py-3 px-4">الدرجة</th>
                        <th className="text-right py-3 px-4">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualityHistory.map((record: Record<string, unknown>) => (
                        <tr key={record.id as number} className="border-b hover:bg-gray-50">
                          <td className="whitespace-nowrap py-3 px-4">
                            {new Date(record.createdAt as string | Date).toLocaleString('ar-SA')}
                          </td>
                          <td className="whitespace-nowrap py-3 px-4" dir="ltr">
                            {record.phoneNumber as string}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getRatingColor(record.qualityRating as string)}>
                              {getRatingText(record.qualityRating as string)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {(record.qualityScore as string | number) ?? 'غير متاح'}
                          </td>
                          <td className="py-3 px-4">
                            {Boolean(record.details) && (
                              <details>
                                <summary className="cursor-pointer text-blue-600">عرض</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                                  {getWhatsAppOperationDetails(record.details as string)}
                                </pre>
                              </details>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>لا يوجد تاريخ جودة متوفر</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                تحليل التكاليف والجودة
              </CardTitle>
              <CardDescription>عرض التكاليف بناءً على جودة رقم الهاتف</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b whitespace-nowrap">
                      <th className="text-right py-3 px-4">رقم الهاتف</th>
                      <th className="text-right py-3 px-4">نموذج التسعير</th>
                      <th className="text-right py-3 px-4">الفئة</th>
                      <th className="text-right py-3 px-4">قابل للفوترة</th>
                      <th className="text-right py-3 px-4">التكلفة</th>
                      <th className="text-right py-3 px-4">تاريخ الإنشاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costSummary.conversations.length > 0 ? (
                      costSummary.conversations.map((conv) => (
                        <tr key={conv.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4" dir="ltr">
                            {conv.phoneNumber}
                          </td>
                          <td className="py-3 px-4">{conv.pricingModel || 'غير محدد'}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{conv.pricingCategory || 'غير محدد'}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={conv.billable ? 'default' : 'secondary'}>
                              {conv.billable ? 'نعم' : 'لا'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {conv.conversationCost === null || conv.conversationCost === undefined
                              ? 'غير متاح'
                              : `$${Number(conv.conversationCost).toFixed(2)}`}
                          </td>
                          <td className="py-3 px-4">
                            {conv.createdAt
                              ? new Date(conv.createdAt).toLocaleString('ar-SA')
                              : 'غير متوفر'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          لا توجد بيانات تكاليف متوفر
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <Card className="border-dashed bg-muted/20 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              سجل أحداث الجودة
            </CardTitle>
            <CardDescription>
              يعرض التشخيص المركزي الحمولة الخام وحالة المعالجة لأحداث الجودة، لتبقى هذه الصفحة
              مركزة على المؤشرات والاتجاهات.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/admin/whatsapp/operations?tab=webhooks&category=quality">
                فتح تشخيص أحداث الجودة
              </Link>
            </Button>
          </CardContent>
        </Card>

        <TabsContent value="conversation-quality">
          <Card>
            <CardHeader>
              <CardTitle>تاريخ جودة المحادثات</CardTitle>
              <CardDescription>سجل تحديثات جودة المحادثات</CardDescription>
            </CardHeader>
            <CardContent>
              {conversationLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : conversationQualityQuery && conversationQualityQuery.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b whitespace-nowrap">
                        <th className="text-right py-3 px-4">التاريخ</th>
                        <th className="text-right py-3 px-4">رقم الهاتف</th>
                        <th className="text-right py-3 px-4">درجة الجودة</th>
                        <th className="text-right py-3 px-4">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversationQualityQuery.map((record: Record<string, unknown>) => (
                        <tr key={record.id as number} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {new Date(record.createdAt as string | Date).toLocaleString('ar-SA')}
                          </td>
                          <td className="py-3 px-4">{record.phoneNumber as string}</td>
                          <td className="py-3 px-4">
                            {(record.qualityScore as string | number) ?? 'غير متاح'}
                          </td>
                          <td className="py-3 px-4">
                            {Boolean(record.details) && (
                              <details>
                                <summary className="cursor-pointer text-blue-600">عرض</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                                  {getWhatsAppOperationDetails(record.details as string)}
                                </pre>
                              </details>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد بيانات جودة المحادثات</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
