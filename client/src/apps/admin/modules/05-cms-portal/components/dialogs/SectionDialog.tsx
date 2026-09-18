/**
 * Section Dialog Component
 * مكون حوار القسم
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
import type { SectionFormData } from '../../hooks/useSections';
import { PublicationQualityFeedback } from '../PublicationQualityFeedback';
import { ApprovalSubmissionPanel } from '../ApprovalSubmissionPanel';

interface SectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: SectionFormData;
  onFormDataChange: (data: SectionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  pages?: Array<{ id: number; name: string }>;
  qualityIssues: string[];
  isAdmin: boolean;
  approvalEntityId?: number | null;
}

/**
 * SectionDialog - مكون حوار القسم
 */
export function SectionDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  pages = [],
  qualityIssues,
  isAdmin,
  approvalEntityId,
}: SectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'إضافة قسم جديد' : 'تعديل القسم'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'أضف قسم جديد للمنصة' : 'عدل القسم الموجود'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Page */}
            <div className="grid gap-2">
              <Label htmlFor="pageId">الصفحة *</Label>
              <Select
                value={formData.pageId.toString()}
                onValueChange={(value) => onFormDataChange({ ...formData, pageId: Number(value) })}
              >
                <SelectTrigger id="pageId">
                  <SelectValue placeholder="اختر الصفحة" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id.toString()}>
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">اسم القسم *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="مثال: Hero Section"
                required
              />
            </div>

            {/* Title Arabic */}
            <div className="grid gap-2">
              <Label htmlFor="titleAr">العنوان بالعربية</Label>
              <Input
                id="titleAr"
                value={formData.titleAr || ''}
                onChange={(e) => onFormDataChange({ ...formData, titleAr: e.target.value })}
                placeholder="مثال: مرحباً بكم"
              />
            </div>

            {/* Title English */}
            <div className="grid gap-2">
              <Label htmlFor="titleEn">العنوان بالإنجليزية</Label>
              <Input
                id="titleEn"
                value={formData.titleEn || ''}
                onChange={(e) => onFormDataChange({ ...formData, titleEn: e.target.value })}
                placeholder="مثال: Welcome"
              />
            </div>

            {/* Subtitle Arabic */}
            <div className="grid gap-2">
              <Label htmlFor="subtitleAr">العنوان الفرعي بالعربية</Label>
              <Input
                id="subtitleAr"
                value={formData.subtitleAr || ''}
                onChange={(e) => onFormDataChange({ ...formData, subtitleAr: e.target.value })}
                placeholder="مثال: اكتشف خدماتنا"
              />
            </div>

            {/* Subtitle English */}
            <div className="grid gap-2">
              <Label htmlFor="subtitleEn">العنوان الفرعي بالإنجليزية</Label>
              <Input
                id="subtitleEn"
                value={formData.subtitleEn || ''}
                onChange={(e) => onFormDataChange({ ...formData, subtitleEn: e.target.value })}
                placeholder="مثال: Discover our services"
              />
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">نوع القسم *</Label>
              <Select
                value={formData.type}
                onValueChange={(
                  value:
                    | 'slider'
                    | 'text'
                    | 'text-cards'
                    | 'stats-cards'
                    | 'image-cards'
                    | 'image'
                    | 'video'
                    | 'cta'
                    | 'features'
                    | 'contact'
                    | 'hero'
                    | 'gallery'
                ) => onFormDataChange({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slider">Slider</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="text-cards">Text Cards</SelectItem>
                  <SelectItem value="stats-cards">Stats Cards</SelectItem>
                  <SelectItem value="image-cards">Image Cards</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="cta">CTA</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                  <SelectItem value="testimonials">Testimonials</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
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
              <Label htmlFor="status">حالة المحتوى</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'published' | 'archived') =>
                  onFormDataChange({
                    ...formData,
                    status: value,
                    publishedAt: value === 'published' ? null : formData.publishedAt,
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="اختر حالة المحتوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">نشر الآن</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === 'draft' && (
              <div className="grid gap-2 rounded-lg border border-dashed bg-muted/30 p-3">
                <Label htmlFor="publishedAt">موعد النشر المؤجل</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={
                    formData.publishedAt
                      ? new Date(formData.publishedAt).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(event) =>
                    onFormDataChange({
                      ...formData,
                      publishedAt: event.target.value ? new Date(event.target.value) : null,
                    })
                  }
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  يحفظ القسم كمسودة الآن ويُنشر تلقائياً عند الموعد بعد تفعيل النشر الدوري.
                </p>
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
                entityType="section"
                entityId={approvalEntityId}
                changes={formData}
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
            {formData.status === 'draft' && (
              <p className="me-auto text-xs text-muted-foreground" role="status" aria-live="polite">
                {isPending
                  ? 'جاري حفظ المسودة…'
                  : formData.publishedAt
                    ? 'المسودة مجدولة للنشر عند الموعد المحدد.'
                    : 'المسودة جاهزة للحفظ وغير منشورة.'}
              </p>
            )}
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
