/**
 * StatsBar - شريط الإحصائيات للمحادثات
 * يعرض إحصائيات سريعة عن المحادثات (الكل، نشطة، غير مقروءة، نتائج مختبر، مهمة)
 */

import { memo } from 'react';
import { MessageSquare, Users, MessageCircle, FileText, Star } from 'lucide-react';
import { Conversation } from '../../types/whatsapp.types';

interface StatsBarProps {
  conversations: Conversation[] | undefined;
}

const StatsBar = memo(function StatsBar({ conversations }: StatsBarProps) {
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const total = safeConversations.length;
  const unread = safeConversations.filter((c) => c.unreadCount > 0).length;
  const important = safeConversations.filter((c) => c.isImportant === 1).length;
  const labResults = safeConversations.filter(
    (c) => c.labOrderId !== null && c.labOrderId !== undefined
  ).length;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const active = safeConversations.filter(
    (c) => !c.isArchived && c.lastMessageAt && new Date(c.lastMessageAt) >= sevenDaysAgo
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
      {[
        {
          label: 'الكل',
          value: total,
          icon: MessageSquare,
          color: 'text-[var(--whatsapp-blue)]',
          bg: 'bg-[var(--whatsapp-blue)]/10 dark:bg-[var(--whatsapp-blue)]/20',
        },
        {
          label: 'نشطة',
          value: active,
          icon: Users,
          color: 'text-[var(--whatsapp-green)]',
          bg: 'bg-[var(--whatsapp-green)]/10 dark:bg-[var(--whatsapp-green)]/20',
        },
        {
          label: 'غير مقروءة',
          value: unread,
          icon: MessageCircle,
          color: 'text-[var(--whatsapp-orange)]',
          bg: 'bg-[var(--whatsapp-orange)]/10 dark:bg-[var(--whatsapp-orange)]/20',
        },
        {
          label: 'نتائج مختبر',
          value: labResults,
          icon: FileText,
          color: 'text-purple-600',
          bg: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
          label: 'مهمة',
          value: important,
          icon: Star,
          color: 'text-[var(--whatsapp-yellow)]',
          bg: 'bg-[var(--whatsapp-yellow)]/10 dark:bg-[var(--whatsapp-yellow)]/20',
        },
      ].map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className={`${bg} rounded-lg p-1.5 sm:p-2 md:p-3 text-center`}>
          <Icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 ${color} mx-auto mb-0.5`} />
          <p className={`text-xs sm:text-sm md:text-base font-bold ${color}`}>{value}</p>
          <p className="text-[10px] sm:text-[var(--text-xs)] text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
});

export default StatsBar;
