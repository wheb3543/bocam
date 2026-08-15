/**
 * ConversationSearchBar - شريط البحث في المحادثات
 * يعرض حقل البحث وزر حفظ البحث
 */

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Bookmark } from 'lucide-react';

interface ConversationSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSaveSearchClick?: () => void;
}

const ConversationSearchBar = memo(function ConversationSearchBar({
  searchQuery,
  onSearchChange,
  onSaveSearchClick,
}: ConversationSearchBarProps) {
  return (
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
          onClick={() => onSearchChange('')}
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
  );
});

export default ConversationSearchBar;
