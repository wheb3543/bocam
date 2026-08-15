/**
 * KanbanColumn - عمود لوحة Kanban
 * يعرض المهام في عمود واحد حسب حالتها مع دعم السحب والإفلات
 */

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Task, TaskStatus } from '../types/task.types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
}

const KanbanColumn = memo(function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onStatusChange,
}: KanbanColumnProps) {
  const columnTasks = tasks.filter((t) => t.status === status);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-muted/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-muted/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-muted/50');
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div
      className="flex-1 min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg p-3"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-muted text-foreground border-border">
            {status}
          </Badge>
          <span className="text-sm text-muted-foreground">({columnTasks.length})</span>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-2 pe-2">
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
          {columnTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">لا توجد مهام</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export default KanbanColumn;
