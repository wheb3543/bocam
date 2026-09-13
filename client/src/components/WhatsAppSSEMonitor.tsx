import { Badge } from '@/components/ui/badge';
import { useWhatsAppOperationsSSE } from '@/contexts/WhatsAppOperationsSSEContext';
import { Activity, Radio, RotateCw, WifiOff } from 'lucide-react';

const statusMeta = {
  connected: {
    label: 'متصل',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Icon: Radio,
  },
  connecting: {
    label: 'جارٍ الاتصال',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
    Icon: RotateCw,
  },
  reconnecting: {
    label: 'إعادة اتصال',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    Icon: RotateCw,
  },
  disconnected: {
    label: 'غير متصل',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
    Icon: WifiOff,
  },
} as const;

export function WhatsAppSSEMonitor() {
  const operationsSse = useWhatsAppOperationsSSE();
  if (!operationsSse) {
    return null;
  }

  const meta = statusMeta[operationsSse.sseStatus];
  const lastEventAt = operationsSse.lastEventAt
    ? new Date(operationsSse.lastEventAt).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'لم يصل حدث بعد';

  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2 text-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={`gap-1.5 ${meta.className}`}>
          <meta.Icon
            className={`h-3.5 w-3.5 ${operationsSse.sseStatus !== 'connected' ? 'animate-spin' : ''}`}
          />
          SSE: {meta.label}
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Activity className="h-3.5 w-3.5 text-blue-600" />
          {operationsSse.liveEventCount} حدث مستلم
        </Badge>
      </div>
      <span className="text-xs text-muted-foreground">آخر تحديث: {lastEventAt}</span>
    </div>
  );
}
