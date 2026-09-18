import React from 'react';
import { Stethoscope } from 'lucide-react';
import { APP_TITLE } from '@/const';

interface DoctorPortalLayoutProps {
  children: React.ReactNode;
}

/**
 * DoctorPortalLayout - الهيكل البصري الأولي لبوابة الطبيب
 */
export default function DoctorPortalLayout({ children }: DoctorPortalLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-foreground"
      dir="rtl"
    >
      <header className="border-b bg-white dark:bg-slate-900 px-6 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">
            عيادة الطبيب | {APP_TITLE}
          </span>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
