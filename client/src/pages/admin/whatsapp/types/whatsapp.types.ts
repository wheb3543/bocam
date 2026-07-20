/**
 * تعريفات الأنواع المشتركة لصفحة WhatsApp
 * تم استخراجها من WhatsAppPage.tsx لتحسين قابلية الصيانة
 */

export interface Conversation {
  id: number;
  customerName?: string | null;
  phoneNumber: string;
  lastMessage?: string | null;
  lastMessageAt?: string | Date | null;
  unreadCount: number;
  isImportant?: number;
  isArchived?: number;
  assignedToUserId?: number | null;
  notes?: string | null;
  appointmentId?: number | null;
  leadId?: number | null;
  offerLeadId?: number | null;
  campRegistrationId?: number | null;
  labOrderId?: number | null;
  conversationIdMeta?: string | null;
  originType?: string | null;
  expirationTimestamp?: string | Date | null;
  pricingModel?: string | null;
  billable?: boolean;
  pricingCategory?: string | null;
  totalCost?: number;
  messageCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WhatsAppUser {
  id: number;
  name: string | null;
  username: string;
}

export interface Template {
  id: number;
  name: string;
  content: string;
  category: string;
  variables?: string | null;
  isActive: number;
  metaName?: string | null;
  languageCode?: string | null;
}

export interface ConnectionStatus {
  isReady?: boolean;
  isConnecting?: boolean;
  hasQRCode?: boolean;
  apiConfigured?: boolean;
  phoneNumberId?: string;
  apiVersion?: string;
  mode?: string;
  [key: string]: unknown;
}

export interface SavedSearch {
  id: number;
  userId: number;
  name: string;
  searchQuery: string | null;
  filterType: string | null;
  dateRange: string | null;
  messageType: string | null;
  createdAt: Date;
  [key: string]: unknown;
}

export interface AutoReplyRule {
  id: number;
  name: string;
  triggerValue: string | null | undefined;
  isActive: boolean;
  [key: string]: unknown;
}

export type FilterType =
  | 'all'
  | 'unread'
  | 'important'
  | 'archived'
  | 'unnamed'
  | 'unreplied'
  | 'lab_results';

export type DateFilterType = 'all' | 'today' | 'week' | 'month';

export type ExportFormatType = 'json' | 'csv';

export interface ConfirmDialogAction {
  action: string;
  id?: number;
  ids?: number[];
}
