import { useMemo } from 'react';
import { trpc } from '@/lib/api/trpc';
import { useWhatsAppOperationsSSE } from '@/contexts/WhatsAppOperationsSSEContext';
import { createOperationalCostSummary } from '@/lib/whatsappOperationalCostSummary';

/** يستهلك ملخص التكلفة المركزي داخل مركز العمليات، ويستخدم المصدر نفسه للمسارات القديمة. */
export function useWhatsAppOperationalCostSummary() {
  const operationsSse = useWhatsAppOperationsSSE();
  const input = useMemo(() => ({}), []);
  const fallbackQuery = trpc.whatsapp.getConversationCosts.useQuery(input, {
    enabled: !operationsSse,
    refetchInterval: 120000,
  });
  const fallbackSummary = useMemo(
    () => createOperationalCostSummary(fallbackQuery.data as any),
    [fallbackQuery.data]
  );

  return {
    summary: operationsSse?.costSummary ?? fallbackSummary,
    isLoading: operationsSse?.isCostSummaryLoading ?? fallbackQuery.isLoading,
  };
}
