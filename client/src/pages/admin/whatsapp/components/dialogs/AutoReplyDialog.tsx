/**
 * AutoReplyDialog - حوار قواعد الرد التلقائي
 * يعرض قواعد الرد التلقائي ويسمح بتفعيلها/تعطيلها
 */

import { memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AutoReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoReplyRules: {
    id: number;
    name: string;
    triggerValue?: string | null | undefined;
    isActive: number;
  }[] | undefined;
  onToggleRule: (ruleId: number, enabled: boolean) => void;
  isPending: boolean;
}

const AutoReplyDialog = memo(function AutoReplyDialog({
  open,
  onOpenChange,
  autoReplyRules,
  onToggleRule,
  isPending,
}: AutoReplyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>قواعد الرد التلقائي</DialogTitle>
          <DialogDescription>
            تفعيل أو تعطيل قواعد الرد التلقائي لهذه المحادثة
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {autoReplyRules && Array.isArray(autoReplyRules)
            ? autoReplyRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">{rule.triggerValue}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={rule.isActive ? 'default' : 'outline'}
                    onClick={() => onToggleRule(rule.id, !rule.isActive)}
                    disabled={isPending}
                  >
                    {rule.isActive ? 'مفعل' : 'معطل'}
                  </Button>
                </div>
              ))
            : null}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default AutoReplyDialog;
