/**
 * ConversationFilters - فلاتر المحادثات
 * يعرض تبويبات الفلترة والفلتر المتقدم للتواريخ
 */

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterType, DateFilterType } from '../../types/whatsapp.types';

interface ConversationFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  dateFilter: DateFilterType;
  onDateFilterChange: (filter: DateFilterType) => void;
  allConversations: { unreadCount: number }[] | undefined;
}

const ConversationFilters = memo(function ConversationFilters({
  activeFilter,
  onFilterChange,
  dateFilter,
  onDateFilterChange,
  allConversations,
}: ConversationFiltersProps) {
  const unreadCount = Array.isArray(allConversations)
    ? allConversations.filter((c) => c.unreadCount > 0).length
    : 0;

  return (
    <>
      {/* Filter Tabs */}
      <div className="px-2 pt-2 pb-1 border-b dark:border-gray-800">
        <Tabs value={activeFilter} onValueChange={(v) => onFilterChange(v as FilterType)}>
          <TabsList className="h-7 w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 bg-muted/50">
            <TabsTrigger value="all" className="text-[10px] sm:text-[var(--text-xs)] h-6 px-1 text-xs">
              الكل
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-[10px] sm:text-[var(--text-xs)] h-6 px-1 text-xs">
              غير مقروءة
              {unreadCount > 0 ? (
                <Badge
                  variant="destructive"
                  className="mr-1 h-3 px-0.5 text-[8px] sm:h-3.5 sm:px-1 sm:text-[var(--text-xs)] rounded-full"
                >
                  {unreadCount}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="important" className="text-[10px] sm:text-[var(--text-xs)] h-6 px-1 text-xs">
              مهمة
            </TabsTrigger>
            <TabsTrigger value="lab_results" className="text-[10px] sm:text-[var(--text-xs)] h-6 px-1 text-xs md:inline">
              نتائج مختبر
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-[10px] sm:text-[var(--text-xs)] h-6 px-1 text-xs md:inline">
              مؤرشفة
            </TabsTrigger>
            <TabsTrigger value="unnamed" className="text-[10px] sm:text-[var(--text-xs)] h-6 px-1 text-xs md:inline">
              بدون اسم
            </TabsTrigger>
            <TabsTrigger value="unreplied" className="text-[10px] sm:text-[var(--text-xs)] h-6 px-1 text-xs md:inline">
              لم يُرد
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Advanced Filters */}
      <div className="px-2 pt-1 pb-1 flex gap-2 items-center">
        <Select
          value={dateFilter}
          onValueChange={(v) => onDateFilterChange(v as DateFilterType)}
        >
          <SelectTrigger className="h-6 text-[var(--text-xs)] bg-white/10 border-0 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التواريخ</SelectItem>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">آخر أسبوع</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
});

export default ConversationFilters;
