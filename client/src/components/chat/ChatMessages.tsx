import React, { memo, useRef, useEffect, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageActions } from './MessageActions';
import type { Message } from './types';
import { formatDateForSeparator, getDateKey } from './types';

interface ChatMessagesProps {
  messages: Message[];
  _userId: number | undefined;
  isSelectionMode: boolean;
  selectedMessages: Set<string | number>;
  onToggleSelection: (messageId: string | number) => void;
  _onReply: (message: Message) => void;
  onDelete: (message: Message) => void;
  onForward: (message: Message) => void;
  onDownload: (message: Message) => void;
  onCopy: (message: Message) => void;
  onShare: (message: Message) => void;
  fontSize: number;
  searchQuery?: string;
  replyToMessage?: Message | null;
  _visibleRange?: { start: number; end: number };
}

export const ChatMessages = memo(({
  messages,
  _userId,
  isSelectionMode,
  selectedMessages,
  onToggleSelection,
  _onReply,
  onDelete,
  onForward,
  onDownload,
  onCopy,
  onShare,
  fontSize,
  searchQuery = '',
  replyToMessage,
  _visibleRange = { start: 0, end: 50 },
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: Record<string, Message[]> = {};
    
    messages.forEach((message) => {
      const dateKey = getDateKey(message.sentAt || message.createdAt || new Date());
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  }, [messages]);

  const handleScroll = useCallback((_e: React.UIEvent<HTMLDivElement>) => {
    // Can be used for virtual scrolling in the future
    const container = _e.currentTarget;
    const _scrollTop = container.scrollTop;
    // Implement virtual scrolling logic here if needed
  }, []);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
      onScroll={handleScroll}
    >
      {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
        <div key={dateKey}>
          {/* Date separator */}
          <div className="flex justify-center my-4">
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1 rounded-full text-sm">
              {formatDateForSeparator(new Date(dateKey))}
            </span>
          </div>

          {/* Messages for this date */}
          {dateMessages.map((message) => {
            const isOwnMessage = message.direction === 'outbound';
            const isSelected = selectedMessages.has(message.id || '');
            
            return (
              <div key={message.id || `temp-${Date.now()}`} className="relative group">
                <MessageBubble
                  message={message}
                  isOwnMessage={isOwnMessage}
                  isSelected={isSelected}
                  isSelectionMode={isSelectionMode}
                  onToggleSelection={onToggleSelection}
                  _onReply={_onReply}
                  _onDelete={onDelete}
                  _onForward={onForward}
                  _onReact={undefined}
                  onDownload={onDownload}
                  fontSize={fontSize}
                  searchQuery={searchQuery}
                  replyToMessage={
                    replyToMessage?.id === message.replyToMessageId ? replyToMessage : undefined
                  }
                />

                {/* Message actions - show on hover for own messages */}
                {isOwnMessage && !isSelectionMode && (
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageActions
                      message={message}
                      isOwnMessage={isOwnMessage}
                      onReply={_onReply}
                      onDelete={onDelete}
                      onForward={onForward}
                      onDownload={onDownload}
                      onCopy={onCopy}
                      onShare={onShare}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Invisible element for scrolling to bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
});

ChatMessages.displayName = 'ChatMessages';
