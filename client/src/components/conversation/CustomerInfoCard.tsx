/**
 * Customer Info Card Component
 * مكون بطاقة معلومات العميل
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CustomerInfo } from './types';
import { getStatusBadgeColor, getTypeLabel } from './utils';

interface CustomerInfoCardProps {
  customerInfo: CustomerInfo;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerInfoCard({ customerInfo, isOpen, onOpenChange }: CustomerInfoCardProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card className="p-3 sm:p-4 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <p className="text-xs font-semibold text-muted-foreground">
              معلومات العميل الأساسية
            </p>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-3">
          <div className="space-y-1.5">
            <div>
              <p className="text-xs text-muted-foreground">الاسم</p>
              <p className="font-semibold text-sm text-foreground">{customerInfo.name}</p>
            </div>
            {customerInfo.email && (
              <div>
                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                <p className="text-xs text-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {customerInfo.email}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">الحالة والنوع</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${getStatusBadgeColor(customerInfo.status)}`}>
                  {customerInfo.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(customerInfo.type)}
                </Badge>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
