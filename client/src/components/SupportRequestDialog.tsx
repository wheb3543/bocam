import { useState } from 'react';
import { CircleHelp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/api/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DialogTrigger,
} from '@/components/ui/dialog';

type Priority = 'low' | 'medium' | 'high' | 'critical';

const priorityLabels: Record<Priority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  critical: 'حرجة',
};

export function SupportRequestDialog() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const requestSupport = trpc.license.requestCentralSupportTicket.useMutation({
    onSuccess: (result) => {
      if (!result.success || !('ticketNumber' in result)) {
        toast.error(
          'error' in result ? result.error || 'تعذر إرسال طلب الدعم' : 'تعذر إرسال طلب الدعم'
        );
        return;
      }
      toast.success(`تم إرسال طلب الدعم بنجاح: ${result.ticketNumber}`);
      setSubject('');
      setContent('');
      setPriority('medium');
      setOpen(false);
    },
    onError: (error) => toast.error(error.message || 'تعذر الاتصال بنظام الدعم المركزي'),
  });

  const submit = () => {
    if (subject.trim().length < 4 || !content.trim()) {
      toast.error('اكتب عنواناً واضحاً ووصفاً للمشكلة قبل الإرسال.');
      return;
    }
    requestSupport.mutate({ subject, content, priority });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden gap-2 sm:inline-flex">
          <CircleHelp className="h-4 w-4" />
          طلب دعم فني
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>طلب دعم فني</DialogTitle>
          <DialogDescription>
            سيُرسل البلاغ إلى Idea Hub ويرتبط تلقائياً بالترخيص والنسخة الحالية.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-subject">عنوان المشكلة</Label>
            <Input
              id="support-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="مثال: تعذر فتح شاشة التقارير"
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-priority">الأولوية</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
              <SelectTrigger id="support-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-content">وصف المشكلة</Label>
            <Textarea
              id="support-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="اشرح ما حدث والخطوات التي سبقت المشكلة وأي رسالة خطأ ظهرت."
              className="min-h-32"
              maxLength={5000}
            />
          </div>
          <Button className="w-full" onClick={submit} disabled={requestSupport.isPending}>
            {requestSupport.isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جارٍ الإرسال...
              </>
            ) : (
              'إرسال طلب الدعم'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
