/**
 * ConfirmActionDialog - حوار تأكيد الإجراءات
 * يطلب من المستخدم تأكيد الإجراءات المهمة (حذف، أرشفة، إلخ)
 */

import { memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmDialogAction } from '../../types/whatsapp.types';

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ConfirmDialogAction | null;
  onConfirm: () => void;
  isPending: boolean;
}

const ConfirmActionDialog = memo(function ConfirmActionDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
  isPending,
}: ConfirmActionDialogProps) {
  const getActionMessage = () => {
    if (!action) {
      return '';
    }
    switch (action.action) {
      case 'archive':
        return 'هل أنت متأكد من أرشفة هذه المحادثة؟';
      case 'unarchive':
        return 'هل أنت متأكد من إلغاء أرشفة هذه المحادثة؟';
      case 'bulk-archive':
        return `هل أنت متأكد من أرشفة ${action.ids?.length || 0} محادثة؟`;
      case 'bulk-important':
        return `هل أنت متأكد من تعيين ${action.ids?.length || 0} محادثة كمهمة؟`;
      case 'delete':
        return 'هل أنت متأكد من حذف هذه المحادثة وجميع رسائلها؟ لا يمكن التراجع عن هذا الإجراء.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تأكيد العملية</DialogTitle>
          <DialogDescription>{getActionMessage()}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            تأكيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ConfirmActionDialog;
