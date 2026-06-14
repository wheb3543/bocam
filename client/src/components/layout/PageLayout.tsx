/**
 * PageLayout Component - تخطيط صفحة موحد
 * 
 * A unified page layout component for all public pages
 * Includes SEO, Navbar, Footer, and common page elements
 */

import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import InstallPWAButton from "@/components/InstallPWAButton";
import { APP_LOGO } from "@/const";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  showInstallPWA?: boolean;
  showBackToTop?: boolean;
  className?: string;
}

export default function PageLayout({
  children,
  title,
  description,
  keywords,
  image = "/sgh-logo-full.png",
  showInstallPWA = true,
  showBackToTop = true,
  className = "",
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden ${className}`} dir="rtl">
      {/* SEO */}
      <SEO 
        title={title}
        description={description}
        image={image}
        keywords={keywords}
      />

      {/* Skip Links */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
      >
        تخطى إلى المحتوى الرئيسي
      </a>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Install PWA Button */}
      {showInstallPWA && <InstallPWAButton />}

      {/* Footer */}
      <Footer />
    </div>
  );
}
