import { useEffect } from 'react';
import TopNavbar from './TopNavbar';
import AdminPageHeader from './AdminPageHeader';

export default function DashboardLayout({
  children,
  pageTitle,
  pageDescription,
  pageHeader = 'standard',
}: {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  /**
   * الرأس القياسي هو الخيار الافتراضي لصفحات الإدارة. تستخدم الصفحات ذات
   * سياق تشغيلي مخصص هذا الخيار لإبقاء رأسها الوظيفي دون تكرار بصري.
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
          showPageTitle={pageHeader === 'none'}
        />
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-x-hidden" role="main">
        {pageHeader === 'standard' && pageTitle && (
          <div className="container px-3 pt-4 sm:px-4 sm:pt-6 md:px-6" dir="rtl">
            <AdminPageHeader title={pageTitle} description={pageDescription} eyebrow="إدارة SGH" />
          </div>
        )}
        {children}
      </main>
    </>
  );
}
