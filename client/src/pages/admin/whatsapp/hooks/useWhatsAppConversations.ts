/**
 * useWhatsAppConversations - Custom hook لإدارة المحادثات والفلترة
 * يتولى جلب المحادثات، الفلترة، والبحث
 */

import { useMemo } from 'react';
import { trpc } from '@/lib/api/trpc';
import { FilterType, DateFilterType } from '../types/whatsapp.types';

interface UseWhatsAppConversationsProps {
  searchQuery: string;
  activeFilter: FilterType;
  dateFilter: DateFilterType;
}

export function useWhatsAppConversations({
  searchQuery,
  activeFilter,
  dateFilter,
}: UseWhatsAppConversationsProps) {
  // Queries
  const {
    data: conversations,
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = trpc.whatsapp.conversations.list.useQuery();

  // Derived - filtered conversations
  const filteredConversations = useMemo(() => {
    let result = conversations || [];

    // Apply filter tab
    switch (activeFilter) {
      case 'unread':
        result = result.filter((c) => c.unreadCount > 0);
        break;
      case 'important':
        result = result.filter((c) => c.isImportant === 1);
        break;
      case 'archived':
        result = result.filter((c) => c.isArchived === 1);
        break;
      case 'unnamed':
        result = result.filter((c)=> !c.customerName || c.customerName.trim() === '');
        break;
      case 'unreplied':
        // Conversations where last message was inbound and no outbound reply
        result = result.filter((c) => {
          // Filter conversations with unread messages or recently received messages
          return c.unreadCount > 0 || (c.lastMessage && !c.lastMessage.startsWith('تم الرد'));
        });
        break;
      case 'lab_results':
        result = result.filter((c) => c.labOrderId !== null && c.labOrderId !== undefined);
        break;
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      result = result.filter((c) => {
        if (!c.lastMessageAt) {return false;}
        const lastMsgDate = new Date(c.lastMessageAt);
        switch (dateFilter) {
          case 'today':
            return lastMsgDate >= today;
          case 'week':
            return lastMsgDate >= weekAgo;
          case 'month':
            return lastMsgDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Filter out conversations without messages (empty conversations)
    result = result.filter((c) => c.lastMessage !== null && c.lastMessage !== '');

    // Apply search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerName?.toLowerCase().includes(searchLower) ||
          c.phoneNumber?.includes(searchQuery) ||
          c.lastMessage?.toLowerCase().includes(searchLower)
      );
    }

    // Sort: newest first regardless of read status
    return result.sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [conversations, activeFilter, searchQuery, dateFilter]);

  return {
    conversations,
    filteredConversations,
    conversationsLoading,
    refetchConversations,
  };
}
