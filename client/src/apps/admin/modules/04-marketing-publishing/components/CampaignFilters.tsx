/**
 * CampaignFilters - فلاتر الحملات
 */

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface CampaignFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}

export function CampaignFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: CampaignFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="relative flex-1">
        <Search className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <Input
          placeholder="بحث في الحملات..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-8 sm:pr-10 text-sm"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[160px] text-sm">
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الحالات</SelectItem>
          <SelectItem value="draft">مسودة</SelectItem>
          <SelectItem value="active">نشطة</SelectItem>
          <SelectItem value="paused">متوقفة</SelectItem>
          <SelectItem value="completed">مكتملة</SelectItem>
          <SelectItem value="cancelled">ملغاة</SelectItem>
        </SelectContent>
      </Select>
      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-full sm:w-[160px] text-sm">
          <SelectValue placeholder="النوع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الأنواع</SelectItem>
          <SelectItem value="digital">رقمية</SelectItem>
          <SelectItem value="field">ميدانية</SelectItem>
          <SelectItem value="awareness">توعوية</SelectItem>
          <SelectItem value="mixed">مختلطة</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
