import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/api/trpc';

type PendingRequest = { requestId: number; expiresAt: string; status: 'pending' } | null;

interface CentralLicenseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog displayed after successful local sign-in when the server has no valid
 * signed license. The request itself remains bound to this instance's hardware ID
 * and is sent only by the local server-side tRPC procedure.
 */
export default function CentralLicenseRequestDialog({
  open,
  onOpenChange,
}: CentralLicenseRequestDialogProps) {
  const [pendingRequest, setPendingRequest] = useState<PendingRequest>(null);
  const [statusMessage, setStatusMessage] = useState(
    'لا يوجد ترخيص محلي صالح لهذه النسخة. يمكنك إرسال طلب إلى إدارة إيديا هب.'
  );

  const centralState = trpc.license.getCentralRequestState.useQuery(undefined, {
    enabled: open,
    retry: false,
  });

  useEffect(() => {
    if (centralState.data?.pendingRequest) {
      setPendingRequest(centralState.data.pendingRequest);
      setStatusMessage('يوجد طلب ترخيص معلق بالفعل لدى إدارة إيديا هب.');
    }
  }, [centralState.data?.pendingRequest]);

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
          : 'تم إرسال طلب الترخيص إلى إيديا هب بانتظار مراجعة الإدارة.'
      );
      toast.success('تم إرسال طلب الترخيص إلى إيديا هب');
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
        toast.success('تم اعتماد الترخيص والتحقق منه محلياً. ستُعاد تحميل الواجهة الآن.');
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

  const centralConfigured = centralState.data?.configured === true;
  const isWaiting = Boolean(pendingRequest);
  const busy = requestMutation.isPending || statusMutation.isPending;

  const submitRequest = () => {
    requestMutation.mutate({
      instanceName: `bocam – ${window.location.hostname || 'local-instance'}`,
      serverUrl: window.location.origin,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader className="space-y-3 text-right">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            {isWaiting ? (
              <Hourglass className="h-7 w-7 text-white" />
            ) : (
              <KeyRound className="h-7 w-7 text-white" />
            )}
          </div>
          <DialogTitle className="text-center text-xl">لا يوجد ترخيص صالح</DialogTitle>
          <DialogDescription className="text-center text-sm leading-6">
            تم التحقق من بيانات الدخول، لكن هذه النسخة لا تملك ترخيصاً محلياً صالحاً أو أن الترخيص
            منتهي/غير مطابق للجهاز.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!centralConfigured ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" /> اتصال إيديا هب غير مُعد
              </div>
              على مسؤول النسخة ضبط متغيري <code className="font-mono">IDEA_HUB_URL</code> و{' '}
              <code className="font-mono">IDEA_HUB_SYSTEM_ID</code> ثم إعادة تشغيل الخادم.
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <Server className="h-4 w-4" /> حالة طلب الترخيص المركزي
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
                  className="w-full"
                  disabled={busy}
                  onClick={() => statusMutation.mutate()}
                >
                  {statusMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جارٍ التحقق…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="ml-2 h-4 w-4" /> التحقق من حالة الطلب
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" className="w-full" disabled={busy} onClick={submitRequest}>
                  {requestMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جارٍ إرسال الطلب…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="ml-2 h-4 w-4" /> طلب ترخيص من Idea Hub
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
