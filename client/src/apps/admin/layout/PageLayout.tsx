/**
 * PageLayout Component - تخطيط صفحة موحد
 *
 * A unified page layout component for all public pages
 * Includes SEO, Navbar, Footer, and common page elements
 */

import { ReactNode } from 'react';
import { APP_LOGO } from '@/const';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import InstallPWAButton from '@/components/InstallPWAButton';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  showInstallPWA?: boolean;
  showBackToTop?: boolean;
  className?: string;
  useContainer?: boolean; // محفوظ للتوافق مع الاستخدامات القديمة
  usePublicContentFrame?: boolean; // إطار الهوامش الموحد لصفحات الموقع العام
}

export default function PageLayout({
  children,
  title,
  description,
  keywords,
  image = APP_LOGO || '/tenant-assets/logo-color.png',
  showInstallPWA = true,
  showBackToTop: _showBackToTop = true,
  className = '',
  usePublicContentFrame = true,
}: PageLayoutProps) {
  return (
    <div
      className={`public-page-shell min-h-screen flex flex-col bg-white text-[#212529] relative overflow-hidden ${className}`}
      dir="rtl"
    >
      {/* SEO */}
      <SEO title={title} description={description} image={image} keywords={keywords} />

      {/* Skip Links */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
      >
        تخطى إلى المحتوى الرئيسي
      </a>

      {/* Navbar */}
      <Navbar />

      {/* Main Content: pages keep ownership of their internal containers. */}
      <main
        id="main-content"
        className={`flex-1 min-w-0 ${usePublicContentFrame ? 'w-full max-w-[1380px] mx-auto px-[15px]' : ''}`}
      >
        {children}
      </main>

      {/* Install PWA Button */}
      {showInstallPWA && <InstallPWAButton />}

      {/* Footer */}
      <Footer />
    </div>
  );
}
