/**
 * ReadingProgressBar Component - شريط التقدم موحد
 *
 * A unified reading progress bar that shows scroll progress
 */

import { useState, useEffect } from 'react';

interface ReadingProgressBarProps {
  className?: string;
  height?: string;
  color?: 'green' | 'blue' | 'purple';
}

export default function ReadingProgressBar({
  className = '',
  height = 'h-1',
  color = 'green',
}: ReadingProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const colorClasses = {
    green: 'from-[#2eb34b] to-[#1ca8e5]',
    blue: 'from-[#1ca8e5] to-[#2eb34b]',
    purple: 'from-[#007242] to-[#1ca8e5]',
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 ${height} bg-gray-200 dark:bg-gray-800 z-50 ${className}`}
    >
      <div
        className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-150 ease-out`}
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
