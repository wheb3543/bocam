/**
 * useWhatsAppActions - Custom hook لإجراءات المحادثات
 * يتولى العمليات مثل الأرشفة، التعيين كمهمة، الحذف، إلخ
 */

import { useCallback } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { Conversation } from '../types/whatsapp.types';

export function useWhatsAppActions() {
  // Mutations
  const markConversationAsReadMutation = trpc.whatsapp.conversations.markAsRead.useMutation({
    // No refetch needed - SSE stream handles new inbound messages
  });

  const updateConversationMutation = trpc.whatsapp.conversations.update.useMutation({
    onError: () => toast.error('فشل تحديث المحادثة'),
  });

  const assignConversationMutation = trpc.whatsapp.conversations.assignToUser.useMutation({
    onSuccess: () => {
      toast.success('تم تعيين المحادثة');
    },
    onError: () => toast.error('فشل تعيين المحادثة'),
  });

  const bulkArchiveMutation = trpc.whatsapp.conversations.bulkArchive.useMutation({
    onSuccess: () => {
      toast.success('تم أرشفة المحادثات');
    },
    onError: () => toast.error('فشل أرشفة المحادثات'),
  });

  const bulkMarkImportantMutation = trpc.whatsapp.conversations.bulkMarkImportant.useMutation({
    onSuccess: () => {
      toast.success('تم تعيين المحادثات كمهمة');
    },
    onError: () => toast.error('فشل تعيين المحادثات كمهمة'),
  });

  const deleteConversationMutation = trpc.whatsapp.conversations.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف المحادثة');
    },
    onError: (error) => {
      if (error.message?.includes('FORBIDDEN')) {
        toast.error('فشل الحذف: لا تملك الصلاحية الكافية');
      } else {
        toast.error('فشل حذف المحادثة');
      }
    },
  });

  // Handlers
  const handleToggleImportant = useCallback(
    (conversations: Conversation[] | undefined, id: number, refetch: () => void) => {
      const conv = conversations?.find((c) => c.id === id);
      updateConversationMutation.mutate(
        { id, important: conv?.isImportant ? false : true },
        {
          onSuccess: () => {
            toast.success(conv?.isImportant ? 'تم إلغاء التعيين كمهمة' : 'تم تعيين المحادثة كمهمة');
            refetch();
          },
        }
      );
    },
    [updateConversationMutation]
  );

  const handleAssignConversation = useCallback(
    (id: number, userId: number) => {
      assignConversationMutation.mutate({ id, userId });
    },
    [assignConversationMutation]
  );

  const handleArchiveConversation = useCallback(
    (conversations: Conversation[] | undefined, id: number, onConfirm: (action: { action: string; id?: number }) => void) => {
      const conv = conversations?.find((c) => c.id === id);
      onConfirm({ action: conv?.isArchived === 1 ? 'unarchive' : 'archive', id });
    },
    []
  );

  const handleDeleteConversation = useCallback((id: number, onConfirm: (action: { action: string; id?: number }) => void) => {
    onConfirm({ action: 'delete', id });
  }, []);

  const handleBulkArchive = useCallback(
    (selectedConversations: Set<number>, onConfirm: (action: { action: string; ids?: number[] }) => void) => {
      if (selectedConversations.size === 0) {return;}
      const ids = Array.from(selectedConversations);
      onConfirm({ action: 'bulk-archive', ids });
    },
    []
  );

  const handleBulkMarkImportant = useCallback(
    (selectedConversations: Set<number>, onConfirm: (action: { action: string; ids?: number[] }) => void) => {
      if (selectedConversations.size === 0) {return;}
      const ids = Array.from(selectedConversations);
      onConfirm({ action: 'bulk-important', ids });
    },
    []
  );

  const handleConfirmAction = useCallback(
    (
      action: { action: string; id?: number; ids?: number[] } | null,
      refetch: () => void,
      onClearSelection: () => void,
      setIsSelectionMode: (value: boolean) => void
    ) => {
      if (!action) {return;}

      if (action.action === 'archive' && action.id) {
        updateConversationMutation.mutate(
          { id: action.id, archived: true },
          {
            onSuccess: () => {
              toast.success('تم أرشفة المحادثة');
              refetch();
            },
          }
        );
      } else if (action.action === 'unarchive' && action.id) {
        updateConversationMutation.mutate(
          { id: action.id, archived: false },
          {
            onSuccess: () => {
              toast.success('تم إلغاء الأرشفة');
              refetch();
            },
          }
        );
      } else if (action.action === 'bulk-archive' && action.ids) {
        const ids = action.ids;
        bulkArchiveMutation.mutate(
          { ids },
          {
            onSuccess: () => {
              toast.success(`تم أرشفة ${ids.length} محادثة`);
              onClearSelection();
              setIsSelectionMode(false);
              refetch();
            },
          }
        );
      } else if (action.action === 'bulk-important' && action.ids) {
        const ids = action.ids;
        bulkMarkImportantMutation.mutate(
          { ids, important: 1 },
          {
            onSuccess: () => {
              toast.success(`تم تعيين ${ids.length} محادثة كمهمة`);
              onClearSelection();
              setIsSelectionMode(false);
              refetch();
            },
          }
        );
      } else if (action.action === 'delete' && action.id) {
        deleteConversationMutation.mutate(
          { id: action.id },
          {
            onSuccess: () => {
              refetch();
            },
          }
        );
      }
    },
    [
      updateConversationMutation,
      bulkArchiveMutation,
      bulkMarkImportantMutation,
      deleteConversationMutation,
    ]
  );

  const handleSaveNotes = useCallback(
    (selectedConv: Conversation | null, notesValue: string, onClose: () => void) => {
      if (!selectedConv) {return;}

      // Save notes to local storage for now
      const notesData = JSON.parse(localStorage.getItem('conversationNotes') || '{}');
      notesData[selectedConv.id] = notesValue;
      localStorage.setItem('conversationNotes', JSON.stringify(notesData));

      toast.success('تم حفظ الملاحظات بنجاح');
      onClose();
    },
    []
  );

  const handleSaveSearch = useCallback(() => {
    // Feature removed in refactored router
    toast.error('ميزة حفظ البحث غير متوفرة في الإصدار الحالي');
  }, []);

  const handleSendReminder = useCallback(
    async (
      _appointmentId: number,
      _phone: string,
      _patientName: string,
      _doctorName: string,
      _appointmentTime: Date
    ) => {
      // Feature removed in refactored router
      toast.error('ميزة إرسال التذكير غير متوفرة في الإصدار الحالي');
    },
    []
  );

  const handleSendFollowup = useCallback(
    async (
      _appointmentId: number,
      _phone: string,
      _patientName: string,
      _doctorName: string,
      _department: string
    ) => {
      // Feature removed in refactored router
      toast.error('ميزة إرسال المتابعة غير متوفرة في الإصدار الحالي');
    },
    []
  );

  return {
    // Mutations
    markConversationAsReadMutation,
    updateConversationMutation,
    assignConversationMutation,
    bulkArchiveMutation,
    bulkMarkImportantMutation,
    deleteConversationMutation,

    // Handlers
    handleToggleImportant,
    handleAssignConversation,
    handleArchiveConversation,
    handleDeleteConversation,
    handleBulkArchive,
    handleBulkMarkImportant,
    handleConfirmAction,
    handleSaveNotes,
    handleSaveSearch,
    handleSendReminder,
    handleSendFollowup,

    // Flags
    isSavingNotes: updateConversationMutation.isPending,
    isSendingReminder: false,
    isSendingFollowup: false,
  };
}
