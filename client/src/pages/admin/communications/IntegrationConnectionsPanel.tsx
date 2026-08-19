import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/api/trpc';
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Unplug,
  WandSparkles,
} from 'lucide-react';
import { toast } from 'sonner';

type FacebookSdk = {
  init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
  login: (
    callback: (response: { authResponse?: { code?: string } }) => void,
    options: Record<string, string | boolean>
  ) => void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

let facebookSdkPromise: Promise<FacebookSdk> | null = null;

function loadFacebookSdk() {
  if (window.FB) {
    return Promise.resolve(window.FB);
  }
  if (facebookSdkPromise) {
    return facebookSdkPromise;
  }

  facebookSdkPromise = new Promise<FacebookSdk>((resolve, reject) => {
    const existing = document.getElementById('facebook-jssdk') as HTMLScriptElement | null;
    const timeout = window.setTimeout(() => reject(new Error('تعذر تحميل Facebook SDK.')), 15000);
    window.fbAsyncInit = () => {
      if (window.FB) {
        window.clearTimeout(timeout);
        resolve(window.FB);
      }
    };
    if (existing) {
      return;
    }
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error('تعذر تحميل Facebook SDK.'));
    };
    document.head.appendChild(script);
  });
  return facebookSdkPromise;
}

function connectionStatus(status: string) {
  const labels: Record<string, string> = {
    authorization_pending: 'بانتظار التفويض',
    connected: 'متصل',
    reauthorization_required: 'يتطلب إعادة تفويض',
    expired: 'انتهت الصلاحية',
    revoked: 'أُلغي',
    error: 'بحاجة إلى مراجعة',
    disconnected: 'غير متصل',
    draft: 'مسودة',
  };
  return labels[status] ?? status;
}

function assetLabel(type: string) {
  const labels: Record<string, string> = {
    business_portfolio: 'ملف الأعمال',
    page: 'صفحة Facebook',
    instagram_account: 'حساب Instagram',
    whatsapp_business_account: 'حساب WhatsApp Business',
    whatsapp_phone_number: 'رقم WhatsApp',
    ad_account: 'حساب إعلاني',
    pixel: 'Pixel',
    dataset: 'Dataset',
    profile: 'حساب',
    organization: 'منظمة',
    channel: 'قناة',
  };
  return labels[type] ?? type;
}

