/**
 * AnimatedStatsCounter - عداد إحصائيات متحرك
 * 
 * مكون يضيف تأثير العد المتحرك للأرقام
 * يدعم إيقاف الحركات عبر AnimationToggle
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedStatsCounterProps {
  target: number;
  duration?: number;
  disabled?: boolean;
  className?: string;
}

export default function AnimatedStatsCounter({
  target,
  duration = 2000,
  disabled = false,
  className,
}: AnimatedStatsCounterProps) {
  const [current, setCurrent] = useState(disabled ? target : 0);

  useEffect(() => {
    if (disabled) {
      setCurrent(target);
      return;
    }

    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setCurrent(Math.floor(target * progress));

      if (currentStep >= steps) {
        clearInterval(timer);
        setCurrent(target);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target, duration, disabled]);

  return (
    <span className={cn("", className)}>
      {current}
    </span>
  );
}
