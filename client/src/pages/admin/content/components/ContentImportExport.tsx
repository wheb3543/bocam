/**
 * Content Import/Export Component
 * اختيار حزم CMS وتدقيقها قبل الاستيراد الذري.
 */

import { useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileJson,
  FileSearch,
  Loader2,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CmsExportOptions, ImportPreview, ImportResult } from '../hooks/useImportExport';

interface ContentImportExportProps {
  defaultExportOptions: CmsExportOptions;
  onExport: (options: CmsExportOptions) => Promise<void>;
  onPreviewImport: (data: unknown) => Promise<ImportPreview>;
  onConfirmImport: (data: unknown) => Promise<ImportResult>;
  isExporting: boolean;
  isImporting: boolean;
  isPreviewingImport: boolean;
}

const exportGroups: Array<{ key: keyof CmsExportOptions; label: string; description: string }> = [
  { key: 'includePages', label: 'الصفحات', description: 'الصفحات والعلاقات الأساسية' },
  { key: 'includeSections', label: 'الأقسام', description: 'أقسام الصفحات وترتيبها' },
  { key: 'includeSectionButtons', label: 'أزرار الأقسام', description: 'النصوص والروابط والأنماط' },
  { key: 'includeTextContent', label: 'النصوص', description: 'النصوص متعددة اللغات' },
  { key: 'includeImages', label: 'الصور', description: 'بيانات الصورة والنص البديل' },
  { key: 'includeColors', label: 'الألوان', description: 'نظام ألوان الهوية' },
  {
    key: 'includeSeoSettings',
    label: 'تحسين محركات البحث',
    description: 'العناوين والوصف والبيانات المنظمة',
  },
  { key: 'includeMedia', label: 'الوسائط', description: 'المجلدات وبيانات الملفات وروابطها' },
  {
    key: 'includeAuditLog',
    label: 'سجل التدقيق',
    description: 'السجل التاريخي دون بيانات المستخدم الحساسة',
  },
];

const countLabels: Record<string, string> = {
  pages: 'الصفحات',
  sections: 'الأقسام',
  sectionButtons: 'أزرار الأقسام',
  textContent: 'النصوص',
  images: 'الصور',
  colors: 'الألوان',
  seoSettings: 'إعدادات SEO',
  mediaFolders: 'مجلدات الوسائط',
  media: 'الوسائط',
  auditLog: 'سجل التدقيق',
};

export function ContentImportExport({
  defaultExportOptions,
  onExport,
  onPreviewImport,
  onConfirmImport,
  isExporting,
  isImporting,
  isPreviewingImport,
}: ContentImportExportProps) {
  const [options, setOptions] = useState<CmsExportOptions>(defaultExportOptions);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [pendingData, setPendingData] = useState<unknown>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = exportGroups.filter((group) => options[group.key]).length;

  const handleExport = async () => {
    if (selectedCount === 0) {
      toast.error('اختر مجموعة بيانات واحدة على الأقل للتصدير.');
      return;
    }
    try {
      await onExport(options);
      toast.success(`تم إنشاء نسخة CMS تضم ${selectedCount} مجموعات بيانات.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل تصدير المحتوى.');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const data = JSON.parse(await file.text());
      const summary = await onPreviewImport(data);
      setPendingData(data);
      setPreview(summary);
      setFileName(file.name);
    } catch (error) {
      setPendingData(null);
      setPreview(null);
      toast.error(error instanceof Error ? error.message : 'ملف الاستيراد غير صالح.');
      event.target.value = '';
    }
  };

  const resetImport = () => {
    setPendingData(null);
    setPreview(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingData || !preview?.canImport) {
      return;
    }
    try {
      const result = await onConfirmImport(pendingData);
      toast.success(
        `تم استيراد ${result.total} عنصراً بنجاح${result.skippedAuditLog ? `، وتخطي ${result.skippedAuditLog} سجل تدقيق بلا مرجع مطابق` : ''}.`
      );
      resetImport();
      setIsImportOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل استيراد المحتوى.');
    }
  };

  return (
    <Card className="border-primary/15 shadow-sm" dir="rtl">
      <CardHeader className="border-b bg-gradient-to-l from-primary/10 via-background to-background pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileJson className="h-5 w-5 text-primary" />
          النسخ الاحتياطي والاستيراد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {exportGroups.map((group) => (
            <label
              key={group.key}
              className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40"
            >
              <Checkbox
                checked={options[group.key]}
                onCheckedChange={(checked) =>
                  setOptions((current) => ({ ...current, [group.key]: checked === true }))
                }
              />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">{group.label}</span>
                <span className="text-xs text-muted-foreground">{group.description}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedCount === 0}
            className="flex-1"
          >
            {isExporting ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="ml-2 h-4 w-4" />
            )}
            تصدير {selectedCount} مجموعات
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setIsImportOpen(true)}>
            <Upload className="ml-2 h-4 w-4" />
            استيراد حزمة CMS
          </Button>
        </div>
        <p className="text-xs leading-6 text-muted-foreground">
          تتضمن الوسائط بيانات الملفات وروابط التخزين فقط، ولا تنسخ الملفات الثنائية. يُقيّد سجل
          التدقيق بالمدير ويُعاد ربطه بالعناصر المستوردة فقط.
        </p>
      </CardContent>

      <Dialog
        open={isImportOpen}
        onOpenChange={(open) => {
          setIsImportOpen(open);
          if (!open) {
            resetImport();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-primary" />
              معاينة حزمة CMS قبل الاستيراد
            </DialogTitle>
            <DialogDescription>
              تُفحص العلاقات والمفاتيح والتعارضات قبل أي كتابة. لن تُستبدل سجلات موجودة.
            </DialogDescription>
          </DialogHeader>

          {!preview ? (
            <div className="space-y-4 py-2">
              <Alert className="border-amber-300 bg-amber-50 text-amber-950">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>تنبيه الاستيراد</AlertTitle>
                <AlertDescription>
                  يُنفذ الاستيراد الذري بعد المراجعة فقط. عند أي تعارض أو مرجع غير صالح لن تُضاف أي
                  بيانات.
                </AlertDescription>
              </Alert>
              <label className="block rounded-lg border border-dashed p-6 text-center">
                <Upload className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                <span className="block text-sm font-medium">اختر ملف JSON للمعاينة</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  الحد الأقصى لسجل التدقيق هو 5,000 سجل.
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPreviewingImport}
                >
                  {isPreviewingImport ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileJson className="ml-2 h-4 w-4" />
                  )}
                  قراءة الملف
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <Alert className="border-emerald-300 bg-emerald-50 text-emerald-950">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>الحزمة جاهزة للمراجعة</AlertTitle>
                <AlertDescription>{preview.policy}</AlertDescription>
              </Alert>
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-sm font-medium">{fileName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  إجمالي العناصر: {preview.total}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(preview.counts)
                  .filter(([, count]) => count > 0)
                  .map(([key, count]) => (
                    <Badge key={key} variant="secondary" className="px-2 py-1">
                      {countLabels[key] ?? key}: {count}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>
              إلغاء
            </Button>
            {preview ? (
              <Button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting || !preview.canImport}
              >
                {isImporting ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="ml-2 h-4 w-4" />
                )}
                تأكيد الاستيراد الذري
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
