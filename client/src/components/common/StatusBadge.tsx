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
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
  warning: {
    variant: 'default',
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
  error: {
    variant: 'destructive',
    className: '',
  },
  info: {
    variant: 'default',
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  neutral: {
    variant: 'secondary',
    className: '',
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
