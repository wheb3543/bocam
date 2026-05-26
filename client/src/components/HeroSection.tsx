/**
 * HeroSection Component - قسم رئيسي موحد
 * 
 * A unified hero section component for all public pages
 * Consistent styling, animations, and accessibility
 */

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  badge?: {
    text: string;
    icon: LucideIcon;
  };
  backgroundGradient?: string;
  textColor?: string;
  minHeight?: string;
  children?: ReactNode;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  badge,
  backgroundGradient = "from-green-600 via-green-700 to-blue-600",
  textColor = "text-white",
  minHeight = "min-h-[700px]",
  children,
}: HeroSectionProps) {
  return (
    <section
      className={`py-12 sm:py-16 md:py-24 bg-gradient-to-br ${backgroundGradient} ${textColor} overflow-hidden relative ${minHeight}`}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-particle"
            style={{
              width: Math.random() * 8 + 4 + 'px',
              height: Math.random() * 8 + 4 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: i % 2 === 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)',
              animation: `particle ${Math.random() * 20 + 20}s linear infinite`,
              animationDelay: Math.random() * 5 + 's',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        {badge && (
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-card-appear">
            <badge.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{badge.text}</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-text-shimmer bg-clip-text text-transparent bg-[length:200%_auto] bg-gradient-to-r from-white via-green-100 to-white">
          {title}
        </h1>

        {subtitle && (
          <p className="text-base sm:text-xl md:text-3xl mb-2 sm:mb-3 text-green-100 font-semibold">
            {subtitle}
          </p>
        )}

        <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto px-2 text-white/95 bg-black/20 rounded-lg p-4">
          {description}
        </p>

        {children}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes particle {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(50px) rotate(360deg); opacity: 0; }
        }

        @keyframes textShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes cardAppear {
          0% { opacity: 0; transform: translateY(15px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-particle {
          animation: particle linear infinite;
          will-change: transform, opacity;
        }

        .animate-text-shimmer {
          animation: textShimmer 3s ease-in-out infinite;
          will-change: background-position;
        }

        .animate-card-appear {
          animation: cardAppear 0.6s ease-out;
          will-change: opacity, transform;
        }
      `}</style>
    </section>
  );
}
