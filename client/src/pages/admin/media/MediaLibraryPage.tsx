import React, { useRef, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import {
  Copy,
  FolderPlus,
  Folder,
  FolderOpen,
  Images,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Download,
  CheckSquare,
  Square,
} from 'lucide-react';

function formatBytes(value: number | null | undefined) {
  if (!value) {
    return '—';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function MediaLibraryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('عام');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [targetMoveFolder, setTargetMoveFolder] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const {
    data: images = [],
    isLoading,
    refetch,
  } = trpc.content.images.list.useQuery({
    search: search.trim() || undefined,
  });

  const deleteMutation = trpc.content.images.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الصور المحددة بنجاح');
      setSelectedIds([]);
      refetch();
    },
    onError: (err) => toast.error(`تعذّر الحذف: ${err.message}`),
  });

  const updateFolderMutation = trpc.content.images.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // قائمة المجلدات الفريدة
  const folders = useMemo(() => {
    const set = new Set<string>(['عام']);
    images.forEach((img) => {
      if (img.section) {
        set.add(img.section);
      }
    });
    return Array.from(set).sort();
  }, [images]);

  // الصور المفلترة بالمجلد الحالي
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const folderName = img.section || 'عام';
      return folderName === selectedFolder;
    });
  }, [images, selectedFolder]);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط الصورة');
    } catch {
      toast.error('تعذّر نسخ الرابط');
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name) {
      return;
    }
    if (folders.includes(name)) {
      toast.error('المجلد موجود بالفعل');
      return;
    }
    setSelectedFolder(name);
    setNewFolderName('');
    setIsCreatingFolder(false);
    toast.success(`تم إنشاء المجلد "${name}" بنجاح`);
  };

  const handleUploadFiles = async (
    fileList: Array<File> | { length: number; [index: number]: File }
  ) => {
    const filesArray = Array.from(fileList as ArrayLike<File>);
    if (!filesArray.length) {
      return;
    }

    setIsUploading(true);
    try {
      const body = new FormData();
      filesArray.forEach((file) => body.append('files', file));
      body.append('folder', selectedFolder);

      const res = await fetch('/api/upload/batch', { method: 'POST', body });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'فشل رفع الملفات');
      }

      toast.success(
        `تم رفع ${data.files?.length || filesArray.length} ملف بنجاح وتحويل الصور إلى AVIF`
      );
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل رفع الملفات');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredImages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredImages.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) {
      return;
    }
    // eslint-disable-next-line no-alert
    if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} عنصر من مكتبة الوسائط؟`)) {
      selectedIds.forEach((id) => deleteMutation.mutate({ id }));
    }
  };

  const handleBulkMove = async (newFolder: string) => {
    if (!selectedIds.length || !newFolder) {
      return;
    }
    setIsMoving(true);
    try {
      for (const id of selectedIds) {
        const item = images.find((i) => i.id === id);
        if (item) {
          await updateFolderMutation.mutateAsync({
            id: item.id,
            key: item.key,
            url: item.url,
            altAr: item.altAr || '',
            section: newFolder,
            format: item.format || 'avif',
            status: item.status || 'published',
            isActive: item.isActive || 'yes',
          });
        }
      }
      toast.success(`تم نقل ${selectedIds.length} عنصر إلى المجلد "${newFolder}"`);
      setSelectedIds([]);
      setTargetMoveFolder('');
      await refetch();
    } catch {
      toast.error('حدث خطأ أثناء نقل العناصر');
    } finally {
      setIsMoving(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!filteredImages.length) {
      toast.error('المجلد فارغ');
      return;
    }
    toast.info('جاري تجهيز وتنزيل ملفات المجلد...');
    filteredImages.forEach((img, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = img.url;
        a.download = img.key.split('/').pop() || `media-${img.id}`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 300);
    });
    toast.success('تم بدء تنزيل عناصر المجلد');
  };

  return (
    <DashboardLayout
      pageTitle="مكتبة الوسائط المتقدمة"
      pageDescription="إدارة المجلدات، الرفع المتعدد، النقل، السحب والإفلات، والتنزيل"
    >
      <div className="space-y-6" dir="rtl">
        {/* رأس الصفحة */}
        <section className="rounded-2xl bg-gradient-to-l from-blue-700 via-blue-600 to-cyan-600 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-100">
                <Images className="h-5 w-5" />
                <span className="text-sm font-medium">مكتبة الوسائط الذكية</span>
              </div>
              <h1 className="text-2xl font-bold">إدارة المجلدات والملفات</h1>
              <p className="max-w-2xl text-sm leading-6 text-blue-100">
                رفع مجلدات كاملة، تنظيم الملفات في مجلدات، السحب والإفلات، نقل العناصر، وتحويل الصور
                إلى AVIF تلقائياً.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => setIsCreatingFolder(true)}
              >
                <FolderPlus className="ml-2 h-4 w-4" />
                مجلد جديد
              </Button>
              <Button
                variant="secondary"
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="ml-2 h-4 w-4" />
                )}
                رفع ملفات
              </Button>
              <Button
                variant="secondary"
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => folderInputRef.current?.click()}
                disabled={isUploading}
              >
                <FolderOpen className="ml-2 h-4 w-4" />
                رفع مجلد كامل
              </Button>
            </div>
          </div>
        </section>

        {/* مخفي للرفع */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        />
        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          // @ts-expect-error webkitdirectory is supported in modern browsers
          webkitdirectory="true"
          directory=""
          multiple
          onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        />

        {/* حوار إنشاء مجلد */}
        {isCreatingFolder && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <FolderPlus className="h-5 w-5 text-blue-600" />
              <Input
                placeholder="اسم المجلد الجديد..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="max-w-sm bg-white"
              />
              <Button onClick={handleCreateFolder} size="sm">
                إنشاء
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsCreatingFolder(false)}>
                إلغاء
              </Button>
            </CardContent>
          </Card>
        )}

        {/* المحتوى الرئيسي: شجرة المجلدات يميناً والعرض يساراً */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* شجرة المجلدات الجانبية */}
          <Card className="lg:col-span-1 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  <Folder className="h-4 w-4 text-blue-600" />
                  المجلدات
                </span>
                <span className="text-xs text-gray-500">{folders.length} مجلد</span>
              </div>
              <div className="space-y-1">
                {folders.map((folder) => {
                  const count = images.filter((i) => (i.section || 'عام') === folder).length;
                  const isSelected = selectedFolder === folder;
                  return (
                    <button
                      key={folder}
                      onClick={() => setSelectedFolder(folder)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white font-medium shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {isSelected ? (
                          <FolderOpen className="h-4 w-4" />
                        ) : (
                          <Folder className="h-4 w-4" />
                        )}
                        {folder}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600'}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-gray-700"
                  onClick={handleDownloadZip}
                >
                  <Download className="ml-2 h-4 w-4 text-blue-600" />
                  تنزيل ملفات المجلد (ZIP)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* منطقة العرض وسحب وإفلات الملفات */}
          <div className="lg:col-span-3 space-y-4">
            {/* شريط البحث والإجراءات الجماعية */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث في الملفات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-9"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    <span className="text-xs font-medium text-blue-700">
                      محدد: {selectedIds.length}
                    </span>
                    <select
                      className="text-xs border rounded px-2 py-1 bg-white"
                      value={targetMoveFolder}
                      onChange={(e) => handleBulkMove(e.target.value)}
                      disabled={isMoving}
                    >
                      <option value="">نقل إلى مجلد...</option>
                      {folders
                        .filter((f) => f !== selectedFolder)
                        .map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                    </select>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleBulkDelete}
                    >
                      حذف
                    </Button>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={() => refetch()} title="تحديث">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* منطقة السحب والإفلات */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDraggingOver
                  ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-800">
                  اسحب وأفلت الملفات هنا للرفع إلى مجلد "{selectedFolder}"
                </h3>
                <p className="text-xs text-gray-500">أو انقر على زر "رفع ملفات" في الأعلى</p>
              </div>
            </div>

            {/* قائمة الملفات */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredImages.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Images className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="font-semibold text-gray-700">المجلد فارغ</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    لا توجد ملفات في مجلد "{selectedFolder}" حالياً
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2 text-xs text-gray-500">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1.5 hover:text-gray-800 font-medium"
                  >
                    {selectedIds.length === filteredImages.length ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    تحديد الكل ({filteredImages.length})
                  </button>
                  <span>عرض مجلد: {selectedFolder}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredImages.map((image) => {
                    const isSelected = selectedIds.includes(image.id);
                    return (
                      <div
                        key={image.id}
                        className={`group relative bg-white border rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-blue-600 border-blue-600' : 'border-gray-200'
                        }`}
                      >
                        <div className="absolute top-2 right-2 z-10">
                          <button
                            onClick={() => toggleSelectOne(image.id)}
                            className="p-1 bg-white/90 rounded shadow hover:bg-white text-gray-700"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>

                        <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.altAr || 'صورة'}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>

                        <div className="p-3 space-y-2">
                          <p
                            className="text-xs font-medium text-gray-800 truncate"
                            title={image.altAr || image.key}
                          >
                            {image.altAr || image.key.split('/').pop()}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span className="uppercase bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-600">
                              {image.format || 'avif'}
                            </span>
                            <span>{formatBytes(image.size)}</span>
                            <span>
                              {image.width && image.height ? `${image.width}×${image.height}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-blue-600 hover:text-blue-700 px-2"
                              onClick={() => handleCopy(image.url)}
                            >
                              <Copy className="ml-1 h-3 w-3" /> نسخ الرابط
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-red-600 hover:text-red-700 px-2"
                              onClick={() => {
                                // eslint-disable-next-line no-alert
                                if (window.confirm('هل تريد حذف هذه الصورة؟')) {
                                  deleteMutation.mutate({ id: image.id });
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
