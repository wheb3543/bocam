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
  retryDestination: vi.fn(),
  invalidate: vi.fn(),
}));

vi.mock('@/components/layout/DashboardLayout', () => ({
  default: ({ children }: { children: unknown }) => children,
}));

vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    useUtils: () => ({ content: { publishing: { overview: { invalidate: mocks.invalidate } } } }),
    auth: {
      permissions: {
        useQuery: () => ({
          data: [
            'content.view',
            'content.create',
            'content.update',
            'content.review',
            'content.schedule',
            'content.publish',
            'media.view',
          ],
          isLoading: false,
        }),
      },
    },
    content: {
      publishing: {
        overview: { useQuery: mocks.overviewQuery },
        createDraft: { useMutation: () => ({ mutate: mocks.createDraft, isPending: false }) },
        submitForReview: { useMutation: () => ({ mutate: mocks.submitForReview, isPending: false }) },
        review: { useMutation: () => ({ mutate: mocks.review, isPending: false }) },
        schedule: { useMutation: () => ({ mutate: mocks.schedule, isPending: false }) },
        cancelSchedule: { useMutation: () => ({ mutate: mocks.cancelSchedule, isPending: false }) },
        retryDestination: { useMutation: () => ({ mutate: mocks.retryDestination, isPending: false }) },
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
    mocks.retryDestination.mockClear();
  });

  it('يعرض جميع منصات النشر والحالة الآمنة للحسابات غير المرتبطة', () => {
    render(React.createElement(PublishingPage));

    expect(screen.getByRole('heading', { name: 'النشر متعدد المنصات' })).toBeInTheDocument();
    expect(screen.getByText('1. أنشئ المسودة')).toBeInTheDocument();
    expect(screen.getByText('4. راقب التوزيع')).toBeInTheDocument();
    expect(screen.getAllByText('فيسبوك').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Instagram').length).toBeGreaterThan(0);
    expect(screen.getAllByText('YouTube').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TikTok').length).toBeGreaterThan(0);
    expect(screen.getAllByText('يتطلب OAuth').length).toBe(6);
    expect(screen.getByRole('button', { name: /فيسبوك/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('ينشئ مسودة من المحرر مع المنصات الافتراضية والوسيط المختار', () => {
    render(React.createElement(PublishingPage));
    fireEvent.change(screen.getByLabelText('عنوان داخلي للمحتوى'), { target: { value: 'إطلاق خدمة جديدة' } });
    fireEvent.change(screen.getByPlaceholderText('اكتب الرسالة الأساسية. ستُنشأ منها نسخة قابلة للتخصيص لكل منصة.'), { target: { value: 'تفاصيل الخدمة الجديدة' } });
    const heroButton = screen.getByText('hero.avif').closest('button');
    if (!heroButton) {
      throw new Error('Expected hero media button');
    }
    fireEvent.click(heroButton);
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

  it('يعرض إعادة المحاولة لوجهة فاشلة ويرسل معرفها إلى راوتر التسليم', () => {
    mocks.overviewQuery.mockReturnValue({
      data: {
        accounts: [],
        posts: [
          {
            post: { id: 45, title: 'منشور قيد المعالجة', status: 'partial_failed', contentType: 'image', baseCaption: 'نص', scheduledAt: null },
            destinations: [
              { destination: { id: 99, platform: 'instagram', publicationStatus: 'failed' } },
            ],
            media: [],
            attempts: [],
            deliveryJobs: [],
          },
        ],
        totals: { connectedAccounts: 0, draft: 0, awaitingReview: 0, scheduled: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(React.createElement(PublishingPage));
    fireEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));

    expect(mocks.retryDestination).toHaveBeenCalledWith({ destinationId: 99 });
  });

  it('يعرض تقدم رفع فيديو YouTube من التشخيص الآمن للوجهة', () => {
    mocks.overviewQuery.mockReturnValue({
      data: {
        accounts: [],
        posts: [
          {
            post: { id: 77, title: 'فيديو توعوي', status: 'publishing', contentType: 'video', baseCaption: 'وصف', scheduledAt: null },
            destinations: [
              {
                destination: { id: 101, platform: 'youtube', publicationStatus: 'uploading' },
                videoTransfer: { protocol: 'youtube-resumable', mode: null, progressPercent: 50, phase: 'uploading' },
              },
            ],
            media: [],
            attempts: [],
            deliveryJobs: [],
          },
        ],
        totals: { connectedAccounts: 0, draft: 0, awaitingReview: 0, scheduled: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(React.createElement(PublishingPage));

    expect(screen.getByText('رفع 50٪')).toBeInTheDocument();
    expect(screen.queryByText(/upload\.youtube\.test/)).not.toBeInTheDocument();
  });
});
