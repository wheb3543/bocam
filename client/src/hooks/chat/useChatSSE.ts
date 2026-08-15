import { useCallback, useRef } from 'react';
import type { Message, SSEUpdate } from '@/components/chat/types';
import {
  isMessagePayload,
  isMessageUpdatePayload,
  isMessageFailedPayload,
} from '@/components/chat/types';

interface UseChatSSEProps {
  conversationId: number | null;
  onMessageUpdate?: (updater: (prev: Message[]) => Message[]) => void;
}

/**
 * Custom hook for handling SSE (Server-Sent Events) updates for chat messages
 * Processes SSE updates in batches for better performance
 */
export function useChatSSE({ conversationId, onMessageUpdate }: UseChatSSEProps) {
  const sseUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSSEUpdatesRef = useRef<SSEUpdate[]>([]);

  // Process SSE updates in batches
  const processSSEUpdates = useCallback(() => {
    if (pendingSSEUpdatesRef.current.length === 0) {
      return;
    }

    const updates = [...pendingSSEUpdatesRef.current];
    pendingSSEUpdatesRef.current = [];

    onMessageUpdate?.((prev: Message[]) => {
      let updated = [...prev];

      updates.forEach((update) => {
        const { eventName, payload } = update;

        // ── New inbound message (from webhook via pubsub) ──
        if (eventName === 'new_message') {
          const msg = isMessagePayload(payload) ? payload : undefined;
          if (!msg || String(msg.conversationId) !== String(conversationId)) {
            return;
          }

          // Avoid duplicate by id or whatsappMessageId
          const isDuplicate = updated.some(
            (m) =>
              (m.id !== null && m.id === msg.id) ||
              (m.whatsappMessageId &&
                msg.whatsappMessageId &&
                m.whatsappMessageId === msg.whatsappMessageId)
          );
          if (!isDuplicate) {
            const newMsg: Message = { ...msg, id: msg.id ?? `sse-${Date.now()}` };
            updated = [...updated, newMsg].sort(
              (a, b) =>
                new Date(a.sentAt || a.createdAt || Date.now()).getTime() -
                new Date(b.sentAt || b.createdAt || Date.now()).getTime()
            );
          }
        }

        // ── Message created (from db.ts helper for outbound) ──
        if (eventName === 'message_created') {
          const msg = isMessagePayload(payload) ? payload : undefined;
          if (!msg || String(msg.conversationId) !== String(conversationId)) {
            return;
          }

          // Replace optimistic temp message if content matches
          const tempIdx = updated.findIndex(
            (m) =>
              String(m.id).startsWith('temp-') &&
              m.content === msg.content &&
              m.direction === msg.direction
          );
          if (tempIdx >= 0) {
            updated[tempIdx] = { ...updated[tempIdx], ...msg };
          } else if (!updated.some((m) => m.id === msg.id)) {
            // Avoid duplicate
            updated = [...updated, msg].sort(
              (a, b) =>
                new Date(a.sentAt || a.createdAt || Date.now()).getTime() -
                new Date(b.sentAt || b.createdAt || Date.now()).getTime()
            );
          }
        }

        // ── Message status updated (delivered / read) ──
        if (eventName === 'message_updated') {
          const update = isMessageUpdatePayload(payload) ? payload : undefined;
          if (!update) {
            return;
          }
          const idx = updated.findIndex(
            (m) =>
              m.id === update.messageId ||
              m.id === update.id ||
              (m.whatsappMessageId &&
                update.whatsappMessageId &&
                m.whatsappMessageId === update.whatsappMessageId)
          );
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              status: update.status,
              deliveredAt: update.deliveredAt,
              readAt: update.readAt,
            };
          }
        }

        // ── Message failed ──
        if (eventName === 'message_failed') {
          const fail = isMessageFailedPayload(payload) ? payload : undefined;
          if (!fail) {
            return;
          }
          const idx = updated.findIndex(
            (m) =>
              m.id === fail.messageId ||
              m.id === fail.id ||
              (m.whatsappMessageId &&
                fail.whatsappMessageId &&
                m.whatsappMessageId === fail.whatsappMessageId)
          );
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              status: 'failed',
              errorTitle: fail.errorTitle,
              errorCode: fail.errorCode,
            };
          }
        }
      });

      return updated;
    });
  }, [conversationId, onMessageUpdate]);

  // Debounced SSE update handler
  const handleSSEUpdate = useCallback(
    (eventName: string, payload: unknown) => {
      pendingSSEUpdatesRef.current.push({ eventName, payload });

      if (sseUpdateTimeoutRef.current) {
        clearTimeout(sseUpdateTimeoutRef.current);
      }

      sseUpdateTimeoutRef.current = setTimeout(() => {
        processSSEUpdates();
      }, 100); // 100ms debounce
    },
    [processSSEUpdates]
  );

  return {
    handleSSEUpdate,
    processSSEUpdates,
  };
}
