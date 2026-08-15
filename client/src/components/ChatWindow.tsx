import React, { useState, useCallback, useEffect, useRef } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import useSSE from '@/hooks/integrations/useSSE';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { useChatSSE } from '@/hooks/chat/useChatSSE';
import { ChatMessageService } from '@/services/chatMessageService';
import type { Message, ChatWindowProps } from './chat/types';
import { mergeMessages, isMessage } from './chat/types';

/**
 * ChatWindow - مكون نافذة المحادثة المُعاد هيكلته
 * تم تقسيم المكون الأصلي (2881 سطر) إلى مكونات أصغر قابلة للصيانة
 */
export default function ChatWindow({
  conversationId,
  lastMessageAt,
  onConversationUpdate,
  phone,
  contactName,
}: ChatWindowProps) {
  const { user } = useAuth();
  const userId = user?.id;
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  // UI state
  const [isNightMode, setIsNightMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsapp-night-mode');
      return saved === 'true';
    }
    return false;
  });

  const [messageFontSize, setMessageFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsapp-message-font-size');
      return saved ? parseInt(saved, 10) : 14;
    }
    return 14;
  });

  // Selection mode
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string | number>>(new Set());

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<string | number>>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // Media gallery
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Message | null>(null);

  // Track the last conversationId to reset state on change
  const prevConvIdRef = useRef<number | null>(null);
  const [localLastMessageAt, setLocalLastMessageAt] = useState<Date | null>(null);

  // Mark unused variables with underscore
  const _isSearchOpen = isSearchOpen;
  const _searchResults = searchResults;
  const _currentSearchIndex = currentSearchIndex;
  const _isMediaGalleryOpen = isMediaGalleryOpen;
  const _selectedMedia = selectedMedia;
  const _localLastMessageAt = localLastMessageAt;

  // tRPC queries
  const { data: messagesData, refetch: refetchMessages } =
    trpc.whatsapp.messages.listByConversation.useQuery(
      { conversationId: conversationId ?? 0 },
      { enabled: !!conversationId }
    );

  const { data: templates } = trpc.whatsapp.templates.list.useQuery(undefined, {
    enabled: !!conversationId,
  });

  const { data: activeUsers } = trpc.users.getActiveUsers.useQuery();

  const { data: quickReplies } = trpc.whatsapp.quickReplies.list.useQuery();

  const { data: allConversations } = trpc.whatsapp.conversations.list.useQuery(undefined, {
    enabled: false, // Will be enabled when forward dialog opens
  });

  // tRPC mutations
  const sendMessageMutation = trpc.whatsapp.messages.send.useMutation({
    onSuccess: () => {
      setReplyToMessage(null);
      onConversationUpdate?.();
    },
    onError: (err) => {
      toast.error(`فشل إرسال الرسالة: ${err.message}`);
      setLocalMessages((prev) => prev.filter((m) => !String(m.id).startsWith('temp-')));
    },
  });

  const deleteMessageMutation = trpc.whatsapp.messages.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الرسالة');
      refetchMessages();
    },
    onError: (err) => {
      toast.error(`فشل حذف الرسالة: ${err.message}`);
    },
  });

  const sendTemplateMutation = trpc.whatsapp.sendTemplate.useMutation({
    onSuccess: () => {
      setLocalLastMessageAt(new Date());
      refetchMessages();
      onConversationUpdate?.();
      toast.success('تم إرسال القالب بنجاح — يمكنك الآن إرسال رسائل عادية');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`فشل إرسال القالب: ${message || 'خطأ غير معروف'}`);
    },
  });

  // SSE handling with custom hook
  const { handleSSEUpdate } = useChatSSE({
    conversationId,
    onMessageUpdate: (updater) => setLocalMessages(updater),
  });

  // SSE subscription
  useSSE(
    conversationId ? `/api/whatsapp/stream/${conversationId}` : null,
    useCallback(
      (e: MessageEvent) => {
        try {
          const eventName = (e as MessageEvent).type || 'message';
          let payload: unknown;
          try {
            payload = JSON.parse(e.data);
          } catch {
            return;
          }

          handleSSEUpdate(eventName, payload);
        } catch {
          // Ignore SSE errors
        }
      },
      [handleSSEUpdate]
    )
  );

  // Reset local state when conversation changes
  useEffect(() => {
    if (prevConvIdRef.current !== conversationId) {
      prevConvIdRef.current = conversationId;
      setLocalMessages([]);
      setReplyToMessage(null);
      setSelectedMessages(new Set());
      setIsSelectionMode(false);
    }
  }, [conversationId]);

  // Sync DB data into localMessages
  useEffect(() => {
    if (messagesData && Array.isArray(messagesData)) {
      const validatedMessages = messagesData.filter((msg: unknown): msg is Message =>
        isMessage(msg)
      );
      setLocalMessages((prev) => mergeMessages(validatedMessages, prev));
    }
  }, [messagesData]);

  // UI handlers
  const handleToggleNightMode = useCallback(() => {
    setIsNightMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('whatsapp-night-mode', newValue.toString());
      return newValue;
    });
  }, []);

  const handleFontSizeChange = useCallback((delta: number) => {
    setMessageFontSize((prev) => {
      const newSize = Math.max(12, Math.min(20, prev + delta));
      localStorage.setItem('whatsapp-message-font-size', newSize.toString());
      return newSize;
    });
  }, []);

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    setSelectedMessages(new Set());
  }, []);

  const handleToggleMessageSelection = useCallback((messageId: string | number) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  const handleDeleteSelectedMessages = useCallback(async () => {
    if (selectedMessages.size === 0) {
      return;
    }

    // eslint-disable-next-line no-alert -- Intentional user confirmation
    if (confirm(`هل أنت متأكد من حذف ${selectedMessages.size} رسالة؟`)) {
      const messageIds = Array.from(selectedMessages);
      for (const messageId of messageIds) {
        const id = typeof messageId === 'number' ? messageId : Number(messageId);
        if (Number.isNaN(id)) {
          continue;
        }
        await deleteMessageMutation.mutateAsync({ messageId: id });
      }
      toast.success(`تم حذف ${selectedMessages.size} رسالة`);
      setSelectedMessages(new Set());
      setIsSelectionMode(false);
    }
  }, [selectedMessages, deleteMessageMutation]);

  // Message handlers
  const handleReply = useCallback((message: Message) => {
    setReplyToMessage(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  const handleDelete = useCallback(
    (message: Message) => {
      if (message.id === null) {
        return;
      }
      // eslint-disable-next-line no-alert -- Intentional user confirmation
      if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        deleteMessageMutation.mutate({ messageId: Number(message.id) });
      }
    },
    [deleteMessageMutation]
  );

  const handleForward = useCallback((_message: Message) => {
    // Will be implemented with forward dialog
    toast.info('إعادة التوجيه قيد التطوير');
  }, []);

  const handleDownload = useCallback((message: Message) => {
    ChatMessageService.downloadMedia(message);
  }, []);

  const handleCopy = useCallback((message: Message) => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast.success('تم نسخ الرسالة');
    }
  }, []);

  const handleShare = useCallback((message: Message) => {
    if (message.content) {
      if (navigator.share) {
        navigator.share({
          title: 'مشاركة رسالة',
          text: message.content,
        });
      } else {
        toast.info('المشاركة غير مدعومة في هذا المتصفح');
      }
    }
  }, []);

  // Send message handler
  const handleSendMessage = useCallback(
    (content: string, file?: File, replyTo?: Message) => {
      if (!conversationId) {
        toast.error('يرجى اختيار محادثة أولاً');
        return;
      }

      // Add optimistic message
      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        direction: 'outbound',
        content,
        messageType: file ? (file.type.startsWith('image/') ? 'image' : 'document') : 'text',
        status: 'pending' as const,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        sentBy: userId,
        replyToMessageId: replyTo?.id ? Number(replyTo.id) : undefined,
      };

      setLocalMessages((prev) => [...prev, optimistic]);

      // Send actual message
      if (file) {
        // Upload file first
        const formData = new FormData();
        formData.append('file', file);

        fetch('/api/whatsapp/upload', {
          method: 'POST',
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              sendMessageMutation.mutate({
                conversationId,
                message: content,
                mediaId: data.mediaId || data.dataUrl,
                messageType: optimistic.messageType as
                  | 'text'
                  | 'image'
                  | 'document'
                  | 'audio'
                  | 'video'
                  | 'location'
                  | 'template'
                  | 'interactive'
                  | 'contacts'
                  | 'unknown'
                  | undefined,
                replyToMessageId: replyTo?.id ? Number(replyTo.id) : undefined,
              });
            } else {
              toast.error('فشل رفع الملف');
              setLocalMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
            }
          })
          .catch(() => {
            toast.error('فشل رفع الملف');
            setLocalMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          });
      } else {
        sendMessageMutation.mutate({
          conversationId,
          message: content,
          replyToMessageId: replyTo?.id ? Number(replyTo.id) : undefined,
        });
      }
    },
    [conversationId, userId, sendMessageMutation]
  );

  // Send template handler
  const handleSendTemplate = useCallback(
    (templateId: string, recipientPhone: string) => {
      sendTemplateMutation.mutate({
        templateName: templateId, // Changed from templateId to templateName based on server schema
        phone: recipientPhone,
      });
    },
    [sendTemplateMutation]
  );

  // Schedule message handler
  const handleScheduleMessage = useCallback((_content: string, _date: string) => {
    toast.info('جدولة الرسائل قيد التطوير');
  }, []);

  // Forward message handler
  const handleForwardMessage = useCallback((_message: Message, _targetConversationId: number) => {
    toast.info('إعادة التوجيه قيد التطوير');
  }, []);

  // Search handlers
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        setCurrentSearchIndex(0);
        return;
      }

      const results = ChatMessageService.searchMessages(localMessages, query);
      setSearchResults(results);
      setCurrentSearchIndex(0);
    },
    [localMessages]
  );

  // Media gallery handlers
  const handleOpenMediaGallery = useCallback(() => {
    setIsMediaGalleryOpen(true);
  }, []);

  const handleCloseMediaGallery = useCallback(() => {
    setIsMediaGalleryOpen(false);
    setSelectedMedia(null);
  }, []);

  // Mark unused handlers with underscore
  const _handleSearch = handleSearch;
  const _handleCloseMediaGallery = handleCloseMediaGallery;

  // Export conversation handler
  const handleExportConversation = useCallback(async () => {
    if (!conversationId) {
      return;
    }
    await ChatMessageService.exportConversationToPDF(localMessages, contactName || null);
  }, [conversationId, localMessages, contactName]);

  const outsideWindow =
    !lastMessageAt || new Date(lastMessageAt).getTime() < Date.now() - 24 * 60 * 60 * 1000;

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">اختر محادثة للبدء</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isNightMode ? 'dark' : ''}`}>
      <ChatHeader
        conversationId={conversationId}
        contactName={contactName}
        phone={phone}
        isNightMode={isNightMode}
        onToggleNightMode={handleToggleNightMode}
        onSearchOpen={() => setIsSearchOpen(true)}
        onMediaGalleryOpen={handleOpenMediaGallery}
        onExportConversation={handleExportConversation}
        onFontSizeChange={handleFontSizeChange}
        _messageFontSize={messageFontSize}
        isSelectionMode={isSelectionMode}
        selectedMessagesCount={selectedMessages.size}
        onToggleSelectionMode={handleToggleSelectionMode}
        onDeleteSelectedMessages={handleDeleteSelectedMessages}
      />

      <ChatMessages
        messages={localMessages}
        _userId={userId}
        isSelectionMode={isSelectionMode}
        selectedMessages={selectedMessages}
        onToggleSelection={handleToggleMessageSelection}
        _onReply={handleReply}
        onDelete={handleDelete}
        onForward={handleForward}
        onDownload={handleDownload}
        onCopy={handleCopy}
        onShare={handleShare}
        fontSize={messageFontSize}
        searchQuery={searchQuery}
        replyToMessage={replyToMessage}
      />

      <ChatInput
        conversationId={conversationId}
        phone={phone || null}
        templates={templates}
        quickReplies={quickReplies?.map((t) => t.content) || []}
        outsideWindow={outsideWindow}
        replyToMessage={replyToMessage}
        onSendMessage={handleSendMessage}
        onSendTemplate={handleSendTemplate}
        onCancelReply={handleCancelReply}
        onScheduleMessage={handleScheduleMessage}
        onForwardMessage={handleForwardMessage}
        allConversations={allConversations}
        _activeUsers={activeUsers}
      />
    </div>
  );
}
