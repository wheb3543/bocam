/**
 * Quick Actions Component
 * مكون الإجراءات السريعة
 */

import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Mail } from 'lucide-react';

interface QuickActionsProps {
  onCall: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
}

export default function QuickActions({ onCall, onWhatsApp, onEmail }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onCall}>
        <Phone className="h-3.5 w-3.5 ml-1" />
        <span className="hidden sm:inline">اتصال</span>
        <span className="sm:hidden">☎️</span>
      </Button>
      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onWhatsApp}>
        <MessageCircle className="h-3.5 w-3.5 ml-1" />
        <span className="hidden sm:inline">واتساب</span>
        <span className="sm:hidden">💬</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs"
        onClick={onEmail}
      >
        <Mail className="h-3.5 w-3.5 ml-1" />
        <span className="hidden sm:inline">بريد</span>
        <span className="sm:hidden">✉️</span>
      </Button>
    </div>
  );
}
