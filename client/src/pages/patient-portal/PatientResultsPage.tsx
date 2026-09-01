import { useLocation } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import type { PatientResult } from '@shared/types';

import { useFormatDate } from '@/hooks/export/useFormatDate';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, ClipboardCheck } from 'lucide-react';
import ResultCard from '@/components/patient/ResultCard';

export default function PatientResultsPage() {
  const [, navigate] = useLocation();
  const { formatDate } = useFormatDate();
  const { data: results, isLoading } = trpc.patientPortal.myResults.useQuery();

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      pending: { label: 'قيد الانتظار', variant: 'outline' },
      ready: { label: 'جاهز', variant: 'default' },
      delivered: { label: 'تم التسليم', variant: 'secondary' },
    };
    const info = map[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const totalCount = results?.length ?? 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                نتائجك
              </p>
              <h2 className="mt-1 text-xl font-black text-foreground">تقاريرك الطبية</h2>
            </div>
          </div>
          <div className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-amber-700 shadow-sm dark:bg-background/50 dark:text-amber-300">
            {totalCount} ملف
          </div>
        </div>
      </div>

      {!results?.length ? (
        <div className="rounded-[28px] border border-dashed border-amber-200 bg-gradient-to-br from-amber-50/30 to-white py-12 text-center text-muted-foreground shadow-sm dark:border-amber-900/40 dark:from-amber-950/10 dark:to-background">
          <FileText className="mx-auto mb-3 h-10 w-10 text-amber-400 opacity-80" />
          <p className="text-base font-bold text-foreground">لا توجد نتائج أو تقارير حالياً</p>
          <p className="mt-1 text-sm">ستظهر لك النتائج الجديدة تلقائيًا عند توفرها.</p>
        </div>
      ) : (
        results.map((result: PatientResult) => (
          <ResultCard
            key={result.id}
            result={result}
            statusBadge={statusBadge}
            formatDate={formatDate}
            onOpenDetails={() => navigate(`/patient-portal/results/${result.id}`)}
          />
        ))
      )}
    </div>
  );
}
