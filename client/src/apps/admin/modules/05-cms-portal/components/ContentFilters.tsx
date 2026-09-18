/**
 * Content Filters Component
 * مكون فلاتر المحتوى
 */

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import type { ContentFilters } from '../types/content.types';
import {
  languageOptions,
  sectionOptions,
  textContentTypeOptions,
  colorTypeOptions,
} from '../types/content.types';

interface ContentFiltersProps {
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
  type?: 'text' | 'images' | 'colors' | 'seo' | 'pages' | 'sections' | 'sectionButtons';
  pages?: Array<{ id: number; name: string; titleAr: string; titleEn: string }>;
}

/**
 * ContentFilters - مكون فلاتر المحتوى
 */
export function ContentFiltersComponent({
  filters,
  onFiltersChange,
  type = 'text',
  pages = [],
}: ContentFiltersProps) {
  const updateFilter = (key: keyof ContentFilters, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      searchQuery: '',
      language: 'all',
      section: 'all',
      type: 'all',
      isActive: 'all',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.language !== 'all' ||
    filters.section !== 'all' ||
    filters.type !== 'all' ||
    filters.isActive !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="pr-9"
          aria-label="بحث"
        />
      </div>

      {/* Language Filter */}
      <Select value={filters.language} onValueChange={(value) => updateFilter('language', value)}>
        <SelectTrigger className="w-full sm:w-[150px]" aria-label="اللغة">
          <SelectValue placeholder="اللغة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع اللغات</SelectItem>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Section Filter - for text and images */}
      {(type === 'text' || type === 'images') && (
        <Select value={filters.section} onValueChange={(value) => updateFilter('section', value)}>
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="القسم">
            <SelectValue placeholder="القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأقسام</SelectItem>
            {sectionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Page Filter - for sections and text */}
      {(type === 'sections' || type === 'text') && (
        <Select
          value={filters.pageId || 'all'}
          onValueChange={(value) => updateFilter('pageId', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="الصفحة">
            <SelectValue placeholder="الصفحة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الصفحات</SelectItem>
            {pages.map((page) => (
              <SelectItem key={page.id} value={page.id.toString()}>
                {page.name} ({page.titleAr})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Type Filter - for text and colors */}
      {type === 'text' && (
        <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="النوع">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {textContentTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Type Filter - for colors */}
      {type === 'colors' && (
        <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="النوع">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {colorTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Active Filter */}
      <Select value={filters.isActive} onValueChange={(value) => updateFilter('isActive', value)}>
        <SelectTrigger className="w-full sm:w-[150px]" aria-label="الحالة">
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="yes">نشط</SelectItem>
          <SelectItem value="no">غير نشط</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="icon"
          onClick={resetFilters}
          aria-label="إعادة تعيين الفلاتر"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
