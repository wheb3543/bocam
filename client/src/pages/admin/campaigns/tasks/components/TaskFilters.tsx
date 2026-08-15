/**
 * TaskFilters - فلاتر المهام
 * يعرض فلاتر البحث والعرض للمهام
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, LayoutGrid, List } from 'lucide-react';
import type { ViewMode } from '../types/task.types';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const TaskFilters = memo(function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  viewMode,
  onViewModeChange,
}: TaskFiltersProps) {
  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
              <Search className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في المهام..."
                className="pe-8 sm:pe-9 text-sm"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[120px] sm:w-[140px] text-sm">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="todo">قيد الانتظار</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="review">مراجعة</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
              <SelectTrigger className="w-[120px] sm:w-[140px] text-sm">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
                <SelectItem value="urgent">عاجلة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="w-[120px] sm:w-[140px] text-sm">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                <SelectItem value="content">محتوى</SelectItem>
                <SelectItem value="design">تصميم</SelectItem>
                <SelectItem value="ads">إعلانات</SelectItem>
                <SelectItem value="seo">SEO</SelectItem>
                <SelectItem value="social_media">سوشيال ميديا</SelectItem>
                <SelectItem value="analytics">تحليلات</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 border rounded-lg p-0.5 sm:p-1">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('kanban')}
              className="h-8 text-xs sm:text-sm"
            >
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 me-1" />
              <span className="hidden sm:inline">Kanban</span>
              <span className="sm:hidden">K</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8 text-xs sm:text-sm"
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4 me-1" />
              <span className="hidden sm:inline">قائمة</span>
              <span className="sm:hidden">ق</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default TaskFilters;
