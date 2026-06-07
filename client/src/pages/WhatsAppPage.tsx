import { memo, useCallback, useState, useMemo } from "react";
import { processPhoneInput } from "@/hooks/usePhoneFormat";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle, Send, Search, Plus, FileText, User, Phone,
  Smartphone, Wifi, WifiOff, Loader2 as LoaderIcon, ArrowRight,
  ChevronLeft, ChevronRight, AlertCircle, Archive, Filter, BarChart2,
  Clock, CheckCheck, MessageSquare, MoreVertical, Star,
  RefreshCw, TrendingUp, Users, X, Bookmark, CheckSquare, LayoutGrid,
  StickyNote, Trash2, Download,
} from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import ConversationInfo from "@/components/ConversationInfo";
import useSSE from "@/hooks/useSSE";
import { useWhatsAppSSE, AccountUpdateEvent, ConversationCostUpdateEvent, ContactsReceivedEvent, OrderReceivedEvent, ReferralReceivedEvent, ReactionReceivedEvent, TransactionStatusUpdateEvent } from "@/hooks/useWhatsAppSSE";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Conversation {
  id: number;
  customerName?: string | null;
  phoneNumber: string;
  lastMessage?: string | null;
  lastMessageAt?: string | Date | null;
  unreadCount: number;
  isImportant?: number;
  isArchived?: number;
  assignedToUserId?: number | null;
  notes?: string | null;
  appointmentId?: number | null;
  leadId?: number | null;
  offerLeadId?: number | null;
  campRegistrationId?: number | null;
  labOrderId?: number | null;
}

interface User {
  id: number;
  name: string | null;
  username: string;
}

interface Template {
  id: number;
  name: string;
  content: string;
  category: string;
  variables?: string | null;
  isActive: number;
  metaName?: string | null;
  languageCode?: string | null;
}

type FilterType = "all" | "unread" | "important" | "archived" | "unnamed" | "unreplied" | "lab_results";

// Helper function to get time elapsed color
function getTimeElapsedColor(lastMessageAt: string | Date | null): string {
  if (!lastMessageAt) return "text-[var(--whatsapp-gray)]";
  const hours = (Date.now() - new Date(lastMessageAt).getTime()) / (1000 * 60 * 60);
  if (hours < 1) return "text-[var(--whatsapp-green)]";
  if (hours < 24) return "text-[var(--whatsapp-blue)]";
  if (hours < 168) return "text-[var(--whatsapp-orange)]"; // 7 days
  return "text-red-600";
}

