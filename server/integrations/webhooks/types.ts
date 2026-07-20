/**
 * أنواع البيانات المشتركة لمعالجة Webhook لـ WhatsApp
 * تعريفات الأنواع المستخدمة في معالجات الرسائل المختلفة
 */

export interface AppointmentData {
  phone: string;
  fullName?: string;
  appointmentDate?: Date | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  procedure?: string | null;
  doctorId?: number;
}

export interface MetaWebhookError {
  code: number;
  title: string;
  message?: string;
}

export interface MetaWebhookContactPayload {
  profile?: {
    name?: string;
  };
  wa_id?: string;
  addresses?: unknown;
  birthday?: string;
  emails?: unknown;
  name?: unknown;
  org?: unknown;
  phones?: unknown;
  urls?: unknown;
}

export interface MetaWebhookTextPayload {
  body: string;
}

export interface MetaWebhookMediaPayload {
  id: string;
  caption?: string;
  filename?: string;
  mime_type?: string;
  sha256?: string;
  voice?: boolean;
}

export interface MetaWebhookLocationPayload {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface MetaWebhookIdentityPayload {
  acknowledged: boolean;
  created_timestamp?: string;
  hash: string;
}

export interface MetaWebhookButtonPayload {
  payload: string;
  text: string;
}

export interface MetaWebhookInteractivePayload {
  type: string;
  button_reply?: {
    id: string;
    title: string;
  };
  list_reply?: {
    id: string;
    title: string;
    description?: string;
  };
  referred_product?: {
    catalog_id?: string;
    product_retailer_id?: string;
  };
}

export interface MetaWebhookMessagePayload {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: MetaWebhookTextPayload;
  button?: MetaWebhookButtonPayload;
  interactive?: MetaWebhookInteractivePayload;
  image?: MetaWebhookMediaPayload;
  document?: MetaWebhookMediaPayload & { filename?: string };
  video?: MetaWebhookMediaPayload;
  audio?: MetaWebhookMediaPayload & { voice?: boolean };
  location?: MetaWebhookLocationPayload;
  identity?: MetaWebhookIdentityPayload;
  sticker?: Record<string, unknown>;
  reaction?: Record<string, unknown>;
  order?: Record<string, unknown>;
  referral?: Record<string, unknown>;
  contacts?: MetaWebhookContactPayload[];
  errors?: MetaWebhookError[];
}

export interface MetaWebhookStatusPayload {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: MetaWebhookError[];
}

export interface MetaWebhookValuePayload {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Array<{
    profile?: { name?: string };
    wa_id?: string;
  }>;
  messages?: MetaWebhookMessagePayload[];
  statuses?: MetaWebhookStatusPayload[];
}

export interface MessageHandlerContext {
  phoneNumber: string;
  customerName?: string;
  conversationId: number;
  messageId: number;
  metadata: MetaWebhookValuePayload['metadata'];
}

export interface MessageHandlerResult {
  content: string;
  messageType: string;
  metaPayload?: Record<string, unknown> | null;
  mediaId?: string | null;
}
