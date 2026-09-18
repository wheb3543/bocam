/**
 * Bulk Image Upload Component
 * مكون رفع الصور الجماعي مع تحسين الصور
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface BulkImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFileSize?: number; // بالبايت
  maxFiles?: number;
  acceptedTypes?: string[];
}

/**
 * BulkImageUpload - مكون رفع الصور الجماعي مع معالجة خادمية
 */
export function BulkImageUpload({
  onUpload,
  maxFileSize = 10 * 1024 * 1024,
  maxFiles = 20,
  acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
  ],
}: BulkImageUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      const validateFile = (file: File): string | null => {
        if (!acceptedTypes.includes(file.type)) {
          return 'نوع الملف غير مدعوم';
        }
        if (file.size > maxFileSize) {
          return `حجم الملف كبير جداً (الحد الأقصى: ${Math.round(maxFileSize / 1024 / 1024)}MB)`;
        }
        return null;
      };
      if (files.length + newFiles.length > maxFiles) {
        toast.error(`لا يمكن رفع أكثر من ${maxFiles} ملف`);
        return;
      }

      const uploadFiles: UploadFile[] = newFiles.map((file) => {
        const error = validateFile(file);
        if (error) {
          return {
            file,
            preview: '',
            status: 'error',
            error,
          };
        }
        return { file, preview: URL.createObjectURL(file), status: 'pending' };
      });

      setFiles((prev) => [...prev, ...uploadFiles]);
    },
    [files.length, maxFiles, acceptedTypes, maxFileSize]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAll = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    const pendingFiles = files.filter((f) => f.status === 'pending');

    try {
      await onUpload(pendingFiles.map((f) => f.file));

      setFiles((prev) =>
        prev.map((f) => (f.status === 'pending' ? { ...f, status: 'success' } : f))
      );

      toast.success(`تم رفع ${pendingFiles.length} صورة وتحويلها إلى AVIF`);
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'pending' ? { ...f, status: 'error', error: 'فشل في الرفع' } : f
        )
      );
      toast.error('فشل رفع بعض الصور');
    } finally {
      setIsUploading(false);
    }
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          رفع الصور الجماعي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* منطقة السحب والإفلات */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">اسحب وأفلت الصور هنا أو</p>
          <label>
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleInputChange}
              className="hidden"
              disabled={isUploading}
            />
            <Button type="button" variant="outline" disabled={isUploading}>
              اختر الملفات
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-2">
            الحد الأقصى: {maxFiles} ملف، {Math.round(maxFileSize / 1024 / 1024)}MB لكل ملف. تتم
            المعالجة والتحويل إلى AVIF على الخادم.
          </p>
        </div>

        {/* قائمة الملفات */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{files.length} ملف في قائمة الرفع</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={isUploading}
              >
                مسح الكل
              </Button>
            </div>

            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(file.file.size / 1024)}KB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'pending' && (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* أزرار الرفع */}
            {pendingCount > 0 && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 ml-2" />
                    رفع {pendingCount} ملف
                  </>
                )}
              </Button>
            )}

            {/* حالة الرفع */}
            {successCount > 0 && (
              <div className="text-sm text-green-600">تم رفع {successCount} ملف بنجاح</div>
            )}
            {errorCount > 0 && <div className="text-sm text-red-600">فشل رفع {errorCount} ملف</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
