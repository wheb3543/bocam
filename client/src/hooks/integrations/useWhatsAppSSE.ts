/**
 * useWhatsAppSSE — Hook مركزي لأحداث WhatsApp عبر SSE
 * يستمع لجميع أحداث الـ webhook في الوقت الفعلي
 */

import { useCallback, useRef } from "react";
import useSSE from "@/hooks/integrations/useSSE";

// ── أنواع الأحداث ──────────────────────────────────────────────────────────────

export interface AccountAlertEvent {
  alertType: string;
  severity: "critical" | "high" | "medium" | "low";
  details?: any;
  timestamp: string;
}

export interface PhoneQualityUpdateEvent {
  phoneNumber: string;
  displayPhoneNumber?: string;
  currentRating: "green" | "yellow" | "red" | "gray";
  previousRating?: string;
  timestamp: string;
}

export interface TemplateStatusUpdateEvent {
  templateId: string;
  templateName: string;
  status: "APPROVED" | "REJECTED" | "DISABLED" | "PAUSED" | "REINSTATED" | "FLAGGED" | "PENDING_DELETION";
  reason?: string;
  timestamp: string;
}

export interface WebhookEventPayload {
  id?: number;
  eventType: string;
  subType?: string;
  phoneNumber?: string;
  rawPayload?: string;
  handlerExists: boolean;
  processed: boolean;
  timestamp: string;
}

export interface MessageStatusUpdateEvent {
  messageId: string;
  whatsappMessageId?: string;
  conversationId?: number;
  status: "sent" | "delivered" | "read" | "failed";
  deliveredAt?: string;
  readAt?: string;
  errorCode?: number;
  errorTitle?: string;
  timestamp: string;
}

export interface TypingEvent {
  conversationId: number;
  phoneNumber: string;
  timestamp: string;
}

export interface ConversationCostUpdateEvent {
  phoneNumber: string;
  pricingData: {
    pricingModel?: string;
    billable?: boolean;
    category?: string;
  };
  conversationData: {
    id?: string;
    expirationTimestamp?: string;
    originType?: string;
  };
  timestamp: string;
}

export interface TemplateDisabledEvent {
  templateId: string;
  reason: string;
  timestamp: string;
}

export interface TemplateEnabledEvent {
  templateId: string;
  timestamp: string;
}

export interface AccountReviewUpdateEvent {
  phoneNumber: string;
  status: string;
  timestamp: string;
}

export interface TemplateNameUpdateEvent {
  templateId: string;
  name: string;
  timestamp: string;
}

export interface TemplateCategoryUpdateEvent {
  templateId: string;
  category: string;
  timestamp: string;
}

export interface TemplateLanguageUpdateEvent {
  templateId: string;
  languageCode: string;
  timestamp: string;
}

export interface TemplateEvent {
  templateId: string;
  eventType: string;
  timestamp: string;
}

export interface AccountUpdateEvent {
  phoneNumber: string;
  eventType: string;
  timestamp: string;
}

export interface BusinessProfileUpdateEvent {
  phoneNumber: string;
  eventType: string;
  timestamp: string;
}

export interface BusinessAccountUpdateEvent {
  phoneNumber: string;
  eventType: string;
  timestamp: string;
}

export interface MessagingProductUpdateEvent {
  phoneNumber: string;
  eventType: string;
  timestamp: string;
}

export interface ContactsReceivedEvent {
  conversationId: number;
  phoneNumber: string;
  contactsCount: number;
  timestamp: string;
}

export interface OrderReceivedEvent {
  conversationId: number;
  phoneNumber: string;
  orderText: string;
  timestamp: string;
}

export interface ReferralReceivedEvent {
  conversationId: number;
  phoneNumber: string;
  sourceType: string;
  timestamp: string;
}

export interface ReactionReceivedEvent {
  conversationId: number;
  phoneNumber: string;
  emoji: string;
  timestamp: string;
}

export interface TransactionStatusUpdateEvent {
  conversationId: number;
  phoneNumber: string;
  status: string;
  timestamp: string;
}

// ── واجهة الـ Hook ─────────────────────────────────────────────────────────────

