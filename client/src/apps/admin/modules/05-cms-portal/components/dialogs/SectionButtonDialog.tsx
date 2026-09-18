/**
 * Section Button Dialog Component
 * مكون حوار زر القسم
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
import { Switch } from '@/components/ui/switch';
import type { SectionButtonFormData } from '../../hooks/useSectionButtons';
import { PublicationQualityFeedback } from '../PublicationQualityFeedback';
import { ApprovalSubmissionPanel } from '../ApprovalSubmissionPanel';

interface SectionButtonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: SectionButtonFormData;
  onFormDataChange: (data: SectionButtonFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  sections?: Array<{ id: number; name: string }>;
  qualityIssues: string[];
  isAdmin: boolean;
  approvalEntityId?: number | null;
}

/**
 * SectionButtonDialog - مكون حوار زر القسم
 */
export function SectionButtonDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  sections = [],
  qualityIssues,
  isAdmin,
  approvalEntityId,
}: SectionButtonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'إضافة زر جديد' : 'تعديل الزر'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'أضف زر جديد للقسم' : 'عدل الزر الموجود'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Section */}
            <div className="grid gap-2">
              <Label htmlFor="sectionId">القسم *</Label>
              <Select
                value={formData.sectionId.toString()}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, sectionId: Number(value) })
                }
              >
                <SelectTrigger id="sectionId">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Text Arabic */}
            <div className="grid gap-2">
              <Label htmlFor="textAr">النص بالعربية *</Label>
              <Input
                id="textAr"
                value={formData.textAr}
                onChange={(e) => onFormDataChange({ ...formData, textAr: e.target.value })}
                placeholder="مثال: ابدأ الآن"
                required
              />
            </div>

            {/* Text English */}
            <div className="grid gap-2">
              <Label htmlFor="textEn">النص بالإنجليزية *</Label>
              <Input
                id="textEn"
                value={formData.textEn}
                onChange={(e) => onFormDataChange({ ...formData, textEn: e.target.value })}
                placeholder="مثال: Get Started"
                required
              />
            </div>

            {/* Link */}
            <div className="grid gap-2">
              <Label htmlFor="link">الرابط *</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => onFormDataChange({ ...formData, link: e.target.value })}
                placeholder="مثال: /contact"
                required
              />
            </div>

            {/* Style */}
            <div className="grid gap-2">
              <Label htmlFor="style">النمط *</Label>
              <Select
                value={formData.style}
                onValueChange={(value: 'primary' | 'secondary' | 'outline' | 'ghost') =>
                  onFormDataChange({ ...formData, style: value })
                }
              >
                <SelectTrigger id="style">
                  <SelectValue placeholder="اختر النمط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">أساسي</SelectItem>
                  <SelectItem value="secondary">ثانوي</SelectItem>
                  <SelectItem value="outline">مخطط</SelectItem>
                  <SelectItem value="ghost">شبح</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="grid gap-2">
              <Label htmlFor="sortOrder">الترتيب</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  onFormDataChange({ ...formData, sortOrder: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">حالة النشر</Label>
              <Select
                value={formData.status}
                onValueChange={(status: SectionButtonFormData['status']) =>
                  onFormDataChange({ ...formData, status })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="اختر حالة النشر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === 'draft' && (
              <div className="grid gap-2">
                <Label htmlFor="publishedAt">موعد النشر المؤجل</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={
                    formData.publishedAt ? formData.publishedAt.toISOString().slice(0, 16) : ''
                  }
                  onChange={(event) =>
                    onFormDataChange({
                      ...formData,
                      publishedAt: event.target.value ? new Date(event.target.value) : null,
                    })
                  }
                />
              </div>
            )}

            <PublicationQualityFeedback
              status={formData.status}
              issues={qualityIssues}
              isAdmin={isAdmin}
              overrideReason={formData.qualityOverrideReason}
              onOverrideReasonChange={(qualityOverrideReason) =>
                onFormDataChange({ ...formData, qualityOverrideReason })
              }
            />

            {mode === 'edit' && (
              <ApprovalSubmissionPanel
                entityType="sectionButton"
                entityId={approvalEntityId}
                changes={{
                  sectionId: formData.sectionId,
                  textAr: formData.textAr,
                  textEn: formData.textEn,
                  link: formData.link.trim(),
                  style: formData.style,
                  sortOrder: formData.sortOrder,
                  isActive: formData.isActive,
                  status: formData.status,
                  publishedAt: formData.publishedAt || undefined,
                }}
              />
            )}

            {/* Active */}
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive === 'yes'}
                onCheckedChange={(checked) =>
                  onFormDataChange({ ...formData, isActive: checked ? 'yes' : 'no' })
                }
              />
              <Label htmlFor="isActive">نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'جاري الحفظ...' : mode === 'create' ? 'إضافة' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
