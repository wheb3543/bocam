/**
 * Text Content Dialog Component
 * مكون حوار المحتوى النصي
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
import { Bold, Italic, List, Heading, Link, Code, Quote } from 'lucide-react';
import type { TextContentFormData } from '../../types/content.types';
import { languageOptions, textContentTypeOptions } from '../../types/content.types';
import { PublicationQualityFeedback } from '../PublicationQualityFeedback';
import { ApprovalSubmissionPanel } from '../ApprovalSubmissionPanel';

interface TextContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: TextContentFormData;
  onFormDataChange: (data: TextContentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  onSaveVersion?: () => void;
  approvalEntityId?: number | null;
  qualityIssues: string[];
  isAdmin: boolean;
  pages?: Array<{ id: number; name: string; titleAr: string; titleEn: string }>;
  sections?: Array<{
    id: number;
    pageId: number;
    name: string;
    titleAr: string | null;
    titleEn: string | null;
  }>;
}

/**
 * TextContentDialog - مكون حوار المحتوى النصي
 */
export function TextContentDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  onSaveVersion,
  approvalEntityId,
  qualityIssues,
  isAdmin,
  pages = [],
  sections = [],
}: TextContentDialogProps) {
  const insertFormat = (format: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let newText = '';
    if (format === 'bold') {
      newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
    } else if (format === 'italic') {
      newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
    } else if (format === 'heading') {
      newText = text.substring(0, start) + `\n## ${selectedText}\n` + text.substring(end);
    } else if (format === 'list') {
      newText = text.substring(0, start) + `\n- ${selectedText}` + text.substring(end);
    }

    onFormDataChange({ ...formData, content: newText });
    textarea.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'إضافة محتوى نصي جديد' : 'تعديل المحتوى النصي'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'أضف محتوى نصي جديد للمنصة' : 'عدل المحتوى النصي الموجود'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Page Selection */}
            <div className="grid gap-2">
              <Label htmlFor="pageId">الصفحة *</Label>
              <Select
                value={formData.pageId?.toString() || ''}
                onValueChange={(value) => {
                  const pageId = value ? parseInt(value) : undefined;
                  onFormDataChange({ ...formData, pageId, sectionId: undefined, section: '' });
                }}
              >
                <SelectTrigger id="pageId">
                  <SelectValue placeholder="اختر الصفحة" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id.toString()}>
                      {page.name} ({page.titleAr})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Selection - based on selected page */}
            {formData.pageId && (
              <div className="grid gap-2">
                <Label htmlFor="sectionId">القسم *</Label>
                <Select
                  value={formData.sectionId?.toString() || ''}
                  onValueChange={(value) => {
                    const sectionId = value ? parseInt(value) : undefined;
                    const selectedSection = sections.find((s) => s.id === sectionId);
                    onFormDataChange({
                      ...formData,
                      sectionId,
                      section: selectedSection?.name || '',
                    });
                  }}
                >
                  <SelectTrigger id="sectionId">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections
                      .filter((section) => section.pageId === formData.pageId)
                      .map((section) => (
                        <SelectItem key={section.id} value={section.id.toString()}>
                          {section.name} ({section.titleAr || section.titleEn})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Key */}
            <div className="grid gap-2">
              <Label htmlFor="key">المفتاح *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => onFormDataChange({ ...formData, key: e.target.value })}
                placeholder="مثال: hero.title"
                disabled={mode === 'edit'}
                required
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

            {/* Content with Rich Text Toolbar */}
            <div className="grid gap-2">
              <Label htmlFor="content">المحتوى *</Label>
              <div className="border rounded-md">
                <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat('bold')}
                    aria-label="عريض"
                    title="عريض (Ctrl+B)"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat('italic')}
                    aria-label="مائل"
                    title="مائل (Ctrl+I)"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat('heading')}
                    aria-label="عنوان"
                    title="عنوان (H2)"
                  >
                    <Heading className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat('list')}
                    aria-label="قائمة"
                    title="قائمة نقطية"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat('link')}
                    aria-label="رابط"
                    title="إضافة رابط"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat('code')}
                    aria-label="كود"
                    title="كود"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat('quote')}
                    aria-label="اقتباس"
                    title="اقتباس"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => onFormDataChange({ ...formData, content: e.target.value })}
                  placeholder="أدخل المحتوى النصي (يدعم Markdown)"
                  rows={8}
                  required
                  className="border-0 rounded-none focus-visible:ring-0 resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                يدعم تنسيق Markdown: **عريض**، *مائل*، ## عنوان، - قائمة، [رابط](url)، `كود`، &gt;
                اقتباس
              </p>
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">النوع *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => onFormDataChange({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {textContentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  تحفظ المادة كمسودة الآن وتُنشر تلقائياً عند الموعد بعد تفعيل النشر الدوري.
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
                entityType="textContent"
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
      </DialogContent>
    </Dialog>
  );
}
