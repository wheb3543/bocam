import { useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { Check, ImagePlus, Images, Loader2, RefreshCw, Search, Upload } from 'lucide-react';
import { completeMediaSelection } from './mediaSelection';

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  folder?: string;
}

export default function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  folder = 'uploads',
}: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const {
    data: images = [],
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.content.images.list.useQuery({ search: search.trim() || undefined }, { enabled: open });

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => Number(b.id) - Number(a.id)),
    [images]
  );

  const selectImage = (url: string) => {
    completeMediaSelection(url, onSelect, onOpenChange);
  };

  const handleUpload = async (files: File[]) => {
    if (!files.length) {
      return;
    }
    if (files.length > 20) {
      toast.error('يمكن رفع 20 صورة في المرة الواحدة كحد أقصى');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('folder', folder);
      const response = await fetch('/api/upload/batch', { method: 'POST', body: formData });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || 'فشل رفع الصور');
      }

      toast.success(`تم رفع ${result.files?.length || files.length} صورة وتحويلها إلى AVIF`);
      setActiveTab('library');
      await refetch();
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : 'فشل رفع الصور');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-hidden p-0" dir="rtl">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Images className="h-5 w-5 text-primary" /> مكتبة الوسائط
          </DialogTitle>
          <DialogDescription>
            اختر صورة محفوظة أو ارفع صوراً جديدة. تُعالج جميع الصور تلقائياً بصيغة AVIF.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${activeTab === 'library' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Images className="ml-1.5 inline h-4 w-4" /> اختيار من المكتبة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Upload className="ml-1.5 inline h-4 w-4" /> رفع ملف
          </button>
        </div>

        <div className="min-h-[360px] overflow-y-auto px-6 py-5">
          {activeTab === 'upload' ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-8 text-center">
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
                multiple
                className="hidden"
                onChange={(event) => handleUpload(Array.from(event.target.files || []))}
              />
              {uploading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <div className="rounded-full bg-primary/10 p-4">
                  <ImagePlus className="h-8 w-8 text-primary" />
                </div>
              )}
              <h3 className="mt-4 font-semibold">
                {uploading ? 'جاري الرفع والمعالجة…' : 'ارفع صوراً إلى المكتبة'}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                يمكن اختيار حتى 20 صورة، بحجم أقصى 10MB للصورة. يحفظ النظام النسخ المضغوطة بصيغة
                AVIF.
              </p>
              <Button
                type="button"
                className="mt-5"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="ml-2 h-4 w-4" />
                )}
                اختيار الملفات
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex gap-2">
                <label className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="ابحث في الصور..."
                    className="h-10 w-full rounded-md border border-input bg-background pr-10 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  aria-label="تحديث المكتبة"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="aspect-square animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                  <p className="text-sm text-destructive">
                    تعذّر تحميل مكتبة الوسائط: {error.message}
                  </p>
                  <Button type="button" variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="ml-2 h-4 w-4" /> إعادة المحاولة
                  </Button>
                </div>
              ) : sortedImages.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
                  <Images className="h-9 w-9 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    لا توجد صور مطابقة. يمكنك رفع صورة جديدة الآن.
                  </p>
                  <Button type="button" variant="outline" onClick={() => setActiveTab('upload')}>
                    رفع ملف
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {sortedImages.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => selectImage(image.url)}
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted text-right outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <img
                        src={image.url}
                        alt={image.altAr || image.altEn || image.key}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-7 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Check className="ml-1 inline h-3.5 w-3.5" /> اختيار هذه الصورة
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
