/**
 * StatusBadge - شارة حالة القالب
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertCircle, X, Info } from 'lucide-react';
import type { LucideIcon } from '../types/template.types';

interface StatusBadgeProps {
  status?: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="outline" className="text-[10px] gap-1">
        <Clock className="h-2.5 w-2.5" />
        غير محدد
      </Badge>
    );
  }

  const map: Record<string, { label: string; icon: LucideIcon; className: string }> = {
    APPROVED: {
      label: 'معتمد',
      icon: CheckCircle2,
      className:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    },
    PENDING: {
      label: 'قيد المراجعة',
      icon: Clock,
      className:
        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    REJECTED: {
      label: 'مرفوض',
      icon: XCircle,
      className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    },
    PAUSED: {
      label: 'موقوف',
      icon: AlertCircle,
      className: 'bg-orange-100 text-orange-700 border-orange-200',
    },
    DISABLED: {
      label: 'معطّل',
      icon: X,
      className: 'bg-gray-100 text-gray-600 border-gray-200',
    },
  };

  const cfg = map[status] || { label: status, icon: Info, className: 'bg-gray-100 text-gray-600' };
  const Icon = cfg.icon;

  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${cfg.className}`}>
      <Icon className="h-2.5 w-2.5" />
      {cfg.label}
    </Badge>
  );
}
