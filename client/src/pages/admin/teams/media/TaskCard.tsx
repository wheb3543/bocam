/**
 * Task Card Component
 * مكون بطاقة المهمة
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, GripVertical, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCategoryInfo, priorityConfig } from './config';
import type { Task } from './types';

interface TaskCardProps {
  task: Task;
  formatDate: (date: Date | string | null) => string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export default function TaskCard({ task, formatDate, onEdit, onDelete }: TaskCardProps) {
  const categoryInfo = getCategoryInfo(task.category);
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id.toString());
        e.dataTransfer.setData('currentStatus', task.status);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <Badge
              className={`${priorityConfig[task.priority].bgColor} ${priorityConfig[task.priority].color} text-xs`}
            >
              {priorityConfig[task.priority].label}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>

        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {categoryInfo.icon}
            {categoryInfo.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {task.assignedUser?.name && (
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {task.assignedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
