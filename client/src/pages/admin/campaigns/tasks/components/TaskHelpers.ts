/**
 * TaskHelpers - دوال مساعدة للمهام
 * دوال مساعدة للتعامل مع حالات وأولويات وتصنيفات المهام
 */

import type { TaskStatus, TaskPriority, TaskCategory } from '../types/task.types';

export const getStatusLabel = (status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    todo: 'قيد الانتظار',
    in_progress: 'قيد التنفيذ',
    review: 'مراجعة',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    todo: 'bg-muted text-foreground border-border',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-muted text-foreground';
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  const labels: Record<TaskPriority, string> = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة',
  };
  return labels[priority] || priority;
};

export const getPriorityColor = (priority: TaskPriority): string => {
  const colors: Record<TaskPriority, string> = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
  };
  return colors[priority] || 'bg-muted text-muted-foreground';
};

export const getCategoryLabel = (category: TaskCategory): string => {
  const labels: Record<TaskCategory, string> = {
    content: 'محتوى',
    design: 'تصميم',
    ads: 'إعلانات',
    seo: 'SEO',
    social_media: 'سوشيال ميديا',
    analytics: 'تحليلات',
    other: 'أخرى',
  };
  return labels[category] || category;
};

export const getCategoryColor = (category: TaskCategory): string => {
  const colors: Record<TaskCategory, string> = {
    content: 'bg-purple-100 text-purple-600',
    design: 'bg-pink-100 text-pink-600',
    ads: 'bg-green-100 text-green-600',
    seo: 'bg-cyan-100 text-cyan-600',
    social_media: 'bg-indigo-100 text-indigo-600',
    analytics: 'bg-amber-100 text-amber-600',
    other: 'bg-muted text-muted-foreground',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

export const isOverdue = (dueDate: Date | null, status: TaskStatus): boolean => {
  if (!dueDate || status === 'completed' || status === 'cancelled') {return false;}
  return new Date(dueDate) < new Date();
};
