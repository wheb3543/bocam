/**
 * Conversation Stats Component
 * مكون إحصائيات المحادثة
 */

import { Card } from '@/components/ui/card';
import { MessageSquare, Clock } from 'lucide-react';

interface ConversationStatsProps {
  messageCount: number;
  lastMessageAt?: string | Date | null;
}

export default function ConversationStats({ messageCount, lastMessageAt }: ConversationStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="p-2.5 sm:p-3">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">الرسائل</p>
            <p className="font-bold text-sm sm:text-base text-foreground">{messageCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-2.5 sm:p-3">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">آخر رسالة</p>
            <p className="font-bold text-sm sm:text-base text-foreground">
              {lastMessageAt
                ? new Date(lastMessageAt).toLocaleDateString('ar-EG', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
