/**
 * Link Entity Dialog Component
 * مكون حوار ربط الكيان
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

interface LinkEntityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'lead' | 'appointment' | 'offer' | 'camp';
  onEntityTypeChange: (value: 'lead' | 'appointment' | 'offer' | 'camp') => void;
  entitySearch: string;
  onEntitySearchChange: (value: string) => void;
  onLink: () => void;
}

export default function LinkEntityDialog({
  isOpen,
  onOpenChange,
  entityType,
  onEntityTypeChange,
  entitySearch,
  onEntitySearchChange,
  onLink,
}: LinkEntityDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ربط المحادثة بكيان</DialogTitle>
          <DialogDescription>اختر نوع الكيان وحدد الكيان المراد ربطه</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="entity-type">نوع الكيان</Label>
            <Select
              value={entityType}
              onValueChange={(value) => {
                if (value === 'lead' || value === 'appointment' || value === 'offer' || value === 'camp') {
                  onEntityTypeChange(value);
                }
              }}
            >
              <SelectTrigger id="entity-type">
                <SelectValue placeholder="اختر نوع الكيان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">عميل محتمل</SelectItem>
                <SelectItem value="appointment">موعد طبي</SelectItem>
                <SelectItem value="offer">عرض طبي</SelectItem>
                <SelectItem value="camp">تسجيل مخيم</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="entity-search">البحث عن الكيان</Label>
            <Input
              id="entity-search"
              placeholder="ابحث بالاسم أو الهاتف..."
              value={entitySearch}
              onChange={(e) => onEntitySearchChange(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            ملاحظة: هذه الميزة قيد التطوير. سيتم إضافة البحث الفعلي والربط قريباً.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onLink}>ربط</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
