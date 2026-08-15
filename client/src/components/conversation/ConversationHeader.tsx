/**
 * Conversation Header Component
 * مكون رأس المحادثة
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Phone,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link2 } from 'lucide-react';
import type { ConversationInfoProps } from './types';

interface ConversationHeaderProps {
  conversation: ConversationInfoProps['conversation'];
  editingName: boolean;
  editedName: string;
  onEditName: () => void;
  onSaveName: () => void;
  onCancelEditName: () => void;
  onNameChange: (value: string) => void;
  onCopyPhone: () => void;
  onMarkAsImportant?: () => void;
  onArchive?: () => void;
  onLinkEntity: () => void;
}

export default function ConversationHeader({
  conversation,
  editingName,
  editedName,
  onEditName,
  onSaveName,
  onCancelEditName,
  onNameChange,
  onCopyPhone,
  onMarkAsImportant,
  onArchive,
  onLinkEntity,
}: ConversationHeaderProps) {
  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => onNameChange(e.target.value)}
                className="flex-1 text-sm font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                dir="rtl"
              />
              <Button size="sm" variant="ghost" onClick={onSaveName} className="h-6 w-6 p-0">
                <span className="text-green-600">✓</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelEditName}
                className="h-6 w-6 p-0"
              >
                <span className="text-red-600">✕</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                {conversation.customerName || 'عميل جديد'}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEditName}
                className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
              >
                <span className="text-xs">✏️</span>
              </Button>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span dir="ltr" className="font-mono text-[10px] sm:text-xs">
              {conversation.phoneNumber}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={onCopyPhone}>
              <Phone className="h-3.5 w-3.5 ml-2" />
              نسخ رقم الهاتف
            </DropdownMenuItem>
            {onMarkAsImportant && (
              <DropdownMenuItem onClick={onMarkAsImportant}>
                <span className="ml-2">⭐</span>
                وضع علامة مهمة
              </DropdownMenuItem>
            )}
            {onArchive && (
              <DropdownMenuItem onClick={onArchive}>
                <span className="ml-2">📦</span>
                أرشفة المحادثة
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLinkEntity}>
              <Link2 className="h-3.5 w-3.5 ml-2" />
              ربط بكيان
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
