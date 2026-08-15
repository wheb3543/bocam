/**
 * useTasks - Custom hook لإدارة المهام
 * يتولى جلب المهام، الفلترة، والبحث
 */

import { trpc } from '@/lib/api/trpc';
import type { TaskStats } from '../types/task.types';

interface UseTasksProps {
  statusFilter: string;
  priorityFilter: string;
  categoryFilter: string;
  searchQuery: string;
}

export function useTasks({ statusFilter, priorityFilter, categoryFilter, searchQuery }: UseTasksProps) {
  const {
    data: tasks,
    isLoading,
    refetch,
  } = trpc.tasks.list.useQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    search: searchQuery || undefined,
  });

  const { data: stats } = trpc.tasks.stats.useQuery();

  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleStatusChange = (taskId: number, newStatus: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled') => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  return {
    tasks,
    stats: stats as TaskStats | undefined,
    isLoading,
    refetch,
    handleStatusChange,
    handleDelete,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
