/**
 * ChatAreaHeader - رأس منطقة المحادثة
 * يعرض معلومات المحادثة المحددة وأزرار الإجراءات
 */

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  User,
  Star,
  StickyNote,
  MessageSquare,
  Trash2,
  Search,
  Download,
} from 'lucide-react';
import { Conversation } from '../../types/whatsapp.types';

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
            {selectedConv?.customerName || 'عميل جديد'}
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
              className={`h-7 w-7 p-0 hover:bg-white/20 ${selectedConv.isImportant ? 'text-yellow-300' : 'text-white/70'}`}
              onClick={() => selectedConv && onToggleImportant(selectedConv.id)}
              aria-label={
                selectedConv.isImportant ? 'إلغاء تعيين المحادثة كمهمة' : 'تعيين المحادثة كمهمة'
              }
              title={selectedConv.isImportant ? 'إلغاء التعيين كمهمة' : 'تعيين كمهمة'}
            >
              <Star className={`h-4 w-4 ${selectedConv.isImportant ? 'fill-yellow-300' : ''}`} />
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

export default ChatAreaHeader;
