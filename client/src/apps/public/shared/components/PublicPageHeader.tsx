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
  minHeight,
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
      className={`sgh-public-page-header sgh-hero-surface relative w-full flex items-center justify-center text-white ${backgroundImage ? '' : 'bg-[linear-gradient(135deg,#007242_0%,#2eb34b_55%,#1ca8e5_130%)]'}`}
      data-sgh-gradient={gradient}
      style={{
        ...backgroundStyle,
        ...(minHeight ? { minHeight } : {}),
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      {overlay && backgroundImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,56,40,0.12) 0%, rgba(0,52,37,0.28) 45%, rgba(0,45,34,0.72) 100%)',
          }}
        />
      )}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 text-[#007242] text-xs sm:text-sm font-semibold shadow-sm mb-4">
            {badge.icon}
            <span>{badge.text}</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl md:text-[40px] font-medium tracking-normal text-white drop-shadow-sm mb-4">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
