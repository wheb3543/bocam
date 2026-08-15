/**
 * useWhatsAppSelection - Custom hook لإدارة التحديد المتعدد
 * يتولى حالة التحديد المتعدد للمحادثات
 */

import { useState, useCallback } from 'react';

export function useWhatsAppSelection() {
  const [selectedConversations, setSelectedConversations] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleToggleSelection = useCallback((id: number) => {
    setSelectedConversations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((filteredConversations: { id: number }[] | undefined) => {
    if (filteredConversations) {
      const allIds = new Set(filteredConversations.map((c) => c.id));
      setSelectedConversations(allIds);
    }
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedConversations(new Set());
  }, []);

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    setSelectedConversations(new Set());
  }, []);

  return {
    selectedConversations,
    isSelectionMode,
    handleToggleSelection,
    handleSelectAll,
    handleClearSelection,
    handleToggleSelectionMode,
  };
}
