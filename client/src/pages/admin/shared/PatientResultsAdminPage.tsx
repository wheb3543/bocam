import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { trpc } from '@/lib/api/trpc';
import { processPhoneInput, validateYemeniPhone } from '@/hooks/form/usePhoneFormat';
import { useFormatDate } from '@/hooks/export/useFormatDate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Search,
  Plus,
  FileText,
  FlaskConical,
  ScanLine,
  ClipboardList,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

type ResultType = 'lab' | 'radiology' | 'report';
type ResultStatus = 'pending' | 'ready' | 'delivered';

const RESULT_TYPE_LABELS: Record<ResultType, string> = {
  lab: 'تحليل',
  radiology: 'أشعة',
  report: 'تقرير',
};

const STATUS_LABELS: Record<ResultStatus, string> = {
  pending: 'قيد الانتظار',
  ready: 'جاهز',
  delivered: 'تم التسليم',
};

export default function PatientResultsAdminPage() {
  const { formatDate } = useFormatDate();
  const utils = trpc.useUtils();
  const [phone, setPhone] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    resultType: 'lab' as ResultType,
    title: '',
    description: '',
    fileUrl: '',
    doctorName: '',
    resultDate: '',
    status: 'pending' as ResultStatus,
  });

  const { data, isLoading } = trpc.patientResults.listByPhone.useQuery(
    { phone: searchPhone },
    { enabled: searchPhone.length >= 9 }
  );

  const createMutation = trpc.patientResults.create.useMutation({
    onSuccess: async () => {
      toast.success('تمت إضافة النتيجة بنجاح');
      setShowForm(false);
      setForm({
        resultType: 'lab',
        title: '',
        description: '',
        fileUrl: '',
        doctorName: '',
        resultDate: '',
        status: 'pending',
      });
      await utils.patientResults.listByPhone.invalidate({ phone: searchPhone });
    },
    onError: (err) => toast.error(err.message || 'تعذر إضافة النتيجة'),
  });

  const updateStatusMutation = trpc.patientResults.updateStatus.useMutation({
    onSuccess: async () => {
      toast.success('تم تحديث الحالة');
      await utils.patientResults.listByPhone.invalidate({ phone: searchPhone });
    },
    onError: (err) => toast.error(err.message || 'تعذر تحديث الحالة'),
  });

  const handleSearch = () => {
    const validation = validateYemeniPhone(phone);
    if (!validation.valid) {
      toast.error(validation.message || 'رقم الهاتف غير صحيح');
      return;
    }
    setSearchPhone(phone);
  };

  const handleCreate = () => {
    if (!searchPhone) {
      toast.error('ابحث عن المريض أولاً');
      return;
    }
    if (!form.title.trim()) {
      toast.error('عنوان النتيجة مطلوب');
      return;
    }

    createMutation.mutate({
      phone: searchPhone,
      resultType: form.resultType,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      fileUrl: form.fileUrl.trim() || undefined,
      doctorName: form.doctorName.trim() || undefined,
      resultDate: form.resultDate ? new Date(form.resultDate) : undefined,
      status: form.status,
    });
  };

  const resultIcon = (type: ResultType) => {
    if (type === 'lab') return <FlaskConical className="h-4 w-4 text-blue-500" />;
    if (type === 'radiology') return <ScanLine className="h-4 w-4 text-purple-500" />;
    return <ClipboardList className="h-4 w-4 text-amber-500" />;
  };

  return (
    <DashboardLayout
      pageTitle="نتائج بوابة المريض"
      pageDescription="إدارة نتائج التحاليل والأشعة والتقارير للمرضى المسجلين في البوابة"
    >
      <div className="container mx-auto py-6 space-y-6" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" />
              البحث عن مريض
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="رقم هاتف المريض"
              value={phone}
              onChange={(e) => setPhone(processPhoneInput(e.target.value))}
              dir="ltr"
              className="sm:max-w-xs"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4 ml-1" />
              )}
              بحث
            </Button>
            {data?.patient && (
              <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
                <Plus className="h-4 w-4 ml-1" />
                إضافة نتيجة
              </Button>
            )}
          </CardContent>
        </Card>

        {data?.patient && (
          <Card className="border-green-100">
            <CardContent className="p-4 flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">الاسم</p>
                <p className="font-medium">{data.patient.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">الهاتف</p>
                <p className="font-medium" dir="ltr">
                  {data.patient.phone}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">عدد النتائج</p>
                <p className="font-medium">{data.results.length}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && data?.patient && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إضافة نتيجة جديدة</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>نوع النتيجة</Label>
                <Select
                  value={form.resultType}
                  onValueChange={(v) => setForm({ ...form, resultType: v as ResultType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab">تحليل</SelectItem>
                    <SelectItem value="radiology">أشعة</SelectItem>
                    <SelectItem value="report">تقرير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>الحالة</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as ResultStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="ready">جاهز</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>العنوان *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: تحليل CBC"
                />
              </div>
              <div className="space-y-1.5">
                <Label>اسم الطبيب</Label>
                <Input
                  value={form.doctorName}
                  onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>تاريخ النتيجة</Label>
                <Input
                  type="date"
                  value={form.resultDate}
                  onChange={(e) => setForm({ ...form, resultDate: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>رابط الملف (PDF)</Label>
                <Input
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>الوصف</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {searchPhone && !isLoading && !data?.patient && (
          <div className="text-center py-10 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>لا يوجد مريض مسجل بهذا الرقم في بوابة المريض</p>
          </div>
        )}

        {data?.results && data.results.length > 0 && (
          <div className="space-y-3">
            {data.results.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {resultIcon(result.resultType as ResultType)}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {RESULT_TYPE_LABELS[result.resultType as ResultType]} ·{' '}
                          {formatDate(result.resultDate || result.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {STATUS_LABELS[result.status as ResultStatus] || result.status}
                    </Badge>
                  </div>

                  {result.description && (
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={result.status}
                      onValueChange={(v) =>
                        updateStatusMutation.mutate({
                          resultId: result.id,
                          status: v as ResultStatus,
                        })
                      }
                    >
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="ready">جاهز</SelectItem>
                        <SelectItem value="delivered">تم التسليم</SelectItem>
                      </SelectContent>
                    </Select>
                    {result.fileUrl && (
                      <a
                        href={result.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        فتح الملف
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data?.patient && data.results.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>لا توجد نتائج لهذا المريض بعد</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
