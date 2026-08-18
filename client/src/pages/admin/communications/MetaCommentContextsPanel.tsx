import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  EyeOff,
  ExternalLink,
  FileImage,
  Film,
  Heart,
  Inbox,
  Loader2,
  LockKeyhole,
  MessageCircleMore,
  MessageSquareReply,
  Send,
  Star,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { platformConfig, type Platform } from './socialInboxConfig';

type CommentMetadata = {
  likeCount?: number;
  replyCount?: number;
  canComment?: boolean;
  canReplyPrivately?: boolean;
  isHidden?: boolean;
  isPrivate?: boolean;
  mediaProductType?: string;
  adId?: string;
  adTitle?: string;
  originalMediaId?: string;
} | null;

type CommentContextMetadata = {
  sourceType?: 'facebook_post' | 'instagram_media';
  sourceExternalId?: string;
  title?: string;
  sourceUrl?: string;
  previewUrl?: string;
  previewType?: string;
} | null;

export type MetaCommentContextItem = {
  id: number;
  externalItemId: string;
  authorName: string | null;
  content: string | null;
  parentExternalId: string | null;
  externalPublishedAt: Date | string | null;
  createdAt: Date | string;
  isRead: boolean;
  direction: 'inbound' | 'outbound' | 'system';
  commentMetadata: CommentMetadata;
};

export type MetaCommentContext = {
  id: number;
  platform: Platform;
  title: string | null;
  preview: string | null;
  postUrl: string | null;
  unreadCount: number;
  isRead: boolean;
  isStarred: boolean;
  lastActivityAt: Date | string | null;
  commentContext: CommentContextMetadata;
  items: MetaCommentContextItem[];
};

type CommentNode = {
  item: MetaCommentContextItem;
  children: CommentNode[];
};

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

function buildCommentTree(items: MetaCommentContextItem[]) {
  const nodeByExternalId = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const item of items) {
    nodeByExternalId.set(item.externalItemId, { item, children: [] });
  }

  for (const item of items) {
    const node = nodeByExternalId.get(item.externalItemId);
    if (!node) {
      continue;
    }
    const parent = item.parentExternalId ? nodeByExternalId.get(item.parentExternalId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function sourceLabel(context: MetaCommentContext) {
  if (context.commentContext?.sourceType === 'instagram_media') {
    return context.commentContext.previewType === 'VIDEO' ||
      context.commentContext.previewType === 'REELS'
      ? 'Reel أو فيديو Instagram'
      : 'وسيط Instagram';
  }
  return 'منشور Facebook';
}

function sourceIcon(context: MetaCommentContext) {
  return context.commentContext?.previewType === 'VIDEO' ? Film : FileImage;
}

function TestDataBadge() {
  return (
    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-[10px] text-amber-800">
      بيانات اختبار
    </Badge>
  );
}

function CommentActions({
  item,
  platform,
  onReply,
}: {
  item: MetaCommentContextItem;
  platform: Platform;
  onReply: (item: MetaCommentContextItem) => void;
}) {
  const metadata = item.commentMetadata;
  const unavailableMessage = 'سيُربط هذا الإجراء بموصل Meta الرسمي بعد تفعيل الإرسال والتعليقات.';

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-2 text-xs">
      {metadata?.canComment !== false && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-slate-600"
          onClick={() => onReply(item)}
        >
          <MessageSquareReply className="h-3.5 w-3.5" />
          رد
        </Button>
      )}
      {metadata?.canReplyPrivately && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-slate-600"
          onClick={() => toast.info(unavailableMessage)}
        >
          <MessageCircleMore className="h-3.5 w-3.5" />
          رسالة خاصة
        </Button>
      )}
      {platform === 'facebook' && typeof metadata?.isHidden === 'boolean' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-slate-600"
          onClick={() => toast.info(unavailableMessage)}
        >
          <EyeOff className="h-3.5 w-3.5" />
          {metadata.isHidden ? 'إظهار' : 'إخفاء'}
        </Button>
      )}
    </div>
  );
}

