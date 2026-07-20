/**
 * useTableData Hook
 * Custom hook لإدارة بيانات الجدول
 */

import { useState, useMemo } from 'react';

export interface UseTableDataOptions<T> {
  data: T[];
  pageSize?: number;
  initialSortColumn?: keyof T;
  initialSortDirection?: 'asc' | 'desc';
}

export interface UseTableDataReturn<T> {
  paginatedData: T[];
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  sortColumn: keyof T | null;
  sortDirection: 'asc' | 'desc';
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  handleSort: (column: keyof T) => void;
  resetFilters: () => void;
}

export function useTableData<T>({
  data,
  pageSize = 10,
  initialSortColumn,
  initialSortDirection = 'asc',
}: UseTableDataOptions<T>): UseTableDataReturn<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(initialSortColumn || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);

  // تصفية البيانات
  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data;
    }

    return data.filter((item) =>
      Object.values(item as Record<string, unknown>).some(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // ترتيب البيانات
  const sortedData = useMemo(() => {
    if (!sortColumn) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) {
        return 0;
      }
      if (aValue === null || aValue === undefined) {
        return 1;
      }
      if (bValue === null || bValue === undefined) {
        return -1;
      }

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // ترقيم الصفحات
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setSortColumn(initialSortColumn || null);
    setSortDirection(initialSortDirection);
  };

  return {
    paginatedData,
    currentPage,
    totalPages,
    searchTerm,
    sortColumn,
    sortDirection,
    setSearchTerm: (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
    },
    setCurrentPage,
    handleSort,
    resetFilters,
  };
}
