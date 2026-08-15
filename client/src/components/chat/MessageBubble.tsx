import React, { memo, useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CheckCheck, Clock, XCircle, FileText, Music, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Message } from './types';
import { ChatMessageService } from '@/services/chatMessageService';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelection?: (messageId: string | number) => void;
  _onReply?: (message: Message) => void;
  _onDelete?: (message: Message) => void;
  _onForward?: (message: Message) => void;
  _onReact?: (message: Message) => void;
  onDownload?: (message: Message) => void;
  fontSize?: number;
  searchQuery?: string;
  replyToMessage?: Message | null;
}

// Lazy image component for performance
const LazyImage = memo(
  ({
    src,
    alt,
    className,
    onClick,
  }: {
    src: string;
    alt: string;
    className?: string;
    onClick?: () => void;
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <img
        ref={imgRef}
        src={isInView ? src : ''}
        alt={alt}
        className={className}
        onClick={onClick}
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0.5, transition: 'opacity 0.3s' }}
      />
    );
  }
);

LazyImage.displayName = 'LazyImage';

export const MessageBubble = memo(({
  message,
  isOwnMessage,
  isSelected = false,
  isSelectionMode = false,
  onToggleSelection,
  _onReply,
  _onDelete,
  _onForward,
  _onReact,
  onDownload,
  fontSize = 14,
  searchQuery = '',
  replyToMessage,
}: MessageBubbleProps) => {
  const handleClick = () => {
    if (isSelectionMode && onToggleSelection && message.id !== null && message.id !== undefined) {
      onToggleSelection(message.id);
    }
  };

  const formatMessageTime = (date: Date | string | null | undefined) => {
    if (!date) {return '';}
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'HH:mm', { locale: ar });
  };

  const getMessageStatusIcon = () => {
    if (message.status === 'failed') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (message.status === 'sent') {
      return <CheckCheck className="h-4 w-4 text-gray-400" />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck className="h-4 w-4 text-blue-400" />;
    }
    if (message.status === 'read') {
      return <CheckCheck className="h-4 w-4 text-green-400" />;
    }
    // 'pending' is not in the DB type, but we handle it for optimistic updates
    if (message.status === 'pending' as string) {
      return <Clock className="h-4 w-4 text-gray-400" />;
    }
    return null;
  };

  const renderMessageContent = () => {
    if (message.messageType === 'image' && message.mediaId) {
      return (
        <div className="relative">
          <LazyImage
            src={`/api/whatsapp/media/${message.mediaId}`}
            alt={message.content || 'صورة'}
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => onDownload?.(message)}
          />
        </div>
      );
    }

    if (message.messageType === 'video' && message.mediaId) {
      return (
        <div className="relative">
          <video
            src={`/api/whatsapp/media/${message.mediaId}`}
            controls
            className="max-w-xs rounded-lg"
          />
        </div>
      );
    }

    if (message.messageType === 'audio' && message.mediaId) {
      return (
        <div className="flex items-center gap-2">
          <Music className="h-8 w-8 text-pink-400" />
          <audio controls src={`/api/whatsapp/media/${message.mediaId}`} className="w-48" />
        </div>
      );
    }

    if (message.messageType === 'document' && message.mediaId) {
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <FileText className="h-8 w-8 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">{message.content || 'مستند'}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload?.(message)}
              className="mt-1"
            >
              تحميل
            </Button>
          </div>
        </div>
      );
    }

    if (message.messageType === 'location') {
      return (
        <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <MapPin className="h-8 w-8 text-red-500" />
          <div>
            <p className="text-sm font-medium">موقع</p>
            <p className="text-xs text-gray-500">{message.content}</p>
          </div>
        </div>
      );
    }

    // Default text message
    return (
      <p
        className="break-words"
        style={{ fontSize: `${fontSize}px` }}
        dir="auto"
      >
        {searchQuery ? (
          ChatMessageService.getHighlightedParts(message.content || '', searchQuery).map((part, i) =>
            part.isMatch ? (
              <mark key={i} className="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )
        ) : (
          message.content
        )}
      </p>
    );
  };

  const renderReplyTo = () => {
    if (!replyToMessage) {return null;}

    return (
      <div className="flex items-start gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="w-1 bg-blue-500 rounded" />
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">
            {replyToMessage.direction === 'outbound' ? 'أنت' : 'العميل'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {replyToMessage.content}
          </p>
        </div>
      </div>
    );
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) {return null;}

    return (
      <div className="flex gap-1 mt-1">
        {message.reactions.map((reaction, index) => (
          <span
            key={index}
            className="text-lg bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5"
          >
            {reaction}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      onClick={handleClick}
      data-message-id={message.id}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 relative ${
          isOwnMessage
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      >
        {renderReplyTo()}
        {renderMessageContent()}
        {renderReactions()}

        <div
          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
            isOwnMessage ? 'text-green-100' : 'text-gray-500'
          }`}
        >
          <span>{formatMessageTime(message.sentAt || message.createdAt)}</span>
          {isOwnMessage && getMessageStatusIcon()}
          {message.errorTitle && (
            <Tooltip>
              <TooltipTrigger>
                <XCircle className="h-4 w-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{message.errorTitle}</p>
                {message.errorCode && <p className="text-xs">{message.errorCode}</p>}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
