/**
 * AnimatedRibbonEffect - تأثير الشريط المتحرك
 * 
 * مكون يضيف تأثير شريط متحرك في الخلفية
 * يدعم إيقاف الحركات عبر AnimationToggle
 */
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedRibbonEffectProps {
  className?: string;
  disabled?: boolean;
  showHeart?: boolean;
}

export default function AnimatedRibbonEffect({
  className,
  disabled = false,
  showHeart = true,
}: AnimatedRibbonEffectProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {/* Green Ribbon - from right */}
      <div className="absolute bottom-0 right-0 w-full h-full">
        <div
          className={cn(
            "absolute bottom-0 right-0 w-32 h-96 bg-gradient-to-l from-green-400 to-green-300 opacity-20",
            !disabled && "animate-ribbon-green"
          )}
          style={{
            clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
            borderRadius: "50%",
            filter: "blur(2px)",
            boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)",
            animation: disabled ? "none" : "ribbonGreen 6s ease-in-out infinite",
          }}
        />
      </div>
      {/* Blue Ribbon - from right */}
      <div className="absolute bottom-0 right-0 w-full h-full">
        <div
          className={cn(
            "absolute bottom-0 right-0 w-32 h-96 bg-gradient-to-l from-blue-400 to-blue-300 opacity-20",
            !disabled && "animate-ribbon-blue"
          )}
          style={{
            clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
            borderRadius: "50%",
            filter: "blur(2px)",
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
            animation: disabled ? "none" : "ribbonBlue 6s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        />
      </div>
      {/* Heart Icon at Center Top */}
      {showHeart && (
        <div className={cn("absolute top-20 left-1/2 -translate-x-1/2", !disabled && "animate-heart-pulse")}>
          <div className="relative">
            <Heart className="h-8 w-8 text-green-300 opacity-30" />
            <div className={cn("absolute inset-0 bg-green-300 opacity-20 blur-xl", !disabled && "animate-glow")} />
          </div>
        </div>
      )}
    </div>
  );
}
