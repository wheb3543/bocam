import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

type PublicationQualityFeedbackProps = {
  status: 'draft' | 'published' | 'archived';
  issues: string[];
  isAdmin: boolean;
  overrideReason: string;
  onOverrideReasonChange: (value: string) => void;
};

export function PublicationQualityFeedback({
  status,
  issues,
  isAdmin,
  overrideReason,
  onOverrideReasonChange,
}: PublicationQualityFeedbackProps) {
  if (status !== 'published' || issues.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="items-start">
      <AlertTriangle className="mt-0.5 h-4 w-4" />
      <div className="grid w-full gap-3">
        <div>
          <AlertTitle>تعذر النشر بسبب فحص الجودة</AlertTitle>
          <AlertDescription className="mt-2">
            <ul className="list-disc space-y-1 pe-5 text-sm">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </div>
        {isAdmin ? (
          <div className="grid gap-2">
            <Label htmlFor="qualityOverrideReason">سبب التجاوز الإداري</Label>
            <Textarea
              id="qualityOverrideReason"
              value={overrideReason}
              onChange={(event) => onOverrideReasonChange(event.target.value)}
              minLength={5}
              rows={3}
              placeholder="اكتب سبباً موثقاً لا يقل عن خمسة أحرف قبل إعادة محاولة النشر."
            />
            <p className="text-xs text-muted-foreground">
              سيُسجل سبب التجاوز وبيانات المستخدم في سجل تدقيق المحتوى.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            صحح هذه المشكلات قبل إعادة النشر. تجاوز الفحص متاح للمدير فقط.
          </p>
        )}
      </div>
    </Alert>
  );
}
