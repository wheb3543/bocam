/**
 * ConversationItem - عنصر المحادثة الفردي
 * يعرض معلومات محادثة واحدة مع الإجراءات السريعة
 */

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Phone,
  ChevronRight,
  Star,
  Archive,
  MoreVertical,
  CheckSquare,
} from 'lucide-react';
import { Conversation, WhatsAppUser } from '../../types/whatsapp.types';

// Helper function to get time elapsed color
function getTimeElapsedColor(lastMessageAt: string | Date | null): string {
  if (!lastMessageAt) {return 'text-[var(--whatsapp-gray)]';}
  const hours = (Date.now() - new Date(lastMessageAt).getTime()) / (1000 * 60 * 60);
  if (hours < 1) {return 'text-[var(--whatsapp-green)]';}
  if (hours < 24) {return 'text-[var(--whatsapp-blue)]';}
  if (hours < 168) {return 'text-[var(--whatsapp-orange)]';} // 7 days
  return 'text-red-600';
}

// Helper function to get time elapsed text
function getTimeElapsedText(lastMessageAt: string | Date | null): string {
  if (!lastMessageAt) {return '';}
  const hours = (Date.now() - new Date(lastMessageAt).getTime()) / (1000 * 60 * 60);
  if (hours < 1) {return 'أقل من ساعة';}
  if (hours < 24) {return `${Math.floor(hours)} ساعة`;}
  if (hours < 168) {return `${Math.floor(hours / 24)} يوم`;}
  return `${Math.floor(hours / 168)} أسبوع`;
}

interface ConversationItemProps {
  conv: Conversation;
  isSelected: boolean;
  isSelectionMode: boolean;
  isSelectionSelected: boolean;
  activeFilter: string;
  _selectedConversations: Set<number>;
  onClick: () => void;
  onToggleSelection: (id: number) => void;
  onToggleImportant: (id: number) => void;
  onArchiveConversation: (id: number) => void;
  onAssignConversation: (id: number, userId: number) => void;
  activeUsers: WhatsAppUser[] | undefined;
}

const ConversationItem = memo(function ConversationItem({
  conv,
  isSelected,
  isSelectionMode,
  isSelectionSelected,
  activeFilter,
  _selectedConversations,
  onClick,
  onToggleSelection,
  onToggleImportant,
  onArchiveConversation,
  onAssignConversation,
  activeUsers,
}: ConversationItemProps) {
  return (
    <div
      className={`group relative p-3 sm:p-4 cursor-pointer transition-colors hover:bg--[var(--whatsapp-green-light)] dark:hover:bg-[var(--whatsapp-green-dark)]/20 active:bg-[var(--whatsapp-green)]/20 ${
        isSelected
          ? 'bg-[var(--whatsapp-green)]/20 dark:bg-[var(--whatsapp-green-dark)]/30 border-r-4 border-[var(--whatsapp-green)]'
          : ''
      } ${conv.isArchived ? 'opacity-60' : ''}`}
      onClick={onClick}
      role="button"
      aria-selected={isSelected}
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
            aria-checked={isSelectionSelected}
            aria-label={`تحديد المحادثة ${conv.customerName || 'بدون اسم'}`}
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelectionSelected
                  ? 'bg-[var(--whatsapp-green)] border-[var(--whatsapp-green)]'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {isSelectionSelected && <CheckSquare className="h-3 w-3 text-white" />}
            </div>
          </div>
        )}
        <div
          className={`relative p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
            conv.isImportant
              ? 'bg-gradient-to-br from-[var(--whatsapp-yellow)] to-[var(--whatsapp-orange)]'
              : 'bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-emerald)]'
          }`}
        >
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          {conv.isImportant === 1 && (
            <Star className="absolute -top-1 -left-1 h-3 w-3 text-[var(--whatsapp-yellow)] fill-[var(--whatsapp-yellow)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="font-semibold text-xs sm:text-sm text-foreground truncate">
              {conv.customerName || 'عميل جديد'}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {conv.unreadCount > 0 && activeFilter !== 'all' && (
                <Badge
                  variant="destructive"
                  className="rounded-full px-1.5 text-[10px] sm:text-xs h-4 sm:h-5"
                >
                  {conv.unreadCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-0.5">
            <Phone className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
            <span dir="ltr" className="truncate text-[9px] sm:text-[10px] md:text-xs">
              {conv.phoneNumber}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-[100px] md:max-w-[140px]">
              {conv.lastMessage || 'لا توجد رسائل'}
            </p>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {conv.labOrderId && (
                <Badge
                  variant="outline"
                  className="text-[7px] sm:text-[8px] md:text-[9px] h-3 sm:h-4 md:h-5 px-0.5 sm:px-1 bg-[var(--whatsapp-blue)]/10 border-[var(--whatsapp-blue)]/30 text-[var(--whatsapp-blue)]"
                >
                  #{conv.labOrderId}
                </Badge>
              )}
              <div
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${getTimeElapsedColor(conv.lastMessageAt || null)}`}
              />
              <p
                className={`text-[9px] sm:text-[10px] md:text-xs flex-shrink-0 ${getTimeElapsedColor(conv.lastMessageAt || null)}`}
              >
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
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="خيارات إضافية"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem
              onClick={() => onToggleImportant(conv.id)}
              aria-label={
                conv.isImportant ? 'إلغاء تعيين المحادثة كمهمة' : 'تعيين المحادثة كمهمة'
              }
            >
              <Star className="h-3.5 w-3.5 ml-2" />
              {conv.isImportant ? 'إلغاء المهمة' : 'تعيين كمهمة'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onArchiveConversation(conv.id)}
              aria-label={conv.isArchived ? 'إلغاء أرشفة المحادثة' : 'أرشفة المحادثة'}
            >
              <Archive className="h-3.5 w-3.5 ml-2" />
              {conv.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  aria-label="تعيين المحادثة لمستخدم"
                >
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
          <Badge
            variant="outline"
            className="text-[8px] h-4 px-1 bg-[var(--whatsapp-blue)]/10 border-[var(--whatsapp-blue)]/20"
          >
            <User className="h-2 w-2 mr-0.5" />
            معين
          </Badge>
        </div>
      )}
    </div>
  );
});

export default ConversationItem;