export interface UseWhatsAppSSEOptions {
  /** معرّف المحادثة للاشتراك في أحداثها الخاصة */
  conversationId?: number | null;
  /** تنبيه حساب جديد (account_alerts) */
  onAccountAlert?: (event: AccountAlertEvent) => void;
  /** تحديث جودة رقم الهاتف (phone_number_quality_update) */
  onPhoneQualityUpdate?: (event: PhoneQualityUpdateEvent) => void;
  /** تحديث حالة قالب (message_template_status_update) */
  onTemplateStatusUpdate?: (event: TemplateStatusUpdateEvent) => void;
  /** حدث webhook جديد (لصفحة المفتش) */
  onWebhookEvent?: (event: WebhookEventPayload) => void;
  /** تحديث حالة رسالة (delivered/read/failed) */
  onMessageStatusUpdate?: (event: MessageStatusUpdateEvent) => void;
  /** مؤشر الكتابة */
  onTyping?: (event: TypingEvent) => void;
  /** تحديث تكلفة المحادثة */
  onConversationCostUpdate?: (event: ConversationCostUpdateEvent) => void;
  /** تعطيل قالب */
  onTemplateDisabled?: (event: TemplateDisabledEvent) => void;
  /** تفعيل قالب */
  onTemplateEnabled?: (event: TemplateEnabledEvent) => void;
  /** تحديث مراجعة الحساب */
  onAccountReviewUpdate?: (event: AccountReviewUpdateEvent) => void;
  /** تحديث اسم القالب */
  onTemplateNameUpdate?: (event: TemplateNameUpdateEvent) => void;
  /** تحديث فئة القالب */
  onTemplateCategoryUpdate?: (event: TemplateCategoryUpdateEvent) => void;
  /** تحديث لغة القالب */
  onTemplateLanguageUpdate?: (event: TemplateLanguageUpdateEvent) => void;
  /** حدث قالب عام */
  onTemplateEvent?: (event: TemplateEvent) => void;
  /** تحديث الحساب */
  onAccountUpdate?: (event: AccountUpdateEvent) => void;
  /** تحديث الملف التجاري */
  onBusinessProfileUpdate?: (event: BusinessProfileUpdateEvent) => void;
  /** تحديث حساب الأعمال */
  onBusinessAccountUpdate?: (event: BusinessAccountUpdateEvent) => void;
  /** تحديث منتج المراسلة */
  onMessagingProductUpdate?: (event: MessagingProductUpdateEvent) => void;
  /** استلام جهات اتصال */
  onContactsReceived?: (event: ContactsReceivedEvent) => void;
  /** استلام طلب */
  onOrderReceived?: (event: OrderReceivedEvent) => void;
  /** استلام إحالة */
  onReferralReceived?: (event: ReferralReceivedEvent) => void;
  /** استلام رد فعل */
  onReactionReceived?: (event: ReactionReceivedEvent) => void;
  /** تحديث حالة المعاملة */
  onTransactionStatusUpdate?: (event: TransactionStatusUpdateEvent) => void;
}

/**
 * Hook مركزي لأحداث WhatsApp عبر SSE
 *
 * @example
 * useWhatsAppSSE({
 *   onAccountAlert: (e) => toast.error(`تنبيه: ${e.alertType}`),
 *   onTemplateStatusUpdate: (e) => refetch(),
 * });
 */
