import { createContext, useContext } from 'react';
import type {
  AccountAlertEvent,
  PhoneQualityUpdateEvent,
} from '@/hooks/integrations/useWhatsAppSSE';
import type { OperationalCostSummary } from '@/lib/whatsappOperationalCostSummary';

export type SSEConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

type LiveAlert = Pick<AccountAlertEvent, 'alertType' | 'severity' | 'details' | 'timestamp'>;

export type OperationsSSEState = {
  liveAlerts: LiveAlert[];
  hasNewCritical: boolean;
  liveQuality: PhoneQualityUpdateEvent | null;
  liveEventCount: number;
  lastLiveEvent: string | null;
  lastEventAt: string | null;
  sseStatus: SSEConnectionStatus;
  costSummary: OperationalCostSummary;
  isCostSummaryLoading: boolean;
  clearLiveAlerts: () => void;
  dismissCritical: () => void;
};

export const OperationsSSEContext = createContext<OperationsSSEState | null>(null);

/** يعيد حالة الاشتراك المركزي، أو null عند فتح إحدى الصفحات القديمة خارج مركز العمليات. */
export function useWhatsAppOperationsSSE() {
  return useContext(OperationsSSEContext);
}
