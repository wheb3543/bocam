import DashboardLayout from '@/components/layout/DashboardLayout';
import { ApprovalQueuePanel } from '../content/components/dialogs/ApprovalQueueDialog';
import { ClipboardCheck } from 'lucide-react';

/** صفحة مستقلة لمراجعة واعتماد تغييرات المحتوى، بدلاً من إعادة استخدام طلبات الوصول العامة. */
export default function ReviewApprovalPage() {
  return (
    <DashboardLayout
      pageTitle="المراجعة والاعتماد"
      pageDescription="مراجعة تغييرات المحتوى المعلقة واتخاذ قرار الاعتماد أو الرفض"
    >
      <section className="mx-auto w-full max-w-5xl space-y-4" dir="rtl">
        <header className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-lg font-semibold">طابور موافقات المحتوى</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                عيّن المراجعين ثم اعتمد التغييرات أو ارفضها مع توثيق سبب القرار.
              </p>
            </div>
          </div>
        </header>
        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <ApprovalQueuePanel />
        </div>
      </section>
    </DashboardLayout>
  );
}
