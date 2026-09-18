import { AlertTriangle, BadgeCheck, CircleAlert, ShieldCheck } from 'lucide-react';
import { trpc } from '@/lib/api/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentQualityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentQualityDialog({ open, onOpenChange }: ContentQualityDialogProps) {
  const reportQuery = trpc.content.quality.getReport.useQuery(undefined, { enabled: open });
  const report = reportQuery.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> فحص جودة المحتوى
          </DialogTitle>
          <DialogDescription>
            يفحص النظام المحتوى المنشور حالياً دون تعديل أي بيانات.
          </DialogDescription>
        </DialogHeader>
        {reportQuery.isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">جاري فحص المحتوى…</p>
        ) : report ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg border p-3">
                <strong>{report.summary.checkedPages}</strong>
                <br />
                صفحات مفحوصة
              </div>
              <div className="rounded-lg border p-3">
                <strong>{report.summary.checkedImages}</strong>
                <br />
                صور مفحوصة
              </div>
              <div className="rounded-lg border p-3">
                <strong>{report.summary.checkedSEO}</strong>
                <br />
                إعدادات SEO
              </div>
            </div>
            <ScrollArea className="max-h-[44dvh] pe-3">
              {report.issues.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                  <BadgeCheck className="h-9 w-9 text-emerald-600" />
                  لا توجد ملاحظات جودة ضمن الفحوص المتاحة.
                </div>
              ) : (
                <div className="space-y-2">
                  {report.issues.map((issue) => (
                    <div key={`${issue.code}-${issue.entityId}`} className="rounded-lg border p-3">
                      <div className="flex items-start gap-2">
                        <CircleAlert
                          className={
                            issue.severity === 'error'
                              ? 'mt-0.5 h-4 w-4 text-destructive'
                              : 'mt-0.5 h-4 w-4 text-amber-600'
                          }
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-sm">{issue.title}</strong>
                            <Badge
                              variant={issue.severity === 'error' ? 'destructive' : 'secondary'}
                            >
                              {issue.severity === 'error' ? 'يتطلب معالجة' : 'مراجعة'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Button variant="outline" onClick={() => reportQuery.refetch()}>
              <AlertTriangle className="ms-2 h-4 w-4" />
              إعادة الفحص
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
