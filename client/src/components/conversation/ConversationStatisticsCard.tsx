/**
 * Conversation Statistics Card Component
 * مكون بطاقة إحصائيات المحادثة
 */

import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ConversationStatisticsCardProps {
  conversationStats: {
    totalMessages: number;
    outboundMessages: number;
    inboundMessages: number;
    templateMessages: number;
    avgResponseTimeMinutes: number;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConversationStatisticsCard({
  conversationStats,
  isOpen,
  onOpenChange,
}: ConversationStatisticsCardProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer p-2">
          <p className="text-xs font-semibold text-muted-foreground">إحصائيات المحادثة</p>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <Card className="p-3 sm:p-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
              <p className="text-[10px] text-muted-foreground">إجمالي الرسائل</p>
              <p className="font-bold text-sm text-foreground">
                {conversationStats.totalMessages}
              </p>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
              <p className="text-[10px] text-muted-foreground">مرسلة</p>
              <p className="font-bold text-sm text-green-600">
                {conversationStats.outboundMessages}
              </p>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
              <p className="text-[10px] text-muted-foreground">مستلمة</p>
              <p className="font-bold text-sm text-blue-600">
                {conversationStats.inboundMessages}
              </p>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
              <p className="text-[10px] text-muted-foreground">قوالب</p>
              <p className="font-bold text-sm text-purple-600">
                {conversationStats.templateMessages}
              </p>
            </div>
          </div>
          {conversationStats.avgResponseTimeMinutes > 0 && (
            <div className="mt-2 text-center p-2 bg-white dark:bg-gray-800 rounded">
              <p className="text-[10px] text-muted-foreground">متوسط وقت الرد</p>
              <p className="font-bold text-sm text-foreground">
                {conversationStats.avgResponseTimeMinutes} دقيقة
              </p>
            </div>
          )}
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
