/**
 * SectionDivider Component - فاصل أقسام موحد
 *
 * A unified section divider component with gradient styling
 */

interface SectionDividerProps {
  className?: string;
  color?: 'gray' | 'green' | 'blue';
}

export default function SectionDivider({ className = '', color = 'gray' }: SectionDividerProps) {
  const colorClasses = {
    gray: 'from-transparent via-[#d8e0db] to-transparent',
    green: 'from-transparent via-[#2eb34b] to-transparent',
    blue: 'from-transparent via-[#1ca8e5] to-transparent',
  };

  return (
    <div className={`w-full h-px bg-gradient-to-r ${colorClasses[color]} my-0 ${className}`} />
  );
}
