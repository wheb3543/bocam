/**
 * ChatAreaHeader - رأس منطقة المحادثة
 * يعرض معلومات المحادثة المحددة وأزرار الإجراءات
 */

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Download,
  MessageSquare,
  MoreVertical,
  Search,
  Star,
  StickyNote,
  Trash2,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Conversation } from '../../types/whatsapp.types';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';

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

const ChatAreaHeader = memo(function ChatAreaHeader({
  selectedConv,
  onBackToList,
  onToggleImportant,
  onAutoReplyClick,
  onOpenNotes,
  onDeleteConversation,
  onOpenSearchInConversation,
  onOpenExportConversation,
}: ChatAreaHeaderProps) {
  const { can } = useRolePermissions();
  const canManageCommunications = can('communications.manage');
  const canDeleteConversations = can('communications.delete');
  const isImportant = Boolean(selectedConv?.isImportant);

  return (
    <div className="flex-shrink-0 bg-gradient-to-r from-[var(--whatsapp-green)] to-[var(--whatsapp-emerald)] p-2.5 text-white sm:p-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          onClick={onBackToList}
          className="rounded-full p-2 transition-colors hover:bg-white/20 lg:hidden"
          aria-label="العودة إلى قائمة المحادثات"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-11 sm:w-11">
          <User className="h-4 w-4 sm:h-6 sm:w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold sm:text-[var(--text-lg)]">
            {selectedConv?.customerName || 'عميل جديد'}
          </h2>
          <p className="mt-0.5 truncate text-xs text-white/80 sm:text-[var(--text-sm)]" dir="ltr">
            {selectedConv?.phoneNumber}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {selectedConv && canManageCommunications && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 p-0 text-white hover:bg-white/20 sm:hidden ${isImportant ? 'text-yellow-300' : 'text-white/80'}`}
              onClick={() => onToggleImportant(selectedConv.id)}
              aria-label={isImportant ? 'إلغاء تعيين المحادثة كمهمة' : 'تعيين المحادثة كمهمة'}
            >
              <Star className={`h-4 w-4 ${isImportant ? 'fill-yellow-300' : ''}`} />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/20 sm:hidden"
                aria-label="إجراءات المحادثة"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {selectedConv && onOpenNotes && (
                <DropdownMenuItem onClick={() => onOpenNotes(selectedConv.id)}>
                  <StickyNote className="ms-2 h-4 w-4" />
                  ملاحظات المحادثة
                </DropdownMenuItem>
              )}
              {selectedConv && onAutoReplyClick && (
                <DropdownMenuItem onClick={onAutoReplyClick}>
                  <MessageSquare className="ms-2 h-4 w-4" />
                  قواعد الرد التلقائي
                </DropdownMenuItem>
              )}
              {selectedConv && onOpenSearchInConversation && (
                <DropdownMenuItem onClick={onOpenSearchInConversation}>
                  <Search className="ms-2 h-4 w-4" />
                  البحث في المحادثة
                </DropdownMenuItem>
              )}
              {selectedConv && onOpenExportConversation && (
                <DropdownMenuItem onClick={onOpenExportConversation}>
                  <Download className="ms-2 h-4 w-4" />
                  تصدير المحادثة
                </DropdownMenuItem>
              )}
              {selectedConv && onDeleteConversation && canDeleteConversations && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDeleteConversation(selectedConv.id)}
                  >
                    <Trash2 className="ms-2 h-4 w-4" />
                    حذف المحادثة
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden items-center gap-1 sm:flex">
            {selectedConv && canManageCommunications && (
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 hover:bg-white/20 ${isImportant ? 'text-yellow-300' : 'text-white/70'}`}
                onClick={() => onToggleImportant(selectedConv.id)}
                aria-label={isImportant ? 'إلغاء تعيين المحادثة كمهمة' : 'تعيين المحادثة كمهمة'}
                title={isImportant ? 'إلغاء التعيين كمهمة' : 'تعيين كمهمة'}
              >
                <Star className={`h-4 w-4 ${isImportant ? 'fill-yellow-300' : ''}`} />
              </Button>
            )}
            {selectedConv && onOpenNotes && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/70 hover:bg-white/20"
                onClick={() => onOpenNotes(selectedConv.id)}
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
                className="h-8 w-8 p-0 text-white/70 hover:bg-white/20"
                onClick={onAutoReplyClick}
                aria-label="قواعد الرد التلقائي"
                title="قواعد الرد التلقائي"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
            {onDeleteConversation && selectedConv && canDeleteConversations && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-300 hover:bg-white/20"
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
                className="h-8 w-8 p-0 text-white/70 hover:bg-white/20"
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
                className="h-8 w-8 p-0 text-white/70 hover:bg-white/20"
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
    </div>
  );
});

export default ChatAreaHeader;
