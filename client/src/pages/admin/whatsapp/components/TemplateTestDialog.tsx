/**
 * TemplateTestDialog - حوار اختبار إرسال القالب
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Send, Loader2 } from 'lucide-react';
import { processPhoneInput } from '@/hooks/form/usePhoneFormat';
import type { Template } from '../types/template.types';

interface TemplateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  testPhone: string;
  onTestPhoneChange: (value: string) => void;
  onSend: () => void;
  isPending: boolean;
}

export function TemplateTestDialog({
  open,
  onOpenChange,
  template,
  testPhone,
  onTestPhoneChange,
  onSend,
  isPending,
}: TemplateTestDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          onTestPhoneChange('');
        }
      }}
    >
      <DialogContent className="sm:max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4 text-green-600" />
            اختبار إرسال القالب
          </DialogTitle>
          <DialogDescription>
            إرسال قالب <strong>{template?.name}</strong> إلى رقم هاتف للاختبار
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>رقم الهاتف للاختبار</Label>
            <Input
              placeholder="7XXXXXXXX"
              value={testPhone}
              onChange={(e) => onTestPhoneChange(processPhoneInput(e.target.value))}
              dir="ltr"
            />
            <p className="text-[10px] text-muted-foreground">
              أدخل رقم هاتف يمني (9 أرقام تبدأ بـ 7)
            </p>
          </div>
          {template && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800 dark:text-amber-300">
              <strong>ملاحظة:</strong> سيتم إرسال القالب "
              {template.metaName || template.name}" باللغة{' '}
              {template.languageCode || 'ar'}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={onSend}
            disabled={isPending || !testPhone.trim()}
            className="bg-green-600 hover:bg-green-700 gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            إرسال الاختبار
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
