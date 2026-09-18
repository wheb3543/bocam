import { LockKeyhole } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PermissionHintProps {
  message: string;
  label?: string;
  className?: string;
}

/** يشرح بوضوح سبب عدم ظهور الإجراء دون محاولة محاكاة تحقق الخادم. */
export function PermissionHint({
  message,
  label = 'إجراء مقيّد',
  className = '',
}: PermissionHintProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          role="note"
          aria-label={message}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 text-xs font-medium text-amber-800 outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        >
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-center" dir="rtl">
        <p>{message}</p>
      </TooltipContent>
    </Tooltip>
  );
}
