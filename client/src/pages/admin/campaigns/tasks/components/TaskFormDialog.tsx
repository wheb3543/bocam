/**
 * TaskFormDialog - حوار إنشاء/تعديل المهمة
 * نموذج لإنشاء أو تعديل المهام
 */

import { memo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/api/trpc';
import type { Task, TaskFormData, UserEntity, CampaignEntity } from '../types/task.types';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSuccess: () => void;
}

const TaskFormDialog = memo(function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}: TaskFormDialogProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    category: task?.category || 'other',
    assignedTo: task?.assignedTo?.toString() || '',
    campaignId: task?.campaignId?.toString() || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedHours: task?.estimatedHours?.toString() || '',
  });

  const { data: users } = trpc.users.getAll.useQuery();
  const { data: campaigns } = trpc.campaigns.list.useQuery();

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء المهمة بنجاح');
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل إنشاء المهمة');
    },
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث المهمة بنجاح');
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'فشل تحديث المهمة');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
      status: formData.status as 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled',
      category: formData.category as
        | 'content'
        | 'design'
        | 'ads'
        | 'seo'
        | 'social_media'
        | 'analytics'
        | 'other',
      assignedTo:
        formData.assignedTo && formData.assignedTo !== 'none'
          ? parseInt(formData.assignedTo)
          : undefined,
      campaignId:
        formData.campaignId && formData.campaignId !== 'none'
          ? parseInt(formData.campaignId)
          : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
    };

    if (task) {
      updateMutation.mutate({ id: task.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان المهمة *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>الأولوية</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' | 'urgent' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">قيد الانتظار</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="review">مراجعة</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>التصنيف</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as 'content' | 'design' | 'ads' | 'seo' | 'social_media' | 'analytics' | 'other' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">محتوى</SelectItem>
                  <SelectItem value="design">تصميم</SelectItem>
                  <SelectItem value="ads">إعلانات</SelectItem>
                  <SelectItem value="seo">SEO</SelectItem>
                  <SelectItem value="social_media">سوشيال ميديا</SelectItem>
                  <SelectItem value="analytics">تحليلات</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>المعيّن إليه</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر عضو الفريق" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">غير معيّن</SelectItem>
                  {users?.map((user: UserEntity) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name || user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>الحملة المرتبطة</Label>
              <Select
                value={formData.campaignId}
                onValueChange={(value) => setFormData({ ...formData, campaignId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر حملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون حملة</SelectItem>
                  {campaigns?.map((campaign: CampaignEntity) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>تاريخ التسليم</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>الساعات المقدرة</Label>
            <Input
              type="number"
              min="0"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
              placeholder="عدد الساعات"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                إلغاء
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {task ? 'تحديث' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default TaskFormDialog;
