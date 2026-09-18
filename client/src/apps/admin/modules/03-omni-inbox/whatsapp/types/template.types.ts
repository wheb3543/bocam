/**
 * Template Types
 * تعريفات الأنواع الخاصة بقوالب WhatsApp
 */

export interface Template {
  id: number;
  name: string;
  content: string;
  category: string;
  variables?: string | null;
  isActive: number;
  metaName?: string | null;
  metaStatus?: string | null;
  languageCode?: string | null;
  headerType?: string | null;
  headerContent?: string | null;
  headerText?: string | null;
  footerContent?: string | null;
  footerText?: string | null;
  buttons?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface TemplateButton {
  type?: string;
  text?: string;
  [key: string]: unknown;
}

export interface TemplateStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export type LucideIcon = React.ComponentType<{ className?: string }>;

// القوالب المستخدمة في الرسائل التلقائية
export const AUTO_TEMPLATES: Record<string, string> = {
  appointment_confirmation: 'تأكيد الموعد تلقائياً',
  appointment_reminder: 'تذكير 24ساعة / 1ساعة تلقائياً',
  missed_appointment: 'موعد فائت (يدوي)',
};
