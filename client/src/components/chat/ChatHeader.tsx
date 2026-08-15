import React, { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreVertical,
  Moon,
  Sun,
  MessageSquare,
  Users,
  Eye,
  Plus,
  Minus,
  Download,
  Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { ChatWindowProps } from './types';

interface ChatHeaderProps extends ChatWindowProps {
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onSearchOpen: () => void;
  onMediaGalleryOpen: () => void;
  onExportConversation: () => void;
  onFontSizeChange: (delta: number) => void;
  _messageFontSize: number;
  isSelectionMode: boolean;
  selectedMessagesCount: number;
  onToggleSelectionMode: () => void;
  onDeleteSelectedMessages: () => void;
  contactName?: string | null;
  phone?: string | null;
}

export const ChatHeader = memo(({
  conversationId,
  contactName,
  phone,
  isNightMode,
  onToggleNightMode,
  onSearchOpen,
  onMediaGalleryOpen,
  onExportConversation,
  onFontSizeChange,
  _messageFontSize,
  isSelectionMode,
  selectedMessagesCount,
  onToggleSelectionMode,
  onDeleteSelectedMessages,
}: ChatHeaderProps) => {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const handleInfoClick = useCallback(() => {
    setInfoDialogOpen(true);
  }, []);

  const _handleCloseInfoDialog = useCallback(() => {
    setInfoDialogOpen(false);
  }, []);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-3">
        {isSelectionMode ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedMessagesCount} رسالة محددة
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelectedMessages}
              disabled={selectedMessagesCount === 0}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleSelectionMode}>
              إلغاء
            </Button>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
              {contactName?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {contactName || 'غير محدد'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {phone || 'غير محدد'}
              </p>
            </div>
          </>
        )}
      </div>

      {!isSelectionMode && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchOpen}
            title="بحث في المحادثة"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onMediaGalleryOpen}
            title="معرض الوسائط"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleInfoClick}>
                <Users className="h-4 w-4 ml-2" />
                معلومات جهة الاتصال
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onExportConversation}>
                <Download className="h-4 w-4 ml-2" />
                تصدير المحادثة
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onFontSizeChange(-1)}>
                <Minus className="h-4 w-4 ml-2" />
                تصغير الخط
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onFontSizeChange(1)}>
                <Plus className="h-4 w-4 ml-2" />
                تكبير الخط
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onToggleNightMode}>
                {isNightMode ? (
                  <>
                    <Sun className="h-4 w-4 ml-2" />
                    الوضع النهاري
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 ml-2" />
                    الوضع الليلي
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onToggleSelectionMode}>
                <Eye className="h-4 w-4 ml-2" />
                تحديد الرسائل
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Contact Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>معلومات جهة الاتصال</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الاسم</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {contactName || 'غير محدد'}
              </p>
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {phone || 'غير محدد'}
              </p>
            </div>
            <div>
              <Label>معرف المحادثة</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {conversationId || 'غير محدد'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';
