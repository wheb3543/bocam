/**
 * Color Scheme Dialog Component
 * مكون حوار نظام الألوان
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, AlertCircle, XCircle, Download, Upload } from 'lucide-react';
import type { ColorSchemeFormData } from '../../types/content.types';
import { colorTypeOptions, colorShadeOptions } from '../../types/content.types';

interface ColorSchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: ColorSchemeFormData;
  onFormDataChange: (data: ColorSchemeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  onSaveVersion?: () => void;
}

/**
 * ColorSchemeDialog - مكون حوار نظام الألوان
 */
export function ColorSchemeDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  onSaveVersion,
}: ColorSchemeDialogProps) {
  // Color Contrast Validation Functions
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return 0;
    }

    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    const a = [r, g, b].map((v) => {
      if (v <= 0.03928) {
        return v / 12.92;
      }
      return Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const getContrastRatio = (hex1: string, hex2: string) => {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const getContrastStatus = () => {
    if (!formData.value) {
      return { status: 'warning', message: 'اللون مطلوب' };
    }

    // Check against white (#ffffff) and black (#000000)
    const whiteContrast = getContrastRatio(formData.value, '#ffffff');
    const blackContrast = getContrastRatio(formData.value, '#000000');

    const maxContrast = Math.max(whiteContrast, blackContrast);

    if (maxContrast >= 4.5) {
      return { status: 'success', message: `التباين ممتاز (${maxContrast.toFixed(2)}:1)` };
    }
    if (maxContrast >= 3.0) {
      return { status: 'warning', message: `التباين مقبول (${maxContrast.toFixed(2)}:1)` };
    }
    return { status: 'error', message: `التباين ضعيف (${maxContrast.toFixed(2)}:1)` };
  };

  const renderStatusIcon = (status: string) => {
    if (status === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (status === 'warning') {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const contrastStatus = getContrastStatus();

  const handleExportColors = () => {
    const colorData = {
      key: formData.key,
      value: formData.value,
      type: formData.type,
      shade: formData.shade,
      isActive: formData.isActive,
    };

    const blob = new Blob([JSON.stringify(colorData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-${formData.key}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportColors = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        onFormDataChange({
          ...formData,
          key: importedData.key || formData.key,
          value: importedData.value || formData.value,
          type: importedData.type || formData.type,
          shade: importedData.shade || formData.shade,
          isActive: importedData.isActive || formData.isActive,
        });
      } catch (error) {
        console.error('فشل في استيراد الألوان:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'إضافة لون جديد' : 'تعديل اللون'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'أضف لون جديد لنظام الألوان' : 'عدل اللون الموجود'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Key */}
            <div className="grid gap-2">
              <Label htmlFor="key">المفتاح *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => onFormDataChange({ ...formData, key: e.target.value })}
                placeholder="مثال: primary.500"
                disabled={mode === 'edit'}
                required
              />
            </div>

            {/* Value */}
            <div className="grid gap-2">
              <Label htmlFor="value">قيمة اللون *</Label>
              <div className="flex gap-2">
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => onFormDataChange({ ...formData, value: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                  required
                />
                <div
                  className="w-12 h-10 rounded border"
                  style={{ backgroundColor: formData.value }}
                  aria-label="معاينة اللون"
                />
              </div>
              <div className="flex items-center gap-1 text-xs">
                {renderStatusIcon(contrastStatus.status)}
                <span
                  className={
                    contrastStatus.status === 'error'
                      ? 'text-red-500'
                      : contrastStatus.status === 'warning'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                  }
                >
                  {contrastStatus.message}
                </span>
              </div>
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">النوع *</Label>
              <Select
                value={formData.type}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange={(value) => onFormDataChange({ ...formData, type: value as any })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {colorTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shade */}
            <div className="grid gap-2">
              <Label htmlFor="shade">الدرجة</Label>
              <Select
                value={formData.shade}
                onValueChange={(value) => onFormDataChange({ ...formData, shade: value })}
              >
                <SelectTrigger id="shade">
                  <SelectValue placeholder="اختر الدرجة" />
                </SelectTrigger>
                <SelectContent>
                  {colorShadeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive === 'yes'}
                onCheckedChange={(checked) =>
                  onFormDataChange({ ...formData, isActive: checked ? 'yes' : 'no' })
                }
              />
              <Label htmlFor="isActive">نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              {mode === 'edit' && onSaveVersion && (
                <Button type="button" variant="outline" onClick={onSaveVersion}>
                  حفظ نسخة
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleExportColors}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                تصدير
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('import-colors')?.click()}
                className="flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                استيراد
              </Button>
              <input
                id="import-colors"
                type="file"
                accept=".json"
                onChange={handleImportColors}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'جاري الحفظ...' : mode === 'create' ? 'إضافة' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
