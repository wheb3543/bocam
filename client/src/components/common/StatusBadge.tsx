/**
 * StatusBadge Component
 * مكون شارة الحالة العام قابل لإعادة الاستخدام
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }
> = {
  success: {
    variant: 'outline',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
  },
  warning: {
    variant: 'outline',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
  },
  error: {
    variant: 'outline',
    className:
      'border-red-200 bg-red-50 text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
  },
  info: {
    variant: 'outline',
    className:
      'border-sky-200 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300',
  },
  neutral: {
    variant: 'secondary',
    className:
      'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || statusConfig.neutral;
  const displayLabel = label || status;

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {displayLabel}
    </Badge>
  );
}

// شارات الحالة الشائعة الجاهزة
export const CommonStatusBadges = {
  active: () => <StatusBadge status="success" label="نشط" />,
  inactive: () => <StatusBadge status="neutral" label="غير نشط" />,
  pending: () => <StatusBadge status="warning" label="قيد الانتظار" />,
  completed: () => <StatusBadge status="success" label="مكتمل" />,
  cancelled: () => <StatusBadge status="error" label="ملغي" />,
  rejected: () => <StatusBadge status="error" label="مرفوض" />,
  approved: () => <StatusBadge status="success" label="موافق عليه" />,
  processing: () => <StatusBadge status="info" label="قيد المعالجة" />,
  draft: () => <StatusBadge status="neutral" label="مسودة" />,
  published: () => <StatusBadge status="success" label="منشور" />,
};
