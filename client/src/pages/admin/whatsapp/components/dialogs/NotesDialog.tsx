/**
 * NotesDialog - حوار ملاحظات المحادثة
 * يسمح للمستخدم بإضافة ملاحظات حول المحادثة
 */

import { memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notesValue: string;
  onNotesValueChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const NotesDialog = memo(function NotesDialog({
  open,
  onOpenChange,
  notesValue,
  onNotesValueChange,
  onSave,
  isSaving,
}: NotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ملاحظات المحادثة</DialogTitle>
          <DialogDescription>أضف ملاحظات حول هذه المحادثة</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Textarea
            placeholder="اكتب ملاحظاتك هنا..."
            value={notesValue}
            onChange={(e) => onNotesValueChange(e.target.value)}
            rows={5}
            dir="rtl"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default NotesDialog;
