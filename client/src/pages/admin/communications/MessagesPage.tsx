import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Clock3,
  ExternalLink,
  Inbox,
  Loader2,
  MessageCircle,
  MessageSquare,
  PanelLeft,
  RefreshCw,
  Search,
  Send,
  Star,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  buildSocialInboxFilters,
  inboxTabs,
  platformConfig,
  type InboxTabId,
  type Platform,
} from './socialInboxConfig';

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const config = platformConfig[platform];
  const Icon = config.icon;
  return (
    <Badge
      variant="secondary"
      className={`gap-1 border-0 text-[11px] font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function EmptyPanel({
  title,
  description,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<InboxTabId>('all-messages');
  const [search, setSearch] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);

  const activeTabConfig = inboxTabs.find((tab) => tab.id === activeTab) ?? inboxTabs[0];
  const filters = useMemo(
    () => buildSocialInboxFilters(activeTabConfig, search),
    [activeTabConfig, search]
  );

  const utils = trpc.useUtils();
  const accountsQuery = trpc.socialInbox.accounts.useQuery();
  const statsQuery = trpc.socialInbox.stats.useQuery();
  const threadsQuery = trpc.socialInbox.threads.useQuery(filters, {
    placeholderData: (previous) => previous,
  });
  const threadQuery = trpc.socialInbox.thread.useQuery(
    { id: selectedThreadId ?? 0 },
    { enabled: selectedThreadId !== null }
  );

  const markReadMutation = trpc.socialInbox.markRead.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.socialInbox.threads.invalidate(),
        utils.socialInbox.stats.invalidate(),
      ]);
    },
    onError: (error) => toast.error(`تعذّر تحديث حالة القراءة: ${error.message}`),
  });
  const starMutation = trpc.socialInbox.setStarred.useMutation({
    onSuccess: async () => {
      await utils.socialInbox.threads.invalidate();
      await utils.socialInbox.thread.invalidate();
    },
    onError: (error) => toast.error(`تعذّر تحديث التمييز: ${error.message}`),
  });

  const threads = threadsQuery.data ?? [];
  const selectedThread = threadQuery.data?.thread;
  const selectedItems = threadQuery.data?.items ?? [];
  const selectedAccount = selectedThread
    ? (accountsQuery.data ?? []).find((account) => account.platform === selectedThread.platform)
    : undefined;
  const connectedAccounts = (accountsQuery.data ?? []).filter(
    (account) => account.status === 'connected'
  ).length;

  const handleSelectThread = (id: number) => {
    setSelectedThreadId(id);
    markReadMutation.mutate({ id, isRead: true });
  };

  const handleRefresh = async () => {
    await Promise.all([threadsQuery.refetch(), accountsQuery.refetch(), statsQuery.refetch()]);
    toast.success('تم تحديث صندوق البريد');
  };

  return (
    <DashboardLayout
      pageTitle="صندوق البريد الموحد"
      pageDescription="إدارة الرسائل والتعليقات من المنصات الاجتماعية في مكان واحد"
    >
      <div dir="rtl" className="container space-y-5 py-4 md:space-y-6 md:py-6">
        <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
                <MessageSquare className="h-4 w-4" />
                التواصل الاجتماعي
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                صندوق البريد الموحد
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                اجمع الرسائل والتعليقات الواردة من قنواتك الاجتماعية في شاشة واحدة، مع الاحتفاظ
                بمصدر كل تفاعل وحالته.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge
                variant="outline"
                className="h-9 gap-1.5 rounded-lg border-blue-200 bg-blue-50 px-3 text-blue-700"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                {connectedAccounts} حساب متصل
              </Badge>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleRefresh}
                disabled={threadsQuery.isFetching}
                aria-label="تحديث صندوق البريد"
              >
                {threadsQuery.isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              {
                label: 'كل المحادثات',
                value: statsQuery.data?.total ?? 0,
                icon: Inbox,
                className: 'bg-blue-50 text-blue-700',
              },
              {
                label: 'غير مقروءة',
                value: statsQuery.data?.unread ?? 0,
                icon: MessageCircle,
                className: 'bg-amber-50 text-amber-700',
              },
              {
                label: 'رسائل',
                value: statsQuery.data?.messages ?? 0,
                icon: Send,
                className: 'bg-sky-50 text-sky-700',
              },
              {
                label: 'تعليقات',
                value: statsQuery.data?.comments ?? 0,
                icon: MessageSquare,
                className: 'bg-violet-50 text-violet-700',
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/70 bg-slate-50/70 p-3 md:p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.className}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-foreground">{stat.value}</div>
                </div>
              );
            })}
          </div>
        </section>

        <Tabs
          dir="rtl"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as InboxTabId);
            setSelectedThreadId(null);
          }}
        >
          <TabsList
            aria-label="تبويبات صندوق البريد"
            dir="rtl"
            className="h-auto w-full flex-row justify-start gap-1 overflow-x-auto rounded-xl border border-border bg-white p-1 shadow-sm"
          >
            {inboxTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="min-h-10 shrink-0 gap-1.5 rounded-lg px-3 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm md:text-sm"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="grid min-h-[620px] lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
              <section
                className={`${selectedThreadId ? 'hidden lg:flex' : 'flex'} min-w-0 flex-col border-l border-border bg-white`}
              >
                <div className="border-b border-border p-3 md:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">
                        {activeTabConfig.label}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {threads.length} نتيجة ظاهرة
                      </p>
                    </div>
                    <PanelLeft className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="relative mt-3">
                    <Search
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="ابحث في الاسم أو المحتوى"
                      className="h-10 bg-slate-50 pr-9 text-sm"
                      aria-label="البحث في صندوق البريد"
                    />
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {threadsQuery.isLoading ? (
                    <div className="flex min-h-[320px] items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : threads.length === 0 ? (
                    <EmptyPanel
                      title="لا توجد تفاعلات بعد"
                      description="عند ربط الحسابات واستقبال أول رسالة أو تعليق سيظهر هنا دون بيانات تجريبية."
                    />
                  ) : (
                    <div className="divide-y divide-border/70">
                      {threads.map((thread) => {
                        const isSelected = thread.id === selectedThreadId;
                        return (
                          <button
                            key={thread.id}
                            type="button"
                            onClick={() => handleSelectThread(thread.id)}
                            className={`w-full p-3 text-right transition-colors hover:bg-blue-50/60 md:p-4 ${isSelected ? 'bg-blue-50 ring-inset ring-2 ring-blue-100' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                {thread.participantAvatarUrl ? (
                                  <img
                                    src={thread.participantAvatarUrl}
                                    alt=""
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <UserRound className="h-5 w-5" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <span
                                      className={`truncate text-sm ${thread.isRead ? 'font-medium text-foreground' : 'font-bold text-foreground'}`}
                                    >
                                      {thread.participantName || thread.title || 'تفاعل جديد'}
                                    </span>
                                    {!thread.isRead && (
                                      <span
                                        className="h-2 w-2 shrink-0 rounded-full bg-blue-600"
                                        aria-label="غير مقروء"
                                      />
                                    )}
                                  </div>
                                  <span className="shrink-0 text-[11px] text-muted-foreground">
                                    {formatDate(thread.lastActivityAt)}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <PlatformBadge platform={thread.platform} />
                                  <span className="text-[11px] text-muted-foreground">
                                    {thread.channelType === 'comment' ? 'تعليق' : 'رسالة'}
                                  </span>
                                </div>
                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                  {thread.preview || 'لا يوجد محتوى نصي'}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <section
                className={`${selectedThreadId ? 'flex' : 'hidden lg:flex'} min-w-0 flex-col bg-slate-50/60`}
              >
                {!selectedThread ? (
                  <EmptyPanel
                    title="اختر محادثة أو تعليقاً"
                    description="حدد عنصراً من القائمة لعرض التفاصيل. ستظهر حالة الحساب والربط هنا عند تفعيل المنصة."
                    icon={MessageSquare}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3 border-b border-border bg-white p-3 md:p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 lg:hidden"
                          onClick={() => setSelectedThreadId(null)}
                          aria-label="العودة إلى القائمة"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-semibold text-foreground">
                            {selectedThread.participantName ||
                              selectedThread.title ||
                              'تفاعل اجتماعي'}
                          </h2>
                          <div className="mt-1 flex items-center gap-2">
                            <PlatformBadge platform={selectedThread.platform} />
                            <span className="text-xs text-muted-foreground">
                              {selectedThread.channelType === 'comment' ? 'تعليق' : 'رسالة'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() =>
                            starMutation.mutate({
                              id: selectedThread.id,
                              isStarred: !selectedThread.isStarred,
                            })
                          }
                          aria-label={selectedThread.isStarred ? 'إزالة التمييز' : 'تمييز'}
                        >
                          <Star
                            className={`h-4 w-4 ${selectedThread.isStarred ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`}
                          />
                        </Button>
                        {selectedThread.postUrl && (
                          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                            <a
                              href={selectedThread.postUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="فتح المنشور الأصلي"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
                      <div className="mx-auto max-w-3xl space-y-4">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          آخر نشاط {formatDate(selectedThread.lastActivityAt)}
                        </div>
                        {selectedItems.length === 0 ? (
                          <EmptyPanel
                            title="لا توجد عناصر محفوظة"
                            description="ستظهر الرسائل أو التعليقات بعد وصولها من المصدر المتصل."
                          />
                        ) : (
                          selectedItems.map((item) => (
                            <div
                              key={item.id}
                              className={`flex ${item.direction === 'outbound' ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm ${item.direction === 'outbound' ? 'bg-blue-600 text-white' : 'border border-border bg-white text-foreground'}`}
                              >
                                <div className="mb-1 flex items-center justify-between gap-3 text-[11px] opacity-75">
                                  <span>
                                    {item.authorName ||
                                      (item.direction === 'outbound'
                                        ? 'فريق SGH'
                                        : 'مستخدم المنصة')}
                                  </span>
                                  <span>
                                    {formatDate(item.externalPublishedAt || item.createdAt)}
                                  </span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-6">
                                  {item.content || 'مرفق أو محتوى غير نصي'}
                                </p>
                                <div className="mt-2 flex items-center justify-end gap-1 text-[11px] opacity-70">
                                  {item.isRead ? (
                                    <CheckCheck className="h-3.5 w-3.5" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}{' '}
                                  {item.status === 'received' ? 'وارد' : item.status}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border bg-white p-3 md:p-4">
                      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm text-blue-900">
                        <Send className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                        <div>
                          <p className="font-semibold">الرد المباشر من داخل الصندوق</p>
                          <p className="mt-1 text-xs leading-5 text-blue-800/80">
                            {selectedAccount?.status === 'connected'
                              ? 'الحساب متصل. يلزم الآن تفعيل موصل الإرسال الرسمي للمنصة قبل إرسال ردود حقيقية.'
                              : 'لا يوجد حساب موصل لهذه المنصة بعد؛ ستبقى الرسائل والتعليقات للعرض والمتابعة حتى تكتمل بيانات الربط.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
