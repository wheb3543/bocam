import { useState, useCallback } from "react";
import { trpc } from "@/lib/api/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, RefreshCw, TrendingUp, TrendingDown, Minus, Activity, Zap, AlertTriangle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useWhatsAppSSE, PhoneQualityUpdateEvent, ConversationCostUpdateEvent, AccountUpdateEvent } from "@/hooks/integrations/useWhatsAppSSE";

export default function WhatsAppPhoneQualityPage() {
  const [phoneFilter, setPhoneFilter] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // حالة الجودة المباشرة عبر SSE
  const [liveQuality, setLiveQuality] = useState<{
    currentRating: string;
    previousRating?: string;
    phoneNumber: string;
    timestamp: string;
  } | null>(null);

  const { data: currentQuality, isLoading: currentLoading, refetch: refetchCurrent } = trpc.whatsapp.phoneQuality.getCurrent.useQuery(
    undefined,
    { refetchInterval: 300000 }
  );

  const { data: qualityHistory, isLoading: historyLoading, refetch: refetchHistory } = trpc.whatsapp.phoneQuality.getHistory.useQuery(
    { phoneNumber: phoneFilter || undefined, limit: 100 },
    { refetchInterval: 300000 }
  );

  const { data: qualityWebhookEvents, isLoading: webhookLoading, refetch: refetchWebhook } = trpc.whatsapp.webhookEvents.getEventsByCategory.useQuery(
    { category: "quality", limit: 50 },
    { refetchInterval: 300000 }
  );

  const { data: conversationQualityQuery, isLoading: conversationLoading, refetch: refetchConversation } = trpc.whatsapp.conversationQuality.getHistory.useQuery(
    { phoneNumber: phoneFilter || undefined, limit: 100 },
    { refetchInterval: 300000 }
  );

  const { data: conversationCosts } = trpc.whatsapp.getConversationCosts.useQuery(
    {},
    { refetchInterval: 300000 }
  );

  const handleRefresh = () => {
    refetchCurrent();
    refetchHistory();
    refetchWebhook();
    refetchConversation();
    toast.success("تم تحديث البيانات");
  };

  // ── SSE: تحديث فوري لجودة الهاتف ──────────────────────────────────────────
  useWhatsAppSSE({
    onPhoneQualityUpdate: useCallback((event: PhoneQualityUpdateEvent) => {
      setLiveQuality({
        currentRating: event.currentRating,
        previousRating: event.previousRating,
        phoneNumber: event.phoneNumber,
        timestamp: event.timestamp,
      });
      // تحديث البيانات من الـ DB
      refetchCurrent();
      refetchHistory();
      refetchWebhook();
    }, [refetchCurrent, refetchHistory, refetchWebhook]),
    onConversationCostUpdate: useCallback((event: ConversationCostUpdateEvent) => {
      toast.info(`تحديث تكلفة المحادثة: ${event.phoneNumber}`);
      refetchConversation();
    }, [refetchConversation]),
    onAccountUpdate: useCallback((event: AccountUpdateEvent) => {
      toast.info(`تحديث الحساب: ${event.eventType}`);
      refetchCurrent();
      refetchHistory();
    }, [refetchCurrent, refetchHistory]),
  });

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "green":
        return "bg-green-500 text-white";
      case "yellow":
        return "bg-yellow-500 text-black";
      case "red":
        return "bg-red-500 text-white";
      case "gray":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case "green":
        return "ممتاز";
      case "yellow":
        return "جيد";
      case "red":
        return "ضعيف";
      case "gray":
        return "غير معروف";
      default:
        return rating;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  // Calculate trend from history
  const getQualityTrend = () => {
    if (!qualityHistory || qualityHistory.length < 2) return null;
    const current = qualityHistory[0]?.qualityScore || 0;
    const previous = qualityHistory[1]?.qualityScore || 0;
    return { icon: getTrendIcon(current, previous), change: current - previous };
  };

  const trend = getQualityTrend();

  // مؤشر الجودة البصري (gauge)
  const QualityGauge = ({ rating, score }: { rating: string; score?: number | null }) => {
    const percentage = score ?? (rating === 'green' ? 85 : rating === 'yellow' ? 55 : rating === 'red' ? 25 : 0);
    const color = rating === 'green' ? '#22c55e' : rating === 'yellow' ? '#eab308' : rating === 'red' ? '#ef4444' : '#9ca3af';
    const bgColor = rating === 'green' ? 'bg-green-50' : rating === 'yellow' ? 'bg-yellow-50' : rating === 'red' ? 'bg-red-50' : 'bg-gray-50';

    return (
      <div className={`relative flex flex-col items-center justify-center p-6 rounded-2xl ${bgColor} border-2`} style={{ borderColor: color }}>
        {/* Circular gauge */}
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {/* Background arc */}
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeDasharray="251.2"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{percentage}</span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span className="text-lg font-bold" style={{ color }}>{getRatingText(rating)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">جودة رقم الهاتف</h1>
          <p className="text-gray-600 mt-1">مراقبة جودة رقم WhatsApp Business API</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      </div>

      {/* Current Quality Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            الجودة الحالية
          </CardTitle>
          <CardDescription>
            {currentQuality?.phoneNumber || "غير متوفر"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : currentQuality ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Visual gauge */}
              <QualityGauge
                rating={liveQuality?.currentRating || currentQuality.qualityRating}
                score={currentQuality.qualityScore}
              />

              {/* Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">رقم الهاتف</p>
                  <p className="font-semibold">{currentQuality.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">التقييم</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getRatingColor(liveQuality?.currentRating || currentQuality.qualityRating)}>
                      {getRatingText(liveQuality?.currentRating || currentQuality.qualityRating)}
                    </Badge>
                    {liveQuality && liveQuality.previousRating && liveQuality.previousRating !== liveQuality.currentRating && (
                      <span className="text-xs text-gray-500">
                        (كان: {getRatingText(liveQuality.previousRating)})
                      </span>
                    )}
                    {trend && (
                      <div className="flex items-center gap-1">
                        {trend.icon}
                        <span className={`text-sm ${trend.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {trend.change > 0 ? "+" : ""}{trend.change}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {liveQuality && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg w-fit">
                    <Zap className="h-3 w-3" />
                    <span>تحديث مباشر — {new Date(liveQuality.timestamp).toLocaleTimeString('ar-SA')}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="h-12 w-12 mx-auto mb-2" />
              <p>لا توجد بيانات جودة حالياً</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost-Quality Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي التكلفة</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${conversationCosts?.reduce((sum: number, c: any) => sum + (c.conversationCost || 0), 0).toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التكلفة</p>
                <p className="text-2xl font-bold text-green-600">
                  ${conversationCosts && conversationCosts.length > 0
                    ? (conversationCosts.reduce((sum: number, c: any) => sum + (c.conversationCost || 0), 0) / conversationCosts.length).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">التكلفة حسب الجودة</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentQuality?.qualityRating === 'green' ? 'منخفضة' :
                   currentQuality?.qualityRating === 'yellow' ? 'متوسطة' :
                   currentQuality?.qualityRating === 'red' ? 'مرتفعة' : 'غير معروف'}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="cost-quality">التكاليف والجودة</TabsTrigger>
          <TabsTrigger value="webhook-events">أحداث Webhook</TabsTrigger>
          <TabsTrigger value="conversation-quality">جودة المحادثات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle>تاريخ الجودة</CardTitle>
              <CardDescription>سجل تحديثات جودة رقم الهاتف</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : qualityHistory && qualityHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">التاريخ</th>
                        <th className="text-right py-3 px-4">رقم الهاتف</th>
                        <th className="text-right py-3 px-4">التقييم</th>
                        <th className="text-right py-3 px-4">الدرجة</th>
                        <th className="text-right py-3 px-4">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualityHistory.map((record: any, index: number) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {new Date(record.createdAt).toLocaleString("ar-SA")}
                          </td>
                          <td className="py-3 px-4">{record.phoneNumber}</td>
                          <td className="py-3 px-4">
                            <Badge className={getRatingColor(record.qualityRating)}>
                              {getRatingText(record.qualityRating)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{record.qualityScore || "N/A"}</td>
                          <td className="py-3 px-4">
                            {record.details && (
                              <details>
                                <summary className="cursor-pointer text-blue-600">عرض</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                                  {JSON.stringify(JSON.parse(record.details), null, 2)}
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
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">رقم الهاتف</th>
                      <th className="text-right py-3 px-4">نموذج التسعير</th>
                      <th className="text-right py-3 px-4">الفئة</th>
                      <th className="text-right py-3 px-4">قابل للفوترة</th>
                      <th className="text-right py-3 px-4">التكلفة</th>
                      <th className="text-right py-3 px-4">تاريخ الإنشاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversationCosts && conversationCosts.length > 0 ? (
                      conversationCosts.map((conv: any) => (
                        <tr key={conv.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4" dir="ltr">{conv.phoneNumber}</td>
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
                            ${(conv.conversationCost || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(conv.createdAt).toLocaleString("ar-SA")}
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

        <TabsContent value="webhook-events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                أحداث Webhook للجودة
              </CardTitle>
              <CardDescription>أحداث تحديث الجودة الواردة مباشرة من Meta</CardDescription>
            </CardHeader>
            <CardContent>
              {webhookLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : qualityWebhookEvents && qualityWebhookEvents.length > 0 ? (
                <div className="space-y-3">
                  {qualityWebhookEvents.map((event: any) => (
                    <div key={event.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{event.eventType}</h4>
                            {event.subType && (
                              <Badge variant="outline">{event.subType}</Badge>
                            )}
                          </div>
                          {event.phoneNumber && (
                            <p className="text-sm text-gray-600 mt-1">
                              الرقم: {event.phoneNumber}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(event.createdAt).toLocaleString("ar-SA")}
                          </p>
                        </div>
                        <Badge className={event.handlerExists ? "bg-green-500" : "bg-red-500"}>
                          {event.handlerExists ? "معالج" : "غير معالج"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2" />
                  <p>لا توجد أحداث جودة حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">التاريخ</th>
                        <th className="text-right py-3 px-4">رقم الهاتف</th>
                        <th className="text-right py-3 px-4">درجة الجودة</th>
                        <th className="text-right py-3 px-4">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversationQualityQuery.map((record: any) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{new Date(record.createdAt).toLocaleString("ar-SA")}</td>
                          <td className="py-3 px-4">{record.phoneNumber}</td>
                          <td className="py-3 px-4">{record.qualityScore || "N/A"}</td>
                          <td className="py-3 px-4">
                            {record.details && (
                              <details>
                                <summary className="cursor-pointer text-blue-600">عرض</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                                  {JSON.stringify(JSON.parse(record.details), null, 2)}
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
