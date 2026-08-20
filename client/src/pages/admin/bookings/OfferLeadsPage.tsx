import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OfferLeadsManagement from '@/components/offer/OfferLeadsManagement';
import { DateRangePicker } from '@/components/form/DateRangePicker';

export default function OfferLeadsPage() {
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { from, to };
  });

  return (
    <DashboardLayout
      pageTitle="عروض العملاء"
      pageDescription="إدارة ومتابعة عروض العملاء المحتملين"
    >
      <div
        className="flex h-[calc(100dvh-4.25rem)] min-h-0 flex-col gap-3 overflow-hidden"
        dir="rtl"
      >
        <div className="shrink-0">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
        <div className="min-h-0 flex-1">
          {/* eslint-disable-next-line @typescript-eslint/no-empty-function -- Intentional no-op */}
          <OfferLeadsManagement onPendingCountChange={() => {}} dateRange={dateRange} />
        </div>
      </div>
    </DashboardLayout>
  );
}
