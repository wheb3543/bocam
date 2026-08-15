/**
 * Media Team Page Types
 * أنواع صفحة فريق الإعلام
 */

import type { RouterOutputs } from '@/types/trpc';

// أنواع المهام - متوافقة مع schema قاعدة البيانات
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
// التصنيفات المدعومة في قاعدة البيانات
export type TaskCategory = 'content' | 'design' | 'ads' | 'seo' | 'social_media' | 'analytics' | 'other';

export type UserEntity = RouterOutputs['users']['getAll'][number];
export type CampaignEntity = RouterOutputs['campaigns']['list'][number];

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignedTo: number | null;
  assignedUser?: { id: number; name: string | null; username: string } | null;
  campaignId: number | null;
  campaign?: { id: number; name: string } | null;
  dueDate: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags?: string | null;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignedToId: string;
  campaignId: string;
  dueDate: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  review: number;
  completed: number;
  overdue: number;
}
