/**
 * TemplateFilters - فلاتر القوالب
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

interface TemplateFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
}

export function TemplateFilters({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
}: TemplateFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="بحث في القوالب..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-8 h-8 text-sm"
        />
      </div>
      <Select value={filterStatus} onValueChange={onFilterStatusChange}>
        <SelectTrigger className="h-8 text-xs w-full sm:w-36">
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الحالات</SelectItem>
          <SelectItem value="APPROVED">معتمدة</SelectItem>
          <SelectItem value="PENDING">قيد المراجعة</SelectItem>
          <SelectItem value="REJECTED">مرفوضة</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
        <SelectTrigger className="h-8 text-xs w-full sm:w-36">
          <SelectValue placeholder="الفئة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الفئات</SelectItem>
          <SelectItem value="UTILITY">خدمات (Utility)</SelectItem>
          <SelectItem value="MARKETING">تسويق (Marketing)</SelectItem>
          <SelectItem value="AUTHENTICATION">مصادقة (Authentication)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
