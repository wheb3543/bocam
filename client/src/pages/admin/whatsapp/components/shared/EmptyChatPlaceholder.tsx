/**
 * EmptyChatPlaceholder - عنصر نائب للمحادثة الفارغة
 * يعرض رسالة توجيهية عند عدم اختيار محادثة
 */

import { memo } from 'react';
import { MessageCircle, CheckCheck, TrendingUp, Clock } from 'lucide-react';

const EmptyChatPlaceholder = memo(function EmptyChatPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/30">
      <div className="text-center text-muted-foreground p-8">
        <div className="bg-[var(--whatsapp-green)]/20 dark:bg-[var(--whatsapp-green-dark)]/30 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <MessageCircle className="h-12 w-12 text-[var(--whatsapp-green)]" />
        </div>
        <p className="text-[var(--text-lg)] font-medium mb-1">إدارة محادثات واتساب</p>
        <p className="text-[var(--text-sm)]">اختر محادثة من القائمة لبدء المراسلة</p>
        <div className="mt-4 flex justify-center gap-4 text-[var(--text-xs)] text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCheck className="h-3.5 w-3.5 text-[var(--whatsapp-green)]" />
            <span>قوالب معتمدة</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            <span>إحصائيات فورية</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            <span>رد سريع</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EmptyChatPlaceholder;