// Helper function to get time elapsed text
function getTimeElapsedText(lastMessageAt: string | Date | null): string {
  if (!lastMessageAt) return "";
  const hours = (Date.now() - new Date(lastMessageAt).getTime()) / (1000 * 60 * 60);
  if (hours < 1) return "أقل من ساعة";
  if (hours < 24) return `${Math.floor(hours)} ساعة`;
  if (hours < 168) return `${Math.floor(hours / 24)} يوم`;
  return `${Math.floor(hours / 168)} أسبوع`;
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
interface StatsBarProps {
  conversations: Conversation[] | undefined;
}

const StatsBar = memo(function StatsBar({ conversations }: StatsBarProps) {
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const total = safeConversations.length;
  const unread = safeConversations.filter(c => c.unreadCount > 0).length;
  const important = safeConversations.filter(c => c.isImportant === 1).length;
  const archived = safeConversations.filter(c => c.isArchived === 1).length;
  const labResults = safeConversations.filter(c => c.labOrderId !== null && c.labOrderId !== undefined).length;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const active = safeConversations.filter(c =>
    !c.isArchived &&
    c.lastMessageAt &&
    new Date(c.lastMessageAt) >= sevenDaysAgo
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
      {[
        { label: "الكل", value: total, icon: MessageSquare, color: "text-[var(--whatsapp-blue)]", bg: "bg-[var(--whatsapp-blue)]/10 dark:bg-[var(--whatsapp-blue)]/20" },
        { label: "نشطة", value: active, icon: Users, color: "text-[var(--whatsapp-green)]", bg: "bg-[var(--whatsapp-green)]/10 dark:bg-[var(--whatsapp-green)]/20" },
        { label: "غير مقروءة", value: unread, icon: MessageCircle, color: "text-[var(--whatsapp-orange)]", bg: "bg-[var(--whatsapp-orange)]/10 dark:bg-[var(--whatsapp-orange)]/20" },
        { label: "نتائج مختبر", value: labResults, icon: FileText, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/20" },
        { label: "مهمة", value: important, icon: Star, color: "text-[var(--whatsapp-yellow)]", bg: "bg-[var(--whatsapp-yellow)]/10 dark:bg-[var(--whatsapp-yellow)]/20" },
      ].map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className={`${bg} rounded-lg p-2 sm:p-3 text-center`}>
          <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${color} mx-auto mb-0.5`} />
          <p className={`text-sm sm:text-base font-bold ${color}`}>{value}</p>
          <p className="text-[var(--text-xs)] text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
});

// ─── ConversationsList ────────────────────────────────────────────────────────
interface ConversationsListProps {
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
  connectionStatus: any;
  statusLoading: boolean;
  allConversations: Conversation[] | undefined;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  dateFilter: "all" | "today" | "week" | "month";
  onDateFilterChange: (filter: "all" | "today" | "week" | "month") => void;
  onArchiveConversation: (id: number) => void;
  onToggleImportant: (id: number) => void;
  onAssignConversation: (id: number, userId: number) => void;
  activeUsers: User[] | undefined;
  onSaveSearchClick: () => void;
  isSelectionMode: boolean;
  selectedConversations: Set<number>;
  onToggleSelection: (id: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkArchive: () => void;
  onBulkMarkImportant: () => void;
  onToggleSelectionMode: () => void;
  isSplitView: boolean;
  secondConversationId: number | null;
  onSelectSecondConversation: (id: number) => void;
  savedSearches: any[] | undefined;
  onApplySavedSearch: (savedSearch: any) => void;
  onDeleteConversation: (id: number) => void;
}

const ConversationsList = memo(function ConversationsList({
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
  isSplitView,
  secondConversationId,
  onSelectSecondConversation,
  savedSearches,
  onApplySavedSearch,
  onDeleteConversation,
}: ConversationsListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b dark:border-gray-800 bg-gradient-to-r from-[var(--whatsapp-green)] to-[var(--whatsapp-emerald)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            <h2 className="text-[var(--text-sm)] sm:text-[var(--text-base)] font-bold text-white">المحادثات</h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-2 gap-1 text-[var(--text-xs)] bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={onToggleSelectionMode}
              aria-label={isSelectionMode ? "إلغاء وضع التحديد" : "تفعيل وضع التحديد"}
              title={isSelectionMode ? "إلغاء وضع التحديد" : "تفعيل وضع التحديد"}
            >
              <CheckSquare className="h-3 w-3" />
              <span className="hidden sm:inline">{isSelectionMode ? "إلغاء" : "تحديد"}</span>
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
                <Button size="sm" variant="secondary" className="h-7 px-2 gap-1 text-[var(--text-xs)] bg-white/20 hover:bg-white/30 text-white border-0" aria-label="إرسال رسالة جديدة" title="إرسال رسالة جديدة">
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
                      <span className="text-[var(--text-xs)] text-muted-foreground font-normal">(مطلوب للمحادثات الجديدة)</span>
                    </Label>
                    <Select
                      value={newMessageTemplateId ? String(newMessageTemplateId) : "none"}
                      onValueChange={(v) => onNewMessageTemplateIdChange(v === "none" ? null : Number(v))}
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
                    disabled={isSendingNewMessage || !newMessagePhone.trim() || (!newMessageTemplateId && !newMessageText.trim())}
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
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
          <Input
            placeholder="بحث بالاسم أو الرقم..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-8 h-8 text-[var(--text-sm)] bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
            aria-label="بحث في المحادثات"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {searchQuery && onSaveSearchClick && (
            <button
              onClick={onSaveSearchClick}
              className="absolute left-8 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              title="حفظ البحث"
            >
              <Bookmark className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-2 pt-2 pb-1 border-b dark:border-gray-800">
        <Tabs value={activeFilter} onValueChange={(v) => onFilterChange(v as FilterType)}>
          <TabsList className="h-7 w-full grid grid-cols-3 sm:grid-cols-7 bg-muted/50">
            <TabsTrigger value="all" className="text-[var(--text-xs)] h-6 px-1 text-xs">الكل</TabsTrigger>
            <TabsTrigger value="unread" className="text-[var(--text-xs)] h-6 px-1 text-xs">
              غير مقروءة
              {(() => {
                const unreadCount = Array.isArray(allConversations) ? allConversations.filter(c => c.unreadCount > 0).length : 0;
                return unreadCount > 0 ? (
                  <Badge variant="destructive" className="mr-1 h-3.5 px-1 text-[var(--text-xs)] rounded-full">
                    {unreadCount}
                  </Badge>
                ) : null;
              })()}
            </TabsTrigger>
            <TabsTrigger value="important" className="text-[var(--text-xs)] h-6 px-1 text-xs">مهمة</TabsTrigger>
            <TabsTrigger value="lab_results" className="text-[var(--text-xs)] h-6 px-1 text-xs sm:inline">نتائج مختبر</TabsTrigger>
            <TabsTrigger value="archived" className="text-[var(--text-xs)] h-6 px-1 text-xs sm:inline">مؤرشفة</TabsTrigger>
            <TabsTrigger value="unnamed" className="text-[var(--text-xs)] h-6 px-1 text-xs sm:inline">بدون اسم</TabsTrigger>
            <TabsTrigger value="unreplied" className="text-[var(--text-xs)] h-6 px-1 text-xs sm:inline">لم يُرد</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Advanced Filters */}
      <div className="px-2 pt-1 pb-1 flex gap-2 items-center">
          <Select value={dateFilter} onValueChange={(v) => onDateFilterChange(v as "all" | "today" | "week" | "month")}>
            <SelectTrigger className="h-6 text-[var(--text-xs)] bg-white/10 border-0 text-white">
              <SelectValue />
            </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التواريخ</SelectItem>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">آخر أسبوع</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="px-2 pt-2">
        <StatsBar conversations={allConversations} />
      </div>

      {/* Bulk Actions Toolbar */}
      {isSelectionMode && selectedConversations.size > 0 && (
        <div className="px-2 pt-2 pb-1 flex gap-2 items-center bg-white/10">
          <span className="text-[var(--text-sm)] text-white font-medium">
            تم تحديد {selectedConversations.size}
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-[var(--text-xs)] bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={onSelectAll}
          >
            تحديد الكل
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-[var(--text-xs)] bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={onClearSelection}
          >
            إلغاء التحديد
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-[var(--text-xs)] bg-amber-500/80 hover:bg-amber-500 text-white border-0"
            onClick={onBulkMarkImportant}
          >
            <Star className="h-3 w-3 ml-1" />
            مهمة
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-[var(--text-xs)] bg-gray-500/80 hover:bg-gray-500 text-white border-0"
            onClick={onBulkArchive}
          >
            <Archive className="h-3 w-3 ml-1" />
            أرشفة
          </Button>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches && savedSearches.length > 0 && (
        <div className="px-2 pt-1 pb-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-[var(--text-sm)] text-white/80 hover:text-white hover:bg-white/10 w-full justify-start gap-2" aria-label="عرض البحثات المحفوظة">
                <Bookmark className="h-3 w-3" />
                البحثات المحفوظة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {savedSearches.map((search: any) => (
                <DropdownMenuItem
                  key={search.id}
                  onClick={() => onApplySavedSearch?.(search)}
                  className="flex flex-col items-start gap-1 py-2"
                >
                  <span className="font-medium text-[var(--text-sm)]">{search.name}</span>
                  <span className="text-[var(--text-xs)] text-muted-foreground line-clamp-1">{search.searchQuery || search.query}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

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
              {filteredConversations.map((conv, index) => (
                <div
                  key={conv.id}
                  className={`group relative p-3 sm:p-4 cursor-pointer transition-colors hover:bg-[var(--whatsapp-green-light)] dark:hover:bg-[var(--whatsapp-green-dark)]/20 active:bg-[var(--whatsapp-green)]/20 ${
                    selectedConversation === conv.id ? "bg-[var(--whatsapp-green)]/20 dark:bg-[var(--whatsapp-green-dark)]/30 border-r-4 border-[var(--whatsapp-green)]" : ""
                  } ${conv.isArchived ? "opacity-60" : ""}`}
                  onClick={() => {
                    if (isSelectionMode) {
                      onToggleSelection(conv.id);
                    } else {
                      onSelectConversation(conv.id);
                    }
                  }}
                  role="button"
                  aria-selected={selectedConversation === conv.id}
                  aria-label={`محادثة ${conv.customerName || 'بدون اسم'} - ${conv.phoneNumber}`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {isSelectionMode && (
                      <div
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelection(conv.id);
                        }}
                        role="checkbox"
                        aria-checked={selectedConversations.has(conv.id)}
                        aria-label={`تحديد المحادثة ${conv.customerName || 'بدون اسم'}`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedConversations.has(conv.id)
                            ? "bg-[var(--whatsapp-green)] border-[var(--whatsapp-green)]"
                            : "border-gray-300 dark:border-gray-600"
                        }`}>
                          {selectedConversations.has(conv.id) && (
                            <CheckSquare className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    )}
                    <div className={`relative p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                      conv.isImportant ? "bg-gradient-to-br from-[var(--whatsapp-yellow)] to-[var(--whatsapp-orange)]" : "bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-emerald)]"
                    }`}>
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      {conv.isImportant === 1 && (
                        <Star className="absolute -top-1 -left-1 h-3 w-3 text-[var(--whatsapp-yellow)] fill-[var(--whatsapp-yellow)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                          {conv.customerName || "عميل جديد"}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {conv.unreadCount > 0 && activeFilter !== 'all' && (
                            <Badge variant="destructive" className="rounded-full px-1.5 text-[10px] sm:text-xs h-4 sm:h-5">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-0.5">
                        <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                        <span dir="ltr" className="truncate text-[10px] sm:text-xs">{conv.phoneNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[140px]">
                          {conv.lastMessage || "لا توجد رسائل"}
                        </p>
                        <div className="flex items-center gap-1">
                          {conv.labOrderId && (
                            <Badge variant="outline" className="text-[8px] sm:text-[9px] h-4 sm:h-5 px-1 bg-[var(--whatsapp-blue)]/10 border-[var(--whatsapp-blue)]/30 text-[var(--whatsapp-blue)]">
                              #{conv.labOrderId}
                            </Badge>
                          )}
                          <div className={`w-1.5 h-1.5 rounded-full ${getTimeElapsedColor(conv.lastMessageAt || null)}`} />
                          <p className={`text-[10px] sm:text-xs flex-shrink-0 ${getTimeElapsedColor(conv.lastMessageAt || null)}`}>
                            {getTimeElapsedText(conv.lastMessageAt || null)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground lg:hidden flex-shrink-0" />
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="خيارات إضافية">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem onClick={() => onToggleImportant(conv.id)} aria-label={conv.isImportant ? "إلغاء تعيين المحادثة كمهمة" : "تعيين المحادثة كمهمة"}>
                          <Star className="h-3.5 w-3.5 ml-2" />
                          {conv.isImportant ? "إلغاء المهمة" : "تعيين كمهمة"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onArchiveConversation(conv.id)} aria-label={conv.isArchived ? "إلغاء أرشفة المحادثة" : "أرشفة المحادثة"}>
                          <Archive className="h-3.5 w-3.5 ml-2" />
                          {conv.isArchived ? "إلغاء الأرشفة" : "أرشفة"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} aria-label="تعيين المحادثة لمستخدم">
                              <User className="h-3.5 w-3.5 ml-2" />
                              تعيين لمستخدم
                              <ChevronRight className="h-3 w-3 ml-auto" />
                            </DropdownMenuItem>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-40">
                            {activeUsers?.map((user) => (
                              <DropdownMenuItem
                                key={user.id}
                                onClick={() => onAssignConversation(conv.id, user.id)}
                                aria-label={`تعيين المحادثة إلى ${user.name}`}
                              >
                                <User className="h-3.5 w-3.5 ml-2" />
                                {user.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Assigned User Badge */}
                  {conv.assignedToUserId && (
                    <div className="absolute left-2 bottom-2">
                      <Badge variant="outline" className="text-[8px] h-4 px-1 bg-[var(--whatsapp-blue)]/10 border-[var(--whatsapp-blue)]/20">
                        <User className="h-2 w-2 mr-0.5" />
                        معين
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-[var(--text-sm)] sm:text-[var(--text-base)]">
                {searchQuery ? `لا نتائج لـ "${searchQuery}"` : "لا توجد محادثات"}
              </p>
              {searchQuery && (
                <Button variant="ghost" size="sm" className="mt-2 text-[var(--text-sm)]" onClick={() => onSearchChange("")}>
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

// ─── ChatAreaHeader ───────────────────────────────────────────────────────────
interface ChatAreaHeaderProps {
  selectedConv: Conversation | undefined;
  onBackToList: () => void;
  onToggleImportant: (id: number) => void;
  onAutoReplyClick?: () => void;
  onOpenNotes?: (id: number) => void;
  onDeleteConversation?: (id: number) => void;
  onOpenSearchInConversation?: () => void;
  onOpenExportConversation?: () => void;
}

const ChatAreaHeader = memo(function ChatAreaHeader({ selectedConv, onBackToList, onToggleImportant, onAutoReplyClick, onOpenNotes, onDeleteConversation, onOpenSearchInConversation, onOpenExportConversation }: ChatAreaHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[var(--whatsapp-green)] to-[var(--whatsapp-emerald)] text-white p-3 sm:p-4 flex-shrink-0">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onBackToList}
          className="lg:hidden p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="العودة إلى قائمة المحادثات"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="bg-white/20 p-1.5 sm:p-2 rounded-full flex-shrink-0">
          <User className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[var(--text-sm)] sm:text-[var(--text-lg)] font-bold truncate">
            {selectedConv?.customerName || "عميل جديد"}
          </h2>
          <p className="text-white/80 text-[var(--text-xs)] sm:text-[var(--text-sm)]" dir="ltr">
            {selectedConv?.phoneNumber}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {selectedConv && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 hover:bg-white/20 ${selectedConv.isImportant ? "text-yellow-300" : "text-white/70"}`}
              onClick={() => selectedConv && onToggleImportant(selectedConv.id)}
              aria-label={selectedConv.isImportant ? "إلغاء تعيين المحادثة كمهمة" : "تعيين المحادثة كمهمة"}
              title={selectedConv.isImportant ? "إلغاء التعيين كمهمة" : "تعيين كمهمة"}
            >
              <Star className={`h-4 w-4 ${selectedConv.isImportant ? "fill-yellow-300" : ""}`} />
            </Button>
          )}
          {selectedConv && onOpenNotes && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-white/20 text-white/70"
              onClick={() => selectedConv && onOpenNotes(selectedConv.id)}
              aria-label="عرض ملاحظات المحادثة"
              title="ملاحظات المحادثة"
            >
              <StickyNote className="h-4 w-4" />
            </Button>
          )}
          {selectedConv && onAutoReplyClick && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-white/20 text-white/70"
              onClick={onAutoReplyClick}
              aria-label="قواعد الرد التلقائي"
              title="قواعد الرد التلقائي"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
          {onDeleteConversation && selectedConv && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-white/20 text-red-300"
              onClick={() => onDeleteConversation(selectedConv.id)}
              aria-label="حذف المحادثة"
              title="حذف المحادثة"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {selectedConv && onOpenSearchInConversation && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-white/20 text-white/70"
              onClick={onOpenSearchInConversation}
              aria-label="البحث في المحادثة"
              title="البحث في المحادثة"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          {onOpenExportConversation && selectedConv && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-white/20 text-white/70"
              onClick={onOpenExportConversation}
              aria-label="تصدير المحادثة"
              title="تصدير المحادثة"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── EmptyChatPlaceholder ─────────────────────────────────────────────────────
const EmptyChatPlaceholder = memo(function EmptyChatPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/30">
      <div className="text-center text-muted-foreground p-8">
        <div className="bg-[var(--whatsapp-green)]/20 dark:bg-[var(--whatsapp-green-dark)]/30 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <MessageCircle className="h-12 w-12 text-[var(--whatsapp-green)]" />
        </div>
        <p className="text-[var(--text-lg)] font-medium mb-1">إدارة محادثات واتساب</p>
        <p className="text-[var(--text-sm)]">اختر محادثة من القائمة لبدء المراسلة</p>
        <div className="mt-4 flex justify-center gap-4 text-[var(--text-xs)] text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCheck className="h-3.5 w-3.5 text-[var(--whatsapp-green)]" />
            <span>قوالب معتمدة</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            <span>إحصائيات فورية</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            <span>رد سريع</span>
          </div>
        </div>
      </div>
    </div>
  );
});

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [saveSearchOpen, setSaveSearchOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [newMessagePhone, setNewMessagePhone] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [newMessageTemplateId, setNewMessageTemplateId] = useState<number | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [secondConversationId, setSecondConversationId] = useState<number | null>(null);
  const [autoReplyDialogOpen, setAutoReplyDialogOpen] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<{ action: string; id?: number; ids?: number[] } | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [searchInConversationOpen, setSearchInConversationOpen] = useState(false);
  const [searchInConversationTerm, setSearchInConversationTerm] = useState("");
  const [exportConversationOpen, setExportConversationOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  // Queries
  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } =
    trpc.whatsapp.conversations.list.useQuery();
  const { data: templates } = trpc.whatsapp.templates.list.useQuery();
  const { data: connectionStatus, isLoading: statusLoading } =
    trpc.whatsapp.connection.status.useQuery(undefined, {
    refetchInterval: 60_000, // كل دقيقة بدلاً من 5 ثوانٍ لتجنب Rate Limiting من Meta
    refetchOnWindowFocus: false,
  });
  const { data: activeUsers } = trpc.users.getActiveUsers.useQuery();
  const { data: savedSearches } = trpc.whatsapp.savedSearches.list.useQuery();

  // Auto Reply Rules Query
  const { data: autoReplyRules, refetch: refetchAutoReplyRules } = trpc.whatsapp.getAutoReplyRules.useQuery();

  // Entity WhatsApp Status Query - check all entity types
  const selectedConv = conversations?.find((c: Conversation) => c.id === selectedConversation);

  // Determine entity type and ID based on what's available
  const entityInfo = useMemo(() => {
    if (!selectedConv) return null;
    if (selectedConv.appointmentId) return { entityType: "appointment" as const, entityId: selectedConv.appointmentId };
    if (selectedConv.offerLeadId) return { entityType: "offer_lead" as const, entityId: selectedConv.offerLeadId };
    if (selectedConv.campRegistrationId) return { entityType: "camp_registration" as const, entityId: selectedConv.campRegistrationId };
    return null;
  }, [selectedConv]);

  const entityStatusQuery = trpc.whatsapp.getEntityWhatsAppStatus.useQuery(
    entityInfo ? {
      entityType: entityInfo.entityType,
      entityId: entityInfo.entityId,
    } : { entityType: "appointment", entityId: 0 },
    {
      enabled: !!entityInfo,
    }
  );

  // Mutations
  const markConversationAsReadMutation = trpc.whatsapp.conversations.markAsRead.useMutation({
    // No refetch needed - SSE stream handles new inbound messages
  });

  const updateConversationMutation = trpc.whatsapp.conversations.update.useMutation({
    onSuccess: () => refetchConversations(),
    onError: () => toast.error("فشل تحديث المحادثة"),
  });

  const assignConversationMutation = trpc.whatsapp.conversations.assignToUser.useMutation({
    onSuccess: () => {
      toast.success("تم تعيين المحادثة");
      refetchConversations();
    },
    onError: () => toast.error("فشل تعيين المحادثة"),
  });

  const bulkArchiveMutation = trpc.whatsapp.conversations.bulkArchive.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
    onError: () => toast.error("فشل أرشفة المحادثات"),
  });

  const bulkMarkImportantMutation = trpc.whatsapp.conversations.bulkMarkImportant.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
    onError: () => toast.error("فشل تعيين المحادثات كمهمة"),
  });

  const deleteConversationMutation = trpc.whatsapp.conversations.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المحادثة");
      refetchConversations();
      setSelectedConversation(null);
    },
    onError: (error) => {
      if (error.message?.includes("FORBIDDEN")) {
        toast.error("فشل الحذف: لا تملك الصلاحية الكافية");
      } else {
        toast.error("فشل حذف المحادثة");
      }
    },
  });

  const saveSearchMutation = trpc.whatsapp.savedSearches.create.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ البحث");
      setSaveSearchOpen(false);
      setSearchName("");
    },
    onError: () => toast.error("فشل حفظ البحث"),
  });

  const sendNewMessageMutation = trpc.whatsapp.messages.send.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الرسالة بنجاح");
      setNewMessagePhone(""); setNewMessageText(""); setNewMessageTemplateId(null);
      setIsNewMessageOpen(false);
      // No refetch needed - SSE stream handles updates
    },
    onError: (error) => toast.error(`فشل إرسال الرسالة: ${error.message}`),
  });

  const sendTemplateMutation = trpc.whatsapp.sendTemplate.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال القالب بنجاح");
      setNewMessagePhone(""); setNewMessageText(""); setNewMessageTemplateId(null);
      setIsNewMessageOpen(false);
      // No refetch needed - SSE stream handles updates
    },
    onError: (error: any) => toast.error(`فشل إرسال القالب: ${error?.message || 'خطأ غير معروف'}`),
  });

  // Auto Reply Toggle Mutation
  const toggleAutoReplyMutation = trpc.whatsapp.toggleAutoReplyRule.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث قاعدة الرد التلقائي");
      refetchAutoReplyRules();
    },
    onError: () => toast.error("فشل تحديث قاعدة الرد التلقائي"),
  });

  // Appointment Reminder Mutation
  const sendReminderMutation = trpc.whatsapp.sendAppointmentReminder.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال التذكير");
      // No refetch needed - SSE stream handles updates
    },
    onError: () => toast.error("فشل إرسال التذكير"),
  });

  // Appointment Followup Mutation
  const sendFollowupMutation = trpc.whatsapp.sendAppointmentFollowup.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال المتابعة");
      // No refetch needed - SSE stream handles updates
    },
    onError: () => toast.error("فشل إرسال المتابعة"),
  });

  // Derived - filtered conversations
  const filteredConversations = useMemo(() => {
    let result = conversations || [];

    // Apply filter tab
    switch (activeFilter) {
      case "unread": result = result.filter(c => c.unreadCount > 0); break;
      case "important": result = result.filter(c => c.isImportant === 1); break;
      case "archived": result = result.filter(c => c.isArchived === 1); break;
      case "unnamed": result = result.filter(c => !c.customerName || c.customerName.trim() === ""); break;
      case "unreplied":
        // Conversations where last message was inbound and no outbound reply
        result = result.filter(c => {
          // Filter conversations with unread messages or recently received messages
          return c.unreadCount > 0 || (c.lastMessage && !c.lastMessage.startsWith("تم الرد"));
        });
        break;
      case "lab_results": result = result.filter(c => c.labOrderId !== null && c.labOrderId !== undefined); break;
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      result = result.filter(c => {
        if (!c.lastMessageAt) return false;
        const lastMsgDate = new Date(c.lastMessageAt);
        switch (dateFilter) {
          case "today": return lastMsgDate >= today;
          case "week": return lastMsgDate >= weekAgo;
          case "month": return lastMsgDate >= monthAgo;
          default: return true;
        }
      });
    }

    // Filter out conversations without messages (empty conversations)
    result = result.filter(c => c.lastMessage !== null && c.lastMessage !== "");

    // Apply search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(c =>
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

  // Callbacks
  const handleSelectConversation = useCallback((id: number) => {
    setSelectedConversation(id);
    setMobileShowChat(true);
    markConversationAsReadMutation.mutate({ id });
  }, [markConversationAsReadMutation]);

  const handleSelectSecondConversation = useCallback((id: number) => {
    // Prevent selecting the same conversation twice
    if (id === selectedConversation) {
      toast.error("لا يمكن اختيار نفس المحادثة مرتين");
      return;
    }
    setSecondConversationId(id);
  }, [selectedConversation]);

  const handleBackToList = useCallback(() => setMobileShowChat(false), []);
  const handleNewMessageOpenChange = useCallback((open: boolean) => setIsNewMessageOpen(open), []);
  const handleSearchChange = useCallback((v: string) => setSearchQuery(v), []);
  const handleAssignConversation = useCallback((id: number, userId: number) => {
    assignConversationMutation.mutate({ id, userId });
  }, [assignConversationMutation]);

  const handleNewMessagePhoneChange = useCallback((v: string) => setNewMessagePhone(v), []);
  const handleNewMessageTextChange = useCallback((v: string) => setNewMessageText(v), []);
  const handleNewMessageTemplateIdChange = useCallback((v: number | null) => setNewMessageTemplateId(v), []);

  const handleArchiveConversation = useCallback((id: number) => {
    const conv = conversations?.find(c => c.id === id);
    setConfirmDialogAction({ action: conv?.isArchived === 1 ? "unarchive" : "archive", id });
    setConfirmDialogOpen(true);
  }, [conversations]);

  const handleDeleteConversation = useCallback((id: number) => {
    setConfirmDialogAction({ action: "delete", id });
    setConfirmDialogOpen(true);
  }, []);

  const handleOpenSearchInConversation = useCallback(() => {
    setSearchInConversationOpen(true);
    setSearchInConversationTerm("");
  }, []);

  const handleCloseSearchInConversation = useCallback(() => {
    setSearchInConversationOpen(false);
    setSearchInConversationTerm("");
  }, []);

  const handleOpenExportConversation = useCallback(() => {
    setExportConversationOpen(true);
    setExportFormat("json");
  }, []);

  const handleCloseExportConversation = useCallback(() => {
    setExportConversationOpen(false);
    setExportFormat("json");
  }, []);

  const handleToggleImportant = useCallback((id: number) => {
    const conv = conversations?.find(c => c.id === id);
    updateConversationMutation.mutate({ id, important: conv?.isImportant ? false : true });
    toast.success(conv?.isImportant ? "تم إلغاء التعيين كمهمة" : "تم تعيين المحادثة كمهمة");
  }, [conversations, updateConversationMutation]);

  const handleOpenNotes = useCallback((id: number) => {
    const conv = conversations?.find(c => c.id === id);
    setNotesValue(conv?.notes || "");
    setNotesDialogOpen(true);
  }, [conversations]);

  const isSavingNotes = updateConversationMutation.isPending;

  const handleSaveNotes = useCallback(() => {
    if (!selectedConv) return;

    // Save notes to local storage for now
    const notesData = JSON.parse(localStorage.getItem("conversationNotes") || "{}");
    notesData[selectedConv.id] = notesValue;
    localStorage.setItem("conversationNotes", JSON.stringify(notesData));

    toast.success("تم حفظ الملاحظات بنجاح");
    setNotesDialogOpen(false);
  }, [selectedConv, notesValue]);

  const handleSaveSearch = useCallback(() => {
    if (!searchName.trim()) {
      toast.error("يرجى إدخال اسم للبحث");
      return;
    }
    if (!searchQuery.trim()) {
      toast.error("يرجى إدخال نص البحث");
      return;
    }
    saveSearchMutation.mutate({
      name: searchName,
      searchQuery: searchQuery,
      filterType: activeFilter,
      dateRange: dateFilter,
    });
  }, [searchName, searchQuery, activeFilter, dateFilter, saveSearchMutation]);

  const handleApplySavedSearch = useCallback((savedSearch: any) => {
    setSearchQuery(savedSearch.searchQuery || savedSearch.query || "");
    setActiveFilter(savedSearch.filterType || savedSearch.filter || "all");
    setDateFilter(savedSearch.dateRange || savedSearch.dateFilter || "all");
  }, []);

  const handleToggleSelection = useCallback((id: number) => {
    setSelectedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (filteredConversations) {
      const allIds = new Set(filteredConversations.map(c => c.id));
      setSelectedConversations(allIds);
    }
  }, [filteredConversations]);

  const handleClearSelection = useCallback(() => {
    setSelectedConversations(new Set());
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (!confirmDialogAction) return;

    if (confirmDialogAction.action === "archive" && confirmDialogAction.id) {
      updateConversationMutation.mutate({ id: confirmDialogAction.id, archived: true });
      toast.success("تم أرشفة المحادثة");
    } else if (confirmDialogAction.action === "unarchive" && confirmDialogAction.id) {
      updateConversationMutation.mutate({ id: confirmDialogAction.id, archived: false });
      toast.success("تم إلغاء الأرشفة");
    } else if (confirmDialogAction.action === "bulk-archive" && confirmDialogAction.ids) {
      bulkArchiveMutation.mutate({ ids: confirmDialogAction.ids });
      toast.success(`تم أرشفة ${confirmDialogAction.ids.length} محادثة`);
      handleClearSelection();
      setIsSelectionMode(false);
    } else if (confirmDialogAction.action === "bulk-important" && confirmDialogAction.ids) {
      bulkMarkImportantMutation.mutate({ ids: confirmDialogAction.ids, important: 1 });
      toast.success(`تم تعيين ${confirmDialogAction.ids.length} محادثة كمهمة`);
      handleClearSelection();
      setIsSelectionMode(false);
    } else if (confirmDialogAction.action === "delete" && confirmDialogAction.id) {
      deleteConversationMutation.mutate({ id: confirmDialogAction.id });
    }

    setConfirmDialogOpen(false);
    setConfirmDialogAction(null);
  }, [confirmDialogAction, updateConversationMutation, bulkArchiveMutation, bulkMarkImportantMutation, handleClearSelection, deleteConversationMutation]);

  const handleBulkArchive = useCallback(() => {
    if (selectedConversations.size === 0) return;
    const ids = Array.from(selectedConversations);
    setConfirmDialogAction({ action: "bulk-archive", ids });
    setConfirmDialogOpen(true);
  }, [selectedConversations]);

  const handleBulkMarkImportant = useCallback(() => {
    if (selectedConversations.size === 0) return;
    const ids = Array.from(selectedConversations);
    setConfirmDialogAction({ action: "bulk-important", ids });
    setConfirmDialogOpen(true);
  }, [selectedConversations]);

  const handleSendNewMessage = useCallback(() => {
    if (!newMessagePhone.trim()) { toast.error("يرجى إدخال رقم الهاتف"); return; }
    if (newMessageTemplateId) {
      const template = templates?.find((t: Template) => t.id === newMessageTemplateId);
      if (!template) { toast.error("القالب غير موجود"); return; }
      sendTemplateMutation.mutate({
        phone: newMessagePhone,
        templateName: template.metaName || template.name,
        language: template.languageCode || "ar",
      });
    } else {
      if (!newMessageText.trim()) { toast.error("يرجى إدخال الرسالة أو اختيار قالب"); return; }
      // Text messages require an active conversation
      if (!selectedConversation) {
        toast.error("يجب اختيار قالب للمحادثات الجديدة");
        return;
      }
      sendNewMessageMutation.mutate({ conversationId: selectedConversation, message: newMessageText });
    }
  }, [newMessagePhone, newMessageTemplateId, newMessageText, templates, sendTemplateMutation, sendNewMessageMutation, selectedConversation]);

  const handleConversationUpdate = useCallback(() => refetchConversations(), [refetchConversations]);

  const handleSendReminder = useCallback(async (appointmentId: number, phone: string, patientName: string, doctorName: string, appointmentTime: Date) => {
    sendReminderMutation.mutate({
      appointmentId,
      phone,
      patientName,
      doctorName,
      appointmentTime,
      hoursUntil: 24, // افتراضي 24 ساعة
    });
  }, [sendReminderMutation]);

  const isSendingReminder = sendReminderMutation.isPending;

  const handleSendFollowup = useCallback(async (appointmentId: number, phone: string, patientName: string, doctorName: string, department: string) => {
    sendFollowupMutation.mutate({
      appointmentId,
      phone,
      patientName,
      doctorName,
      department,
    });
  }, [sendFollowupMutation]);

  const isSendingFollowup = sendFollowupMutation.isPending;

  // Search in Conversation Query
  const { data: searchResults, isLoading: searchLoading } = trpc.whatsapp.messages.searchInConversation.useQuery(
    {
      conversationId: selectedConversation || 0,
      searchTerm: searchInConversationTerm,
    },
    {
      enabled: searchInConversationOpen && !!selectedConversation && searchInConversationTerm.length > 0,
    }
  );

  // Export Conversation Query
  const { data: exportData, isLoading: exportLoading, refetch: refetchExport } = trpc.whatsapp.conversations.exportConversation.useQuery(
    {
      conversationId: selectedConversation || 0,
      format: exportFormat,
    },
    {
      enabled: exportConversationOpen && !!selectedConversation,
    }
  );

  const handleExportConversation = useCallback(() => {
    if (exportData?.exportData && exportData?.filename) {
      const blob = new Blob([exportData.exportData], { type: exportData.format === "csv" ? "text/csv" : "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("تم تصدير المحادثة بنجاح");
      handleCloseExportConversation();
    }
  }, [exportData, handleCloseExportConversation]);


  // SSE
  const { user } = useAuth();
  const userId = user?.id || 0;
  useSSE(userId ? `/api/whatsapp/stream/user/${userId}` : null, useCallback((e: MessageEvent) => {
    try {
      if ((e as any).type === 'new_inbound_message') refetchConversations();
    } catch (error) {
      console.error('SSE error:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
  }, [refetchConversations]));

  // SSE: تحديث فوري عند وصول أحداث الحساب والمحادثات الجديدة
  useWhatsAppSSE({
    onAccountUpdate: useCallback((event: AccountUpdateEvent) => {
      toast.info(`تحديث الحساب: ${event.eventType}`);
      refetchConversations();
    }, [refetchConversations]),
    onConversationCostUpdate: useCallback((event: ConversationCostUpdateEvent) => {
      toast.info(`تحديث تكلفة المحادثة: ${event.phoneNumber}`);
      refetchConversations();
    }, [refetchConversations]),
    onContactsReceived: useCallback((event: ContactsReceivedEvent) => {
      toast.info(`استلام جهات اتصال`);
      refetchConversations();
    }, [refetchConversations]),
    onOrderReceived: useCallback((event: OrderReceivedEvent) => {
      toast.info(`استلام طلب جديد`);
      refetchConversations();
    }, [refetchConversations]),
    onReferralReceived: useCallback((event: ReferralReceivedEvent) => {
      toast.info(`استلام إحالة جديدة`);
      refetchConversations();
    }, [refetchConversations]),
    onReactionReceived: useCallback((event: ReactionReceivedEvent) => {
      toast.info(`استلام رد فعل`);
      refetchConversations();
    }, [refetchConversations]),
    onTransactionStatusUpdate: useCallback((event: TransactionStatusUpdateEvent) => {
      toast.info(`تحديث حالة المعاملة`);
      refetchConversations();
    }, [refetchConversations]),
  });

  const isSendingNewMessage = sendNewMessageMutation.isPending || sendTemplateMutation.isPending;

  const listProps = {
    filteredConversations,
    conversationsLoading,
    selectedConversation,
    searchQuery,
    onSearchChange: handleSearchChange,
    onSelectConversation: handleSelectConversation,
    isNewMessageOpen,
    onNewMessageOpenChange: handleNewMessageOpenChange,
    newMessagePhone,
    onNewMessagePhoneChange: handleNewMessagePhoneChange,
    newMessageText,
    onNewMessageTextChange: handleNewMessageTextChange,
    newMessageTemplateId,
    onNewMessageTemplateIdChange: handleNewMessageTemplateIdChange,
    templates,
    onSendNewMessage: handleSendNewMessage,
    isSendingNewMessage,
    connectionStatus,
    statusLoading,
    allConversations: conversations,
    activeFilter,
    onFilterChange: setActiveFilter,
    dateFilter,
    onDateFilterChange: setDateFilter,
    onArchiveConversation: handleArchiveConversation,
    onToggleImportant: handleToggleImportant,
    onAssignConversation: handleAssignConversation,
    activeUsers,
    onSaveSearchClick: () => setSaveSearchOpen(true),
    isSelectionMode,
    selectedConversations,
    onToggleSelection: handleToggleSelection,
    onSelectAll: handleSelectAll,
    onClearSelection: handleClearSelection,
    onBulkArchive: handleBulkArchive,
    onBulkMarkImportant: handleBulkMarkImportant,
    onToggleSelectionMode: () => setIsSelectionMode(!isSelectionMode),
    isSplitView,
    secondConversationId,
    onSelectSecondConversation: handleSelectSecondConversation,
    savedSearches,
    onApplySavedSearch: handleApplySavedSearch,
    onDeleteConversation: handleDeleteConversation,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--whatsapp-green-light)] via-white to-[var(--whatsapp-emerald-light)] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" dir="rtl">
      <div className="container mx-auto p-2 sm:p-4 md:p-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-emerald)] p-2 sm:p-3 rounded-xl shadow-lg flex-shrink-0">
              <MessageCircle className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[var(--text-base)] sm:text-[var(--text-xl)] md:text-[var(--text-2xl)] font-bold text-foreground truncate">إدارة محادثات واتساب</h1>
              <p className="text-[var(--text-xs)] sm:text-[var(--text-sm)] md:text-[var(--text-base)] text-muted-foreground hidden xs:block">تواصل مع العملاء عبر واتساب بيزنس</p>
            </div>
            <div className="flex gap-1 sm:gap-2 items-center flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[var(--text-xs)] sm:text-[var(--text-sm)] h-7 sm:h-8 px-1.5 sm:px-2.5"
                onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
                aria-label={isDetailsCollapsed ? "إظهار تفاصيل المحادثة" : "إخفاء تفاصيل المحادثة"}
                title={isDetailsCollapsed ? "إظهار تفاصيل المحادثة" : "إخفاء تفاصيل المحادثة"}
              >
                <StickyNote className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{isDetailsCollapsed ? "التفاصيل" : "إخفاء"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[var(--text-xs)] sm:text-[var(--text-sm)] h-7 sm:h-8 px-1.5 sm:px-2.5"
                onClick={() => setIsSplitView(!isSplitView)}
                disabled={!selectedConversation}
                aria-label={isSplitView ? "إلغاء تقسيم الشاشة" : "تقسيم الشاشة"}
                title={isSplitView ? "إلغاء تقسيم الشاشة" : "تقسيم الشاشة"}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{isSplitView ? "إلغاء التقسيم" : "تقسيم"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[var(--text-xs)] sm:text-[var(--text-sm)] h-7 sm:h-8 px-1.5 sm:px-2.5"
                onClick={() => refetchConversations()}
                aria-label="تحديث قائمة المحادثات"
                title="تحديث قائمة المحادثات"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden md:inline">تحديث</span>
              </Button>
              <Link href="/dashboard/whatsapp/connection">
                <Button variant="outline" size="sm" className="gap-1 text-[var(--text-xs)] sm:text-[var(--text-sm)] h-7 sm:h-8 px-1.5 sm:px-2.5" aria-label="إعدادات الاتصال" title="إعدادات الاتصال">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">الاتصال</span>
                </Button>
              </Link>
              <Link href="/dashboard/whatsapp/templates">
                <Button variant="outline" size="sm" className="gap-1 text-[var(--text-xs)] sm:text-[var(--text-sm)] h-7 sm:h-8 px-1.5 sm:px-2.5" aria-label="إدارة القوالب" title="إدارة القوالب">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">القوالب</span>
                </Button>
              </Link>
              <Link href="/dashboard/whatsapp/analytics">
                <Button variant="outline" size="sm" className="gap-1 text-[var(--text-xs)] sm:text-[var(--text-sm)] h-7 sm:h-8 px-1.5 sm:px-2.5" aria-label="التحليلات والإحصائيات" title="التحليلات والإحصائيات">
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">التحليلات</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Save Search Dialog */}
        <Dialog open={saveSearchOpen} onOpenChange={setSaveSearchOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حفظ البحث</DialogTitle>
              <DialogDescription>احفظ البحث الحالي لاستخدامه لاحقاً</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="search-name">اسم البحث</Label>
                <Input
                  id="search-name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="مثال: عملاء غير مقروءين"
                  dir="rtl"
                />
              </div>
              <div>
                <Label>نص البحث</Label>
                <p className="text-sm text-muted-foreground mt-1">{searchQuery}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveSearchOpen(false)}>إلغاء</Button>
              <Button onClick={handleSaveSearch} disabled={saveSearchMutation.isPending}>
                {saveSearchMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Auto Reply Dialog */}
        <Dialog open={autoReplyDialogOpen} onOpenChange={setAutoReplyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>قواعد الرد التلقائي</DialogTitle>
              <DialogDescription>تفعيل أو تعطيل قواعد الرد التلقائي لهذه المحادثة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {autoReplyRules && Array.isArray(autoReplyRules) ? autoReplyRules.map((rule: any) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">{rule.triggerValue}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={rule.isActive ? "default" : "outline"}
                    onClick={() => toggleAutoReplyMutation.mutate({
                      ruleId: rule.id,
                      enabled: !rule.isActive
                    })}
                    disabled={toggleAutoReplyMutation.isPending}
                  >
                    {rule.isActive ? "مفعل" : "معطل"}
                  </Button>
                </div>
              )) : null}
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد العملية</DialogTitle>
              <DialogDescription>
                {confirmDialogAction?.action === "archive" && "هل أنت متأكد من أرشفة هذه المحادثة؟"}
                {confirmDialogAction?.action === "unarchive" && "هل أنت متأكد من إلغاء أرشفة هذه المحادثة؟"}
                {confirmDialogAction?.action === "bulk-archive" && `هل أنت متأكد من أرشفة ${confirmDialogAction?.ids?.length || 0} محادثة؟`}
                {confirmDialogAction?.action === "bulk-important" && `هل أنت متأكد من تعيين ${confirmDialogAction?.ids?.length || 0} محادثة كمهمة؟`}
                {confirmDialogAction?.action === "delete" && "هل أنت متأكد من حذف هذه المحادثة وجميع رسائلها؟ لا يمكن التراجع عن هذا الإجراء."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleConfirmAction} disabled={updateConversationMutation.isPending || bulkArchiveMutation.isPending || bulkMarkImportantMutation.isPending || deleteConversationMutation.isPending}>
                تأكيد
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>ملاحظات المحادثة</DialogTitle>
              <DialogDescription>أضف ملاحظات حول هذه المحادثة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Textarea
                placeholder="اكتب ملاحظاتك هنا..."
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={5}
                dir="rtl"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
                {isSavingNotes ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search in Conversation Dialog */}
        <Dialog open={searchInConversationOpen} onOpenChange={setSearchInConversationOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>البحث في المحادثة</DialogTitle>
              <DialogDescription>ابحث في رسائل هذه المحادثة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex gap-2">
                <Input
                  placeholder="اكتب كلمة البحث..."
                  value={searchInConversationTerm}
                  onChange={(e) => setSearchInConversationTerm(e.target.value)}
                  dir="rtl"
                />
              </div>
              <div className="max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <LoaderIcon className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">جاري البحث...</p>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((msg: any) => (
                      <div key={msg.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={msg.direction === "inbound" ? "default" : "secondary"}>
                            {msg.direction === "inbound" ? "وارد" : "صادر"}
                          </Badge>
                          <Badge variant="outline">{msg.messageType}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleString("ar-SA")}
                          </span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                ) : searchInConversationTerm.length > 0 ? (
                  <p className="text-center text-muted-foreground py-8">لم يتم العثور على نتائج</p>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseSearchInConversation}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Conversation Dialog */}
        <Dialog open={exportConversationOpen} onOpenChange={setExportConversationOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تصدير المحادثة</DialogTitle>
              <DialogDescription>اختر تنسيق التصدير</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>تنسيق التصدير</Label>
                <Select value={exportFormat} onValueChange={(value: "json" | "csv") => setExportFormat(value)}>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseExportConversation}>
                إلغاء
              </Button>
              <Button onClick={handleExportConversation} disabled={exportLoading}>
                {exportLoading ? "جاري التصدير..." : "تصدير"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main Chat Layout */}
        <div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border dark:border-gray-800"
          style={{ height: "calc(100vh - 8.75rem)", minHeight: "400px" }}
        >
          {/* Desktop */}
          <div className={`hidden lg:grid h-full transition-all duration-300 ${isSplitView ? 'lg:grid-cols-[340px_1fr_1fr]' : isDetailsCollapsed ? 'lg:grid-cols-[340px_1fr_0px]' : 'lg:grid-cols-[340px_1fr_280px]'}`}>
            <div className={`border-l dark:border-gray-800 h-full overflow-hidden flex flex-col transition-all duration-300 w-full opacity-100`}>
              <ConversationsList {...listProps} />
            </div>
            <div className="h-full overflow-hidden flex flex-col border-l dark:border-gray-800">
              {selectedConversation ? (
                <>
                  <ChatAreaHeader
                    selectedConv={selectedConv}
                    onBackToList={handleBackToList}
                    onToggleImportant={handleToggleImportant}
                    onAutoReplyClick={() => setAutoReplyDialogOpen(true)}
                    onOpenNotes={handleOpenNotes}
                    onDeleteConversation={handleDeleteConversation}
                    onOpenSearchInConversation={handleOpenSearchInConversation}
                    onOpenExportConversation={handleOpenExportConversation}
                  />
                  <div className="flex-1 overflow-hidden">
                    <ChatWindow conversationId={selectedConversation} lastMessageAt={selectedConv?.lastMessageAt} onConversationUpdate={handleConversationUpdate} phone={selectedConv?.phoneNumber} />
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
                      selectedConv={conversations?.find(c => c.id === secondConversationId)}
                      onBackToList={() => setSecondConversationId(null)}
                      onToggleImportant={(id) => handleToggleImportant(id)}
                      onAutoReplyClick={() => setAutoReplyDialogOpen(true)}
                      onOpenNotes={handleOpenNotes}
                      onDeleteConversation={handleDeleteConversation}
                      onOpenSearchInConversation={handleOpenSearchInConversation}
                      onOpenExportConversation={handleOpenExportConversation}
                    />
                    <div className="flex-1 overflow-hidden">
                      <ChatWindow conversationId={secondConversationId} lastMessageAt={conversations?.find(c => c.id === secondConversationId)?.lastMessageAt} onConversationUpdate={handleConversationUpdate} phone={conversations?.find(c => c.id === secondConversationId)?.phoneNumber} />
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm flex items-center justify-center h-full">
                    اختر محادثة ثانية من القائمة
                  </div>
                )}
              </div>
            ) : (
              <div className={`h-full overflow-y-auto border-l dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 ${isDetailsCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
                {selectedConv ? (
                  <ConversationInfo
                    conversation={selectedConv}
                    onConversationUpdate={handleConversationUpdate}
                    onSendReminder={handleSendReminder}
                    onSendFollowup={handleSendFollowup}
                    entityWhatsAppStatus={entityStatusQuery.data}
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
                  onToggleImportant={handleToggleImportant}
                  onAutoReplyClick={() => setAutoReplyDialogOpen(true)}
                  onOpenNotes={handleOpenNotes}
                  onDeleteConversation={handleDeleteConversation}
                  onOpenSearchInConversation={handleOpenSearchInConversation}
                  onOpenExportConversation={handleOpenExportConversation}
                />
                <div className="flex-1 overflow-hidden">
                  <ChatWindow conversationId={selectedConversation} lastMessageAt={selectedConv?.lastMessageAt} onConversationUpdate={handleConversationUpdate} phone={selectedConv?.phoneNumber} />
                </div>
              </>
            ) : (
              <ConversationsList {...listProps} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
