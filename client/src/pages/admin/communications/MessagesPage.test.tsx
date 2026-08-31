import { fireEvent, render, screen } from '@testing-library/react';
import React, { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MessagesPage from './MessagesPage';

const mocks = vi.hoisted(() => {
  const thread = {
    id: 1,
    accountId: 1,
    platform: 'instagram',
    channelType: 'message',
    externalThreadId: 'thread-1',
    title: null,
    participantExternalId: 'person-1',
    participantName: 'سارة أحمد',
    participantAvatarUrl: null,
    preview: 'أرغب في معرفة مواعيد العيادة.',
    postUrl: null,
    unreadCount: 1,
    isRead: false,
    isArchived: false,
    isStarred: false,
    assignedToUserId: null,
    lastActivityAt: new Date('2026-08-17T10:00:00.000Z'),
    createdAt: new Date('2026-08-17T09:00:00.000Z'),
    updatedAt: new Date('2026-08-17T10:00:00.000Z'),
  };

  return {
    thread,
    threadsQuery: vi.fn(() => ({ data: [thread], isLoading: false, isFetching: false, refetch: vi.fn() })),
    accountsQuery: vi.fn(() => ({ data: [], isLoading: false, isFetching: false, refetch: vi.fn() })),
    statsQuery: vi.fn(() => ({ data: { total: 1, unread: 1, messages: 1, comments: 0 }, isLoading: false, isFetching: false, refetch: vi.fn() })),
    commentContextsQuery: vi.fn(() => ({ data: [], isLoading: false, isFetching: false, refetch: vi.fn() })),
    activeUsersQuery: vi.fn(() => ({ data: [{ id: 7, name: 'مسؤول التعليقات', username: 'moderator' }], isLoading: false, isFetching: false, refetch: vi.fn() })),
    threadDetailQuery: vi.fn(() => ({ data: undefined, isLoading: false, isFetching: false, refetch: vi.fn() })),
    markReadMutate: vi.fn(),
    starMutate: vi.fn(),
    archiveMutate: vi.fn(),
    deleteMutate: vi.fn(),
    workflowMutateAsync: vi.fn().mockResolvedValue({ success: true }),
    replyMutateAsync: vi.fn().mockResolvedValue({ externalItemId: 'reply-1' }),
    privateReplyMutateAsync: vi.fn().mockResolvedValue({ externalMessageId: 'message-1' }),
    hiddenMutateAsync: vi.fn().mockResolvedValue({ success: true }),
    enrichMutateAsync: vi.fn().mockResolvedValue({ success: true }),
  };
});

vi.mock('@/components/layout/DashboardLayout', () => ({
  default: ({ children }: { children: unknown }) => children,
}));

vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    useUtils: () => ({
      socialInbox: {
        threads: { invalidate: vi.fn() },
        commentContexts: { invalidate: vi.fn() },
        stats: { invalidate: vi.fn() },
        thread: { invalidate: vi.fn() },
      },
    }),
    socialInbox: {
      accounts: { useQuery: mocks.accountsQuery },
      stats: { useQuery: mocks.statsQuery },
      threads: { useQuery: mocks.threadsQuery },
      commentContexts: { useQuery: mocks.commentContextsQuery },
      thread: { useQuery: mocks.threadDetailQuery },
      markRead: { useMutation: () => ({ mutate: mocks.markReadMutate }) },
      setStarred: { useMutation: () => ({ mutate: mocks.starMutate }) },
      archive: { useMutation: () => ({ mutate: mocks.archiveMutate }) },
      delete: { useMutation: () => ({ mutate: mocks.deleteMutate }) },
      updateCommentWorkflow: { useMutation: () => ({ mutateAsync: mocks.workflowMutateAsync, isPending: false }) },
      replyToComment: { useMutation: () => ({ mutateAsync: mocks.replyMutateAsync, isPending: false }) },
      sendCommentPrivateReply: { useMutation: () => ({ mutateAsync: mocks.privateReplyMutateAsync, isPending: false }) },
      setCommentHidden: { useMutation: () => ({ mutateAsync: mocks.hiddenMutateAsync, isPending: false }) },
      enrichCommentContext: { useMutation: () => ({ mutateAsync: mocks.enrichMutateAsync, isPending: false }) },
    },
    users: { getActiveUsers: { useQuery: mocks.activeUsersQuery } },
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/hooks/auth/useRolePermissions', () => ({
  useRolePermissions: () => ({
    can: (permission: string) =>
      [
        'communications.reply',
        'communications.assign',
        'communications.manage',
        'communications.archive',
        'communications.delete',
      ].includes(permission),
    permissions: [],
    isLoading: false,
  }),
}));

