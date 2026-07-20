/**
 * CategoryBadge - شارة فئة القالب
 */

import { Badge } from '@/components/ui/badge';

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const map: Record<string, { label: string; color: string }> = {
    confirmation: { label: 'تأكيد', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    reminder: { label: 'تذكير', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    followup: { label: 'متابعة', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    thank_you: { label: 'شكر', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    welcome: { label: 'ترحيب', color: 'bg-green-100 text-green-700 border-green-200' },
    cancellation: { label: 'إلغاء', color: 'bg-red-100 text-red-700 border-red-200' },
    update: { label: 'تحديث', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    custom: { label: 'مخصص', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    UTILITY: { label: 'خدمات', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    MARKETING: { label: 'تسويق', color: 'bg-violet-100 text-violet-700 border-violet-200' },
    AUTHENTICATION: { label: 'مصادقة', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  };

  const cfg = map[category] || { label: category, color: 'bg-gray-100 text-gray-600' };

  return (
    <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
      {cfg.label}
    </Badge>
  );
}
