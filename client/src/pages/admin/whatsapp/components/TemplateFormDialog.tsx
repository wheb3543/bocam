/**
 * TemplateFormDialog - حوار إنشاء/تعديل القالب
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Check } from 'lucide-react';

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  name: string;
  content: string;
  category: string;
  language: string;
  onNameChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function TemplateFormDialog({
  open,
  onOpenChange,
  mode,
  name,
  content,
  category,
  language,
  onNameChange,
  onContentChange,
  onCategoryChange,
  onLanguageChange,
  onSubmit,
  isPending,
}: TemplateFormDialogProps) {
  const title = mode === 'create' ? 'إنشاء قالب جديد' : 'تعديل القالب';
  const description =
    mode === 'create'
      ? 'أنشئ قالب رسالة جديد لاستخدامه في الحملات'
      : 'تعديل تفاصيل القالب';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>
              اسم القالب {mode === 'create' && <span className="text-red-500">*</span>}
            </Label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="مثال: تأكيد_الحجز"
            />
            {mode === 'create' && (
              <p className="text-[10px] text-muted-foreground">
                يجب أن يكون باللغة الإنجليزية بدون مسافات (يُستخدم في Meta)
              </p>
            )}
          </div>
          {mode === 'create' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الفئة</Label>
                <Select value={category} onValueChange={onCategoryChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTILITY">خدمات (Utility)</SelectItem>
                    <SelectItem value="MARKETING">تسويق (Marketing)</SelectItem>
                    <SelectItem value="AUTHENTICATION">مصادقة (Authentication)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>اللغة</Label>
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية (ar)</SelectItem>
                    <SelectItem value="en">الإنجليزية (en)</SelectItem>
                    <SelectItem value="en_US">الإنجليزية الأمريكية (en_US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>
              محتوى الرسالة <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="مرحباً {{1}}، تم تأكيد حجزك بنجاح..."
              rows={5}
            />
            <p className="text-[10px] text-muted-foreground">
              استخدم {`{{1}}`}، {`{{2}}`}... للمتغيرات الديناميكية
            </p>
          </div>
          {content && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">معاينة</Label>
              <div className="bg-[#e5ddd5] rounded-lg p-3">
                <div className="bg-white rounded-lg p-2.5 shadow-sm text-sm">{content}</div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : mode === 'create' ? (
              <Plus className="h-4 w-4 ml-2" />
            ) : (
              <Check className="h-4 w-4 ml-2" />
            )}
            {mode === 'create' ? 'إنشاء' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
