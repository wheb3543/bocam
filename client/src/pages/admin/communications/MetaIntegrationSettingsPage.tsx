import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/api/trpc';
import {
  CheckCircle2,
  Clipboard,
  DatabaseZap,
  ExternalLink,
  KeyRound,
  Loader2,
  LockKeyhole,
  Music2,
  Save,
  ShieldAlert,
  Trash2,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';

type MetaForm = {
  appId: string;
  facebookPageId: string;
  instagramAccountId: string;
  appSecret: string;
  verifyToken: string;
  pageAccessToken: string;
  isEnabled: boolean;
};

type MetaTestSeedResult = {
  normalized: number;
  processed: number;
};

type MetaTestClearResult = {
  items?: number;
};

type MutationError = {
  message: string;
};

type ExternalPlatform = 'x' | 'linkedin' | 'youtube' | 'tiktok';

type ExternalPlatformStatus = {
  platform: ExternalPlatform;
  label: string;
  clientId: string | null;
  requestedScopes: string;
  isEnabled: boolean;
  configured: boolean;
  hasClientSecret: boolean;
  connectionStatus: string;
  lastError: string | null;
  updatedAt: Date | string | null;
};

const initialForm: MetaForm = {
  appId: '',
  facebookPageId: '',
  instagramAccountId: '',
  appSecret: '',
  verifyToken: '',
  pageAccessToken: '',
  isEnabled: false,
};

export default function MetaIntegrationSettingsPage() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [form, setForm] = useState<MetaForm>(initialForm);
  const [callbackUrl, setCallbackUrl] = useState('');
  const isAdmin = user?.role === 'admin';
  const statusQuery = trpc.metaIntegration.status.useQuery(undefined, { enabled: isAdmin });
  const generalStatusQuery = trpc.generalIntegrations.status.useQuery(undefined, {
    enabled: isAdmin,
  });
  const saveMutation = trpc.metaIntegration.save.useMutation({
    onSuccess: async () => {
      setForm((current) => ({ ...current, appSecret: '', verifyToken: '', pageAccessToken: '' }));
      await utils.metaIntegration.status.invalidate();
      toast.success('تم حفظ إعدادات Meta بصورة مشفّرة');
    },
    onError: (error) => toast.error(error.message),
  });
  const seedTestDataMutation = trpc.socialInbox.seedMetaTestData.useMutation({
    onSuccess: async (result: MetaTestSeedResult) => {
      await Promise.all([
        utils.socialInbox.accounts.invalidate(),
        utils.socialInbox.stats.invalidate(),
        utils.socialInbox.threads.invalidate(),
      ]);
      toast.success(`تمت معالجة ${result.normalized} حمولة اختبارية؛ الناجح: ${result.processed}`);
    },
    onError: (error: MutationError) => toast.error(error.message),
  });
  const clearTestDataMutation = trpc.socialInbox.clearMetaTestData.useMutation({
    onSuccess: async (result: MetaTestClearResult) => {
      await Promise.all([
        utils.socialInbox.accounts.invalidate(),
        utils.socialInbox.stats.invalidate(),
        utils.socialInbox.threads.invalidate(),
      ]);
      toast.success(`تم تنظيف بيانات اختبار Meta: ${result.items ?? 0} عنصر`);
    },
    onError: (error: MutationError) => toast.error(error.message),
  });

  useEffect(() => {
    setCallbackUrl(`${window.location.origin}/api/webhooks/meta-social-inbox`);
  }, []);

  useEffect(() => {
    if (!statusQuery.data) {
      return;
    }
    setForm((current) => ({
      ...current,
      appId: statusQuery.data.appId ?? '',
      facebookPageId: statusQuery.data.facebookPageId ?? '',
      instagramAccountId: statusQuery.data.instagramAccountId ?? '',
      isEnabled: statusQuery.data.isEnabled,
    }));
  }, [statusQuery.data]);

  const secretStatus = useMemo<Array<[string, boolean]>>(
    () => [
      ['App Secret', Boolean(statusQuery.data?.hasAppSecret)],
      ['Verify Token', Boolean(statusQuery.data?.hasVerifyToken)],
      ['Page Access Token', Boolean(statusQuery.data?.hasPageAccessToken)],
    ],
    [statusQuery.data]
  );

  const update = (field: keyof MetaForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const copyCallbackUrl = async () => {
    await navigator.clipboard.writeText(callbackUrl);
    toast.success('تم نسخ رابط Callback URL');
  };

  const save = () => {
    saveMutation.mutate({
      appId: form.appId || undefined,
      facebookPageId: form.facebookPageId || undefined,
      instagramAccountId: form.instagramAccountId || undefined,
      appSecret: form.appSecret || undefined,
      verifyToken: form.verifyToken || undefined,
      pageAccessToken: form.pageAccessToken || undefined,
      isEnabled: form.isEnabled,
    });
  };

  const clearTestData = () => {
    if (
      window.confirm(
        'سيُحذف فقط كل ما يحمل بادئة sgh-meta-test- من حسابات وعناصر اختبار Meta. هل تريد المتابعة؟'
      )
    ) {
      clearTestDataMutation.mutate();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout
        pageTitle="إعدادات الربط العامة"
        pageDescription="إدارة اتصالات منصات التواصل بأمان"
      >
        <Alert dir="rtl" className="mx-auto mt-8 max-w-2xl border-amber-200 bg-amber-50">
          <ShieldAlert className="h-4 w-4 text-amber-700" />
          <AlertTitle>صلاحية المسؤول مطلوبة</AlertTitle>
          <AlertDescription>
            تُدار أسرار Meta من قبل المسؤول فقط لحماية حسابات المؤسسة.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="إعدادات الربط العامة"
      pageDescription="إدارة ربط Meta وX وLinkedIn وYouTube وTikTok من مكان واحد"
    >
      <main dir="rtl" className="container max-w-5xl space-y-5 py-5 sm:py-8">
        <section className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-3 text-white">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">إعدادات الربط العامة</h1>
              <p className="mt-1 text-sm text-slate-600">
                بيانات تطبيقات Meta وX وLinkedIn وYouTube وTikTok تُدار مركزياً وبصلاحيات المسؤول.
              </p>
            </div>
          </div>
          <Badge className={statusQuery.data?.isEnabled ? 'bg-emerald-600' : 'bg-slate-500'}>
            {statusQuery.data?.isEnabled || generalStatusQuery.data?.some((item) => item.isEnabled)
              ? 'توجد تكاملات مفعّلة'
              : 'لا توجد تكاملات مفعّلة'}
          </Badge>
        </section>

        <Alert className="border-blue-200 bg-blue-50/70">
          <LockKeyhole className="h-4 w-4 text-blue-700" />
          <AlertTitle>حماية الأسرار</AlertTitle>
          <AlertDescription>
            لا تُعرض قيم App Secret أو Verify Token أو Page Access Token بعد الحفظ. تُخزّن مشفّرة
            على الخادم، ويمكنك استبدالها بإدخال قيمة جديدة.
          </AlertDescription>
        </Alert>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <KeyRound className="h-5 w-5 text-blue-700" />
              ربط منصات النشر الخارجية
            </CardTitle>
            <CardDescription>
              احفظ Client ID وClient Secret لكل منصة. يُشفّر Client Secret على الخادم ولا يعاد إلى
              المتصفح بعد الحفظ. عند اكتمال الحقول وتفعيل المنصة تصبح جاهزة لبدء OAuth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generalStatusQuery.isLoading ? (
              <div className="flex min-h-32 items-center justify-center text-sm text-slate-500">
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />
                جارٍ تحميل حالات المنصات...
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {(generalStatusQuery.data ?? []).map((platform) => (
                  <ExternalIntegrationCard key={platform.platform} status={platform} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-950">
              <DatabaseZap className="h-5 w-5 text-amber-700" />
              تجربة حمولات Meta الرسمية
            </CardTitle>
            <CardDescription>
              تُنشئ رسائل Messenger وInstagram وتعليقات Facebook وInstagram اصطناعية وموسومة
              <strong className="mx-1">بيانات اختبار Meta — قابلة للحذف</strong>
              داخل صندوق البريد، ثم تُشغّل عليها منطق التطبيع والتخزين نفسه المستخدم في Webhook.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => seedTestDataMutation.mutate()}
              disabled={seedTestDataMutation.isPending}
            >
              {seedTestDataMutation.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <DatabaseZap className="ml-2 h-4 w-4" />
              )}
              إدخال بيانات الاختبار
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              onClick={clearTestData}
              disabled={clearTestDataMutation.isPending}
            >
              {clearTestDataMutation.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="ml-2 h-4 w-4" />
              )}
              تنظيف بيانات الاختبار
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>بيانات التطبيق والحسابات</CardTitle>
              <CardDescription>
                أدخل المعرفات من لوحة تطبيق Meta والحسابات الاحترافية المرتبطة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="App ID"
                value={form.appId}
                onChange={(value) => update('appId', value)}
                placeholder="معرف تطبيق Meta"
              />
              <FormField
                label="Facebook Page ID"
                value={form.facebookPageId}
                onChange={(value) => update('facebookPageId', value)}
                placeholder="معرف صفحة Facebook"
              />
              <FormField
                label="Instagram Professional Account ID"
                value={form.instagramAccountId}
                onChange={(value) => update('instagramAccountId', value)}
                placeholder="معرف حساب Instagram الاحترافي"
              />
              <div className="border-t pt-4" />
              <FormField
                label="App Secret"
                value={form.appSecret}
                onChange={(value) => update('appSecret', value)}
                placeholder={
                  statusQuery.data?.hasAppSecret
                    ? 'محفوظ؛ اتركه فارغاً للاحتفاظ به'
                    : 'ألصق App Secret'
                }
                secret
              />
              <FormField
                label="Verify Token"
                value={form.verifyToken}
                onChange={(value) => update('verifyToken', value)}
                placeholder={
                  statusQuery.data?.hasVerifyToken
                    ? 'محفوظ؛ اتركه فارغاً للاحتفاظ به'
                    : 'أدخل رمز تحقق عشوائياً'
                }
                secret
              />
              <FormField
                label="Page Access Token"
                value={form.pageAccessToken}
                onChange={(value) => update('pageAccessToken', value)}
                placeholder={
                  statusQuery.data?.hasPageAccessToken
                    ? 'محفوظ؛ اتركه فارغاً للاحتفاظ به'
                    : 'اختياري الآن؛ مطلوب للاشتراك والردود'
                }
                secret
              />
              <label className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3 text-sm">
                <span>
                  <strong className="block text-slate-900">تفعيل Webhook</strong>
                  <span className="text-slate-500">
                    لن يُفعّل قبل وجود App Secret وVerify Token.
                  </span>
                </span>
                <input
                  aria-label="تفعيل Webhook Meta"
                  type="checkbox"
                  checked={form.isEnabled}
                  onChange={(event) => update('isEnabled', event.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
              </label>
              <Button
                onClick={save}
                disabled={saveMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                )}
                حفظ إعدادات الربط
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">حالة الحماية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {secretStatus.map(([label, configured]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <Badge
                      variant={configured ? 'default' : 'secondary'}
                      className={configured ? 'bg-emerald-600' : ''}
                    >
                      {configured ? 'محفوظ ومشفّر' : 'غير مهيأ'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Callback URL</CardTitle>
                <CardDescription>ضعه في إعدادات Webhooks بتطبيق Meta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <code
                  className="block break-all rounded-lg bg-slate-950 p-3 text-xs text-slate-100"
                  dir="ltr"
                >
                  {callbackUrl || 'جارٍ تحضير الرابط...'}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={copyCallbackUrl}
                  disabled={!callbackUrl}
                >
                  <Clipboard className="ml-2 h-4 w-4" />
                  نسخ الرابط
                </Button>
                <a
                  href="https://developers.facebook.com/docs/graph-api/webhooks/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-blue-700 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  وثائق Meta الرسمية
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  secret = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  secret?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      <Input
        type={secret ? 'password' : 'text'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={secret ? 'new-password' : 'off'}
        dir="ltr"
      />
    </label>
  );
}

const externalPlatformPresentation: Record<
  ExternalPlatform,
  { description: string; docsUrl: string; Icon: typeof KeyRound }
> = {
  x: {
    description: 'النشر على X وإدارة وسائط المنشورات عبر واجهة X API v2.',
    docsUrl: 'https://docs.x.com/x-api',
    Icon: ExternalLink,
  },
  linkedin: {
    description: 'نشر محتوى الأعضاء والمنظمات عبر LinkedIn Marketing APIs.',
    docsUrl: 'https://learn.microsoft.com/linkedin/',
    Icon: KeyRound,
  },
  youtube: {
    description: 'رفع الفيديوهات وإدارة القنوات عبر YouTube Data API.',
    docsUrl: 'https://developers.google.com/youtube/v3',
    Icon: Video,
  },
  tiktok: {
    description: 'نشر الفيديوهات وإدارة الصلاحيات عبر TikTok for Developers.',
    docsUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started/',
    Icon: Music2,
  },
};

function ExternalIntegrationCard({ status }: { status: ExternalPlatformStatus }) {
  const utils = trpc.useUtils();
  const [clientId, setClientId] = useState(status.clientId ?? '');
  const [clientSecret, setClientSecret] = useState('');
  const [requestedScopes, setRequestedScopes] = useState(status.requestedScopes);
  const [isEnabled, setIsEnabled] = useState(status.isEnabled);
  const presentation = externalPlatformPresentation[status.platform];
  const Icon = presentation.Icon;
  const saveMutation = trpc.generalIntegrations.save.useMutation({
    onSuccess: async () => {
      setClientSecret('');
      await utils.generalIntegrations.status.invalidate();
      toast.success(`تم حفظ إعدادات ${status.label} بصورة آمنة`);
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    setClientId(status.clientId ?? '');
    setRequestedScopes(status.requestedScopes);
    setIsEnabled(status.isEnabled);
  }, [status.clientId, status.isEnabled, status.requestedScopes]);

  const savePlatform = () => {
    saveMutation.mutate({
      platform: status.platform,
      clientId: clientId || undefined,
      clientSecret: clientSecret || undefined,
      requestedScopes: requestedScopes || undefined,
      isEnabled,
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">{status.label}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">{presentation.description}</p>
          </div>
        </div>
        <Badge
          className={
            status.connectionStatus === 'ready_for_oauth' ? 'bg-emerald-600' : 'bg-slate-500'
          }
        >
          {status.connectionStatus === 'ready_for_oauth' ? 'جاهز لـ OAuth' : 'غير مهيأ'}
        </Badge>
      </div>

      <div className="space-y-3">
        <FormField
          label="Client ID"
          value={clientId}
          onChange={setClientId}
          placeholder="المعرّف من لوحة المطورين"
        />
        <FormField
          label="Client Secret"
          value={clientSecret}
          onChange={setClientSecret}
          placeholder={
            status.hasClientSecret
              ? 'محفوظ ومشفّر؛ اتركه فارغاً للاحتفاظ به'
              : 'ألصق السر مرة واحدة'
          }
          secret
        />
        <FormField
          label="OAuth Scopes المطلوبة"
          value={requestedScopes}
          onChange={setRequestedScopes}
          placeholder="الصلاحيات المطلوبة، مفصولة بمسافات"
        />
        <label className="flex items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-sm">
          <span>
            <strong className="block text-slate-900">تفعيل المنصة</strong>
            <span className="text-xs text-slate-500">
              يلزم Client ID وClient Secret لتصبح جاهزة للربط.
            </span>
          </span>
          <input
            aria-label={`تفعيل ${status.label}`}
            type="checkbox"
            checked={isEnabled}
            onChange={(event) => setIsEnabled(event.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
        </label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={savePlatform}
            disabled={saveMutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {saveMutation.isPending ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            حفظ
          </Button>
          <a
            href={presentation.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-blue-700 hover:underline"
          >
            الوثائق الرسمية
          </a>
        </div>
      </div>
    </section>
  );
}
