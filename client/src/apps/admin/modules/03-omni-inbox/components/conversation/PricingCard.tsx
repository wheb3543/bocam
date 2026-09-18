/**
 * Pricing Card Component
 * مكون بطاقة التسعير
 */

import { Card } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import type { ConversationInfoProps } from './types';

interface PricingCardProps {
  conversation: ConversationInfoProps['conversation'];
}

export default function PricingCard({ conversation }: PricingCardProps) {
  if (
    !conversation.pricingModel &&
    conversation.billable === null &&
    !conversation.pricingCategory &&
    !conversation.expirationTimestamp
  ) {
    return null;
  }

  return (
    <Card className="p-3 sm:p-4 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-4 w-4 text-green-600" />
        <p className="text-xs font-semibold text-muted-foreground">معلومات التكلفة</p>
      </div>
      <div className="space-y-1 text-xs">
        {conversation.pricingModel && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">نموذج التسعير:</span>
            <span className="font-medium">{conversation.pricingModel}</span>
          </div>
        )}
        {conversation.billable !== null && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">قابل للفوترة:</span>
            <span
              className={`font-medium ${conversation.billable ? 'text-green-600' : 'text-red-600'}`}
            >
              {conversation.billable === true || conversation.billable === 1 ? 'نعم' : 'لا'}
            </span>
          </div>
        )}
        {conversation.pricingCategory && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">الفئة:</span>
            <span className="font-medium">{conversation.pricingCategory}</span>
          </div>
        )}
        {conversation.expirationTimestamp && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">تنتهي:</span>
            <span className="font-medium">
              {new Date(conversation.expirationTimestamp).toLocaleString('ar-SA')}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
