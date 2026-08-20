/**
 * Navbar Component - شريط التنقل العلوي
 *
 * Unified navigation bar for all public pages with mobile hamburger menu
 * Enhanced responsive design for all screen sizes
 */
import { useState, useEffect, useRef } from 'react';
import { Phone, Menu, X, ChevronLeft } from 'lucide-react';
import { APP_TITLE, COMPANY_PHONE, COMPANY_ARABIC_NAME, getCompanySlogan } from '@/const';
import { Link } from 'wouter';
import InstallPWAButton from '@/components/InstallPWAButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Navbar() {
  const location = window.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: 'الرئيسية', path: '/' },
    { label: 'الأطباء', path: '/doctors' },
    { label: 'الأطباء الزائرين', path: '/visiting-doctors' },
    { label: 'العروض', path: '/offers' },
    { label: 'المخيمات الطبية', path: '/camps' },
  ];

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Skip Navigation Links */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-medium"
      >
        تخطي إلى المحتوى الرئيسي
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-64 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-medium"
      >
        تخطي إلى التنقل
      </a>

      <header
        className="sticky top-0 z-50 border-b border-border/70 bg-white/95 shadow-sm backdrop-blur dark:bg-gray-900/95"
        id="navigation"
      >
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between py-2.5 sm:py-3 md:py-4">
            {/* Mobile: Hamburger Button */}
            <button
              className="md:hidden flex min-h-11 min-w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="القائمة"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>

            {/* Logo and Title */}
            <Link href="/">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                <img src="/icon-72x72.png" alt={APP_TITLE} className="h-8 w-auto" />
                <div className="hidden xs:block sm:block">
                  <p className="text-xs sm:text-sm md:text-lg font-bold text-green-900 dark:text-green-400 leading-tight line-clamp-1">
                    {APP_TITLE}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    {getCompanySlogan()}
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`text-sm font-medium transition-colors hover:text-green-600 dark:hover:text-green-400 cursor-pointer whitespace-nowrap ${
                      location === item.path
                        ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 pb-1'
                        : 'text-foreground dark:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Contact & Patient Portal Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Patient Portal Button - Desktop only */}
              <Link
                href="/patient-portal/login"
                aria-label="تسجيل الدخول إلى بوابة المريض والملفات الطبية"
              >
                <span className="hidden md:flex items-center gap-1.5 border border-green-600 text-green-700 dark:text-green-400 dark:border-green-500 px-3 lg:px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap">
                  بوابة المريض
                </span>
              </Link>
              {/* PWA Install Button - Public App */}
              <InstallPWAButton appType="public" variant="compact" />

              {/* Contact Button */}
              <a
                href={`tel:${COMPANY_PHONE}`}
                className="flex min-h-11 items-center gap-1 rounded-lg bg-green-600 px-3 text-xs text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 sm:gap-1.5 sm:text-sm md:gap-2 md:px-4 md:text-base"
                aria-label={`اتصال مباشر بخدمة العملاء والمواعيد على الرقم ${COMPANY_PHONE}`}
              >
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-semibold">{COMPANY_PHONE}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
      )}

      {/* Mobile Slide Menu */}
      <div
        ref={menuRef}
        className={`md:hidden fixed top-0 right-0 z-[70] h-full w-[75vw] max-w-[300px] bg-white dark:bg-card dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border dark:border-gray-700">
          <div className="flex items-center gap-2">
            <img src="/icon-72x72.png" alt={APP_TITLE} className="h-8 w-auto" />
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-green-900 dark:text-green-400 leading-tight">
                {COMPANY_ARABIC_NAME}
              </h2>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground dark:text-muted-foreground">
                نرعاكم كأهالينا
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-muted-foreground dark:hover:bg-gray-800"
            aria-label="إغلاق القائمة"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-2 sm:p-3">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl mb-0.5 sm:mb-1 transition-colors cursor-pointer ${
                  location === item.path
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold'
                    : 'text-foreground dark:text-gray-300 hover:bg-muted/50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-sm sm:text-base">{item.label}</span>
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-40" />
              </div>
            </Link>
          ))}
        </nav>

        {/* Menu Footer - Contact */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-border dark:border-gray-700">
          <a
            href={`tel:${COMPANY_PHONE}`}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 sm:rounded-xl sm:py-3 sm:text-base"
          >
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>اتصل بنا: {COMPANY_PHONE}</span>
          </a>
          <Link href="/patient-portal/login">
            <div className="mt-2 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-green-600 py-2.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20 sm:rounded-xl sm:py-3 sm:text-sm">
              بوابة المريض
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
