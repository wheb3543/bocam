/**
 * SearchInConversationDialog - حوار البحث في المحادثة
 * يسمح للمستخدم بالبحث داخل رسائل محادثة محددة
 */

import { memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoaderIcon } from 'lucide-react';

interface SearchInConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  searchResults: {
    id: number;
    direction: string;
    messageType: string;
    createdAt: Date | string;
    content: string;
  }[] | undefined;
  searchLoading: boolean;
}

const SearchInConversationDialog = memo(function SearchInConversationDialog({
  open,
  onOpenChange,
  searchTerm,
  onSearchTermChange,
  searchResults,
  searchLoading,
}: SearchInConversationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>البحث في المحادثة</DialogTitle>
          <DialogDescription>ابحث في رسائل هذه المحادثة</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <Input
              placeholder="اكتب كلمة البحث..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
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
                {searchResults.map((msg) => (
                  <div key={msg.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={msg.direction === 'inbound' ? 'default' : 'secondary'}>
                        {msg.direction === 'inbound' ? 'وارد' : 'صادر'}
                      </Badge>
                      <Badge variant="outline">{String(msg.messageType || 'text')}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
              </div>
            ) : searchTerm.length > 0 ? (
              <p className="text-center text-muted-foreground py-8">لم يتم العثور على نتائج</p>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default SearchInConversationDialog;
