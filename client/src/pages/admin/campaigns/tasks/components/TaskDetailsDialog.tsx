/**
 * TaskDetailsDialog - حوار تفاصيل المهمة
 * يعرض تفاصيل المهمة الكاملة مع التعليقات والمرفقات
 */

import { memo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { MoreVertical, Edit, Trash2, MessageSquare, Paperclip, Send, File, Upload } from 'lucide-react';
import { trpc } from '@/lib/api/trpc';
import type { Task, Comment, Attachment } from '../types/task.types';
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, getCategoryLabel, getCategoryColor, isOverdue } from './TaskHelpers';
import { formatDateUtil } from '@/hooks/export/useFormatDate';

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  _onUpdate: () => void;
  onDelete: (id: number) => void;
}

const TaskDetailsDialog = memo(function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  _onUpdate,
  onDelete,
}: TaskDetailsDialogProps) {
  const [_isEditing, _setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');

  const { data: comments, refetch: refetchComments } = trpc.tasks.getComments.useQuery(
    { taskId: task?.id || 0 },
    { enabled: !!task?.id && open }
  );

  const { data: attachments, refetch: _refetchAttachments } = trpc.tasks.getAttachments.useQuery(
    { taskId: task?.id || 0 },
    { enabled: !!task?.id && open }
  );

  const addCommentMutation = trpc.tasks.addComment.useMutation({
    onSuccess: () => {
      setNewComment('');
      refetchComments();
      toast.success('تم إضافة التعليق');
    },
  });

  const handleAddComment = () => {
    if (!task || !newComment.trim()) {return;}
    addCommentMutation.mutate({ taskId: task.id, content: newComment });
  };

  const formatDate = formatDateUtil;

  if (!task) {return null;}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {getPriorityLabel(task.priority)}
                </Badge>
                <Badge className={getCategoryColor(task.category)}>
                  {getCategoryLabel(task.category)}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => _setIsEditing(true)}>
                  <Edit className="h-4 w-4 me-2" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    onDelete(task.id);
                    onOpenChange(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Description */}
            <div>
              <h4 className="font-medium mb-2">الوصف</h4>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {task.description || 'لا يوجد وصف'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">المعيّن إليه</Label>
                <p className="font-medium">
                  {task.assignedUser?.name || task.assignedUser?.username || 'غير معيّن'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">الحملة</Label>
                <p className="font-medium">{task.campaign?.name || 'غير مرتبط'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">تاريخ التسليم</Label>
                <p
                  className={`font-medium ${isOverdue(task.dueDate, task.status) ? 'text-red-500' : ''}`}
                >
                  {formatDate(task.dueDate)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">الساعات المقدرة</Label>
                <p className="font-medium">{task.estimatedHours || '-'} ساعة</p>
              </div>
            </div>

            <Separator />

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  المرفقات ({attachments?.length || 0})
                </h4>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 me-2" />
                  رفع ملف
                </Button>
              </div>
              {attachments && attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((att: Attachment) => (
                    <div key={att.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{att.fileName}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                          عرض
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد مرفقات</p>
              )}
            </div>

            <Separator />

            {/* Comments */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4" />
                التعليقات ({comments?.length || 0})
              </h4>

              <div className="space-y-3 mb-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {(comment.user?.name || comment.user?.username || '?').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.user?.name || comment.user?.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد تعليقات</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="أضف تعليقاً..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

export default TaskDetailsDialog;
