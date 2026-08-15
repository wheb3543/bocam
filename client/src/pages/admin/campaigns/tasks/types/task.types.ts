/**
 * Task Types - تعريفات الأنواع للمهام
 * تعريفات الأنواع المشتركة لإدارة مهام التسويق الرقمي
 */

import type { RouterOutputs } from '@/types/trpc';

export type Task = RouterOutputs['tasks']['list'][number];
export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
export type TaskCategory = Task['category'];
export type Comment = RouterOutputs['tasks']['getComments'][number];
export type Attachment = RouterOutputs['tasks']['getAttachments'][number];
export type UserEntity = RouterOutputs['users']['getAll'][number];
export type CampaignEntity = RouterOutputs['campaigns']['list'][number];

export type ViewMode = 'kanban' | 'list';

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  assignedTo: string;
  campaignId: string;
  dueDate: string;
  estimatedHours: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  completed: number;
  overdue: number;
}
