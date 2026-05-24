import { useState, useCallback } from "react";
import { useWhatsAppSSE, TemplateDisabledEvent, TemplateEnabledEvent, TemplateNameUpdateEvent, TemplateCategoryUpdateEvent, TemplateLanguageUpdateEvent, TemplateEvent, AccountReviewUpdateEvent, AccountUpdateEvent, BusinessProfileUpdateEvent, BusinessAccountUpdateEvent, MessagingProductUpdateEvent, ConversationCostUpdateEvent } from "@/hooks/useWhatsAppSSE";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle, RefreshCw, Search, Eye, Code, AlertCircle, Terminal, MessageSquare, FileText, Shield, TrendingUp, Users, BarChart3, Zap } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WhatsAppWebhookInspectorPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<{ id: number; eventType: string; subType?: string; phoneNumber?: string; createdAt: string; rawPayload: string; processed: boolean; handlerExists: boolean } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [liveEventCount, setLiveEventCount] = useState(0);
  const [lastLiveEvent, setLastLiveEvent] = useState<string | null>(null);

  const { data: events, isLoading, refetch } = trpc.whatsapp.webhookEvents.getAll.useQuery(
    {
      processed: activeTab === "unhandled" ? false : undefined,
      handlerExists: activeTab === "unhandled" ? false : undefined,
      limit: 100,
    },
    { refetchInterval: 60000 }
  );

  const { data: categoryEvents, isLoading: isLoadingCategory, refetch: refetchCategory } = trpc.whatsapp.webhookEvents.getEventsByCategory.useQuery(
    { category: selectedCategory as "messages" | "templates" | "template_status" | "account" | "security" | "quality" | "subscriptions", limit: 100 },
    { enabled: selectedCategory !== "all", refetchInterval: 60000 }
  );

  const { data: statsByType, isLoading: isLoadingStats } = trpc.whatsapp.webhookEvents.getStatsByType.useQuery(
    undefined,
    { refetchInterval: 120000 }
  );

  const { data: unhandledCount, refetch: refetchCount } = trpc.whatsapp.webhookEvents.getUnhandledCount.useQuery(
    undefined,
    { refetchInterval: 60000 }
  );

  const { data: eventTypes, refetch: refetchTypes } = trpc.whatsapp.webhookEvents.getEventTypes.useQuery(
    undefined,
    { refetchInterval: 120000 }
  );

  const { data: templateEventsQuery, isLoading: isLoadingTemplate } = trpc.whatsapp.webhookEvents.getTemplateEvents.useQuery(
    { templateId: selectedTemplateId || undefined, limit: 100 },
    { enabled: !!selectedTemplateId, refetchInterval: 60000 }
  );

  const markAsProcessedMutation = trpc.whatsapp.webhookEvents.markAsProcessed.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الحدث");
      refetch();
      refetchCount();
    },
    onError: () => {
      toast.error("فشل تحديث الحالة");
    },
  });

  // ── SSE: تحديث فوري عند وصول أحداث جديدة ──────────────────────────────────
  useWhatsAppSSE({
    onWebhookEvent: useCallback((event: any) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(event.eventType);
      // تحديث القائمة تلقائياً
      refetch();
      refetchCount();
      refetchTypes();
    }, [refetch, refetchCount, refetchTypes]),
    onTemplateStatusUpdate: useCallback((event: any) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`template_status: ${event.status}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onAccountAlert: useCallback((event: any) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`account_alert: ${event.alertType}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    // أحداث القوالب الجديدة
    onTemplateDisabled: useCallback((event: TemplateDisabledEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`template_disabled: ${event.templateId}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onTemplateEnabled: useCallback((event: TemplateEnabledEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`template_enabled: ${event.templateId}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onTemplateNameUpdate: useCallback((event: TemplateNameUpdateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`template_name_update: ${event.templateId}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onTemplateCategoryUpdate: useCallback((event: TemplateCategoryUpdateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`template_category_update: ${event.templateId}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onTemplateLanguageUpdate: useCallback((event: TemplateLanguageUpdateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`template_language_update: ${event.templateId}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onTemplateEvent: useCallback((event: TemplateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`template_event: ${event.eventType}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    // أحداث الحساب الجديدة
    onAccountReviewUpdate: useCallback((event: AccountReviewUpdateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`account_review_update: ${event.status}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onAccountUpdate: useCallback((event: AccountUpdateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`account_update: ${event.eventType}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onBusinessProfileUpdate: useCallback((event: BusinessProfileUpdateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`business_profile_update: ${event.eventType}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onBusinessAccountUpdate: useCallback((event: BusinessAccountUpdateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`business_account_update: ${event.eventType}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    // أحداث أخرى
    onMessagingProductUpdate: useCallback((event: MessagingProductUpdateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`messaging_product_update: ${event.eventType}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
    onConversationCostUpdate: useCallback((event: ConversationCostUpdateEvent) => {
      setLiveEventCount((prev) => prev + 1);
      setLastLiveEvent(`conversation_cost_update: ${event.phoneNumber}`);
      refetch();
      refetchCount();
    }, [refetch, refetchCount]),
  });

  const handleRefresh = () => {
    refetch();
    refetchCategory();
    refetchCount();
    refetchTypes();
    toast.success("تم تحديث البيانات");
  };

  const displayEvents = selectedCategory === "templates" && selectedTemplateId 
    ? templateEventsQuery 
    : (selectedCategory !== "all" ? categoryEvents : events);
  const displayLoading = selectedCategory === "templates" && selectedTemplateId 
    ? isLoadingTemplate 
    : (selectedCategory !== "all" ? isLoadingCategory : isLoading);

  const handleMarkAsProcessed = (eventId: number, hasHandler: boolean = false) => {
    markAsProcessedMutation.mutate({ id: eventId, handlerExists: hasHandler });
  };

  const filteredEvents = displayEvents?.filter((event: any) => {
    const matchesSearch =
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.rawPayload && event.rawPayload.includes(searchTerm));
    return matchesSearch;
  });

  const categories = [
    { value: "all", label: "جميع الفئات", icon: BarChart3 },
    { value: "messages", label: "الرسائل", icon: MessageSquare },
    { value: "templates", label: "القوالب", icon: FileText },
    { value: "template_status", label: "حالة القوالب", icon: FileText },
    { value: "account", label: "الحساب", icon: Shield },
    { value: "security", label: "الأمان", icon: AlertTriangle },
    { value: "quality", label: "الجودة", icon: TrendingUp },
    { value: "subscriptions", label: "الاشتراكات", icon: Users },
  ];

  const totalEvents = statsByType?.reduce((sum, stat) => sum + (stat.count || 0), 0) || 0;
  const processedEvents = displayEvents?.filter((e: any) => e.processed).length || 0;

  return (
    <div className="container mx-auto py-6 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">فاحص أحداث Webhook</h1>
          <p className="text-gray-600 mt-1">اكتشاف وتحليل أحداث WhatsApp الجديدة من Meta</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {unhandledCount && unhandledCount > 0 && (
            <Badge className="bg-red-500 text-white text-lg px-3 py-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {unhandledCount} أحداث جديدة
            </Badge>
          )}
          {liveEventCount > 0 && (
            <Badge className="bg-green-500 text-white gap-1 animate-pulse">
              <Zap className="h-3 w-3" />
              {liveEventCount} حدث مباشر
            </Badge>
          )}
          {lastLiveEvent && (
            <span className="text-xs text-green-600 font-medium">
              آخر حدث: {lastLiveEvent}
            </span>
          )}
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الأحداث</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
              <Terminal className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">أحداث جديدة</p>
                <p className="text-2xl font-bold text-red-600">{unhandledCount || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">أنواع الأحداث</p>
                <p className="text-2xl font-bold text-blue-600">{eventTypes?.length || 0}</p>
              </div>
              <Code className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تم معالجتها</p>
                <p className="text-2xl font-bold text-green-600">
                  {processedEvents}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">تصفية حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
          {selectedCategory === "templates" && (
            <div className="mt-4">
              <Input
                placeholder="فلتر حسب معرف القالب"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-48"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Stats by Type */}
      {statsByType && statsByType.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">إحصائيات الأحداث حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statsByType
                .sort((a, b) => (b.count || 0) - (a.count || 0))
                .slice(0, 10)
                .map((stat) => {
                  const percentage = totalEvents > 0 ? ((stat.count || 0) / totalEvents) * 100 : 0;
                  return (
                    <div key={stat.eventType} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stat.eventType}</span>
                        <span className="text-gray-600">
                          {stat.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Types Summary */}
      {eventTypes && eventTypes.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">أنواع الأحداث المكتشفة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type: any) => (
                <Badge
                  key={type.eventType}
                  variant="outline"
                  className="text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => setSearchTerm(type.eventType)}
                >
                  {type.eventType} ({type.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث بنوع الحدث أو المحتوى..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">جميع الأحداث</TabsTrigger>
          <TabsTrigger value="unhandled">
            أحداث جديدة
            {unhandledCount && unhandledCount > 0 && (
              <span className="mr-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                {unhandledCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="template_status">
            حالة القوالب
            {liveEventCount > 0 && (
              <span className="mr-2 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">
                {liveEventCount} مباشر
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>سجل الأحداث</CardTitle>
              <CardDescription>
                الأحداث الواردة من Meta (محفوظة تلقائياً)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {displayLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : filteredEvents && filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className={`p-4 border rounded-lg ${
                        !event.handlerExists ? "bg-red-50 border-red-200" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-lg">{event.eventType}</h4>
                            {event.subType && (
                              <Badge variant="outline">{event.subType}</Badge>
                            )}
                            {!event.handlerExists && (
                              <Badge className="bg-red-500 text-white gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                غير معالج
                              </Badge>
                            )}
                            {event.processed && (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                معالج
                              </Badge>
                            )}
                          </div>

                          <div className="mt-2 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold">التاريخ:</span>{" "}
                              {new Date(event.createdAt).toLocaleString("ar-SA")}
                            </p>
                            {event.phoneNumber && (
                              <p>
                                <span className="font-semibold">الرقم:</span>{" "}
                                {event.phoneNumber}
                              </p>
                            )}
                          </div>

                          {/* Preview of payload */}
                          <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                            {event.rawPayload.substring(0, 200)}...
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mr-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>
                                <Eye className="h-4 w-4 mr-1" />
                                عرض
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                              <DialogHeader>
                                <DialogTitle>تفاصيل الحدث: {event.eventType}</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-semibold">النوع:</p>
                                    <p>{event.eventType}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">النوع الفرعي:</p>
                                    <p>{event.subType || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">رقم الهاتف:</p>
                                    <p>{event.phoneNumber || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">التاريخ:</p>
                                    <p>{new Date(event.createdAt).toLocaleString("ar-SA")}</p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-semibold mb-2">البيانات الكاملة:</p>
                                  <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto max-h-96 text-xs">
                                    {JSON.stringify(JSON.parse(event.rawPayload), null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {!event.processed && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleMarkAsProcessed(event.id, true)}
                                disabled={markAsProcessedMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                يوجد معالج
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:bg-orange-50"
                                onClick={() => handleMarkAsProcessed(event.id, false)}
                                disabled={markAsProcessedMutation.isPending}
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                تجاهل
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Terminal className="h-12 w-12 mx-auto mb-2" />
                  <p>لا توجد أحداث متطابقة مع البحث</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
