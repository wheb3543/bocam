import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const invalidate = vi.fn();

vi.mock('@/components/layout/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    useUtils: () => ({
      content: {
        media: {
          folders: { list: { invalidate } },
          list: { invalidate },
        },
      },
    }),
    content: {
      media: {
        folders: {
          list: {
            useQuery: () => ({
              data: [
                { id: 1, name: 'العام', path: '/general', parentId: null },
                { id: 2, name: 'حملات 2026', path: '/general/campaigns', parentId: 1 },
              ],
              isLoading: false,
            }),
          },
          create: { useMutation: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }) },
        },
        list: {
          useQuery: () => ({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
            refetch: vi.fn(),
          }),
        },
        moveMany: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
        deleteMany: { useMutation: () => ({ mutate: vi.fn() }) },
      },
    },
  },
}));

import MediaLibraryPage from '@/pages/admin/media/MediaLibraryPage';

describe('Media library workspace', () => {
  it('renders the unified workspace header, an accessible upload action, and collapsible folders', () => {
    const { container } = render(<MediaLibraryPage />);

    expect(screen.getByRole('heading', { name: 'مكتبة الوسائط' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'اختيار ملفات' })).toBeTruthy();
    expect(container.querySelectorAll('input[type="file"]')).toHaveLength(2);

    const treeExpander = container.querySelector('[role="button"]');
    expect(treeExpander).toBeTruthy();
    fireEvent.click(treeExpander!);
    expect(screen.getByRole('button', { name: 'طي الكل' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'طي الكل' }));
    expect(screen.queryByRole('button', { name: 'طي الكل' })).toBeNull();
  });
});
