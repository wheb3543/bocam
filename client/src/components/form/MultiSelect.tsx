import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  itemLabel?: string;
  pluralLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'اختر...',
  className,
  itemLabel = 'عنصر',
  pluralLabel,
  searchPlaceholder = 'ابحث في القائمة...',
  emptyMessage = 'لا توجد نتائج مطابقة',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleSelectAll = () => {
    onChange(options.map((opt) => opt.value));
  };

  const selectedLabels = selected
    .map((val) => options.find((opt) => opt.value === val)?.label)
    .filter(Boolean);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('ar');
    if (!normalizedSearch) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLocaleLowerCase('ar').includes(normalizedSearch)
    );
  }, [options, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label={placeholder}
          aria-expanded={open}
          className={cn(
            'w-full justify-between text-right',
            selected.length === 0 && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden text-right">
            {selected.length === 0 ? (
              <span>{placeholder}</span>
            ) : selected.length === 1 ? (
              <span>{selectedLabels[0]}</span>
            ) : (
              <span>
                تم اختيار {selected.length}{' '}
                {selected.length === 1 ? itemLabel : (pluralLabel ?? `${itemLabel}ات`)}
              </span>
            )}
          </div>
          <ChevronDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] p-0 sm:w-[360px]" align="end" dir="rtl">
        <div className="max-h-[min(24rem,calc(100vh-12rem))] overflow-auto">
          {/* Header with Select All / Clear All */}
          <div className="sticky top-0 z-10 space-y-2 border-b bg-popover p-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-md border bg-background py-2 pr-9 pl-3 text-start text-sm outline-none focus:ring-2 focus:ring-ring"
                aria-label={searchPlaceholder}
                dir="auto"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-8 text-xs">
                اختر الكل
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 text-xs"
                disabled={selected.length === 0}
              >
                مسح الكل
              </Button>
            </div>
          </div>

          {/* Options List */}
          <div className="p-1">
            {filteredOptions.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            )}
            {filteredOptions.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-right hover:bg-accent',
                    isSelected && 'bg-accent'
                  )}
                >
                  <div
                    className={cn(
                      'h-4 w-4 border rounded flex items-center justify-center shrink-0',
                      isSelected ? 'bg-primary border-primary' : 'border-input'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="flex-1 text-sm leading-5">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Items Preview */}
        {selected.length > 0 && (
          <div className="border-t p-2">
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((label, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const value = options.find((opt) => opt.label === label)?.value;
                      if (value) {
                        handleToggle(value);
                      }
                    }}
                    className="mr-1 hover:bg-muted rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
