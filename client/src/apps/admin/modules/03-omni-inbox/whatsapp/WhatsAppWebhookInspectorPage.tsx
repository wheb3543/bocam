import { useState, useCallback } from 'react';
import {
  useWhatsAppSSE,
  TemplateDisabledEvent,
  TemplateEnabledEvent,
  TemplateNameUpdateEvent,
  TemplateCategoryUpdateEvent,
  TemplateLanguageUpdateEvent,
  TemplateEvent,
  AccountReviewUpdateEvent,
  AccountUpdateEvent,
  BusinessProfileUpdateEvent,
  BusinessAccountUpdateEvent,
  MessagingProductUpdateEvent,
  ConversationCostUpdateEvent,
} from '@/hooks/integrations/useWhatsAppSSE';
import { trpc } from '@/lib/api/trpc';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { PermissionHint } from '@/components/PermissionHint';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Eye,
  Code,
  AlertCircle,
  Terminal,
  MessageSquare,
  FileText,
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSearch } from 'wouter';
import { useWhatsAppOperationsSSE } from '@/contexts/WhatsAppOperationsSSEContext';

const webhookCategories = [
  'messages',
  'templates',
  'template_status',
  'account',
  'security',
  'quality',
  'subscriptions',
  'flows',
] as const;

export default function WhatsAppWebhookInspectorPage() {
  const { can, isLoading: arePermissionsLoading } = useRolePermissions();
  const canViewWebhookLogs = can('integrations.logs.view');
  const canManageWebhooks = can('integrations.webhooks.manage');
  const operationsSse = useWhatsAppOperationsSSE();
  const search = useSearch();
  const categoryFromLocation = new URLSearchParams(search).get('category');
  const initialCategory = webhookCategories.includes(
    categoryFromLocation as (typeof webhookCategories)[number]
  )
    ? categoryFromLocation!
    : 'all';
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [_selectedEvent, setSelectedEvent] = useState<{
    id: number;
    eventType: string;
    subType?: string | null;
    phoneNumber?: string | null;
    createdAt: string | Date;
    processed: boolean;
    handlerExists: boolean;
  } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [liveEventCount, setLiveEventCount] = useState(0);
  const [lastLiveEvent, setLastLiveEvent] = useState<string | null>(null);
  const [visibleEventCount, setVisibleEventCount] = useState(25);

  const {
    data: events,
    isLoading,
    refetch,
  } = trpc.whatsapp.webhookEvents.getAll.useQuery(
    {
      processed: activeTab === 'unhandled' ? false : undefined,
      handlerExists: activeTab === 'unhandled' ? false : undefined,
      limit: 100,
    },
    { enabled: canViewWebhookLogs, refetchInterval: 60000 }
  );

  const {
    data: categoryEvents,
    isLoading: isLoadingCategory,
    refetch: refetchCategory,
  } = trpc.whatsapp.webhookEvents.getEventsByCategory.useQuery(
    {
      category: (selectedCategory !== 'all' && selectedCategory !== 'flows'
        ? selectedCategory
        : 'messages') as
        | 'messages'
        | 'templates'
        | 'template_status'
        | 'account'
        | 'security'
        | 'quality'
        | 'subscriptions'
        | 'flows',
      limit: 100,
    },
    {
      enabled: canViewWebhookLogs && selectedCategory !== 'all' && selectedCategory !== 'flows',
      refetchInterval: 60000,
    }
  );

  const {
    data: flowEvents,
    isLoading: isLoadingFlows,
    refetch: refetchFlows,
  } = trpc.whatsapp.webhookEvents.getFlowEvents.useQuery(
    { limit: 100 },
    { enabled: canViewWebhookLogs && selectedCategory === 'flows', refetchInterval: 60000 }
  );

  const { data: statsByType } = trpc.whatsapp.webhookEvents.getStatsByType.useQuery(undefined, {
    enabled: canViewWebhookLogs,
    refetchInterval: 120000,
  });

  const { data: unhandledCount, refetch: refetchCount } =
    trpc.whatsapp.webhookEvents.getUnhandledCount.useQuery(undefined, {
      enabled: canViewWebhookLogs,
      refetchInterval: 60000,
    });

  const { data: eventTypes, refetch: refetchTypes } =
    trpc.whatsapp.webhookEvents.getEventTypes.useQuery(undefined, {
      enabled: canViewWebhookLogs,
      refetchInterval: 120000,
    });

  const { data: templateEventsQuery, isLoading: isLoadingTemplate } =
    trpc.whatsapp.webhookEvents.getTemplateEvents.useQuery(
      { templateId: selectedTemplateId || undefined, limit: 100 },
      { enabled: canViewWebhookLogs && Boolean(selectedTemplateId), refetchInterval: 60000 }
    );

  const markAsProcessedMutation = trpc.whatsapp.webhookEvents.markAsProcessed.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث حالة الحدث');
      refetch();
      refetchCount();
    },
    onError: () => {
      toast.error('فشل تحديث الحالة');
    },
  });

  // SSE: تحديث فوري عند وصول أحداث جديدة
  useWhatsAppSSE({
    enabled: canViewWebhookLogs && !operationsSse,
    onWebhookEvent: useCallback(
      (event: { eventType: string }) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(event.eventType);
        refetch();
        refetchCount();
        refetchTypes();
      },
      [refetch, refetchCount, refetchTypes]
    ),
    onTemplateStatusUpdate: useCallback(
      (event: { status: string }) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`template_status: ${event.status}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onAccountAlert: useCallback(
      (event: { alertType: string }) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`account_alert: ${event.alertType}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onTemplateDisabled: useCallback(
      (event: TemplateDisabledEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`template_disabled: ${event.templateId}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onTemplateEnabled: useCallback(
      (event: TemplateEnabledEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`template_enabled: ${event.templateId}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onTemplateNameUpdate: useCallback(
      (event: TemplateNameUpdateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`template_name_update: ${event.templateId}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onTemplateCategoryUpdate: useCallback(
      (event: TemplateCategoryUpdateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`template_category_update: ${event.templateId}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onTemplateLanguageUpdate: useCallback(
      (event: TemplateLanguageUpdateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`template_language_update: ${event.templateId}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onTemplateEvent: useCallback(
      (event: TemplateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`template_event: ${event.eventType}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onAccountReviewUpdate: useCallback(
      (event: AccountReviewUpdateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`account_review_update: ${event.status}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onAccountUpdate: useCallback(
      (event: AccountUpdateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`account_update: ${event.eventType}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onBusinessProfileUpdate: useCallback(
      (event: BusinessProfileUpdateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`business_profile_update: ${event.eventType}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onBusinessAccountUpdate: useCallback(
      (event: BusinessAccountUpdateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`business_account_update: ${event.eventType}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onMessagingProductUpdate: useCallback(
      (event: MessagingProductUpdateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`messaging_product_update: ${event.eventType}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
    onConversationCostUpdate: useCallback(
      (event: ConversationCostUpdateEvent) => {
        setLiveEventCount((prev) => prev + 1);
        setLastLiveEvent(`conversation_cost_update: ${event.phoneNumber}`);
        refetch();
        refetchCount();
      },
      [refetch, refetchCount]
    ),
  });

  const handleRefresh = () => {
    refetch();
    refetchCategory();
    refetchFlows();
    refetchCount();
    refetchTypes();
    toast.success('تم تحديث البيانات');
  };

  const normalizedFlowEvents = flowEvents?.map((event: Record<string, unknown>) => ({
    ...event,
    eventType: 'flows',
    subType: event.eventName,
    phoneNumber: null,
    processed: true,
    handlerExists: true,
  }));

  const displayEvents =
    selectedCategory === 'templates' && selectedTemplateId
      ? templateEventsQuery
      : selectedCategory === 'flows'
        ? normalizedFlowEvents
        : selectedCategory !== 'all'
          ? categoryEvents
          : events;

  const displayLoading =
    selectedCategory === 'templates' && selectedTemplateId
      ? isLoadingTemplate
      : selectedCategory === 'flows'
        ? isLoadingFlows
        : selectedCategory !== 'all'
          ? isLoadingCategory
          : isLoading;

  const handleMarkAsProcessed = (eventId: number, hasHandler: boolean = false) => {
    markAsProcessedMutation.mutate({ id: eventId, handlerExists: hasHandler });
  };

  const filteredEvents = displayEvents?.filter((event: Record<string, unknown>) => {
    const eventType = ((event.eventType as string) || '').toLowerCase();
    const subType = ((event.subType as string) || '').toLowerCase();
    const eventId = ((event.eventId as string) || '').toLowerCase();
    const phone = ((event.phoneNumber as string) || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return eventType.includes(q) || subType.includes(q) || eventId.includes(q) || phone.includes(q);
  });
  const visibleEvents = filteredEvents?.slice(0, visibleEventCount);

  const categories = [
    { value: 'all', label: 'جميع الفئات', icon: BarChart3 },
    { value: 'messages', label: 'الرسائل', icon: MessageSquare },
    { value: 'templates', label: 'القوالب', icon: FileText },
    { value: 'template_status', label: 'حالة القوالب', icon: FileText },
    { value: 'account', label: 'الحساب', icon: Shield },
    { value: 'security', label: 'الأمان', icon: AlertTriangle },
    { value: 'quality', label: 'الجودة', icon: TrendingUp },
    { value: 'subscriptions', label: 'الاشتراكات', icon: Users },
    { value: 'flows', label: 'النماذج التفاعلية', icon: Zap },
  ];

  const totalEvents = statsByType?.reduce((sum, stat) => sum + (stat.count || 0), 0) || 0;
  const processedEvents =
    displayEvents?.filter((e: Record<string, unknown>) => Boolean(e.processed)).length || 0;

  if (arePermissionsLoading) {
    return (
      <div className="container mx-auto p-6 text-sm text-muted-foreground" dir="rtl">
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (!canViewWebhookLogs) {
    return (
      <div className="container mx-auto space-y-4 p-6" dir="rtl">
        <h1 className="text-2xl font-bold text-foreground">فاحص أحداث Webhook</h1>
        <PermissionHint
          label="الوصول إلى السجل مقيّد"
          message="تحتاج إلى صلاحية عرض سجلات التكاملات للاطلاع على أحداث Webhook."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-0 py-4 sm:px-4 sm:py-6" dir="rtl">
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
            فاحص أحداث Webhook
          </h1>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            اكتشاف وتحليل أحداث WhatsApp الجديدة من Meta
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {Boolean(unhandledCount && unhandledCount > 0) && (
            <Badge className="bg-red-500 text-white text-lg px-3 py-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {unhandledCount} أحداث جديدة
            </Badge>
          )}
          {(operationsSse?.liveEventCount ?? liveEventCount) > 0 && (
            <Badge className="bg-green-500 text-white gap-1 animate-pulse">
              <Zap className="h-3 w-3" />
              {operationsSse?.liveEventCount ?? liveEventCount} حدث مباشر
            </Badge>
          )}
          {Boolean(operationsSse?.lastLiveEvent ?? lastLiveEvent) && (
            <span className="text-xs text-green-600 font-medium">
              آخر حدث: {operationsSse?.lastLiveEvent ?? lastLiveEvent}
            </span>
          )}
          <Button onClick={handleRefresh} variant="outline" className="h-9 gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="sgh-compact-stat-grid mb-5 grid grid-cols-2 sm:mb-6 lg:grid-cols-4"
        aria-label="ملخص تشخيص Webhook واتساب"
      >
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
                <p className="text-sm text-gray-600">حقول بلا مسار</p>
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
                <p className="text-sm text-gray-600">تمت مراجعته</p>
                <p className="text-2xl font-bold text-green-600">{processedEvents}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">تصفية حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  className="h-9 gap-1.5 px-2.5 text-xs sm:gap-2 sm:px-3 sm:text-sm"
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setVisibleEventCount(25);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
          {selectedCategory === 'templates' && (
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
      {Boolean(statsByType && statsByType.length > 0) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">إحصائيات الأحداث حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statsByType!
                .slice()
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
      {Boolean(statsByType && statsByType.length > 0) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">أنواع الأحداث المكتشفة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statsByType!.map((type) => (
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setVisibleEventCount(25);
          }}
          className="pr-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="-mx-1 mb-4 overflow-x-auto pb-1">
          <TabsList className="h-10 w-max min-w-max">
            <TabsTrigger value="all">جميع الأحداث</TabsTrigger>
            <TabsTrigger value="unhandled">
              حقول بلا مسار
              {Boolean(unhandledCount && unhandledCount > 0) && (
                <span className="mr-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                  {unhandledCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="template_status">
              حالة القوالب
              {(operationsSse?.liveEventCount ?? liveEventCount) > 0 && (
                <span className="mr-2 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">
                  {operationsSse?.liveEventCount ?? liveEventCount} مباشر
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>سجل الأحداث</CardTitle>
              <CardDescription>الأحداث الواردة من Meta (محفوظة تلقائياً)</CardDescription>
            </CardHeader>
            <CardContent>
              {displayLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : visibleEvents && visibleEvents.length > 0 ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {visibleEvents.map((event: Record<string, unknown>) => (
                    <div
                      key={event.id as number}
                      className={`rounded-xl border p-3 sm:p-4 ${
                        !event.handlerExists ? 'bg-red-50 border-red-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm sm:text-base">
                              {event.eventType as string}
                            </h4>
                            {Boolean(event.subType) && (
                              <Badge variant="outline">{event.subType as string}</Badge>
                            )}
                            {!event.handlerExists && (
                              <Badge className="bg-red-500 text-white gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                لا يوجد معالج
                              </Badge>
                            )}
                            {Boolean(event.processed) && (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                تمت المراجعة
                              </Badge>
                            )}
                            {Boolean(event.handlerExists) && !event.processed && (
                              <Badge variant="outline" className="border-blue-200 text-blue-700">
                                معالج متاح
                              </Badge>
                            )}
                          </div>

                          <div className="mt-2 text-xs text-gray-600 sm:text-sm">
                            <p className="truncate">
                              <span className="font-semibold">التاريخ:</span>{' '}
                              {new Date(event.createdAt as string | Date).toLocaleString('ar-SA')}
                            </p>
                            {Boolean(event.phoneNumber) && (
                              <p className="truncate">
                                <span className="font-semibold">الرقم:</span>{' '}
                                {event.phoneNumber as string}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row gap-2 sm:mr-4 sm:flex-col">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                                onClick={() =>
                                  setSelectedEvent(
                                    event as {
                                      id: number;
                                      eventType: string;
                                      subType?: string | null;
                                      phoneNumber?: string | null;
                                      createdAt: string | Date;
                                      processed: boolean;
                                      handlerExists: boolean;
                                    }
                                  )
                                }
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                عرض
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] w-[calc(100vw-2rem)] max-w-3xl overflow-auto sm:w-full">
                              <DialogHeader>
                                <DialogTitle>تفاصيل الحدث: {event.eventType as string}</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                  <div>
                                    <p className="text-sm font-semibold">النوع:</p>
                                    <p>{event.eventType as string}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">النوع الفرعي:</p>
                                    <p>{(event.subType as string) || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">رقم الهاتف:</p>
                                    <p>{(event.phoneNumber as string) || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">التاريخ:</p>
                                    <p>
                                      {new Date(event.createdAt as string | Date).toLocaleString(
                                        'ar-SA'
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                  تعرض هذه الصفحة ملخص الحدث فقط لحماية بيانات الرسائل الواردة
                                  وحمولة Webhook الخام.
                                </p>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {!event.processed && canManageWebhooks && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-xs text-green-600 hover:bg-green-50 sm:h-9 sm:px-3 sm:text-sm"
                                onClick={() => handleMarkAsProcessed(event.id as number, true)}
                                disabled={markAsProcessedMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                يوجد معالج
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:bg-orange-50"
                                onClick={() => handleMarkAsProcessed(event.id as number, false)}
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
                  {filteredEvents && filteredEvents.length > visibleEventCount && (
                    <div className="flex flex-col items-center gap-2 border-t border-dashed pt-4 sm:flex-row sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        يُعرض {visibleEvents.length} من {filteredEvents.length} حدث
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setVisibleEventCount((count) =>
                            Math.min(count + 25, filteredEvents.length)
                          )
                        }
                      >
                        عرض 25 حدثاً إضافياً
                      </Button>
                    </div>
                  )}
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
