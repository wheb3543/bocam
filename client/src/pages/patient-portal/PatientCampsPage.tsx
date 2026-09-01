import { trpc } from '@/lib/api/trpc';

interface CampRegistration {
  id?: number;
  [key: string]: unknown;
}

import { useFormatDate } from '@/hooks/export/useFormatDate';
import { Loader2, Tent } from 'lucide-react';
import CampCard from '@/components/patient/CampCard';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function PatientCampsPage() {
  const { formatDate } = useFormatDate();
  const { data: camps, isLoading } = trpc.patientPortal.myCampRegistrations.useQuery();

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Tent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                المخيمات
              </p>
              <h2 className="mt-1 text-xl font-black text-foreground">تسجيلات المخيمات</h2>
            </div>
          </div>
          <Link href="/patient-portal/offers">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-background dark:text-emerald-300"
            >
              العروض
            </Button>
          </Link>
        </div>
      </div>

      {!camps?.length ? (
        <div className="rounded-[28px] border border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white py-12 text-center text-muted-foreground shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/10 dark:to-background">
          <Tent className="mx-auto mb-3 h-10 w-10 text-emerald-400 opacity-80" />
          <p className="text-base font-bold text-foreground">لا توجد تسجيلات مخيمات حالياً</p>
          <p className="mt-1 text-sm">سنظهر لك المخيمات الجديدة فور توفرها.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {camps.map((item: CampRegistration) => (
            <CampCard key={item.id} item={item} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}
