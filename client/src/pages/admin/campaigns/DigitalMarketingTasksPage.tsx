/**
 * DigitalMarketingTasksPage - صفحة مهام التسويق الرقمي
 * تم إعادة هيكللتها لتقليل التعقيد وتحسين قابلية الصيانة
 */

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { PermissionHint } from '@/components/PermissionHint';
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
  const { can, isLoading: arePermissionsLoading } = useRolePermissions();
  const canViewTasks = can('tasks.view');
  const canCreateTasks = can('tasks.create');
  const canUpdateTasks = can('tasks.update');
  const canAssignTasks = can('tasks.assign');
  const canCompleteTasks = can('tasks.complete');
  const canDeleteTasks = can('tasks.delete');
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
    canViewTasks,
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
      pageHeader="none"
    >
      <div
        className="flex h-[calc(100dvh-4.25rem)] min-h-0 flex-col gap-3 overflow-hidden py-3 sm:py-4"
        dir="rtl"
      >
        {canViewTasks && (
          <>
            <div className="shrink-0">
              <TaskStatsCards stats={stats} />
            </div>

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
              actions={
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refetch()}
                    className="h-9 w-9"
                  >
                    <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="sr-only">تحديث المهام</span>
                  </Button>
                  {canCreateTasks && (
                    <Button onClick={handleCreateNew} className="h-9 text-sm">
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 me-1.5 sm:me-2" />
                      <span className="hidden sm:inline">مهمة جديدة</span>
                      <span className="sm:hidden">جديد</span>
                    </Button>
                  )}
                  {!canCreateTasks && (
                    <PermissionHint
                      label="إنشاء مقيّد"
                      message="لا تملك صلاحية إنشاء مهام التسويق الرقمي."
                    />
                  )}
                </div>
              }
            />
          </>
        )}

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {arePermissionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !canViewTasks ? (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              لا تملك صلاحية عرض مهام التسويق الرقمي.
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : viewMode === 'kanban' ? (
            <div className="flex h-full min-w-max gap-4 overflow-x-auto pb-2">
              {statuses.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={tasks || []}
                  onTaskClick={handleTaskClick}
                  onStatusChange={handleStatusChange}
                  canUpdateTasks={canUpdateTasks}
                  canCompleteTasks={canCompleteTasks}
                />
              ))}
            </div>
          ) : (
            <TaskListView
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onEditTask={canUpdateTasks ? handleEditTask : undefined}
              onDeleteTask={canDeleteTasks ? handleDeleteWithConfirm : undefined}
            />
          )}
        </div>

        {/* Task Details Dialog */}
        {canViewTasks && (
          <TaskDetailsDialog
            task={selectedTask}
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            _onUpdate={refetch}
            onDelete={canDeleteTasks ? handleDeleteWithConfirm : undefined}
            canUpdateTasks={canUpdateTasks}
            canDeleteTasks={canDeleteTasks}
          />
        )}

        {/* Create/Edit Task Dialog */}
        {(canCreateTasks || canUpdateTasks) && (
          <TaskFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            task={editingTask}
            onSuccess={refetch}
            canCreateTasks={canCreateTasks}
            canUpdateTasks={canUpdateTasks}
            canAssignTasks={canAssignTasks}
            canCompleteTasks={canCompleteTasks}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
