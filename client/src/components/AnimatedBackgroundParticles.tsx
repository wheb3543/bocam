/**
 * AnimatedBackgroundParticles - جزيئات خلفية متحركة
 * 
 * مكون يضيف جزيئات خلفية متحركة بألوان مختلفة
 * يدعم إيقاف الحركات عبر AnimationToggle
 */
import { cn } from "@/lib/utils";

interface AnimatedBackgroundParticlesProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
  disabled?: boolean;
}

export default function AnimatedBackgroundParticles({
  className,
  particleCount = 8,
  colors = ["rgba(34, 197, 94, 0.3)", "rgba(59, 130, 246, 0.3)"],
  disabled = false,
}: AnimatedBackgroundParticlesProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {[...Array(particleCount)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full",
            !disabled && "animate-particle"
          )}
          style={{
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            animation: disabled ? "none" : `particle ${Math.random() * 20 + 20}s linear infinite`,
            animationDelay: disabled ? "0s" : `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
