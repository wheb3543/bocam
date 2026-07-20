/**
 * User Types - تعريفات الأنواع لصفحة إدارة المستخدمين
 * تعريفات الأنواع المشتركة لإدارة المستخدمين
 */

import type { RouterOutputs, RouterInputs } from '@/types/trpc';

export type User = RouterOutputs['users']['getAll'][number];
export type AccessRequest = RouterOutputs['accessRequests']['pending'][number];

export const roleLabels: Record<string, string> = {
  admin: 'مسؤول',
  manager: 'مدير',
  staff: 'موظف',
  viewer: 'مشاهد',
  user: 'مستخدم',
  team_leader: 'قائد فريق',
};

export const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  manager: 'bg-blue-100 text-blue-800 border-blue-200',
  staff: 'bg-green-100 text-green-800 border-green-200',
  viewer: 'bg-muted text-foreground border-border',
  user: 'bg-purple-100 text-purple-800 border-purple-200',
  team_leader: 'bg-orange-100 text-orange-800 border-orange-200',
};

export interface UserFormData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: RouterInputs['users']['create']['role'];
  isActive: 'yes' | 'no';
}

export type ActiveSection = 'users' | 'requests' | 'activity';
