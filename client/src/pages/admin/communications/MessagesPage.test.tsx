import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
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
    threadDetailQuery: vi.fn(() => ({ data: undefined, isLoading: false, isFetching: false, refetch: vi.fn() })),
    markReadMutate: vi.fn(),
    starMutate: vi.fn(),
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
        stats: { invalidate: vi.fn() },
        thread: { invalidate: vi.fn() },
      },
    }),
    socialInbox: {
      accounts: { useQuery: mocks.accountsQuery },
      stats: { useQuery: mocks.statsQuery },
      threads: { useQuery: mocks.threadsQuery },
      thread: { useQuery: mocks.threadDetailQuery },
      markRead: { useMutation: () => ({ mutate: mocks.markReadMutate }) },
      setStarred: { useMutation: () => ({ mutate: mocks.starMutate }) },
    },
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

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
    mocks.threadDetailQuery.mockReset();
    mocks.threadDetailQuery.mockImplementation(() => ({ data: undefined, isLoading: false, isFetching: false, refetch: vi.fn() }));
    mocks.markReadMutate.mockClear();
    mocks.starMutate.mockClear();
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
});
