import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  Clock3,
  FileText,
  ImagePlus,
  Loader2,
  Send,
  ShieldCheck,
  Video,
} from 'lucide-react';

type Platform = 'facebook' | 'instagram' | 'x' | 'linkedin' | 'youtube' | 'tiktok';
type ContentType = 'post' | 'image' | 'video' | 'reel' | 'story' | 'short';

const platformCatalog: Array<{ id: Platform; label: string; short: string; hue: string }> = [
  { id: 'facebook', label: 'فيسبوك', short: 'f', hue: 'bg-[#1877f2]' },
  {
    id: 'instagram',
    label: 'Instagram',
    short: '◎',
    hue: 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]',
  },
  { id: 'x', label: 'X', short: '𝕏', hue: 'bg-slate-950' },
  { id: 'linkedin', label: 'LinkedIn', short: 'in', hue: 'bg-[#0a66c2]' },
  { id: 'youtube', label: 'YouTube', short: '▶', hue: 'bg-[#ff0033]' },
  { id: 'tiktok', label: 'TikTok', short: '♪', hue: 'bg-slate-900' },
];

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  in_review: 'بانتظار الموافقة',
  approved: 'جاهز للنشر',
  scheduled: 'مجدول',
  publishing: 'قيد النشر',
  published: 'منشور',
  partial_failed: 'نجاح جزئي',
  failed: 'فشل',
  cancelled: 'ملغى',
  not_ready: 'غير جاهز',
  pending: 'بانتظار الربط',
  queued: 'في قائمة الجدولة',
  uploading: 'جارٍ رفع الوسيط',
  processing: 'قيد معالجة المنصة',
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );
}

