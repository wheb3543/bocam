/**
 * Media Team Page Configuration
 * تكوينات صفحة فريق الإعلام
 */

import { Palette, Video, Film, Camera, FileVideo, Clapperboard, Circle, Timer, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { TaskCategory, TaskStatus, TaskPriority } from './types';

// تصنيفات الإعلام - مع mapping للتصنيفات المدعومة في قاعدة البيانات
export const mediaCategories: { value: TaskCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'design', label: 'تصميم جرافيك', icon: <Palette className="w-4 h-4" /> },
  { value: 'content', label: 'إنتاج محتوى', icon: <Video className="w-4 h-4" /> },
  { value: 'social_media', label: 'سوشيال ميديا', icon: <Film className="w-4 h-4" /> },
  { value: 'ads', label: 'إعلانات', icon: <Camera className="w-4 h-4" /> },
  { value: 'analytics', label: 'تحليلات', icon: <FileVideo className="w-4 h-4" /> },
  { value: 'other', label: 'أخرى', icon: <Clapperboard className="w-4 h-4" /> },
];

export const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  todo: {
    label: 'قيد الانتظار',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: <Circle className="w-4 h-4" />,
  },
  in_progress: {
    label: 'قيد التنفيذ',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <Timer className="w-4 h-4" />,
  },
  review: {
    label: 'مراجعة',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  completed: {
    label: 'مكتمل',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  cancelled: {
    label: 'ملغي',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

export const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'منخفضة', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  medium: { label: 'متوسطة', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  high: { label: 'عالية', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  urgent: { label: 'عاجلة', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const getCategoryInfo = (category: TaskCategory) => {
  return (
    mediaCategories.find((c) => c.value === category) || mediaCategories[mediaCategories.length - 1]
  );
};
