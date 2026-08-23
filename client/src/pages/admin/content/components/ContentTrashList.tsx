import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/api/trpc';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CalendarClock,
  Eye,
  FileText,
  Image,
  Layers,
  Layout,
  Loader2,
  MousePointerClick,
  RefreshCcw,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

type TrashEntityType = 'textContent' | 'image' | 'page' | 'section' | 'sectionButton';
type TrashFilter = TrashEntityType | 'all';

const entityOptions: Array<{ value: TrashFilter; label: string }> = [
  { value: 'all', label: 'كل العناصر' },
  { value: 'page', label: 'الصفحات' },
  { value: 'section', label: 'الأقسام' },
  { value: 'textContent', label: 'النصوص' },
  { value: 'image', label: 'الصور' },
  { value: 'sectionButton', label: 'أزرار الأقسام' },
];

const entityPresentation = {
  textContent: { label: 'نص', icon: FileText, className: 'bg-sky-50 text-sky-700 ring-sky-200' },
  image: { label: 'صورة', icon: Image, className: 'bg-violet-50 text-violet-700 ring-violet-200' },
  page: {
    label: 'صفحة',
    icon: Layout,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  section: { label: 'قسم', icon: Layers, className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  sectionButton: {
    label: 'زر قسم',
    icon: MousePointerClick,
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
} as const;

function keyOf(item: { entityType: TrashEntityType; id: number }) {
  return `${item.entityType}:${item.id}`;
}

export function ContentTrashList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [entityType, setEntityType] = useState<TrashFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<{
    entityType: TrashEntityType;
    id: number;
  } | null>(null);
  const [retentionDays, setRetentionDays] = useState('30');
  const [retentionEnabled, setRetentionEnabled] = useState(true);
  const deferredSearch = useDeferredValue(search);
  const utils = trpc.useUtils();
  const queryInput = useMemo(
    () => ({
      entityType: entityType === 'all' ? undefined : entityType,
      search: deferredSearch.trim() || undefined,
      limit: 100,
    }),
    [deferredSearch, entityType]
  );
  const trashQuery = trpc.content.trash.list.useQuery(queryInput, { enabled: isAdmin });
  const retentionQuery = trpc.content.trash.getRetentionPolicy.useQuery(undefined, {
    enabled: isAdmin,
  });
  const previewQuery = trpc.content.trash.preview.useQuery(
    previewTarget ?? { entityType: 'textContent', id: 1 },
    { enabled: Boolean(previewTarget) }
  );
  const trashItems = trashQuery.data?.data;
  const items = useMemo(() => trashItems ?? [], [trashItems]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedKeys.includes(keyOf(item))),
    [items, selectedKeys]
  );
  const allVisibleSelected =
    items.length > 0 && items.every((item) => selectedKeys.includes(keyOf(item)));

  useEffect(() => {
    if (retentionQuery.data) {
      setRetentionDays(String(retentionQuery.data.retentionDays));
      setRetentionEnabled(retentionQuery.data.isEnabled);
    }
  }, [retentionQuery.data]);

  const restoreMutation = trpc.content.trash.restoreMany.useMutation({
    onSuccess: async (result) => {
      if (result.restored.length > 0) {
        toast.success(`تمت استعادة ${result.restored.length} عنصر كمسودات آمنة.`);
      }
      if (result.skipped.length > 0) {
        toast.warning(`تخطي ${result.skipped.length} عنصر لأنه لم يعد متاحاً للاستعادة.`);
      }
      setSelectedKeys([]);
      setIsConfirmationOpen(false);
      await Promise.all([
        utils.content.trash.list.invalidate(),
        utils.content.textContent.list.invalidate(),
        utils.content.images.list.invalidate(),
        utils.content.pages.list.invalidate(),
        utils.content.sections.list.invalidate(),
        utils.content.sectionButtons.list.invalidate(),
      ]);
    },
    onError: (error) => toast.error(error.message || 'تعذرت استعادة العناصر المحددة.'),
  });

  const retentionMutation = trpc.content.trash.updateRetentionPolicy.useMutation({
    onSuccess: async () => {
      toast.success('تم حفظ سياسة الاحتفاظ بسلة المحذوفات.');
      await retentionQuery.refetch();
    },
    onError: (error) => toast.error(error.message || 'تعذر حفظ سياسة الاحتفاظ.'),
  });

  const toggleItem = (item: { entityType: TrashEntityType; id: number }) => {
    const key = keyOf(item);
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((selectedKey) => selectedKey !== key)
        : [...current, key]
    );
  };

  const toggleAllVisible = () => {
    const visibleKeys = items.map(keyOf);
    setSelectedKeys((current) =>
      allVisibleSelected
        ? current.filter((key) => !visibleKeys.includes(key))
        : current.concat(visibleKeys.filter((key) => !current.includes(key)))
    );
  };

  if (!isAdmin) {
    return (
      <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>سلة المحذوفات محمية</AlertTitle>
        <AlertDescription>
          الاستعادة الجماعية متاحة للمدير فقط لأنها تغيّر حالة النشر وتحفظ سجلاً تدقيقياً ونسخة
          أمان.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <Card className="overflow-hidden border-primary/20 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-l from-primary/10 via-background to-background pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trash2 className="h-5 w-5 text-primary" />
                سلة محذوفات المحتوى
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                استعد العناصر كمسودات فقط، مع نسخة أمان وسجل تدقيق لكل عملية.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => trashQuery.refetch()}
              disabled={trashQuery.isFetching}
            >
              <RefreshCcw
                className={`ml-2 h-4 w-4 ${trashQuery.isFetching ? 'animate-spin' : ''}`}
              />
              تحديث السلة
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative block flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الوصف أو الرابط…"
                className="pr-9"
              />
            </label>
            <div className="flex flex-wrap gap-2" aria-label="تصفية نوع العناصر المحذوفة">
              {entityOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={entityType === option.value ? 'default' : 'outline'}
                  onClick={() => setEntityType(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-medium">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  سياسة الحذف النهائي المؤجل
                </p>
                <p className="text-sm text-muted-foreground">
                  لا تُحذف العناصر نهائياً إلا بعد انتهاء مدة الاحتفاظ. قبل ذلك تبقى قابلة للمعاينة
                  والاستعادة.
                </p>
                <p className="text-xs text-muted-foreground">
                  {retentionQuery.data?.isScheduled
                    ? 'مهمة التنظيف اليومية مفعّلة وتتحقق من العناصر المستحقة.'
                    : 'سيُفعَّل التنظيف اليومي بعد اعتماد إعداد المهمة الآمنة.'}
                  {retentionQuery.data?.lastPurgeAt
                    ? ` آخر تنفيذ: ${new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(retentionQuery.data.lastPurgeAt)}.`
                    : ''}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="grid gap-1 text-sm font-medium">
                  أيام الاحتفاظ
                  <Input
                    type="number"
                    min={7}
                    max={365}
                    value={retentionDays}
                    onChange={(event) => setRetentionDays(event.target.value)}
                    className="w-32"
                  />
                </label>
                <label className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm">
                  <Checkbox
                    checked={retentionEnabled}
                    onCheckedChange={(checked) => setRetentionEnabled(checked === true)}
                  />
                  تفعيل الحذف النهائي
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    retentionMutation.mutate({
                      retentionDays: Number(retentionDays),
                      isEnabled: retentionEnabled,
                    })
                  }
                  disabled={
                    retentionMutation.isPending ||
                    !Number.isInteger(Number(retentionDays)) ||
                    Number(retentionDays) < 7 ||
                    Number(retentionDays) > 365
                  }
                >
                  <Settings2 className="ml-2 h-4 w-4" />
                  حفظ السياسة
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="select-all-trash"
                checked={allVisibleSelected}
                onCheckedChange={toggleAllVisible}
                disabled={items.length === 0 || trashQuery.isLoading}
              />
              <label htmlFor="select-all-trash" className="cursor-pointer text-sm font-medium">
                تحديد كل العناصر الظاهرة
              </label>
              <span className="text-xs text-muted-foreground">
                {selectedItems.length > 0
                  ? `${selectedItems.length} محدد`
                  : `${items.length} عنصر في السلة`}
              </span>
            </div>
            <Button
              type="button"
              onClick={() => setIsConfirmationOpen(true)}
              disabled={selectedItems.length === 0 || restoreMutation.isPending}
            >
              <RefreshCcw className="ml-2 h-4 w-4" />
              استعادة المحدد
            </Button>
          </div>

          {trashQuery.isLoading ? (
            <div className="flex min-h-52 items-center justify-center text-muted-foreground">
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جارٍ تحميل العناصر المحذوفة…
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
              <Trash2 className="mb-3 h-10 w-10 text-muted-foreground/60" />
              <p className="font-medium">سلة المحذوفات فارغة</p>
              <p className="mt-1 text-sm text-muted-foreground">
                لا توجد عناصر تطابق البحث أو التصفية الحالية.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="hidden grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-4 border-b bg-muted/45 px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
                <span />
                <span>العنصر المحذوف</span>
                <span>وقت الحذف</span>
                <span>إجراء</span>
              </div>
              <div className="divide-y">
                {items.map((item) => {
                  const presentation = entityPresentation[item.entityType];
                  const Icon = presentation.icon;
                  const selected = selectedKeys.includes(keyOf(item));
                  return (
                    <div
                      key={keyOf(item)}
                      className={`grid gap-3 px-4 py-3 transition-colors md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:items-center ${selected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                    >
                      <Checkbox
                        aria-label={`تحديد ${item.title}`}
                        checked={selected}
                        onCheckedChange={() => toggleItem(item)}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ring-1 ring-inset ${presentation.className}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {presentation.label}
                          </span>
                          <p className="truncate font-medium">{item.title}</p>
                          <Badge variant="outline" className="text-[11px]">
                            {item.status === 'published'
                              ? 'كان منشوراً'
                              : item.status === 'archived'
                                ? 'كان مؤرشفاً'
                                : 'مسودة'}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {item.description || 'لا يوجد وصف إضافي'}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground md:text-left">
                        {new Intl.DateTimeFormat('ar-SA', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(item.deletedAt)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPreviewTarget({ entityType: item.entityType, id: item.id })
                          }
                        >
                          <Eye className="ml-1 h-3.5 w-3.5" />
                          معاينة
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedKeys([keyOf(item)]);
                            setIsConfirmationOpen(true);
                          }}
                        >
                          استعادة
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد استعادة العناصر المحددة</AlertDialogTitle>
            <AlertDialogDescription>
              سيُعاد {selectedItems.length} عنصر كمسودة غير منشورة، مع تصفير وقت النشر وحفظ نسخة
              أمان وسجل تدقيق. لن يُنشر أي عنصر تلقائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoreMutation.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                restoreMutation.mutate({
                  items: selectedItems.map(({ entityType: selectedType, id }) => ({
                    entityType: selectedType,
                    id,
                  })),
                });
              }}
              disabled={restoreMutation.isPending || selectedItems.length === 0}
            >
              {restoreMutation.isPending ? 'جارٍ الاستعادة…' : 'استعادة كمسودات'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(previewTarget)}
        onOpenChange={(open) => !open && setPreviewTarget(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              معاينة العنصر المحذوف
            </DialogTitle>
            <DialogDescription>
              راجع البيانات كاملة قبل بدء الاستعادة. ستعود الاستعادة دائماً كمسودة غير منشورة.
            </DialogDescription>
          </DialogHeader>
          {previewQuery.isLoading ? (
            <div className="flex min-h-44 items-center justify-center text-muted-foreground">
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جارٍ تحميل المعاينة…
            </div>
          ) : previewQuery.data ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="font-semibold">{previewQuery.data.item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {previewQuery.data.item.description}
                </p>
              </div>
              {previewQuery.data.imageUrl ? (
                <img
                  src={previewQuery.data.imageUrl}
                  alt={previewQuery.data.item.title}
                  className="max-h-80 w-full rounded-lg border bg-muted/20 object-contain"
                />
              ) : null}
              <dl className="grid gap-3 sm:grid-cols-2">
                {previewQuery.data.fields.map((field) => (
                  <div key={field.label} className="rounded-lg border p-3">
                    <dt className="text-xs text-muted-foreground">{field.label}</dt>
                    <dd className="mt-1 break-words text-sm font-medium">{field.value}</dd>
                  </div>
                ))}
              </dl>
              {previewQuery.data.body ? (
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm leading-7">
                  {previewQuery.data.body}
                </pre>
              ) : null}
              {previewQuery.data.settings ? (
                <pre
                  className="max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-xs"
                  dir="ltr"
                >
                  {previewQuery.data.settings}
                </pre>
              ) : null}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              تعذرت قراءة العنصر المحدد.
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPreviewTarget(null)}>
              إغلاق
            </Button>
            <Button
              type="button"
              disabled={!previewQuery.data}
              onClick={() => {
                if (!previewQuery.data) {
                  return;
                }
                setSelectedKeys([keyOf(previewQuery.data.item)]);
                setPreviewTarget(null);
                setIsConfirmationOpen(true);
              }}
            >
              <RefreshCcw className="ml-2 h-4 w-4" />
              متابعة الاستعادة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
