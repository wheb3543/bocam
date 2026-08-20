import React, { useEffect, useMemo, useRef, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { createMediaPreview } from './mediaPreview';
import {
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  Copy,
  Download,
  FileArchive,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Music2,
  RefreshCw,
  Search,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

type MediaTypeFilter = 'all' | 'image' | 'video' | 'audio' | 'document' | 'other';
type UploadableFiles = Array<File> | { length: number; [index: number]: File };

function formatBytes(value: number | null | undefined) {
  if (!value) {
    return '—';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function typeLabel(type: Exclude<MediaTypeFilter, 'all'>) {
  const labels = {
    image: 'صور',
    video: 'فيديو',
    audio: 'صوت',
    document: 'مستندات',
    other: 'ملفات أخرى',
  };
  return labels[type];
}

function toUploadArray(files: UploadableFiles) {
  return Array.from(files as ArrayLike<File>);
}

export default function MediaLibraryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const folderPathCache = useRef<Map<string, number>>(new Map());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);
  const [draggedMediaId, setDraggedMediaId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number[]>([]);

  const utils = trpc.useUtils();
  const { data: folders = [], isLoading: foldersLoading } =
    trpc.content.media.folders.list.useQuery();
  const generalFolder = folders.find((folder) => folder.path === '/general');
  const effectiveFolderId = selectedFolderId ?? generalFolder?.id;

  useEffect(() => {
    folderPathCache.current = new Map(folders.map((folder) => [folder.path, folder.id]));
  }, [folders]);

  useEffect(() => {
    if (!selectedFolderId && generalFolder?.id) {
      setSelectedFolderId(generalFolder.id);
    }
  }, [generalFolder?.id, selectedFolderId]);

  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.content.media.list.useQuery({
    folderId: effectiveFolderId,
    type: typeFilter === 'all' ? undefined : typeFilter,
    search: search.trim() || undefined,
  });

  const createFolderMutation = trpc.content.media.folders.create.useMutation({
    onSuccess: async (folder) => {
      await utils.content.media.folders.list.invalidate();
      setSelectedFolderId(folder.id);
      setFolderName('');
      setIsCreatingFolder(false);
      toast.success(`تم إنشاء مجلد «${folder.name}»`);
    },
    onError: (mutationError) => toast.error(`تعذّر إنشاء المجلد: ${mutationError.message}`),
  });

  const moveManyMutation = trpc.content.media.moveMany.useMutation({
    onSuccess: async ({ moved }) => {
      await utils.content.media.list.invalidate();
      setSelectedIds([]);
      toast.success(`تم نقل ${moved} عنصر بنجاح`);
    },
    onError: (mutationError) => toast.error(`تعذّر نقل العناصر: ${mutationError.message}`),
  });

  const deleteManyMutation = trpc.content.media.deleteMany.useMutation({
    onSuccess: async ({ deleted }) => {
      await utils.content.media.list.invalidate();
      setSelectedIds([]);
      setPendingDelete([]);
      toast.success(`تم حذف ${deleted} عنصر من المكتبة`);
    },
    onError: (mutationError) => toast.error(`تعذّر حذف العناصر: ${mutationError.message}`),
  });

  const childrenByParent = useMemo(() => {
    const grouped = new Map<number | null, typeof folders>();
    folders.forEach((folder) => {
      const parent = folder.parentId ?? null;
      grouped.set(parent, [...(grouped.get(parent) || []), folder]);
    });
    return grouped;
  }, [folders]);

  const folderCounts = useMemo(() => {
    const counts = new Map<number, number>();
    items.forEach((item) => {
      if (item.folderId) {
        counts.set(item.folderId, (counts.get(item.folderId) || 0) + 1);
      }
    });
    return counts;
  }, [items]);

  const selectedFolder = folders.find((folder) => folder.id === effectiveFolderId);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط الوسيط');
    } catch {
      toast.error('تعذّر نسخ الرابط');
    }
  };

  const uploadChunk = async (files: File[], folderId: number) => {
    const body = new FormData();
    files.forEach((file) => body.append('files', file));
    body.append('folderId', String(folderId));
    const response = await fetch('/api/upload/batch', { method: 'POST', body });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.error || 'فشل رفع الملفات');
    }
    return result.files?.length || files.length;
  };

  const uploadFiles = async (input: UploadableFiles, targetFolderId = effectiveFolderId) => {
    const files = toUploadArray(input);
    if (!files.length || !targetFolderId) {
      return;
    }
    setIsUploading(true);
    try {
      let uploadedCount = 0;
      for (let index = 0; index < files.length; index += 20) {
        uploadedCount += await uploadChunk(files.slice(index, index + 20), targetFolderId);
      }
      await utils.content.media.list.invalidate();
      toast.success(`تم رفع وفهرسة ${uploadedCount} ملف في «${selectedFolder?.name || 'المجلد'}»`);
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : 'فشل رفع الملفات');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (directoryInputRef.current) {
        directoryInputRef.current.value = '';
      }
    }
  };

  const ensureFolderPath = async (segments: string[]) => {
    let parentId: number | null = null;
    let currentPath = '';
    for (const rawSegment of segments) {
      const segment = rawSegment.trim();
      if (!segment) {
        continue;
      }
      currentPath = `${currentPath}/${segment}`;
      const existingId = folderPathCache.current.get(currentPath);
      if (existingId) {
        parentId = existingId;
      } else {
        const created = await createFolderMutation.mutateAsync({ name: segment, parentId });
        parentId = created.id;
        folderPathCache.current.set(currentPath, created.id);
      }
    }
    return parentId || effectiveFolderId;
  };

  const uploadDirectory = async (input: UploadableFiles) => {
    const files = toUploadArray(input) as Array<File & { webkitRelativePath?: string }>;
    if (!files.length) {
      return;
    }
    setIsUploading(true);
    try {
      const groups = new Map<string, File[]>();
      files.forEach((file) => {
        const relativePath = file.webkitRelativePath || file.name;
        const directory = relativePath.split('/').slice(0, -1).join('/');
        groups.set(directory, [...(groups.get(directory) || []), file]);
      });

      let uploadedCount = 0;
      for (const [directory, group] of Array.from(groups.entries())) {
        const folderId = await ensureFolderPath(directory.split('/'));
        if (!folderId) {
          throw new Error('تعذّر تجهيز مجلد الرفع');
        }
        for (let index = 0; index < group.length; index += 20) {
          uploadedCount += await uploadChunk(group.slice(index, index + 20), folderId);
        }
      }
      await Promise.all([
        utils.content.media.folders.list.invalidate(),
        utils.content.media.list.invalidate(),
      ]);
      toast.success(`تم رفع ${uploadedCount} ملف مع الحفاظ على هيكل المجلدات`);
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : 'فشل رفع المجلد');
    } finally {
      setIsUploading(false);
      if (directoryInputRef.current) {
        directoryInputRef.current.value = '';
      }
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === items.length ? [] : items.map((item) => item.id));
  };

  const moveSelection = (folderId: number) => {
    if (!selectedIds.length) {
      return;
    }
    moveManyMutation.mutate({ ids: selectedIds, folderId });
  };

  const handleFolderDrop = (event: React.DragEvent, folderId: number) => {
    event.preventDefault();
    const mediaId = Number(event.dataTransfer.getData('application/x-sgh-media-id'));
    if (mediaId) {
      moveManyMutation.mutate({ ids: [mediaId], folderId });
      setDraggedMediaId(null);
      return;
    }
    if (event.dataTransfer.files.length) {
      void uploadFiles(event.dataTransfer.files, folderId);
    }
  };

  const downloadFolderZip = () => {
    if (!effectiveFolderId) {
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = `/api/media/folders/${effectiveFolderId}/download`;
    anchor.download = `${selectedFolder?.name || 'media'}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const renderFolder = (folder: (typeof folders)[number], depth = 0): React.ReactNode => {
    const children = childrenByParent.get(folder.id) || [];
    const expanded = expandedFolders.includes(folder.id);
    const active = folder.id === effectiveFolderId;
    const count = folderCounts.get(folder.id) || 0;
    return (
      <React.Fragment key={folder.id}>
        <button
          type="button"
          draggable={false}
          onClick={() => setSelectedFolderId(folder.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleFolderDrop(event, folder.id)}
          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-right text-sm transition-colors ${
            active
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-slate-700 hover:bg-muted'
          } ${draggedMediaId ? 'ring-1 ring-transparent hover:ring-primary/40' : ''}`}
          style={{ paddingRight: `${10 + depth * 18}px` }}
        >
          {children.length ? (
            <span
              role="button"
              tabIndex={0}
              className="rounded p-0.5 hover:bg-black/10"
              onClick={(event) => {
                event.stopPropagation();
                setExpandedFolders((current) =>
                  current.includes(folder.id)
                    ? current.filter((id) => id !== folder.id)
                    : [...current, folder.id]
                );
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  setExpandedFolders((current) =>
                    current.includes(folder.id)
                      ? current.filter((id) => id !== folder.id)
                      : [...current, folder.id]
                  );
                }
              }}
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </span>
          ) : (
            <span className="w-4" />
          )}
          {active ? (
            <FolderOpen className="h-4 w-4 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
          )}
          <span className="min-w-0 flex-1 truncate">{folder.name}</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {count}
          </span>
        </button>
        {expanded && children.map((child) => renderFolder(child, depth + 1))}
      </React.Fragment>
    );
  };

  const rootFolders = childrenByParent.get(null) || [];

  return (
    <DashboardLayout
      pageTitle="مكتبة الوسائط"
      pageDescription="ارفع ونظّم الصور والفيديو والصوت والمستندات في مكتبة موحّدة"
    >
      <div dir="rtl" className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="outline" className="h-9 border-primary/20 bg-primary/5 text-primary">
            {items.length} عنصر ظاهر
          </Badge>
          <Badge variant="outline" className="h-9 border-border bg-muted/40 text-muted-foreground">
            {selectedFolder?.name || 'المجلد العام'}
          </Badge>
          <Button variant="outline" className="min-h-10" onClick={() => setIsCreatingFolder(true)}>
            <FolderPlus className="ml-2 h-4 w-4" />
            مجلد جديد
          </Button>
          <Button
            className="min-h-10"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="ml-2 h-4 w-4" />
            رفع ملفات
          </Button>
          <Button
            variant="outline"
            className="min-h-10"
            onClick={() => directoryInputRef.current?.click()}
            disabled={isUploading}
          >
            <FolderOpen className="ml-2 h-4 w-4" />
            رفع مجلد
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={(event) => {
            if (event.target.files) {
              void uploadFiles(event.target.files);
            }
          }}
        />
        <input
          ref={directoryInputRef}
          type="file"
          className="hidden"
          multiple // @ts-expect-error Browser directory upload attribute
          webkitdirectory=""
          onChange={(event) => {
            if (event.target.files) {
              void uploadDirectory(event.target.files);
            }
          }}
        />

        {isCreatingFolder && (
          <Card className="border-blue-200 bg-blue-50/60">
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <FolderPlus className="h-5 w-5 text-blue-700" />
              <Input
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="اسم المجلد الجديد"
                className="max-w-sm bg-white"
              />
              <Button
                onClick={() =>
                  createFolderMutation.mutate({
                    name: folderName,
                    parentId: effectiveFolderId ?? null,
                  })
                }
                disabled={!folderName.trim() || createFolderMutation.isPending}
              >
                إنشاء
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setFolderName('');
                  setIsCreatingFolder(false);
                }}
              >
                إلغاء
              </Button>
            </CardContent>
          </Card>
        )}

        {pendingDelete.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <span className="font-medium text-red-800">
                هل تريد حذف {pendingDelete.length} عنصر من المكتبة؟ سيُنفّذ الحذف الناعم فقط.
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPendingDelete([])}>
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteManyMutation.mutate({ ids: pendingDelete })}
                >
                  تأكيد الحذف
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <Card className="h-fit shadow-sm">
            <CardContent className="p-3">
              <div className="mb-3 flex items-center justify-between border-b px-1 pb-3">
                <div>
                  <p className="font-semibold text-foreground">شجرة المجلدات</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{folders.length} مجلد</p>
                </div>
                {expandedFolders.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-9 px-2 text-xs"
                    onClick={() => setExpandedFolders([])}
                  >
                    طي الكل
                  </Button>
                )}
              </div>
              <div className="max-h-56 space-y-1 overflow-y-auto pr-1 lg:max-h-[calc(100vh-20rem)]">
                {foldersLoading ? (
                  <div className="space-y-2 p-2" role="status" aria-label="جاري تحميل المجلدات">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="h-8 animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                ) : (
                  rootFolders.map((folder) => renderFolder(folder))
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-start"
                onClick={downloadFolderZip}
                disabled={!effectiveFolderId}
              >
                <Download className="ml-2 h-4 w-4 text-blue-600" />
                تنزيل المجلد ZIP
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    className="pr-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="ابحث بالاسم أو الوصف"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as MediaTypeFilter)}
                    className="h-9 rounded-md border bg-white px-2 text-sm"
                  >
                    <option value="all">كل الأنواع</option>
                    {(['image', 'video', 'audio', 'document', 'other'] as const).map((type) => (
                      <option key={type} value={type}>
                        {typeLabel(type)}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" size="icon" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {selectedIds.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex flex-wrap items-center gap-3 p-3" aria-live="polite">
                  <span className="text-sm font-semibold text-foreground">
                    تم تحديد {selectedIds.length} عنصر
                  </span>
                  <select
                    className="h-8 rounded border bg-white px-2 text-xs"
                    defaultValue=""
                    onChange={(event) => {
                      const folderId = Number(event.target.value);
                      if (folderId) {
                        moveSelection(folderId);
                      }
                      event.currentTarget.value = '';
                    }}
                    disabled={moveManyMutation.isPending}
                  >
                    <option value="">نقل إلى مجلد...</option>
                    {folders
                      .filter((folder) => folder.id !== effectiveFolderId)
                      .map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.path}
                        </option>
                      ))}
                  </select>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="min-h-9"
                    onClick={() => setPendingDelete(selectedIds)}
                  >
                    حذف المحدد
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-9"
                    onClick={() => setSelectedIds([])}
                  >
                    <X className="ml-1 h-4 w-4" />
                    إلغاء التحديد
                  </Button>
                </CardContent>
              </Card>
            )}

            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (event.dataTransfer.files.length) {
                  void uploadFiles(event.dataTransfer.files);
                }
              }}
              className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-4 text-center text-sm text-foreground"
            >
              <Upload className="mx-auto mb-1 h-5 w-5 text-primary" />
              <p>اسحب ملفاتك هنا لرفعها إلى «{selectedFolder?.name || 'المجلد'}»</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 min-h-9 bg-card"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="ml-1.5 h-4 w-4" />
                اختيار ملفات
              </Button>
            </div>

            {isLoading ? (
              <div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
                role="status"
                aria-label="جاري تحميل الوسائط"
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-2xl border border-border/70 bg-card"
                  />
                ))}
                <span className="sr-only">جاري تحميل الوسائط</span>
              </div>
            ) : isError ? (
              <Card>
                <CardContent className="p-10 text-center text-red-600">
                  تعذّر تحميل الوسائط: {error.message}
                </CardContent>
              </Card>
            ) : items.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileArchive className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="font-semibold text-slate-700">لا توجد وسائط في هذا المجلد</p>
                  <p className="mt-1 text-sm text-slate-500">
                    ارفع صورة أو فيديو أو ملفاً صوتياً أو مستنداً للبدء.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex flex-col gap-2 px-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex min-h-9 items-center gap-1.5 rounded-lg px-2 font-medium hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {selectedIds.length === items.length ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    تحديد الكل ({items.length})
                  </button>
                  <span>{selectedFolder?.path}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                  {items.map((item) => {
                    const selected = selectedIds.includes(item.id);
                    return (
                      <article
                        key={item.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData('application/x-sgh-media-id', String(item.id));
                          setDraggedMediaId(item.id);
                        }}
                        onDragEnd={() => setDraggedMediaId(null)}
                        className={`group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md ${selected ? 'border-primary ring-2 ring-primary/40' : 'border-border'}`}
                      >
                        <div className="relative aspect-video overflow-hidden bg-slate-100">
                          <button
                            type="button"
                            className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-card/95 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => toggleSelection(item.id)}
                            aria-label={
                              selected
                                ? `إلغاء تحديد ${item.fileName || 'الوسيط'}`
                                : `تحديد ${item.fileName || 'الوسيط'}`
                            }
                          >
                            {selected ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-500" />
                            )}
                          </button>
                          {createMediaPreview({
                            type: item.type,
                            url: item.url,
                            alt: item.altAr || item.fileName || 'وسيط',
                            label: typeLabel(item.type),
                          })}
                        </div>
                        <div className="space-y-2 p-2.5 sm:p-3">
                          <p
                            className="truncate text-sm font-semibold text-foreground"
                            title={item.fileName || item.key}
                          >
                            {item.fileName || item.key.split('/').pop()}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="rounded bg-muted px-1.5 py-0.5 uppercase">
                              {item.format || item.type}
                            </span>
                            <span>{formatBytes(item.size)}</span>
                            {item.width && item.height ? (
                              <span>
                                {item.width}×{item.height}
                              </span>
                            ) : (
                              <span>{item.mimeType?.split('/').pop()}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between border-t pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-9 px-2 text-xs text-primary"
                              onClick={() => handleCopy(item.url)}
                            >
                              <Copy className="ml-1 h-3 w-3" />
                              رابط
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-9 px-2 text-xs text-destructive"
                              onClick={() => setPendingDelete([item.id])}
                            >
                              <Trash2 className="ml-1 h-3 w-3" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
