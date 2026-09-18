import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * PublicLayout - الهيكل البصري الموحد لصفحات الموقع العام
 * يجمع شريط التنقل العلوي والمحتوى الرئيسي وتذييل الصفحة
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
