/**
 * TemplatePreviewDialog - حوار معاينة القالب
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Smartphone, Send } from 'lucide-react';
import type { Template } from '../types/template.types';
import { WhatsAppPreview } from './WhatsAppPreview';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onTest: () => void;
}

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
  onTest,
}: TemplatePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-green-600" />
            معاينة القالب
          </DialogTitle>
          <DialogDescription>{template?.name}</DialogDescription>
        </DialogHeader>
        {template && (
          <div className="py-2">
            <WhatsAppPreview template={template} />
            <Separator className="my-3" />
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الحالة:</span>
                <StatusBadge status={template.metaStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الفئة:</span>
                <CategoryBadge category={template.category} />
              </div>
              {template.languageCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">اللغة:</span>
                  <span>{template.languageCode}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          {template?.metaStatus === 'APPROVED' && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 gap-1.5"
              onClick={() => {
                onOpenChange(false);
                onTest();
              }}
            >
              <Send className="h-3.5 w-3.5" />
              اختبار الإرسال
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
