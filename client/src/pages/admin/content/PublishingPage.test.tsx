import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PublishingPage from './PublishingPage';

const mocks = vi.hoisted(() => ({
  overviewQuery: vi.fn(),
  mediaQuery: vi.fn(),
  createDraft: vi.fn(),
  submitForReview: vi.fn(),
  review: vi.fn(),
  schedule: vi.fn(),
  cancelSchedule: vi.fn(),
  invalidate: vi.fn(),
}));

vi.mock('@/components/layout/DashboardLayout', () => ({
  default: ({ children }: { children: unknown }) => children,
}));

vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    useUtils: () => ({ content: { publishing: { overview: { invalidate: mocks.invalidate } } } }),
    content: {
      publishing: {
        overview: { useQuery: mocks.overviewQuery },
        createDraft: { useMutation: () => ({ mutate: mocks.createDraft, isPending: false }) },
        submitForReview: { useMutation: () => ({ mutate: mocks.submitForReview, isPending: false }) },
        review: { useMutation: () => ({ mutate: mocks.review, isPending: false }) },
        schedule: { useMutation: () => ({ mutate: mocks.schedule, isPending: false }) },
        cancelSchedule: { useMutation: () => ({ mutate: mocks.cancelSchedule, isPending: false }) },
      },
      media: { list: { useQuery: mocks.mediaQuery } },
    },
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('PublishingPage', () => {
  beforeEach(() => {
    mocks.overviewQuery.mockReturnValue({
      data: {
        accounts: [],
        posts: [],
        totals: { connectedAccounts: 0, draft: 0, awaitingReview: 0, scheduled: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
    mocks.mediaQuery.mockReturnValue({
      data: [{ id: 7, url: 'https://cdn.example.test/hero.avif', type: 'image', fileName: 'hero.avif', altAr: 'صورة تعريفية' }],
      isLoading: false,
    });
    mocks.createDraft.mockClear();
  });

  it('يعرض جميع منصات النشر والحالة الآمنة للحسابات غير المرتبطة', () => {
    render(React.createElement(PublishingPage));

    expect(screen.getByRole('heading', { name: 'من غرفة التحرير إلى كل منصة' })).toBeInTheDocument();
    expect(screen.getAllByText('فيسبوك').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Instagram').length).toBeGreaterThan(0);
    expect(screen.getAllByText('YouTube').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TikTok').length).toBeGreaterThan(0);
    expect(screen.getAllByText('يتطلب OAuth').length).toBe(6);
  });

  it('ينشئ مسودة من المحرر مع المنصات الافتراضية والوسيط المختار', () => {
    render(React.createElement(PublishingPage));
    fireEvent.change(screen.getByLabelText('عنوان داخلي للمحتوى'), { target: { value: 'إطلاق خدمة جديدة' } });
    fireEvent.change(screen.getByPlaceholderText('اكتب الرسالة الأساسية. ستُنشأ منها نسخة قابلة للتخصيص لكل منصة.'), { target: { value: 'تفاصيل الخدمة الجديدة' } });
    fireEvent.click(screen.getByText('hero.avif').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: 'حفظ المسودة' }));

    expect(mocks.createDraft).toHaveBeenCalledWith({
      title: 'إطلاق خدمة جديدة',
      baseCaption: 'تفاصيل الخدمة الجديدة',
      contentType: 'post',
      platforms: ['facebook', 'instagram'],
      mediaIds: [7],
      timezone: 'Asia/Aden',
    });
  });
});
