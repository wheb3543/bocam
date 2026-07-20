import React, { memo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Reply, Trash2, Forward, Download, Copy, Share2 } from 'lucide-react';
import type { Message } from './types';

interface MessageActionsProps {
  message: Message;
  isOwnMessage: boolean;
  onReply: (message: Message) => void;
  onDelete: (message: Message) => void;
  onForward: (message: Message) => void;
  onDownload: (message: Message) => void;
  onCopy: (message: Message) => void;
  onShare: (message: Message) => void;
}

export const MessageActions = memo(({
  message,
  isOwnMessage,
  onReply,
  onDelete,
  onForward,
  onDownload,
  onCopy,
  onShare,
}: MessageActionsProps) => {
  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      onCopy(message);
    }
  };

  const handleDownload = () => {
    onDownload(message);
  };

  const handleReply = () => {
    onReply(message);
  };

  const handleForward = () => {
    onForward(message);
  };

  const handleDelete = () => {
    onDelete(message);
  };

  const handleShare = () => {
    onShare(message);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleReply}>
          <Reply className="h-4 w-4 ml-2" />
          الرد
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 ml-2" />
          نسخ
        </DropdownMenuItem>
        
        {message.messageType === 'image' || message.messageType === 'video' || message.messageType === 'document' ? (
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="h-4 w-4 ml-2" />
            تحميل
          </DropdownMenuItem>
        ) : null}
        
        <DropdownMenuItem onClick={handleForward}>
          <Forward className="h-4 w-4 ml-2" />
          إعادة توجيه
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="h-4 w-4 ml-2" />
          مشاركة
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {isOwnMessage ? (
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="h-4 w-4 ml-2" />
            حذف
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

MessageActions.displayName = 'MessageActions';
