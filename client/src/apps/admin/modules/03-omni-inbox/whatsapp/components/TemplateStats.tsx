/**
 * TemplateStats - بطاقات إحصائيات القوالب
 */

import { FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { TemplateStats as TemplateStatsType } from '../types/template.types';

interface TemplateStatsProps {
  stats: TemplateStatsType;
}

export function TemplateStats({ stats }: TemplateStatsProps) {
  const statsData = [
    {
      label: 'إجمالي القوالب',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'معتمدة',
      value: stats.approved,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'قيد المراجعة',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'مرفوضة',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statsData.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className={`${bg} rounded-xl p-3 sm:p-4`}>
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
