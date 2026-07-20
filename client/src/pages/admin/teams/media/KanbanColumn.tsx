/**
 * Kanban Column Component
 * مكون عمود كانبان
 */

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { statusConfig } from './config';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from './types';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  formatDate: (date: Date | string | null) => string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

export default function KanbanColumn({
  status,
  tasks,
  formatDate,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const config = statusConfig[status];

  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[300px]">
      <div className={`rounded-t-lg p-3 ${config.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <span className={`font-medium ${config.color}`}>{config.label}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-400px)] bg-muted/30 rounded-b-lg p-2">
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              formatDate={formatDate}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">لا توجد مهام</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