export function useWhatsAppSSE({
  conversationId,
  onAccountAlert,
  onPhoneQualityUpdate,
  onTemplateStatusUpdate,
  onWebhookEvent,
  onMessageStatusUpdate,
  onTyping,
  onConversationCostUpdate,
  onTemplateDisabled,
  onTemplateEnabled,
  onAccountReviewUpdate,
  onTemplateNameUpdate,
  onTemplateCategoryUpdate,
  onTemplateLanguageUpdate,
  onTemplateEvent,
  onAccountUpdate,
  onBusinessProfileUpdate,
  onBusinessAccountUpdate,
  onMessagingProductUpdate,
  onContactsReceived,
  onOrderReceived,
  onReferralReceived,
  onReactionReceived,
  onTransactionStatusUpdate,
}: UseWhatsAppSSEOptions = {}) {
  // نحتفظ بالـ callbacks في refs لتجنب إعادة الاتصال عند تغيير الـ handlers
  const onAccountAlertRef = useRef(onAccountAlert);
  const onPhoneQualityRef = useRef(onPhoneQualityUpdate);
  const onTemplateStatusRef = useRef(onTemplateStatusUpdate);
  const onWebhookEventRef = useRef(onWebhookEvent);
  const onMessageStatusRef = useRef(onMessageStatusUpdate);
  const onTypingRef = useRef(onTyping);
  const onConversationCostUpdateRef = useRef(onConversationCostUpdate);
  const onTemplateDisabledRef = useRef(onTemplateDisabled);
  const onTemplateEnabledRef = useRef(onTemplateEnabled);
  const onAccountReviewUpdateRef = useRef(onAccountReviewUpdate);
  const onTemplateNameUpdateRef = useRef(onTemplateNameUpdate);
  const onTemplateCategoryUpdateRef = useRef(onTemplateCategoryUpdate);
  const onTemplateLanguageUpdateRef = useRef(onTemplateLanguageUpdate);
  const onTemplateEventRef = useRef(onTemplateEvent);
  const onAccountUpdateRef = useRef(onAccountUpdate);
  const onBusinessProfileUpdateRef = useRef(onBusinessProfileUpdate);
  const onBusinessAccountUpdateRef = useRef(onBusinessAccountUpdate);
  const onMessagingProductUpdateRef = useRef(onMessagingProductUpdate);
  const onContactsReceivedRef = useRef(onContactsReceived);
  const onOrderReceivedRef = useRef(onOrderReceived);
  const onReferralReceivedRef = useRef(onReferralReceived);
  const onReactionReceivedRef = useRef(onReactionReceived);
  const onTransactionStatusUpdateRef = useRef(onTransactionStatusUpdate);

  // تحديث الـ refs عند تغيير الـ callbacks
  onAccountAlertRef.current = onAccountAlert;
  onPhoneQualityRef.current = onPhoneQualityUpdate;
  onTemplateStatusRef.current = onTemplateStatusUpdate;
  onWebhookEventRef.current = onWebhookEvent;
  onMessageStatusRef.current = onMessageStatusUpdate;
  onTypingRef.current = onTyping;
  onConversationCostUpdateRef.current = onConversationCostUpdate;
  onTemplateDisabledRef.current = onTemplateDisabled;
  onTemplateEnabledRef.current = onTemplateEnabled;
  onAccountReviewUpdateRef.current = onAccountReviewUpdate;
  onTemplateNameUpdateRef.current = onTemplateNameUpdate;
  onTemplateCategoryUpdateRef.current = onTemplateCategoryUpdate;
  onTemplateLanguageUpdateRef.current = onTemplateLanguageUpdate;
  onTemplateEventRef.current = onTemplateEvent;
  onAccountUpdateRef.current = onAccountUpdate;
  onBusinessProfileUpdateRef.current = onBusinessProfileUpdate;
  onBusinessAccountUpdateRef.current = onBusinessAccountUpdate;
  onMessagingProductUpdateRef.current = onMessagingProductUpdate;
  onContactsReceivedRef.current = onContactsReceived;
  onOrderReceivedRef.current = onOrderReceived;
  onReferralReceivedRef.current = onReferralReceived;
  onReactionReceivedRef.current = onReactionReceived;
  onTransactionStatusUpdateRef.current = onTransactionStatusUpdate;

  // ── معالج الأحداث العامة (global channel) ─────────────────────────────────
  const handleGlobalEvent = useCallback((e: MessageEvent) => {
    try {
      const eventName = (e as any).type || "message";
      let payload: any;
      try {
        payload = JSON.parse(e.data);
      } catch {
        return;
      }

      switch (eventName) {
        case "account_alert":
          onAccountAlertRef.current?.(payload as AccountAlertEvent);
          break;

        case "phone_quality_update":
          onPhoneQualityRef.current?.(payload as PhoneQualityUpdateEvent);
          break;

        case "template_status_update":
          onTemplateStatusRef.current?.(payload as TemplateStatusUpdateEvent);
          break;

        case "webhook_event":
          onWebhookEventRef.current?.(payload as WebhookEventPayload);
          break;

        case "message_status_update":
          onMessageStatusRef.current?.(payload as MessageStatusUpdateEvent);
          break;

        case "typing":
          onTypingRef.current?.(payload as TypingEvent);
          break;

        case "conversation_cost_update":
          onConversationCostUpdateRef.current?.(payload as ConversationCostUpdateEvent);
          break;

        case "template_disabled":
          onTemplateDisabledRef.current?.(payload as TemplateDisabledEvent);
          break;

        case "template_enabled":
          onTemplateEnabledRef.current?.(payload as TemplateEnabledEvent);
          break;

        case "account_review_update":
          onAccountReviewUpdateRef.current?.(payload as AccountReviewUpdateEvent);
          break;

        case "template_name_update":
          onTemplateNameUpdateRef.current?.(payload as TemplateNameUpdateEvent);
          break;

        case "template_category_update":
          onTemplateCategoryUpdateRef.current?.(payload as TemplateCategoryUpdateEvent);
          break;

        case "template_language_update":
          onTemplateLanguageUpdateRef.current?.(payload as TemplateLanguageUpdateEvent);
          break;

        case "template_event":
          onTemplateEventRef.current?.(payload as TemplateEvent);
          break;

        case "account_update":
          onAccountUpdateRef.current?.(payload as AccountUpdateEvent);
          break;

        case "business_profile_update":
          onBusinessProfileUpdateRef.current?.(payload as BusinessProfileUpdateEvent);
          break;

        case "business_account_update":
          onBusinessAccountUpdateRef.current?.(payload as BusinessAccountUpdateEvent);
          break;

        case "messaging_product_update":
          onMessagingProductUpdateRef.current?.(payload as MessagingProductUpdateEvent);
          break;

        case "contacts_received":
          onContactsReceivedRef.current?.(payload as ContactsReceivedEvent);
          break;

        case "order_received":
          onOrderReceivedRef.current?.(payload as OrderReceivedEvent);
          break;

        case "referral_received":
          onReferralReceivedRef.current?.(payload as ReferralReceivedEvent);
          break;

        case "reaction_received":
          onReactionReceivedRef.current?.(payload as ReactionReceivedEvent);
          break;

        case "transaction_status_update":
          onTransactionStatusUpdateRef.current?.(payload as TransactionStatusUpdateEvent);
          break;

        default:
          break;
      }
    } catch (_) {}
  }, []);

  // ── معالج أحداث المحادثة (conversation channel) ───────────────────────────
  const handleConversationEvent = useCallback((e: MessageEvent) => {
    try {
      const eventName = (e as any).type || "message";
      let payload: any;
      try {
        payload = JSON.parse(e.data);
      } catch {
        return;
      }

      switch (eventName) {
        case "message_updated":
          // تحديث حالة رسالة (delivered/read/failed)
          if (payload?.status) {
            onMessageStatusRef.current?.({
              messageId: payload.messageId || payload.id,
              whatsappMessageId: payload.whatsappMessageId,
              conversationId: payload.conversationId,
              status: payload.status,
              deliveredAt: payload.deliveredAt,
              readAt: payload.readAt,
              errorCode: payload.errorCode,
              errorTitle: payload.errorTitle,
              timestamp: payload.timestamp || new Date().toISOString(),
            });
          }
          break;

        case "typing":
          onTypingRef.current?.(payload as TypingEvent);
          break;

        default:
          break;
      }
    } catch (_) {}
  }, []);

  // ── الاشتراك في القناة العامة ──────────────────────────────────────────────
  useSSE("/api/whatsapp/stream/global", handleGlobalEvent);

  // ── الاشتراك في قناة المحادثة (إن وُجدت) ─────────────────────────────────
  useSSE(
    conversationId ? `/api/whatsapp/stream/${conversationId}` : null,
    handleConversationEvent
  );
}

export default useWhatsAppSSE;
