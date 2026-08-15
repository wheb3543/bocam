import { useFormatDate } from '@/hooks/export/useFormatDate';
import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { statusConfig, priorityConfig, getCategoryInfo } from './media/config';
import type { Task, TaskStatus, TaskPriority, TaskCategory } from './media/types';
import KanbanColumn from './media/KanbanColumn';
import TaskForm from './media/TaskForm';
import MediaStats from './media/MediaStats';
import MediaFilters from './media/MediaFilters';

export default function MediaTeamPage() {
  const { formatDate } = useFormatDate();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    category: TaskCategory;
    assignedToId: string;
    campaignId: string;
    dueDate: string;
  }>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: 'design',
    assignedToId: 'none',
    campaignId: 'none',
    dueDate: '',
  });

  // جلب المهام - فلترة حسب tags = 'media' لعرض مهام فريق الإعلام فقط
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = trpc.tasks.list.useQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    search: searchQuery || undefined,
  });

  // جلب المستخدمين
  const { data: usersData } = trpc.users.getAll.useQuery();

  // جلب الحملات
  const { data: campaignsData } = trpc.campaigns.list.useQuery({});

  // إنشاء مهمة
  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء المهمة بنجاح');
      setIsCreateDialogOpen(false);
      resetForm();
      refetchTasks();
    },
    onError: (error) => {
      toast.error('فشل إنشاء المهمة: ' + error.message);
    },
  });

  // تحديث مهمة
  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث المهمة بنجاح');
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      resetForm();
      refetchTasks();
    },
    onError: (error) => {
      toast.error('فشل تحديث المهمة: ' + error.message);
    },
  });

  // تحديث حالة المهمة
  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث الحالة بنجاح');
      refetchTasks();
    },
    onError: (error) => {
      toast.error('فشل تحديث الحالة: ' + error.message);
    },
  });

  // حذف مهمة
  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف المهمة بنجاح');
      refetchTasks();
    },
    onError: (error) => {
      toast.error('فشل حذف المهمة: ' + error.message);
    },
  });

  // فلترة المهام لعرض مهام فريق الإعلام فقط (tags = 'media')
  const tasks = useMemo(() => {
    const allTasks = tasksData || [];
    return allTasks.filter((t: Task) => t.tags === 'media');
  }, [tasksData]);

  const users = usersData || [];
  const campaigns = campaignsData || [];

  // إحصائيات
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t: Task) => t.status === 'todo').length,
      inProgress: tasks.filter((t: Task) => t.status === 'in_progress').length,
      review: tasks.filter((t: Task) => t.status === 'review').length,
      completed: tasks.filter((t: Task) => t.status === 'completed').length,
      overdue: tasks.filter(
        (t: Task) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
      ).length,
    };
  }, [tasks]);

  // تجميع المهام حسب الحالة للـ Kanban
  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter((t: Task) => t.status === 'todo'),
      in_progress: tasks.filter((t: Task) => t.status === 'in_progress'),
      review: tasks.filter((t: Task) => t.status === 'review'),
      completed: tasks.filter((t: Task) => t.status === 'completed'),
    };
  }, [tasks]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      category: 'design',
      assignedToId: 'none',
      campaignId: 'none',
      dueDate: '',
    });
  };

  const handleCreateTask = () => {
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان المهمة');
      return;
    }
    if (formData.title.trim().length < 3) {
      toast.error('يجب أن يكون عنوان المهمة 3 أحرف على الأقل');
      return;
    }
    if (
      formData.description &&
      formData.description.trim().length > 0 &&
      formData.description.trim().length < 3
    ) {
      toast.error('يجب أن يكون وصف المهمة 3 أحرف على الأقل أو فارغاً');
      return;
    }

    createTaskMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      category: formData.category,
      assignedTo: formData.assignedToId !== 'none' ? parseInt(formData.assignedToId) : undefined,
      campaignId: formData.campaignId !== 'none' ? parseInt(formData.campaignId) : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      tags: 'media', // علامة لتمييز مهام فريق الإعلام
    });
  };

  const handleEditTask = () => {
    if (!selectedTask || !formData.title.trim()) {
      toast.error('يرجى إدخال عنوان المهمة');
      return;
    }
    if (formData.title.trim().length < 3) {
      toast.error('يجب أن يكون عنوان المهمة 3 أحرف على الأقل');
      return;
    }
    if (
      formData.description &&
      formData.description.trim().length > 0 &&
      formData.description.trim().length < 3
    ) {
      toast.error('يجب أن يكون وصف المهمة 3 أحرف على الأقل أو فارغاً');
      return;
    }

    updateTaskMutation.mutate({
      id: selectedTask.id,
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      category: formData.category,
      assignedTo: formData.assignedToId !== 'none' ? parseInt(formData.assignedToId) : null,
      campaignId: formData.campaignId !== 'none' ? parseInt(formData.campaignId) : null,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
    });
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      category: task.category,
      assignedToId: task.assignedTo?.toString() || 'none',
      campaignId: task.campaignId?.toString() || 'none',
      dueDate: task.dueDate
        ? typeof task.dueDate === 'string'
          ? task.dueDate.split('T')[0]
          : new Date(task.dueDate).toISOString().split('T')[0]
        : '',
    });
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const handleDeleteTask = (taskId: number) => {
    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      deleteTaskMutation.mutate({ id: taskId });
    }
  };

  return (
    <DashboardLayout pageTitle="فريق وحدة الإعلام" pageDescription="إدارة مهام الإنتاج الإعلامي">
      <div className="container py-4 md:py-6 lg:py-8" dir="rtl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
              فريق وحدة الإعلام
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              إدارة مهام الإنتاج الإعلامي (فيديو، تصميم، تصوير، مونتاج)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetchTasks()}
              className="h-9 w-9"
            >
              <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-9 text-sm">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
                  <span className="hidden sm:inline">مهمة جديدة</span>
                  <span className="sm:hidden">جديد</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
                  <DialogDescription>أضف مهمة جديدة لفريق وحدة الإعلام</DialogDescription>
                </DialogHeader>
                <TaskForm
                  formData={formData}
                  onFormDataChange={setFormData}
                  users={users}
                  campaigns={campaigns}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء المهمة'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <MediaStats stats={stats} />

        {/* Filters & View Toggle */}
        <MediaFilters
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
        {tasksLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(['todo', 'in_progress', 'review', 'completed'] as const).map((status) => (
              <div
                key={status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = parseInt(e.dataTransfer.getData('taskId'));
                  const currentStatus = e.dataTransfer.getData('currentStatus');
                  if (currentStatus !== status) {
                    handleStatusChange(taskId, status);
                  }
                }}
              >
                <KanbanColumn
                  status={status}
                  tasks={tasksByStatus[status] as Task[]}
                  formatDate={formatDate}
                  onEditTask={openEditDialog}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-right p-4 font-medium">المهمة</th>
                      <th className="text-right p-4 font-medium">التصنيف</th>
                      <th className="text-right p-4 font-medium">الحالة</th>
                      <th className="text-right p-4 font-medium">الأولوية</th>
                      <th className="text-right p-4 font-medium">المعيّن إليه</th>
                      <th className="text-right p-4 font-medium">تاريخ التسليم</th>
                      <th className="text-right p-4 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task: Task) => {
                      const categoryInfo = getCategoryInfo(task.category as TaskCategory);
                      const isOverdue =
                        task.dueDate &&
                        new Date(task.dueDate) < new Date() &&
                        task.status !== 'completed';
                      return (
                        <tr
                          key={task.id}
                          className={`border-b hover:bg-muted/30 ${isOverdue ? 'bg-red-50' : ''}`}
                        >
                          <td className="p-4">
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1 text-sm">
                              {categoryInfo.icon}
                              {categoryInfo.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={`${statusConfig[task.status as TaskStatus].bgColor} ${statusConfig[task.status as TaskStatus].color}`}
                            >
                              {statusConfig[task.status as TaskStatus].label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={`${priorityConfig[task.priority as TaskPriority].bgColor} ${priorityConfig[task.priority as TaskPriority].color}`}
                            >
                              {priorityConfig[task.priority as TaskPriority].label}
                            </Badge>
                          </td>
                          <td className="p-4">{task.assignedUser?.name || '-'}</td>
                          <td className="p-4">
                            {task.dueDate ? (
                              <span className={isOverdue ? 'text-red-600' : ''}>
                                {formatDate(task.dueDate)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(task)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {tasks.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          لا توجد مهام
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل المهمة</DialogTitle>
              <DialogDescription>تعديل بيانات المهمة</DialogDescription>
            </DialogHeader>
            <TaskForm
              formData={formData}
              onFormDataChange={setFormData}
              users={users}
              campaigns={campaigns}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEditTask} disabled={updateTaskMutation.isPending}>
                {updateTaskMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
