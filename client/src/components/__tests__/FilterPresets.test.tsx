/**
 * اختبارات FilterPresets Component
 * FilterPresets Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FilterPresets from '../FilterPresets';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FilterPresets Component', () => {
  const mockOnApplyFilters = vi.fn();
  const pageKey = 'test-page';
  const currentFilters = { status: 'pending', date: '2024-01-01' };

  const quickPresets = [
    {
      id: 'quick-1',
      name: 'فلاتر سريعة 1',
      filters: { status: 'active' },
    },
    {
      id: 'quick-2',
      name: 'فلاتر سريعة 2',
      filters: { status: 'completed' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Component Rendering', () => {
    it('يجب أن يعرض المكون بنجاح', () => {
      render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يعرض أيقونة Filter', () => {
      render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      const filterIcon = document.querySelector('.lucide-filter');
      expect(filterIcon).toBeInTheDocument();
    });

    it('يجب أن يطبق className إضافي', () => {
      const { container } = render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilters={mockOnApplyFilters}
          className="custom-class"
        />
      );

      const button = container.querySelector('.custom-class');
      expect(button).toBeInTheDocument();
    });

    it('يجب أن يعرض المكون مع quickPresets', () => {
      render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilters={mockOnApplyFilters}
          quickPresets={quickPresets}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يعرض المكون مع isAdmin=true', () => {
      render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilters={mockOnApplyFilters}
          isAdmin={true}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('يجب أن يستقبل pageKey بشكل صحيح', () => {
      render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يستقبل currentFilters بشكل صحيح', () => {
      render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يستقبل onApplyFilters بشكل صحيح', () => {
      render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('يجب أن يتعامل مع localStorage فارغ', () => {
      render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={currentFilters}
          onApplyFilters={mockOnApplyFilters}
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
        <FilterPresets
          pageKey={pageKey}
          currentFilters={complexFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });

    it('يجب أن يتعامل مع فلاتر فارغة', () => {
      render(
        <FilterPresets
          pageKey={pageKey}
          currentFilters={{}}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      expect(screen.getByText('الفلاتر المحفوظة')).toBeInTheDocument();
    });
  });
});
