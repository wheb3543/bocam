import { useEffect } from 'react';
import TopNavbar from './TopNavbar';

export default function DashboardLayout({
  children,
  pageTitle,
  pageDescription,
  pageHeader: _pageHeader = 'standard',
}: {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  /**
   * يحتفظ الخيار بتوافق الصفحات ذات المساحات الوظيفية الخاصة، ويحدد فقط
   * ظهور العنوان داخل الشريط العلوي دون رسم بطاقة عنوان إضافية في المحتوى.
   */
  pageHeader?: 'standard' | 'none';
}) {
  // Update document title dynamically based on pageTitle prop
  useEffect(() => {
    const baseTitle = 'لوحة تحكم SGH';
    if (pageTitle) {
      document.title = `${pageTitle} | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
    // Restore on unmount
    return () => {
      document.title = baseTitle;
    };
  }, [pageTitle]);

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-medium"
      >
        تخطى إلى المحتوى الرئيسي
      </a>

      {/* Header with Top Navbar */}
      <header>
        <TopNavbar
          pageTitle={pageTitle}
          pageDescription={pageDescription}
          showPageTitle={Boolean(pageTitle)}
        />
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-x-hidden" role="main">
        {children}
      </main>
    </>
  );
}
