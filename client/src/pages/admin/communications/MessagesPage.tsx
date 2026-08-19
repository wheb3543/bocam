import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
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
import MetaCommentContextsPanel, { type MetaCommentContext } from './MetaCommentContextsPanel';

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

function isMetaTestAccount(metadata: string | null | undefined) {
  if (!metadata) {
    return false;
  }

  try {
    return JSON.parse(metadata).testData === true;
  } catch {
    return false;
  }
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
  const isMetaCommentTab =
    activeTabConfig.id === 'facebook-comments' || activeTabConfig.id === 'instagram-comments';
  const filters = useMemo(
    () => buildSocialInboxFilters(activeTabConfig, search),
    [activeTabConfig, search]
  );

  const utils = trpc.useUtils();
  const accountsQuery = trpc.socialInbox.accounts.useQuery();
  const activeUsersQuery = trpc.users.getActiveUsers.useQuery(undefined, {
    enabled: isMetaCommentTab,
  });
  const statsQuery = trpc.socialInbox.stats.useQuery();
  const threadsQuery = trpc.socialInbox.threads.useQuery(filters, {
    placeholderData: (previous) => previous,
  });
  const commentContextsQuery = trpc.socialInbox.commentContexts.useQuery(
    {
      platform: activeTabConfig.platform === 'facebook' ? 'facebook' : 'instagram',
      search: search.trim() || undefined,
    },
    { enabled: isMetaCommentTab, placeholderData: (previous) => previous }
  );
  const threadQuery = trpc.socialInbox.thread.useQuery(
    { id: selectedThreadId ?? 0 },
    { enabled: selectedThreadId !== null }
  );

  const markReadMutation = trpc.socialInbox.markRead.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.socialInbox.threads.invalidate(),
        utils.socialInbox.commentContexts.invalidate(),
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
  const workflowMutation = trpc.socialInbox.updateCommentWorkflow.useMutation({
    onSuccess: async () => {
      await utils.socialInbox.commentContexts.invalidate();
      toast.success('تم تحديث المتابعة أو التعيين');
    },
    onError: (error) => toast.error(`تعذّر تحديث سياق التعليق: ${error.message}`),
  });
  const replyCommentMutation = trpc.socialInbox.replyToComment.useMutation({
    onSuccess: async () => {
      await utils.socialInbox.commentContexts.invalidate();
      toast.success('تم إرسال الرد إلى Meta');
    },
    onError: (error) => toast.error(`تعذّر إرسال الرد: ${error.message}`),
  });
  const privateReplyMutation = trpc.socialInbox.sendCommentPrivateReply.useMutation({
    onSuccess: async () => {
      await utils.socialInbox.commentContexts.invalidate();
      toast.success('تم إرسال الرد الخاص إلى Meta');
    },
    onError: (error) => toast.error(`تعذّر إرسال الرد الخاص: ${error.message}`),
  });
  const hiddenMutation = trpc.socialInbox.setCommentHidden.useMutation({
    onSuccess: async () => {
      await utils.socialInbox.commentContexts.invalidate();
      toast.success('تم تحديث حالة إخفاء التعليق');
    },
    onError: (error) => toast.error(`تعذّر تحديث الإخفاء: ${error.message}`),
  });
  const enrichMutation = trpc.socialInbox.enrichCommentContext.useMutation({
    onSuccess: async () => {
      await utils.socialInbox.commentContexts.invalidate();
      toast.success('تم إثراء سياق المنشور أو الوسيط');
    },
    onError: (error) => toast.error(`تعذّر إثراء السياق: ${error.message}`),
  });

  const threads = threadsQuery.data ?? [];
  const selectedThread = threadQuery.data?.thread;
  const selectedItems = threadQuery.data?.items ?? [];
  const selectedAccount = selectedThread
    ? (accountsQuery.data ?? []).find((account) => account.id === selectedThread.accountId)
    : undefined;
  const testAccountIds = useMemo(
    () =>
      new Set(
        (accountsQuery.data ?? [])
          .filter((account) => isMetaTestAccount(account.metadata))
          .map((account) => account.id)
      ),
    [accountsQuery.data]
  );
  const connectedAccounts = (accountsQuery.data ?? []).filter(
    (account) => account.status === 'connected'
  ).length;

  const handleSelectThread = (id: number) => {
    setSelectedThreadId(id);
    markReadMutation.mutate({ id, isRead: true });
  };

  const handleRefresh = async () => {
    await Promise.all([
      threadsQuery.refetch(),
      commentContextsQuery.refetch(),
      accountsQuery.refetch(),
      statsQuery.refetch(),
    ]);
    toast.success('تم تحديث صندوق البريد');
  };

  const handleSelectCommentContext = (context: MetaCommentContext) => {
    if (!context.isRead) {
      markReadMutation.mutate({ id: context.id, isRead: true });
    }
  };

  const isCommentActionPending =
    workflowMutation.isPending ||
    replyCommentMutation.isPending ||
    privateReplyMutation.isPending ||
    hiddenMutation.isPending ||
    enrichMutation.isPending;

  return (
    <DashboardLayout
      pageTitle="صندوق البريد الموحد"
      pageDescription="إدارة الرسائل والتعليقات من المنصات الاجتماعية في مكان واحد"
    >
      <div dir="rtl" className="container space-y-5 py-4 md:space-y-6 md:py-6">
        <div className="space-y-3">
          <AdminPageHeader
            eyebrow="التواصل الاجتماعي"
            title="صندوق البريد الموحد"
            description="اجمع الرسائل والتعليقات الواردة من قنواتك الاجتماعية في شاشة واحدة، مع الاحتفاظ بمصدر كل تفاعل وحالته."
            status={
              <Badge
                variant="outline"
                className="h-9 gap-1.5 rounded-lg border-primary/20 bg-primary/5 px-3 text-primary"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                {connectedAccounts} حساب متصل
              </Badge>
            }
            actions={
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
            }
          />

          <div
            className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4"
            aria-label="ملخص صندوق البريد"
          >
            {[
              {
                label: 'كل المحادثات',
                value: statsQuery.data?.total ?? 0,
                icon: Inbox,
                className: 'bg-primary/10 text-primary',
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
                className: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300',
              },
              {
                label: 'تعليقات',
                value: statsQuery.data?.comments ?? 0,
                icon: MessageSquare,
                className:
                  'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300',
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/70 bg-muted/30 p-3 md:p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.className}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-bold tabular-nums text-foreground">
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
            className="h-auto w-full flex-col items-stretch gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm"
          >
            {(
              [
                ['الرسائل', inboxTabs.filter((tab) => tab.channelType === 'message')],
                ['التعليقات', inboxTabs.filter((tab) => tab.channelType === 'comment')],
              ] as const
            ).map(([groupLabel, tabs]) => (
              <div key={groupLabel} className="flex min-w-0 items-center gap-2">
                <span className="w-14 shrink-0 text-[11px] font-semibold text-muted-foreground sm:w-16 sm:text-xs">
                  {groupLabel}
                </span>
                <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-0.5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        aria-label={`فتح ${tab.label}`}
                        className="min-h-11 shrink-0 gap-1.5 rounded-xl px-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm md:text-sm"
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </TabsTrigger>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsList>
        </Tabs>

        <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            {isMetaCommentTab ? (
              <MetaCommentContextsPanel
                contexts={(commentContextsQuery.data ?? []) as MetaCommentContext[]}
                isLoading={commentContextsQuery.isLoading}
                platform={activeTabConfig.platform as 'facebook' | 'instagram'}
                onSelectContext={handleSelectCommentContext}
                activeUsers={activeUsersQuery.data ?? []}
                onSubmitReply={async (threadId, itemId, message) => {
                  await replyCommentMutation.mutateAsync({ threadId, itemId, message });
                }}
                onSubmitPrivateReply={async (threadId, itemId, message) => {
                  await privateReplyMutation.mutateAsync({ threadId, itemId, message });
                }}
                onHiddenChange={async (threadId, itemId, isHidden) => {
                  await hiddenMutation.mutateAsync({ threadId, itemId, isHidden });
                }}
                onWorkflowChange={async (id, patch) => {
                  await workflowMutation.mutateAsync({ id, ...patch });
                }}
                onEnrich={async (threadId, itemId) => {
                  await enrichMutation.mutateAsync({ threadId, itemId });
                }}
                isActionPending={isCommentActionPending}
              />
            ) : (
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
                      <div
                        className="space-y-3 p-3"
                        role="status"
                        aria-label="جاري تحميل المحادثات"
                      >
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="h-20 animate-pulse rounded-xl bg-muted/60" />
                        ))}
                        <span className="sr-only">جاري تحميل المحادثات</span>
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
                          const isTestThread = testAccountIds.has(thread.accountId);
                          return (
                            <button
                              key={thread.id}
                              type="button"
                              onClick={() => handleSelectThread(thread.id)}
                              className={`w-full p-3 text-right transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:p-4 ${isSelected ? 'bg-primary/10 ring-2 ring-inset ring-primary/20' : ''}`}
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
                                          className="h-2 w-2 shrink-0 rounded-full bg-primary"
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
                                    {isTestThread && (
                                      <Badge
                                        variant="outline"
                                        className="border-amber-300 bg-amber-50 text-[10px] text-amber-800"
                                      >
                                        بيانات اختبار
                                      </Badge>
                                    )}
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
                  {threadQuery.isLoading && selectedThreadId ? (
                    <div
                      className="space-y-5 p-4 md:p-6"
                      role="status"
                      aria-label="جاري تحميل تفاصيل المحادثة"
                    >
                      <div className="h-16 animate-pulse rounded-xl bg-card" />
                      <div className="mr-auto h-24 w-4/5 animate-pulse rounded-2xl bg-card" />
                      <div className="h-20 w-3/5 animate-pulse rounded-2xl bg-card" />
                      <span className="sr-only">جاري تحميل تفاصيل المحادثة</span>
                    </div>
                  ) : !selectedThread ? (
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
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                              {isMetaTestAccount(selectedAccount?.metadata) && (
                                <Badge
                                  variant="outline"
                                  className="border-amber-300 bg-amber-50 text-[10px] text-amber-800"
                                >
                                  بيانات اختبار قابلة للحذف
                                </Badge>
                              )}
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
                            selectedItems.map(
                              (item: {
                                id: number;
                                direction: 'inbound' | 'outbound' | 'system';
                                authorName: string | null;
                                content: string | null;
                                mediaUrl: string | null;
                                parentExternalId: string | null;
                                externalPublishedAt: Date | string | null;
                                createdAt: Date | string;
                                isRead: boolean;
                                status: string;
                              }) => (
                                <div
                                  key={item.id}
                                  className={`flex ${item.direction === 'outbound' ? 'justify-start' : 'justify-end'}`}
                                >
                                  <div
                                    className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[82%] ${item.direction === 'outbound' ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-foreground'}`}
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
                                    {item.parentExternalId && (
                                      <p className="mt-2 text-xs opacity-70">
                                        رد على {item.parentExternalId}
                                      </p>
                                    )}
                                    {item.mediaUrl && (
                                      <a
                                        href={item.mediaUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex text-xs font-medium underline underline-offset-4 opacity-80 hover:opacity-100"
                                      >
                                        فتح المرفق
                                      </a>
                                    )}
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
                              )
                            )
                          )}
                        </div>
                      </div>

                      <div className="border-t border-border bg-white p-3 md:p-4">
                        <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm text-foreground">
                          <Send className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <p className="font-semibold">الرد المباشر من داخل الصندوق</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
