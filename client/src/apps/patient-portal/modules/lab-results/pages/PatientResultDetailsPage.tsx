import { useRoute } from 'wouter';
import { trpc } from '@/lib/api/trpc';
import type { PatientResult } from '@shared/types';

import { useFormatDate } from '@/hooks/export/useFormatDate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, FlaskConical, ScanLine, ClipboardList } from 'lucide-react';

export default function PatientResultDetailsPage() {
  const { formatDate } = useFormatDate();
  const [, params] = useRoute('/patient-portal/results/:id');
  const resultId = Number(params?.id);
  const { data: results, isLoading } = trpc.patientPortal.myResults.useQuery();
  const result = results?.find((item: PatientResult) => item.id === resultId);

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>النتيجة غير موجودة أو لا تملك صلاحية عرضها.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <Card className="overflow-hidden rounded-[30px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 shadow-[0_18px_40px_rgba(16,185,129,0.10)] dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20">
                {result.resultType === 'lab' && <FlaskConical className="h-6 w-6" />}
                {result.resultType === 'radiology' && <ScanLine className="h-6 w-6" />}
                {result.resultType === 'report' && <ClipboardList className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                  تفاصيل النتيجة
                </p>
                <CardTitle className="mt-1 text-xl font-black text-foreground">
                  {result.title}
                </CardTitle>
              </div>
            </div>
            <Badge className="rounded-full border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              {result.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-[24px] border border-amber-100 bg-white/80 p-3 shadow-sm dark:border-amber-900/30 dark:bg-background/50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
              ملخص النتيجة
            </p>
            <p className="mt-1 text-base font-bold text-foreground">
              {result.resultType === 'lab' && 'تحليل مختبري'}
              {result.resultType === 'radiology' && 'فحص أشعة'}
              {result.resultType === 'report' && 'تقرير طبي'}
              {' · '}
              {formatDate(result.resultDate || result.createdAt)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40">
              <p className="text-xs text-muted-foreground">تاريخ النتيجة</p>
              <p className="mt-2 text-sm font-bold text-foreground">
                {formatDate(result.resultDate || result.createdAt)}
              </p>
            </div>
            {result.doctorName && (
              <div className="rounded-[22px] border border-border/80 bg-white/80 p-3.5 shadow-sm dark:bg-background/40">
                <p className="text-xs text-muted-foreground">الطبيب</p>
                <p className="mt-2 text-sm font-bold text-foreground">د. {result.doctorName}</p>
              </div>
            )}
          </div>

          {result.description && (
            <div className="rounded-[24px] border border-border/80 bg-white/80 p-4 shadow-sm dark:bg-background/40">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                <FileText className="h-4 w-4 text-emerald-600" />
                الوصف
              </p>
              <p className="text-sm leading-7 text-muted-foreground">{result.description}</p>
            </div>
          )}

          {result.fileUrl && (
            <a
              href={result.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-green-700"
            >
              <FileText className="ml-2 h-4 w-4" />
              فتح الملف المرفق
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
