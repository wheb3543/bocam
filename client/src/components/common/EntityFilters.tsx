import MultiSelect from '@/components/form/MultiSelect';
import SavedFilters from '@/components/SavedFilters';
import { ColumnVisibility, type ColumnConfig } from '@/components/table/ColumnVisibility';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Download, Printer, RotateCcw } from 'lucide-react';
import { SOURCE_OPTIONS } from '@shared/sources';
import type { ColumnTemplate } from '@/components/table/ColumnVisibility';

interface FilterParams {
  searchTerm?: string;
  [key: string]: unknown;
}

interface EntityFiltersProps {
  // Search
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Category filter (generic - can be doctors, camps, offers, etc.)
  categoryOptions?: Array<{ value: string; label: string }>;
  selectedCategory: string[];
  onCategoryChange: (value: string[]) => void;
  categoryPlaceholder?: string;

  // Date filter
  dateFilter: string;
  onDateFilterChange: (value: 'all' | 'today' | 'week' | 'month' | 'custom') => void;

  // Status filter
  statusOptions?: Array<{ value: string; label: string }>;
  statusFilter: string[];
  onStatusFilterChange: (value: string[]) => void;
  statusPlaceholder?: string;

  // Source filter
  sourceFilter: string[];
  onSourceFilterChange: (value: string[]) => void;

  // Active filter count & reset
  activeFilterCount: number;
  onResetAll: () => void;

  // Column visibility
  columns: ColumnConfig[];
  visibleColumns: Record<string, boolean>;
  columnOrder: string[];
  onVisibilityChange: (key: string, visible: boolean) => void;
  onColumnOrderChange: (order: string[]) => void;
  onResetColumns: () => void;

  // Column templates
  allTemplates: ColumnTemplate[];
  activeTemplateId: string | null;
  onApplyTemplate: (template: ColumnTemplate) => void;
  onSaveTemplate: (
    name: string,
    columns: Record<string, boolean>,
    columnOrder: string[],
    columnWidths?: Record<string, number>,
    frozenColumns?: string[]
  ) => void;
  onDeleteTemplate: (templateId: string) => void;

  // Column widths & frozen
  columnWidths: Record<string, number>;
  frozenColumns: string[];
  onToggleFrozen: (key: string) => void;

  // Admin
  isAdmin: boolean;
  sharedTemplates: ColumnTemplate[];
  onSaveSharedTemplate: (
    name: string,
    columns: Record<string, boolean>,
    columnOrder: string[],
    columnWidths?: Record<string, number>,
    frozenColumns?: string[]
  ) => void;
  onDeleteSharedTemplate: (dbId: number) => void;

  // Saved filters
  pageKey: 'appointments' | 'offerLeads' | 'campRegistrations' | 'customers';
  currentFilters: FilterParams;
  onApplyFilter: (filters: FilterParams) => void;

  // Export & Print
  onExport: (format: 'excel' | 'csv' | 'pdf') => void;
  onPrint: () => void;

  // Optional: Show/hide export buttons
  showExport?: boolean;
}

const DEFAULT_STATUS_OPTIONS = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'contacted', label: 'تم التواصل' },
  { value: 'no_answer', label: 'لم يرد' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'attended', label: 'حضر' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
];

export default function EntityFilters({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'ابحث...',
  categoryOptions = [],
  selectedCategory,
  onCategoryChange,
  categoryPlaceholder = 'الكل',
  dateFilter,
  onDateFilterChange,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  statusFilter,
  onStatusFilterChange,
  statusPlaceholder = 'كل الحالات',
  sourceFilter,
  onSourceFilterChange,
  activeFilterCount,
  onResetAll,
  columns,
  visibleColumns,
  columnOrder,
  onVisibilityChange,
  onColumnOrderChange,
  onResetColumns,
  allTemplates,
  activeTemplateId,
  onApplyTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  columnWidths,
  frozenColumns,
  onToggleFrozen,
  isAdmin,
  sharedTemplates,
  onSaveSharedTemplate,
  onDeleteSharedTemplate,
  pageKey,
  currentFilters,
  onApplyFilter,
  onExport,
  onPrint,
  showExport = true,
}: EntityFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1" />
        {showExport && (
          <>
            <Button variant="outline" size="sm" onClick={onPrint} className="gap-2 h-9">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">طباعة</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">تصدير</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport('excel')}>تصدير Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv')}>تصدير CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('pdf')}>تصدير PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <ColumnVisibility
          columns={columns}
          visibleColumns={visibleColumns}
          columnOrder={columnOrder}
          onVisibilityChange={onVisibilityChange}
          onColumnOrderChange={onColumnOrderChange}
          onReset={onResetColumns}
          templates={allTemplates}
          activeTemplateId={activeTemplateId}
          onApplyTemplate={onApplyTemplate}
          onSaveTemplate={onSaveTemplate}
          onDeleteTemplate={onDeleteTemplate}
          tableKey={pageKey}
          columnWidths={columnWidths}
          frozenColumns={frozenColumns}
          onToggleFrozen={onToggleFrozen}
          isAdmin={isAdmin}
          sharedTemplates={sharedTemplates}
          onSaveSharedTemplate={onSaveSharedTemplate}
          onDeleteSharedTemplate={onDeleteSharedTemplate}
        />
        <SavedFilters
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilter={onApplyFilter}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10 h-9"
          />
        </div>
        {categoryOptions.length > 0 && (
          <MultiSelect
            options={categoryOptions}
            selected={selectedCategory}
            onChange={onCategoryChange}
            placeholder={categoryPlaceholder}
            className="h-9"
          />
        )}
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="كل الفترات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفترات</SelectItem>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
          </SelectContent>
        </Select>
        <MultiSelect
          options={statusOptions}
          selected={statusFilter}
          onChange={onStatusFilterChange}
          placeholder={statusPlaceholder}
          className="h-9"
        />
        <MultiSelect
          options={SOURCE_OPTIONS}
          selected={sourceFilter}
          onChange={onSourceFilterChange}
          placeholder="كل المصادر"
          className="h-9"
        />
      </div>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetAll}
            className="gap-1 text-muted-foreground hover:text-foreground h-8"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            إعادة تعيين الفلاتر ({activeFilterCount})
          </Button>
        </div>
      )}
    </div>
  );
}
