/**
 * WhatsAppPage - صفحة إدارة محادثات واتساب
 * تم إعادة هيكللتها لتقليل التعقيد وتحسين قابلية الصيانة
 */

import { useState, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { trpc } from '@/lib/api/trpc';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import useSSE from '@/hooks/integrations/useSSE';
import {
  useWhatsAppSSE,
  AccountUpdateEvent,
  ConversationCostUpdateEvent,
  ContactsReceivedEvent,
  OrderReceivedEvent,
  ReferralReceivedEvent,
  ReactionReceivedEvent,
  TransactionStatusUpdateEvent,
} from '@/hooks/integrations/useWhatsAppSSE';
import ChatWindow from '@/components/ChatWindow';
import ConversationInfo from '@/components/ConversationInfo';
import {
  MessageCircle,
  StickyNote,
  LayoutGrid,
  RefreshCw,
  Smartphone,
  FileText,
  BarChart2,
} from 'lucide-react';
import { FilterType, DateFilterType } from './types/whatsapp.types';
import ConversationList from './components/conversation/ConversationList';
import ChatAreaHeader from './components/shared/ChatAreaHeader';
import EmptyChatPlaceholder from './components/shared/EmptyChatPlaceholder';
import SaveSearchDialog from './components/dialogs/SaveSearchDialog';
import AutoReplyDialog from './components/dialogs/AutoReplyDialog';
import NotesDialog from './components/dialogs/NotesDialog';
import SearchInConversationDialog from './components/dialogs/SearchInConversationDialog';
import ExportConversationDialog from './components/dialogs/ExportConversationDialog';
import ConfirmActionDialog from './components/dialogs/ConfirmActionDialog';
import { useWhatsAppConversations } from './hooks/useWhatsAppConversations';
import { useWhatsAppDialogs } from './hooks/useWhatsAppDialogs';
import { useWhatsAppActions } from './hooks/useWhatsAppActions';
import { useWhatsAppSelection } from './hooks/useWhatsAppSelection';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WhatsAppPage() {
  return (
    <DashboardLayout pageTitle="واتساب" pageDescription="إدارة رسائل واتساب">
      <WhatsAppContent />
    </DashboardLayout>
  );
}

function WhatsAppContent() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [newMessagePhone, setNewMessagePhone] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [newMessageTemplateId, setNewMessageTemplateId] = useState<number | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [secondConversationId, setSecondConversationId] = useState<number | null>(null);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(true);
  const [confirmDialogAction, setConfirmDialogAction] = useState<{
    action: string;
    id?: number;
    ids?: number[];
  } | null>(null);

  // Custom Hooks
  const { conversations, filteredConversations, conversationsLoading, refetchConversations } =
    useWhatsAppConversations({ searchQuery, activeFilter, dateFilter });

  const {
    saveSearchOpen,
    searchName,
    setSearchName,
    handleOpenSaveSearch,
    handleCloseSaveSearch,
    autoReplyDialogOpen,
    handleOpenAutoReply,
    handleCloseAutoReply,
    notesDialogOpen,
    notesValue,
    setNotesValue,
    handleOpenNotes,
    handleCloseNotes,
    searchInConversationOpen,
    searchInConversationTerm,
    setSearchInConversationTerm,
    handleOpenSearchInConversation,
    handleCloseSearchInConversation,
    exportConversationOpen,
    exportFormat,
    setExportFormat,
    handleOpenExportConversation,
    handleCloseExportConversation,
  } = useWhatsAppDialogs();

  const {
    markConversationAsReadMutation,
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
    isSavingNotes,
    isSendingReminder,
    isSendingFollowup,
  } = useWhatsAppActions();

  const {
    selectedConversations,
    isSelectionMode,
    handleToggleSelection,
    handleSelectAll,
    handleClearSelection,
    handleToggleSelectionMode,
  } = useWhatsAppSelection();

  // Additional Queries
  const { data: templates } = trpc.whatsapp.templates.list.useQuery();
  const { data: connectionStatus, isLoading: statusLoading } =
    trpc.whatsapp.connection.status.useQuery(undefined, {
      refetchInterval: 60_000,
      refetchOnWindowFocus: false,
    });
  const { data: activeUsers } = trpc.users.getActiveUsers.useQuery();
  const { data: autoReplyRulesData, refetch: refetchAutoReplyRules } =
    trpc.whatsapp.autoReply.getAutoReplyRules.useQuery();
  const autoReplyRules = autoReplyRulesData?.rules;

  // Mutations for new message
  const sendNewMessageMutation = trpc.whatsapp.messages.send.useMutation({
    onSuccess: () => {
      setNewMessagePhone('');
      setNewMessageText('');
      setNewMessageTemplateId(null);
      setIsNewMessageOpen(false);
    },
  });

  const sendTemplateMutation = trpc.whatsapp.sendTemplate.useMutation({
    onSuccess: () => {
      setNewMessagePhone('');
      setNewMessageText('');
      setNewMessageTemplateId(null);
      setIsNewMessageOpen(false);
    },
  });

  const toggleAutoReplyMutation = trpc.whatsapp.autoReply.toggleAutoReplyRule.useMutation({
    onSuccess: () => {
      refetchAutoReplyRules();
    },
  });

  // Search in Conversation Query
  const { data: searchResults, isLoading: searchLoading } =
    trpc.whatsapp.messages.searchInConversation.useQuery(
      {
        conversationId: selectedConversation || 0,
        searchTerm: searchInConversationTerm,
      },
      {
        enabled:
          searchInConversationOpen && !!selectedConversation && searchInConversationTerm.length > 0,
      }
    );

  // Export Conversation Query
  const { data: exportData, isLoading: exportLoading } =
    trpc.whatsapp.conversations.exportConversation.useQuery(
      {
        conversationId: selectedConversation || 0,
        format: exportFormat,
      },
      {
        enabled: exportConversationOpen && !!selectedConversation,
      }
    );

  // Entity WhatsApp Status Query
  const selectedConv = conversations?.find((c) => c.id === selectedConversation);
  const entityInfo = useMemo(() => {
    if (!selectedConv) {
      return null;
    }
    if (selectedConv.appointmentId) {
      return { entityType: 'appointment' as const, entityId: selectedConv.appointmentId };
    }
    if (selectedConv.offerLeadId) {
      return { entityType: 'offer_lead' as const, entityId: selectedConv.offerLeadId };
    }
    if (selectedConv.campRegistrationId) {
      return {
        entityType: 'camp_registration' as const,
        entityId: selectedConv.campRegistrationId,
      };
    }
    return null;
  }, [selectedConv]);

  const entityStatusQuery = trpc.whatsapp.getEntityWhatsAppStatus.useQuery(
    entityInfo
      ? {
          entityType: entityInfo.entityType,
          entityId: entityInfo.entityId,
        }
      : { entityType: 'appointment', entityId: 0 },
    {
      enabled: !!entityInfo,
    }
  );

  // SSE
  const { user } = useAuth();
  const userId = user?.id || 0;
  useSSE(
    userId ? `/api/whatsapp/stream/user/${userId}` : null,
    useCallback(
      (e: MessageEvent) => {
        try {
          const eventData = e.data ? JSON.parse(String(e.data)) : {};
          if (eventData.type === 'new_inbound_message') {
            refetchConversations();
          }
        } catch {
          // Ignore errors
        }
      },
      [refetchConversations]
    )
  );

  useWhatsAppSSE({
    onAccountUpdate: useCallback(
      (_event: AccountUpdateEvent) => {
        refetchConversations();
      },
      [refetchConversations]
    ),
    onConversationCostUpdate: useCallback(
      (_event: ConversationCostUpdateEvent) => {
        refetchConversations();
      },
      [refetchConversations]
    ),
    onContactsReceived: useCallback(
      (_event: ContactsReceivedEvent) => {
        refetchConversations();
      },
      [refetchConversations]
    ),
    onOrderReceived: useCallback(
      (_event: OrderReceivedEvent) => {
        refetchConversations();
      },
      [refetchConversations]
    ),
    onReferralReceived: useCallback(
      (_event: ReferralReceivedEvent) => {
        refetchConversations();
      },
      [refetchConversations]
    ),
    onReactionReceived: useCallback(
      (_event: ReactionReceivedEvent) => {
        refetchConversations();
      },
      [refetchConversations]
    ),
    onTransactionStatusUpdate: useCallback(
      (_event: TransactionStatusUpdateEvent) => {
        refetchConversations();
      },
      [refetchConversations]
    ),
  });

  // Handlers
  const handleSelectConversation = useCallback(
    (id: number) => {
      setSelectedConversation(id);
      setMobileShowChat(true);
      markConversationAsReadMutation.mutate({ id });
    },
    [markConversationAsReadMutation]
  );

  const handleBackToList = useCallback(() => setMobileShowChat(false), []);

  const handleSendNewMessage = useCallback(() => {
    if (!newMessagePhone.trim()) {
      return;
    }
    if (newMessageTemplateId) {
      const template = templates?.find((t) => t.id === newMessageTemplateId);
      if (!template) {
        return;
      }
      sendTemplateMutation.mutate({
        phone: newMessagePhone,
        templateName: template.metaName || template.name,
        language: template.languageCode || 'ar',
      });
    } else {
      if (!newMessageText.trim()) {
        return;
      }
      if (!selectedConversation) {
        return;
      }
      sendNewMessageMutation.mutate({
        conversationId: selectedConversation,
        message: newMessageText,
      });
    }
  }, [
    newMessagePhone,
    newMessageTemplateId,
    newMessageText,
    templates,
    sendTemplateMutation,
    sendNewMessageMutation,
    selectedConversation,
  ]);

  const handleConversationUpdate = useCallback(
    () => refetchConversations(),
    [refetchConversations]
  );

  const handleExportConversation = useCallback(() => {
    if (exportData?.exportData && exportData?.filename) {
      const blob = new Blob([exportData.exportData], {
        type: exportData.format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      handleCloseExportConversation();
    }
  }, [exportData, handleCloseExportConversation]);

  const isSendingNewMessage = sendNewMessageMutation.isPending || sendTemplateMutation.isPending;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[var(--whatsapp-green-light)] via-white to-[var(--whatsapp-emerald-light)] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
      dir="rtl"
    >
      <div className="container mx-auto p-2 sm:p-4 md:p-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-emerald)] p-1.5 sm:p-2 md:p-3 rounded-xl shadow-lg flex-shrink-0">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-7 md:w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[var(--text-sm)] sm:text-[var(--text-base)] md:text-[var(--text-xl)] lg:text-[var(--text-2xl)] font-bold text-foreground truncate">
                إدارة محادثات واتساب
              </h1>
              <p className="text-[10px] sm:text-[var(--text-xs)] md:text-[var(--text-sm)] text-muted-foreground hidden sm:block">
                تواصل مع العملاء عبر واتساب بيزنس
              </p>
            </div>
            <div className="flex gap-0.5 sm:gap-1 md:gap-2 items-center flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[10px] sm:text-[var(--text-xs)] md:text-[var(--text-sm)] h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2.5"
                onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
              >
                <StickyNote className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden lg:inline">
                  {isDetailsCollapsed ? 'التفاصيل' : 'إخفاء'}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[10px] sm:text-[var(--text-xs)] md:text-[var(--text-sm)] h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2.5"
                onClick={() => setIsSplitView(!isSplitView)}
                disabled={!selectedConversation}
              >
                <LayoutGrid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden lg:inline">{isSplitView ? 'إلغاء التقسيم' : 'تقسيم'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[10px] sm:text-[var(--text-xs)] md:text-[var(--text-sm)] h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2.5"
                onClick={() => refetchConversations()}
              >
                <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden lg:inline">تحديث</span>
              </Button>
              <Link href="/admin/whatsapp/connection">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-[10px] sm:text-[var(--text-xs)] md:text-[var(--text-sm)] h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2.5 hidden sm:flex"
                >
                  <Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden lg:inline">الاتصال</span>
                </Button>
              </Link>
              <Link href="/admin/whatsapp/templates">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-[10px] sm:text-[var(--text-xs)] md:text-[var(--text-sm)] h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2.5 hidden md:flex"
                >
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden lg:inline">القوالب</span>
                </Button>
              </Link>
              <Link href="/admin/whatsapp/analytics">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-[10px] sm:text-[var(--text-xs)] md:text-[var(--text-sm)] h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2.5 hidden md:flex"
                >
                  <BarChart2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden lg:inline">التحليلات</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <SaveSearchDialog
          open={saveSearchOpen}
          onOpenChange={handleCloseSaveSearch}
          searchName={searchName}
          onSearchNameChange={setSearchName}
          searchQuery={searchQuery}
          onSave={handleSaveSearch}
        />

        <AutoReplyDialog
          open={autoReplyDialogOpen}
          onOpenChange={handleCloseAutoReply}
          autoReplyRules={autoReplyRules}
          onToggleRule={(ruleId, enabled) => toggleAutoReplyMutation.mutate({ ruleId, enabled })}
          isPending={toggleAutoReplyMutation.isPending}
        />

        <NotesDialog
          open={notesDialogOpen}
          onOpenChange={handleCloseNotes}
          notesValue={notesValue}
          onNotesValueChange={setNotesValue}
          onSave={() => handleSaveNotes(selectedConv || null, notesValue, handleCloseNotes)}
          isSaving={isSavingNotes}
        />

        <SearchInConversationDialog
          open={searchInConversationOpen}
          onOpenChange={handleCloseSearchInConversation}
          searchTerm={searchInConversationTerm}
          onSearchTermChange={setSearchInConversationTerm}
          searchResults={searchResults}
          searchLoading={searchLoading}
        />

        <ExportConversationDialog
          open={exportConversationOpen}
          onOpenChange={handleCloseExportConversation}
          exportFormat={exportFormat}
          onExportFormatChange={setExportFormat}
          onExport={handleExportConversation}
          isLoading={exportLoading}
        />

        <ConfirmActionDialog
          open={!!confirmDialogAction}
          onOpenChange={(open) => !open && setConfirmDialogAction(null)}
          action={confirmDialogAction}
          onConfirm={() =>
            handleConfirmAction(
              confirmDialogAction,
              refetchConversations,
              handleClearSelection,
              handleToggleSelectionMode
            )
          }
          isPending={false}
        />

        {/* Main Chat Layout */}
        <div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border dark:border-gray-800"
          style={{
            height: 'calc(100vh - 8.75rem)',
            minHeight: '300px',
            maxHeight: 'calc(100vh - 5rem)',
          }}
        >
          {/* Desktop */}
          <div
            className={`hidden lg:grid h-full transition-all duration-300 ${isSplitView ? 'lg:grid-cols-[340px_1fr_1fr]' : isDetailsCollapsed ? 'lg:grid-cols-[340px_1fr_0px]' : 'lg:grid-cols-[340px_1fr_280px]'}`}
          >
            <div className="border-l dark:border-gray-800 h-full overflow-hidden flex flex-col">
              <ConversationList
                filteredConversations={filteredConversations}
                conversationsLoading={conversationsLoading}
                selectedConversation={selectedConversation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectConversation={handleSelectConversation}
                isNewMessageOpen={isNewMessageOpen}
                onNewMessageOpenChange={setIsNewMessageOpen}
                newMessagePhone={newMessagePhone}
                onNewMessagePhoneChange={setNewMessagePhone}
                newMessageText={newMessageText}
                onNewMessageTextChange={setNewMessageText}
                newMessageTemplateId={newMessageTemplateId}
                onNewMessageTemplateIdChange={setNewMessageTemplateId}
                templates={templates}
                onSendNewMessage={handleSendNewMessage}
                isSendingNewMessage={isSendingNewMessage}
                connectionStatus={connectionStatus}
                statusLoading={statusLoading}
                allConversations={conversations}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                onArchiveConversation={(id) =>
                  handleArchiveConversation(conversations, id, setConfirmDialogAction)
                }
                onToggleImportant={(id) =>
                  handleToggleImportant(conversations, id, refetchConversations)
                }
                onAssignConversation={handleAssignConversation}
                activeUsers={activeUsers}
                onSaveSearchClick={handleOpenSaveSearch}
                isSelectionMode={isSelectionMode}
                selectedConversations={selectedConversations}
                onToggleSelection={handleToggleSelection}
                onSelectAll={() => handleSelectAll(filteredConversations)}
                onClearSelection={handleClearSelection}
                onBulkArchive={() =>
                  handleBulkArchive(selectedConversations, setConfirmDialogAction)
                }
                onBulkMarkImportant={() =>
                  handleBulkMarkImportant(selectedConversations, setConfirmDialogAction)
                }
                onToggleSelectionMode={handleToggleSelectionMode}
              />
            </div>
            <div className="h-full overflow-hidden flex flex-col border-l dark:border-gray-800">
              {selectedConversation ? (
                <>
                  <ChatAreaHeader
                    selectedConv={selectedConv}
                    onBackToList={handleBackToList}
                    onToggleImportant={(id) =>
                      handleToggleImportant(conversations, id, refetchConversations)
                    }
                    onAutoReplyClick={handleOpenAutoReply}
                    onOpenNotes={(id) => {
                      const conv = conversations?.find((c) => c.id === id);
                      if (conv) {
                        handleOpenNotes(conv.notes || '');
                      }
                    }}
                    onDeleteConversation={(id) =>
                      handleDeleteConversation(id, setConfirmDialogAction)
                    }
                    onOpenSearchInConversation={handleOpenSearchInConversation}
                    onOpenExportConversation={handleOpenExportConversation}
                  />
                  <div className="flex-1 overflow-hidden">
                    <ChatWindow
                      conversationId={selectedConversation}
                      lastMessageAt={selectedConv?.lastMessageAt}
                      onConversationUpdate={handleConversationUpdate}
                      phone={selectedConv?.phoneNumber}
                    />
                  </div>
                </>
              ) : (
                <EmptyChatPlaceholder />
              )}
            </div>
            {isSplitView ? (
              <div className="h-full overflow-hidden flex flex-col">
                {secondConversationId ? (
                  <>
                    <ChatAreaHeader
                      selectedConv={conversations?.find((c) => c.id === secondConversationId)}
                      onBackToList={() => setSecondConversationId(null)}
                      onToggleImportant={(id) =>
                        handleToggleImportant(conversations, id, refetchConversations)
                      }
                      onAutoReplyClick={handleOpenAutoReply}
                      onOpenNotes={(id) => {
                        const conv = conversations?.find((c) => c.id === id);
                        if (conv) {
                          handleOpenNotes(conv.notes || '');
                        }
                      }}
                      onDeleteConversation={(id) =>
                        handleDeleteConversation(id, setConfirmDialogAction)
                      }
                      onOpenSearchInConversation={handleOpenSearchInConversation}
                      onOpenExportConversation={handleOpenExportConversation}
                    />
                    <div className="flex-1 overflow-hidden">
                      <ChatWindow
                        conversationId={secondConversationId}
                        lastMessageAt={
                          conversations?.find((c) => c.id === secondConversationId)?.lastMessageAt
                        }
                        onConversationUpdate={handleConversationUpdate}
                        phone={
                          conversations?.find((c) => c.id === secondConversationId)?.phoneNumber
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm flex items-center justify-center h-full">
                    اختر محادثة ثانية من القائمة
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`h-full overflow-y-auto border-l dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 ${isDetailsCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}
              >
                {selectedConv ? (
                  <ConversationInfo
                    conversation={selectedConv}
                    onConversationUpdate={handleConversationUpdate}
                    onSendReminder={handleSendReminder}
                    onSendFollowup={handleSendFollowup}
                    entityWhatsAppStatus={entityStatusQuery.data as typeof entityStatusQuery.data}
                    isSendingReminder={isSendingReminder}
                    isSendingFollowup={isSendingFollowup}
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    اختر محادثة لعرض التفاصيل
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="lg:hidden h-full flex flex-col">
            {mobileShowChat && selectedConversation ? (
              <>
                <ChatAreaHeader
                  selectedConv={selectedConv}
                  onBackToList={handleBackToList}
                  onToggleImportant={(id) =>
                    handleToggleImportant(conversations, id, refetchConversations)
                  }
                  onAutoReplyClick={handleOpenAutoReply}
                  onOpenNotes={(id) => {
                    const conv = conversations?.find((c) => c.id === id);
                    handleOpenNotes(conv?.notes || '');
                  }}
                  onDeleteConversation={(id) =>
                    handleDeleteConversation(id, setConfirmDialogAction)
                  }
                  onOpenSearchInConversation={handleOpenSearchInConversation}
                  onOpenExportConversation={handleOpenExportConversation}
                />
                <div className="flex-1 overflow-hidden">
                  <ChatWindow
                    conversationId={selectedConversation}
                    lastMessageAt={selectedConv?.lastMessageAt}
                    onConversationUpdate={handleConversationUpdate}
                    phone={selectedConv?.phoneNumber}
                  />
                </div>
              </>
            ) : (
              <ConversationList
                filteredConversations={filteredConversations}
                conversationsLoading={conversationsLoading}
                selectedConversation={selectedConversation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectConversation={handleSelectConversation}
                isNewMessageOpen={isNewMessageOpen}
                onNewMessageOpenChange={setIsNewMessageOpen}
                newMessagePhone={newMessagePhone}
                onNewMessagePhoneChange={setNewMessagePhone}
                newMessageText={newMessageText}
                onNewMessageTextChange={setNewMessageText}
                newMessageTemplateId={newMessageTemplateId}
                onNewMessageTemplateIdChange={setNewMessageTemplateId}
                templates={templates}
                onSendNewMessage={handleSendNewMessage}
                isSendingNewMessage={isSendingNewMessage}
                connectionStatus={connectionStatus}
                statusLoading={statusLoading}
                allConversations={conversations}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                onArchiveConversation={(id) =>
                  handleArchiveConversation(conversations, id, setConfirmDialogAction)
                }
                onToggleImportant={(id) =>
                  handleToggleImportant(conversations, id, refetchConversations)
                }
                onAssignConversation={handleAssignConversation}
                activeUsers={activeUsers}
                onSaveSearchClick={handleOpenSaveSearch}
                isSelectionMode={isSelectionMode}
                selectedConversations={selectedConversations}
                onToggleSelection={handleToggleSelection}
                onSelectAll={() => handleSelectAll(filteredConversations)}
                onClearSelection={handleClearSelection}
                onBulkArchive={() =>
                  handleBulkArchive(selectedConversations, setConfirmDialogAction)
                }
                onBulkMarkImportant={() =>
                  handleBulkMarkImportant(selectedConversations, setConfirmDialogAction)
                }
                onToggleSelectionMode={handleToggleSelectionMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
