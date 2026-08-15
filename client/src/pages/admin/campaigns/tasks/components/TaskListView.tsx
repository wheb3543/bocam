/**
 * TaskListView - عرض المهام كقائمة
 * يعرض المهام في جدول
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { Task } from '../types/task.types';
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, getCategoryLabel, getCategoryColor, isOverdue } from './TaskHelpers';
import { formatDateUtil } from '@/hooks/export/useFormatDate';

interface TaskListViewProps {
  tasks: Task[] | undefined;
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

const TaskListView = memo(function TaskListView({
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteTask,
}: TaskListViewProps) {
  const formatDate = formatDateUtil;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right p-3 font-medium">المهمة</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">الأولوية</th>
                <th className="text-right p-3 font-medium">التصنيف</th>
                <th className="text-right p-3 font-medium">المعيّن إليه</th>
                <th className="text-right p-3 font-medium">تاريخ التسليم</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map((task: Task) => (
                <tr
                  key={task.id}
                  className="border-t hover:bg-muted/30 cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className={getCategoryColor(task.category)}>
                      {getCategoryLabel(task.category)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {task.assignedUser ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {(task.assignedUser.name || task.assignedUser.username).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {task.assignedUser.name || task.assignedUser.username}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">غير معيّن</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={isOverdue(task.dueDate, task.status) ? 'text-red-500' : ''}
                    >
                      {formatDate(task.dueDate)}
                    </span>
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                        >
                          <Edit className="h-4 w-4 me-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 me-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {(!tasks || tasks.length === 0) && (
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
  );
});

export default TaskListView;