function CommentTreeNode({
  node,
  platform,
  depth,
  onReply,
}: {
  node: CommentNode;
  platform: Platform;
  depth: number;
  onReply: (item: MetaCommentContextItem) => void;
}) {
  const metadata = node.item.commentMetadata;
  return (
    <article className={depth > 0 ? 'mr-3 border-r border-blue-100 pr-3 md:mr-6 md:pr-5' : ''}>
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {node.item.authorName || 'مستخدم المنصة'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {formatDate(node.item.externalPublishedAt || node.item.createdAt)}
            </p>
          </div>
          {metadata?.isHidden && (
            <Badge variant="outline" className="border-slate-300 text-[10px] text-slate-600">
              مخفي
            </Badge>
          )}
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
          {node.item.content || 'تعليق بدون نص'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {typeof metadata?.likeCount === 'number' && (
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {metadata.likeCount}
            </span>
          )}
          {typeof metadata?.replyCount === 'number' && (
            <span className="inline-flex items-center gap-1">
              <MessageSquareReply className="h-3.5 w-3.5" />
              {metadata.replyCount} رد
            </span>
          )}
          {metadata?.isPrivate && (
            <span className="inline-flex items-center gap-1">
              <LockKeyhole className="h-3.5 w-3.5" /> خاص
            </span>
          )}
        </div>
        <CommentActions item={node.item} platform={platform} onReply={onReply} />
      </div>
      {node.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {node.children.map((child) => (
            <CommentTreeNode
              key={child.item.id}
              node={child}
              platform={platform}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </article>
  );
}

export default function MetaCommentContextsPanel({
  contexts,
  isLoading,
  platform,
  onSelectContext,
}: {
  contexts: MetaCommentContext[];
  isLoading: boolean;
  platform: 'facebook' | 'instagram';
  onSelectContext: (context: MetaCommentContext) => void;
}) {
  const [selectedContextId, setSelectedContextId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'followed'>('all');
  const [replyTarget, setReplyTarget] = useState<MetaCommentContextItem | null>(null);
  const selectedContext =
    contexts.find((context) => context.id === selectedContextId) ?? contexts[0];
  const filteredContexts = useMemo(
    () =>
      contexts.filter((context) => {
        if (filter === 'unread') {
          return !context.isRead;
        }
        if (filter === 'followed') {
          return context.isStarred;
        }
        return true;
      }),
    [contexts, filter]
  );
  const commentTree = useMemo(
    () => (selectedContext ? buildCommentTree(selectedContext.items) : []),
    [selectedContext]
  );
  const isTestContext = selectedContext?.items.some(
    (item) =>
      item.externalItemId.startsWith('sgh-meta-test-') ||
      item.externalItemId.startsWith('178900000000')
  );

  const chooseContext = (context: MetaCommentContext) => {
    setSelectedContextId(context.id);
    onSelectContext(context);
  };

  const SourceIcon = selectedContext ? sourceIcon(selectedContext) : Inbox;

  return (
    <div className="grid min-h-[620px] lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]" dir="rtl">
      <aside
        className={`${selectedContextId ? 'hidden lg:flex' : 'flex'} min-w-0 flex-col border-l border-border bg-white`}
      >
        <div className="border-b border-border p-3 md:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {platform === 'facebook' ? 'سياقات منشورات Facebook' : 'سياقات وسائط Instagram'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {filteredContexts.length} سياق ظاهر
              </p>
            </div>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              {platformConfig[platform].label}
            </Badge>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'unread', label: 'غير مقروء' },
              { id: 'followed', label: 'متابعة' },
            ].map((option) => (
              <Button
                key={option.id}
                variant={filter === option.id ? 'default' : 'outline'}
                size="sm"
                className="h-8 shrink-0 text-xs"
                onClick={() => setFilter(option.id as typeof filter)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : filteredContexts.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <Inbox className="h-8 w-8 text-blue-600" />
              <p className="mt-3 text-sm font-semibold text-slate-800">لا توجد سياقات تعليقات</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                ستظهر المنشورات أو الوسائط عند وصول أول تعليق من Meta.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {filteredContexts.map((context) => {
                const ContextIcon = sourceIcon(context);
                const selected = context.id === selectedContext?.id;
                const testContext = context.items.some(
                  (item) =>
                    item.externalItemId.startsWith('sgh-meta-test-') ||
                    item.externalItemId.startsWith('178900000000')
                );
                return (
                  <button
                    key={context.id}
                    type="button"
                    className={`w-full p-3 text-right transition-colors hover:bg-blue-50/60 md:p-4 ${selected ? 'bg-blue-50 ring-inset ring-2 ring-blue-100' : ''}`}
                    onClick={() => chooseContext(context)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <ContextIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="line-clamp-1 text-sm font-semibold text-slate-900">
                            {context.commentContext?.title || sourceLabel(context)}
                          </span>
                          {!context.isRead && (
                            <span
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                              aria-label="غير مقروء"
                            />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {context.preview || context.items.at(-1)?.content || 'لا يوجد تعليق نصي'}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{context.items.length} تعليق</span>
                          {context.unreadCount > 0 && (
                            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700">
                              {context.unreadCount} جديد
                            </span>
                          )}
                          {testContext && <TestDataBadge />}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <section
        className={`${selectedContextId || selectedContext ? 'flex' : 'hidden lg:flex'} min-w-0 flex-col bg-slate-50/70`}
      >
        {!selectedContext ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <Inbox className="h-8 w-8 text-blue-600" />
            <p className="mt-3 text-sm font-semibold">اختر سياق منشور أو وسيط</p>
          </div>
        ) : (
          <>
            <div className="border-b border-border bg-white p-3 md:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <SourceIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-slate-900">
                      {sourceLabel(selectedContext)}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      آخر نشاط {formatDate(selectedContext.lastActivityAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isTestContext && <TestDataBadge />}
                  {(selectedContext.commentContext?.sourceUrl || selectedContext.postUrl) && (
                    <Button variant="outline" size="sm" className="h-8 gap-1.5" asChild>
                      <a
                        href={
                          selectedContext.commentContext?.sourceUrl ||
                          selectedContext.postUrl ||
                          undefined
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> فتح الأصل
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
              <div className="mx-auto max-w-3xl space-y-5">
                <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                  {selectedContext.commentContext?.previewUrl && (
                    <img
                      src={selectedContext.commentContext.previewUrl}
                      alt="معاينة المنشور أو الوسيط"
                      className="h-44 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600">{sourceLabel(selectedContext)}</Badge>
                      {selectedContext.items.at(-1)?.commentMetadata?.adTitle && (
                        <Badge variant="outline">
                          {selectedContext.items.at(-1)?.commentMetadata?.adTitle}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                      {selectedContext.commentContext?.title ||
                        'سياق المحتوى الأصلي غير متاح في الحمولة الحالية.'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>{selectedContext.items.length} تعليق محفوظ</span>
                      {selectedContext.commentContext?.sourceExternalId && (
                        <span>المعرّف: {selectedContext.commentContext.sourceExternalId}</span>
                      )}
                    </div>
                  </div>
                </article>

                <section aria-label="سلسلة التعليقات" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">سلسلة التعليقات</h3>
                    <span className="text-xs text-slate-500">مرتبة حسب التسلسل الزمني</span>
                  </div>
                  {commentTree.map((node) => (
                    <CommentTreeNode
                      key={node.item.id}
                      node={node}
                      platform={platform}
                      depth={0}
                      onReply={setReplyTarget}
                    />
                  ))}
                </section>
              </div>
            </div>

            <div className="border-t border-border bg-white p-3 md:p-4">
              <div className="mx-auto max-w-3xl rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-blue-950">
                    {replyTarget
                      ? `رد عام على ${replyTarget.authorName || 'التعليق المحدد'}`
                      : 'إضافة تعليق عام'}
                  </p>
                  {replyTarget && (
                    <Button variant="ghost" size="sm" onClick={() => setReplyTarget(null)}>
                      إلغاء التحديد
                    </Button>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    disabled
                    placeholder="يتطلب النشر تفعيل موصل Meta الرسمي."
                    className="bg-white"
                  />
                  <Button disabled className="gap-1.5">
                    <Send className="h-4 w-4" />
                    إرسال
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
