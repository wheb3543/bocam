/**
 * ExportConversationDialog - حوار تصدير المحادثة
 * يسمح للمستخدم بتصدير المحادثة بتنسيق JSON أو CSV
 */

import { memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportFormatType } from '../../types/whatsapp.types';

interface ExportConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportFormat: ExportFormatType;
  onExportFormatChange: (value: ExportFormatType) => void;
  onExport: () => void;
  isLoading: boolean;
}

const ExportConversationDialog = memo(function ExportConversationDialog({
  open,
  onOpenChange,
  exportFormat,
  onExportFormatChange,
  onExport,
  isLoading,
}: ExportConversationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تصدير المحادثة</DialogTitle>
          <DialogDescription>اختر تنسيق التصدير</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>تنسيق التصدير</Label>
            <Select
              value={exportFormat}
              onValueChange={(value: ExportFormatType) => onExportFormatChange(value)}
            >
              <SelectTrigger dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onExport} disabled={isLoading}>
            {isLoading ? 'جاري التصدير...' : 'تصدير'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ExportConversationDialog;
