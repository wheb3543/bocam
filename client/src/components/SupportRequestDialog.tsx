import { useState } from 'react';
import { CircleHelp, Loader2, TicketCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
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
type Attachment = {
  fileName: string;
  mimeType: 'image/png' | 'image/jpeg' | 'application/pdf' | 'text/plain';
  dataBase64: string;
};

const priorityLabels: Record<Priority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  critical: 'حرجة',
};
const allowedAttachmentTypes = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'text/plain',
] as const;
const maxAttachmentBytes = 512 * 1024;

export function SupportRequestDialog() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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
      setAttachments([]);
      setOpen(false);
    },
    onError: (error) => toast.error(error.message || 'تعذر الاتصال بنظام الدعم المركزي'),
  });

  const submit = () => {
    if (subject.trim().length < 4 || !content.trim()) {
      toast.error('اكتب عنواناً واضحاً ووصفاً للمشكلة قبل الإرسال.');
      return;
    }
    requestSupport.mutate({ subject, content, priority, attachments });
  };

  // eslint-disable-next-line no-undef
  const addAttachments = async (files: FileList | null) => {
    if (!files) {
      return;
    }
    const selected = Array.from(files);
    if (attachments.length + selected.length > 3) {
      toast.error('يمكن إرفاق ثلاثة ملفات كحد أقصى.');
      return;
    }
    const invalid = selected.find(
      (file) =>
        !allowedAttachmentTypes.includes(file.type as (typeof allowedAttachmentTypes)[number]) ||
        file.size > maxAttachmentBytes
    );
    if (invalid) {
      toast.error('المرفقات المسموحة هي PNG وJPEG وPDF وTXT بحجم لا يتجاوز 512 كيلوبايت للملف.');
      return;
    }
    try {
      const encoded = await Promise.all(
        selected.map(
          (file) =>
            new Promise<Attachment>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  fileName: file.name,
                  mimeType: file.type as Attachment['mimeType'],
                  dataBase64: String(reader.result).split(',')[1] || '',
                });
              reader.onerror = () => reject(new Error('تعذر قراءة المرفق'));
              reader.readAsDataURL(file);
            })
        )
      );
      setAttachments((current) => [...current, ...encoded]);
    } catch {
      toast.error('تعذر قراءة أحد المرفقات.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CircleHelp className="h-4 w-4" />
          <span className="hidden sm:inline">طلب دعم فني</span>
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>طلب دعم فني</DialogTitle>
          <DialogDescription>
            سيُرسل البلاغ إلى Idea Hub ويرتبط تلقائياً بالترخيص والنسخة الحالية، مع لقطة تشخيص آمنة.
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
          <div className="space-y-2">
            <Label htmlFor="support-attachments">مرفقات اختيارية</Label>
            <Input
              id="support-attachments"
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.pdf,.txt,image/png,image/jpeg,application/pdf,text/plain"
              onChange={(event) => {
                void addAttachments(event.target.files);
                event.currentTarget.value = '';
              }}
            />
            <p className="text-xs text-muted-foreground">
              PNG أو JPEG أو PDF أو TXT، حتى 3 ملفات وبحد أقصى 512 كيلوبايت للملف.
            </p>
            {attachments.length > 0 && (
              <div className="space-y-1 rounded-md border bg-muted/30 p-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={`${attachment.fileName}-${index}`}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate">{attachment.fileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter((_, currentIndex) => currentIndex !== index)
                        )
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
          <Button
            type="button"
            variant="ghost"
            className="w-full gap-2"
            onClick={() => {
              setOpen(false);
              setLocation('/admin/support');
            }}
          >
            <TicketCheck className="h-4 w-4" />
            متابعة التذاكر السابقة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
