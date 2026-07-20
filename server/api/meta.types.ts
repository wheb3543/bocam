/**
 * Meta API Types - تعريفات الأنواع لخدمة Meta
 * تعريفات الأنواع المشتركة لخدمة Meta Graph API
 */

export interface MetaApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id?: string;
  };
  /** HTTP status code */
  status: number;
  /** true if HTTP 2xx and no error field */
  ok: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryOnCodes: number[];
}

export interface MediaOptions {
  caption?: string;
  filename?: string;
}

export interface WhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppTemplateResult extends WhatsAppMessageResult {}

export interface WhatsAppMediaUploadResult {
  success: boolean;
  mediaId?: string;
  error?: string;
}

export interface WhatsAppTemplatesResult {
  success: boolean;
  templates?: Record<string, unknown>[];
  error?: string;
  rawError?: unknown;
}

export interface WabaIdResult {
  success: boolean;
  wabaId?: string;
  error?: string;
}

export interface WhatsAppPhoneNumberResult {
  success: boolean;
  phoneNumber?: Record<string, unknown>;
  error?: string;
}

export interface WabaSubscribedAppsResult {
  success: boolean;
  apps?: Record<string, unknown>[];
  error?: string;
}

export interface SubscribeAppToWabaOptions {
  overrideCallbackUri?: string;
  verifyToken?: string;
}

export interface SubscribeAppToWabaResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}
