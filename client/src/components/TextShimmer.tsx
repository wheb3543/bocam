/**
 * TextShimmer - تأثير لمعان النص
 *
 * مكون يضيف تأثير لمعان النص مع تدرج لوني متحرك
 * يدعم إيقاف الحركات عبر AnimationToggle
 */
import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  disabled?: boolean;
}

export default function TextShimmer({
  children,
  className,
  gradient = 'from-green-600 via-blue-600 to-green-600',
  disabled = false,
}: TextShimmerProps) {
  return (
    <span
      className={cn(
        'bg-clip-text text-transparent bg-[length:200%_auto]',
        !disabled && 'animate-text-shimmer',
        `bg-gradient-to-r ${gradient}`,
        className
      )}
    >
      {children}
    </span>
  );
}
