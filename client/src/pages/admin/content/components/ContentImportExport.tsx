/**
 * Content Import/Export Component
 * مكون استيراد وتصدير المحتوى
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, Upload, FileJson, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ContentImportExportProps {
  onExport: () => Promise<void>;
  onImport: (data: unknown) => Promise<void>;
}

/**
 * ContentImportExport - مكون استيراد وتصدير المحتوى
 */
export function ContentImportExport({ onExport, onImport }: ContentImportExportProps) {
  const handleExport = async () => {
    try {
      await onExport();
      toast.success('تم تصدير المحتوى بنجاح');
    } catch (error) {
      toast.error('فشل تصدير المحتوى');

      console.error(error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await onImport(data);
      toast.success('تم استيراد المحتوى بنجاح');
      event.target.value = '';
    } catch (error) {
      toast.error('فشل استيراد المحتوى. تأكد من صحة الملف');

      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          استيراد وتصدير المحتوى
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="flex-1">
            <Download className="h-4 w-4 ml-2" />
            تصدير المحتوى
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Upload className="h-4 w-4 ml-2" />
                استيراد المحتوى
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>استيراد المحتوى</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">تحذير</p>
                    <p className="mt-1">
                      سيتم استبدال المحتوى الحالي بالمحتوى المستورد. تأكد من عمل نسخة احتياطية قبل
                      الاستيراد.
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="import-file" className="block text-sm font-medium mb-2">
                    اختر ملف JSON
                  </label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-muted-foreground">
          يمكنك تصدير المحتوى كملف JSON واستيراده لاحقاً. هذا مفيد للنسخ الاحتياطي ونقل المحتوى بين
          البيئات.
        </p>
      </CardContent>
    </Card>
  );
}