describe('MessagesPage', () => {
  beforeEach(() => {
    mocks.threadsQuery.mockReset();
    mocks.threadsQuery.mockImplementation(() => ({
      data: [mocks.thread],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }));
    mocks.accountsQuery.mockReset();
    mocks.accountsQuery.mockImplementation(() => ({ data: [], isLoading: false, isFetching: false, refetch: vi.fn() }));
    mocks.statsQuery.mockReset();
    mocks.statsQuery.mockImplementation(() => ({ data: { total: 1, unread: 1, messages: 1, comments: 0 }, isLoading: false, isFetching: false, refetch: vi.fn() }));
    mocks.commentContextsQuery.mockReset();
    mocks.commentContextsQuery.mockImplementation(() => ({ data: [], isLoading: false, isFetching: false, refetch: vi.fn() }));
    mocks.activeUsersQuery.mockReset();
    mocks.activeUsersQuery.mockImplementation(() => ({ data: [{ id: 7, name: 'مسؤول التعليقات', username: 'moderator' }], isLoading: false, isFetching: false, refetch: vi.fn() }));
    mocks.threadDetailQuery.mockReset();
    mocks.threadDetailQuery.mockImplementation(() => ({ data: undefined, isLoading: false, isFetching: false, refetch: vi.fn() }));
    mocks.markReadMutate.mockClear();
    mocks.starMutate.mockClear();
    mocks.archiveMutate.mockClear();
    mocks.deleteMutate.mockClear();
    mocks.workflowMutateAsync.mockClear();
    mocks.replyMutateAsync.mockClear();
    mocks.privateReplyMutateAsync.mockClear();
    mocks.hiddenMutateAsync.mockClear();
    mocks.enrichMutateAsync.mockClear();
  });

  it('renders the required tabs and the empty-state-free conversation list', () => {
    render(React.createElement(MessagesPage));

    expect(screen.getByRole('heading', { name: 'صندوق البريد الموحد' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'كل الرسائل' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Messenger' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'تعليقات فيسبوك' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'تبويبات صندوق البريد' })).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('سارة أحمد')).toBeInTheDocument();
    expect(screen.getByText('أرغب في معرفة مواعيد العيادة.')).toBeInTheDocument();
  });

  it('updates the query filters when a platform tab or search term changes', () => {
    render(React.createElement(MessagesPage));
    const search = screen.getByRole('textbox', { name: 'البحث في صندوق البريد' });

    fireEvent.change(search, { target: { value: '  سارة  ' } });
    const facebookTab = screen.getByRole('tab', { name: 'تعليقات فيسبوك' });
    fireEvent.keyDown(facebookTab, { key: 'Enter', code: 'Enter' });

    const calls = mocks.threadsQuery.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const lastCall = calls.at(-1);
    expect(lastCall?.[0]).toEqual({ platform: 'facebook', channelType: 'comment', search: 'سارة' });
  });

  it('shows the no-results state when the selected filter has no threads', () => {
    mocks.threadsQuery.mockImplementation(() => ({ data: [], isLoading: false, isFetching: false, refetch: vi.fn() }));
    render(React.createElement(MessagesPage));

    expect(screen.getByText('لا توجد تفاعلات بعد')).toBeInTheDocument();
    expect(screen.getByText(/دون بيانات تجريبية/)).toBeInTheDocument();
  });

  it('marks a selected conversation as read', () => {
    render(React.createElement(MessagesPage));
    fireEvent.click(screen.getByRole('button', { name: /سارة أحمد/ }));

    expect(mocks.markReadMutate).toHaveBeenCalledWith({ id: 1, isRead: true });
  });

  it('identifies Meta test data and renders its reply context and attachment link in the inbox', () => {
    const testThread = {
      ...mocks.thread,
      platform: 'messenger',
      participantName: 'مستخدم اختبار Meta',
      preview: 'مرفق: image',
    };
    mocks.accountsQuery.mockImplementation(() => ({
      data: [
        {
          id: 1,
          platform: 'messenger',
          status: 'connected',
          metadata: JSON.stringify({ testData: true }),
        },
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }) as never);
    mocks.threadsQuery.mockImplementation(() => ({
      data: [testThread],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }));
    mocks.threadDetailQuery.mockImplementation(() => ({
      data: {
        thread: testThread,
        items: [
          {
            id: 200,
            direction: 'inbound',
            authorName: 'مستخدم اختبار Meta',
            content: 'مرفق: image',
            mediaUrl: 'https://example.invalid/meta-test/image.avif',
            parentExternalId: 'm_sgh_test_parent_001',
            externalPublishedAt: new Date('2026-08-18T08:00:00.000Z'),
            createdAt: new Date('2026-08-18T08:00:00.000Z'),
            isRead: false,
            status: 'received',
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }) as never);

    render(React.createElement(MessagesPage));
    expect(screen.getByText('بيانات اختبار')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /مستخدم اختبار Meta/ }));

    expect(screen.getByText('بيانات اختبار قابلة للحذف')).toBeInTheDocument();
    expect(screen.getByText('رد على m_sgh_test_parent_001')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'فتح المرفق' })).toHaveAttribute(
      'href',
      'https://example.invalid/meta-test/image.avif'
    );
  });

  it('renders Facebook comments as a post context with a nested comment tree instead of a conversation', () => {
    mocks.commentContextsQuery.mockImplementation(() => ({
      data: [
        {
          id: 90,
          platform: 'facebook',
          title: 'منشور Facebook تجريبي لعرض سياق التعليقات.',
          preview: 'تعليق رئيسي على المنشور.',
          postUrl: 'https://www.facebook.com/sgh-meta-test/posts/001',
          unreadCount: 1,
          isRead: false,
          isStarred: false,
          lastActivityAt: new Date('2026-08-18T08:00:00.000Z'),
          commentContext: {
            sourceType: 'facebook_post',
            sourceExternalId: 'post-001',
            title: 'منشور Facebook تجريبي لعرض سياق التعليقات.',
            sourceUrl: 'https://www.facebook.com/sgh-meta-test/posts/001',
            previewType: 'photo',
          },
          items: [
            {
              id: 901,
              externalItemId: 'comment-001',
              authorName: 'مستخدم Facebook',
              content: 'تعليق رئيسي على المنشور.',
              parentExternalId: 'post-001',
              externalPublishedAt: new Date('2026-08-18T08:00:00.000Z'),
              createdAt: new Date('2026-08-18T08:00:00.000Z'),
              isRead: false,
              direction: 'inbound',
              commentMetadata: { likeCount: 4, replyCount: 1, canComment: true, canReplyPrivately: true, isHidden: false },
            },
            {
              id: 902,
              externalItemId: 'comment-002',
              authorName: 'فريق الصفحة',
              content: 'رد متداخل من فريق الصفحة.',
              parentExternalId: 'comment-001',
              externalPublishedAt: new Date('2026-08-18T08:05:00.000Z'),
              createdAt: new Date('2026-08-18T08:05:00.000Z'),
              isRead: true,
              direction: 'outbound',
              commentMetadata: { likeCount: 0, replyCount: 0, canComment: true, isHidden: false },
            },
          ],
        },
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }) as never);

    render(React.createElement(MessagesPage));
    fireEvent.keyDown(screen.getByRole('tab', { name: 'تعليقات فيسبوك' }), { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('سياقات منشورات Facebook')).toBeInTheDocument();
    expect(screen.getAllByText('منشور Facebook تجريبي لعرض سياق التعليقات.')).toHaveLength(2);
    expect(screen.getByRole('region', { name: 'سلسلة التعليقات' })).toBeInTheDocument();
    expect(screen.getAllByText('تعليق رئيسي على المنشور.')).toHaveLength(2);
    expect(screen.getByText('رد متداخل من فريق الصفحة.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /فتح الأصل/ })).toHaveAttribute(
      'href',
      'https://www.facebook.com/sgh-meta-test/posts/001'
    );
  });

  it('renders Instagram comments as media contexts with replies nested by parent_id', () => {
    mocks.commentContextsQuery.mockImplementation(() => ({
      data: [
        {
          id: 91,
          platform: 'instagram',
          title: 'Reel تجريبي لعرض تعليقات Instagram.',
          preview: 'تعليق Instagram رئيسي.',
          postUrl: 'https://www.instagram.com/p/SGHMetaTest/',
          unreadCount: 1,
          isRead: false,
          isStarred: true,
          lastActivityAt: new Date('2026-08-18T08:10:00.000Z'),
          commentContext: {
            sourceType: 'instagram_media',
            sourceExternalId: '17900000000010001',
            title: 'Reel تجريبي لعرض تعليقات Instagram.',
            sourceUrl: 'https://www.instagram.com/p/SGHMetaTest/',
            previewType: 'VIDEO',
          },
          items: [
            {
              id: 911,
              externalItemId: 'ig-comment-001',
              authorName: 'ig_user_1',
              content: 'تعليق Instagram رئيسي.',
              parentExternalId: '17900000000010001',
              externalPublishedAt: new Date('2026-08-18T08:10:00.000Z'),
              createdAt: new Date('2026-08-18T08:10:00.000Z'),
              isRead: false,
              direction: 'inbound',
              commentMetadata: { likeCount: 12, replyCount: 1, isHidden: false },
            },
            {
              id: 912,
              externalItemId: 'ig-comment-002',
              authorName: 'ig_user_2',
              content: 'رد Instagram متداخل.',
              parentExternalId: 'ig-comment-001',
              externalPublishedAt: new Date('2026-08-18T08:12:00.000Z'),
              createdAt: new Date('2026-08-18T08:12:00.000Z'),
              isRead: true,
              direction: 'inbound',
              commentMetadata: { likeCount: 2, replyCount: 0, isHidden: false },
            },
          ],
        },
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }) as never);

    render(React.createElement(MessagesPage));
    fireEvent.keyDown(screen.getByRole('tab', { name: 'تعليقات Instagram' }), { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('سياقات وسائط Instagram')).toBeInTheDocument();
    expect(screen.getAllByText('Reel تجريبي لعرض تعليقات Instagram.')).toHaveLength(2);
    expect(screen.getAllByText('Reel أو فيديو Instagram')).toHaveLength(2);
    expect(screen.getAllByText('تعليق Instagram رئيسي.')).toHaveLength(2);
    expect(screen.getByText('رد Instagram متداخل.')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('routes comment reply, follow-up, assignment, and enrichment actions through the protected mutations', async () => {
    mocks.commentContextsQuery.mockImplementation(() => ({
      data: [
        {
          id: 92,
          platform: 'instagram',
          title: 'وسيط فعلي لإدارة التعليقات.',
          preview: 'هل يوجد موعد متاح؟',
          postUrl: 'https://www.instagram.com/p/live-context/',
          unreadCount: 0,
          isRead: true,
          isStarred: false,
          isFollowUpRequired: false,
          assignedToUserId: null,
          lastActivityAt: new Date('2026-08-18T09:00:00.000Z'),
          commentContext: {
            sourceType: 'instagram_media',
            sourceExternalId: 'media-live-1',
            title: 'وسيط فعلي لإدارة التعليقات.',
            previewType: 'IMAGE',
          },
          items: [
            {
              id: 921,
              externalItemId: 'ig-live-comment-1',
              authorName: 'ig_customer',
              content: 'هل يوجد موعد متاح؟',
              parentExternalId: 'media-live-1',
              externalPublishedAt: new Date(),
              createdAt: new Date(),
              isRead: true,
              direction: 'inbound',
              commentMetadata: { canComment: true, likeCount: 1, isHidden: false },
            },
          ],
        },
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }) as never);

    render(React.createElement(MessagesPage));
    fireEvent.keyDown(screen.getByRole('tab', { name: 'تعليقات Instagram' }), { key: 'Enter', code: 'Enter' });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'متابعة' }));
      await Promise.resolve();
    });
    expect(mocks.workflowMutateAsync).toHaveBeenCalledWith({ id: 92, isFollowUpRequired: true });

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: 'تعيين مسؤول للسياق' }), { target: { value: '7' } });
      await Promise.resolve();
    });
    expect(mocks.workflowMutateAsync).toHaveBeenCalledWith({ id: 92, assignedToUserId: 7 });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /إثراء/ }));
      await Promise.resolve();
    });
    expect(mocks.enrichMutateAsync).toHaveBeenCalledWith({ threadId: 92, itemId: 921 });

    fireEvent.click(screen.getByRole('button', { name: 'رد' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'نعم، يوجد موعد صباحي.' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'إرسال' }));
      await Promise.resolve();
    });
    expect(mocks.replyMutateAsync).toHaveBeenCalledWith({
      threadId: 92,
      itemId: 921,
      message: 'نعم، يوجد موعد صباحي.',
    });
  });
});