export function IntegrationConnectionsPanel() {
  const utils = trpc.useUtils();
  const overviewQuery = trpc.integrationConnections.overview.useQuery();
  const startMetaMutation = trpc.integrationConnections.startMetaBusiness.useMutation({
    onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl),
    onError: (error) => toast.error(error.message),
  });
  const completeWhatsAppMutation =
    trpc.integrationConnections.completeWhatsAppEmbeddedSignup.useMutation({
      onSuccess: async () => {
        await utils.integrationConnections.overview.invalidate();
        toast.success('تم حفظ اتصال WhatsApp Business والأصول العائدة بصورة مشفّرة.');
      },
      onError: (error) => toast.error(error.message),
    });
  const startWhatsAppMutation = trpc.integrationConnections.startWhatsAppEmbeddedSignup.useMutation(
    {
      onError: (error) => toast.error(error.message),
    }
  );
  const selectAssetMutation = trpc.integrationConnections.setAssetSelected.useMutation({
    onSuccess: () => utils.integrationConnections.overview.invalidate(),
    onError: (error) => toast.error(error.message),
  });
  const disconnectMutation = trpc.integrationConnections.disconnect.useMutation({
    onSuccess: async () => {
      await utils.integrationConnections.overview.invalidate();
      toast.success('تم إلغاء الربط وإبطال استخدام الاتصال داخل البوابة.');
    },
    onError: (error) => toast.error(error.message),
  });

  const launchWhatsAppEmbeddedSignup = async () => {
    try {
      const session = await startWhatsAppMutation.mutateAsync();
      const sdk = await loadFacebookSdk();
      sdk.init({
        appId: session.appId,
        cookie: true,
        xfbml: true,
        version: session.graphApiVersion,
      });

      let authorizationCode: string | null = null;
      let wabaId: string | null = null;
      let phoneNumberId: string | null = null;
      let settled = false;

      const cleanup = () => window.removeEventListener('message', onMessage);
      const completeIfReady = () => {
        if (settled || !authorizationCode || !wabaId || !phoneNumberId) {
          return;
        }
        settled = true;
        cleanup();
        completeWhatsAppMutation.mutate({
          code: authorizationCode,
          state: session.state,
          wabaId,
          phoneNumberId,
        });
      };
      const onMessage = (event: MessageEvent) => {
        if (!event.origin.endsWith('facebook.com')) {
          return;
        }
        try {
          const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (payload?.type !== 'WA_EMBEDDED_SIGNUP') {
            return;
          }
          if (payload.event === 'CANCEL' || payload.event === 'ERROR') {
            cleanup();
            toast.error('لم يكتمل ربط WhatsApp. يمكنك البدء من جديد عند جاهزية الحساب.');
            return;
          }
          wabaId = payload?.data?.waba_id ?? payload?.data?.waba_ids?.[0] ?? null;
          phoneNumberId = payload?.data?.phone_number_id ?? null;
          completeIfReady();
        } catch {
          // تجاهل الأحداث غير المهيكلة القادمة من النافذة الخارجية.
        }
      };
      window.addEventListener('message', onMessage);
      sdk.login(
        (response) => {
          authorizationCode = response.authResponse?.code ?? null;
          if (!authorizationCode) {
            cleanup();
            toast.error('لم تعِد Meta رمز التفويض. راجع إعدادات التكوين والصلاحيات.');
            return;
          }
          completeIfReady();
        },
        {
          config_id: session.configId,
          response_type: 'code',
          override_default_response_type: true,
          state: session.state,
        }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر بدء ربط WhatsApp Business.');
    }
  };

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <ShieldCheck className="h-5 w-5 text-blue-700" />
            الحسابات والأصول المتصلة
          </CardTitle>
          <CardDescription className="mt-1.5 max-w-3xl leading-6">
            تبدأ عمليات الربط من هنا. لا تظهر Access Tokens أو Client Secrets في البوابة؛ تُعرض فقط
            حالة التفويض والأصول والصلاحيات التشغيلية.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => overviewQuery.refetch()}
          disabled={overviewQuery.isFetching}
        >
          <RefreshCw className={`ml-2 h-4 w-4 ${overviewQuery.isFetching ? 'animate-spin' : ''}`} />
          تحديث الحالة
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Button
            type="button"
            className="h-auto min-h-12 bg-blue-600 px-4 py-3 hover:bg-blue-700"
            onClick={() => startMetaMutation.mutate()}
            disabled={startMetaMutation.isPending}
          >
            {startMetaMutation.isPending ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="ml-2 h-4 w-4" />
            )}
            ربط Meta Business والأصول
          </Button>
          <Button
            type="button"
            className="h-auto min-h-12 bg-emerald-600 px-4 py-3 hover:bg-emerald-700"
            onClick={launchWhatsAppEmbeddedSignup}
            disabled={startWhatsAppMutation.isPending || completeWhatsAppMutation.isPending}
          >
            {startWhatsAppMutation.isPending || completeWhatsAppMutation.isPending ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <WandSparkles className="ml-2 h-4 w-4" />
            )}
            ربط WhatsApp Business
          </Button>
        </div>

        <Alert className="border-slate-200 bg-slate-50">
          <ShieldCheck className="h-4 w-4 text-blue-700" />
          <AlertTitle>قبل البدء</AlertTitle>
          <AlertDescription>
            أدخل أولاً App ID وApp Secret ومعرف التكوين المناسب في قسم Meta أدناه، وسجل نطاق البوابة
            وCallback URL في لوحة Meta. سيتم طلب الصلاحيات والأصول من مالك أعمال Meta داخل نافذة
            رسمية.
          </AlertDescription>
        </Alert>

        {overviewQuery.isLoading ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-slate-500">
            <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />
            جارٍ تحميل الاتصالات...
          </div>
        ) : (overviewQuery.data ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-600">
            لا توجد اتصالات مفوضة بعد. احفظ إعدادات التطبيق، ثم ابدأ الربط المناسب أعلاه.
          </div>
        ) : (
          <div className="space-y-3">
            {(overviewQuery.data ?? []).map(
              ({ connection, assets, tokens, webhookSubscriptions }) => (
                <section
                  key={connection.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                          {connection.displayName || connection.provider}
                        </h3>
                        <Badge
                          className={
                            connection.status === 'connected' ? 'bg-emerald-600' : 'bg-slate-500'
                          }
                        >
                          {connectionStatus(connection.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {connection.provider} · {connection.connectionType} · صلاحيات محفوظة:{' '}
                        {connection.grantedScopes?.length ?? 0}
                      </p>
                      {connection.lastError ? (
                        <p className="mt-2 text-xs text-rose-700">{connection.lastError}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      onClick={() => {
                        if (window.confirm('هل تريد إلغاء هذا الربط؟ لن يحذف المحتوى الداخلي.')) {
                          disconnectMutation.mutate({ connectionId: connection.id });
                        }
                      }}
                      disabled={disconnectMutation.isPending}
                    >
                      <Unplug className="ml-2 h-4 w-4" />
                      إلغاء الربط
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-semibold text-slate-700">الأصول المتاحة</p>
                      {assets.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          لم تعد Meta أصولاً بعد، أو يلزم منح الصلاحيات المناسبة.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {assets.map((asset) => (
                            <label
                              key={asset.id}
                              className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-xs"
                            >
                              <span className="min-w-0">
                                <strong className="block truncate text-slate-800">
                                  {asset.displayName || asset.externalAssetId}
                                </strong>
                                <span className="text-slate-500">
                                  {assetLabel(asset.assetType)}
                                </span>
                              </span>
                              <Switch
                                checked={asset.isSelected}
                                onCheckedChange={(isSelected) =>
                                  selectAssetMutation.mutate({ assetId: asset.id, isSelected })
                                }
                                aria-label={`تحديد ${asset.displayName || asset.externalAssetId}`}
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-xs">
                      <p className="mb-2 font-semibold text-slate-700">صحة الاتصال</p>
                      <p className="text-slate-600">
                        توكنات محفوظة: {tokens.length}، دون عرض قيمها.
                      </p>
                      <p className="mt-1 text-slate-600">
                        اشتراكات Webhook: {webhookSubscriptions.length}
                      </p>
                      {webhookSubscriptions.map((subscription) => (
                        <div
                          key={subscription.id}
                          className="mt-2 rounded-md bg-white p-2 text-slate-600"
                        >
                          <span dir="ltr">{subscription.callbackPath}</span> — {subscription.status}
                        </div>
                      ))}
                      {connection.status === 'connected' ? (
                        <p className="mt-3 flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> الاتصال صالح للاستخدام في
                          الموصلات القادمة.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
