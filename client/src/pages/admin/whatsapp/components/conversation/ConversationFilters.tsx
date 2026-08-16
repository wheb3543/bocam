/**
 * ConversationFilters - فلاتر المحادثات
 * يعرض تبويبات الفلترة والفلتر المتقدم للتواريخ
 */

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      <div className="px-3 py-2 border-b dark:border-gray-800 bg-white dark:bg-gray-800/80 shadow-xs">
        <Tabs value={activeFilter} onValueChange={(v) => onFilterChange(v as FilterType)}>
          <TabsList className="h-8 w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 bg-gray-100/80 dark:bg-gray-900/80 p-0.5 gap-0.5">
            <TabsTrigger
              value="all"
              className="text-[11px] h-7 px-1 font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              الكل
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="text-[11px] h-7 px-1 font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              غير مقروءة
              {unreadCount > 0 ? (
                <Badge
                  variant="destructive"
                  className="mr-1 h-3.5 px-1 text-[9px] rounded-full font-semibold animate-pulse"
                >
                  {unreadCount}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger
              value="important"
              className="text-[11px] h-7 px-1 font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              مهمة
            </TabsTrigger>
            <TabsTrigger
              value="lab_results"
              className="text-[11px] h-7 px-1 font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              مختبر
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="text-[11px] h-7 px-1 font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              مؤرشفة
            </TabsTrigger>
            <TabsTrigger
              value="unnamed"
              className="text-[11px] h-7 px-1 font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              بدون اسم
            </TabsTrigger>
            <TabsTrigger
              value="unreplied"
              className="text-[11px] h-7 px-1 font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              لم يُرد
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Advanced Filters */}
      <div className="px-3 py-1.5 flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/50 border-b dark:border-gray-800">
        <span className="text-xs text-muted-foreground font-medium">تصفية زمنية:</span>
        <Select value={dateFilter} onValueChange={(v) => onDateFilterChange(v as DateFilterType)}>
          <SelectTrigger className="h-7 w-32 text-xs bg-white dark:bg-gray-800 border shadow-sm">
            <SelectValue placeholder="اختر الفترة" />
          </SelectTrigger>
          <SelectContent dir="rtl">
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
