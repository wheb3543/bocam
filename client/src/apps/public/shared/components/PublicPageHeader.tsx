import { ReactNode } from 'react';

interface PublicPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    icon?: ReactNode;
  };
  backgroundImage?: string;
  gradient?: string;
  overlay?: boolean;
  minHeight?: string;
  children?: ReactNode;
}

export default function PublicPageHeader({
  title,
  subtitle,
  badge,
  backgroundImage,
  gradient = 'from-emerald-800 via-teal-800 to-cyan-900',
  overlay = true,
  minHeight = '240px',
  children,
}: PublicPageHeaderProps) {
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }
    : {};

  return (
    <section
      className={`relative w-full flex items-center justify-center text-white ${backgroundImage ? '' : `bg-gradient-to-br ${gradient}`}`}
      style={{
        ...backgroundStyle,
        minHeight,
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      {overlay && backgroundImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        />
      )}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-200 text-xs sm:text-sm font-medium shadow-inner mb-4">
            {badge.icon}
            <span>{badge.text}</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm mb-4">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
