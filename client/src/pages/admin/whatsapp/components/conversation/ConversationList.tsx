/**
 * ConversationList - قائمة المحادثات
 * يجمع جميع المكونات الفرعية لعرض قائمة المحادثات
 */

import { memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Plus, Send, LoaderIcon, Wifi, WifiOff, CheckSquare, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { processPhoneInput } from '@/hooks/form/usePhoneFormat';
import { Conversation, Template, ConnectionStatus, WhatsAppUser, FilterType, DateFilterType } from '../../types/whatsapp.types';
import StatsBar from '../shared/StatsBar';
import ConversationFilters from './ConversationFilters';
import ConversationSearchBar from './ConversationSearchBar';
import BulkActionsToolbar from './BulkActionsToolbar';
import ConversationItem from './ConversationItem';

interface ConversationListProps {
  filteredConversations: Conversation[] | undefined;
  conversationsLoading: boolean;
  selectedConversation: number | null;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onSelectConversation: (id: number) => void;
  isNewMessageOpen: boolean;
  onNewMessageOpenChange: (v: boolean) => void;
  newMessagePhone: string;
  onNewMessagePhoneChange: (v: string) => void;
  newMessageText: string;
  onNewMessageTextChange: (v: string) => void;
  newMessageTemplateId: number | null;
  onNewMessageTemplateIdChange: (v: number | null) => void;
  templates: Template[] | undefined;
  onSendNewMessage: () => void;
  isSendingNewMessage: boolean;
  connectionStatus: ConnectionStatus | undefined;
  statusLoading: boolean;
  allConversations: Conversation[] | undefined;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  dateFilter: DateFilterType;
  onDateFilterChange: (filter: DateFilterType) => void;
  onArchiveConversation: (id: number) => void;
  onToggleImportant: (id: number) => void;
  onAssignConversation: (id: number, userId: number) => void;
  activeUsers: WhatsAppUser[] | undefined;
  onSaveSearchClick: () => void;
  isSelectionMode: boolean;
  selectedConversations: Set<number>;
  onToggleSelection: (id: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkArchive: () => void;
  onBulkMarkImportant: () => void;
  onToggleSelectionMode: () => void;
}

const ConversationList = memo(function ConversationList({
  filteredConversations,
  conversationsLoading,
  selectedConversation,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  isNewMessageOpen,
  onNewMessageOpenChange,
  newMessagePhone,
  onNewMessagePhoneChange,
  newMessageText,
  onNewMessageTextChange,
  newMessageTemplateId,
  onNewMessageTemplateIdChange,
  templates,
  onSendNewMessage,
  isSendingNewMessage,
  connectionStatus,
  statusLoading,
  allConversations,
  activeFilter,
  onFilterChange,
  dateFilter,
  onDateFilterChange,
  onArchiveConversation,
  onToggleImportant,
  onAssignConversation,
  activeUsers,
  onSaveSearchClick,
  isSelectionMode,
  selectedConversations,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onBulkArchive,
  onBulkMarkImportant,
  onToggleSelectionMode,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b dark:border-gray-800 bg-gradient-to-r from-[var(--whatsapp-green)] to-[var(--whatsapp-emerald)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            <h2 className="text-[var(--text-sm)] sm:text-[var(--text-base)] font-bold text-white">
              المحادثات
            </h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-2 gap-1 text-[var(--text-xs)] bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={onToggleSelectionMode}
              aria-label={isSelectionMode ? 'إلغاء وضع التحديد' : 'تفعيل وضع التحديد'}
              title={isSelectionMode ? 'إلغاء وضع التحديد' : 'تفعيل وضع التحديد'}
            >
              <CheckSquare className="h-3 w-3" />
              <span className="hidden sm:inline">{isSelectionMode ? 'إلغاء' : 'تحديد'}</span>
            </Button>
            {statusLoading ? (
              <Badge className="gap-1 text-[var(--text-xs)] h-5 bg-white/20 text-white border-0">
                <LoaderIcon className="h-2.5 w-2.5 animate-spin" />
              </Badge>
            ) : connectionStatus?.isReady ? (
              <Badge className="bg-white/20 text-white border-0 gap-1 text-[var(--text-xs)] h-5">
                <Wifi className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">متصل</span>
              </Badge>
            ) : (
              <Badge className="bg-red-500/80 text-white border-0 gap-1 text-[var(--text-xs)] h-5">
                <WifiOff className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">غير متصل</span>
              </Badge>
            )}
            <Dialog open={isNewMessageOpen} onOpenChange={onNewMessageOpenChange}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2 gap-1 text-[var(--text-xs)] bg-white/20 hover:bg-white/30 text-white border-0"
                  aria-label="إرسال رسالة جديدة"
                  title="إرسال رسالة جديدة"
                >
                  <Plus className="h-3 w-3" />
                  <span className="hidden sm:inline">جديد</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إرسال رسالة جديدة</DialogTitle>
                  <DialogDescription>أرسل رسالة مباشرة لرقم هاتف</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label>رقم الهاتف</Label>
                    <Input
                      placeholder="7XXXXXXXX"
                      value={newMessagePhone}
                      onChange={(e) => onNewMessagePhoneChange(processPhoneInput(e.target.value))}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      قالب الرسالة
                      <span className="text-[var(--text-xs)] text-muted-foreground font-normal">
                        (مطلوب للمحادثات الجديدة)
                      </span>
                    </Label>
                    <Select
                      value={newMessageTemplateId ? String(newMessageTemplateId) : 'none'}
                      onValueChange={(v) =>
                        onNewMessageTemplateIdChange(v === 'none' ? null : Number(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر قالباً أو اكتب رسالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون قالب (للمحادثات النشطة فقط)</SelectItem>
                        {templates?.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newMessageTemplateId && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span>سيتم إرسال القالب المحدد — تأكد من أن القالب معتمد من Meta</span>
                      </div>
                    )}
                  </div>
                  {!newMessageTemplateId && (
                    <div className="space-y-1.5">
                      <Label>الرسالة</Label>
                      <Textarea
                        placeholder="اكتب رسالتك هنا..."
                        value={newMessageText}
                        onChange={(e) => onNewMessageTextChange(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={onSendNewMessage}
                    disabled={
                      isSendingNewMessage ||
                      !newMessagePhone.trim() ||
                      (!newMessageTemplateId && !newMessageText.trim())
                    }
                    className="bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-green-dark)]"
                  >
                    {isSendingNewMessage ? (
                      <LoaderIcon className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Send className="h-4 w-4 ml-2" />
                    )}
                    إرسال
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Search */}
        <ConversationSearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSaveSearchClick={onSaveSearchClick}
        />
      </div>

      {/* Filters */}
      <ConversationFilters
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        dateFilter={dateFilter}
        onDateFilterChange={onDateFilterChange}
        allConversations={allConversations}
      />

      {/* Stats */}
      <div className="px-2 pt-2">
        <StatsBar conversations={allConversations} />
      </div>

      {/* Bulk Actions */}
      <BulkActionsToolbar
        isSelectionMode={isSelectionMode}
        selectedCount={selectedConversations.size}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
        onBulkMarkImportant={onBulkMarkImportant}
        onBulkArchive={onBulkArchive}
      />

      {/* List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <LoaderIcon className="h-8 w-8 animate-spin mx-auto mb-2 text-[var(--whatsapp-green)]" />
              <p className="text-[var(--text-sm)]">جاري تحميل المحادثات...</p>
            </div>
          ) : filteredConversations && filteredConversations.length > 0 ? (
            <div className="divide-y dark:divide-gray-800">
              {filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isSelected={selectedConversation === conv.id}
                  isSelectionMode={isSelectionMode}
                  isSelectionSelected={selectedConversations.has(conv.id)}
                  activeFilter={activeFilter}
                  _selectedConversations={selectedConversations}
                  onClick={() => {
                    if (isSelectionMode) {
                      onToggleSelection(conv.id);
                    } else {
                      onSelectConversation(conv.id);
                    }
                  }}
                  onToggleSelection={onToggleSelection}
                  onToggleImportant={onToggleImportant}
                  onArchiveConversation={onArchiveConversation}
                  onAssignConversation={onAssignConversation}
                  activeUsers={activeUsers}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-[var(--text-sm)] sm:text-[var(--text-base)]">
                {searchQuery ? `لا نتائج لـ "${searchQuery}"` : 'لا توجد محادثات'}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-[var(--text-sm)]"
                  onClick={() => onSearchChange('')}
                >
                  مسح البحث
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export default ConversationList;
