import type { WhatsAppMessage as DBWhatsAppMessage, WhatsAppTemplate as DBWhatsAppTemplate } from '@shared/types';

// Re-export database types with local aliases for convenience
export type WhatsAppTemplate = DBWhatsAppTemplate;

// Extended Message interface for UI use (includes temp IDs and optimistic updates)
export interface Message {
  id?: string | number | null; // Allow string for temp IDs
  conversationId?: number | string | null;
  whatsappMessageId?: string | null;
  content?: string | null;
  messageType?: DBWhatsAppMessage['messageType'] | 'pending'; // Add 'pending' for optimistic updates
  direction?: DBWhatsAppMessage['direction'];
  sentAt?: string | Date | null;
  createdAt?: string | Date | null;
  sentBy?: number | null;
  metadata?: string | null;
  mediaId?: string | null;
  status?: DBWhatsAppMessage['status'] | 'pending'; // Add 'pending' for optimistic updates
  deliveredAt?: string | Date | null;
  readAt?: string | Date | null;
  replyToMessageId?: string | number | null;
  errorTitle?: string | null;
  errorCode?: string | null;
  reactions?: string[] | null;
  [key: string]: unknown;
}

// Template interface for UI use
export type Template = WhatsAppTemplate;

// SSE Update types
export type SSEUpdate = { eventName: string; payload: unknown };

// Chat Window Props
export interface ChatWindowProps {
  conversationId: number | null;
  lastMessageAt?: string | Date | null;
  onConversationUpdate?: () => void;
  phone?: string | null; // رقم هاتف العميل لإرسال القوالب
  contactName?: string | null;
}

// Link Preview type
export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string;
}

// Type guards
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isMessage(value: unknown): value is Message {
  if (!isRecord(value)) {return false;}
  if ('direction' in value && value.direction !== null) {
    if (value.direction !== 'inbound' && value.direction !== 'outbound') {return false;}
  }
  if ('id' in value && value.id !== null) {
    if (typeof value.id !== 'string' && typeof value.id !== 'number') {return false;}
  }
  if ('content' in value && value.content !== null && typeof value.content !== 'string') {return false;}
  if ('sentAt' in value && value.sentAt !== null) {
    if (typeof value.sentAt !== 'string' && !(value.sentAt instanceof Date)) {return false;}
  }
  if ('createdAt' in value && value.createdAt !== null) {
    if (typeof value.createdAt !== 'string' && !(value.createdAt instanceof Date)) {return false;}
  }
  return true;
}

// Type guard for SSE payload validation
export function isMessagePayload(value: unknown): value is Partial<Message> {
  return isRecord(value);
}

// Type guard for message update payload
export function isMessageUpdatePayload(value: unknown): value is Partial<Message> & {
  messageId?: string | number;
  id?: string | number;
  whatsappMessageId?: string;
  status?: string;
  deliveredAt?: string | Date;
  readAt?: string | Date;
} {
  return isRecord(value);
}

// Type guard for message failed payload
export function isMessageFailedPayload(value: unknown): value is Partial<Message> & {
  messageId?: string | number;
  id?: string | number;
  whatsappMessageId?: string;
  errorTitle?: string;
  errorCode?: string;
} {
  return isRecord(value);
}

// Type guard for conversation update payload
export function isConversationUpdatePayload(value: unknown): value is {
  event?: string;
  conversationId?: number;
} {
  return isRecord(value);
}

// Utility functions
export function getMessageTimestamp(msg: Message): number {
  return new Date(msg.sentAt ?? msg.createdAt ?? Date.now()).getTime();
}

export function isOutsideWindow(lastMessageAt?: string | Date | null): boolean {
  if (!lastMessageAt) {return true;}
  const last = new Date(lastMessageAt).getTime();
  return Date.now() - last > 24 * 60 * 60 * 1000;
}

export function getDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { ar } from 'date-fns/locale';

export function formatDateForSeparator(date: Date): string {
  if (isToday(date)) {
    return 'اليوم';
  }
  if (isYesterday(date)) {
    return 'أمس';
  }
  if (isThisYear(date)) {
    return format(date, 'd MMMM', { locale: ar });
  }
  return format(date, 'd MMMM yyyy', { locale: ar });
}

/** Merge two message arrays: DB data takes priority, then local additions */
export function mergeMessages(dbMsgs: Message[], localMsgs: Message[]): Message[] {
  const map = new Map<string | number, Message>();
  // DB messages first (authoritative)
  for (const m of dbMsgs) {
    if (m.id !== null && m.id !== undefined) {map.set(m.id, m);}
  }
  // Local messages: only add those not in DB (new SSE arrivals or optimistic)
  for (const m of localMsgs) {
    const key = m.id;
    if (key !== null && key !== undefined && !map.has(key)) {
      map.set(key, m);
    } else if (key !== null && key !== undefined && String(key).startsWith('temp-')) {
      // Keep optimistic messages that haven't been confirmed yet
      map.set(key, m);
    }
  }
  return Array.from(map.values()).sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));
}
