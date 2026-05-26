/**
 * BackToTopButton Component - زر العودة للأعلى موحد
 * 
 * A unified back to top button with smooth scrolling
 */

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface BackToTopButtonProps {
  threshold?: number;
  className?: string;
}

export default function BackToTopButton({ 
  threshold = 300, 
  className = "" 
}: BackToTopButtonProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showBackToTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 left-8 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-bounce ${className}`}
      aria-label="العودة للأعلى"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
}
