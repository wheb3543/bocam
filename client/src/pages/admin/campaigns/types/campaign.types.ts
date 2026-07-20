/**
 * Campaign Types
 * تعريفات الأنواع الخاصة بالحملات التسويقية
 */

export interface Campaign {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  type: 'digital' | 'field' | 'awareness' | 'mixed';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  plannedBudget?: number | null;
  actualBudget?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  targetLeads?: number | null;
  targetBookings?: number | null;
  targetRevenue?: string | null;
  platforms?: string | null;
  teamMembers?: string | null;
  kpis?: string | null;
  notes?: string | null;
  actualLeads?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CampaignFormData {
  name: string;
  slug: string;
  description: string;
  type: string;
  status: string;
  plannedBudget: string;
  actualBudget: string;
  targetLeads: string;
  targetBookings: string;
  targetRevenue: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  teamMembers: string;
  kpis: string;
  notes: string;
}

export const initialFormData: CampaignFormData = {
  name: '',
  slug: '',
  description: '',
  type: 'digital',
  status: 'draft',
  plannedBudget: '',
  actualBudget: '',
  targetLeads: '',
  targetBookings: '',
  targetRevenue: '',
  startDate: '',
  endDate: '',
  platforms: [],
  teamMembers: '',
  kpis: '',
  notes: '',
};

export const platformOptions = [
  { value: 'facebook', label: 'فيسبوك' },
  { value: 'instagram', label: 'إنستغرام' },
  { value: 'google', label: 'جوجل' },
  { value: 'twitter', label: 'تويتر' },
  { value: 'tiktok', label: 'تيك توك' },
  { value: 'snapchat', label: 'سناب شات' },
  { value: 'youtube', label: 'يوتيوب' },
  { value: 'linkedin', label: 'لينكد إن' },
  { value: 'email', label: 'بريد إلكتروني' },
  { value: 'sms', label: 'رسائل SMS' },
  { value: 'whatsapp', label: 'واتساب' },
  { value: 'outdoor', label: 'إعلانات خارجية' },
  { value: 'tv', label: 'تلفزيون' },
  { value: 'radio', label: 'راديو' },
];
