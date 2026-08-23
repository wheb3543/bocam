/**
 * SEO Settings Dialog Component
 * مكون حوار إعدادات SEO
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { SEOSettingsFormData } from '../../types/content.types';
import { languageOptions } from '../../types/content.types';
import { ApprovalSubmissionPanel } from '../ApprovalSubmissionPanel';
import { PublicationQualityFeedback } from '../PublicationQualityFeedback';

interface SEODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: SEOSettingsFormData;
  onFormDataChange: (data: SEOSettingsFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  pages?: Array<{ id: number; name: string; slug: string; titleAr: string; titleEn: string }>;
  onSaveVersion?: () => void;
  qualityIssues?: string[];
  isAdmin?: boolean;
  approvalEntityId?: number | null;
  onApprovalSubmitted?: () => void;
}

/**
 * SEODialog - مكون حوار إعدادات SEO
 */
export function SEODialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  pages = [],
  onSaveVersion,
  qualityIssues = [],
  isAdmin = false,
  approvalEntityId,
  onApprovalSubmitted,
}: SEODialogProps) {
  // SEO Validation Functions
  const getTitleStatus = () => {
    if (!formData.title) {
      return { status: 'warning', message: 'العنوان مطلوب' };
    }
    if (formData.title.length < 30) {
      return { status: 'warning', message: 'العنوان قصير جداً (أقل من 30 حرف)' };
    }
    if (formData.title.length > 60) {
      return { status: 'error', message: 'العنوان طويل جداً (أكثر من 60 حرف)' };
    }
    return { status: 'success', message: 'العنوان مثالي' };
  };

  const getDescriptionStatus = () => {
    if (!formData.description) {
      return { status: 'warning', message: 'الوصف مطلوب' };
    }
    if (formData.description.length < 120) {
      return { status: 'warning', message: 'الوصف قصير جداً (أقل من 120 حرف)' };
    }
    if (formData.description.length > 160) {
      return { status: 'error', message: 'الوصف طويل جداً (أكثر من 160 حرف)' };
    }
    return { status: 'success', message: 'الوصف مثالي' };
  };

  const getKeywordsStatus = () => {
    if (!formData.keywords) {
      return { status: 'warning', message: 'الكلمات المفتاحية مطلوبة' };
    }
    const keywords = formData.keywords.split(',').filter((k) => k.trim());
    if (keywords.length < 3) {
      return { status: 'warning', message: 'يُنصح بـ 3-5 كلمات مفتاحية' };
    }
    if (keywords.length > 10) {
      return { status: 'error', message: 'الكلمات المفتاحية كثيرة جداً (أكثر من 10)' };
    }
    return { status: 'success', message: 'الكلمات المفتاحية مثالية' };
  };

  const renderStatusIcon = (status: string) => {
    if (status === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (status === 'warning') {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const titleStatus = getTitleStatus();
  const descriptionStatus = getDescriptionStatus();
  const keywordsStatus = getKeywordsStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'إضافة إعدادات SEO جديدة' : 'تعديل إعدادات SEO'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'أضف إعدادات SEO جديدة للصفحة' : 'عدل إعدادات SEO الموجودة'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pageId">الصفحة المرتبطة</Label>
              <Select
                value={formData.pageId ? String(formData.pageId) : 'none'}
                onValueChange={(value) => {
                  const page = pages.find((item) => item.id === Number(value));
                  onFormDataChange({
                    ...formData,
                    pageId: page?.id,
                    slug: page?.slug || '',
                    pageKey: page ? formData.pageKey || page.name : formData.pageKey,
                  });
                }}
              >
                <SelectTrigger id="pageId">
                  <SelectValue placeholder="اختر صفحة (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">إعداد عام غير مرتبط بصفحة</SelectItem>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={String(page.id)}>
                      {page.titleAr || page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Page Key */}
            <div className="grid gap-2">
              <Label htmlFor="pageKey">مفتاح الصفحة *</Label>
              <Input
                id="pageKey"
                value={formData.pageKey}
                onChange={(e) => onFormDataChange({ ...formData, pageKey: e.target.value })}
                placeholder="مثال: home"
                disabled={mode === 'edit'}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">رابط الصفحة (slug)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => onFormDataChange({ ...formData, slug: e.target.value })}
                placeholder="مثال: about-us"
              />
            </div>

            {/* Language */}
            <div className="grid gap-2">
              <Label htmlFor="language">اللغة *</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => onFormDataChange({ ...formData, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">عنوان الصفحة</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                placeholder="عنوان الصفحة للـ SEO"
                maxLength={60}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{formData.title.length}/60 حرف</span>
                <div className="flex items-center gap-1">
                  {renderStatusIcon(titleStatus.status)}
                  <span
                    className={
                      titleStatus.status === 'error'
                        ? 'text-red-500'
                        : titleStatus.status === 'warning'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                    }
                  >
                    {titleStatus.message}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">وصف الصفحة</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                placeholder="وصف الصفحة للـ SEO"
                rows={3}
                maxLength={160}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{formData.description.length}/160 حرف</span>
                <div className="flex items-center gap-1">
                  {renderStatusIcon(descriptionStatus.status)}
                  <span
                    className={
                      descriptionStatus.status === 'error'
                        ? 'text-red-500'
                        : descriptionStatus.status === 'warning'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                    }
                  >
                    {descriptionStatus.message}
                  </span>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="grid gap-2">
              <Label htmlFor="keywords">الكلمات المفتاحية</Label>
              <Textarea
                id="keywords"
                value={formData.keywords}
                onChange={(e) => onFormDataChange({ ...formData, keywords: e.target.value })}
                placeholder="كلمة1, كلمة2, كلمة3"
                rows={2}
              />
              <div className="flex items-center gap-1 text-xs">
                {renderStatusIcon(keywordsStatus.status)}
                <span
                  className={
                    keywordsStatus.status === 'error'
                      ? 'text-red-500'
                      : keywordsStatus.status === 'warning'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                  }
                >
                  {keywordsStatus.message}
                </span>
              </div>
            </div>

            {/* Open Graph Title */}
            <div className="grid gap-2">
              <Label htmlFor="ogTitle">عنوان Open Graph</Label>
              <Input
                id="ogTitle"
                value={formData.ogTitle}
                onChange={(e) => onFormDataChange({ ...formData, ogTitle: e.target.value })}
                placeholder="عنوان للمشاركة على وسائل التواصل"
                maxLength={100}
              />
            </div>

            {/* Open Graph Description */}
            <div className="grid gap-2">
              <Label htmlFor="ogDescription">وصف Open Graph</Label>
              <Textarea
                id="ogDescription"
                value={formData.ogDescription}
                onChange={(e) => onFormDataChange({ ...formData, ogDescription: e.target.value })}
                placeholder="وصف للمشاركة على وسائل التواصل"
                rows={2}
                maxLength={200}
              />
            </div>

            {/* Open Graph Image */}
            <div className="grid gap-2">
              <Label htmlFor="ogImage">صورة Open Graph</Label>
              <Input
                id="ogImage"
                value={formData.ogImage}
                onChange={(e) => onFormDataChange({ ...formData, ogImage: e.target.value })}
                placeholder="https://example.com/og-image.jpg"
              />
            </div>

            {/* Canonical URL */}
            <div className="grid gap-2">
              <Label htmlFor="canonicalUrl">الرابط الأساسي (Canonical URL)</Label>
              <Input
                id="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={(e) => onFormDataChange({ ...formData, canonicalUrl: e.target.value })}
                placeholder="https://example.com/page"
              />
            </div>

            {/* Robots */}
            <div className="grid gap-2">
              <Label htmlFor="robots">تعليمات الروبوتات</Label>
              <Textarea
                id="robots"
                value={formData.robots}
                onChange={(e) => onFormDataChange({ ...formData, robots: e.target.value })}
                placeholder="index, follow"
                rows={2}
              />
            </div>

            {/* Structured Data */}
            <div className="grid gap-2">
              <Label htmlFor="structuredData">البيانات المهيكلة (JSON-LD)</Label>
              <Textarea
                id="structuredData"
                value={formData.structuredData}
                onChange={(e) => onFormDataChange({ ...formData, structuredData: e.target.value })}
                placeholder='{"@context": "https://schema.org", "@type": "WebSite"}'
                rows={4}
                className="font-mono text-xs"
              />
            </div>

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
            <div className="grid gap-2">
              <Label htmlFor="seo-status">حالة النشر</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  onFormDataChange({
                    ...formData,
                    status: value as SEOSettingsFormData['status'],
                  })
                }
              >
                <SelectTrigger id="seo-status">
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
              <Label htmlFor="seo-published-at">موعد النشر (اختياري)</Label>
              <Input
                id="seo-published-at"
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
              <p className="text-xs text-muted-foreground">
                اترك الحالة «مسودة» وحدد موعداً مستقبلياً لاستخدام النشر المؤجل المحمي بالجودة.
              </p>
            </div>
            <PublicationQualityFeedback
              status={formData.status}
              issues={qualityIssues}
              isAdmin={isAdmin}
              overrideReason={formData.qualityOverrideReason}
              onOverrideReasonChange={(value) =>
                onFormDataChange({ ...formData, qualityOverrideReason: value })
              }
            />
            {mode === 'edit' && (
              <ApprovalSubmissionPanel
                entityType="seo"
                entityId={approvalEntityId}
                changes={{
                  pageId: formData.pageId ?? null,
                  pageKey: formData.pageKey.trim() || null,
                  slug: formData.slug.trim() || null,
                  language: formData.language,
                  title: formData.title.trim() || null,
                  description: formData.description.trim() || null,
                  keywords: formData.keywords.trim() || null,
                  ogTitle: formData.ogTitle.trim() || null,
                  ogDescription: formData.ogDescription.trim() || null,
                  ogImage: formData.ogImage.trim() || null,
                  canonicalUrl: formData.canonicalUrl.trim() || null,
                  robots: formData.robots.trim() || null,
                  structuredData: formData.structuredData.trim() || null,
                  isActive: formData.isActive,
                  status: formData.status,
                  publishedAt: formData.publishedAt,
                  qualityOverrideReason: formData.qualityOverrideReason,
                }}
                onSubmitted={onApprovalSubmitted}
              />
            )}
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              {mode === 'edit' && onSaveVersion && (
                <Button type="button" variant="outline" onClick={onSaveVersion}>
                  حفظ نسخة
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'جاري الحفظ...' : mode === 'create' ? 'إضافة' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
