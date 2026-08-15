/**
 * DigitalMarketingTasksPage - صفحة مهام التسويق الرقمي
 * تم إعادة هيكللتها لتقليل التعقيد وتحسين قابلية الصيانة
 */

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, ViewMode, TaskStatus } from './tasks/types/task.types';
import { useTasks } from './tasks/hooks/useTasks';
import TaskStatsCards from './tasks/components/TaskStatsCards';
import TaskFilters from './tasks/components/TaskFilters';
import KanbanColumn from './tasks/components/KanbanColumn';
import TaskListView from './tasks/components/TaskListView';
import TaskDetailsDialog from './tasks/components/TaskDetailsDialog';
import TaskFormDialog from './tasks/components/TaskFormDialog';

// Main Page Component
export default function DigitalMarketingTasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { tasks, stats, isLoading, refetch, handleStatusChange, handleDelete } = useTasks({
    statusFilter,
    priorityFilter,
    categoryFilter,
    searchQuery,
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleDeleteWithConfirm = (id: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      handleDelete(id);
      toast.success('تم حذف المهمة');
    }
  };

  const handleCreateNew = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'completed'];

  return (
    <DashboardLayout
      pageTitle="مهام التسويق الرقمي"
      pageDescription="إدارة مهام فريق التسويق الرقمي"
    >
      <div className="space-y-4 md:space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">إدارة مهام فريق التسويق الرقمي</h1>
            <p className="text-sm text-muted-foreground">إنشاء وتوزيع ومتابعة المهام</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()} className="h-9 w-9">
              <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button onClick={handleCreateNew} className="h-9 text-sm">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 me-1.5 sm:me-2" />
              <span className="hidden sm:inline">مهمة جديدة</span>
              <span className="sm:hidden">جديد</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <TaskStatsCards stats={stats} />

        {/* Filters & View Toggle */}
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasks || []}
                onTaskClick={handleTaskClick}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <TaskListView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteWithConfirm}
          />
        )}

        {/* Task Details Dialog */}
        <TaskDetailsDialog
          task={selectedTask}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          _onUpdate={refetch}
          onDelete={handleDeleteWithConfirm}
        />

        {/* Create/Edit Task Dialog */}
        <TaskFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          task={editingTask}
          onSuccess={refetch}
        />
      </div>
    </DashboardLayout>
  );
}
