import { trpc } from '@/lib/api/trpc';

interface OfferBooking {
  id?: number;
  [key: string]: unknown;
}

import { useFormatDate } from '@/hooks/export/useFormatDate';
import { Loader2, Gift } from 'lucide-react';
import OfferCard from '@/components/patient/OfferCard';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function PatientOffersPage() {
  const { formatDate } = useFormatDate();
  const { data: offers, isLoading } = trpc.patientPortal.myOfferBookings.useQuery();

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-[28px] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-4 shadow-sm dark:border-sky-900/40 dark:from-sky-950/20 dark:via-background dark:to-cyan-950/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-2.5 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">
                عروضك
              </p>
              <h2 className="mt-1 text-xl font-black text-foreground">حجوزات العروض</h2>
            </div>
          </div>
          <Link href="/patient-portal/camps">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-sky-200 bg-white text-sky-700 hover:bg-sky-50 dark:bg-background dark:text-sky-300"
            >
              المخيمات
            </Button>
          </Link>
        </div>
      </div>

      {!offers?.length ? (
        <div className="rounded-[28px] border border-dashed border-sky-200 bg-gradient-to-br from-sky-50/30 to-white py-12 text-center text-muted-foreground shadow-sm dark:border-sky-900/40 dark:from-sky-950/10 dark:to-background">
          <Gift className="mx-auto mb-3 h-10 w-10 text-sky-400 opacity-80" />
          <p className="text-base font-bold text-foreground">لا توجد عروض محجوزة حالياً</p>
          <p className="mt-1 text-sm">سنظهر لك العروض الجديدة فور توفرها.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((item: OfferBooking) => (
            <OfferCard key={item.id} item={item} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}
