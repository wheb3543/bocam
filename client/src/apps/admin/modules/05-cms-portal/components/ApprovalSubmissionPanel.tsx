import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/api/trpc';
import { ClipboardCheck, RefreshCw, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { buildApprovalRequestInput, type ApprovalEntityType } from '../utils/approvalSubmission';

export type { ApprovalEntityType } from '../utils/approvalSubmission';

interface ApprovalSubmissionPanelProps {
  entityType: ApprovalEntityType;
  entityId?: number | null;
  changes: object;
  onSubmitted?: () => void;
}

const statusLabels = {
  pending: 'قيد المراجعة',
  approved: 'تم الاعتماد',
  rejected: 'مرفوض',
} as const;

const statusVariants = {
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
} as const;

/** يتيح للمحرر تعيين مراجع وتقديم أو إعادة تقديم آخر تغييرات محفوظة في النموذج. */
export function ApprovalSubmissionPanel({
  entityType,
  entityId,
  changes,
  onSubmitted,
}: ApprovalSubmissionPanelProps) {
  const [reviewerValue, setReviewerValue] = useState('unassigned');
  const reviewersQuery = trpc.content.approvals.getEligibleReviewers.useQuery();
  const latestQuery = trpc.content.approvals.getLatestForCurrentUser.useQuery(
    { entityType, entityId: entityId ?? 0 },
    { enabled: Boolean(entityId) }
  );
  const submitMutation = trpc.content.approvals.create.useMutation({
    onSuccess: () => {
      toast.success('تم إرسال التعديلات إلى طابور المراجعة.');
      latestQuery.refetch();
      onSubmitted?.();
    },
    onError: (error) => toast.error(error.message || 'تعذر إرسال طلب المراجعة.'),
  });

  if (!entityId) {
    return null;
  }

  const latest = latestQuery.data;
  const isPending = latest?.status === 'pending';
  const actionLabel = latest?.status === 'rejected' ? 'إعادة الإرسال للمراجعة' : 'إرسال للمراجعة';
  const assignedReviewer = (reviewersQuery.data ?? []).find(
    (reviewer) => reviewer.id === latest?.assignedReviewerId
  );

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">مراجعة واعتماد التعديلات</p>
        </div>
        {latest && (
          <Badge variant={statusVariants[latest.status]}>{statusLabels[latest.status]}</Badge>
        )}
      </div>

      {latest?.status === 'rejected' && latest.rejectionReason && (
        <Alert variant="destructive">
          <AlertTitle>سبب الرفض السابق</AlertTitle>
          <AlertDescription>{latest.rejectionReason}</AlertDescription>
        </Alert>
      )}
      {isPending && (
        <p className="text-xs text-muted-foreground">
          يوجد طلب معلق لهذه المادة. لا يمكن إنشاء طلب آخر قبل حسمه.
        </p>
      )}
      {latest?.assignedReviewerId && (
        <p className="text-xs text-muted-foreground">
          المراجع المعيّن: {assignedReviewer?.name ?? `المستخدم #${latest.assignedReviewerId}`}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor={`reviewer-${entityType}-${entityId}`}>تعيين مراجع (اختياري)</Label>
          <Select value={reviewerValue} onValueChange={setReviewerValue} disabled={isPending}>
            <SelectTrigger id={`reviewer-${entityType}-${entityId}`}>
              <SelectValue placeholder="جميع المراجعين المؤهلين" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">بدون تعيين محدد</SelectItem>
              {(reviewersQuery.data ?? []).map((reviewer) => (
                <SelectItem key={reviewer.id} value={String(reviewer.id)}>
                  {reviewer.name} — {reviewer.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => latestQuery.refetch()}
            disabled={latestQuery.isFetching}
            aria-label="تحديث حالة المراجعة"
          >
            <RefreshCw className={`h-4 w-4 ${latestQuery.isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              submitMutation.mutate(
                buildApprovalRequestInput(entityType, entityId, changes, reviewerValue)
              )
            }
            disabled={isPending || submitMutation.isPending || reviewersQuery.isLoading}
          >
            <Send className="ml-1 h-4 w-4" />
            {submitMutation.isPending ? 'جارٍ الإرسال...' : actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
