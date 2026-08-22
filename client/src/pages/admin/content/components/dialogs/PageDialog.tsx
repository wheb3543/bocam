/**
 * Page Dialog Component
 * مكون حوار الصفحة
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PageFormData } from '../../hooks/usePages';
import { PublicationQualityFeedback } from '../PublicationQualityFeedback';
import { ApprovalSubmissionPanel } from '../ApprovalSubmissionPanel';

interface PageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: PageFormData;
  onFormDataChange: (data: PageFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  mainPages?: Array<{ id: number; name: string }>;
  qualityIssues: string[];
  isAdmin: boolean;
  approvalEntityId?: number | null;
}

/**
 * PageDialog - مكون حوار الصفحة
 */
export function PageDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  mainPages = [],
  qualityIssues,
  isAdmin,
  approvalEntityId,
}: PageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'إضافة صفحة جديدة' : 'تعديل الصفحة'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'أضف صفحة جديدة للمنصة' : 'عدل الصفحة الموجودة'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">اسم الصفحة *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="مثال: الرئيسية"
                required
              />
            </div>

            {/* Slug */}
            <div className="grid gap-2">
              <Label htmlFor="slug">الرابط (Slug) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => onFormDataChange({ ...formData, slug: e.target.value })}
                placeholder="مثال: home"
                required
              />
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">نوع الصفحة *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'main' | 'sub') =>
                  onFormDataChange({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">صفحة رئيسية</SelectItem>
                  <SelectItem value="sub">صفحة فرعية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Parent Page - only for sub pages */}
            {formData.type === 'sub' && (
              <div className="grid gap-2">
                <Label htmlFor="parentId">الصفحة الرئيسية</Label>
                <Select
                  value={formData.parentId?.toString()}
                  onValueChange={(value) =>
                    onFormDataChange({ ...formData, parentId: Number(value) })
                  }
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="اختر الصفحة الرئيسية" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainPages.map((page) => (
                      <SelectItem key={page.id} value={page.id.toString()}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title Arabic */}
            <div className="grid gap-2">
              <Label htmlFor="titleAr">العنوان بالعربية *</Label>
              <Input
                id="titleAr"
                value={formData.titleAr}
                onChange={(e) => onFormDataChange({ ...formData, titleAr: e.target.value })}
                placeholder="مثال: الصفحة الرئيسية"
                required
              />
            </div>

            {/* Title English */}
            <div className="grid gap-2">
              <Label htmlFor="titleEn">العنوان بالإنجليزية *</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => onFormDataChange({ ...formData, titleEn: e.target.value })}
                placeholder="مثال: Home Page"
                required
              />
            </div>

            {/* Meta Title Arabic */}
            <div className="grid gap-2">
              <Label htmlFor="metaTitleAr">عنوان SEO بالعربية</Label>
              <Input
                id="metaTitleAr"
                value={formData.metaTitleAr || ''}
                onChange={(e) => onFormDataChange({ ...formData, metaTitleAr: e.target.value })}
                placeholder="عنوان محرك البحث"
              />
            </div>

            {/* Meta Title English */}
            <div className="grid gap-2">
              <Label htmlFor="metaTitleEn">عنوان SEO بالإنجليزية</Label>
              <Input
                id="metaTitleEn"
                value={formData.metaTitleEn || ''}
                onChange={(e) => onFormDataChange({ ...formData, metaTitleEn: e.target.value })}
                placeholder="SEO Title"
              />
            </div>

            {/* Meta Description Arabic */}
            <div className="grid gap-2">
              <Label htmlFor="metaDescriptionAr">وصف SEO بالعربية</Label>
              <Textarea
                id="metaDescriptionAr"
                value={formData.metaDescriptionAr || ''}
                onChange={(e) =>
                  onFormDataChange({ ...formData, metaDescriptionAr: e.target.value })
                }
                placeholder="وصف محرك البحث"
                rows={2}
              />
            </div>

            {/* Meta Description English */}
            <div className="grid gap-2">
              <Label htmlFor="metaDescriptionEn">وصف SEO بالإنجليزية</Label>
              <Textarea
                id="metaDescriptionEn"
                value={formData.metaDescriptionEn || ''}
                onChange={(e) =>
                  onFormDataChange({ ...formData, metaDescriptionEn: e.target.value })
                }
                placeholder="SEO Description"
                rows={2}
              />
            </div>

            {/* Keywords Arabic */}
            <div className="grid gap-2">
              <Label htmlFor="keywordsAr">كلمات المفتاحية بالعربية</Label>
              <Input
                id="keywordsAr"
                value={formData.keywordsAr || ''}
                onChange={(e) => onFormDataChange({ ...formData, keywordsAr: e.target.value })}
                placeholder="كلمة1، كلمة2، كلمة3"
              />
            </div>

            {/* Keywords English */}
            <div className="grid gap-2">
              <Label htmlFor="keywordsEn">كلمات المفتاحية بالإنجليزية</Label>
              <Input
                id="keywordsEn"
                value={formData.keywordsEn || ''}
                onChange={(e) => onFormDataChange({ ...formData, keywordsEn: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
              />
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
                  تحفظ الصفحة كمسودة الآن وتُنشر تلقائياً عند الموعد بعد تفعيل النشر الدوري.
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
                entityType="page"
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
