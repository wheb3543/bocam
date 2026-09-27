/**
 * BlogPostDialog - نموذج إنشاء/تعديل مقال المدونة
 *
 * يجمع حقول المقال في تبويبات: المحتوى، النشر، وSEO. المحرر معزول في
 * BlogContentEditor ليسهل استبداله لاحقاً. يعرض ملاحظات بوابة الجودة قبل
 * النشر ويحترم صلاحيات content.* لكل مجموعة حقول.
 */

import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUpload from '@/components/form/ImageUpload';
import { Loader2 } from 'lucide-react';
import { PublicationQualityFeedback } from '../../components/PublicationQualityFeedback';
import { BlogContentEditor } from './BlogContentEditor';
import type { BlogCategoryRow, BlogPostFormData, BlogStatus } from '../types/blog.types';

const NONE_OPTION = '__none__';

type BlogPostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: BlogPostFormData;
  onFormDataChange: (patch: Partial<BlogPostFormData>) => void;
  onSubmit: () => void;
  isPending: boolean;
  categories: BlogCategoryRow[];
  qualityIssues: string[];
  isAdmin: boolean;
  canPublish: boolean;
};

export function BlogPostDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  categories,
  qualityIssues,
  isAdmin,
  canPublish,
}: BlogPostDialogProps) {
  const [tab, setTab] = useState('content');

  useEffect(() => {
    if (open) {
      setTab('content');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[860px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'إضافة مقال جديد' : 'تعديل المقال'}</DialogTitle>
          <DialogDescription>
            المحتوى يُعقَّم تلقائياً عند الحفظ، ويُحسب وقت القراءة من حجم النص.
          </DialogDescription>
        </DialogHeader>

        <PublicationQualityFeedback
          status={formData.status}
          issues={qualityIssues}
          isAdmin={isAdmin}
          overrideReason={formData.qualityOverrideReason}
          onOverrideReasonChange={(value) => onFormDataChange({ qualityOverrideReason: value })}
        />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">المحتوى</TabsTrigger>
            <TabsTrigger value="publishing">النشر</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* ===== تبويب المحتوى ===== */}
          <TabsContent value="content" className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="blog-title">عنوان المقال *</Label>
              <Input
                id="blog-title"
                value={formData.title}
                onChange={(event) => onFormDataChange({ title: event.target.value })}
                placeholder="مثال: أعراض الكلاميديا عند النساء"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="blog-slug">الرابط (slug)</Label>
              <Input
                id="blog-slug"
                value={formData.slug}
                onChange={(event) => onFormDataChange({ slug: event.target.value })}
                placeholder="اتركه فارغاً ليولَّد تلقائياً من العنوان"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                الرابط النهائي: /blog/{formData.slug || 'يُولَّد تلقائياً'}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="blog-excerpt">المقتطف (يظهر في البطاقات)</Label>
              <Textarea
                id="blog-excerpt"
                value={formData.excerpt}
                onChange={(event) => onFormDataChange({ excerpt: event.target.value })}
                placeholder="اتركه فارغاً ليُشتق تلقائياً من أول فقرة"
                rows={3}
              />
            </div>

            <BlogContentEditor
              value={formData.content}
              onChange={(value) => onFormDataChange({ content: value })}
              disabled={isPending}
            />

            <div className="grid gap-2">
              <Label>صورة الغلاف</Label>
              <ImageUpload
                value={formData.coverImage}
                onChange={(url) => onFormDataChange({ coverImage: url })}
                folder="blog"
                placeholder="اسحب صورة الغلاف هنا أو اضغط للاختيار"
              />
              <p className="text-xs text-muted-foreground">
                صورة الغلاف ونصها البديل إلزاميان للنشر (شرط بوابة الجودة).
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="blog-cover-alt">النص البديل لصورة الغلاف</Label>
              <Input
                id="blog-cover-alt"
                value={formData.coverImageAlt}
                onChange={(event) => onFormDataChange({ coverImageAlt: event.target.value })}
                placeholder="وصف موجز لمحتوى الصورة لقارئات الشاشة"
              />
            </div>
          </TabsContent>

          {/* ===== تبويب النشر ===== */}
          <TabsContent value="publishing" className="grid gap-4 py-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="blog-status">حالة النشر</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => onFormDataChange({ status: value as BlogStatus })}
                  disabled={!canPublish && formData.status === 'published'}
                >
                  <SelectTrigger id="blog-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-category">التصنيف الطبي</Label>
                <Select
                  value={formData.categoryId ? String(formData.categoryId) : NONE_OPTION}
                  onValueChange={(value) =>
                    onFormDataChange({
                      categoryId: value === NONE_OPTION ? null : Number(value),
                    })
                  }
                >
                  <SelectTrigger id="blog-category">
                    <SelectValue placeholder="بدون تصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_OPTION}>بدون تصنيف</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name} ({category.postsCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="blog-active"
                  checked={formData.isActive === 'yes'}
                  onCheckedChange={(checked) =>
                    onFormDataChange({ isActive: checked ? 'yes' : 'no' })
                  }
                />
                <Label htmlFor="blog-active">نشط في الموقع العام</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="blog-featured"
                  checked={formData.isFeatured === 'yes'}
                  onCheckedChange={(checked) =>
                    onFormDataChange({ isFeatured: checked ? 'yes' : 'no' })
                  }
                />
                <Label htmlFor="blog-featured">مميّز (يظهر في الصفحة الرئيسية)</Label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="blog-reviewer">المراجع الطبي</Label>
              <Input
                id="blog-reviewer"
                value={formData.reviewerName}
                onChange={(event) => onFormDataChange({ reviewerName: event.target.value })}
                placeholder="مثال: فريق أطباء عيادات الأمراض المعدية"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="blog-review-date">تاريخ المراجعة الطبية</Label>
                <Input
                  id="blog-review-date"
                  type="date"
                  value={formData.reviewDate}
                  onChange={(event) => onFormDataChange({ reviewDate: event.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-scheduled">جدولة النشر</Label>
                <Input
                  id="blog-scheduled"
                  type="date"
                  value={formData.scheduledFor}
                  onChange={(event) => onFormDataChange({ scheduledFor: event.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  تُلتقط المواعيد المجدولة بواسطة مهمة النشر المؤجل.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="blog-tags">الوسوم</Label>
              <Input
                id="blog-tags"
                value={formData.tagsInput}
                onChange={(event) => onFormDataChange({ tagsInput: event.target.value })}
                placeholder="سكري، ضغط، قلب"
              />
              <p className="text-xs text-muted-foreground">افصل بين الوسوم بفاصلة.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="blog-title-en">العنوان بالإنجليزية</Label>
                <Input
                  id="blog-title-en"
                  value={formData.titleEn}
                  onChange={(event) => onFormDataChange({ titleEn: event.target.value })}
                  dir="ltr"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-excerpt-en">المقتطف بالإنجليزية</Label>
                <Input
                  id="blog-excerpt-en"
                  value={formData.excerptEn}
                  onChange={(event) => onFormDataChange({ excerptEn: event.target.value })}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <BlogContentEditor
                value={formData.contentEn}
                onChange={(value) => onFormDataChange({ contentEn: value })}
                disabled={isPending}
                rows={10}
                label="محتوى المقال الإنجليزي (HTML)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="blog-sort">ترتيب العرض اليدوي</Label>
              <Input
                id="blog-sort"
                type="number"
                min={0}
                value={formData.sortOrder}
                onChange={(event) =>
                  onFormDataChange({ sortOrder: Number(event.target.value) || 0 })
                }
              />
            </div>
          </TabsContent>

          {/* ===== تبويب SEO ===== */}
          <TabsContent value="seo" className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="blog-meta-title">عنوان SEO</Label>
              <Input
                id="blog-meta-title"
                value={formData.metaTitle}
                onChange={(event) => onFormDataChange({ metaTitle: event.target.value })}
                placeholder="اتركه فارغاً لاستخدام عنوان المقال (يُفضّل 30-60 حرفاً)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="blog-meta-description">وصف SEO</Label>
              <Textarea
                id="blog-meta-description"
                value={formData.metaDescription}
                onChange={(event) => onFormDataChange({ metaDescription: event.target.value })}
                rows={3}
                placeholder="ملخص يظهر في نتائج البحث (يُفضّل 70-160 حرفاً)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="blog-keywords">الكلمات المفتاحية</Label>
              <Input
                id="blog-keywords"
                value={formData.keywords}
                onChange={(event) => onFormDataChange({ keywords: event.target.value })}
                placeholder="أعراض، علاج، وقاية"
              />
            </div>

            <div className="grid gap-2">
              <Label>صورة المشاركة الاجتماعية (OG Image)</Label>
              <ImageUpload
                value={formData.ogImage}
                onChange={(url) => onFormDataChange({ ogImage: url })}
                folder="blog-og"
                placeholder="صورة 1200×630 (تُستخدم صورة الغلاف إن تُركت فارغة)"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isPending || !formData.title.trim()}>
            {isPending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'إنشاء المقال' : 'حفظ التعديلات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BlogPostDialog;
