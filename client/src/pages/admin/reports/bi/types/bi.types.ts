/**
 * BI Types - تعريفات الأنواع لصفحة ذكاء الأعمال
 * تعريفات الأنواع المشتركة لإدارة بيانات BI
 */

export type DateRange = '7d' | '30d' | '90d' | 'custom';

export interface DateRangeResult {
  start: string;
  end: string;
}

export interface ConversionFunnelData {
  totalSessions: number;
  formOpens: number;
  formStarts: number;
  abandoned: number;
  converted: number;
}

export interface SourceData {
  source: string;
  total: number;
  conversions: number;
  rate: number;
}

export interface CampaignData {
  campaign: string;
  source: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
}

export interface DailyStat {
  date: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
}

export interface Trends {
  totalSessions: number;
  converted: number;
  abandoned: number;
  conversionRate: number;
}

export interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  color?: keyof typeof COLORS;
}

export const COLORS = {
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  purple: '#7c3aed',
  pink: '#db2777',
  orange: '#ea580c',
};

export const SOURCE_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  whatsapp: '#25D366',
  google: '#4285F4',
  direct: '#6B7280',
  twitter: '#1DA1F2',
  telegram: '#2CA5E0',
  'غير محدد': '#9CA3AF',
};
