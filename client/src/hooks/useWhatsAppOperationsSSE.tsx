import { trpc } from '@/lib/api/trpc';
import {
  type AccountAlertEvent,
  type PhoneQualityUpdateEvent,
  type WebhookEventPayload,
  useWhatsAppSSE,
} from '@/hooks/integrations/useWhatsAppSSE';
import {
  OperationsSSEContext,
  type OperationsSSEState,
  type SSEConnectionStatus,
} from '@/contexts/WhatsAppOperationsSSEContext';
import { createOperationalCostSummary } from '@/lib/whatsappOperationalCostSummary';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * يفتح اشتراك SSE واحداً لمركز عمليات واتساب، ويجمع إبطال الاستعلامات في دفعات قصيرة.
 * تبقى الصفحات القديمة خارج المركز مشتركةً محلياً للحفاظ على توافقها أثناء الانتقال.
 */
export function WhatsAppOperationsSSEProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();
  const [liveAlerts, setLiveAlerts] = useState<OperationsSSEState['liveAlerts']>([]);
  const [hasNewCritical, setHasNewCritical] = useState(false);
  const [liveQuality, setLiveQuality] = useState<PhoneQualityUpdateEvent | null>(null);
  const [liveEventCount, setLiveEventCount] = useState(0);
  const [lastLiveEvent, setLastLiveEvent] = useState<string | null>(null);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const costQueryInput = useMemo(() => ({}), []);
  const costsQuery = trpc.whatsapp.getConversationCosts.useQuery(costQueryInput, {
    refetchInterval: 120000,
  });
  const pendingDomains = useRef(new Set<string>());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushInvalidations = useCallback(() => {
    const domains = Array.from(pendingDomains.current);
    pendingDomains.current.clear();
    flushTimer.current = null;

    const tasks: Promise<unknown>[] = [];
    if (domains.includes('connection')) {
      tasks.push(utils.whatsapp.connection.status.invalidate());
    }
    if (domains.includes('health')) {
      tasks.push(utils.whatsapp.accountHealth.getAlerts.invalidate());
      tasks.push(utils.whatsapp.accountHealth.getSecurityEvents.invalidate());
      tasks.push(utils.whatsapp.accountHealth.getAlertStats.invalidate());
    }
    if (domains.includes('quality')) {
      tasks.push(utils.whatsapp.phoneQuality.getCurrent.invalidate());
      tasks.push(utils.whatsapp.phoneQuality.getHistory.invalidate());
      tasks.push(utils.whatsapp.conversationQuality.getHistory.invalidate());
    }
    if (domains.includes('costs')) {
      tasks.push(utils.whatsapp.getConversationCosts.invalidate());
    }
    if (domains.includes('webhooks')) {
      tasks.push(utils.whatsapp.webhookEvents.getAll.invalidate());
      tasks.push(utils.whatsapp.webhookEvents.getEventsByCategory.invalidate());
      tasks.push(utils.whatsapp.webhookEvents.getStatsByType.invalidate());
      tasks.push(utils.whatsapp.webhookEvents.getUnhandledCount.invalidate());
      tasks.push(utils.whatsapp.webhookEvents.getEventTypes.invalidate());
      tasks.push(utils.whatsapp.webhookEvents.getTemplateEvents.invalidate());
      tasks.push(utils.whatsapp.webhookEvents.getFlowEvents.invalidate());
    }
    void Promise.all(tasks);
  }, [utils]);

  const scheduleInvalidation = useCallback(
    (...domains: string[]) => {
      domains.forEach((domain) => pendingDomains.current.add(domain));
      if (!flushTimer.current) {
        flushTimer.current = setTimeout(flushInvalidations, 250);
      }
    },
    [flushInvalidations]
  );

  useEffect(
    () => () => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
      }
    },
    []
  );

  const recordEvent = useCallback((eventType: string) => {
    setLiveEventCount((count) => count + 1);
    setLastLiveEvent(eventType);
    setLastEventAt(new Date().toISOString());
  }, []);

  const handleAccountAlert = useCallback(
    (event: AccountAlertEvent) => {
      recordEvent(event.alertType);
      setLiveAlerts((alerts) => [
        {
          alertType: event.alertType,
          severity: event.severity,
          details: event.details,
          timestamp: event.timestamp,
        },
        ...alerts.slice(0, 9),
      ]);
      if (event.severity === 'critical' || event.severity === 'high') {
        setHasNewCritical(true);
      }
      scheduleInvalidation('health', 'webhooks');
    },
    [recordEvent, scheduleInvalidation]
  );

  const handlePhoneQuality = useCallback(
    (event: PhoneQualityUpdateEvent) => {
      recordEvent('phone_number_quality_update');
      setLiveQuality(event);
      scheduleInvalidation('quality', 'webhooks');
    },
    [recordEvent, scheduleInvalidation]
  );

  const handleWebhookEvent = useCallback(
    (event: WebhookEventPayload) => {
      recordEvent(event.eventType);
      scheduleInvalidation('webhooks', 'health');
    },
    [recordEvent, scheduleInvalidation]
  );

  const handleAccountUpdate = useCallback(
    (eventType: string) => {
      recordEvent(eventType);
      scheduleInvalidation('connection', 'health', 'webhooks');
    },
    [recordEvent, scheduleInvalidation]
  );

  const handleCostUpdate = useCallback(() => {
    recordEvent('conversation_cost_update');
    scheduleInvalidation('costs', 'quality', 'webhooks');
  }, [recordEvent, scheduleInvalidation]);

  const handleTemplateUpdate = useCallback(
    (eventType: string) => {
      recordEvent(eventType);
      scheduleInvalidation('webhooks');
    },
    [recordEvent, scheduleInvalidation]
  );

  const { isConnected } = useWhatsAppSSE({
    onAccountAlert: handleAccountAlert,
    onPhoneQualityUpdate: handlePhoneQuality,
    onWebhookEvent: handleWebhookEvent,
    onAccountReviewUpdate: (event) => handleAccountUpdate(`account_review:${event.status}`),
    onAccountUpdate: (event) => handleAccountUpdate(event.eventType),
    onBusinessProfileUpdate: (event) => handleAccountUpdate(event.eventType),
    onBusinessAccountUpdate: (event) => handleAccountUpdate(event.eventType),
    onMessagingProductUpdate: (event) => handleAccountUpdate(event.eventType),
    onConversationCostUpdate: handleCostUpdate,
    onTemplateStatusUpdate: (event) => handleTemplateUpdate(`template_status:${event.status}`),
    onTemplateDisabled: (event) => handleTemplateUpdate(`template_disabled:${event.templateId}`),
    onTemplateEnabled: (event) => handleTemplateUpdate(`template_enabled:${event.templateId}`),
    onTemplateNameUpdate: (event) => handleTemplateUpdate(`template_name:${event.templateId}`),
    onTemplateCategoryUpdate: (event) =>
      handleTemplateUpdate(`template_category:${event.templateId}`),
    onTemplateLanguageUpdate: (event) =>
      handleTemplateUpdate(`template_language:${event.templateId}`),
    onTemplateEvent: (event) => handleTemplateUpdate(event.eventType),
  });

  const sseStatus: SSEConnectionStatus = isConnected ? 'connected' : 'disconnected';

  const value = useMemo<OperationsSSEState>(
    () => ({
      liveAlerts,
      hasNewCritical,
      liveQuality,
      liveEventCount,
      lastLiveEvent,
      lastEventAt,
      sseStatus,
      costSummary: createOperationalCostSummary(costsQuery.data as any),
      isCostSummaryLoading: costsQuery.isLoading,
      clearLiveAlerts: () => setLiveAlerts([]),
      dismissCritical: () => setHasNewCritical(false),
    }),
    [
      costsQuery.data,
      costsQuery.isLoading,
      sseStatus,
      hasNewCritical,
      lastEventAt,
      lastLiveEvent,
      liveAlerts,
      liveEventCount,
      liveQuality,
    ]
  );

  return <OperationsSSEContext.Provider value={value}>{children}</OperationsSSEContext.Provider>;
}
