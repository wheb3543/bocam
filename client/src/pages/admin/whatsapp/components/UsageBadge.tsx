/**
 * UsageBadge - شارة استخدام القالب
 */

import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { AUTO_TEMPLATES } from '../types/template.types';

interface UsageBadgeProps {
  metaName?: string | null;
}

export function UsageBadge({ metaName }: UsageBadgeProps) {
  if (!metaName || !AUTO_TEMPLATES[metaName]) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className="text-[10px] gap-1 bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300"
    >
      <Zap className="h-2.5 w-2.5" />
      {AUTO_TEMPLATES[metaName]}
    </Badge>
  );
}
