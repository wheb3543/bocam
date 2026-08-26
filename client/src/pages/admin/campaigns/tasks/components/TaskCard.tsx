/**
 * TaskCard - بطاقة المهمة
 * يعرض معلومات المهمة في بطاقة قابلة للسحب
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GripVertical, Calendar } from 'lucide-react';
import type { Task } from '../types/task.types';
import {
  getPriorityLabel,
  getPriorityColor,
  getCategoryLabel,
  getCategoryColor,
  isOverdue,
} from './TaskHelpers';
import { formatDateUtil } from '@/hooks/export/useFormatDate';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  draggable: boolean;
}

const TaskCard = memo(function TaskCard({ task, onClick, draggable }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id.toString());
  };

  const formatDate = formatDateUtil;

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${draggable ? '' : 'cursor-default'}`}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2 mb-2">
          {draggable && (
            <GripVertical className="mt-0.5 h-4 w-4 cursor-grab text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </Badge>
          <Badge variant="secondary" className={`text-xs ${getCategoryColor(task.category)}`}>
            {getCategoryLabel(task.category)}
          </Badge>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {task.assignedUser ? (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {(task.assignedUser.name || task.assignedUser.username).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[80px]">
                  {task.assignedUser.name || task.assignedUser.username}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">غير معيّن</span>
            )}
          </div>

          {task.dueDate && (
            <div
              className={`flex items-center gap-1 ${isOverdue(task.dueDate, task.status) ? 'text-red-500' : ''}`}
            >
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default TaskCard;
