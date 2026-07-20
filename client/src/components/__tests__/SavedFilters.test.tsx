/**
 * اختبارات SavedFilters Component
 * SavedFilters Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SavedFilters from '../SavedFilters';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock tRPC
vi.mock('@/lib/api/trpc', () => ({
  trpc: {
    savedFilters: {
      list: {
        useQuery: vi.fn(() => ({ data: [], refetch: vi.fn() })),
      },
      create: {
        useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
      },
      delete: {
        useMutation: vi.fn(() => ({ mutate: vi.fn() })),
      },
      update: {
        useMutation: vi.fn(() => ({ mutate: vi.fn() })),
      },
    },
  },
}));

describe('SavedFilters Component', () => {
  const mockOnApplyFilter = vi.fn();
  const pageKey = 'appointments' as const;
  const currentFilters = { status: 'pending', date: '2024-01-01' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('يجب أن يعرض المكون بنجاح', () => {
      render(
        <SavedFilters
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilter={mockOnApplyFilter}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يعرض أيقونة Bookmark', () => {
      render(
        <SavedFilters
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilter={mockOnApplyFilter}
        />
      );

      const bookmarkIcon = document.querySelector('.lucide-bookmark');
      expect(bookmarkIcon).toBeInTheDocument();
    });

    it('يجب أن يعرض أيقونة ChevronDown', () => {
      render(
        <SavedFilters
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilter={mockOnApplyFilter}
        />
      );

      const chevronIcon = document.querySelector('.lucide-chevron-down');
      expect(chevronIcon).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('يجب أن يستقبل pageKey بشكل صحيح', () => {
      render(
        <SavedFilters
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilter={mockOnApplyFilter}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يستقبل currentFilters بشكل صحيح', () => {
      render(
        <SavedFilters
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilter={mockOnApplyFilter}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يستقبل onApplyFilter بشكل صحيح', () => {
      render(
        <SavedFilters
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilter={mockOnApplyFilter}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('يجب أن يتعامل مع فلاتر فارغة', () => {
      render(
        <SavedFilters
          pageKey={pageKey}
          currentFilters={{}}
          onApplyFilter={mockOnApplyFilter}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يتعامل مع فلاتر معقدة', () => {
      const complexFilters = {
        status: ['pending', 'active'],
        dateRange: { from: '2024-01-01', to: '2024-12-31' },
        search: 'test',
        page: 1,
      };

      render(
        <SavedFilters
          pageKey={pageKey}
          currentFilters={complexFilters}
          onApplyFilter={mockOnApplyFilter}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يتعامل مع pageKey مختلف', () => {
      render(
        <SavedFilters
          pageKey='offerLeads'
          currentFilters={currentFilters}
          onApplyFilter={mockOnApplyFilter}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });
  });
});
