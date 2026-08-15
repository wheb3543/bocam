/**
 * SaveSearchDialog - حوار حفظ البحث
 * يسمح للمستخدم بحفظ البحث الحالي لاستخدامه لاحقاً
 */

import { memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchName: string;
  onSearchNameChange: (value: string) => void;
  searchQuery: string;
  onSave: () => void;
}

const SaveSearchDialog = memo(function SaveSearchDialog({
  open,
  onOpenChange,
  searchName,
  onSearchNameChange,
  searchQuery,
  onSave,
}: SaveSearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حفظ البحث</DialogTitle>
          <DialogDescription>احفظ البحث الحالي لاستخدامه لاحقاً</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="search-name">اسم البحث</Label>
            <Input
              id="search-name"
              value={searchName}
              onChange={(e) => onSearchNameChange(e.target.value)}
              placeholder="مثال: عملاء غير مقروءين"
              dir="rtl"
            />
          </div>
          <div>
            <Label>نص البحث</Label>
            <p className="text-sm text-muted-foreground mt-1">{searchQuery}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onSave} disabled={false}>
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default SaveSearchDialog;
