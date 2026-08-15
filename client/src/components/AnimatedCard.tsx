/**
 * AnimatedCard Component - بطاقة متحركة موحدة
 *
 * A unified animated card component with consistent styling and animations
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AnimatedCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
  borderColor?: string;
  bgColor?: string;
  onClick?: () => void;
}

export default function AnimatedCard({
  children,
  title,
  description,
  className = '',
  delay = 0,
  hoverEffect = true,
  borderColor = 'border-gray-200 dark:border-gray-700',
  bgColor = 'bg-white/95 dark:bg-gray-800/95',
  onClick,
}: AnimatedCardProps) {
  return (
    <Card
      className={`${hoverEffect ? 'hover:shadow-xl hover:scale-105' : ''} transition-all cursor-pointer border-2 ${borderColor} ${bgColor} backdrop-blur-sm animate-card-appear ${className}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>

      {/* CSS Animation */}
      <style>{`
        @keyframes cardAppear {
          0% { opacity: 0; transform: translateY(15px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-card-appear {
          animation: cardAppear 0.6s ease-out;
          will-change: opacity, transform;
        }
      `}</style>
    </Card>
  );
}
