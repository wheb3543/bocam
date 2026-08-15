/**
 * Task Form Component
 * مكون نموذج المهمة
 */

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
import { mediaCategories } from './config';
import type { TaskFormData, TaskStatus, TaskPriority, TaskCategory, UserEntity, CampaignEntity } from './types';

interface TaskFormProps {
  formData: TaskFormData;
  onFormDataChange: (data: TaskFormData) => void;
  users: UserEntity[];
  campaigns: CampaignEntity[];
}

export default function TaskForm({ formData, onFormDataChange, users, campaigns }: TaskFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>عنوان المهمة *</Label>
        <Input
          placeholder="أدخل عنوان المهمة"
          value={formData.title}
          onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label>الوصف</Label>
        <Textarea
          placeholder="أدخل وصف المهمة"
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>الحالة</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => onFormDataChange({ ...formData, status: value as TaskStatus })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">قيد الانتظار</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="review">مراجعة</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>الأولوية</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => onFormDataChange({ ...formData, priority: value as TaskPriority })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">منخفضة</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="urgent">عاجلة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>التصنيف</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => onFormDataChange({ ...formData, category: value as TaskCategory })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent>
              {mediaCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <span className="flex items-center gap-2">
                    {cat.icon}
                    {cat.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>تاريخ التسليم</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => onFormDataChange({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>المعيّن إليه</Label>
          <Select
            value={formData.assignedToId}
            onValueChange={(value) => onFormDataChange({ ...formData, assignedToId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر عضو الفريق" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">غير محدد</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>الحملة المرتبطة</Label>
          <Select
            value={formData.campaignId}
            onValueChange={(value) => onFormDataChange({ ...formData, campaignId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحملة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">غير محدد</SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id.toString()}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