function PlatformMark({ platform, compact = false }: { platform: Platform; compact?: boolean }) {
  const entry = platformCatalog.find((item) => item.id === platform)!;
  return (
    <span className="inline-flex items-center gap-2" title={entry.label}>
      <span
        className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-black text-white ${entry.hue}`}
      >
        {entry.short}
      </span>
      {!compact && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {entry.label}
        </span>
      )}
    </span>
  );
}

export default function PublishingPage() {
  const utils = trpc.useUtils();
  const workspaceQuery = trpc.content.publishing.overview.useQuery(undefined, {
    staleTime: 15_000,
  });
  const mediaQuery = trpc.content.media.list.useQuery({});
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [contentType, setContentType] = useState<ContentType>('post');
  const [platforms, setPlatforms] = useState<Platform[]>(['facebook', 'instagram']);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [scheduleValue, setScheduleValue] = useState('');

  const invalidateWorkspace = () => utils.content.publishing.overview.invalidate();
  const createDraft = trpc.content.publishing.createDraft.useMutation({
    onSuccess: () => {
      toast.success('تم حفظ مسودة النشر');
      setTitle('');
      setCaption('');
      setSelectedMediaIds([]);
      invalidateWorkspace();
    },
    onError: (error) => toast.error(error.message),
  });
  const submitForReview = trpc.content.publishing.submitForReview.useMutation({
    onSuccess: () => {
      toast.success('أُرسلت المسودة للموافقة');
      invalidateWorkspace();
    },
    onError: (error) => toast.error(error.message),
  });
  const review = trpc.content.publishing.review.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث قرار الموافقة');
      invalidateWorkspace();
    },
    onError: (error) => toast.error(error.message),
  });
  const schedule = trpc.content.publishing.schedule.useMutation({
    onSuccess: () => {
      toast.success('تم حفظ موعد النشر. سيُفعّل التنفيذ التلقائي بعد ربط الحسابات ونشر النسخة.');
      setScheduleValue('');
      invalidateWorkspace();
    },
    onError: (error) => toast.error(error.message),
  });
  const cancelSchedule = trpc.content.publishing.cancelSchedule.useMutation({
    onSuccess: () => {
      toast.success('تم إلغاء جدولة المنشور');
      invalidateWorkspace();
    },
    onError: (error) => toast.error(error.message),
  });
  const retryDestination = trpc.content.publishing.retryDestination.useMutation({
    onSuccess: () => {
      toast.success('أُعيدت الوجهة إلى قائمة التسليم. ستنفذ في دورة Heartbeat التالية.');
      invalidateWorkspace();
    },
    onError: (error) => toast.error(error.message),
  });

  const connectedByPlatform = useMemo(() => {
    return new Set(
      (workspaceQuery.data?.accounts ?? [])
        .filter((account) => account.connectionStatus === 'connected')
        .map((account) => account.platform)
    );
  }, [workspaceQuery.data?.accounts]);

  const togglePlatform = (platform: Platform) => {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  };

  const toggleMedia = (mediaId: number) => {
    setSelectedMediaIds((current) =>
      current.includes(mediaId) ? current.filter((item) => item !== mediaId) : [...current, mediaId]
    );
  };

  const submitDraft = () => {
    if (!title.trim()) {
      toast.error('أدخل عنواناً داخلياً للمسودة');
      return;
    }
    if (!platforms.length) {
      toast.error('اختر منصة واحدة على الأقل');
      return;
    }
    createDraft.mutate({
      title: title.trim(),
      baseCaption: caption.trim() || null,
      contentType,
      platforms,
      mediaIds: selectedMediaIds,
      timezone: 'Asia/Aden',
    });
  };

  const posts = workspaceQuery.data?.posts ?? [];
  const totals = workspaceQuery.data?.totals;

  return (
    <DashboardLayout
      pageTitle="النشر متعدد المنصات"
      pageDescription="أنشئ مسودة واحدة وجهّز وجهاتها للموافقة أو الجدولة والتوزيع الآمن"
    >
      <div dir="rtl" className="space-y-6 pb-10">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="outline" className="h-9 border-primary/20 bg-primary/5 text-primary">
            {totals?.connectedAccounts ?? 0} حساب متصل
          </Badge>
          <Badge variant="outline" className="h-9 border-amber-200 bg-amber-50 text-amber-800">
            {totals?.awaitingReview ?? 0} للمراجعة
          </Badge>
          <Badge variant="outline" className="h-9 border-border bg-muted/40 text-muted-foreground">
            {totals?.scheduled ?? 0} مجدول
          </Badge>
          <Button
            variant="outline"
            className="min-h-10"
            onClick={() => workspaceQuery.refetch()}
            disabled={workspaceQuery.isFetching}
          >
            {workspaceQuery.isFetching ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            تحديث الحالة
          </Button>
        </div>

        <section aria-label="مراحل سير النشر" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: FileText,
              label: '1. أنشئ المسودة',
              detail: `${totals?.draft ?? 0} مسودة مفتوحة`,
            },
            {
              icon: ShieldCheck,
              label: '2. أرسل للموافقة',
              detail: `${totals?.awaitingReview ?? 0} بانتظار القرار`,
            },
            {
              icon: CalendarClock,
              label: '3. حدد الموعد',
              detail: `${totals?.scheduled ?? 0} منشور مجدول`,
            },
            { icon: Send, label: '4. راقب التوزيع', detail: 'يبدأ بعد اكتمال الربط' },
          ].map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <StepIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  1
                </span>
                <Send className="h-5 w-5 text-primary" /> إنشاء مسودة جديدة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4 md:grid-cols-[1fr_190px]">
                <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  عنوان داخلي للمحتوى
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="مثال: تعريف بخدمة العناية الرقمية"
                    maxLength={255}
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  نوع المحتوى
                  <select
                    value={contentType}
                    onChange={(event) => setContentType(event.target.value as ContentType)}
                    className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="post">منشور نصي</option>
                    <option value="image">منشور صور</option>
                    <option value="video">فيديو</option>
                    <option value="reel">ريل</option>
                    <option value="story">ستوري</option>
                    <option value="short">YouTube Short</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                النص الأساسي والوصف
                <Textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="اكتب الرسالة الأساسية. ستُنشأ منها نسخة قابلة للتخصيص لكل منصة."
                  className="min-h-36 resize-y leading-7"
                  maxLength={10000}
                />
                <span
                  className="block text-left text-xs font-normal tabular-nums text-muted-foreground"
                  aria-live="polite"
                >
                  {caption.length.toLocaleString('ar-SA')} / 10,000
                </span>
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    المنصات والوجهات
                  </h2>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    يتحقق الخادم من اتصال الحساب قبل النشر الحي
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {platformCatalog.map((platform) => {
                    const selected = platforms.includes(platform.id);
                    const connected = connectedByPlatform.has(platform.id);
                    return (
                      <button
                        type="button"
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        aria-pressed={selected}
                        className={`flex min-h-14 items-center justify-between rounded-2xl border p-3 text-right transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'border-primary bg-primary/5 ring-1 ring-primary dark:bg-primary/10' : 'border-border bg-card hover:border-primary/40'}`}
                      >
                        <PlatformMark platform={platform.id} />
                        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-400'}`}
                            aria-hidden="true"
                          />
                          {connected ? 'متصل' : 'بانتظار الربط'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">اختيار من مكتبة الوسائط</h2>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {selectedMediaIds.length} أصل محدد
                  </span>
                </div>
                {mediaQuery.isLoading ? (
                  <div
                    className="flex items-center gap-2 py-3 text-sm text-muted-foreground"
                    role="status"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" /> جارِ تحميل الوسائط…
                  </div>
                ) : (
                  <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
                    {(mediaQuery.data ?? []).slice(-16).map((asset) => {
                      const selected = selectedMediaIds.includes(asset.id);
                      return (
                        <button
                          type="button"
                          key={asset.id}
                          onClick={() => toggleMedia(asset.id)}
                          aria-pressed={selected}
                          className={`overflow-hidden rounded-xl border text-right transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-border bg-card hover:border-primary/40'}`}
                        >
                          <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800">
                            {asset.type === 'image' ? (
                              <img
                                src={asset.url}
                                alt={asset.altAr || asset.fileName || 'وسيط'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full place-items-center text-slate-500">
                                <Video className="h-7 w-7" />
                              </div>
                            )}
                          </div>
                          <p className="truncate px-2 py-2 text-[11px] text-muted-foreground">
                            {asset.fileName || asset.type}
                          </p>
                        </button>
                      );
                    })}
                    {!mediaQuery.data?.length && (
                      <p className="col-span-full py-3 text-center text-sm text-slate-500">
                        لا توجد وسائط متاحة بعد. أضفها من مكتبة الوسائط.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
                <Button
                  onClick={submitDraft}
                  disabled={createDraft.isPending}
                  className="min-h-10 w-full gap-2 sm:w-auto"
                >
                  {createDraft.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}{' '}
                  حفظ المسودة
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> جاهزية الربط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              {platformCatalog.map((platform) => {
                const connected = connectedByPlatform.has(platform.id);
                return (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                  >
                    <PlatformMark platform={platform.id} />
                    <Badge
                      variant="secondary"
                      className={
                        connected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }
                    >
                      {connected ? 'متصل' : 'يتطلب OAuth'}
                    </Badge>
                  </div>
                );
              })}
              <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                <CircleAlert className="ml-1 inline h-3.5 w-3.5" /> يتم حفظ المسودات والجدولة الآن،
                لكن النشر الفعلي يبقى محمياً حتى ربط كل حساب ومراجعة صلاحياته.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock3 className="h-5 w-5 text-indigo-600" /> مسودات النشر وحالاتها
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => workspaceQuery.refetch()}
              disabled={workspaceQuery.isFetching}
            >
              تحديث
            </Button>
          </CardHeader>
          <CardContent className="pt-5">
            {workspaceQuery.isLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-500">
                <Loader2 className="ml-2 h-5 w-5 animate-spin" /> جارِ تحميل المسودات…
              </div>
            ) : !posts.length ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-500 dark:border-slate-800">
                <Send className="mx-auto mb-3 h-8 w-8 text-slate-300" /> لا توجد مسودات بعد. ابدأ من
                المحرر أعلاه.
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((entry) => {
                  const post = entry.post;
                  return (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-border bg-card p-3 sm:p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-950 dark:text-white">
                              {post.title}
                            </h3>
                            <Badge variant="secondary">
                              {statusLabels[post.status] || post.status}
                            </Badge>
                            <Badge variant="outline">{post.contentType}</Badge>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {post.baseCaption || 'لا يوجد نص أساسي بعد'}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {entry.destinations.map(({ destination, videoTransfer }) => (
                              <div
                                key={destination.id}
                                className="flex items-center gap-1 rounded-lg border border-border bg-muted/20 px-2 py-1"
                              >
                                <PlatformMark platform={destination.platform as Platform} compact />
                                <span className="mr-1 text-[10px] text-slate-500">
                                  {statusLabels[destination.publicationStatus] ||
                                    destination.publicationStatus}
                                </span>
                                {videoTransfer && (
                                  <span className="mr-1 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                                    {videoTransfer.phase === 'uploading'
                                      ? `رفع ${videoTransfer.progressPercent}٪`
                                      : videoTransfer.mode === 'upload'
                                        ? 'بانتظار إكمال المسودة'
                                        : 'تعالج المنصة الفيديو'}
                                  </span>
                                )}
                                {destination.publicationStatus === 'failed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="min-h-9 px-2 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() =>
                                      retryDestination.mutate({ destinationId: destination.id })
                                    }
                                    disabled={retryDestination.isPending}
                                  >
                                    إعادة المحاولة
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          {post.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => submitForReview.mutate({ id: post.id })}
                              disabled={submitForReview.isPending}
                            >
                              إرسال للموافقة
                            </Button>
                          )}
                          {post.status === 'in_review' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => review.mutate({ id: post.id, decision: 'approved' })}
                                disabled={review.isPending}
                              >
                                <CheckCircle2 className="ml-1 h-3.5 w-3.5" /> موافقة
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => review.mutate({ id: post.id, decision: 'rejected' })}
                                disabled={review.isPending}
                              >
                                إرجاع للمسودة
                              </Button>
                            </>
                          )}
                          {post.status === 'approved' && (
                            <div className="flex items-center gap-2">
                              <Input
                                aria-label="موعد النشر"
                                type="datetime-local"
                                value={scheduleValue}
                                onChange={(event) => setScheduleValue(event.target.value)}
                                className="min-h-10 w-full text-xs sm:w-48"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="min-h-10"
                                disabled={!scheduleValue || schedule.isPending}
                                onClick={() =>
                                  schedule.mutate({
                                    id: post.id,
                                    scheduledAt: new Date(scheduleValue),
                                    timezone: 'Asia/Aden',
                                  })
                                }
                              >
                                <CalendarClock className="ml-1 h-3.5 w-3.5" /> جدولة
                              </Button>
                            </div>
                          )}
                          {post.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelSchedule.mutate({ id: post.id })}
                              disabled={cancelSchedule.isPending}
                            >
                              إلغاء الجدولة
                            </Button>
                          )}
                          <ChevronLeft className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                      {post.scheduledAt && (
                        <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                          موعد النشر:{' '}
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {formatDate(post.scheduledAt)}
                          </span>{' '}
                          · {post.timezone}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
