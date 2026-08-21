/**
 * Central license activation for a locally installed bocam instance.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle2,
  Hourglass,
  KeyRound,
  Loader2,
  RefreshCw,
  Server,
} from 'lucide-react';
import { toast } from 'sonner';

type PendingRequest = { requestId: number; expiresAt: string; status: 'pending' } | null;

export default function ActivationPage() {
  const [, navigate] = useLocation();
  const [pendingRequest, setPendingRequest] = useState<PendingRequest>(null);
  const [statusMessage, setStatusMessage] = useState('يتم تجهيز طلب الترخيص المركزي لهذه النسخة.');
  const automaticRequestStarted = useRef(false);
  const automaticCheckScheduled = useRef(false);

  const { data: licenseInfo, isLoading: checkingLicense } = trpc.license.getInfo.useQuery(
    undefined,
    {
      retry: false,
    }
  );
  const centralState = trpc.license.getCentralRequestState.useQuery(undefined, {
    enabled: !checkingLicense && !licenseInfo?.isValid,
    retry: false,
  });

  const requestMutation = trpc.license.requestCentralLicense.useMutation({
    onSuccess: (data) => {
      if (
        !data.success ||
        !('requestId' in data) ||
        !('expiresAt' in data) ||
        !('reused' in data)
      ) {
        const errorMessage = 'error' in data ? data.error : undefined;
        setStatusMessage(errorMessage || 'تعذر إرسال طلب الترخيص.');
        toast.error(errorMessage || 'تعذر إرسال طلب الترخيص');
        return;
      }
      setPendingRequest({
        requestId: data.requestId,
        expiresAt: data.expiresAt,
        status: 'pending',
      });
      setStatusMessage(
        data.reused
          ? 'يوجد طلب ترخيص معلق بالفعل لدى إدارة إيديا هب.'
          : 'تم إرسال طلب الترخيص إلى إدارة إيديا هب بانتظار المراجعة.'
      );
    },
    onError: (error) => {
      setStatusMessage(error.message || 'تعذر الاتصال بخدمة التراخيص المركزية.');
      toast.error(error.message || 'تعذر الاتصال بخدمة التراخيص المركزية');
    },
  });

  const statusMutation = trpc.license.checkCentralLicenseStatus.useMutation({
    onSuccess: (data) => {
      if (!data.success || !('status' in data) || !('message' in data)) {
        const errorMessage = 'error' in data ? data.error : undefined;
        setStatusMessage(errorMessage || 'تعذر التحقق من حالة الطلب.');
        toast.error(errorMessage || 'تعذر التحقق من حالة الطلب');
        return;
      }
      setStatusMessage(data.message);
      if (data.status === 'activated') {
        setPendingRequest(null);
        toast.success('تم اعتماد الترخيص والتحقق من توقيعه محلياً. سيُعاد تشغيل الواجهة الآن.');
        window.setTimeout(() => window.location.reload(), 1_500);
      } else if (
        data.status === 'rejected' ||
        data.status === 'expired' ||
        data.status === 'none'
      ) {
        setPendingRequest(null);
      }
    },
    onError: (error) => {
      setStatusMessage(error.message || 'تعذر التحقق من حالة الطلب.');
      toast.error(error.message || 'تعذر التحقق من حالة الطلب');
    },
  });
  const { mutate: requestCentralLicense, isPending: isRequestingCentralLicense } = requestMutation;
  const { mutate: checkCentralLicenseStatus, isPending: isCheckingCentralLicenseStatus } =
    statusMutation;

  useEffect(() => {
    if (licenseInfo?.isValid) {
      toast.success('الترخيص المحلي صالح بالفعل');
      navigate('/');
    }
  }, [licenseInfo?.isValid, navigate]);

  useEffect(() => {
    if (centralState.data?.pendingRequest) {
      setPendingRequest(centralState.data.pendingRequest);
    }
  }, [centralState.data?.pendingRequest]);

  const submitCentralRequest = useCallback(() => {
    requestCentralLicense({
      instanceName: `bocam – ${window.location.hostname || 'local-instance'}`,
      serverUrl: window.location.origin,
    });
  }, [requestCentralLicense]);

  useEffect(() => {
    if (
      automaticRequestStarted.current ||
      !centralState.data?.configured ||
      pendingRequest ||
      isRequestingCentralLicense
    ) {
      return;
    }
    automaticRequestStarted.current = true;
    submitCentralRequest();
  }, [
    centralState.data?.configured,
    isRequestingCentralLicense,
    pendingRequest,
    submitCentralRequest,
  ]);

  useEffect(() => {
    if (!pendingRequest || automaticCheckScheduled.current) {
      return;
    }
    automaticCheckScheduled.current = true;
    const timer = window.setTimeout(() => checkCentralLicenseStatus(), 60_000);
    return () => window.clearTimeout(timer);
  }, [checkCentralLicenseStatus, pendingRequest]);

  if (checkingLicense || centralState.isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white"
        dir="rtl"
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const centralConfigured = centralState.data?.configured === true;
  const isWaiting = Boolean(pendingRequest);
  const busy = isRequestingCentralLicense || isCheckingCentralLicenseStatus;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 shadow-lg">
            {isWaiting ? (
              <Hourglass className="h-8 w-8 text-white" />
            ) : (
              <KeyRound className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">تفعيل ترخيص bocam</CardTitle>
          <CardDescription className="text-base leading-7">
            تُرسل هذه النسخة طلباً آمناً إلى إيديا هب، ثم يُحفظ الترخيص الموقّع محلياً بعد اعتماده.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!centralConfigured ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" /> اتصال إيديا هب غير مُعد
              </div>
              على مسؤول النظام ضبط متغيري <code className="font-mono">IDEA_HUB_URL</code> و
              <code className="font-mono">IDEA_HUB_SYSTEM_ID</code> ثم إعادة تشغيل الخادم المحلي.
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <Server className="h-4 w-4" /> حالة الترخيص المركزي
                </div>
                <p className="leading-6">{statusMessage}</p>
                {pendingRequest && (
                  <p className="mt-2 text-xs text-blue-800">
                    رقم الطلب: #{pendingRequest.requestId} — ينتهي الرمز في{' '}
                    {new Date(pendingRequest.expiresAt).toLocaleString('ar-SA')}
                  </p>
                )}
              </div>
              {isWaiting ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-[46px] text-base font-semibold"
                  disabled={busy}
                  onClick={() => checkCentralLicenseStatus()}
                >
                  {isCheckingCentralLicenseStatus ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" /> جارٍ التحقق…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="ml-2 h-5 w-5" /> التحقق من حالة الطلب
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full min-h-[46px] text-base font-semibold"
                  disabled={busy}
                  onClick={submitCentralRequest}
                >
                  {isRequestingCentralLicense ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" /> جارٍ إرسال الطلب…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="ml-2 h-5 w-5" /> إرسال طلب الترخيص
                    </>
                  )}
                </Button>
              )}
            </>
          )}
          <div className="border-t pt-4">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                يرتبط الترخيص ببصمة هذا الجهاز. لا تُخزّن هذه الصفحة مفتاحاً خاصاً أو بيانات اعتماد
                إدارية.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
