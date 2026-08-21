import { useState } from 'react';
import { Check, ClipboardCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/api/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ApprovalQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const entityLabels: Record<string, string> = {
  textContent: 'محتوى نصي',
  image: 'صورة',
  media: 'وسيط',
  page: 'صفحة',
  section: 'قسم',
};

export function ApprovalQueueDialog({ open, onOpenChange }: ApprovalQueueDialogProps) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const pendingQuery = trpc.content.approvals.getPending.useQuery(
    { limit: 50, offset: 0 },
    { enabled: open }
  );
  const approveMutation = trpc.content.approvals.approve.useMutation();
  const rejectMutation = trpc.content.approvals.reject.useMutation();
  const assignReviewerMutation = trpc.content.approvals.assignReviewer.useMutation();
  const reviewersQuery = trpc.content.approvals.getEligibleReviewers.useQuery(undefined, {
    enabled: open,
  });

  const refresh = () => pendingQuery.refetch();

  const approve = async (id: number) => {
    if (!confirm('هل تريد اعتماد هذا الطلب؟')) {
      return;
    }
    setBusyId(id);
    try {
      await approveMutation.mutateAsync({ id });
      toast.success('تم اعتماد طلب المحتوى');
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر اعتماد الطلب');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: number) => {
    const rejectionReason = window.prompt('أدخل سبب الرفض ليصل إلى صاحب الطلب:');
    if (rejectionReason === null) {
      return;
    }
    setBusyId(id);
    try {
      await rejectMutation.mutateAsync({ id, rejectionReason: rejectionReason || undefined });
      toast.success('تم رفض طلب المحتوى وإبلاغ صاحبه');
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر رفض الطلب');
    } finally {
      setBusyId(null);
    }
  };

  const assignReviewer = async (id: number, assignedReviewerId: string) => {
    setBusyId(id);
    try {
      await assignReviewerMutation.mutateAsync({
        id,
        assignedReviewerId: assignedReviewerId === 'unassigned' ? null : Number(assignedReviewerId),
      });
      toast.success(
        assignedReviewerId === 'unassigned' ? 'تمت إزالة تعيين المراجع' : 'تم تعيين المراجع للطلب'
      );
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر تعيين المراجع');
    } finally {
      setBusyId(null);
    }
  };

  const approvals = pendingQuery.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            طابور موافقات المحتوى
          </DialogTitle>
          <DialogDescription>
            راجع التغييرات المعلقة واعتمدها أو ارفضها مع توثيق السبب.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60dvh] pe-3">
          {pendingQuery.isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">جاري تحميل الطلبات…</p>
          ) : approvals.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              لا توجد طلبات موافقة معلقة.
            </p>
          ) : (
            <div className="space-y-3">
              {approvals.map((approval) => (
                <article key={approval.id} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {entityLabels[approval.entityType] ?? approval.entityType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">طلب #{approval.id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        طُلب في {new Date(approval.requestedAt).toLocaleString('ar-SA')}
                      </p>
                      <div className="pt-2">
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          المراجع المعيّن
                        </label>
                        <Select
                          value={approval.assignedReviewerId?.toString() ?? 'unassigned'}
                          onValueChange={(value) => assignReviewer(approval.id, value)}
                          disabled={busyId === approval.id || reviewersQuery.isLoading}
                        >
                          <SelectTrigger className="h-8 w-52 text-xs">
                            <SelectValue placeholder="اختر مراجعاً" />
                          </SelectTrigger>
                          <SelectContent dir="rtl">
                            <SelectItem value="unassigned">غير معيّن</SelectItem>
                            {(reviewersQuery.data ?? []).map((reviewer) => (
                              <SelectItem key={reviewer.id} value={reviewer.id.toString()}>
                                {reviewer.name || `مراجع #${reviewer.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approve(approval.id)}
                        disabled={busyId === approval.id}
                      >
                        <Check className="ms-1 h-4 w-4" /> اعتماد
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reject(approval.id)}
                        disabled={busyId === approval.id}
                      >
                        <X className="ms-1 h-4 w-4" /> رفض
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
