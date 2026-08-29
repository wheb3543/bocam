import { useState, useCallback } from 'react';
import { trpc } from '@/lib/api/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import type { ReactNode } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWhatsAppSSE, AccountUpdateEvent } from '@/hooks/integrations/useWhatsAppSSE';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { PermissionHint } from '@/components/PermissionHint';

export default function WhatsAppUserSubscriptionsPage() {
  const { can, isLoading: permissionsLoading } = useRolePermissions();
  const canViewConsents = can('communications.consents.view');
  const canManageConsents = can('communications.consents.manage');
  const canViewWebhookLogs = can('integrations.logs.view');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [optInType, setOptInType] = useState<'general' | 'marketing'>('general');

  const {
    data: subscriptions,
    isLoading,
    refetch,
  } = trpc.whatsapp.userSubscriptions.getAll.useQuery(
    { optInType, limit: 100 },
    { enabled: canViewConsents, refetchInterval: 30000 }
  );

  const { data: stats, refetch: refetchStats } = trpc.whatsapp.userSubscriptions.getStats.useQuery(
    undefined,
    { enabled: canViewConsents, refetchInterval: 30000 }
  );

  const {
    data: subscriptionWebhookEvents,
    isLoading: webhookLoading,
    refetch: refetchWebhook,
  } = trpc.whatsapp.webhookEvents.getEventsByCategory.useQuery(
    { category: 'subscriptions', limit: 50 },
    { enabled: canViewConsents && canViewWebhookLogs, refetchInterval: 30000 }
  );

  // SSE: تحديث فوري عند وصول أحداث الحساب الجديدة
  useWhatsAppSSE({
    enabled: canViewConsents && canViewWebhookLogs,
    onAccountUpdate: useCallback(
      (event: AccountUpdateEvent) => {
        toast.info(`تحديث الحساب: ${event.eventType}`);
        refetch();
        refetchStats();
        refetchWebhook();
      },
      [refetch, refetchStats, refetchWebhook]
    ),
  });

  const updateStatusMutation = trpc.whatsapp.userSubscriptions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث حالة الاشتراك');
      refetch();
      refetchStats();
    },
    onError: () => {
      toast.error('فشل تحديث حالة الاشتراك');
    },
  });

  const handleRefresh = () => {
    if (!canViewConsents) {
      toast.error('لا تملك صلاحية عرض اشتراكات WhatsApp');
      return;
    }
    refetch();
    refetchStats();
    refetchWebhook();
    toast.success('تم تحديث البيانات');
  };

  const handleUpdateStatus = (phone: string, status: 'opted_in' | 'opted_out') => {
    if (!canManageConsents) {
      toast.error('لا تملك صلاحية تعديل اشتراكات WhatsApp');
      return;
    }
    updateStatusMutation.mutate({
      phoneNumber: phone,
      status,
      optInType,
      source: 'manual',
    });
  };

  const filteredSubscriptions = Array.isArray(subscriptions)
    ? subscriptions.filter((sub: Record<string, unknown>) => {
        const matchesSearch =
          (sub.phoneNumber as string).includes(searchTerm) ||
          (sub.details && JSON.parse(sub.details as string).name?.includes(searchTerm));
        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'opted_in' && sub.status === 'opted_in') ||
          (activeTab === 'opted_out' && sub.status === 'opted_out');
        return matchesSearch && matchesTab;
      })
    : [];

  if (permissionsLoading) {
    return <div className="container mx-auto py-6 px-4" dir="rtl" />;
  }

  if (!canViewConsents) {
    return (
      <div className="container mx-auto py-6 px-4" dir="rtl">
        <PermissionHint
          message="تحتاج إلى صلاحية عرض موافقات واشتراكات WhatsApp للوصول إلى هذه الصفحة."
          label="الوصول إلى الاشتراكات مقيّد"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">اشتراكات المستخدمين</h1>
          <p className="text-gray-600 mt-1">
            إدارة اشتراكات المستخدمين في WhatsApp (Opt-in/Opt-out)
          </p>
          {!canManageConsents && (
            <PermissionHint
              message="يمكنك العرض فقط؛ يتطلب تغيير Opt-in/Opt-out صلاحية إدارة موافقات WhatsApp."
              label="تعديلات الاشتراك مقيّدة"
              className="mt-2"
            />
          )}
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2" disabled={isLoading}>
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مشتركين عام</p>
                <p className="text-2xl font-bold text-green-600">{stats?.general.optedIn || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">غير مشتركين عام</p>
                <p className="text-2xl font-bold text-red-600">{stats?.general.optedOut || 0}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مشتركين تسويقي</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.marketing.optedIn || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">غير مشتركين تسويقي</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.marketing.optedOut || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث برقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={optInType === 'general' ? 'default' : 'outline'}
            onClick={() => setOptInType('general')}
          >
            عام
          </Button>
          <Button
            variant={optInType === 'marketing' ? 'default' : 'outline'}
            onClick={() => setOptInType('marketing')}
          >
            تسويقي
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="opted_in">مشتركين</TabsTrigger>
          <TabsTrigger value="opted_out">غير مشتركين</TabsTrigger>
          {canViewWebhookLogs && <TabsTrigger value="webhook-events">أحداث Webhook</TabsTrigger>}
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>قائمة الاشتراكات</CardTitle>
              <CardDescription>
                {optInType === 'general' ? 'اشتراكات عامة' : 'اشتراكات تسويقية'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : filteredSubscriptions && filteredSubscriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">رقم الهاتف</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">المصدر</th>
                        <th className="text-right py-3 px-4">تاريخ التحديث</th>
                        <th className="text-right py-3 px-4">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscriptions.map((sub: Record<string, unknown>) => (
                        <tr key={sub.id as string} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono">{sub.phoneNumber as string}</td>
                          <td className="py-3 px-4">
                            {sub.status === 'opted_in' ? (
                              <Badge className="bg-green-500 text-white gap-1">
                                <CheckCircle className="h-3 w-3" />
                                مشترك
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500 text-white gap-1">
                                <XCircle className="h-3 w-3" />
                                غير مشترك
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">{sub.source as ReactNode}</td>
                          <td className="py-3 px-4">
                            {new Date(sub.updatedAt as string | number | Date).toLocaleString(
                              'ar-SA'
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {sub.status === 'opted_in' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleUpdateStatus(sub.phoneNumber as string, 'opted_out')
                                }
                                disabled={!canManageConsents || updateStatusMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                إلغاء الاشتراك
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() =>
                                  handleUpdateStatus(sub.phoneNumber as string, 'opted_in')
                                }
                                disabled={!canManageConsents || updateStatusMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                اشتراك
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2" />
                  <p>لا توجد اشتراكات متطابقة مع البحث</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canViewWebhookLogs && (
          <TabsContent value="webhook-events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  أحداث Webhook للاشتراكات
                </CardTitle>
                <CardDescription>ملخصات آمنة لأحداث الاشتراك الواردة من Meta</CardDescription>
              </CardHeader>
              <CardContent>
                {webhookLoading ? (
                  <div className="text-center py-8">جاري التحميل...</div>
                ) : subscriptionWebhookEvents && subscriptionWebhookEvents.length > 0 ? (
                  <div className="space-y-3">
                    {subscriptionWebhookEvents.map((event: Record<string, unknown>) => (
                      <div key={event.id as string} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{event.eventType as ReactNode}</h4>
                              {(event.subType as string) && (
                                <Badge variant="outline">{event.subType as string}</Badge>
                              )}
                            </div>
                            {(event.phoneNumber as string) && (
                              <p className="text-sm text-gray-600 mt-1">
                                الرقم: {event.phoneNumber as string}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(event.createdAt as string | number | Date).toLocaleString(
                                'ar-SA'
                              )}
                            </p>
                          </div>
                          <Badge className={event.handlerExists ? 'bg-green-500' : 'bg-red-500'}>
                            {event.handlerExists ? 'معالج' : 'غير معالج'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2" />
                    <p>لا توجد أحداث اشتراك حالياً</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
