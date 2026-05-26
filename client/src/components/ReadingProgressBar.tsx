/**
 * ReadingProgressBar Component - شريط التقدم موحد
 * 
 * A unified reading progress bar that shows scroll progress
 */

import { useState, useEffect } from "react";

interface ReadingProgressBarProps {
  className?: string;
  height?: string;
  color?: "green" | "blue" | "purple";
}

export default function ReadingProgressBar({ 
  className = "",
  height = "h-1",
  color = "green"
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
    green: "from-green-600 to-blue-600",
    blue: "from-blue-600 to-purple-600",
    purple: "from-purple-600 to-pink-600",
  };

  return (
    <div className={`fixed top-0 left-0 right-0 ${height} bg-gray-200 dark:bg-gray-800 z-50 ${className}`}>
      <div 
        className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-150 ease-out`}
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
