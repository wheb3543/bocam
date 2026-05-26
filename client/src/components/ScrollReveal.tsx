/**
 * ScrollReveal - تأثير ظهور العناصر عند التمرير
 *
 * مكون يضيف تأثير ظهور العناصر عند التمرير باستخدام Intersection Observer
 * يدعم إيقاف الحركات عبر AnimationToggle
 */
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  disabled?: boolean;
}

export default function ScrollReveal({
  children,
  className,
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
  delay = 0,
  disabled = false,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) {
      setIsVisible(true);
      return;
    }

    const observerOptions = {
      threshold,
      rootMargin,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, delay, disabled]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </div>
  );
}
