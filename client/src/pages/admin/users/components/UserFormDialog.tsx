/**
 * UserFormDialog - حوار نموذج المستخدم
 * يعرض نموذج إنشاء/تعديل المستخدم
 */

import { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Loader2 } from 'lucide-react';
import type { User, UserFormData } from '../types/user.types';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UserFormData;
  onFormDataChange: (data: UserFormData) => void;
  editingUser: User | null;
  onSubmit: () => void;
  isPending: boolean;
  onReset: () => void;
}

const UserFormDialog = memo(function UserFormDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  editingUser,
  onSubmit,
  isPending,
  onReset,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={onReset} size="sm" className="flex-1 sm:flex-none">
          إضافة مستخدم
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
          </DialogTitle>
          <DialogDescription>
            {editingUser
              ? 'تحديث معلومات المستخدم'
              : 'إنشاء حساب مستخدم جديد في النظام'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">اسم المستخدم *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                onFormDataChange({ ...formData, username: e.target.value })
              }
              placeholder="أدخل اسم المستخدم"
              disabled={!!editingUser}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              كلمة المرور {editingUser ? '(اتركها فارغة لعدم التغيير)' : '*'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                onFormDataChange({ ...formData, password: e.target.value })
              }
              placeholder="أدخل كلمة المرور"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="أدخل الاسم الكامل"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              placeholder="example@domain.com"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">الدور *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'user' | 'admin' | 'manager' | 'staff' | 'viewer') =>
                onFormDataChange({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">مستخدم</SelectItem>
                <SelectItem value="viewer">مشاهد</SelectItem>
                <SelectItem value="staff">موظف</SelectItem>
                <SelectItem value="manager">مدير</SelectItem>
                <SelectItem value="admin">مسؤول</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="isActive">الحالة *</Label>
            <Select
              value={formData.isActive}
              onValueChange={(value: 'yes' | 'no') =>
                onFormDataChange({ ...formData, isActive: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">نشط</SelectItem>
                <SelectItem value="no">معطل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onReset();
              onOpenChange(false);
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            {editingUser ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default UserFormDialog;
