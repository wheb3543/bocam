import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NotificationCenter } from '@/components/NotificationCenter';

const markAllMutate = vi.fn();
const markAsReadMutate = vi.fn();
const deleteMutate = vi.fn();
const deleteReadMutate = vi.fn();

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    data: {
      data: [
        {
          id: 17,
          userId: 1,
          type: 'system',
          source: 'system',
          title: 'تنبيه تشغيلي',
          message: 'يوجد تحديث يحتاج إلى مراجعتك.',
          data: null,
          entityType: null,
          entityId: null,
          isRead: 'no',
          readAt: null,
          actionUrl: null,
          actionLabel: null,
          priority: 'high',
          expiresAt: null,
          createdAt: new Date('2026-08-24T20:00:00.000Z'),
          updatedAt: new Date('2026-08-24T20:00:00.000Z'),
        },
      ],
      pagination: { limit: 20, offset: 0, total: 1, hasMore: false },
    },
    isLoading: false,
    isError: false,
  }),
  useUnreadCount: () => ({ data: 1 }),
  useMarkAsRead: () => ({ mutate: markAsReadMutate }),
  useMarkAllAsRead: () => ({ mutate: markAllMutate, isPending: false }),
  useDeleteNotification: () => ({ mutate: deleteMutate }),
  useDeleteReadNotifications: () => ({ mutate: deleteReadMutate, isPending: false }),
}));

vi.mock('wouter', () => ({
  useLocation: () => ['/admin', vi.fn()],
}));

describe('NotificationCenter dropdown experience', () => {
  beforeEach(() => {
    markAllMutate.mockClear();
    markAsReadMutate.mockClear();
    deleteMutate.mockClear();
    deleteReadMutate.mockClear();
  });

  function openNotificationsDropdown() {
    fireEvent.pointerDown(screen.getByRole('button', { name: 'لديك 1 إشعارات غير مقروءة' }), {
      button: 0,
      ctrlKey: false,
    });
  }

  it('offers and executes the accessible read-all action from the dropdown', () => {
    render(<NotificationCenter />);

    openNotificationsDropdown();

    expect(screen.getByText('1 جديدة')).toBeTruthy();
    expect(screen.getByText('1 إشعار يحتاج إلى مراجعتك')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'تحديد جميع الإشعارات كمقروءة' }));

    expect(markAllMutate).toHaveBeenCalledTimes(1);
  });

  it('keeps per-notification reading and deletion actions accessible in the compact list', () => {
    render(<NotificationCenter />);

    openNotificationsDropdown();

    fireEvent.click(screen.getByRole('button', { name: 'تحديد الإشعار كمقروء' }));
    fireEvent.click(screen.getByRole('button', { name: 'حذف الإشعار' }));

    expect(markAsReadMutate).toHaveBeenCalledWith({ id: 17 });
    expect(deleteMutate).toHaveBeenCalledWith({ id: 17 });
  });
});
