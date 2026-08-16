import { useMemo, useRef, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { Copy, ImagePlus, Images, Loader2, RefreshCw, Search, Trash2, X } from 'lucide-react';

function formatBytes(value: number | null | undefined) {
  if (!value) {
    return '—';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function MediaLibraryPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: images = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = trpc.content.images.list.useQuery({
    search: search.trim() || undefined,
    format: format === 'all' ? undefined : format,
  });

  const deleteMutation = trpc.content.images.delete.useMutation({
    onSuccess: () => {
      toast.success('تم نقل الصورة من المكتبة');
      refetch();
    },
    onError: (error) => toast.error(`تعذّر حذف الصورة: ${error.message}`),
  });

  const formats = useMemo(
    () =>
      Array.from(
        new Set(
          images.map((image) => image.format).filter((value): value is string => Boolean(value))
        )
      ).sort(),
    [images]
  );

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط الصورة');
    } catch {
      toast.error('تعذّر نسخ الرابط');
    }
  };

  const handleDelete = (id: number) => {
    // eslint-disable-next-line no-alert -- This is an explicit destructive action requiring confirmation.
    if (confirm('هل تريد حذف هذه الصورة من مكتبة الوسائط؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleUpload = async (files: File[]) => {
    if (!files.length) {
      return;
    }
    if (files.length > 20) {
      toast.error('يمكن رفع 20 ملفاً في المرة الواحدة كحد أقصى');
      return;
    }

    setIsUploading(true);
    try {
      const body = new FormData();
      files.forEach((file) => body.append('files', file));
      body.append('folder', 'uploads');
      const response = await fetch('/api/upload/batch', { method: 'POST', body });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || 'فشل رفع الملفات');
      }

      toast.success(`تم رفع ${result.files?.length || files.length} صورة وتحويلها إلى AVIF`);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل رفع الملفات');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <DashboardLayout
      pageTitle="مكتبة الوسائط"
      pageDescription="إدارة الصور المرفوعة واختيارها في أنحاء لوحة التحكم"
    >
      <div className="space-y-6" dir="rtl">
        <section className="rounded-2xl bg-gradient-to-l from-blue-700 via-blue-600 to-cyan-600 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-100">
                <Images className="h-5 w-5" />
                <span className="text-sm font-medium">مركز الوسائط</span>
              </div>
              <h1 className="text-2xl font-bold">الصور في مكان واحد</h1>
              <p className="max-w-2xl text-sm leading-6 text-blue-100">
                تُضغط كل صورة جديدة وتُحوّل تلقائياً إلى AVIF قبل تخزينها، لتكون جاهزة للاستخدام في
                المحتوى والنماذج الإدارية.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
                multiple
                onChange={(event) => handleUpload(Array.from(event.target.files || []))}
              />
              <Button
                type="button"
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="ml-2 h-4 w-4" />
                )}
                {isUploading ? 'جاري الرفع والمعالجة...' : 'رفع صور'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/60 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => refetch()}
                disabled={isFetching || isUploading}
              >
                <RefreshCw className={`ml-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </section>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_180px_auto]">
            <label className="relative block">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الوصف..."
                className="h-10 w-full rounded-md border border-input bg-background pr-10 pl-9 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30"
              />
              {search && (
                <button
                  type="button"
                  aria-label="مسح البحث"
                  onClick={() => setSearch('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              aria-label="تصفية حسب صيغة الملف"
            >
              <option value="all">كل الصيغ</option>
              {formats.map((value) => (
                <option key={value} value={value}>
                  {value.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-center rounded-md bg-muted px-3 text-sm font-medium text-muted-foreground">
              {images.length} صورة
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <Images className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="font-semibold">تعذّر تحميل مكتبة الوسائط</h2>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">{error.message}</p>
              <Button type="button" variant="outline" onClick={() => refetch()}>
                <RefreshCw className="ml-2 h-4 w-4" /> إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        ) : images.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="rounded-full bg-muted p-4">
                <Images className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-semibold">لا توجد صور مطابقة</h2>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                ارفع صوراً جديدة أو عدّل كلمة البحث. ستظهر هنا الصور المسجلة في قاعدة بيانات المشروع
                فقط.
              </p>
              <Button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                <ImagePlus className="ml-2 h-4 w-4" /> رفع صور
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {images.map((image) => (
              <article
                key={image.id}
                className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={image.url}
                    alt={image.altAr || image.altEn || image.key}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 transition-transform duration-200 group-hover:translate-y-0">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => handleCopy(image.url)}
                      aria-label="نسخ رابط الصورة"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => handleDelete(image.id)}
                      disabled={deleteMutation.isPending}
                      aria-label="حذف الصورة"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-medium" title={image.altAr || image.key}>
                    {image.altAr || image.key}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {image.format?.toUpperCase() || 'صورة'} · {formatBytes(image.size)}
                  </p>
                  {image.width && image.height && (
                    <p className="text-xs text-muted-foreground">
                      {image.width} × {image.height}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
