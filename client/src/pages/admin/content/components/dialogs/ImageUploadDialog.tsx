/**
 * Image Upload Dialog Component
 * مكون حوار رفع الصور
 */

import { useState, useRef } from 'react';
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
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import type { ImageFormData } from '../../types/content.types';
import { sectionOptions, imageFormatOptions } from '../../types/content.types';
import { useImageUpload } from '@/hooks/form/useImageUpload';
import MediaPicker from '@/components/form/MediaPicker';
import { PublicationQualityFeedback } from '../PublicationQualityFeedback';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: ImageFormData;
  onFormDataChange: (data: ImageFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  onSaveVersion?: () => void;
  qualityIssues: string[];
  isAdmin: boolean;
}

/**
 * ImageUploadDialog - مكون حوار رفع الصور
 */
export function ImageUploadDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  onSaveVersion,
  qualityIssues,
  isAdmin,
}: ImageUploadDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.url || null);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadImage } = useImageUpload({ folder: 'uploads' });

  const applyMedia = (
    url: string,
    details?: { width?: number; height?: number; size?: number; format?: string }
  ) => {
    setPreviewUrl(url);
    onFormDataChange({
      ...formData,
      url,
      width: details?.width?.toString() || formData.width,
      height: details?.height?.toString() || formData.height,
      size: details?.size?.toString() || formData.size,
      format: details?.format || formData.format,
    });
  };

  const handleFileSelect = async (file: File) => {
    const result = await uploadImage(file);
    if (result) {
      applyMedia(result.url, result);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    onFormDataChange({ ...formData, url: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'إضافة صورة جديدة' : 'تعديل الصورة'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'أضف صورة جديدة للمنصة' : 'عدل الصورة الموجودة'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Key */}
            <div className="grid gap-2">
              <Label htmlFor="key">المفتاح *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => onFormDataChange({ ...formData, key: e.target.value })}
                placeholder="مثال: hero.banner"
                disabled={mode === 'edit'}
                required
              />
            </div>

            {/* Image Upload Area */}
            <div className="grid gap-2">
              <Label>رفع الصورة *</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="معاينة" className="max-h-48 mx-auto rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearPreview}
                      aria-label="حذف الصورة"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-2 flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="ml-1.5 h-4 w-4" /> رفع ملف
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setMediaPickerOpen(true)}
                        disabled={uploading}
                      >
                        <ImageIcon className="ml-1.5 h-4 w-4" /> من المكتبة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      اسحب الصورة هنا أو انقر للاختيار
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      {uploading ? 'جاري الرفع...' : 'رفع ملف'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMediaPickerOpen(true)}
                      disabled={uploading}
                    >
                      <ImageIcon className="h-4 w-4 ml-2" />
                      اختيار من مكتبة الوسائط
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            </div>

            {/* URL (hidden if file uploaded) */}
            {!previewUrl && (
              <div className="grid gap-2">
                <Label htmlFor="url">رابط الصورة *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => onFormDataChange({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
            )}

            {/* Alt Text */}
            <div className="grid gap-2">
              <Label htmlFor="alt">النص البديل (للوصولية)</Label>
              <Input
                id="alt"
                value={formData.alt}
                onChange={(e) => onFormDataChange({ ...formData, alt: e.target.value })}
                placeholder="وصف الصورة للوصولية"
              />
            </div>

            {/* Section */}
            <div className="grid gap-2">
              <Label htmlFor="section">القسم</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => onFormDataChange({ ...formData, section: value })}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Width */}
            <div className="grid gap-2">
              <Label htmlFor="width">العرض (بكسل)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width}
                onChange={(e) => onFormDataChange({ ...formData, width: e.target.value })}
                placeholder="1920"
              />
            </div>

            {/* Height */}
            <div className="grid gap-2">
              <Label htmlFor="height">الارتفاع (بكسل)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => onFormDataChange({ ...formData, height: e.target.value })}
                placeholder="1080"
              />
            </div>

            {/* Format */}
            <div className="grid gap-2">
              <Label htmlFor="format">الصيغة</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => onFormDataChange({ ...formData, format: value })}
              >
                <SelectTrigger id="format">
                  <SelectValue placeholder="اختر الصيغة" />
                </SelectTrigger>
                <SelectContent>
                  {imageFormatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size */}
            <div className="grid gap-2">
              <Label htmlFor="size">الحجم (بايت)</Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => onFormDataChange({ ...formData, size: e.target.value })}
                placeholder="102400"
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
                  تحفظ الصورة كمسودة الآن وتُنشر تلقائياً عند الموعد بعد تفعيل النشر الدوري.
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
            {formData.status === 'draft' && (
              <p className="me-auto text-xs text-muted-foreground" role="status" aria-live="polite">
                {isPending
                  ? 'جاري حفظ المسودة…'
                  : formData.publishedAt
                    ? 'المسودة مجدولة للنشر عند الموعد المحدد.'
                    : 'المسودة جاهزة للحفظ وغير منشورة.'}
              </p>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? 'جاري الحفظ...' : mode === 'create' ? 'إضافة' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </form>
        <MediaPicker
          open={mediaPickerOpen}
          onOpenChange={setMediaPickerOpen}
          onSelect={(url) => applyMedia(url)}
          folder="uploads"
        />
      </DialogContent>
    </Dialog>
  );
}
