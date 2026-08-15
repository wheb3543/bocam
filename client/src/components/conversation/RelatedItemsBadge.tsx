/**
 * Related Items Badge Component
 * مكون شارات العناصر المرتبطة
 */

import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Bell, BellOff } from 'lucide-react';
import type { ConversationInfoProps } from './types';

interface RelatedItemsBadgeProps {
  conversation: ConversationInfoProps['conversation'];
  entityWhatsAppStatus?: ConversationInfoProps['entityWhatsAppStatus'];
}

export default function RelatedItemsBadge({ conversation, entityWhatsAppStatus }: RelatedItemsBadgeProps) {
  return (
    <div className="space-y-1.5">
      {conversation.appointmentId && (
        <Badge variant="outline" className="w-full justify-start gap-1.5 px-2 py-1 text-xs">
          <Calendar className="h-3 w-3" />
          <span className="truncate">موعد طبي مرتبط</span>
        </Badge>
      )}
      {conversation.offerLeadId && (
        <Badge variant="outline" className="w-full justify-start gap-1.5 px-2 py-1 text-xs">
          <Mail className="h-3 w-3" />
          <span className="truncate">عرض طبي مرتبط</span>
        </Badge>
      )}
      {conversation.campRegistrationId && (
        <Badge variant="outline" className="w-full justify-start gap-1.5 px-2 py-1 text-xs">
          <span>🏕️</span>
          <span className="truncate">تسجيل مخيم مرتبط</span>
        </Badge>
      )}
      {/* Entity WhatsApp Status */}
      {entityWhatsAppStatus && (
        <Badge
          className={`w-full justify-start gap-1.5 px-2 py-1 text-xs ${
            entityWhatsAppStatus.notificationsEnabled
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-gray-100 text-gray-800 border-gray-200'
          }`}
        >
          {entityWhatsAppStatus.notificationsEnabled ? (
            <Bell className="h-3 w-3" />
          ) : (
            <BellOff className="h-3 w-3" />
          )}
          <span className="truncate">
            {entityWhatsAppStatus.notificationsEnabled ? 'الإشعارات مفعلة' : 'الإشعارات معطلة'}
          </span>
        </Badge>
      )}
    </div>
  );
}
