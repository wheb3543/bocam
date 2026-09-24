import { useState, useEffect } from 'react';

interface PageProgressProps {
  color?: string;
  height?: string;
  zIndex?: number;
}

export default function PageProgress({
  color = '#1ea74d',
  height = '4px',
  zIndex = 60,
}: PageProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 bg-transparent pointer-events-none"
      style={{ height, zIndex }}
    >
      <div
        className="h-full transition-all duration-100 ease-out"
        style={{
          width: `${scrollProgress}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
