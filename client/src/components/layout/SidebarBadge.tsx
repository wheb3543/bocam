import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SidebarBadgeProps {
  count: number;
  className?: string;
}

export default function SidebarBadge({ count, className }: SidebarBadgeProps) {
  const prevCountRef = useRef(count);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (count > prevCountRef.current && prevCountRef.current >= 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 600);
      prevCountRef.current = count;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  if (!count || count <= 0) {
    return null;
  }
  const display = count > 99 ? '99+' : String(count);
  return (
    <span
      className={cn(
        'absolute flex items-center justify-center rounded-full bg-red-500 text-white font-bold shadow-sm border border-white transition-transform duration-300',
        count > 99
          ? 'min-w-[18px] h-[14px] text-[7px] px-0.5 -top-1 -left-1.5'
          : count > 9
            ? 'min-w-[16px] h-[14px] text-[7px] px-0.5 -top-1 -left-1'
            : 'h-[14px] w-[14px] text-[7px] -top-0.5 -left-0.5',
        isPulsing && 'badge-pulse',
        className
      )}
    >
      {display}
    </span>
  );
}
